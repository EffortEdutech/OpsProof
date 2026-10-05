create type public.report_type as enum ('MAINTENANCE','INSPECTION','FINDING','OTHER');
create type public.report_status as enum ('DRAFT','GENERATED','REVIEWED','ISSUED','VOID');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  job_id uuid not null references public.maintenance_jobs(id) on delete restrict,
  report_number text not null,
  report_type public.report_type not null default 'MAINTENANCE',
  status public.report_status not null default 'DRAFT',
  title text,
  generated_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  issued_at timestamptz,
  pdf_path text,
  report_data jsonb,
  generated_by uuid references public.profiles(id) on delete set null,
  reviewed_by uuid references public.profiles(id) on delete set null,
  issued_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, report_number)
);
