create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  registration_no text,
  phone text,
  email citext,
  address text,
  logo_url text,
  report_prefix text not null default 'FM',
  timezone text not null default 'Asia/Kuala_Lumpur',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
