-- Client A equipment register demo data.
-- Run after Client A, Client A Demo Site, and global reference equipment types exist.

do $$
declare
  target_org_id uuid;
  target_client_id uuid;
  target_site_id uuid;
  target_building_id uuid;
  target_system_id uuid;
  target_equipment_type_id uuid;
begin
  select c.organisation_id, c.id
    into target_org_id, target_client_id
  from public.clients c
  where c.name = 'Client A'
  order by c.created_at desc
  limit 1;

  if target_client_id is null then
    raise exception 'Client A not found. Create the Client A account/profile data first.';
  end if;

  select s.id
    into target_site_id
  from public.sites s
  where s.organisation_id = target_org_id
    and s.client_id = target_client_id
    and s.name = 'Client A Demo Site'
  order by s.created_at desc
  limit 1;

  if target_site_id is null then
    raise exception 'Client A Demo Site not found for Client A. Create the site first.';
  end if;

  select et.id
    into target_equipment_type_id
  from public.equipment_types et
  where et.organisation_id is null
    and et.code = 'EXT-DP'
  limit 1;

  if target_equipment_type_id is null then
    raise exception 'Reference equipment type EXT-DP not found. Run 027_seed_reference_data.sql first.';
  end if;

  insert into public.buildings
    (organisation_id, site_id, name, code, floors, description, active)
  values
    (
      target_org_id,
      target_site_id,
      'Client A Main Building',
      'CLIENT-A-BLDG-01',
      1,
      'Seeded demo building for the Client A equipment register.',
      true
    )
  on conflict (organisation_id, site_id, code) do update
    set name = excluded.name,
        floors = excluded.floors,
        description = excluded.description,
        active = excluded.active,
        updated_at = now()
  returning id into target_building_id;

  insert into public.systems
    (organisation_id, building_id, name, system_type, code, description, active)
  values
    (
      target_org_id,
      target_building_id,
      'Client A Fire Protection System',
      'FIRE_EXTINGUISHING',
      'CLIENT-A-FPS-01',
      'Seeded demo fire system for Client A Demo Site.',
      true
    )
  on conflict (organisation_id, building_id, code) do update
    set name = excluded.name,
        system_type = excluded.system_type,
        description = excluded.description,
        active = excluded.active,
        updated_at = now()
  returning id into target_system_id;

  insert into public.equipment
    (
      organisation_id,
      building_id,
      system_id,
      equipment_type_id,
      asset_code,
      serial_number,
      brand,
      model,
      capacity,
      location_description,
      installation_date,
      status,
      metadata
    )
  values
    (
      target_org_id,
      target_building_id,
      target_system_id,
      target_equipment_type_id,
      'CLIENT-A-EXT-001',
      'CLIENT-A-SN-001',
      'DemoBrand',
      'DP-6KG',
      '6 KG',
      'Client A Demo Site / main entrance',
      current_date,
      'ACTIVE',
      jsonb_build_object('seed', 'client-a-equipment-register')
    )
  on conflict (organisation_id, asset_code) do update
    set building_id = excluded.building_id,
        system_id = excluded.system_id,
        equipment_type_id = excluded.equipment_type_id,
        serial_number = excluded.serial_number,
        brand = excluded.brand,
        model = excluded.model,
        capacity = excluded.capacity,
        location_description = excluded.location_description,
        installation_date = excluded.installation_date,
        status = excluded.status,
        metadata = excluded.metadata,
        updated_at = now();
end $$;

select
  c.name as client,
  s.name as site,
  b.name as building,
  sys.name as system,
  e.asset_code,
  et.name as equipment_type,
  e.status
from public.equipment e
join public.buildings b on b.id = e.building_id
join public.sites s on s.id = b.site_id
join public.clients c on c.id = s.client_id
left join public.systems sys on sys.id = e.system_id
join public.equipment_types et on et.id = e.equipment_type_id
where c.name = 'Client A'
  and s.name = 'Client A Demo Site'
  and e.asset_code = 'CLIENT-A-EXT-001';
