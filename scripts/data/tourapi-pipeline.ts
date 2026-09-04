import { createHash } from 'node:crypto';

const TOUR_API_BASE = 'https://apis.data.go.kr/B551011';
const SEOUL = '1';
const BUSAN = '6';
const EVENT_TYPE = '15';
const PLACE_TYPES = ['12', '14', '28', '38', '39'];

export function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function normalizedName(value = '') {
  return value.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}_]+/gu, '');
}

export function sourceIdentity(item) {
  const contentId = String(item.contentid ?? '').trim();
  if (contentId) return contentId;
  const fallback = {
    name: normalizedName(String(item.title ?? '')),
    lat: String(item.mapy ?? '').trim(),
    lng: String(item.mapx ?? '').trim(),
  };
  return `fallback-${sha256(fallback).slice(0, 32)}`;
}

function officialSourceUrl(item, kind) {
  const contentId = String(item.contentid ?? '').trim();
  if (contentId) return `${TOUR_API_BASE}/KorService2/detailCommon2?contentId=${encodeURIComponent(contentId)}`;
  return `${TOUR_API_BASE}/KorService2/${kind === 'event' ? 'searchFestival2' : 'areaBasedList2'}`;
}

export function toSeoulIso(yyyymmdd, endOfDay = false) {
  const value = String(yyyymmdd ?? '');
  if (!/^\d{8}$/.test(value)) return null;
  const year = value.slice(0, 4); const month = value.slice(4, 6); const day = value.slice(6, 8);
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (date.getFullYear() !== Number(year) || date.getMonth() !== Number(month) - 1 || date.getDate() !== Number(day)) return null;
  return `${year}-${month}-${day}T${endOfDay ? '23:59:59' : '00:00:00'}+09:00`;
}

export function responseItems(payload) {
  const items = payload?.response?.body?.items?.item ?? payload?.response?.body?.items ?? [];
  return Array.isArray(items) ? items : [items];
}

export function dedupe(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = sourceIdentity(item);
    if (!item.title || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

function safeCoordinate(value, min, max) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max ? numeric : null;
}

export function riskFlags(item, translations) {
  const flags = [];
  if (!translations.zhTw || !translations.en) flags.push('missing_translation');
  if (!item.addr1) flags.push('missing_address');
  if (safeCoordinate(item.mapy, 33, 39) === null || safeCoordinate(item.mapx, 124, 132) === null) flags.push('missing_coordinates');
  if (!item.firstimage && !item.firstimage2) flags.push('missing_image');
  return flags;
}

export function toEvent(item, regionCode, translations) {
  const startsAt = toSeoulIso(item.eventstartdate);
  const endsAt = toSeoulIso(item.eventenddate || item.eventstartdate, true);
  if (!startsAt || !endsAt || endsAt < startsAt) return null;
  return {
    canonical_key: `tourapi:event:${sourceIdentity(item)}`,
    title_ko: item.title.trim(), title_zh_tw: translations.zhTw ?? null, title_en: translations.en ?? null,
    country_code: 'KR', region_code: regionCode, venue_name: item.addr1 ?? null, address: item.addr1 ?? null,
    lat: safeCoordinate(item.mapy, 33, 39), lng: safeCoordinate(item.mapx, 124, 132),
    starts_at: startsAt, ends_at: endsAt, timezone: 'Asia/Seoul', publication_status: 'draft',
    lifecycle_status: 'scheduled', trust_level: 'official', tags: ['tourapi', 'official', 'event'],
    last_verified_at: new Date().toISOString(),
  };
}

export function placeCategory(contentType) {
  return ({ 12: 'heritage', 14: 'museum', 28: 'activity', 38: 'shopping', 39: 'food' })[String(contentType)] ?? 'generic';
}

export function toPlace(item, regionCode, translations) {
  return {
    canonical_key: `tourapi:place:${sourceIdentity(item)}`,
    name_ko: item.title.trim(), name_zh_tw: translations.zhTw ?? null, name_en: translations.en ?? null,
    category: placeCategory(item.contenttypeid), country_code: 'KR', region_code: regionCode,
    address_ko: item.addr1 ?? null, lat: safeCoordinate(item.mapy, 33, 39), lng: safeCoordinate(item.mapx, 124, 132),
    publication_status: 'draft', trust_level: 'official', last_verified_at: new Date().toISOString(),
  };
}

function assertEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required; the pipeline fails closed before making any write.`);
  return value;
}

class Postgrest {
  url: string;
  headers: Record<string, string>;
  constructor(url, key) { this.url = `${url.replace(/\/$/, '')}/rest/v1`; this.headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }; }
  async request(path, options: RequestInit = {}) {
    const response = await fetch(`${this.url}/${path}`, { ...options, headers: { ...this.headers, ...(options.headers ?? {}) } });
    const body = await response.text();
    if (!response.ok) throw new Error(`PostgREST ${response.status} ${path}: ${body}`);
    return body ? JSON.parse(body) : null;
  }
  select(table, filter) { return this.request(`${table}?${filter}`, { headers: { Accept: 'application/json' } }); }
  insert(table, rows, onConflict, resolution = 'ignore-duplicates') { return this.request(`${table}${onConflict ? `?on_conflict=${onConflict}` : ''}`, { method: 'POST', headers: { Prefer: `return=representation,resolution=${resolution}` }, body: JSON.stringify(rows) }); }
  patch(table, filter, row) { return this.request(`${table}?${filter}`, { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(row) }); }
}

function seoulDate(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(value).replaceAll('-', '');
}

function eventWindow(now: Date) {
  const end = new Date(now); end.setUTCDate(end.getUTCDate() + 365);
  return { eventStartDate: seoulDate(now), eventEndDate: seoulDate(end) };
}

async function tourApiList(serviceKey, language, areaCode, contentTypeId, kind, fetchImpl, now) {
  const event = kind === 'event';
  const endpoint = `${TOUR_API_BASE}/${language}Service2/${event ? 'searchFestival2' : 'areaBasedList2'}`;
  const query = new URLSearchParams({ serviceKey, MobileOS: 'ETC', MobileApp: 'TravelDiary', _type: 'json', areaCode, ...(event ? eventWindow(now) : { contentTypeId }), numOfRows: '100', pageNo: '1', arrange: 'C' });
  const response = await fetchImpl(`${endpoint}?${query}`);
  if (!response.ok) throw new Error(`TourAPI ${response.status} for ${language}/${areaCode}/${contentTypeId}`);
  const payload = await response.json();
  if (String(payload?.response?.header?.resultCode) !== '0000') throw new Error(`TourAPI error: ${payload?.response?.header?.resultMsg ?? 'unknown'}`);
  return responseItems(payload);
}

async function fetchSegment(serviceKey, areaCode, contentTypeId, kind, fetchImpl, now) {
  const ko = await tourApiList(serviceKey, 'Kor', areaCode, contentTypeId, kind, fetchImpl, now);
  // A data.go.kr key may be approved for KorService2 before Cht/Eng. Translation
  // absence is a review risk, not a reason to discard otherwise official evidence.
  const [chtResult, engResult] = await Promise.allSettled([
    tourApiList(serviceKey, 'Cht', areaCode, contentTypeId, kind, fetchImpl, now),
    tourApiList(serviceKey, 'Eng', areaCode, contentTypeId, kind, fetchImpl, now),
  ]);
  const cht = chtResult.status === 'fulfilled' ? chtResult.value : [];
  const eng = engResult.status === 'fulfilled' ? engResult.value : [];
  const lookup = (items) => new Map(items.map((item) => [String(item.contentid), item.title]).filter(([, title]) => title));
  const zh = lookup(cht); const en = lookup(eng);
  return ko.map((item) => ({ item, translations: { zhTw: zh.get(String(item.contentid)) ?? null, en: en.get(String(item.contentid)) ?? null } }));
}

async function ensureSource(db) {
  const rows = await db.insert('data_sources', [{ code: 'tourapi-kto', kind: 'official_api', name: 'Korea Tourism Organization TourAPI 4.0', base_url: TOUR_API_BASE, country_code: 'KR', region_code: null, default_language: 'ko', acquisition_method: 'api', terms_status: 'approved', rate_limit_per_minute: 60, trust_level: 'official', enabled: true }], 'code', 'merge-duplicates');
  return rows[0];
}

async function createRun(db, sourceId, idempotencyKey, triggerKind) {
  const existing = await db.select('pipeline_runs', `source_id=eq.${sourceId}&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&order=attempt.desc&limit=1`);
  if (existing[0]?.status === 'succeeded') return { run: existing[0], replayed: true };
  const attempt = (existing[0]?.attempt ?? 0) + 1;
  const rows = await db.insert('pipeline_runs', [{ source_id: sourceId, trigger_kind: triggerKind, status: 'running', idempotency_key: idempotencyKey, attempt }]);
  return { run: rows[0], replayed: false };
}

async function storeRaw(db, sourceId, runId, externalId, sourceUrl, payload) {
  const hash = sha256(payload); const now = new Date(); const expires = new Date(now.getTime() + 30 * 86400_000);
  const rows = await db.insert('source_items_raw', [{ source_id: sourceId, pipeline_run_id: runId, external_id: String(externalId), content_hash: hash, source_url: sourceUrl, payload, fetched_at: now.toISOString(), expires_at: expires.toISOString() }], 'source_id,external_id,content_hash');
  if (rows[0]) return { row: rows[0], created: true };
  const existing = await db.select('source_items_raw', `source_id=eq.${sourceId}&external_id=eq.${encodeURIComponent(externalId)}&content_hash=eq.${hash}&limit=1`);
  return { row: existing[0], created: false };
}

async function insertCandidate(db, target, sourceId, raw, externalId, sourceUrl, flags) {
  const table = target.kind === 'event' ? 'events' : 'canonical_places';
  const rows = await db.insert(table, [target.row], 'canonical_key');
  const entity = rows[0] ?? (await db.select(table, `canonical_key=eq.${encodeURIComponent(target.row.canonical_key)}&limit=1`))[0];
  if (!entity) throw new Error(`Unable to resolve ${target.kind} canonical key after insert.`);
  const idColumn = target.kind === 'event' ? 'event_id' : 'place_id';
  const provenanceTable = target.kind === 'event' ? 'event_provenance' : 'place_provenance';
  await db.insert(provenanceTable, [{ [idColumn]: entity.id, source_id: sourceId, raw_item_id: raw.id, external_id: String(externalId), source_url: sourceUrl, is_primary: true, observed_at: raw.fetched_at, field_evidence: { title: target.row.title_ko ?? target.row.name_ko, address: target.row.address ?? target.row.address_ko, coordinates: [target.row.lat, target.row.lng], translations: target.translations } }], `${idColumn},source_id,external_id`);
  return { entity, created: Boolean(rows[0]), reviewQueued: Boolean((await db.insert('data_review_queue', [{ [idColumn]: entity.id, risk_flags: flags, priority: Math.min(100, 50 + flags.length * 10) }], idColumn))[0]) };
}

export async function executePipeline({ serviceKey, db, triggerKind = 'manual', idempotencyKey, fetchImpl = fetch, now = new Date() }: any) {
  if (!['manual', 'scheduled', 'retry'].includes(triggerKind)) throw new Error('DATA_TRIGGER_KIND must be manual, scheduled, or retry.');
  const source = await ensureSource(db); const key = idempotencyKey ?? `tourapi-${seoulDate(now)}`;
  const created = await createRun(db, source.id, key, triggerKind);
  if (created.replayed) return { status: 'idempotent_replay', runId: created.run.id, metrics: created.run.metrics };
  const metrics = { fetched: 0, rawStored: 0, rawExisting: 0, eventsProcessed: 0, eventsInserted: 0, eventsExisting: 0, placesProcessed: 0, placesInserted: 0, placesExisting: 0, reviewQueued: 0, reviewExisting: 0, skippedInvalid: 0 };
  try {
    const [seoulEvents, busanEvents, ...placeSegments] = await Promise.all([
      fetchSegment(serviceKey, SEOUL, EVENT_TYPE, 'event', fetchImpl, now), fetchSegment(serviceKey, BUSAN, EVENT_TYPE, 'event', fetchImpl, now),
      ...[SEOUL, BUSAN].flatMap((area) => PLACE_TYPES.map((type) => fetchSegment(serviceKey, area, type, 'place', fetchImpl, now))),
    ]);
    const events = dedupe([...seoulEvents, ...busanEvents].map((entry) => entry.item)).slice(0, 50);
    const allPlaces = placeSegments.flat().filter(({ item }) => item.title);
    const placeIds = new Set(); const places = allPlaces.filter(({ item }) => { const key2 = sourceIdentity(item); if (placeIds.has(key2)) return false; placeIds.add(key2); return true; }).slice(0, 100);
    for (const item of events) {
      const externalId = sourceIdentity(item);
      const sourceUrl = officialSourceUrl(item, 'event');
      const raw = await storeRaw(db, source.id, created.run.id, externalId, sourceUrl, item); raw.created ? metrics.rawStored += 1 : metrics.rawExisting += 1;
      const translations = [...seoulEvents, ...busanEvents].find((entry) => sourceIdentity(entry.item) === externalId)?.translations ?? { zhTw: null, en: null };
      metrics.eventsProcessed += 1;
      const row = toEvent(item, item.areacode === BUSAN ? 'BUSAN' : 'SEOUL', translations); if (!row) { metrics.skippedInvalid += 1; continue; }
      const candidate = await insertCandidate(db, { kind: 'event', row, translations }, source.id, raw.row, externalId, sourceUrl, riskFlags(item, translations)); candidate.created ? metrics.eventsInserted += 1 : metrics.eventsExisting += 1; candidate.reviewQueued ? metrics.reviewQueued += 1 : metrics.reviewExisting += 1;
    }
    for (const { item, translations } of places) {
      const externalId = sourceIdentity(item);
      const sourceUrl = officialSourceUrl(item, 'place');
      const raw = await storeRaw(db, source.id, created.run.id, externalId, sourceUrl, item); raw.created ? metrics.rawStored += 1 : metrics.rawExisting += 1;
      const row = toPlace(item, item.areacode === BUSAN ? 'BUSAN' : 'SEOUL', translations);
      metrics.placesProcessed += 1;
      const candidate = await insertCandidate(db, { kind: 'place', row, translations }, source.id, raw.row, externalId, sourceUrl, riskFlags(item, translations)); candidate.created ? metrics.placesInserted += 1 : metrics.placesExisting += 1; candidate.reviewQueued ? metrics.reviewQueued += 1 : metrics.reviewExisting += 1;
    }
    metrics.fetched = events.length + places.length;
    await db.patch('pipeline_runs', `id=eq.${created.run.id}`, { status: 'succeeded', finished_at: new Date().toISOString(), metrics });
    await db.patch('data_sources', `id=eq.${source.id}`, { last_success_at: new Date().toISOString() });
    return { status: 'succeeded', runId: created.run.id, metrics };
  } catch (error) {
    await db.patch('pipeline_runs', `id=eq.${created.run.id}`, { status: 'failed', finished_at: new Date().toISOString(), error_code: 'TOURAPI_PIPELINE_FAILED', error_summary: String(error).slice(0, 1000), metrics });
    await db.patch('data_sources', `id=eq.${source.id}`, { last_failure_at: new Date().toISOString() });
    throw error;
  }
}

export async function run() {
  const serviceKey = assertEnv('TOURAPI_SERVICE_KEY'); const db = new Postgrest(assertEnv('SUPABASE_URL'), assertEnv('SUPABASE_SERVICE_ROLE_KEY'));
  const triggerKind = process.env.DATA_TRIGGER_KIND ?? 'manual';
  const result = await executePipeline({ serviceKey, db, triggerKind, idempotencyKey: process.env.PIPELINE_IDEMPOTENCY_KEY });
  console.log(JSON.stringify(result));
  return result;
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) run().catch((error) => { console.error(error.message); process.exitCode = 1; });
