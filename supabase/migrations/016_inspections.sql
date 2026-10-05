create type public.inspection_status as enum ('NOT_STARTED','IN_PROGRESS','COMPLETED','LOCKED');

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  job_id uuid not null references public.maintenance_jobs(id) on delete cascade,
  job_equipment_id uuid not null references public.job_equipment(id) on delete cascade,
  template_id uuid not null references public.inspection_templates(id) on delete restrict,
  technician_id uuid references public.profiles(id) on delete set null,
  status public.inspection_status not null default 'NOT_STARTED',
  started_at timestamptz,
  completed_at timestamptz,
  locked_at timestamptz,
  technician_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_equipment_id)
);
