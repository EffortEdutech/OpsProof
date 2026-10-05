create type public.finding_severity as enum ('OBSERVATION','LOW','MEDIUM','HIGH','CRITICAL');
create type public.finding_status as enum ('OPEN','IN_PROGRESS','RESOLVED','VERIFIED','CLOSED');

create table public.findings (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  job_id uuid not null references public.maintenance_jobs(id) on delete cascade,
  inspection_id uuid references public.inspections(id) on delete set null,
  equipment_id uuid references public.equipment(id) on delete set null,
  title text not null,
  description text,
  severity public.finding_severity not null default 'OBSERVATION',
  status public.finding_status not null default 'OPEN',
  recommendation text,
  due_date date,
  resolved_at timestamptz,
  verified_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  resolved_by uuid references public.profiles(id) on delete set null,
  verified_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
