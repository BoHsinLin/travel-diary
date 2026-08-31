create extension if not exists pgcrypto;

create type public.trip_role as enum ('owner', 'admin', 'editor', 'viewer');
create type public.trip_pace as enum ('very_relaxed', 'relaxed', 'balanced', 'full', 'intense');
create type public.trip_currency as enum ('KRW', 'JPY', 'TWD');
create type public.invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');
create type public.itinerary_item_type as enum ('place', 'transit');
create type public.itinerary_item_status as enum ('planned', 'confirmed', 'completed', 'cancelled');

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  destination text not null check (char_length(destination) between 1 and 120),
  timezone text not null check (timezone ~ '^[A-Za-z_]+/[A-Za-z0-9_+.-]+$'),
  start_date date not null,
  end_date date not null,
  default_pace public.trip_pace not null default 'balanced',
  currency public.trip_currency not null default 'KRW',
  current_day_id uuid,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_date <= end_date)
);

create table public.trip_members (
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.trip_role not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (trip_id, user_id)
);

create table public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  date date not null,
  title text not null check (char_length(title) between 1 and 80),
  pace_override public.trip_pace,
  sort_key text not null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, date),
  unique (trip_id, sort_key)
);

alter table public.trips
  add constraint trips_current_day_id_fkey foreign key (current_day_id)
  references public.trip_days(id) on delete set null deferrable initially deferred;

create table public.places (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (char_length(category) between 1 and 60),
  region text not null check (char_length(region) between 1 and 80),
  travel_minutes integer not null default 0 check (travel_minutes >= 0),
  suggested_duration_minutes integer not null check (suggested_duration_minutes between 15 and 1440),
  rating numeric(2,1) check (rating is null or rating between 0 and 5),
  address text,
  lat numeric(9,6),
  lng numeric(9,6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.itinerary_items (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid not null references public.trip_days(id) on delete cascade,
  place_id uuid references public.places(id) on delete set null,
  starts_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  title text not null check (char_length(title) between 1 and 160),
  meta text not null default '',
  type public.itinerary_item_type not null default 'place',
  status public.itinerary_item_status not null default 'planned',
  sort_key text not null,
  version integer not null default 1 check (version > 0),
  fixed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_day_id, sort_key)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role public.trip_role not null check (role <> 'owner'),
  token_hash text not null unique,
  status public.invitation_status not null default 'pending',
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trip_id, email)
);

create table public.trip_events (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (char_length(event_type) between 1 and 80),
  entity_table text not null check (char_length(entity_table) between 1 and 80),
  entity_id uuid not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index trips_owner_id_idx on public.trips(owner_id);
create index trip_members_user_id_idx on public.trip_members(user_id);
create index trip_days_trip_id_sort_key_idx on public.trip_days(trip_id, sort_key);
create index places_trip_id_name_idx on public.places(trip_id, name);
create index itinerary_items_day_sort_key_idx on public.itinerary_items(trip_day_id, sort_key);
create index itinerary_items_place_id_idx on public.itinerary_items(place_id);
create index invitations_trip_id_status_idx on public.invitations(trip_id, status);
create index trip_events_trip_id_created_at_idx on public.trip_events(trip_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  if tg_op = 'UPDATE' and to_jsonb(new) ? 'version' then
    new.version = old.version + 1;
  end if;
  return new;
end;
$$;

create trigger set_trips_updated_at before update on public.trips
for each row execute function public.set_updated_at();
create trigger set_trip_members_updated_at before update on public.trip_members
for each row execute function public.set_updated_at();
create trigger set_trip_days_updated_at before update on public.trip_days
for each row execute function public.set_updated_at();
create trigger set_places_updated_at before update on public.places
for each row execute function public.set_updated_at();
create trigger set_itinerary_items_updated_at before update on public.itinerary_items
for each row execute function public.set_updated_at();
create trigger set_invitations_updated_at before update on public.invitations
for each row execute function public.set_updated_at();

create or replace function public.current_user_role(target_trip_id uuid)
returns public.trip_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.trip_members
  where trip_id = target_trip_id and user_id = auth.uid()
  limit 1
$$;

create or replace function public.can_read_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role(target_trip_id) is not null
$$;

create or replace function public.can_edit_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role(target_trip_id) in ('owner', 'admin', 'editor')
$$;

create or replace function public.can_admin_trip(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role(target_trip_id) in ('owner', 'admin')
$$;

create or replace function public.is_trip_owner(target_trip_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trips
    where id = target_trip_id and owner_id = auth.uid()
  )
$$;

create or replace function public.trip_id_for_day(day_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select trip_id from public.trip_days where id = day_id
$$;

create or replace function public.log_trip_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_trip_id uuid;
begin
  target_trip_id := case tg_table_name
    when 'trips' then coalesce(new.id, old.id)
    when 'trip_members' then coalesce(new.trip_id, old.trip_id)
    when 'trip_days' then coalesce(new.trip_id, old.trip_id)
    when 'places' then coalesce(new.trip_id, old.trip_id)
    when 'itinerary_items' then public.trip_id_for_day(coalesce(new.trip_day_id, old.trip_day_id))
    when 'invitations' then coalesce(new.trip_id, old.trip_id)
  end;

  if target_trip_id is not null then
    insert into public.trip_events (trip_id, actor_id, event_type, entity_table, entity_id, payload)
    values (
      target_trip_id,
      auth.uid(),
      lower(tg_op),
      tg_table_name,
      case tg_table_name
        when 'trip_members' then coalesce(new.user_id, old.user_id)
        else coalesce(new.id, old.id)
      end,
      jsonb_build_object('new', to_jsonb(new), 'old', to_jsonb(old))
    );
  end if;

  return coalesce(new, old);
end;
$$;

create trigger log_trips_event after insert or update or delete on public.trips
for each row execute function public.log_trip_event();
create trigger log_trip_members_event after insert or update or delete on public.trip_members
for each row execute function public.log_trip_event();
create trigger log_trip_days_event after insert or update or delete on public.trip_days
for each row execute function public.log_trip_event();
create trigger log_places_event after insert or update or delete on public.places
for each row execute function public.log_trip_event();
create trigger log_itinerary_items_event after insert or update or delete on public.itinerary_items
for each row execute function public.log_trip_event();
create trigger log_invitations_event after insert or update or delete on public.invitations
for each row execute function public.log_trip_event();

alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.trip_days enable row level security;
alter table public.places enable row level security;
alter table public.itinerary_items enable row level security;
alter table public.invitations enable row level security;
alter table public.trip_events enable row level security;

create policy "members can read trips" on public.trips
for select using (public.can_read_trip(id));
create policy "authenticated users can create owned trips" on public.trips
for insert with check (auth.uid() = owner_id);
create policy "owner admin editor can update trips" on public.trips
for update using (public.can_edit_trip(id)) with check (public.can_edit_trip(id));
create policy "owners can delete trips" on public.trips
for delete using (public.current_user_role(id) = 'owner');

create policy "members can read memberships" on public.trip_members
for select using (public.can_read_trip(trip_id));
create policy "owners can insert initial self membership" on public.trip_members
for insert with check (auth.uid() = user_id and role = 'owner' and public.is_trip_owner(trip_id));
create policy "owner admin can manage memberships" on public.trip_members
for all using (public.can_admin_trip(trip_id)) with check (public.can_admin_trip(trip_id));

create policy "members can read days" on public.trip_days
for select using (public.can_read_trip(trip_id));
create policy "editors can insert days" on public.trip_days
for insert with check (public.can_edit_trip(trip_id));
create policy "editors can update days" on public.trip_days
for update using (public.can_edit_trip(trip_id)) with check (public.can_edit_trip(trip_id));
create policy "editors can delete days" on public.trip_days
for delete using (public.can_edit_trip(trip_id));

create policy "members can read places" on public.places
for select using (trip_id is null or public.can_read_trip(trip_id));
create policy "editors can insert places" on public.places
for insert with check (trip_id is not null and public.can_edit_trip(trip_id));
create policy "editors can update places" on public.places
for update using (trip_id is not null and public.can_edit_trip(trip_id)) with check (trip_id is not null and public.can_edit_trip(trip_id));
create policy "editors can delete places" on public.places
for delete using (trip_id is not null and public.can_edit_trip(trip_id));

create policy "members can read itinerary" on public.itinerary_items
for select using (public.can_read_trip(public.trip_id_for_day(trip_day_id)));
create policy "editors can insert itinerary" on public.itinerary_items
for insert with check (public.can_edit_trip(public.trip_id_for_day(trip_day_id)));
create policy "editors can update itinerary" on public.itinerary_items
for update using (public.can_edit_trip(public.trip_id_for_day(trip_day_id))) with check (public.can_edit_trip(public.trip_id_for_day(trip_day_id)));
create policy "editors can delete itinerary" on public.itinerary_items
for delete using (public.can_edit_trip(public.trip_id_for_day(trip_day_id)));

create policy "owner admin can read invitations" on public.invitations
for select using (public.can_admin_trip(trip_id));
create policy "owner admin can create invitations" on public.invitations
for insert with check (public.can_admin_trip(trip_id) and auth.uid() = created_by);
create policy "owner admin can update invitations" on public.invitations
for update using (public.can_admin_trip(trip_id)) with check (public.can_admin_trip(trip_id));
create policy "owner admin can delete invitations" on public.invitations
for delete using (public.can_admin_trip(trip_id));

create policy "members can read trip events" on public.trip_events
for select using (public.can_read_trip(trip_id));

alter publication supabase_realtime add table public.trips;
alter publication supabase_realtime add table public.trip_members;
alter publication supabase_realtime add table public.trip_days;
alter publication supabase_realtime add table public.places;
alter publication supabase_realtime add table public.itinerary_items;
alter publication supabase_realtime add table public.invitations;
alter publication supabase_realtime add table public.trip_events;
