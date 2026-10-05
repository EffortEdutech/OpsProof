create schema if not exists extensions;

alter function public.touch_updated_at()
set search_path = public;

alter function public.prevent_issued_report_mutation()
set search_path = public;

alter extension citext set schema extensions;
