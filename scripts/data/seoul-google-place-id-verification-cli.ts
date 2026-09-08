import { readFile } from 'node:fs/promises';
import { buildDirectGooglePlaceIdVerificationPlan, diagnoseDirectGooglePlaceIdVerificationMismatches, readSeoulDataset, validateCrossSourceEvidenceInput } from './seoul-content-import.js';

const GOOGLE_PLACE_DETAILS_BASE_URL = 'https://places.googleapis.com/v1/places';
const GOOGLE_PLACE_DETAILS_FIELD_MASK = 'id,displayName,formattedAddress,location';
const REQUIRED_EVIDENCE_RECORDS = 8;

/**
 * Direct Place-ID verification is deliberately separate from text search. It
 * accepts only the reviewed IDs from the fixed evidence contract and returns
 * aggregate, no-write evidence; fetched payloads remain in memory only.
 */
export async function runDirectGooglePlaceIdVerification({ datasetPath, evidencePath, apiKey, fetchImpl = fetch, readFileImpl = readFile }) {
  if (!apiKey || typeof apiKey !== 'string') throw new Error('GOOGLE_PLACES_API_KEY is required.');
  const evidenceInput = JSON.parse(await readFileImpl(evidencePath, 'utf8'));
  const contract = validateCrossSourceEvidenceInput(evidenceInput);
  if (!contract.valid) throw new Error('Invalid cross-source evidence input: ' + contract.errors.join(';'));
  if (contract.records.length !== REQUIRED_EVIDENCE_RECORDS) throw new Error('Expected exactly ' + REQUIRED_EVIDENCE_RECORDS + ' reviewed Google Place IDs.');

  const candidates = [];
  for (const record of contract.records) {
    const response = await fetchImpl(GOOGLE_PLACE_DETAILS_BASE_URL + '/' + encodeURIComponent(record.googlePlaceId), {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': GOOGLE_PLACE_DETAILS_FIELD_MASK,
      },
    });
    if (!response.ok) throw new Error('Google Places details request failed with HTTP ' + response.status + '.');
    const candidate = await response.json();
    if (String(candidate?.id ?? '').trim() !== record.googlePlaceId) throw new Error('Google Places details response did not match the requested Place ID.');
    candidates.push(candidate);
  }

  const input = await readSeoulDataset(datasetPath);
  const plan = buildDirectGooglePlaceIdVerificationPlan(input, candidates, evidenceInput);
  const diagnostic = diagnoseDirectGooglePlaceIdVerificationMismatches(input, candidates, evidenceInput);
  if (!plan.invariants.samePlaceIds || !plan.invariants.allDraft || !plan.invariants.allPendingReview || plan.invariants.rawPayloadStored || plan.invariants.productionWrites !== 0 || !plan.invariants.quarantinedBoundaryPreserved) {
    throw new Error('Direct Google Place ID no-write invariants failed.');
  }
  if (diagnostic.invariants.productionWrites !== 0 || !diagnostic.invariants.aggregateOnly || diagnostic.invariants.rawPayloadStored || diagnostic.invariants.strictAcceptanceGateChanged || !diagnostic.invariants.classifiedAllReviewedEvidence) {
    throw new Error('Direct Google Place ID diagnostic invariants failed.');
  }

  return {
    version: plan.version,
    mode: plan.mode,
    counts: plan.counts,
    invariants: plan.invariants,
    diagnostic: {
      mode: diagnostic.mode,
      counts: diagnostic.counts,
      invariants: diagnostic.invariants,
    },
  };
}

const args = process.argv.slice(2).filter((value) => value !== '--');
if (String(process.argv[1] ?? '').replaceAll('\\', '/').endsWith('/seoul-google-place-id-verification-cli.js')) {
  const [datasetPath, evidencePath] = args;
  if (!datasetPath || !evidencePath) throw new Error('Usage: pnpm data:seoul:google-place-id-verify -- <dataset-path> <evidence-path>');
  runDirectGooglePlaceIdVerification({ datasetPath, evidencePath, apiKey: process.env.GOOGLE_PLACES_API_KEY })
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => { console.error(error.message); process.exitCode = 1; });
}
