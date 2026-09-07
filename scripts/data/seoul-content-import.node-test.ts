import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCrossSourceVerificationManifest, buildGooglePlacesMatchingPlan, buildGooglePlacesQueryPlan, buildSeoulImportPlan, buildTourApiMatchingPlan, normalizedPlaceName, reviewRiskFlags, validateSeoulDataset, writeSeoulImportPlan } from './seoul-content-import.js';

class FakeDb {
  tables = { data_sources: [], pipeline_runs: [], source_items_raw: [], canonical_places: [], place_provenance: [], data_review_queue: [] };
  nextId = 1;
  id() { return `00000000-0000-0000-0000-${String(this.nextId++).padStart(12, '0')}`; }
  async insert(table, rows) {
    const row = rows[0]; const records = this.tables[table];
    const keys = table === 'data_sources' ? ['code'] : table === 'pipeline_runs' ? ['source_id', 'idempotency_key', 'attempt'] : table === 'source_items_raw' ? ['source_id', 'external_id', 'content_hash'] : table === 'canonical_places' ? ['canonical_key'] : table === 'place_provenance' ? ['place_id', 'source_id', 'external_id'] : table === 'data_review_queue' ? ['place_id'] : [];
    const existing = records.find((candidate) => keys.length && keys.every((key) => candidate[key] === row[key]));
    if (existing) return [];
    const saved = { id: this.id(), ...row }; records.push(saved); return [saved];
  }
  async select(table, filter) {
    const records = this.tables[table];
    const match = (row, key) => !filter.includes(`${key}=eq.`) || filter.includes(encodeURIComponent(String(row[key]))) || filter.includes(String(row[key]));
    if (table === 'pipeline_runs') return records.filter((row) => match(row, 'source_id') && match(row, 'idempotency_key')).sort((a, b) => b.attempt - a.attempt);
    if (table === 'data_sources') return records.filter((row) => match(row, 'code'));
    if (table === 'source_items_raw') return records.filter((row) => match(row, 'source_id') && match(row, 'external_id') && match(row, 'content_hash'));
    if (table === 'canonical_places') return records.filter((row) => match(row, 'canonical_key'));
    if (table === 'place_provenance') return records.filter((row) => match(row, 'place_id') && match(row, 'source_id') && match(row, 'external_id'));
    if (table === 'data_review_queue') return records.filter((row) => match(row, 'place_id'));
    return records;
  }
  async patch(table, filter, row) { const record = this.tables[table].find((candidate) => filter.includes(candidate.id)); Object.assign(record, row); return [record]; }
}

function place(index, trustLevel = 'official', source = 'https://english.visitseoul.net/place') {
  return {
    canonical_key: `manual:kr:seoul:place-${index}`, name_ko: `장소 ${index}`, name_zh_tw: `地點 ${index}`, name_en: `Place ${index}`,
    description_zh_tw: '測試候選', category: 'heritage', country_code: 'KR', region_code: 'SEOUL',
    address_ko: null, address_zh_tw: '首爾', address_en: null, lat: null, lng: null, phone: null,
    website_url: source, opening_hours: null, publication_status: 'draft', trust_level: trustLevel,
    image_url: null, image_license: null, last_verified_at: '2026-09-03T00:00:00Z',
  };
}

function dataset(overrides = {}) {
  const places = Array.from({ length: 120 }, (_, index) => place(index + 1, index < 12 ? 'official' : index < 57 ? 'verified' : 'unverified', index < 45 ? 'https://english.visitseoul.net/place' : null));
  return { places, ...overrides };
}

test('normalizes multilingual place names for duplicate detection', () => {
  assert.equal(normalizedPlaceName(' 경복궁! '), '경복궁');
});

test('validates the strict 120-row draft contract and rejects duplicate identities', () => {
  assert.equal(validateSeoulDataset(dataset()).valid, true);
  const input = dataset(); input.places[1].canonical_key = input.places[0].canonical_key;
  assert.ok(validateSeoulDataset(input).errors.some((error) => error.includes('duplicate_canonical_key')));
});

test('risk flags preserve missing coordinates, image license, source, and unverified trust', () => {
  assert.deepEqual(reviewRiskFlags(place(1, 'unverified', null)), ['missing_coordinates', 'missing_image_license', 'missing_source_url', 'unverified_source']);
});

test('plan prioritizes traceable official and verified rows and quarantines missing sources', () => {
  const plan = buildSeoulImportPlan(dataset());
  assert.deepEqual(plan.counts, { total: 120, accepted: 45, quarantined: 75, official: 12, verified: 45, unverified: 63, acceptedOfficial: 12, acceptedVerified: 33, acceptedUnverified: 0 });
  assert.ok(plan.accepted.every((row) => row.place.publication_status === 'draft' && row.review.status === 'pending'));
  assert.ok(plan.accepted.every((row) => row.place.image_url === null && row.place.image_license === null));
  assert.equal(plan.accepted[0].place.trust_level, 'official');
});

test('plan hashes raw evidence and creates provenance without guessing coordinates', () => {
  const plan = buildSeoulImportPlan(dataset()); const row = plan.accepted[0];
  assert.match(row.contentHash, /^[a-f0-9]{64}$/);
  assert.equal(row.provenance.external_id, row.place.canonical_key);
  assert.equal(row.place.lat, null); assert.equal(row.place.lng, null);
  assert.ok(row.review.risk_flags.includes('missing_coordinates'));
});

test('TourAPI matching accepts only a unique official title, Seoul address, contentid, and WGS84 coordinates', () => {
  const input = dataset(); const target = input.places[0];
  const match = { contentid: '1234', title: target.name_ko, addr1: '서울특별시 종로구', mapy: '37.57', mapx: '126.98' };
  const plan = buildTourApiMatchingPlan(input, [match]);
  assert.equal(plan.counts.accepted, 1); assert.equal(plan.counts.quarantined, 119);
  assert.deepEqual(plan.accepted[0].tourApi, { contentid: '1234', sourceUrl: 'https://apis.data.go.kr/B551011/KorService2/detailCommon2?contentId=1234', lat: 37.57, lng: 126.98, titleKo: target.name_ko, addressKo: '서울특별시 종로구' });
  assert.equal(plan.accepted[0].canonicalKey, 'tourapi:place:1234'); assert.equal(plan.accepted[0].publicationStatus, 'draft');
});

test('TourAPI matching quarantines name-only collisions, non-Seoul addresses, and missing coordinates', () => {
  const input = dataset(); const target = input.places[0];
  const collision = { contentid: '1', title: target.name_ko, addr1: '서울특별시', mapy: '37.57', mapx: '126.98' };
  const duplicate = { ...collision, contentid: '2' };
  const plan = buildTourApiMatchingPlan(input, [collision, duplicate]);
  assert.equal(plan.counts.accepted, 0); assert.ok(plan.quarantined.some((row) => row.canonicalKey === target.canonical_key && row.reason === 'ambiguous_tourapi_match'));
  const invalid = buildTourApiMatchingPlan(input, [{ ...collision, addr1: '부산광역시', mapy: null }]);
  assert.equal(invalid.counts.accepted, 0);
});

test('TourAPI matching never admits an attachment row quarantined for missing HTTPS source evidence', () => {
  const input = dataset(); const quarantined = input.places[45];
  const otherwiseCompatible = { contentid: '9999', title: quarantined.name_ko, addr1: '서울특별시 중구', mapy: '37.56', mapx: '126.99' };
  const plan = buildTourApiMatchingPlan(input, [otherwiseCompatible]);
  assert.equal(plan.counts.accepted, 0);
  assert.deepEqual(plan.quarantined.find((row) => row.canonicalKey === quarantined.canonical_key), { canonicalKey: quarantined.canonical_key, reason: 'attachment_quarantined_missing_source_url' });
});

test('Google Places matching accepts only a unique Korean title, Seoul address, place ID, and coordinates', () => {
  const input = dataset(); const target = input.places[0];
  const match = { id: 'ChIJ-test', displayName: { text: target.name_ko }, formattedAddress: '서울특별시 종로구', location: { latitude: 37.57, longitude: 126.98 } };
  const plan = buildGooglePlacesMatchingPlan(input, [match]);
  assert.equal(plan.counts.accepted, 1); assert.equal(plan.counts.quarantined, 119);
  assert.deepEqual(plan.accepted[0].googlePlaces, { placeId: 'ChIJ-test', lat: 37.57, lng: 126.98, title: target.name_ko, address: '서울특별시 종로구' });
  assert.equal(plan.accepted[0].canonicalKey, 'google-places:place:ChIJ-test');
  assert.equal(plan.accepted[0].publicationStatus, 'draft');
});

test('Google Places matching treats duplicate rows for one place ID as one deterministic candidate', () => {
  const input = dataset(); const target = input.places[0];
  const match = { id: 'ChIJ-same', displayName: { text: target.name_ko }, formattedAddress: '서울특별시 종로구', location: { latitude: 37.57, longitude: 126.98 } };
  const plan = buildGooglePlacesMatchingPlan(input, [match, { ...match }]);
  assert.equal(plan.counts.accepted, 1); assert.equal(plan.accepted[0].googlePlaces.placeId, 'ChIJ-same');
});
test('Google Places query v2 prefers a traceable Seoul address and retains a bounded Seoul fallback', () => {
  const target = place(1, 'official', 'https://english.visitseoul.net/place');
  target.address_ko = '서울특별시 종로구 사직로 161';
  assert.deepEqual(buildGooglePlacesQueryPlan(target), [
    { textQuery: '장소 1 서울특별시 종로구 사직로 161', languageCode: 'ko', maxResultCount: 5 },
    { textQuery: '장소 1 Seoul South Korea', languageCode: 'ko', maxResultCount: 5 },
  ]);
  target.address_ko = null;
  assert.deepEqual(buildGooglePlacesQueryPlan(target), [
    { textQuery: '장소 1 Seoul South Korea', languageCode: 'ko', maxResultCount: 5 },
  ]);
});

test('cross-source manifest requires one primary HTTPS proof and sanitizes optional community corroboration', () => {
  const input = dataset(); const target = input.places[0];
  const candidate = { id: 'ChIJ-cross', displayName: { text: target.name_ko }, formattedAddress: '서울특별시 종로구', location: { latitude: 37.57, longitude: 126.98 } };
  const evidence = [{
    googlePlaceId: 'ChIJ-cross', primaryEvidence: { kind: 'official', url: 'https://example.kr/venue' },
    communityListing: { url: 'https://community.example/venue', nameAgrees: true, seoulAddressAgrees: true, phoneLastFourAgrees: false, review: 'do not retain', photos: ['do not retain'] },
  }];
  const manifest = buildCrossSourceVerificationManifest(input, [candidate], evidence);
  assert.equal(manifest.counts.accepted, 1);
  assert.deepEqual(manifest.accepted[0].verification, {
    googlePlaceId: 'ChIJ-cross', primaryEvidence: { kind: 'official', url: 'https://example.kr/venue' },
    communityCorroboration: { url: 'https://community.example/venue', nameAgrees: true, seoulAddressAgrees: true, phoneLastFourAgrees: false },
    publicationStatus: 'draft', reviewStatus: 'pending',
  });
  assert.equal(JSON.stringify(manifest).includes('do not retain'), false);
  assert.equal(buildCrossSourceVerificationManifest(input, [candidate], []).counts.accepted, 0);
  assert.ok(buildCrossSourceVerificationManifest(input, [candidate], [{ googlePlaceId: 'ChIJ-cross', primaryEvidence: { kind: 'official', url: 'http://example.kr' } }]).quarantined.some((row) => row.reason === 'missing_primary_https_evidence'));
});

test('cross-source manifest preserves the original evidence quarantine and fails closed on conflicting primary proofs', () => {
  const input = dataset(); const candidate = { id: 'ChIJ-ambiguous-proof', displayName: { text: input.places[0].name_ko }, formattedAddress: '서울특별시', location: { latitude: 37.57, longitude: 126.98 } };
  const evidence = [
    { googlePlaceId: candidate.id, primaryEvidence: { kind: 'official', url: 'https://official.example/venue' } },
    { googlePlaceId: candidate.id, primaryEvidence: { kind: 'merchant', url: 'https://merchant.example/venue' } },
  ];
  const ambiguous = buildCrossSourceVerificationManifest(input, [candidate], evidence);
  assert.ok(ambiguous.quarantined.some((row) => row.reason === 'ambiguous_primary_evidence'));
  const blocked = buildCrossSourceVerificationManifest(input, [{ ...candidate, displayName: { text: input.places[45].name_ko } }], evidence);
  assert.deepEqual(blocked.quarantined.find((row) => row.canonicalKey === input.places[45].canonical_key), { canonicalKey: input.places[45].canonical_key, reason: 'attachment_quarantined_missing_source_url' });
});
test('Google Places matching quarantines incomplete, non-Seoul, ambiguous, and source-evidence-invalid records', () => {
  const input = dataset(); const target = input.places[0];
  const candidate = { id: 'ChIJ-one', displayName: { text: target.name_ko }, formattedAddress: '서울특별시', location: { latitude: 37.57, longitude: 126.98 } };
  assert.equal(buildGooglePlacesMatchingPlan(input, [{ ...candidate, id: '' }]).counts.accepted, 0);
  assert.equal(buildGooglePlacesMatchingPlan(input, [{ ...candidate, formattedAddress: '부산광역시' }]).counts.accepted, 0);
  assert.ok(buildGooglePlacesMatchingPlan(input, [candidate, { ...candidate, id: 'ChIJ-two' }]).quarantined.some((row) => row.reason === 'ambiguous_google_places_match'));
  const quarantined = input.places[45];
  const boundary = buildGooglePlacesMatchingPlan(input, [{ ...candidate, displayName: { text: quarantined.name_ko } }]);
  assert.deepEqual(boundary.quarantined.find((row) => row.canonicalKey === quarantined.canonical_key), { canonicalKey: quarantined.canonical_key, reason: 'attachment_quarantined_missing_source_url' });
});

test('server-side writer preserves draft, raw, provenance, review, and idempotent replay', async () => {
  const db = new FakeDb(); const plan = buildSeoulImportPlan(dataset());
  const first = await writeSeoulImportPlan({ db, plan, idempotencyKey: 'seoul-attachment-20260904' });
  assert.equal(first.status, 'succeeded');
  if (first.status === 'idempotent_replay') throw new Error('first writer invocation must succeed');
  assert.equal(first.metrics.placesInserted, 45); assert.equal(first.metrics.reviewQueued, 45);
  assert.equal(db.tables.canonical_places.length, 45); assert.ok(db.tables.canonical_places.every((row) => row.publication_status === 'draft'));
  assert.equal(db.tables.source_items_raw.length, 45); assert.equal(db.tables.place_provenance.length, 45); assert.equal(db.tables.data_review_queue.length, 45);
  const replay = await writeSeoulImportPlan({ db, plan, idempotencyKey: 'seoul-attachment-20260904' });
  assert.equal(replay.status, 'idempotent_replay'); assert.equal(db.tables.canonical_places.length, 45); assert.equal(db.tables.data_review_queue.length, 45);
});

test('server-side writer marks active runs failed without copying a sensitive dependency error', async () => {
  const db = new FakeDb(); const originalInsert = db.insert.bind(db);
  db.insert = async (table, rows) => {
    if (table === 'canonical_places') throw new Error('dependency rejected credential=service-role-secret');
    return originalInsert(table, rows);
  };
  await assert.rejects(() => writeSeoulImportPlan({ db, plan: buildSeoulImportPlan(dataset()), idempotencyKey: 'seoul-failure-20260904' }));
  assert.ok(db.tables.pipeline_runs.length > 0);
  assert.ok(db.tables.pipeline_runs.every((row) => row.status === 'failed'));
  assert.ok(db.tables.pipeline_runs.every((row) => row.error_code === 'SEOUL_ATTACHMENT_IMPORT_FAILED'));
  assert.ok(db.tables.pipeline_runs.every((row) => !row.error_summary.includes('service-role-secret')));
});
