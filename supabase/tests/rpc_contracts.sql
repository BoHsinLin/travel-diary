begin;

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

select plan(28);

create or replace function tests.as_user(user_id uuid, email text default null)
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', user_id::text, true);
  perform set_config(
    'request.jwt.claims',
    jsonb_build_object(
      'sub', user_id::text,
      'email', coalesce(email, 'test@example.com')
    )::text,
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

insert into auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-000000000105',
  'authenticated',
  'authenticated',
  'rpc-viewer@example.com',
  crypt('password', gen_salt('bf')),
  now(), now(), now()
);

insert into public.trip_members (trip_id, user_id, display_name, role)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000105',
  'RPC Viewer',
  'viewer'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000101',
  'owner@example.com'
);

select lives_ok(
  $$insert into public.invitations
      (trip_id, email, role, token_hash, expires_at, created_by)
    values
      ('10000000-0000-0000-0000-000000000001', 'viewer@example.com',
       'editor', encode(digest('accept-editor-token', 'sha256'), 'hex'),
       now() + interval '7 days', '00000000-0000-0000-0000-000000000101')$$,
  'owner can create successful invitation fixture'
);

select throws_ok(
  $$select token_hash from public.invitations limit 1$$,
  '42501'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000104',
  'viewer@example.com'
);

select lives_ok(
  $$select public.accept_trip_invitation('accept-editor-token')$$,
  'matching user can accept invitation'
);

select is(
  (select role::text from public.trip_members
   where trip_id = '10000000-0000-0000-0000-000000000001'
     and user_id = '00000000-0000-0000-0000-000000000104'),
  'editor',
  'accepted invitation upgrades membership role'
);

select lives_ok(
  $$select public.accept_trip_invitation('accept-editor-token')$$,
  'same user can safely retry accepted invitation'
);

select is(
  (select count(*) from public.trip_members
   where trip_id = '10000000-0000-0000-0000-000000000001'
     and user_id = '00000000-0000-0000-0000-000000000104'),
  1::bigint,
  'invitation retry does not duplicate membership'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000101',
  'owner@example.com'
);

select lives_ok(
  $$insert into public.invitations
      (trip_id, email, role, token_hash, expires_at, created_by)
    values
      ('10000000-0000-0000-0000-000000000001', 'admin@example.com',
       'viewer', encode(digest('lower-role-token', 'sha256'), 'hex'),
       now() + interval '7 days', '00000000-0000-0000-0000-000000000101')$$,
  'owner can create lower-role invitation fixture'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000102',
  'admin@example.com'
);

select lives_ok(
  $$select public.accept_trip_invitation('lower-role-token')$$,
  'existing admin can accept lower-role invitation'
);

select is(
  (select role::text from public.trip_members
   where trip_id = '10000000-0000-0000-0000-000000000001'
     and user_id = '00000000-0000-0000-0000-000000000102'),
  'admin',
  'lower-role invitation never downgrades membership'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000101',
  'owner@example.com'
);

select lives_ok(
  $$insert into public.invitations
      (trip_id, email, role, token_hash, expires_at, created_by, status)
    values
      ('10000000-0000-0000-0000-000000000001', 'someone@example.com',
       'editor', encode(digest('mismatch-token', 'sha256'), 'hex'),
       now() + interval '7 days', '00000000-0000-0000-0000-000000000101', 'pending'),
      ('10000000-0000-0000-0000-000000000001', 'editor@example.com',
       'viewer', encode(digest('expired-token', 'sha256'), 'hex'),
       now() - interval '1 hour', '00000000-0000-0000-0000-000000000101', 'pending'),
      ('10000000-0000-0000-0000-000000000001', 'owner@example.com',
       'viewer', encode(digest('revoked-token', 'sha256'), 'hex'),
       now() + interval '7 days', '00000000-0000-0000-0000-000000000101', 'revoked')$$,
  'owner can create invitation error fixtures'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000103',
  'editor@example.com'
);

select throws_ok(
  $$select public.accept_trip_invitation('mismatch-token')$$,
  '42501',
  'invitation email does not match current user',
  'email mismatch is rejected'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000103',
  'editor@example.com'
);

select throws_ok(
  $$select public.accept_trip_invitation('expired-token')$$,
  '22023',
  'invitation is not active',
  'expired invitation is rejected'
);

select throws_ok(
  $$select public.accept_trip_invitation('missing-token')$$,
  '02000',
  'invitation not found',
  'invalid invitation token is rejected'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000101',
  'owner@example.com'
);

select throws_ok(
  $$select public.accept_trip_invitation('revoked-token')$$,
  '22023',
  'invitation is not active',
  'revoked invitation is rejected'
);

select is(
  (select status::text from public.safe_invitations
   where email = 'editor@example.com'
     and expires_at < now()),
  'pending',
  'expired call returns an error without persisting a status change'
);

select is(
  (select status::text from public.safe_invitations
   where email = 'owner@example.com' and status = 'revoked'),
  'revoked',
  'revoked invitation status remains unchanged'
);

select is(
  (select status::text from public.safe_invitations
   where email = 'viewer@example.com' and status = 'accepted'),
  'accepted',
  'successful invitation persists accepted status'
);

select lives_ok(
  $$select public.update_trip_with_version(
      '10000000-0000-0000-0000-000000000001', 2,
      '{"title":"Versioned Trip"}'::jsonb)$$,
  'trip RPC updates matching version'
);

select is(
  (select version from public.trips
   where id = '10000000-0000-0000-0000-000000000001'),
  3,
  'trip RPC increments version'
);

select throws_ok(
  $$select public.update_trip_with_version(
      '10000000-0000-0000-0000-000000000001', 2,
      '{"title":"Stale Trip"}'::jsonb)$$,
  'PT409',
  'trip version conflict',
  'trip RPC rejects stale version'
);

select lives_ok(
  $$select public.update_trip_day_with_version(
      '20000000-0000-0000-0000-000000000002', 1,
      '{"title":"Versioned Day"}'::jsonb)$$,
  'trip day RPC updates matching version'
);

select is(
  (select version from public.trip_days
   where id = '20000000-0000-0000-0000-000000000002'),
  2,
  'trip day RPC increments version'
);

select throws_ok(
  $$select public.update_trip_day_with_version(
      '20000000-0000-0000-0000-000000000002', 1,
      '{"title":"Stale Day"}'::jsonb)$$,
  'PT409',
  'trip day version conflict',
  'trip day RPC rejects stale version'
);

select throws_ok(
  $$select public.update_itinerary_item_with_version(
      '40000000-0000-0000-0000-000000000001', 1,
      '{"sort_key":"b0"}'::jsonb)$$,
  '23505',
  'itinerary item sort key conflict',
  'itinerary RPC reports sort-key collision'
);

select tests.as_user(
  '00000000-0000-0000-0000-000000000105',
  'rpc-viewer@example.com'
);

select throws_ok(
  $$select public.update_trip_with_version(
      '10000000-0000-0000-0000-000000000001', 3,
      '{"title":"Viewer Write"}'::jsonb)$$,
  'PT409',
  'trip version conflict',
  'viewer cannot write through trip RPC'
);

select throws_ok(
  $$select public.update_trip_day_with_version(
      '20000000-0000-0000-0000-000000000002', 2,
      '{"title":"Viewer Day Write"}'::jsonb)$$,
  'PT409',
  'trip day version conflict',
  'viewer cannot write through trip day RPC'
);

select tests.as_anon();

select throws_ok(
  $$select public.accept_trip_invitation('accept-editor-token')$$,
  '42501'
);

select throws_ok(
  $$select public.update_trip_with_version(
      '10000000-0000-0000-0000-000000000001', 3,
      '{"title":"Anon Write"}'::jsonb)$$,
  '42501'
);

select * from finish();

rollback;
