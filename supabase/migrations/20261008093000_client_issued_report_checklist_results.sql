create policy client_job_equipment_issued_report_select
on public.job_equipment
for select
using (
  organisation_id = private.get_current_organisation_id()
  and private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.maintenance_jobs j
    join public.reports r on r.job_id = j.id
    where j.id = job_equipment.job_id
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and r.status = 'ISSUED'
  )
);

create policy client_inspections_issued_report_select
on public.inspections
for select
using (
  organisation_id = private.get_current_organisation_id()
  and private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.job_equipment je
    join public.maintenance_jobs j on j.id = je.job_id
    join public.reports r on r.job_id = j.id
    where je.id = inspections.job_equipment_id
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and r.status = 'ISSUED'
  )
);

create policy client_inspection_results_issued_report_select
on public.inspection_results
for select
using (
  organisation_id = private.get_current_organisation_id()
  and private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.inspections i
    join public.job_equipment je on je.id = i.job_equipment_id
    join public.maintenance_jobs j on j.id = je.job_id
    join public.reports r on r.job_id = j.id
    where i.id = inspection_results.inspection_id
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and r.status = 'ISSUED'
  )
);

create policy client_inspection_templates_issued_report_select
on public.inspection_templates
for select
using (
  private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.inspections i
    join public.job_equipment je on je.id = i.job_equipment_id
    join public.maintenance_jobs j on j.id = je.job_id
    join public.reports r on r.job_id = j.id
    where i.template_id = inspection_templates.id
      and i.organisation_id = private.get_current_organisation_id()
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and r.status = 'ISSUED'
  )
);

create policy client_inspection_template_items_issued_report_select
on public.inspection_template_items
for select
using (
  private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.inspection_templates t
    join public.inspections i on i.template_id = t.id
    join public.job_equipment je on je.id = i.job_equipment_id
    join public.maintenance_jobs j on j.id = je.job_id
    join public.reports r on r.job_id = j.id
    where t.id = inspection_template_items.template_id
      and i.organisation_id = private.get_current_organisation_id()
      and j.client_id = (select client_id from public.profiles where id = auth.uid())
      and r.status = 'ISSUED'
  )
);
