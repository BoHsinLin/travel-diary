create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

alter function public.current_user_role(uuid) set schema private;
alter function public.can_read_trip(uuid) set schema private;
alter function public.can_edit_trip(uuid) set schema private;
alter function public.can_admin_trip(uuid) set schema private;
alter function public.is_trip_owner(uuid) set schema private;
alter function public.trip_id_for_day(uuid) set schema private;

revoke all on all functions in schema private from public;
grant execute on function private.current_user_role(uuid) to anon, authenticated;
grant execute on function private.can_read_trip(uuid) to anon, authenticated;
grant execute on function private.can_edit_trip(uuid) to anon, authenticated;
grant execute on function private.can_admin_trip(uuid) to anon, authenticated;
grant execute on function private.is_trip_owner(uuid) to anon, authenticated;
grant execute on function private.trip_id_for_day(uuid) to anon, authenticated;

create function public.current_user_role(target_trip_id uuid)
returns public.trip_role
language sql
stable
security invoker
set search_path = ''
as $$ select private.current_user_role(target_trip_id) $$;

create function public.can_read_trip(target_trip_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.can_read_trip(target_trip_id) $$;

create function public.can_edit_trip(target_trip_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.can_edit_trip(target_trip_id) $$;

create function public.can_admin_trip(target_trip_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.can_admin_trip(target_trip_id) $$;

create function public.is_trip_owner(target_trip_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select private.is_trip_owner(target_trip_id) $$;

create function public.trip_id_for_day(day_id uuid)
returns uuid
language sql
stable
security invoker
set search_path = ''
as $$ select private.trip_id_for_day(day_id) $$;

revoke all on function public.current_user_role(uuid) from public;
revoke all on function public.can_read_trip(uuid) from public;
revoke all on function public.can_edit_trip(uuid) from public;
revoke all on function public.can_admin_trip(uuid) from public;
revoke all on function public.is_trip_owner(uuid) from public;
revoke all on function public.trip_id_for_day(uuid) from public;
grant execute on function public.current_user_role(uuid) to anon, authenticated;
grant execute on function public.can_read_trip(uuid) to anon, authenticated;
grant execute on function public.can_edit_trip(uuid) to anon, authenticated;
grant execute on function public.can_admin_trip(uuid) to anon, authenticated;
grant execute on function public.is_trip_owner(uuid) to anon, authenticated;
grant execute on function public.trip_id_for_day(uuid) to anon, authenticated;

alter function public.accept_trip_invitation(text) set schema private;
alter function private.accept_trip_invitation(text) rename to accept_trip_invitation_impl;
revoke all on function private.accept_trip_invitation_impl(text) from public;
grant execute on function private.accept_trip_invitation_impl(text) to authenticated;

create function public.accept_trip_invitation(invitation_token text)
returns table(
  invitation_id uuid,
  trip_id uuid,
  role public.trip_role,
  status public.invitation_status
)
language sql
security invoker
set search_path = ''
as $$
  select * from private.accept_trip_invitation_impl(invitation_token)
$$;

revoke all on function public.accept_trip_invitation(text) from public;
grant execute on function public.accept_trip_invitation(text) to authenticated;

revoke all on function public.log_trip_event() from public, anon, authenticated;
revoke all on function public.assert_membership_owner_integrity() from public, anon, authenticated;

create index invitations_accepted_by_idx on public.invitations(accepted_by)
where accepted_by is not null;
create index invitations_created_by_idx on public.invitations(created_by);
create index trip_events_actor_id_idx on public.trip_events(actor_id)
where actor_id is not null;
create index trips_current_day_id_idx on public.trips(current_day_id)
where current_day_id is not null;
