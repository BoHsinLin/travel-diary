create or replace function private.current_user_role(target_trip_id uuid)
returns public.trip_role
language sql
stable
security definer
set search_path = ''
as $$
  select tm.role
  from public.trip_members as tm
  where tm.trip_id = target_trip_id
    and tm.user_id = (select auth.uid())
  limit 1
$$;

create or replace function private.can_read_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_role(target_trip_id) is not null
$$;

create or replace function private.can_edit_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_role(target_trip_id) in ('owner', 'admin', 'editor')
$$;

create or replace function private.can_admin_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.current_user_role(target_trip_id) in ('owner', 'admin')
$$;

create or replace function private.is_trip_owner(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.trips as t
    where t.id = target_trip_id
      and t.owner_id = (select auth.uid())
  )
$$;

create or replace function private.trip_id_for_day(day_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select td.trip_id
  from public.trip_days as td
  where td.id = day_id
$$;

create or replace function private.accept_trip_invitation_impl(invitation_token text)
returns table(
  invitation_id uuid,
  trip_id uuid,
  role public.trip_role,
  status public.invitation_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  token_digest text;
  matched public.invitations%rowtype;
  user_email text;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required'
      using errcode = '28000', hint = 'AUTH_REQUIRED';
  end if;

  token_digest := pg_catalog.encode(
    extensions.digest(invitation_token, 'sha256'),
    'hex'
  );
  user_email := pg_catalog.lower(
    coalesce(auth.jwt() ->> 'email', '')
  );

  select i.* into matched
  from public.invitations as i
  where i.token_hash = token_digest
  for update;

  if not found then
    raise exception 'invitation not found'
      using errcode = '02000', hint = 'NOT_FOUND';
  end if;

  if matched.status = 'accepted'
    and matched.accepted_by = (select auth.uid()) then
    return query
      select matched.id, matched.trip_id, matched.role, matched.status;
    return;
  end if;

  if matched.status <> 'pending' or matched.expires_at <= pg_catalog.now() then
    raise exception 'invitation is not active'
      using errcode = '22023', hint = 'VALIDATION_FAILED';
  end if;

  if pg_catalog.lower(matched.email) <> user_email then
    raise exception 'invitation email does not match current user'
      using errcode = '42501', hint = 'FORBIDDEN_ROLE';
  end if;

  insert into public.trip_members as tm (trip_id, user_id, display_name, role)
  values (
    matched.trip_id,
    (select auth.uid()),
    pg_catalog.split_part(user_email, '@', 1),
    matched.role
  )
  on conflict on constraint trip_members_pkey do update
  set
    role = case
      when case tm.role
        when 'owner' then 4
        when 'admin' then 3
        when 'editor' then 2
        else 1
      end >= case excluded.role
        when 'owner' then 4
        when 'admin' then 3
        when 'editor' then 2
        else 1
      end then tm.role
      else excluded.role
    end,
    updated_at = pg_catalog.now();

  update public.invitations as i
  set
    status = 'accepted',
    accepted_by = (select auth.uid()),
    updated_at = pg_catalog.now()
  where i.id = matched.id
  returning i.* into matched;

  return query
    select matched.id, matched.trip_id, matched.role, matched.status;
end;
$$;

drop policy if exists "owner admin can read invitations" on public.invitations;
create policy "owner admin can read invitations" on public.invitations
for select to authenticated
using (public.can_admin_trip(trip_id));

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

grant usage on schema public to anon, authenticated;

grant select on table public.trips to anon;

grant select, insert, update, delete on table public.trips to authenticated;
grant select, insert, update, delete on table public.trip_members to authenticated;
grant select, insert, update, delete on table public.trip_days to authenticated;
grant select, insert, update, delete on table public.places to authenticated;
grant select, insert, update, delete on table public.itinerary_items to authenticated;
grant insert, update, delete on table public.invitations to authenticated;
grant select (
  id, trip_id, email, role, status, expires_at,
  accepted_by, created_by, created_at, updated_at
) on table public.invitations to authenticated;
grant select on table public.trip_events to authenticated;
grant select on table public.safe_invitations to authenticated;
grant usage, select on all sequences in schema public to authenticated;

grant execute on function public.current_user_role(uuid) to anon, authenticated;
grant execute on function public.can_read_trip(uuid) to anon, authenticated;
grant execute on function public.can_edit_trip(uuid) to anon, authenticated;
grant execute on function public.can_admin_trip(uuid) to anon, authenticated;
grant execute on function public.is_trip_owner(uuid) to anon, authenticated;
grant execute on function public.trip_id_for_day(uuid) to anon, authenticated;
grant execute on function public.accept_trip_invitation(text) to authenticated;
grant execute on function public.update_trip_with_version(uuid, integer, jsonb) to authenticated;
grant execute on function public.update_trip_day_with_version(uuid, integer, jsonb) to authenticated;
grant execute on function public.update_itinerary_item_with_version(uuid, integer, jsonb) to authenticated;

revoke execute on function public.log_trip_event() from public, anon, authenticated;
revoke execute on function public.assert_membership_owner_integrity() from public, anon, authenticated;
