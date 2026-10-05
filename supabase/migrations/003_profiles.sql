create type public.app_role as enum ('OWNER','ADMIN','SUPERVISOR','TECHNICIAN','CLIENT');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  client_id uuid,
  full_name text not null,
  phone text,
  role public.app_role not null default 'TECHNICIAN',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
