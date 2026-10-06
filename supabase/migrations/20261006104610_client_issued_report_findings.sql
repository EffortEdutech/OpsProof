create policy client_issued_report_findings_select on public.findings
for select
using (
  organisation_id = private.get_current_organisation_id()
  and private.get_current_role() = 'CLIENT'
  and exists (
    select 1
    from public.reports r
    join public.maintenance_jobs j on j.id = r.job_id
    where r.job_id = findings.job_id
      and r.status = 'ISSUED'
      and j.client_id = (
        select p.client_id
        from public.profiles p
        where p.id = (select auth.uid())
      )
  )
);
