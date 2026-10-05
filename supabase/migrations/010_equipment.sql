create type public.equipment_status as enum ('ACTIVE','OUT_OF_SERVICE','RETIRED');

create table public.equipment (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete restrict,
  system_id uuid references public.systems(id) on delete set null,
  equipment_type_id uuid not null references public.equipment_types(id) on delete restrict,
  asset_code text not null,
  serial_number text,
  brand text,
  model text,
  capacity text,
  location_description text,
  installation_date date,
  status public.equipment_status not null default 'ACTIVE',
  qr_token text not null default encode(extensions.gen_random_bytes(18), 'hex'),
  last_inspection_at timestamptz,
  next_inspection_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, asset_code),
  unique (qr_token)
);
