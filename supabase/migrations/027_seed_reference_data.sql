-- Global reference equipment types. organisation_id NULL means shared reference data.
insert into public.equipment_types (organisation_id,name,code,system_type,description)
values
  (null,'Dry Powder Fire Extinguisher','EXT-DP','FIRE_EXTINGUISHING','Portable dry powder extinguisher'),
  (null,'CO2 Fire Extinguisher','EXT-CO2','FIRE_EXTINGUISHING','Portable CO2 extinguisher'),
  (null,'Hose Reel','HR-STD','HOSE_REEL','Fire hose reel'),
  (null,'Fire Alarm Panel','FAP-STD','FIRE_ALARM','Fire alarm control panel'),
  (null,'Smoke/Heat Detector','DET-SH','FIRE_ALARM','Smoke or heat detector'),
  (null,'Manual Call Point','MCP-STD','FIRE_ALARM','Manual call point'),
  (null,'Fire Alarm Sounder','SND-STD','FIRE_ALARM','Fire alarm sounder'),
  (null,'Emergency Light','EML-STD','EMERGENCY_LIGHTING','Emergency lighting unit'),
  (null,'Exit Sign','EXIT-STD','EXIT_SIGNAGE','Exit signage'),
  (null,'Sprinkler Head','SPR-STD','SPRINKLER','Sprinkler head')
on conflict do nothing;

-- Shared Fire Extinguisher Standard Inspection v1.
do $$
declare
  et uuid;
  t uuid;
begin
  select id into et from public.equipment_types where organisation_id is null and code='EXT-DP' limit 1;

  insert into public.inspection_templates
    (organisation_id,equipment_type_id,name,code,version,status,description)
  values
    (null,et,'Fire Extinguisher — Standard Inspection v1','EXT-STANDARD',1,'ACTIVE',
     'Baseline visual and functional maintenance inspection.')
  on conflict (organisation_id,code,version) do nothing;

  select id into t from public.inspection_templates where organisation_id is null and code='EXT-STANDARD' and version=1 limit 1;

  insert into public.inspection_template_items
    (template_id,section,item_code,prompt,field_type,required,sort_order,guidance,fail_creates_finding)
  values
    (t,'Identification','ID-01','Asset identification matches register','PASS_FAIL',true,10,'Verify asset code and equipment type.',true),
    (t,'Accessibility','AC-01','Extinguisher is accessible and unobstructed','PASS_FAIL',true,20,'Confirm access is clear.',true),
    (t,'Physical Condition','PC-01','Cylinder/body shows no significant damage or corrosion','PASS_FAIL',true,30,'Inspect body, handle and bracket.',true),
    (t,'Physical Condition','PC-02','Safety pin and tamper seal are present','PASS_FAIL',true,40,'Verify pin and seal.',true),
    (t,'Physical Condition','PC-03','Pressure indicator is in acceptable range where applicable','PASS_FAIL',true,50,'Not applicable to CO2 units.',true),
    (t,'Safety','SF-01','Label/instructions are legible','PASS_FAIL',true,60,'Confirm operating instructions can be read.',true),
    (t,'Safety','SF-02','Hose/nozzle is present and unobstructed where applicable','PASS_FAIL',true,70,'Check hose/nozzle condition.',true),
    (t,'Overall','OV-01','Overall equipment condition','SELECT',true,80,'Select PASS, ATTENTION or FAIL.',
      false)
  on conflict (template_id,item_code) do nothing;

  update public.inspection_template_items
  set options='["PASS","ATTENTION","FAIL","NA"]'::jsonb
  where template_id=t and item_code='OV-01';
end $$;
