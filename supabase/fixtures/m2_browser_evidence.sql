-- Local-only fixture for M2 Day 6 browser evidence. Never apply to production.
begin;

-- Remove only role rows created by the superseded browser fixture revision.
delete from public.platform_roles
where (user_id, role) in (
  ('00000000-0000-0000-0000-000000000102', 'data_reviewer'),
  ('00000000-0000-0000-0000-000000000103', 'platform_admin')
);

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  phone_change, phone_change_token, email_change_token_current,
  reauthentication_token, raw_app_meta_data, raw_user_meta_data,
  is_super_admin, created_at, updated_at, is_sso_user, is_anonymous
)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000201', 'authenticated', 'authenticated', 'reviewer@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000202', 'authenticated', 'authenticated', 'platform-admin@example.com', crypt('password', gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"email_verified":true}', false, now(), now(), false, false)
on conflict (id) do update set
  email = excluded.email,
  encrypted_password = excluded.encrypted_password,
  email_confirmed_at = excluded.email_confirmed_at,
  updated_at = now();

insert into auth.identities (
  id, provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000201', '{"sub":"00000000-0000-0000-0000-000000000201","email":"reviewer@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000202', '{"sub":"00000000-0000-0000-0000-000000000202","email":"platform-admin@example.com","email_verified":true,"phone_verified":false}', 'email', now(), now(), now())
on conflict (provider_id, provider) do update set
  identity_data = excluded.identity_data,
  updated_at = now();

insert into public.platform_roles (user_id, role, granted_by)
values
  ('00000000-0000-0000-0000-000000000201', 'data_reviewer', '00000000-0000-0000-0000-000000000202'),
  ('00000000-0000-0000-0000-000000000202', 'platform_admin', '00000000-0000-0000-0000-000000000202')
on conflict (user_id, role) do nothing;

insert into public.data_sources (
  id, code, kind, name, base_url, country_code, region_code, default_language,
  acquisition_method, terms_status, rate_limit_per_minute, trust_level, enabled,
  last_success_at
)
values (
  '71000000-0000-0000-0000-000000000001', 'm2-browser-fixture', 'official_api',
  'Korea Tourism Organization', 'https://english.visitkorea.or.kr', 'KR', 'SEOUL',
  'ko', 'api', 'approved', 60, 'official', true, now()
)
on conflict (code) do update set last_success_at = excluded.last_success_at;

insert into public.events (
  id, canonical_key, title_ko, title_zh_tw, title_en, summary_zh_tw,
  country_code, region_code, venue_name, address, starts_at, ends_at, timezone,
  publication_status, lifecycle_status, trust_level, tags, last_verified_at, published_at
)
values
  (
    '72000000-0000-0000-0000-000000000001', 'fixture:event:seoul-lantern',
    '서울빛초롱축제', '首爾燈籠節', 'Seoul Lantern Festival',
    '沿清溪川步道展出的季節燈籠活動。', 'KR', 'SEOUL', '清溪川',
    '首爾特別市鐘路區清溪川路', '2026-10-10 16:00:00+09',
    '2026-10-10 20:00:00+09', 'Asia/Seoul', 'published', 'scheduled', 'official',
    array['festival'], now(), now()
  ),
  (
    '72000000-0000-0000-0000-000000000002', 'fixture:event:review',
    '한강 문화 프로그램', '漢江文化活動', 'Han River Culture Program',
    '待審核的官方活動資料。', 'KR', 'SEOUL', '漢江公園',
    '首爾特別市永登浦區', '2026-10-12 14:00:00+09',
    '2026-10-12 16:00:00+09', 'Asia/Seoul', 'draft', 'scheduled', 'official',
    array['culture'], now(), null
  )
on conflict (id) do update set
  title_ko = excluded.title_ko,
  title_zh_tw = excluded.title_zh_tw,
  summary_zh_tw = excluded.summary_zh_tw,
  publication_status = excluded.publication_status,
  lifecycle_status = excluded.lifecycle_status,
  trust_level = excluded.trust_level,
  published_at = excluded.published_at,
  version = 1,
  last_verified_at = excluded.last_verified_at;

insert into public.canonical_places (
  id, canonical_key, name_ko, name_zh_tw, name_en, description_zh_tw, category,
  country_code, region_code, address_ko, address_zh_tw, lat, lng,
  publication_status, trust_level, last_verified_at, published_at
)
values (
  '73000000-0000-0000-0000-000000000001', 'fixture:place:seoul-forest',
  '서울숲', '首爾林', 'Seoul Forest', '位於城東區的大型城市公園。',
  'nature', 'KR', 'SEOUL', '서울특별시 성동구 뚝섬로 273',
  '首爾特別市城東區纛島路 273', 37.5444, 127.0374,
  'published', 'official', now(), now()
)
on conflict (id) do update set last_verified_at = excluded.last_verified_at;

insert into public.event_provenance (
  event_id, source_id, external_id, source_url, is_primary, observed_at
)
values
  ('72000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001',
   'fixture-event-published', 'https://english.visitkorea.or.kr', true, now()),
  ('72000000-0000-0000-0000-000000000002', '71000000-0000-0000-0000-000000000001',
   'fixture-event-review', 'https://english.visitkorea.or.kr', true, now())
on conflict (event_id, source_id, external_id) do update set observed_at = excluded.observed_at;

insert into public.place_provenance (
  place_id, source_id, external_id, source_url, is_primary, observed_at
)
values (
  '73000000-0000-0000-0000-000000000001', '71000000-0000-0000-0000-000000000001',
  'fixture-place-published', 'https://english.visitkorea.or.kr', true, now()
)
on conflict (place_id, source_id, external_id) do update set observed_at = excluded.observed_at;

delete from public.data_review_queue
where event_id = '72000000-0000-0000-0000-000000000002';

insert into public.data_review_queue (id, event_id, status, risk_flags, priority)
values (
  '75000000-0000-0000-0000-000000000001',
  '72000000-0000-0000-0000-000000000002',
  'pending', array['browser_fixture'], 90
);

insert into public.event_change_notifications (
  id, user_id, trip_id, event_id, change_kind, before_snapshot, after_snapshot
)
values (
  '74000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000101',
  '10000000-0000-0000-0000-000000000001',
  '72000000-0000-0000-0000-000000000001',
  'time', '{"starts_at":"2026-10-10T15:00:00+09:00"}',
  '{"starts_at":"2026-10-10T16:00:00+09:00"}'
)
on conflict (id) do update set acknowledged_at = null;

commit;
