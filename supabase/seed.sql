insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  phone_change, phone_change_token, email_change_token_current,
  reauthentication_token, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000101', 'authenticated', 'authenticated', 'owner@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000102', 'authenticated', 'authenticated', 'admin@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000103', 'authenticated', 'authenticated', 'editor@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000104', 'authenticated', 'authenticated', 'viewer@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false)
on conflict (id) do nothing;

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000101', '{"sub":"00000000-0000-0000-0000-000000000101","email":"owner@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000102', '{"sub":"00000000-0000-0000-0000-000000000102","email":"admin@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000103', '{"sub":"00000000-0000-0000-0000-000000000103","email":"editor@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104', '00000000-0000-0000-0000-000000000104', '{"sub":"00000000-0000-0000-0000-000000000104","email":"viewer@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now())
on conflict (provider_id, provider) do nothing;

insert into public.trips (id, owner_id, title, destination, timezone, start_date, end_date, default_pace, currency)
values ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', '首爾 5D4N', 'Seoul, Korea', 'Asia/Seoul', '2026-10-09', '2026-10-13', 'balanced', 'KRW')
on conflict (id) do nothing;

insert into public.trip_members (trip_id, user_id, display_name, role)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Dior', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'Morgan', 'admin'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000103', 'Kai', 'editor'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000104', 'Rin', 'viewer')
on conflict (trip_id, user_id) do nothing;

insert into public.trip_days (id, trip_id, date, title, sort_key)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-10-09', 'Day 1 Arrival', 'a0'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '2026-10-10', 'Day 2 Seoul Classic', 'b0'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '2026-10-11', 'Day 3 Markets', 'c0'),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', '2026-10-12', 'Day 4 Slow Day', 'd0'),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', '2026-10-13', 'Day 5 Departure', 'e0')
on conflict (id) do nothing;

update public.trips
set current_day_id = '20000000-0000-0000-0000-000000000002'
where id = '10000000-0000-0000-0000-000000000001';

insert into public.places (id, trip_id, name, category, region, travel_minutes, suggested_duration_minutes, rating, address, lat, lng)
values
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Bukchon Hanok Village', 'heritage', 'Jongno-gu', 18, 90, 4.5, '37 Gyedong-gil, Jongno-gu, Seoul', 37.582604, 126.983998),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Gyeongbokgung Palace', 'heritage', 'Jongno-gu', 12, 120, 4.6, '161 Sajik-ro, Jongno-gu, Seoul', 37.579617, 126.977041),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Gwangjang Market', 'food', 'Jongno-gu', 22, 75, 4.3, '88 Changgyeonggung-ro, Jongno-gu, Seoul', 37.570039, 126.999603)
on conflict (id) do nothing;

insert into public.itinerary_items (id, trip_day_id, place_id, starts_at, duration_minutes, title, meta, type, status, sort_key, fixed)
values
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '2026-10-10 09:30:00+09', 120, 'Gyeongbokgung Palace', 'Hanbok rental nearby', 'place', 'planned', 'a0', true),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '2026-10-10 13:30:00+09', 90, 'Bukchon Hanok Village', 'Keep route light after lunch', 'place', 'planned', 'b0', false),
  ('40000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '2026-10-11 11:00:00+09', 75, 'Gwangjang Market', 'Food crawl', 'place', 'planned', 'a0', false)
on conflict (id) do nothing;

insert into public.invitations (id, trip_id, email, role, token_hash, expires_at, created_by)
values ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'new-editor@example.com', 'editor', encode(sha256('local-seed-token'::bytea), 'hex'), now() + interval '14 days', '00000000-0000-0000-0000-000000000101')
on conflict (id) do nothing;
