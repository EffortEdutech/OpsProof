create type public.job_equipment_status as enum ('PENDING','IN_PROGRESS','COMPLETED','SKIPPED');

create table public.job_equipment (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  job_id uuid not null references public.maintenance_jobs(id) on delete cascade,
  equipment_id uuid not null references public.equipment(id) on delete restrict,
  status public.job_equipment_status not null default 'PENDING',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, equipment_id)
);
