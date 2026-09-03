create or replace function public.redact_trip_event_row(entity_table_name text, row_data jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when row_data is null then null
    when entity_table_name = 'invitations' then row_data - 'token_hash' - 'email'
    else row_data
  end
$$;

create or replace function public.log_trip_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_trip_id uuid;
  target_entity_id uuid;
  new_row jsonb := to_jsonb(new);
  old_row jsonb := to_jsonb(old);
  effective_row jsonb;
begin
  effective_row := coalesce(new_row, old_row);

  target_trip_id := case tg_table_name
    when 'trips' then (effective_row ->> 'id')::uuid
    when 'itinerary_items' then public.trip_id_for_day((effective_row ->> 'trip_day_id')::uuid)
    else (effective_row ->> 'trip_id')::uuid
  end;

  target_entity_id := case tg_table_name
    when 'trip_members' then (effective_row ->> 'user_id')::uuid
    else (effective_row ->> 'id')::uuid
  end;

  if target_trip_id is not null then
    insert into public.trip_events (trip_id, actor_id, event_type, entity_table, entity_id, payload)
    values (
      target_trip_id,
      auth.uid(),
      lower(tg_op),
      tg_table_name,
      target_entity_id,
      jsonb_build_object(
        'new', public.redact_trip_event_row(tg_table_name, new_row),
        'old', public.redact_trip_event_row(tg_table_name, old_row)
      )
    );
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.assert_trip_current_day()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.current_day_id is not null and not exists (
    select 1
    from public.trip_days
    where id = new.current_day_id and trip_id = new.id
  ) then
    raise exception 'current_day_id must belong to the same trip'
      using errcode = '23514', hint = 'VALIDATION_FAILED';
  end if;

  return new;
end;
$$;

drop trigger if exists assert_trip_current_day on public.trips;
create constraint trigger assert_trip_current_day
after insert or update of current_day_id on public.trips
deferrable initially deferred
for each row execute function public.assert_trip_current_day();

alter function public.set_updated_at() set search_path = '';

create or replace function public.assert_membership_owner_integrity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_role public.trip_role;
  remaining_owner_count integer;
begin
  actor_role := public.current_user_role(coalesce(new.trip_id, old.trip_id));

  if tg_op = 'INSERT' and new.role = 'owner' and actor_role <> 'owner' then
    raise exception 'only an owner can create another owner membership'
      using errcode = '42501', hint = 'FORBIDDEN_ROLE';
  end if;

  if tg_op = 'UPDATE' and old.role = 'owner' and new.role <> 'owner' then
    select count(*) into remaining_owner_count
    from public.trip_members
    where trip_id = old.trip_id and role = 'owner' and user_id <> old.user_id;

    if remaining_owner_count = 0 then
      raise exception 'cannot downgrade the final owner'
        using errcode = '23514', hint = 'FORBIDDEN_ROLE';
    end if;
  end if;

  if tg_op = 'UPDATE' and old.role <> 'owner' and new.role = 'owner' and actor_role <> 'owner' then
    raise exception 'only an owner can promote a member to owner'
      using errcode = '42501', hint = 'FORBIDDEN_ROLE';
  end if;

  if tg_op = 'DELETE' and old.role = 'owner' then
    select count(*) into remaining_owner_count
    from public.trip_members
    where trip_id = old.trip_id and role = 'owner' and user_id <> old.user_id;

    if remaining_owner_count = 0 then
      raise exception 'cannot delete the final owner'
        using errcode = '23514', hint = 'FORBIDDEN_ROLE';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists assert_membership_owner_integrity on public.trip_members;
create trigger assert_membership_owner_integrity
before insert or update or delete on public.trip_members
for each row execute function public.assert_membership_owner_integrity();

drop policy if exists "owner admin can manage memberships" on public.trip_members;
drop policy if exists "owners can insert initial self membership" on public.trip_members;

create policy "authorized users can insert memberships" on public.trip_members
for insert to authenticated
with check (
  (
    (select auth.uid()) = user_id
    and role = 'owner'
    and public.is_trip_owner(trip_id)
  )
  or (
    public.can_admin_trip(trip_id)
    and (role <> 'owner' or public.current_user_role(trip_id) = 'owner')
  )
);

create policy "owner admin can update non-owner memberships" on public.trip_members
for update to authenticated
using (
  public.can_admin_trip(trip_id)
  and (role <> 'owner' or public.current_user_role(trip_id) = 'owner')
)
with check (
  public.can_admin_trip(trip_id)
  and (role <> 'owner' or public.current_user_role(trip_id) = 'owner')
);

create policy "owner admin can delete non-owner memberships" on public.trip_members
for delete to authenticated
using (
  public.can_admin_trip(trip_id)
  and (role <> 'owner' or public.current_user_role(trip_id) = 'owner')
);

drop policy if exists "authenticated users can create owned trips" on public.trips;
create policy "authenticated users can create owned trips" on public.trips
for insert to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "owner admin can read invitations" on public.invitations;
drop policy if exists "owner admin can create invitations" on public.invitations;
drop policy if exists "owner admin can update invitations" on public.invitations;
drop policy if exists "owner admin can delete invitations" on public.invitations;

create policy "owner admin can create invitations" on public.invitations
for insert to authenticated
with check (public.can_admin_trip(trip_id) and (select auth.uid()) = created_by);
create policy "owner admin can update invitations" on public.invitations
for update using (public.can_admin_trip(trip_id)) with check (public.can_admin_trip(trip_id));
create policy "owner admin can delete invitations" on public.invitations
for delete using (public.can_admin_trip(trip_id));

create or replace view public.safe_invitations
with (security_invoker = true)
as
select id, trip_id, email, role, status, expires_at, accepted_by, created_by, created_at, updated_at
from public.invitations
where public.can_admin_trip(trip_id);

grant select on public.safe_invitations to authenticated;

create or replace function public.accept_trip_invitation(invitation_token text)
returns table(invitation_id uuid, trip_id uuid, role public.trip_role, status public.invitation_status)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  token_digest text;
  matched public.invitations%rowtype;
  user_email text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '28000', hint = 'AUTH_REQUIRED';
  end if;

  token_digest := encode(digest(invitation_token, 'sha256'), 'hex');
  user_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  select * into matched
  from public.invitations
  where token_hash = token_digest
  for update;

  if not found then
    raise exception 'invitation not found' using errcode = '02000', hint = 'NOT_FOUND';
  end if;

  if matched.status = 'accepted' and matched.accepted_by = auth.uid() then
    return query select matched.id, matched.trip_id, matched.role, matched.status;
    return;
  end if;

  if matched.status <> 'pending' or matched.expires_at <= now() then
    update public.invitations
    set status = case when expires_at <= now() then 'expired'::public.invitation_status else status end
    where id = matched.id;
    raise exception 'invitation is not active' using errcode = '22023', hint = 'VALIDATION_FAILED';
  end if;

  if lower(matched.email) <> user_email then
    raise exception 'invitation email does not match current user'
      using errcode = '42501', hint = 'FORBIDDEN_ROLE';
  end if;

  insert into public.trip_members (trip_id, user_id, display_name, role)
  values (matched.trip_id, auth.uid(), split_part(user_email, '@', 1), matched.role)
  on conflict (trip_id, user_id) do update
    set role = excluded.role, updated_at = now();

  update public.invitations
  set status = 'accepted', accepted_by = auth.uid(), updated_at = now()
  where id = matched.id
  returning * into matched;

  return query select matched.id, matched.trip_id, matched.role, matched.status;
end;
$$;

grant execute on function public.accept_trip_invitation(text) to authenticated;

create or replace function public.update_trip_with_version(
  target_trip_id uuid,
  expected_version integer,
  patch jsonb
)
returns public.trips
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_row public.trips;
begin
  update public.trips
  set
    title = coalesce(patch ->> 'title', title),
    destination = coalesce(patch ->> 'destination', destination),
    timezone = coalesce(patch ->> 'timezone', timezone),
    start_date = coalesce((patch ->> 'start_date')::date, start_date),
    end_date = coalesce((patch ->> 'end_date')::date, end_date),
    default_pace = coalesce((patch ->> 'default_pace')::public.trip_pace, default_pace),
    currency = coalesce((patch ->> 'currency')::public.trip_currency, currency),
    current_day_id = coalesce((patch ->> 'current_day_id')::uuid, current_day_id)
  where id = target_trip_id
    and version = expected_version
  returning * into updated_row;

  if not found then
    raise exception 'trip version conflict' using errcode = '40001', hint = 'VERSION_CONFLICT';
  end if;

  return updated_row;
end;
$$;

create or replace function public.update_trip_day_with_version(
  target_day_id uuid,
  expected_version integer,
  patch jsonb
)
returns public.trip_days
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_row public.trip_days;
begin
  update public.trip_days
  set
    date = coalesce((patch ->> 'date')::date, date),
    title = coalesce(patch ->> 'title', title),
    pace_override = coalesce((patch ->> 'pace_override')::public.trip_pace, pace_override),
    sort_key = coalesce(patch ->> 'sort_key', sort_key)
  where id = target_day_id
    and version = expected_version
  returning * into updated_row;

  if not found then
    raise exception 'trip day version conflict' using errcode = '40001', hint = 'VERSION_CONFLICT';
  end if;

  return updated_row;
exception
  when unique_violation then
    raise exception 'trip day sort key conflict' using errcode = '23505', hint = 'SORT_KEY_CONFLICT';
end;
$$;

create or replace function public.update_itinerary_item_with_version(
  target_item_id uuid,
  expected_version integer,
  patch jsonb
)
returns public.itinerary_items
language plpgsql
security invoker
set search_path = public
as $$
declare
  updated_row public.itinerary_items;
begin
  update public.itinerary_items
  set
    trip_day_id = coalesce((patch ->> 'trip_day_id')::uuid, trip_day_id),
    place_id = coalesce((patch ->> 'place_id')::uuid, place_id),
    starts_at = coalesce((patch ->> 'starts_at')::timestamptz, starts_at),
    duration_minutes = coalesce((patch ->> 'duration_minutes')::integer, duration_minutes),
    title = coalesce(patch ->> 'title', title),
    meta = coalesce(patch ->> 'meta', meta),
    type = coalesce((patch ->> 'type')::public.itinerary_item_type, type),
    status = coalesce((patch ->> 'status')::public.itinerary_item_status, status),
    sort_key = coalesce(patch ->> 'sort_key', sort_key),
    fixed = coalesce((patch ->> 'fixed')::boolean, fixed)
  where id = target_item_id
    and version = expected_version
  returning * into updated_row;

  if not found then
    raise exception 'itinerary item version conflict' using errcode = '40001', hint = 'VERSION_CONFLICT';
  end if;

  return updated_row;
exception
  when unique_violation then
    raise exception 'itinerary item sort key conflict' using errcode = '23505', hint = 'SORT_KEY_CONFLICT';
end;
$$;

grant execute on function public.update_trip_with_version(uuid, integer, jsonb) to authenticated;
grant execute on function public.update_trip_day_with_version(uuid, integer, jsonb) to authenticated;
grant execute on function public.update_itinerary_item_with_version(uuid, integer, jsonb) to authenticated;

alter table public.places validate constraint places_category_code_check;
