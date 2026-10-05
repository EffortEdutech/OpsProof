insert into storage.buckets (id, name, public)
values
  ('inspection-photos','inspection-photos',false),
  ('report-pdfs','report-pdfs',false),
  ('company-assets','company-assets',false),
  ('documents','documents',false)
on conflict (id) do update set public=false;

create policy storage_read_org on storage.objects
for select to authenticated
using (
  bucket_id in ('inspection-photos','report-pdfs','company-assets','documents')
  and (storage.foldername(name))[1] = public.get_current_organisation_id()::text
);

create policy storage_insert_org on storage.objects
for insert to authenticated
with check (
  bucket_id in ('inspection-photos','report-pdfs','company-assets','documents')
  and (storage.foldername(name))[1] = public.get_current_organisation_id()::text
);

create policy storage_update_org on storage.objects
for update to authenticated
using (
  bucket_id in ('inspection-photos','report-pdfs','company-assets','documents')
  and (storage.foldername(name))[1] = public.get_current_organisation_id()::text
)
with check (
  bucket_id in ('inspection-photos','report-pdfs','company-assets','documents')
  and (storage.foldername(name))[1] = public.get_current_organisation_id()::text
);

create policy storage_delete_org on storage.objects
for delete to authenticated
using (
  bucket_id in ('inspection-photos','report-pdfs','company-assets','documents')
  and (storage.foldername(name))[1] = public.get_current_organisation_id()::text
);
