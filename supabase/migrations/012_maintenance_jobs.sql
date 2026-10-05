create type public.maintenance_job_status as enum (
  'SCHEDULED','IN_PROGRESS','SUBMITTED','UNDER_REVIEW','COMPLETED','CANCELLED'
);

create table public.maintenance_jobs (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  maintenance_plan_id uuid references public.maintenance_plans(id) on delete set null,
  client_id uuid not null references public.clients(id) on delete restrict,
  site_id uuid not null references public.sites(id) on delete restrict,
  building_id uuid references public.buildings(id) on delete set null,
  job_number text not null,
  scheduled_date date not null,
  started_at timestamptz,
  submitted_at timestamptz,
  completed_at timestamptz,
  status public.maintenance_job_status not null default 'SCHEDULED',
  assigned_technician_id uuid references public.profiles(id) on delete set null,
  supervisor_id uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, job_number)
);
