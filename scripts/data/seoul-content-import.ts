import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const TRUST_LEVELS = ['official', 'verified', 'unverified'];
const CATEGORIES = [
  'heritage', 'food', 'neighborhood', 'cafe', 'shopping', 'nature', 'museum',
  'activity', 'hotel', 'airport', 'flight', 'train', 'subway', 'bus', 'walk',
  'taxi', 'ferry', 'ticket', 'reservation', 'generic',
];

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

if (String(process.argv[1] ?? '').replaceAll('\\', '/').endsWith('/seoul-content-import.js')) {
  const inputPath = process.argv.slice(2).find((value) => value !== '--');
  if (!inputPath) throw new Error('Usage: pnpm data:seoul:dry-run -- <path-to-json>');
  runSeoulDryRun(inputPath).then((result) => console.log(JSON.stringify(result))).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
