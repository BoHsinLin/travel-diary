begin;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

select plan(18);

create or replace function tests.as_user(user_id uuid, email text default null)
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', user_id::text, true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object('sub', user_id::text, 'email', coalesce(email, 'test@example.com'))::text,
    true
  );
end;
$$;

grant execute on function tests.as_user(uuid, text) to anon, authenticated;

create or replace function tests.as_anon()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('request.jwt.claims', '{}'::text, true);
end;
$$;

grant execute on function tests.as_anon() to anon, authenticated;

select tests.as_anon();

select is((select count(*) from public.trips where id = '10000000-0000-0000-0000-000000000001'), 0::bigint, 'anonymous cannot read trips');

select throws_ok(
  $$insert into public.trip_days (trip_id, date, title, sort_key)
    values ('10000000-0000-0000-0000-000000000001', '2026-10-14', 'Anon write', 'anon0')$$,
  '42501',
  'permission denied for table trip_days',
  'anonymous cannot insert trip days'
);

select tests.as_user('00000000-0000-0000-0000-000000000101', 'owner@example.com');

select is((select count(*) from public.trips where id = '10000000-0000-0000-0000-000000000001'), 1::bigint, 'owner can read trip');

select lives_ok(
  $$update public.trips set title = 'Seoul 5D4N Owner Update' where id = '10000000-0000-0000-0000-000000000001'$$,
  'owner can update trip'
);

select lives_ok(
  $$insert into public.invitations (trip_id, email, role, token_hash, expires_at, created_by)
    values ('10000000-0000-0000-0000-000000000001', 'temp-editor@example.com', 'editor', encode(digest('temp-editor-token', 'sha256'), 'hex'), now() + interval '7 days', '00000000-0000-0000-0000-000000000101')$$,
  'owner can create invitation'
);

select ok(not exists (
  select 1 from public.trip_events
  where entity_table = 'invitations' and payload::text like '%token_hash%'
), 'invitation event payload does not include token_hash');

select ok(not exists (
  select 1 from public.trip_events
  where entity_table = 'invitations' and payload::text like '%temp-editor@example.com%'
), 'invitation event payload does not include email');

select tests.as_user('00000000-0000-0000-0000-000000000102', 'admin@example.com');

select lives_ok(
  $$insert into public.trip_days (trip_id, date, title, sort_key)
    values ('10000000-0000-0000-0000-000000000001', '2026-10-14', 'Admin Day', 'z-admin')$$,
  'admin can insert day'
);

select throws_ok(
  $$update public.trip_members
    set role = 'owner'
    where trip_id = '10000000-0000-0000-0000-000000000001'
      and user_id = '00000000-0000-0000-0000-000000000103'$$,
  '42501',
  'only an owner can promote a member to owner',
  'admin cannot promote a member to owner'
);

select tests.as_user('00000000-0000-0000-0000-000000000103', 'editor@example.com');

select lives_ok(
  $$insert into public.itinerary_items (trip_day_id, starts_at, duration_minutes, title, sort_key)
    values ('20000000-0000-0000-0000-000000000002', '2026-10-10 16:00:00+09', 60, 'Editor add', 'z-editor')$$,
  'editor can insert itinerary item'
);

select throws_ok(
  $$insert into public.invitations (trip_id, email, role, token_hash, expires_at, created_by)
    values ('10000000-0000-0000-0000-000000000001', 'editor-created@example.com', 'viewer', encode(digest('editor-created-token', 'sha256'), 'hex'), now() + interval '7 days', '00000000-0000-0000-0000-000000000103')$$,
  '42501',
  'new row violates row-level security policy for table "invitations"',
  'editor cannot create invitations'
);

select tests.as_user('00000000-0000-0000-0000-000000000104', 'viewer@example.com');

select is((select count(*) from public.trip_days where trip_id = '10000000-0000-0000-0000-000000000001'), 6::bigint, 'viewer can read trip days');

select throws_ok(
  $$insert into public.places (trip_id, name, category, region, suggested_duration_minutes)
    values ('10000000-0000-0000-0000-000000000001', 'Viewer Place', 'generic', 'Nowhere', 30)$$,
  '42501',
  'new row violates row-level security policy for table "places"',
  'viewer cannot insert places'
);

select tests.as_user('00000000-0000-0000-0000-000000000101', 'owner@example.com');

select throws_ok(
  $$update public.trip_members
    set role = 'admin'
    where trip_id = '10000000-0000-0000-0000-000000000001'
      and user_id = '00000000-0000-0000-0000-000000000101'$$,
  '23514',
  'cannot downgrade the final owner',
  'cannot downgrade final owner'
);

select throws_ok(
  $$update public.trips
    set current_day_id = '20000000-0000-0000-0000-000000000099'
    where id = '10000000-0000-0000-0000-000000000001';
    set constraints all immediate$$,
  '23503',
  'insert or update on table "trips" violates foreign key constraint "trips_current_day_id_fkey"',
  'current_day_id rejects nonexistent day'
);

insert into public.trips (id, owner_id, title, destination, timezone, start_date, end_date)
values ('10000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000101', 'Cross Trip', 'Tokyo', 'Asia/Tokyo', '2026-11-01', '2026-11-02');

insert into public.trip_members (trip_id, user_id, display_name, role)
values ('10000000-0000-0000-0000-000000000099', '00000000-0000-0000-0000-000000000101', 'Dior', 'owner');

insert into public.trip_days (id, trip_id, date, title, sort_key)
values ('20000000-0000-0000-0000-000000000099', '10000000-0000-0000-0000-000000000099', '2026-11-01', 'Other Day', 'a0');

select throws_ok(
  $$update public.trips
    set current_day_id = '20000000-0000-0000-0000-000000000099'
    where id = '10000000-0000-0000-0000-000000000001';
    set constraints all immediate$$,
  '23514',
  'current_day_id must belong to the same trip',
  'current_day_id rejects a day from another trip'
);

select lives_ok(
  $$select public.update_itinerary_item_with_version('40000000-0000-0000-0000-000000000001', 1, '{"title":"Versioned update"}'::jsonb)$$,
  'expected-version itinerary RPC updates matching version'
);

select throws_ok(
  $$select public.update_itinerary_item_with_version('40000000-0000-0000-0000-000000000001', 1, '{"title":"Stale update"}'::jsonb)$$,
  'PT409',
  'itinerary item version conflict',
  'expected-version itinerary RPC reports VERSION_CONFLICT'
);

select * from finish();

rollback;
