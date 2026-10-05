-- Run after migration/seed in a test database.
select table_name
from information_schema.tables
where table_schema='public'
  and table_name in (
    'organisations','profiles','clients','client_contacts','sites','buildings',
    'systems','equipment_types','equipment','maintenance_plans','maintenance_jobs',
    'job_equipment','inspection_templates','inspection_template_items','inspections',
    'inspection_results','findings','finding_photos','reports','audit_logs','notifications'
  )
order by table_name;

select code,name from public.equipment_types where organisation_id is null order by code;

select t.code,t.version,count(i.id) as item_count
from public.inspection_templates t
left join public.inspection_template_items i on i.template_id=t.id
where t.organisation_id is null
group by t.code,t.version
order by t.code,t.version;
