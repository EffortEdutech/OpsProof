create type public.maintenance_frequency as enum (
  'MONTHLY','QUARTERLY','HALF_YEARLY','YEARLY','CUSTOM'
);

create table public.maintenance_plans (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete restrict,
  site_id uuid not null references public.sites(id) on delete restrict,
  name text not null,
  frequency public.maintenance_frequency not null,
  interval_days integer,
  start_date date not null,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (frequency <> 'CUSTOM' and interval_days is null)
    or
    (frequency = 'CUSTOM' and interval_days is not null and interval_days > 0)
  )
);
