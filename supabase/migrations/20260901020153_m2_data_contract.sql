create type public.data_source_kind as enum ('official_api', 'official_site', 'maps', 'manual');
create type public.data_trust_level as enum ('official', 'verified', 'unverified');
create type public.pipeline_run_status as enum ('running', 'succeeded', 'failed', 'cancelled');
create type public.event_publication_status as enum ('draft', 'review', 'published', 'rejected', 'archived');
create type public.event_lifecycle_status as enum ('scheduled', 'cancelled', 'postponed', 'expired');
create type public.data_review_status as enum ('pending', 'approved', 'rejected', 'needs_changes');
create type public.data_report_status as enum ('open', 'triaged', 'resolved', 'dismissed');
create type public.platform_role as enum ('platform_admin', 'data_reviewer');

create table public.data_sources (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9][a-z0-9_-]{1,63}$'),
  kind public.data_source_kind not null,
  name text not null check (char_length(name) between 1 and 120),
  base_url text not null check (base_url ~ '^https://'),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  region_code text,
  default_language text not null,
  acquisition_method text not null,
  terms_status text not null,
  rate_limit_per_minute integer check (rate_limit_per_minute is null or rate_limit_per_minute > 0),
  trust_level public.data_trust_level not null default 'official',
  enabled boolean not null default true,
  kill_switch_reason text,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (enabled or kill_switch_reason is not null)
);

create table public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources(id) on delete restrict,
  trigger_kind text not null check (trigger_kind in ('scheduled', 'manual', 'retry')),
  status public.pipeline_run_status not null default 'running',
  attempt integer not null default 1 check (attempt > 0),
  idempotency_key text not null,
  cursor jsonb not null default '{}'::jsonb,
  metrics jsonb not null default '{}'::jsonb,
  error_code text,
  error_summary text,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_id, idempotency_key, attempt),
  check ((status = 'running' and finished_at is null) or (status <> 'running' and finished_at is not null))
);

create table public.source_items_raw (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.data_sources(id) on delete restrict,
  pipeline_run_id uuid not null references public.pipeline_runs(id) on delete restrict,
  external_id text not null,
  content_hash text not null check (content_hash ~ '^[a-f0-9]{64}$'),
  source_url text not null check (source_url ~ '^https://'),
  payload jsonb not null,
  fetched_at timestamptz not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (source_id, external_id, content_hash),
  check (expires_at > fetched_at)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  title_ko text not null check (char_length(title_ko) between 1 and 200),
  title_zh_tw text,
  title_en text,
  summary_zh_tw text,
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  region_code text not null,
  venue_name text,
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null check (timezone ~ '^[A-Za-z_]+/[A-Za-z0-9_+.-]+$'),
  publication_status public.event_publication_status not null default 'draft',
  lifecycle_status public.event_lifecycle_status not null default 'scheduled',
  trust_level public.data_trust_level not null default 'unverified',
  image_url text,
  image_license text,
  ticket_url text,
  tags text[] not null default '{}',
  last_verified_at timestamptz,
  published_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (publication_status <> 'published' or (published_at is not null and trust_level <> 'unverified')),
  check (image_url is null or image_license is not null)
);

create table public.event_provenance (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  source_id uuid not null references public.data_sources(id) on delete restrict,
  raw_item_id uuid references public.source_items_raw(id) on delete set null,
  external_id text not null,
  source_url text not null check (source_url ~ '^https://'),
  is_primary boolean not null default false,
  field_evidence jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (event_id, source_id, external_id)
);

create table public.platform_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.platform_role not null,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.data_review_queue (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  status public.data_review_status not null default 'pending',
  risk_flags text[] not null default '{}',
  priority smallint not null default 50 check (priority between 0 and 100),
  assigned_to uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id),
  check ((status = 'pending' and reviewed_at is null) or (status <> 'pending' and reviewed_at is not null))
);

create table public.data_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  category text not null check (category in ('incorrect', 'cancelled', 'copyright', 'unsafe', 'other')),
  details text not null check (char_length(details) between 10 and 2000),
  status public.data_report_status not null default 'open',
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('open', 'triaged') and resolved_at is null) or (status in ('resolved', 'dismissed') and resolved_at is not null))
);

create table public.event_change_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references public.trips(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  itinerary_item_id uuid references public.itinerary_items(id) on delete cascade,
  change_kind text not null check (change_kind in ('cancelled', 'postponed', 'time', 'address', 'ticket', 'other')),
  before_snapshot jsonb not null,
  after_snapshot jsonb not null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.platform_audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_table text not null,
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '180 days'),
  check (expires_at >= created_at + interval '180 days')
);

alter table public.itinerary_items
  add column source_event_id uuid references public.events(id) on delete set null,
  add column source_reference jsonb,
  add column source_snapshot jsonb,
  add column source_idempotency_key uuid,
  add column added_by uuid references auth.users(id) on delete set null;

create unique index itinerary_items_source_idempotency_idx
  on public.itinerary_items(added_by, source_idempotency_key)
  where source_idempotency_key is not null;
create index events_explore_idx on public.events(region_code, starts_at, id)
  where publication_status = 'published' and lifecycle_status = 'scheduled';
create index event_provenance_event_primary_idx on public.event_provenance(event_id, is_primary desc);
create index raw_items_expiry_idx on public.source_items_raw(expires_at);
create index review_queue_status_priority_idx on public.data_review_queue(status, priority desc, created_at);
create index reports_status_created_idx on public.data_reports(status, created_at);
create index notifications_user_unread_idx on public.event_change_notifications(user_id, created_at desc)
  where acknowledged_at is null;
create index audit_expiry_idx on public.platform_audit_logs(expires_at);

create trigger set_data_sources_updated_at before update on public.data_sources
for each row execute function public.set_updated_at();
create trigger set_events_updated_at before update on public.events
for each row execute function public.set_updated_at();
create trigger set_review_queue_updated_at before update on public.data_review_queue
for each row execute function public.set_updated_at();
create trigger set_data_reports_updated_at before update on public.data_reports
for each row execute function public.set_updated_at();

create or replace function private.has_platform_role(required_role public.platform_role)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_roles
    where user_id = (select auth.uid())
      and (role = required_role or role = 'platform_admin')
  )
$$;

revoke all on function private.has_platform_role(public.platform_role) from public;
grant execute on function private.has_platform_role(public.platform_role) to authenticated;

create or replace function public.add_event_to_itinerary(
  target_event_id uuid,
  target_trip_day_id uuid,
  target_starts_at timestamptz,
  target_duration_minutes integer,
  target_sort_key text,
  request_idempotency_key uuid
)
returns public.itinerary_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  source_event public.events;
  day_row public.trip_days;
  existing_item public.itinerary_items;
  inserted_item public.itinerary_items;
begin
  if (select auth.uid()) is null then
    raise sqlstate '42501' using message = 'Authentication required', hint = 'AUTH_REQUIRED';
  end if;

  select * into existing_item
  from public.itinerary_items
  where added_by = (select auth.uid()) and source_idempotency_key = request_idempotency_key;
  if found then
    return existing_item;
  end if;

  select * into source_event from public.events
  where id = target_event_id
    and publication_status = 'published'
    and lifecycle_status = 'scheduled'
    and ends_at >= now();
  if not found then
    raise sqlstate 'P0002' using message = 'Event is unavailable', hint = 'EVENT_UNAVAILABLE';
  end if;

  select * into day_row from public.trip_days where id = target_trip_day_id;
  if not found or not public.can_edit_trip(day_row.trip_id) then
    raise sqlstate '42501' using message = 'Trip edit permission required', hint = 'FORBIDDEN_ROLE';
  end if;

  if exists (
    select 1 from public.itinerary_items i
    where i.trip_day_id = target_trip_day_id
      and i.status <> 'cancelled'
      and tstzrange(i.starts_at, i.starts_at + make_interval(mins => i.duration_minutes), '[)')
          && tstzrange(target_starts_at, target_starts_at + make_interval(mins => target_duration_minutes), '[)')
  ) then
    raise sqlstate 'PT409' using message = 'Itinerary time conflict', hint = 'ITINERARY_TIME_CONFLICT';
  end if;

  insert into public.itinerary_items (
    trip_day_id, starts_at, duration_minutes, title, meta, type, status, sort_key,
    source_event_id, source_reference, source_snapshot, source_idempotency_key, added_by
  ) values (
    target_trip_day_id, target_starts_at, target_duration_minutes,
    coalesce(source_event.title_zh_tw, source_event.title_ko, source_event.title_en),
    coalesce(source_event.venue_name, ''), 'place', 'planned', target_sort_key,
    source_event.id,
    jsonb_build_object('event_id', source_event.id, 'canonical_key', source_event.canonical_key),
    jsonb_build_object(
      'version', source_event.version,
      'title_ko', source_event.title_ko,
      'title_zh_tw', source_event.title_zh_tw,
      'venue_name', source_event.venue_name,
      'address', source_event.address,
      'starts_at', source_event.starts_at,
      'ends_at', source_event.ends_at,
      'captured_at', now()
    ),
    request_idempotency_key,
    (select auth.uid())
  ) returning * into inserted_item;

  return inserted_item;
exception
  when unique_violation then
    select * into existing_item
    from public.itinerary_items
    where added_by = (select auth.uid()) and source_idempotency_key = request_idempotency_key;
    if found then return existing_item; end if;
    raise;
end;
$$;

revoke all on function public.add_event_to_itinerary(uuid, uuid, timestamptz, integer, text, uuid) from public, anon;
grant execute on function public.add_event_to_itinerary(uuid, uuid, timestamptz, integer, text, uuid) to authenticated;

alter table public.data_sources enable row level security;
alter table public.pipeline_runs enable row level security;
alter table public.source_items_raw enable row level security;
alter table public.events enable row level security;
alter table public.event_provenance enable row level security;
alter table public.platform_roles enable row level security;
alter table public.data_review_queue enable row level security;
alter table public.data_reports enable row level security;
alter table public.event_change_notifications enable row level security;
alter table public.platform_audit_logs enable row level security;

create policy "authenticated can read active sources" on public.data_sources
for select to authenticated using (enabled);
create policy "authenticated can explore published events" on public.events
for select to authenticated using (
  publication_status = 'published' and lifecycle_status = 'scheduled' and ends_at >= now()
);
create policy "authenticated can read published event provenance" on public.event_provenance
for select to authenticated using (
  exists (select 1 from public.events e where e.id = event_id)
);
create policy "users can read own platform roles" on public.platform_roles
for select to authenticated using (user_id = (select auth.uid()));
create policy "reviewers can read review queue" on public.data_review_queue
for select to authenticated using ((select private.has_platform_role('data_reviewer')));
create policy "reviewers can update review queue" on public.data_review_queue
for update to authenticated
using ((select private.has_platform_role('data_reviewer')))
with check ((select private.has_platform_role('data_reviewer')));
create policy "users can create own data reports" on public.data_reports
for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "users can read own data reports" on public.data_reports
for select to authenticated using (
  reporter_id = (select auth.uid()) or (select private.has_platform_role('data_reviewer'))
);
create policy "reviewers can update data reports" on public.data_reports
for update to authenticated
using ((select private.has_platform_role('data_reviewer')))
with check ((select private.has_platform_role('data_reviewer')));
create policy "users can read own event notifications" on public.event_change_notifications
for select to authenticated using (
  user_id = (select auth.uid()) and public.can_read_trip(trip_id)
);
create policy "users can acknowledge own event notifications" on public.event_change_notifications
for update to authenticated
using (user_id = (select auth.uid()) and public.can_read_trip(trip_id))
with check (user_id = (select auth.uid()) and public.can_read_trip(trip_id));
create policy "platform admins can read audit logs" on public.platform_audit_logs
for select to authenticated using ((select private.has_platform_role('platform_admin')));

revoke all on table public.data_sources, public.pipeline_runs, public.source_items_raw,
  public.events, public.event_provenance, public.platform_roles, public.data_review_queue,
  public.data_reports, public.event_change_notifications, public.platform_audit_logs
from anon, authenticated;
grant select on table public.data_sources, public.events, public.event_provenance to authenticated;
grant select on table public.platform_roles, public.data_review_queue, public.platform_audit_logs to authenticated;
grant select, insert, update on table public.data_reports to authenticated;
grant select, update on table public.event_change_notifications to authenticated;

grant all on table public.data_sources, public.pipeline_runs, public.source_items_raw,
  public.events, public.event_provenance, public.platform_roles, public.data_review_queue,
  public.data_reports, public.event_change_notifications, public.platform_audit_logs
to service_role;
grant usage, select on sequence public.platform_audit_logs_id_seq to service_role;

comment on table public.source_items_raw is 'Service-boundary raw ingestion data; purge after expires_at and never expose payload to clients.';
comment on table public.platform_audit_logs is 'Platform administration audit records retained for at least 180 days.';
comment on function public.add_event_to_itinerary(uuid, uuid, timestamptz, integer, text, uuid)
is 'Adds an available published event to an editable trip day with immutable source reference/snapshot, conflict detection, and per-user idempotency.';
