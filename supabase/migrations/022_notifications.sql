create type public.notification_status as enum ('UNREAD','READ','ARCHIVED');

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null,
  entity_type text,
  entity_id uuid,
  status public.notification_status not null default 'UNREAD',
  created_at timestamptz not null default now(),
  read_at timestamptz
);
