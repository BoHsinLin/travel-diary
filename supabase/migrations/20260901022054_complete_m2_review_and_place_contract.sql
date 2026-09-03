create table public.canonical_places (
  id uuid primary key default gen_random_uuid(),
  canonical_key text not null unique,
  name_ko text not null check (char_length(name_ko) between 1 and 200),
  name_zh_tw text,
  name_en text,
  description_zh_tw text,
  category text not null check (category in (
    'heritage', 'food', 'neighborhood', 'cafe', 'shopping', 'nature', 'museum',
    'activity', 'hotel', 'airport', 'flight', 'train', 'subway', 'bus', 'walk',
    'taxi', 'ferry', 'ticket', 'reservation', 'generic'
  )),
  country_code char(2) not null check (country_code ~ '^[A-Z]{2}$'),
  region_code text not null,
  address_ko text,
  address_zh_tw text,
  address_en text,
  lat numeric(9,6),
  lng numeric(9,6),
  phone text,
  website_url text check (website_url is null or website_url ~ '^https://'),
  opening_hours jsonb,
  publication_status public.event_publication_status not null default 'draft',
  trust_level public.data_trust_level not null default 'unverified',
  image_url text,
  image_license text,
  last_verified_at timestamptz,
  published_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((lat is null and lng is null) or (lat is not null and lng is not null)),
  check (publication_status <> 'published' or (published_at is not null and trust_level <> 'unverified')),
  check (image_url is null or image_license is not null)
);

create table public.place_provenance (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.canonical_places(id) on delete cascade,
  source_id uuid not null references public.data_sources(id) on delete restrict,
  raw_item_id uuid references public.source_items_raw(id) on delete set null,
  external_id text not null,
  source_url text not null check (source_url ~ '^https://'),
  is_primary boolean not null default false,
  field_evidence jsonb not null default '{}'::jsonb,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (place_id, source_id, external_id)
);

alter table public.data_review_queue
  alter column event_id drop not null,
  add column place_id uuid references public.canonical_places(id) on delete cascade,
  add constraint data_review_queue_exactly_one_target_check check (
    (event_id is not null and place_id is null) or
    (event_id is null and place_id is not null)
  );

create unique index data_review_queue_place_id_key
  on public.data_review_queue(place_id) where place_id is not null;
create index canonical_places_explore_idx
  on public.canonical_places(region_code, category, name_zh_tw, id)
  where publication_status = 'published';
create index place_provenance_place_primary_idx
  on public.place_provenance(place_id, is_primary desc);

create trigger set_canonical_places_updated_at before update on public.canonical_places
for each row execute function public.set_updated_at();

alter table public.canonical_places enable row level security;
alter table public.place_provenance enable row level security;

create policy "authenticated can explore published canonical places" on public.canonical_places
for select to authenticated using (publication_status = 'published');
create policy "reviewers can read canonical place drafts" on public.canonical_places
for select to authenticated using ((select private.has_platform_role('data_reviewer')));
create policy "authenticated can read published place provenance" on public.place_provenance
for select to authenticated using (
  exists (select 1 from public.canonical_places p where p.id = place_id)
);
create policy "reviewers can read all place provenance" on public.place_provenance
for select to authenticated using ((select private.has_platform_role('data_reviewer')));

create policy "reviewers can read event drafts" on public.events
for select to authenticated using ((select private.has_platform_role('data_reviewer')));
create policy "reviewers can read all event provenance" on public.event_provenance
for select to authenticated using ((select private.has_platform_role('data_reviewer')));

grant select on table public.canonical_places, public.place_provenance to authenticated;
grant select, update on table public.data_review_queue to authenticated;
grant all on table public.canonical_places, public.place_provenance to service_role;

create or replace function private.write_platform_audit(
  audit_action text,
  audit_entity_table text,
  audit_entity_id uuid,
  audit_detail jsonb default '{}'::jsonb
)
returns void
language sql
volatile
security definer
set search_path = ''
as $$
  insert into public.platform_audit_logs(actor_id, action, entity_table, entity_id, detail)
  values ((select auth.uid()), audit_action, audit_entity_table, audit_entity_id, coalesce(audit_detail, '{}'::jsonb))
$$;

revoke all on function private.write_platform_audit(text, text, uuid, jsonb) from public;

create or replace function private.set_platform_role_impl(
  target_user_id uuid,
  target_role public.platform_role,
  should_grant boolean,
  reason text
)
returns public.platform_roles
language plpgsql
security definer
set search_path = ''
as $$
declare
  result_row public.platform_roles;
begin
  if not private.has_platform_role('platform_admin') then
    raise sqlstate '42501' using message = 'Platform admin permission required', hint = 'PLATFORM_ADMIN_REQUIRED';
  end if;
  if reason is null or char_length(btrim(reason)) < 5 then
    raise sqlstate '22023' using message = 'Role change reason is required', hint = 'ROLE_REASON_REQUIRED';
  end if;

  if should_grant then
    insert into public.platform_roles(user_id, role, granted_by)
    values (target_user_id, target_role, (select auth.uid()))
    on conflict (user_id, role) do update
      set granted_by = excluded.granted_by, granted_at = now()
    returning * into result_row;
  else
    if target_role = 'platform_admin' and exists (
      select 1 from public.platform_roles
      where role = 'platform_admin' and user_id = target_user_id
    ) and (select count(*) from public.platform_roles where role = 'platform_admin') <= 1 then
      raise sqlstate '23514' using message = 'Cannot revoke the final platform admin', hint = 'LAST_PLATFORM_ADMIN';
    end if;
    delete from public.platform_roles
    where user_id = target_user_id and role = target_role
    returning * into result_row;
  end if;

  perform private.write_platform_audit(
    case when should_grant then 'platform_role.grant' else 'platform_role.revoke' end,
    'platform_roles', target_user_id,
    jsonb_build_object('role', target_role, 'reason', reason)
  );
  return result_row;
end;
$$;

revoke all on function private.set_platform_role_impl(uuid, public.platform_role, boolean, text) from public;
grant execute on function private.set_platform_role_impl(uuid, public.platform_role, boolean, text) to authenticated;

create or replace function public.set_platform_role(
  target_user_id uuid,
  target_role public.platform_role,
  should_grant boolean,
  reason text
)
returns public.platform_roles
language sql
security invoker
set search_path = ''
as $$
  select private.set_platform_role_impl(target_user_id, target_role, should_grant, reason)
$$;

revoke all on function public.set_platform_role(uuid, public.platform_role, boolean, text) from public, anon;
grant execute on function public.set_platform_role(uuid, public.platform_role, boolean, text) to authenticated;

create or replace function private.update_data_draft_impl(
  target_kind text,
  target_id uuid,
  expected_version integer,
  patch jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  result_json jsonb;
begin
  if not private.has_platform_role('data_reviewer') then
    raise sqlstate '42501' using message = 'Data reviewer permission required', hint = 'DATA_REVIEWER_REQUIRED';
  end if;
  if patch is null or patch = '{}'::jsonb then
    raise sqlstate '22023' using message = 'Patch is required', hint = 'PATCH_REQUIRED';
  end if;

  if target_kind = 'event' then
    if patch - array['title_ko','title_zh_tw','title_en','summary_zh_tw','venue_name','address','starts_at','ends_at','timezone','image_url','image_license','ticket_url','tags'] <> '{}'::jsonb then
      raise sqlstate '22023' using message = 'Patch contains immutable event fields', hint = 'IMMUTABLE_FIELD';
    end if;
    update public.events e set
      title_ko = coalesce(patch->>'title_ko', e.title_ko),
      title_zh_tw = case when patch ? 'title_zh_tw' then patch->>'title_zh_tw' else e.title_zh_tw end,
      title_en = case when patch ? 'title_en' then patch->>'title_en' else e.title_en end,
      summary_zh_tw = case when patch ? 'summary_zh_tw' then patch->>'summary_zh_tw' else e.summary_zh_tw end,
      venue_name = case when patch ? 'venue_name' then patch->>'venue_name' else e.venue_name end,
      address = case when patch ? 'address' then patch->>'address' else e.address end,
      starts_at = coalesce((patch->>'starts_at')::timestamptz, e.starts_at),
      ends_at = coalesce((patch->>'ends_at')::timestamptz, e.ends_at),
      timezone = coalesce(patch->>'timezone', e.timezone),
      image_url = case when patch ? 'image_url' then patch->>'image_url' else e.image_url end,
      image_license = case when patch ? 'image_license' then patch->>'image_license' else e.image_license end,
      ticket_url = case when patch ? 'ticket_url' then patch->>'ticket_url' else e.ticket_url end,
      tags = case when patch ? 'tags' then array(select jsonb_array_elements_text(patch->'tags')) else e.tags end
    where e.id = target_id and e.version = expected_version and e.publication_status in ('draft','review','rejected')
    returning to_jsonb(e.*) into result_json;
  elsif target_kind = 'place' then
    if patch - array['name_ko','name_zh_tw','name_en','description_zh_tw','category','address_ko','address_zh_tw','address_en','lat','lng','phone','website_url','opening_hours','image_url','image_license'] <> '{}'::jsonb then
      raise sqlstate '22023' using message = 'Patch contains immutable place fields', hint = 'IMMUTABLE_FIELD';
    end if;
    update public.canonical_places p set
      name_ko = coalesce(patch->>'name_ko', p.name_ko),
      name_zh_tw = case when patch ? 'name_zh_tw' then patch->>'name_zh_tw' else p.name_zh_tw end,
      name_en = case when patch ? 'name_en' then patch->>'name_en' else p.name_en end,
      description_zh_tw = case when patch ? 'description_zh_tw' then patch->>'description_zh_tw' else p.description_zh_tw end,
      category = coalesce(patch->>'category', p.category),
      address_ko = case when patch ? 'address_ko' then patch->>'address_ko' else p.address_ko end,
      address_zh_tw = case when patch ? 'address_zh_tw' then patch->>'address_zh_tw' else p.address_zh_tw end,
      address_en = case when patch ? 'address_en' then patch->>'address_en' else p.address_en end,
      lat = case when patch ? 'lat' then (patch->>'lat')::numeric else p.lat end,
      lng = case when patch ? 'lng' then (patch->>'lng')::numeric else p.lng end,
      phone = case when patch ? 'phone' then patch->>'phone' else p.phone end,
      website_url = case when patch ? 'website_url' then patch->>'website_url' else p.website_url end,
      opening_hours = case when patch ? 'opening_hours' then patch->'opening_hours' else p.opening_hours end,
      image_url = case when patch ? 'image_url' then patch->>'image_url' else p.image_url end,
      image_license = case when patch ? 'image_license' then patch->>'image_license' else p.image_license end
    where p.id = target_id and p.version = expected_version and p.publication_status in ('draft','review','rejected')
    returning to_jsonb(p.*) into result_json;
  else
    raise sqlstate '22023' using message = 'Unknown data target kind', hint = 'UNKNOWN_TARGET_KIND';
  end if;

  if result_json is null then
    raise sqlstate 'PT409' using message = 'Draft version conflict or immutable state', hint = 'VERSION_CONFLICT';
  end if;
  perform private.write_platform_audit('data_draft.update', target_kind, target_id, jsonb_build_object('fields', patch));
  return result_json;
end;
$$;

revoke all on function private.update_data_draft_impl(text, uuid, integer, jsonb) from public;
grant execute on function private.update_data_draft_impl(text, uuid, integer, jsonb) to authenticated;

create or replace function public.update_data_draft(target_kind text, target_id uuid, expected_version integer, patch jsonb)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.update_data_draft_impl(target_kind, target_id, expected_version, patch) $$;

revoke all on function public.update_data_draft(text, uuid, integer, jsonb) from public, anon;
grant execute on function public.update_data_draft(text, uuid, integer, jsonb) to authenticated;

create or replace function private.review_data_item_impl(
  target_kind text,
  target_id uuid,
  decision text,
  notes text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  queue_row public.data_review_queue;
  result_json jsonb;
begin
  if not private.has_platform_role('data_reviewer') then
    raise sqlstate '42501' using message = 'Data reviewer permission required', hint = 'DATA_REVIEWER_REQUIRED';
  end if;
  if decision not in ('approve','reject','publish') then
    raise sqlstate '22023' using message = 'Unknown review decision', hint = 'UNKNOWN_REVIEW_DECISION';
  end if;

  select * into queue_row from public.data_review_queue q
  where (target_kind = 'event' and q.event_id = target_id)
     or (target_kind = 'place' and q.place_id = target_id)
  for update;
  if not found then
    raise sqlstate 'P0002' using message = 'Review queue item not found', hint = 'REVIEW_ITEM_NOT_FOUND';
  end if;

  if decision = 'publish' and queue_row.status <> 'approved' then
    raise sqlstate '23514' using message = 'Approval is required before publish', hint = 'REVIEW_APPROVAL_REQUIRED';
  end if;

  if decision in ('approve','reject') then
    update public.data_review_queue set
      status = case when decision = 'approve' then 'approved'::public.data_review_status else 'rejected'::public.data_review_status end,
      reviewed_by = (select auth.uid()), review_notes = notes, reviewed_at = now()
    where id = queue_row.id;
  end if;

  if target_kind = 'event' then
    update public.events e set
      publication_status = case decision
        when 'approve' then 'review'::public.event_publication_status
        when 'reject' then 'rejected'::public.event_publication_status
        else 'published'::public.event_publication_status end,
      published_at = case when decision = 'publish' then now() else e.published_at end
    where e.id = target_id
    returning to_jsonb(e.*) into result_json;
  elsif target_kind = 'place' then
    update public.canonical_places p set
      publication_status = case decision
        when 'approve' then 'review'::public.event_publication_status
        when 'reject' then 'rejected'::public.event_publication_status
        else 'published'::public.event_publication_status end,
      published_at = case when decision = 'publish' then now() else p.published_at end
    where p.id = target_id
    returning to_jsonb(p.*) into result_json;
  else
    raise sqlstate '22023' using message = 'Unknown data target kind', hint = 'UNKNOWN_TARGET_KIND';
  end if;

  if result_json is null then
    raise sqlstate 'P0002' using message = 'Data item not found', hint = 'DATA_ITEM_NOT_FOUND';
  end if;
  perform private.write_platform_audit(
    'data_review.' || decision, target_kind, target_id,
    jsonb_build_object('review_queue_id', queue_row.id, 'notes', notes)
  );
  return result_json;
end;
$$;

revoke all on function private.review_data_item_impl(text, uuid, text, text) from public;
grant execute on function private.review_data_item_impl(text, uuid, text, text) to authenticated;

create or replace function public.review_data_item(target_kind text, target_id uuid, decision text, notes text default null)
returns jsonb
language sql
security invoker
set search_path = ''
as $$ select private.review_data_item_impl(target_kind, target_id, decision, notes) $$;

revoke all on function public.review_data_item(text, uuid, text, text) from public, anon;
grant execute on function public.review_data_item(text, uuid, text, text) to authenticated;

comment on table public.canonical_places is 'Global multilingual external place entity; separate from trip-scoped public.places.';
comment on function public.set_platform_role(uuid, public.platform_role, boolean, text)
is 'Platform-admin-only grant/revoke RPC. Every successful role change writes a 180-day audit record.';
comment on function public.update_data_draft(text, uuid, integer, jsonb)
is 'Reviewer-only allow-listed Event/Place draft editor with optimistic version checking and audit.';
comment on function public.review_data_item(text, uuid, text, text)
is 'Reviewer-only approve/reject/publish workflow. Publish requires a prior approved review queue state.';
