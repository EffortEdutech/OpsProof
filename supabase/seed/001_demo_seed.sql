-- FireMaint V1 demo dataset.
-- Run after migrations + reference seed.
-- Does not create auth.users.

with org as (
  insert into public.organisations
    (name,legal_name,registration_no,phone,email,address,report_prefix)
  values
    ('FireMaint Demo Services','FireMaint Demo Services Sdn Bhd','DEMO-001',
     '+605-0000000','demo@firemaint.local','Ipoh, Perak, Malaysia','FM')
  on conflict do nothing
  returning id
)
select id from org;

do $$
declare
  o uuid;
  c uuid;
  s uuid;
  b uuid;
  sys uuid;
  et_ext uuid;
  et_hr uuid;
  i int;
begin
  select id into o from public.organisations where registration_no='DEMO-001';

  insert into public.clients(organisation_id,name,registration_no,industry,phone,email,address)
  values(o,'ABC Manufacturing Sdn Bhd','ABC-001','Manufacturing','+605-1111111',
         'facility@abc.example','Perak, Malaysia')
  on conflict (organisation_id,name) do update set name=excluded.name
  returning id into c;

  insert into public.sites(organisation_id,client_id,name,site_code,address,city,state,postcode)
  values(o,c,'ABC Manufacturing Main Plant','ABC-MAIN','Main Industrial Area','Ipoh','Perak','30000')
  on conflict (organisation_id,site_code) do update set name=excluded.name
  returning id into s;

  insert into public.buildings(organisation_id,site_id,name,code,floors)
  values(o,s,'Main Factory','BLK-A',2)
  on conflict (organisation_id,site_id,code) do update set name=excluded.name
  returning id into b;

  insert into public.systems(organisation_id,building_id,name,system_type,code)
  values(o,b,'Fire Protection System','FIRE_EXTINGUISHING','FPS-01')
  on conflict (organisation_id,building_id,code) do update set name=excluded.name
  returning id into sys;

  select id into et_ext from public.equipment_types where organisation_id is null and code='EXT-DP' limit 1;
  select id into et_hr from public.equipment_types where organisation_id is null and code='HR-STD' limit 1;

  for i in 1..32 loop
    insert into public.equipment
      (organisation_id,building_id,system_id,equipment_type_id,asset_code,brand,model,capacity,location_description)
    values
      (o,b,sys,et_ext,'EXT-'||lpad(i::text,3,'0'),'DemoBrand','DP-ABC','6 KG','Factory floor / zone '||((i-1)%8+1))
    on conflict (organisation_id,asset_code) do nothing;
  end loop;

  for i in 1..8 loop
    insert into public.equipment
      (organisation_id,building_id,system_id,equipment_type_id,asset_code,brand,model,location_description)
    values
      (o,b,sys,et_hr,'HR-'||lpad(i::text,3,'0'),'DemoBrand','HR-01','Zone '||i)
    on conflict (organisation_id,asset_code) do nothing;
  end loop;

  insert into public.maintenance_plans
    (organisation_id,client_id,site_id,name,frequency,start_date)
  values(o,c,s,'Quarterly Fire Protection Maintenance','QUARTERLY',current_date)
  on conflict do nothing;
end $$;
