import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const TRUST_LEVELS = ['official', 'verified', 'unverified'];
const CATEGORIES = [
  'heritage', 'food', 'neighborhood', 'cafe', 'shopping', 'nature', 'museum',
  'activity', 'hotel', 'airport', 'flight', 'train', 'subway', 'bus', 'walk',
  'taxi', 'ferry', 'ticket', 'reservation', 'generic',
];

type SeoulWriteMetrics = {
  accepted: number; quarantined: number; rawStored: number; rawExisting: number;
  placesInserted: number; placesExisting: number; provenanceStored: number;
  provenanceExisting: number; reviewQueued: number; reviewExisting: number;
};

export type SeoulWriteResult =
  | { status: 'idempotent_replay'; metrics: Pick<SeoulWriteMetrics, 'accepted' | 'quarantined'> }
  | { status: 'succeeded'; metrics: SeoulWriteMetrics };

function sha256(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function isBlank(value) {
  return value === null || value === undefined || value === '';
}

function validHttps(value) {
  if (typeof value !== 'string') return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

export function normalizedPlaceName(value = '') {
  return String(value).normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}_]+/gu, '');
}

export function validateSeoulDataset(input) {
  const places = Array.isArray(input?.places) ? input.places : [];
  const errors = [];
  const seenKeys = new Set();
  const seenKoreanNames = new Set();
  const allowedFields = new Set([
    'canonical_key', 'name_ko', 'name_zh_tw', 'name_en', 'description_zh_tw',
    'category', 'country_code', 'region_code', 'address_ko', 'address_zh_tw',
    'address_en', 'lat', 'lng', 'phone', 'website_url', 'opening_hours',
    'publication_status', 'trust_level', 'image_url', 'image_license', 'last_verified_at',
  ]);
  if (places.length !== 120) errors.push(`expected_120_rows:${places.length}`);

  places.forEach((place, index) => {
    const row = index + 1;
    const unknown = Object.keys(place).filter((key) => !allowedFields.has(key));
    if (unknown.length) errors.push(`row_${row}:unknown_fields:${unknown.join(',')}`);
    for (const field of ['canonical_key', 'name_ko', 'name_zh_tw', 'name_en', 'description_zh_tw', 'category', 'country_code', 'region_code', 'publication_status', 'trust_level', 'last_verified_at']) {
      if (isBlank(place[field])) errors.push(`row_${row}:missing_${field}`);
    }
    if (!/^manual:kr:seoul:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(place.canonical_key ?? ''))) errors.push(`row_${row}:invalid_canonical_key`);
    if (seenKeys.has(place.canonical_key)) errors.push(`row_${row}:duplicate_canonical_key`); else seenKeys.add(place.canonical_key);
    const koreanName = normalizedPlaceName(place.name_ko);
    if (seenKoreanNames.has(koreanName)) errors.push(`row_${row}:duplicate_name_ko`); else seenKoreanNames.add(koreanName);
    if (!CATEGORIES.includes(place.category)) errors.push(`row_${row}:invalid_category`);
    if (place.country_code !== 'KR' || place.region_code !== 'SEOUL') errors.push(`row_${row}:invalid_region`);
    if (place.publication_status !== 'draft') errors.push(`row_${row}:not_draft`);
    if (!TRUST_LEVELS.includes(place.trust_level)) errors.push(`row_${row}:invalid_trust_level`);
    if (isBlank(place.lat) !== isBlank(place.lng)) errors.push(`row_${row}:partial_coordinates`);
    if (!isBlank(place.lat) && (!(Number(place.lat) >= 33 && Number(place.lat) <= 39) || !(Number(place.lng) >= 124 && Number(place.lng) <= 132))) errors.push(`row_${row}:invalid_coordinates`);
    if (!isBlank(place.website_url) && !validHttps(place.website_url)) errors.push(`row_${row}:invalid_website_url`);
    if (!isBlank(place.image_url) && (isBlank(place.image_license) || !validHttps(place.image_url))) errors.push(`row_${row}:unlicensed_or_invalid_image`);
    if (Number.isNaN(Date.parse(place.last_verified_at))) errors.push(`row_${row}:invalid_last_verified_at`);
  });
  return { valid: errors.length === 0, errors };
}

export function reviewRiskFlags(place) {
  const flags = [];
  if (isBlank(place.lat) || isBlank(place.lng)) flags.push('missing_coordinates');
  if (isBlank(place.address_ko) && isBlank(place.address_zh_tw) && isBlank(place.address_en)) flags.push('missing_address');
  if (isBlank(place.image_url) || isBlank(place.image_license)) flags.push('missing_image_license');
  if (!validHttps(place.website_url)) flags.push('missing_source_url');
  if (place.trust_level === 'unverified') flags.push('unverified_source');
  return flags;
}

function tourApiCoordinate(value, min, max) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= min && numeric <= max ? numeric : null;
}

function seoulAddress(value = '') {
  return /서울|seoul/i.test(String(value));
}

/**
 * Bounded, deterministic Google Places query policy. A traceable Seoul address
 * makes the first query more specific; the existing Seoul-wide query is a
 * fallback only when that precise query finds no compatible candidate.
 */
export function buildGooglePlacesQueryPlan(place: any) {
  const name = String(place?.name_ko ?? '').trim();
  if (!name) throw new Error('Google Places query requires name_ko.');
  const sourceAddress = String(place?.address_ko ?? '').trim();
  const queries = seoulAddress(sourceAddress)
    ? [`${name} ${sourceAddress}`, `${name} Seoul South Korea`]
    : [`${name} Seoul South Korea`];
  return [...new Set(queries)].map((textQuery) => ({ textQuery, languageCode: 'ko', maxResultCount: 5 }));
}

/** Pure matching plan: callers supply already-fetched official TourAPI candidates. */
export function buildTourApiMatchingPlan(input, tourApiCandidates) {
  const validation = validateSeoulDataset(input);
  if (!validation.valid) throw new Error(`Invalid Seoul dataset: ${validation.errors.join(';')}`);
  const accepted = []; const quarantined = [];
  for (const place of input.places) {
    if (reviewRiskFlags(place).includes('missing_source_url')) {
      quarantined.push({ canonicalKey: place.canonical_key, reason: 'attachment_quarantined_missing_source_url' });
      continue;
    }
    const candidates = (tourApiCandidates ?? []).filter((item) => normalizedPlaceName(item?.title) === normalizedPlaceName(place.name_ko));
    const compatible = candidates.filter((item) => {
      const id = String(item?.contentid ?? '').trim();
      const lat = tourApiCoordinate(item?.mapy, 33, 39); const lng = tourApiCoordinate(item?.mapx, 124, 132);
      return Boolean(id) && lat !== null && lng !== null && seoulAddress(item?.addr1);
    });
    if (compatible.length !== 1) {
      quarantined.push({ canonicalKey: place.canonical_key, reason: compatible.length ? 'ambiguous_tourapi_match' : 'missing_or_incompatible_tourapi_match' });
      continue;
    }
    const item = compatible[0]; const lat = tourApiCoordinate(item.mapy, 33, 39); const lng = tourApiCoordinate(item.mapx, 124, 132);
    accepted.push({
      attachmentCanonicalKey: place.canonical_key,
      canonicalKey: `tourapi:place:${String(item.contentid).trim()}`,
      tourApi: { contentid: String(item.contentid).trim(), sourceUrl: `https://apis.data.go.kr/B551011/KorService2/detailCommon2?contentId=${encodeURIComponent(String(item.contentid).trim())}`, lat, lng, titleKo: item.title.trim(), addressKo: item.addr1 },
      attachmentProvenance: { externalId: place.canonical_key, sourceUrl: place.website_url ?? null, trustLevel: place.trust_level },
      publicationStatus: 'draft', reviewStatus: 'pending', riskFlags: reviewRiskFlags(place),
    });
  }
  return { accepted, quarantined, counts: { total: input.places.length, accepted: accepted.length, quarantined: quarantined.length } };
}

/** Pure matching plan: callers supply already-fetched Google Places API (New) candidates. */
function googlePlacesCompatibleCandidates(place: any, googlePlacesCandidates: any[] = []) {
  const candidates: any[] = googlePlacesCandidates.filter((item) => normalizedPlaceName(item?.displayName?.text) === normalizedPlaceName(place.name_ko));
  const valid = candidates.filter((item) => {
    const id = String(item?.id ?? '').trim();
    const lat = tourApiCoordinate(item?.location?.latitude, 33, 39); const lng = tourApiCoordinate(item?.location?.longitude, 124, 132);
    return Boolean(id) && lat !== null && lng !== null && seoulAddress(item?.formattedAddress);
  });
  // A repeated API row for the same immutable Google place_id is one candidate;
  // different place IDs are ambiguous, regardless of result ordering.
  return [...new Map<string, any>(valid.map((item) => [String(item.id).trim(), item])).entries()]
    .sort(([left], [right]) => left.localeCompare(right)).map(([, item]) => item);
}

export function buildGooglePlacesMatchingPlan(input, googlePlacesCandidates) {
  const validation = validateSeoulDataset(input);
  if (!validation.valid) throw new Error(`Invalid Seoul dataset: ${validation.errors.join(';')}`);
  const accepted = []; const quarantined = [];
  for (const place of input.places) {
    if (reviewRiskFlags(place).includes('missing_source_url')) {
      quarantined.push({ canonicalKey: place.canonical_key, reason: 'attachment_quarantined_missing_source_url' });
      continue;
    }
    const compatible = googlePlacesCompatibleCandidates(place, googlePlacesCandidates);
    if (compatible.length !== 1) {
      quarantined.push({ canonicalKey: place.canonical_key, reason: compatible.length ? 'ambiguous_google_places_match' : 'missing_or_incompatible_google_places_match' });
      continue;
    }
    const item = compatible[0]; const id = String(item.id).trim();
    accepted.push({
      attachmentCanonicalKey: place.canonical_key,
      canonicalKey: `google-places:place:${id}`,
      googlePlaces: {
        placeId: id,
        lat: tourApiCoordinate(item.location.latitude, 33, 39),
        lng: tourApiCoordinate(item.location.longitude, 124, 132),
        title: item.displayName.text.trim(),
        address: item.formattedAddress,
      },
      attachmentProvenance: { externalId: place.canonical_key, sourceUrl: place.website_url ?? null, trustLevel: place.trust_level },
      publicationStatus: 'draft', reviewStatus: 'pending', riskFlags: reviewRiskFlags(place),
    });
  }
  return { accepted, quarantined, counts: { total: input.places.length, accepted: accepted.length, quarantined: quarantined.length } };
}

function sourceCode(place) {
  const host = new URL(place.website_url).hostname.toLowerCase().replace(/^www\./, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `manual-seoul-${place.trust_level}-${host}`.slice(0, 64);
}

export function buildSeoulImportPlan(input) {
  const validation = validateSeoulDataset(input);
  if (!validation.valid) throw new Error(`Invalid Seoul dataset: ${validation.errors.join(';')}`);
  const ranked = [...input.places].sort((a, b) => TRUST_LEVELS.indexOf(a.trust_level) - TRUST_LEVELS.indexOf(b.trust_level) || a.canonical_key.localeCompare(b.canonical_key));
  const accepted = [];
  const quarantined = [];
  const sources = new Map();
  for (const place of ranked) {
    const flags = reviewRiskFlags(place);
    if (flags.includes('missing_source_url')) {
      quarantined.push({ canonicalKey: place.canonical_key, trustLevel: place.trust_level, riskFlags: flags });
      continue;
    }
    const code = sourceCode(place);
    const url = new URL(place.website_url);
    sources.set(code, {
      code, kind: place.trust_level === 'official' ? 'official_site' : 'manual',
      name: `${url.hostname} Seoul research`, base_url: url.origin, country_code: 'KR',
      region_code: 'SEOUL', default_language: 'ko', acquisition_method: 'curated_attachment',
      terms_status: 'content_reference_only', trust_level: place.trust_level, enabled: true,
    });
    const safePlace = { ...place, image_url: null, image_license: null, publication_status: 'draft', published_at: null };
    accepted.push({
      sourceCode: code,
      externalId: place.canonical_key,
      sourceUrl: place.website_url,
      contentHash: sha256(place),
      rawPayload: place,
      place: safePlace,
      provenance: {
        external_id: place.canonical_key, source_url: place.website_url, is_primary: true,
        observed_at: place.last_verified_at,
        field_evidence: { source_kind: 'curated_attachment', trust_level: place.trust_level, fields: Object.keys(place).filter((key) => !isBlank(place[key])) },
      },
      review: { status: 'pending', risk_flags: flags, priority: place.trust_level === 'official' ? 90 : place.trust_level === 'verified' ? 75 : 60 },
    });
  }
  const counts = {
    total: input.places.length, accepted: accepted.length, quarantined: quarantined.length,
    official: input.places.filter((p) => p.trust_level === 'official').length,
    verified: input.places.filter((p) => p.trust_level === 'verified').length,
    unverified: input.places.filter((p) => p.trust_level === 'unverified').length,
    acceptedOfficial: accepted.filter((p) => p.place.trust_level === 'official').length,
    acceptedVerified: accepted.filter((p) => p.place.trust_level === 'verified').length,
    acceptedUnverified: accepted.filter((p) => p.place.trust_level === 'unverified').length,
  };
  return { sources: [...sources.values()], accepted, quarantined, counts };
}

async function resolveInserted(db, table, row, conflict, filter) {
  const inserted = await db.insert(table, [row], conflict, 'ignore-duplicates');
  if (inserted[0]) return { row: inserted[0], created: true };
  const existing = await db.select(table, filter);
  if (!existing[0]) throw new Error(`Unable to resolve ${table} after idempotent insert.`);
  return { row: existing[0], created: false };
}

async function createAttachmentRun(db, sourceId, idempotencyKey) {
  const existing = await db.select('pipeline_runs', `source_id=eq.${sourceId}&idempotency_key=eq.${encodeURIComponent(idempotencyKey)}&order=attempt.desc&limit=1`);
  if (existing[0]?.status === 'succeeded') return { run: existing[0], replayed: true };
  const attempt = (existing[0]?.attempt ?? 0) + 1;
  const rows = await db.insert('pipeline_runs', [{ source_id: sourceId, trigger_kind: 'manual', status: 'running', idempotency_key: idempotencyKey, attempt }]);
  if (!rows[0]) throw new Error('Unable to create attachment pipeline run.');
  return { run: rows[0], replayed: false };
}

/**
 * Server-side write primitive. Callers must provide an approved service-boundary
 * database client; this module intentionally has no environment-variable or CLI
 * write path, so a dry-run cannot be promoted to production accidentally.
 */
export async function writeSeoulImportPlan({ db, plan, idempotencyKey }): Promise<SeoulWriteResult> {
  if (!db || typeof db.insert !== 'function' || typeof db.select !== 'function' || typeof db.patch !== 'function') throw new Error('A server-side database client is required.');
  if (!idempotencyKey || typeof idempotencyKey !== 'string') throw new Error('A non-empty idempotency key is required.');
  const rowsBySource = new Map();
  for (const row of plan.accepted) rowsBySource.set(row.sourceCode, [...(rowsBySource.get(row.sourceCode) ?? []), row]);
  const sourceByCode = new Map();
  for (const source of plan.sources) {
    const resolved = await resolveInserted(db, 'data_sources', source, 'code', `code=eq.${encodeURIComponent(source.code)}&limit=1`);
    sourceByCode.set(source.code, resolved.row);
  }

  const runs = [];
  for (const sourceCode of rowsBySource.keys()) runs.push({ sourceCode, ...(await createAttachmentRun(db, sourceByCode.get(sourceCode).id, idempotencyKey)) });
  if (runs.every((entry) => entry.replayed)) return { status: 'idempotent_replay', metrics: { accepted: plan.accepted.length, quarantined: plan.quarantined.length } };

  const metrics = { accepted: plan.accepted.length, quarantined: plan.quarantined.length, rawStored: 0, rawExisting: 0, placesInserted: 0, placesExisting: 0, provenanceStored: 0, provenanceExisting: 0, reviewQueued: 0, reviewExisting: 0 };
  const activeRuns = runs.filter((entry) => !entry.replayed);
  try {
    for (const entry of activeRuns) {
      const source = sourceByCode.get(entry.sourceCode);
      for (const candidate of rowsBySource.get(entry.sourceCode) ?? []) {
        const now = new Date(); const expiresAt = new Date(now.getTime() + 30 * 86400_000).toISOString();
        const raw = await resolveInserted(db, 'source_items_raw', { source_id: source.id, pipeline_run_id: entry.run.id, external_id: candidate.externalId, content_hash: candidate.contentHash, source_url: candidate.sourceUrl, payload: candidate.rawPayload, fetched_at: now.toISOString(), expires_at: expiresAt }, 'source_id,external_id,content_hash', `source_id=eq.${source.id}&external_id=eq.${encodeURIComponent(candidate.externalId)}&content_hash=eq.${candidate.contentHash}&limit=1`);
        raw.created ? metrics.rawStored += 1 : metrics.rawExisting += 1;
        const place = await resolveInserted(db, 'canonical_places', candidate.place, 'canonical_key', `canonical_key=eq.${encodeURIComponent(candidate.place.canonical_key)}&limit=1`);
        place.created ? metrics.placesInserted += 1 : metrics.placesExisting += 1;
        const provenance = await resolveInserted(db, 'place_provenance', { place_id: place.row.id, source_id: source.id, raw_item_id: raw.row.id, ...candidate.provenance }, 'place_id,source_id,external_id', `place_id=eq.${place.row.id}&source_id=eq.${source.id}&external_id=eq.${encodeURIComponent(candidate.externalId)}&limit=1`);
        provenance.created ? metrics.provenanceStored += 1 : metrics.provenanceExisting += 1;
        const review = await resolveInserted(db, 'data_review_queue', { place_id: place.row.id, risk_flags: candidate.review.risk_flags, priority: candidate.review.priority }, 'place_id', `place_id=eq.${place.row.id}&limit=1`);
        review.created ? metrics.reviewQueued += 1 : metrics.reviewExisting += 1;
      }
      await db.patch('pipeline_runs', `id=eq.${entry.run.id}`, { status: 'succeeded', finished_at: new Date().toISOString(), metrics });
      await db.patch('data_sources', `id=eq.${source.id}`, { last_success_at: new Date().toISOString() });
    }
    return { status: 'succeeded', metrics };
  } catch (error) {
    await Promise.all(activeRuns.map(async (entry) => {
      const source = sourceByCode.get(entry.sourceCode);
      await db.patch('pipeline_runs', `id=eq.${entry.run.id}`, { status: 'failed', finished_at: new Date().toISOString(), error_code: 'SEOUL_ATTACHMENT_IMPORT_FAILED', error_summary: 'Attachment import failed; inspect protected server logs.', metrics });
      await db.patch('data_sources', `id=eq.${source.id}`, { last_failure_at: new Date().toISOString() });
    }));
    throw error;
  }
}

export async function readSeoulDataset(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function runSeoulDryRun(path) {
  const plan = buildSeoulImportPlan(await readSeoulDataset(path));
  return {
    mode: 'dry-run', counts: plan.counts, sourceRegistrations: plan.sources.length,
    riskFlagCounts: plan.accepted.concat(plan.quarantined).flatMap((row) => row.review?.risk_flags ?? row.riskFlags).reduce((acc, flag) => ({ ...acc, [flag]: (acc[flag] ?? 0) + 1 }), {}),
    invariants: { allDraft: plan.accepted.every((row) => row.place.publication_status === 'draft'), noImages: plan.accepted.every((row) => !row.place.image_url && !row.place.image_license), allQueued: plan.accepted.every((row) => row.review.status === 'pending') },
  };
}

const TOUR_API_SEARCH_URL = 'https://apis.data.go.kr/B551011/KorService2/searchKeyword2';

function tourApiItems(payload) {
  const raw = payload?.response?.body?.items?.item;
  return Array.isArray(raw) ? raw : raw ? [raw] : [];
}

/**
 * Read-only KTO matching primitive. It intentionally has no database client,
 * Supabase import, publication, or raw-response output path.
 */
export async function runOfficialTourApiMatching({ path, serviceKey, fetchImpl = fetch }) {
  if (!serviceKey || typeof serviceKey !== 'string') throw new Error('TOURAPI_SERVICE_KEY is required.');
  const input = await readSeoulDataset(path);
  const validation = validateSeoulDataset(input);
  if (!validation.valid) throw new Error(`Invalid Seoul dataset: ${validation.errors.join(';')}`);
  const eligible = input.places.filter((place) => !reviewRiskFlags(place).includes('missing_source_url'));
  const candidates = [];
  for (const place of eligible) {
    const params = new URLSearchParams({ serviceKey, MobileOS: 'ETC', MobileApp: 'TravelDiary', _type: 'json', numOfRows: '10', pageNo: '1', keyword: place.name_ko });
    const response = await fetchImpl(`${TOUR_API_SEARCH_URL}?${params}`);
    if (!response.ok) throw new Error(`TourAPI request failed with HTTP ${response.status}.`);
    const payload = await response.json();
    if (String(payload?.response?.header?.resultCode) !== '0000') throw new Error('TourAPI returned a non-success response.');
    candidates.push(...tourApiItems(payload));
  }
  const plan = buildTourApiMatchingPlan(input, candidates);
  return {
    mode: 'official-tourapi-matching-no-write',
    counts: plan.counts,
    queriedEligibleAttachments: eligible.length,
    invariants: {
      productionWrites: 0,
      allDraft: plan.accepted.every((row) => row.publicationStatus === 'draft'),
      allPendingReview: plan.accepted.every((row) => row.reviewStatus === 'pending'),
      quarantinedBoundaryPreserved: plan.quarantined.filter((row) => row.reason === 'attachment_quarantined_missing_source_url').length === input.places.length - eligible.length,
    },
  };
}

const GOOGLE_PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const GOOGLE_PLACES_FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.location';

/**
 * Read-only Google Places API (New) matching primitive. It does not expose the
 * API key, request URL, response payload, database client, import, or publish path.
 */
export async function runGooglePlacesMatching({ path, apiKey, fetchImpl = fetch }) {
  if (!apiKey || typeof apiKey !== 'string') throw new Error('GOOGLE_PLACES_API_KEY is required.');
  const input = await readSeoulDataset(path);
  const validation = validateSeoulDataset(input);
  if (!validation.valid) throw new Error(`Invalid Seoul dataset: ${validation.errors.join(';')}`);
  const eligible = input.places.filter((place) => !reviewRiskFlags(place).includes('missing_source_url'));
  const candidates = [];
  for (const place of eligible) {
    let matchedRows: any[] | null = null;
    for (const query of buildGooglePlacesQueryPlan(place)) {
      const response = await fetchImpl(GOOGLE_PLACES_TEXT_SEARCH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': GOOGLE_PLACES_FIELD_MASK },
        body: JSON.stringify(query),
      });
      if (!response.ok) throw new Error(`Google Places request failed with HTTP ${response.status}.`);
      const payload = await response.json();
      const rows = Array.isArray(payload?.places) ? payload.places : [];
      const compatible = googlePlacesCompatibleCandidates(place, rows);
      if (compatible.length > 1) throw new Error('Google Places returned ambiguous verifiable candidates.');
      if (compatible.length === 1) { matchedRows = rows; break; }
    }
    if (!matchedRows) throw new Error('Google Places returned no uniquely verifiable candidate.');
    candidates.push(...matchedRows);
  }
  const plan = buildGooglePlacesMatchingPlan(input, candidates);
  return {
    mode: 'google-places-matching-no-write',
    counts: plan.counts,
    queriedEligibleAttachments: eligible.length,
    invariants: {
      productionWrites: 0,
      allDraft: plan.accepted.every((row) => row.publicationStatus === 'draft'),
      allPendingReview: plan.accepted.every((row) => row.reviewStatus === 'pending'),
      quarantinedBoundaryPreserved: plan.quarantined.filter((row) => row.reason === 'attachment_quarantined_missing_source_url').length === input.places.length - eligible.length,
    },
  };
}

if (String(process.argv[1] ?? '').replaceAll('\\', '/').endsWith('/seoul-content-import.js')) {
  const inputPath = process.argv.slice(2).find((value) => value !== '--');
  if (!inputPath) throw new Error('Usage: pnpm data:seoul:dry-run -- <path-to-json>');
  runSeoulDryRun(inputPath).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
