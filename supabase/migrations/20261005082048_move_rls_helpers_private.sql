create schema if not exists private;

alter function public.get_current_organisation_id() set schema private;
alter function public.get_current_role() set schema private;
alter function public.is_internal_user() set schema private;
alter function public.is_admin_or_supervisor() set schema private;

create or replace function private.get_current_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from public.profiles where id = auth.uid() and active = true
$$;

create or replace function private.get_current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true
$$;

create or replace function private.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.get_current_role() in ('OWNER','ADMIN','SUPERVISOR','TECHNICIAN'), false)
$$;

create or replace function private.is_admin_or_supervisor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(private.get_current_role() in ('OWNER','ADMIN','SUPERVISOR'), false)
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.get_current_organisation_id() to anon, authenticated;
grant execute on function private.get_current_role() to anon, authenticated;
grant execute on function private.is_internal_user() to anon, authenticated;
grant execute on function private.is_admin_or_supervisor() to anon, authenticated;

create or replace function public.create_maintenance_job(
  p_maintenance_plan_id uuid,
  p_client_id uuid,
  p_site_id uuid,
  p_building_id uuid,
  p_scheduled_date date,
  p_assigned_technician_id uuid default null,
  p_notes text default null
)
returns public.maintenance_jobs
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_job public.maintenance_jobs;
  v_org uuid := private.get_current_organisation_id();
  v_prefix text;
begin
  if v_org is null then raise exception 'Not authenticated'; end if;
  select report_prefix into v_prefix from public.organisations where id=v_org;
  insert into public.maintenance_jobs(
    organisation_id,maintenance_plan_id,client_id,site_id,building_id,
    job_number,scheduled_date,assigned_technician_id,notes
  )
  values (
    v_org,p_maintenance_plan_id,p_client_id,p_site_id,p_building_id,
    coalesce(v_prefix,'FM') || '-JOB-' || to_char(p_scheduled_date,'YYYYMMDD') || '-' ||
    upper(substr(encode(extensions.gen_random_bytes(4),'hex'),1,6)),
    p_scheduled_date,p_assigned_technician_id,p_notes
  )
  returning * into v_job;
  return v_job;
end $$;

create or replace function public.start_maintenance_job(p_job_id uuid)
returns public.maintenance_jobs
language plpgsql
security invoker
set search_path = public
as $$
declare v_job public.maintenance_jobs;
begin
  update public.maintenance_jobs
  set status='IN_PROGRESS', started_at=coalesce(started_at,now())
  where id=p_job_id and organisation_id=private.get_current_organisation_id()
    and (private.get_current_role() <> 'TECHNICIAN' or assigned_technician_id=auth.uid())
    and status='SCHEDULED'
  returning * into v_job;
  if v_job.id is null then raise exception 'Job not found or cannot be started'; end if;
  return v_job;
end $$;

create or replace function public.submit_inspection(p_inspection_id uuid)
returns public.inspections
language plpgsql
security invoker
set search_path = public
as $$
declare v public.inspections;
begin
  update public.inspections
  set status='COMPLETED', completed_at=coalesce(completed_at,now())
  where id=p_inspection_id and organisation_id=private.get_current_organisation_id()
    and status in ('IN_PROGRESS','NOT_STARTED')
  returning * into v;
  if v.id is null then raise exception 'Inspection not found or already locked'; end if;
  update public.inspections set status='LOCKED', locked_at=now() where id=v.id;
  select * into v from public.inspections where id=v.id;
  return v;
end $$;

create or replace function public.submit_job(p_job_id uuid)
returns public.maintenance_jobs
language plpgsql
security invoker
set search_path = public
as $$
declare v public.maintenance_jobs;
begin
  update public.maintenance_jobs
  set status='SUBMITTED', submitted_at=now()
  where id=p_job_id and organisation_id=private.get_current_organisation_id()
    and status='IN_PROGRESS'
    and (private.get_current_role() <> 'TECHNICIAN' or assigned_technician_id=auth.uid())
  returning * into v;
  if v.id is null then raise exception 'Job not found or cannot be submitted'; end if;
  return v;
end $$;

create or replace function public.generate_report_number()
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_prefix text;
  v_seq bigint;
  v_lock_key bigint;
begin
  select report_prefix into v_prefix from public.organisations where id=private.get_current_organisation_id();

  v_lock_key := ('x' || substr(md5(private.get_current_organisation_id()::text), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(max((regexp_match(report_number, '([0-9]+)$'))[1]::bigint),0)+1
    into v_seq
  from public.reports
  where organisation_id=private.get_current_organisation_id();
  return coalesce(v_prefix,'FM') || '-' || to_char(current_date,'YYYY') || '-' || lpad(v_seq::text,6,'0');
end $$;

create or replace function public.issue_report(p_report_id uuid)
returns public.reports
language plpgsql
security invoker
set search_path = public
as $$
declare v public.reports;
begin
  if not private.is_admin_or_supervisor() then raise exception 'Only supervisor/admin can issue reports'; end if;
  update public.reports
  set status='ISSUED', issued_at=now(), issued_by=auth.uid()
  where id=p_report_id and organisation_id=private.get_current_organisation_id()
    and status in ('GENERATED','REVIEWED')
  returning * into v;
  if v.id is null then raise exception 'Report not found or cannot be issued'; end if;
  return v;
end $$;

create or replace function public.create_next_maintenance_job(p_plan_id uuid, p_current_date date default current_date)
returns public.maintenance_jobs
language plpgsql
security invoker
set search_path = public
as $$
declare
  p public.maintenance_plans;
  d date;
begin
  select * into p from public.maintenance_plans
  where id=p_plan_id and organisation_id=private.get_current_organisation_id() and active=true;
  if p.id is null then raise exception 'Maintenance plan not found'; end if;

  d := case p.frequency
    when 'MONTHLY' then p_current_date + interval '1 month'
    when 'QUARTERLY' then p_current_date + interval '3 months'
    when 'HALF_YEARLY' then p_current_date + interval '6 months'
    when 'YEARLY' then p_current_date + interval '1 year'
    when 'CUSTOM' then p_current_date + make_interval(days=>p.interval_days)
  end;
  return public.create_maintenance_job(p.id,p.client_id,p.site_id,null,d,null,null);
end $$;
