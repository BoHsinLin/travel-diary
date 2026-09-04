import test from 'node:test';
import assert from 'node:assert/strict';
import { dedupe, executePipeline, normalizedName, responseItems, riskFlags, sourceIdentity, toEvent, toPlace } from './tourapi-pipeline.js';

class FakeDb {
  tables = { data_sources: [], pipeline_runs: [], source_items_raw: [], events: [], canonical_places: [], event_provenance: [], place_provenance: [], data_review_queue: [] };
  nextId = 1;
  id() { return `00000000-0000-0000-0000-${String(this.nextId++).padStart(12, '0')}`; }
  async insert(table, rows) {
    const row = rows[0]; const records = this.tables[table];
    const unique = table === 'data_sources' ? ['code'] : table === 'pipeline_runs' ? ['source_id', 'idempotency_key', 'attempt'] : table === 'source_items_raw' ? ['source_id', 'external_id', 'content_hash'] : table === 'events' || table === 'canonical_places' ? ['canonical_key'] : table === 'data_review_queue' ? [row.event_id ? 'event_id' : 'place_id'] : table.includes('provenance') ? [row.event_id ? 'event_id' : 'place_id', 'source_id', 'external_id'] : [];
    const existing = records.find((record) => unique.length && unique.every((key) => record[key] === row[key]));
    if (existing) return table === 'data_sources' ? [existing] : [];
    const saved = { id: this.id(), ...row }; records.push(saved); return [saved];
  }
  async select(table, filter) {
    const records = this.tables[table];
    if (filter.includes('canonical_key=eq.')) return records.filter((row) => filter.includes(encodeURIComponent(row.canonical_key)));
    if (table === 'pipeline_runs') return records.filter((row) => filter.includes(row.source_id) && filter.includes(encodeURIComponent(row.idempotency_key))).sort((a, b) => b.attempt - a.attempt);
    if (table === 'source_items_raw') return records.filter((row) => filter.includes(row.source_id) && filter.includes(row.content_hash));
    return records;
  }
  async patch(table, filter, row) { const record = this.tables[table].find((candidate) => filter.includes(candidate.id)); Object.assign(record, row); return [record]; }
}

function payload(items) { return { response: { header: { resultCode: '0000' }, body: { items: { item: items } } } }; }
function tourFetch({ failKoreanEvents = false } = {}) {
  return async (input) => {
    const url = new URL(input); const lang = url.pathname.split('/')[2].slice(0, 3); const event = url.pathname.endsWith('/searchFestival2');
    if (event && lang === 'Kor' && failKoreanEvents) throw new Error('upstream unavailable');
    if (lang !== 'Kor') return { ok: false, status: 403, json: async () => ({}) };
    const area = url.searchParams.get('areaCode'); const type = url.searchParams.get('contentTypeId') ?? '15';
    const count = event ? 60 : 20;
    const items = Array.from({ length: count }, (_, index) => ({ contentid: `${area}-${type}-${index}`, contenttypeid: type, title: `${event ? '행사' : '장소'} ${area}-${type}-${index}`, eventstartdate: '20260902', eventenddate: '20260903', addr1: '서울특별시', mapx: '126.98', mapy: '37.57' }));
    return { ok: true, status: 200, json: async () => payload(items) };
  };
}

test('normalization produces a stable multilingual-safe comparison key', () => {
  assert.equal(normalizedName(' Seoul-Light! '), 'seoullight');
});

test('dedupe prefers TourAPI content id and falls back to normalized name plus coordinates', () => {
  assert.equal(dedupe([{ contentid: '1', title: 'A' }, { contentid: '1', title: 'A2' }, { title: 'B', mapx: '127', mapy: '37' }, { title: 'B!', mapx: '127', mapy: '37' }]).length, 2);
});

test('fallback identity is stable and prevents undefined canonical/raw collisions', () => {
  const first = { title: '서울 빛 축제', mapx: '126.98', mapy: '37.57', eventstartdate: '20260902' };
  const equivalent = { title: '서울-빛 축제!', mapx: '126.98', mapy: '37.57', eventstartdate: '20260902' };
  const other = { title: '부산 축제', mapx: '129.07', mapy: '35.18', eventstartdate: '20260902' };
  assert.equal(sourceIdentity(first), sourceIdentity(equivalent));
  assert.notEqual(sourceIdentity(first), sourceIdentity(other));
  assert.match(toEvent(first, 'SEOUL', {}).canonical_key, /^tourapi:event:fallback-[a-f0-9]{32}$/);
  assert.match(toPlace(other, 'BUSAN', {}).canonical_key, /^tourapi:place:fallback-[a-f0-9]{32}$/);
});

test('TourAPI response supports object and array item shapes', () => {
  assert.equal(responseItems({ response: { body: { items: { item: { contentid: '1' } } } } }).length, 1);
});

test('event mapping rejects an event without a valid start date', () => {
  assert.equal(toEvent({ contentid: '1', title: '행사' }, 'SEOUL', {}), null);
  assert.equal(toEvent({ contentid: '1', title: '행사', eventstartdate: 20261301 }, 'SEOUL', {}), null);
});

test('event and place mapping retain Korean, use official trust, and remain drafts', () => {
  const source = { contentid: '1', contenttypeid: '39', title: '테스트', eventstartdate: 20260901, addr1: '서울', mapx: '126.9', mapy: '37.5' };
  assert.deepEqual(toEvent(source, 'SEOUL', { zhTw: '測試', en: 'Test' }).publication_status, 'draft');
  assert.equal(toPlace(source, 'SEOUL', { zhTw: '測試', en: 'Test' }).category, 'food');
});

test('quality flags require translations, address, coordinates, and an image for review prioritization', () => {
  assert.deepEqual(riskFlags({ mapx: 'bad' }, { zhTw: null, en: null }), ['missing_translation', 'missing_address', 'missing_coordinates', 'missing_image']);
});

test('integration uses searchFestival2, enforces the 50/100 caps, and sends untranslated official data to review', async () => {
  const db = new FakeDb();
  const result = await executePipeline({ serviceKey: 'test', db, fetchImpl: tourFetch(), now: new Date('2026-09-01T00:00:00Z'), idempotencyKey: 'cap-run' });
  assert.equal(result.status, 'succeeded');
  assert.equal(result.metrics.eventsInserted, 50); assert.equal(result.metrics.placesInserted, 100);
  assert.equal(result.metrics.reviewQueued, 150); assert.equal(db.tables.events.length, 50); assert.equal(db.tables.canonical_places.length, 100);
  assert.ok(db.tables.data_review_queue.every((row) => row.risk_flags.includes('missing_translation')));
});

test('integration replays a successful key safely and records existing rows rather than false inserts on a new key', async () => {
  const db = new FakeDb();
  await executePipeline({ serviceKey: 'test', db, fetchImpl: tourFetch(), idempotencyKey: 'first' });
  const replay = await executePipeline({ serviceKey: 'test', db, fetchImpl: tourFetch(), idempotencyKey: 'first' });
  const rerun = await executePipeline({ serviceKey: 'test', db, fetchImpl: tourFetch(), idempotencyKey: 'second' });
  assert.equal(replay.status, 'idempotent_replay'); assert.equal(rerun.metrics.eventsInserted, 0); assert.equal(rerun.metrics.placesInserted, 0);
  assert.equal(rerun.metrics.eventsExisting, 50); assert.equal(rerun.metrics.placesExisting, 100); assert.equal(rerun.metrics.reviewQueued, 0);
});

test('integration marks a started run failed when the official event endpoint fails', async () => {
  const db = new FakeDb();
  await assert.rejects(() => executePipeline({ serviceKey: 'test', db, fetchImpl: tourFetch({ failKoreanEvents: true }), idempotencyKey: 'failure' }));
  assert.equal(db.tables.pipeline_runs[0].status, 'failed'); assert.equal(db.tables.pipeline_runs[0].error_code, 'TOURAPI_PIPELINE_FAILED');
});
