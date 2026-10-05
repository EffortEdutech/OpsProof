begin;

create temp table rls_ids (
  key text primary key,
  id uuid not null
) on commit drop;

insert into rls_ids(key, id)
values
  ('org_a', extensions.gen_random_uuid()),
  ('org_b', extensions.gen_random_uuid()),
  ('owner_a', extensions.gen_random_uuid()),
  ('tech_a', extensions.gen_random_uuid()),
  ('tech_b', extensions.gen_random_uuid()),
  ('client_user_a', extensions.gen_random_uuid()),
  ('client_user_b', extensions.gen_random_uuid()),
  ('client_a', extensions.gen_random_uuid()),
  ('client_b', extensions.gen_random_uuid()),
  ('site_a', extensions.gen_random_uuid()),
  ('site_b', extensions.gen_random_uuid()),
  ('building_a', extensions.gen_random_uuid()),
  ('building_b', extensions.gen_random_uuid()),
  ('plan_a', extensions.gen_random_uuid()),
  ('plan_b', extensions.gen_random_uuid()),
  ('job_a_assigned', extensions.gen_random_uuid()),
  ('job_a_unassigned', extensions.gen_random_uuid()),
  ('job_b_assigned', extensions.gen_random_uuid()),
  ('report_a_issued', extensions.gen_random_uuid()),
  ('report_a_generated', extensions.gen_random_uuid()),
  ('report_b_issued', extensions.gen_random_uuid());

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
)
select
  id,
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  key || '@rls.firemaint.test',
  extensions.crypt('FireMaintRlsTest123!', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb
from rls_ids
where key in ('owner_a', 'tech_a', 'tech_b', 'client_user_a', 'client_user_b');

insert into public.organisations(id, name, report_prefix)
values
  ((select id from rls_ids where key='org_a'), 'RLS Org A', 'RLA'),
  ((select id from rls_ids where key='org_b'), 'RLS Org B', 'RLB');

insert into public.clients(id, organisation_id, name)
values
  ((select id from rls_ids where key='client_a'), (select id from rls_ids where key='org_a'), 'RLS Client A'),
  ((select id from rls_ids where key='client_b'), (select id from rls_ids where key='org_b'), 'RLS Client B');

insert into public.profiles(id, organisation_id, client_id, full_name, role)
values
  ((select id from rls_ids where key='owner_a'), (select id from rls_ids where key='org_a'), null, 'RLS Owner A', 'OWNER'),
  ((select id from rls_ids where key='tech_a'), (select id from rls_ids where key='org_a'), null, 'RLS Technician A', 'TECHNICIAN'),
  ((select id from rls_ids where key='tech_b'), (select id from rls_ids where key='org_b'), null, 'RLS Technician B', 'TECHNICIAN'),
  ((select id from rls_ids where key='client_user_a'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='client_a'), 'RLS Client User A', 'CLIENT'),
  ((select id from rls_ids where key='client_user_b'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='client_b'), 'RLS Client User B', 'CLIENT');

insert into public.sites(id, organisation_id, client_id, name, site_code)
values
  ((select id from rls_ids where key='site_a'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='client_a'), 'RLS Site A', 'RLS-A'),
  ((select id from rls_ids where key='site_b'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='client_b'), 'RLS Site B', 'RLS-B');

insert into public.buildings(id, organisation_id, site_id, name, code)
values
  ((select id from rls_ids where key='building_a'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='site_a'), 'RLS Building A', 'A'),
  ((select id from rls_ids where key='building_b'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='site_b'), 'RLS Building B', 'B');

insert into public.maintenance_plans(id, organisation_id, client_id, site_id, name, frequency, start_date)
values
  ((select id from rls_ids where key='plan_a'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='client_a'), (select id from rls_ids where key='site_a'), 'RLS Plan A', 'MONTHLY', current_date),
  ((select id from rls_ids where key='plan_b'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='client_b'), (select id from rls_ids where key='site_b'), 'RLS Plan B', 'MONTHLY', current_date);

insert into public.maintenance_jobs(id, organisation_id, maintenance_plan_id, client_id, site_id, building_id, job_number, scheduled_date, assigned_technician_id, status)
values
  ((select id from rls_ids where key='job_a_assigned'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='plan_a'), (select id from rls_ids where key='client_a'), (select id from rls_ids where key='site_a'), (select id from rls_ids where key='building_a'), 'RLS-A-ASSIGNED', current_date, (select id from rls_ids where key='tech_a'), 'SCHEDULED'),
  ((select id from rls_ids where key='job_a_unassigned'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='plan_a'), (select id from rls_ids where key='client_a'), (select id from rls_ids where key='site_a'), (select id from rls_ids where key='building_a'), 'RLS-A-UNASSIGNED', current_date, null, 'SCHEDULED'),
  ((select id from rls_ids where key='job_b_assigned'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='plan_b'), (select id from rls_ids where key='client_b'), (select id from rls_ids where key='site_b'), (select id from rls_ids where key='building_b'), 'RLS-B-ASSIGNED', current_date, (select id from rls_ids where key='tech_b'), 'SCHEDULED');

insert into public.reports(id, organisation_id, job_id, report_number, status)
values
  ((select id from rls_ids where key='report_a_issued'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='job_a_assigned'), 'RLS-A-ISSUED', 'ISSUED'),
  ((select id from rls_ids where key='report_a_generated'), (select id from rls_ids where key='org_a'), (select id from rls_ids where key='job_a_assigned'), 'RLS-A-GENERATED', 'GENERATED'),
  ((select id from rls_ids where key='report_b_issued'), (select id from rls_ids where key='org_b'), (select id from rls_ids where key='job_b_assigned'), 'RLS-B-ISSUED', 'ISSUED');

create temp table rls_results (
  name text primary key,
  passed boolean not null,
  details text
) on commit drop;

create temp table rls_update_counts (
  name text primary key,
  updated_count integer not null
) on commit drop;

grant select on rls_ids to authenticated;
grant select, insert on rls_results to authenticated;
grant select, insert on rls_update_counts to authenticated;

create or replace function pg_temp.as_user(p_key text)
returns void
language plpgsql
as $$
declare
  v_user uuid;
begin
  select id into v_user from rls_ids where key = p_key;
  perform set_config('request.jwt.claim.sub', v_user::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
end
$$;

set local role authenticated;

select pg_temp.as_user('owner_a');
insert into rls_results
select
  'owner_a_sees_only_org_a_clients',
  count(*) = 1 and bool_and(organisation_id = (select id from rls_ids where key='org_a')),
  'visible clients=' || count(*)::text
from public.clients;

select pg_temp.as_user('tech_a');
insert into rls_results
select
  'tech_a_sees_only_assigned_job',
  array_agg(job_number order by job_number) = array['RLS-A-ASSIGNED'],
  'visible jobs=' || coalesce(array_to_string(array_agg(job_number order by job_number), ','), '<none>')
from public.maintenance_jobs;

select pg_temp.as_user('tech_a');
with upd as (
  update public.maintenance_jobs
  set notes = 'should not update'
  where id = (select id from rls_ids where key='job_a_unassigned')
  returning 1
)
insert into rls_update_counts
select 'tech_a_unassigned_job', count(*)::integer from upd;

insert into rls_results
select
  'tech_a_cannot_update_unassigned_job',
  (select updated_count from rls_update_counts where name = 'tech_a_unassigned_job') = 0,
  'unassigned update blocked';

select pg_temp.as_user('client_user_a');
insert into rls_results
select
  'client_a_sees_only_own_issued_report',
  array_agg(report_number order by report_number) = array['RLS-A-ISSUED'],
  'visible reports=' || coalesce(array_to_string(array_agg(report_number order by report_number), ','), '<none>')
from public.reports;

select pg_temp.as_user('client_user_b');
insert into rls_results
select
  'client_b_cannot_see_client_a_report',
  array_agg(report_number order by report_number) = array['RLS-B-ISSUED'],
  'visible reports=' || coalesce(array_to_string(array_agg(report_number order by report_number), ','), '<none>')
from public.reports;

select pg_temp.as_user('client_user_a');
with upd as (
  update public.reports
  set title = 'client edit should not happen'
  where id = (select id from rls_ids where key='report_a_issued')
  returning 1
)
insert into rls_update_counts
select 'client_a_issued_report', count(*)::integer from upd;

insert into rls_results
select
  'client_a_cannot_mutate_report',
  (select updated_count from rls_update_counts where name = 'client_a_issued_report') = 0,
  'client update blocked';

do $$
declare
  failures text;
begin
  select string_agg(name || ': ' || details, E'\n' order by name)
  into failures
  from rls_results
  where not passed;

  if failures is not null then
    raise exception 'RLS boundary test failures:%', E'\n' || failures;
  end if;
end $$;

table rls_results order by name;

rollback;
