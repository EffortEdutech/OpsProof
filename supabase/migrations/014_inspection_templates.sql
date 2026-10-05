create type public.template_status as enum ('DRAFT','ACTIVE','ARCHIVED');

create table public.inspection_templates (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations(id) on delete cascade,
  equipment_type_id uuid not null references public.equipment_types(id) on delete cascade,
  name text not null,
  code text not null,
  version integer not null default 1,
  status public.template_status not null default 'DRAFT',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, code, version)
);
