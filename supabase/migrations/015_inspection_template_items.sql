create type public.template_field_type as enum (
  'PASS_FAIL','YES_NO','SELECT','NUMBER','TEXT','PHOTO','DATE','SIGNATURE'
);

create table public.inspection_template_items (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.inspection_templates(id) on delete cascade,
  section text not null,
  item_code text not null,
  prompt text not null,
  field_type public.template_field_type not null,
  options jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  sort_order integer not null,
  guidance text,
  fail_creates_finding boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (template_id, item_code)
);
