create type public.system_type as enum (
  'FIRE_ALARM','FIRE_EXTINGUISHING','HOSE_REEL','SPRINKLER',
  'EMERGENCY_LIGHTING','EXIT_SIGNAGE','OTHER'
);

create table public.systems (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  building_id uuid not null references public.buildings(id) on delete cascade,
  name text not null,
  system_type public.system_type not null,
  code text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, building_id, code)
);
