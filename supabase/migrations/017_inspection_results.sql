create type public.inspection_result_status as enum ('PASS','ATTENTION','FAIL','NA');

create table public.inspection_results (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  template_item_id uuid not null references public.inspection_template_items(id) on delete restrict,
  result_status public.inspection_result_status,
  value_text text,
  value_number numeric,
  value_date date,
  value_json jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (inspection_id, template_item_id)
);
