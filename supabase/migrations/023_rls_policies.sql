create or replace function public.get_current_organisation_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select organisation_id from public.profiles where id = auth.uid() and active = true
$$;

create or replace function public.get_current_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true
$$;

create or replace function public.is_internal_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_current_role() in ('OWNER','ADMIN','SUPERVISOR','TECHNICIAN'), false)
$$;

create or replace function public.is_admin_or_supervisor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.get_current_role() in ('OWNER','ADMIN','SUPERVISOR'), false)
$$;

alter table public.organisations enable row level security;
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.sites enable row level security;
alter table public.buildings enable row level security;
alter table public.systems enable row level security;
alter table public.equipment_types enable row level security;
alter table public.equipment enable row level security;
alter table public.maintenance_plans enable row level security;
alter table public.maintenance_jobs enable row level security;
alter table public.job_equipment enable row level security;
alter table public.inspection_templates enable row level security;
alter table public.inspection_template_items enable row level security;
alter table public.inspections enable row level security;
alter table public.inspection_results enable row level security;
alter table public.findings enable row level security;
alter table public.finding_photos enable row level security;
alter table public.reports enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Organisation/profile access
create policy organisations_select on public.organisations for select using (id = public.get_current_organisation_id());
create policy profiles_select on public.profiles for select using (organisation_id = public.get_current_organisation_id());
create policy profiles_manage on public.profiles for all using (organisation_id = public.get_current_organisation_id() and public.is_admin_or_supervisor()) with check (organisation_id = public.get_current_organisation_id());

-- Generic tenant policies for internal data
create policy clients_internal on public.clients for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy contacts_internal on public.client_contacts for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy sites_internal on public.sites for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy buildings_internal on public.buildings for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy systems_internal on public.systems for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy equipment_types_internal on public.equipment_types for all using ((organisation_id is null or organisation_id = public.get_current_organisation_id()) and public.is_internal_user()) with check (organisation_id is null or organisation_id = public.get_current_organisation_id());
create policy equipment_internal on public.equipment for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy plans_internal on public.maintenance_plans for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy jobs_internal on public.maintenance_jobs for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy job_equipment_internal on public.job_equipment for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy templates_internal on public.inspection_templates for all using ((organisation_id is null or organisation_id = public.get_current_organisation_id()) and public.is_internal_user()) with check (organisation_id is null or organisation_id = public.get_current_organisation_id());
create policy template_items_internal on public.inspection_template_items for all using (
  exists (select 1 from public.inspection_templates t where t.id = template_id and (t.organisation_id is null or t.organisation_id = public.get_current_organisation_id()))
  and public.is_internal_user()
) with check (
  exists (select 1 from public.inspection_templates t where t.id = template_id and (t.organisation_id is null or t.organisation_id = public.get_current_organisation_id()))
);

create policy inspections_internal on public.inspections for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy results_internal on public.inspection_results for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy findings_internal on public.findings for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy finding_photos_internal on public.finding_photos for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy reports_internal on public.reports for all using (organisation_id = public.get_current_organisation_id() and public.is_internal_user()) with check (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy audit_internal on public.audit_logs for select using (organisation_id = public.get_current_organisation_id() and public.is_internal_user());
create policy notifications_own on public.notifications for all using (organisation_id = public.get_current_organisation_id() and recipient_id = auth.uid()) with check (organisation_id = public.get_current_organisation_id() and recipient_id = auth.uid());

-- Client portal: read-only, restricted through the client_id on profile.
create policy client_sites_select on public.sites for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and client_id = (select client_id from public.profiles where id = auth.uid())
);
create policy client_clients_select on public.clients for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and id = (select client_id from public.profiles where id = auth.uid())
);
create policy client_buildings_select on public.buildings for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and exists (
    select 1 from public.sites s
    where s.id = site_id and s.client_id = (select client_id from public.profiles where id = auth.uid())
  )
);
create policy client_equipment_select on public.equipment for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and exists (
    select 1 from public.buildings b join public.sites s on s.id=b.site_id
    where b.id = building_id and s.client_id = (select client_id from public.profiles where id = auth.uid())
  )
);
create policy client_jobs_select on public.maintenance_jobs for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and client_id = (select client_id from public.profiles where id = auth.uid())
);
create policy client_reports_select on public.reports for select using (
  organisation_id = public.get_current_organisation_id()
  and public.get_current_role() = 'CLIENT'
  and exists (
    select 1 from public.maintenance_jobs j
    where j.id = job_id
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and status = 'ISSUED'
  )
);

-- Technician-specific restrictions are enforced with additional restrictive policies
create policy technician_jobs_assigned on public.maintenance_jobs as restrictive for all
using (
  public.get_current_role() <> 'TECHNICIAN'
  or assigned_technician_id = auth.uid()
)
with check (
  public.get_current_role() <> 'TECHNICIAN'
  or assigned_technician_id = auth.uid()
);

create policy technician_job_equipment on public.job_equipment as restrictive for all
using (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (select 1 from public.maintenance_jobs j where j.id=job_id and j.assigned_technician_id=auth.uid())
)
with check (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (select 1 from public.maintenance_jobs j where j.id=job_id and j.assigned_technician_id=auth.uid())
);

create policy technician_inspections on public.inspections as restrictive for all
using (
  public.get_current_role() <> 'TECHNICIAN'
  or technician_id = auth.uid()
  or exists (select 1 from public.maintenance_jobs j join public.job_equipment je on je.job_id=j.id where je.id=job_equipment_id and j.assigned_technician_id=auth.uid())
)
with check (
  public.get_current_role() <> 'TECHNICIAN'
  or technician_id = auth.uid()
  or exists (select 1 from public.maintenance_jobs j join public.job_equipment je on je.job_id=j.id where je.id=job_equipment_id and j.assigned_technician_id=auth.uid())
);

create policy technician_findings on public.findings as restrictive for all
using (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (select 1 from public.maintenance_jobs j where j.id=job_id and j.assigned_technician_id=auth.uid())
)
with check (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (select 1 from public.maintenance_jobs j where j.id=job_id and j.assigned_technician_id=auth.uid())
);

create policy technician_photos on public.finding_photos as restrictive for all
using (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (
    select 1 from public.findings f
    join public.maintenance_jobs j on j.id=f.job_id
    where f.id=finding_id and j.assigned_technician_id=auth.uid()
  )
)
with check (
  public.get_current_role() <> 'TECHNICIAN'
  or exists (
    select 1 from public.findings f
    join public.maintenance_jobs j on j.id=f.job_id
    where f.id=finding_id and j.assigned_technician_id=auth.uid()
  )
);
