create or replace function public.assert_membership_owner_integrity()
returns trigger
language plpgsql
security definer
set search_path = ''
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

  if tg_op = 'DELETE' and old.role = 'owner'
     and exists (select 1 from public.trips where id = old.trip_id) then
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

revoke all on function public.assert_membership_owner_integrity() from public;

create or replace function public.mark_trip_deleting()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('app.deleting_trip_id', old.id::text, true);
  return old;
end;
$$;

revoke all on function public.mark_trip_deleting() from public, anon, authenticated;

drop trigger if exists mark_trip_deleting on public.trips;
create trigger mark_trip_deleting
before delete on public.trips
for each row execute function public.mark_trip_deleting();

-- A trip delete event cannot outlive the trip while trip_events.trip_id has an
-- on-delete-cascade foreign key. Logging it after deletion violates that FK.
drop trigger if exists log_trips_event on public.trips;
create trigger log_trips_event
after insert or update on public.trips
for each row execute function public.log_trip_event();

create or replace function public.log_trip_event()
returns trigger
language plpgsql
security definer
set search_path = ''
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

  if target_trip_id is not null
     and target_trip_id::text is distinct from nullif(current_setting('app.deleting_trip_id', true), '')
     and exists (select 1 from public.trips where id = target_trip_id) then
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

revoke all on function public.log_trip_event() from public, anon, authenticated;
