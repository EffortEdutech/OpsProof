create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'organisations','profiles','clients','client_contacts','sites','buildings','systems',
    'equipment_types','equipment','maintenance_plans','maintenance_jobs','job_equipment',
    'inspection_templates','inspections','inspection_results','findings','reports','notifications'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', 'trg_'||t||'_updated_at', t);
    execute format('create trigger %I before update on public.%I for each row execute function public.touch_updated_at()', 'trg_'||t||'_updated_at', t);
  end loop;
end $$;

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
  v_org uuid := public.get_current_organisation_id();
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
    upper(substr(encode(gen_random_bytes(4),'hex'),1,6)),
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
  where id=p_job_id and organisation_id=public.get_current_organisation_id()
    and (public.get_current_role() <> 'TECHNICIAN' or assigned_technician_id=auth.uid())
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
  where id=p_inspection_id and organisation_id=public.get_current_organisation_id()
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
  where id=p_job_id and organisation_id=public.get_current_organisation_id()
    and status='IN_PROGRESS'
    and (public.get_current_role() <> 'TECHNICIAN' or assigned_technician_id=auth.uid())
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
  select report_prefix into v_prefix from public.organisations where id=public.get_current_organisation_id();

  v_lock_key := ('x' || substr(md5(public.get_current_organisation_id()::text), 1, 16))::bit(64)::bigint;
  perform pg_advisory_xact_lock(v_lock_key);

  select coalesce(max((regexp_match(report_number, '([0-9]+)$'))[1]::bigint),0)+1
    into v_seq
  from public.reports
  where organisation_id=public.get_current_organisation_id();
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
  if not public.is_admin_or_supervisor() then raise exception 'Only supervisor/admin can issue reports'; end if;
  update public.reports
  set status='ISSUED', issued_at=now(), issued_by=auth.uid()
  where id=p_report_id and organisation_id=public.get_current_organisation_id()
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
  where id=p_plan_id and organisation_id=public.get_current_organisation_id() and active=true;
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

-- Protect issued reports from normal updates/deletes.
create or replace function public.prevent_issued_report_mutation()
returns trigger language plpgsql as $$
begin
  if old.status = 'ISSUED' and current_user <> 'postgres' then
    raise exception 'Issued reports are immutable; void and regenerate instead';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

drop trigger if exists trg_reports_immutable on public.reports;
create trigger trg_reports_immutable before update or delete on public.reports
for each row execute function public.prevent_issued_report_mutation();
