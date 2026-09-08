import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { runDirectGooglePlaceIdVerification } from './seoul-google-place-id-verification-cli.js';

const datasetPath = new URL('../../../data/imports/seoul_canonical_places_optimized_v5.json', import.meta.url);

test('direct Place-ID runner uses exactly seven reviewed IDs and emits only aggregate no-write evidence', async () => {
  const dataset = JSON.parse(await readFile(datasetPath, 'utf8'));
  const targets = dataset.places.filter((place) => place.website_url).slice(0, 7);
  const records = targets.map((place, index) => ({
    googlePlaceId: 'ChIJ-reviewed-' + (index + 1),
    primaryEvidence: { kind: 'official', url: 'https://official.example/' + (index + 1) },
  }));
  const details = new Map(records.map((record, index) => [record.googlePlaceId, {
    id: record.googlePlaceId,
    displayName: { text: targets[index].name_ko },
    formattedAddress: '서울특별시 종로구',
    location: { latitude: 37.57, longitude: 126.98 },
  }]));
  const result = await runDirectGooglePlaceIdVerification({
    datasetPath,
    evidencePath: 'reviewed-evidence.json',
    apiKey: 'masked-test-key',
    readFileImpl: async () => JSON.stringify({ version: 'cross-source-evidence-v1', records }),
    fetchImpl: async (url, options) => {
      const id = decodeURIComponent(String(url).split('/').at(-1)!);
      const headers = options?.headers as Record<string, string>;
      assert.equal(headers['X-Goog-FieldMask'], 'id,displayName,formattedAddress,location');
      return new Response(JSON.stringify(details.get(id)), { status: 200 });
    },
  });
  assert.deepEqual(result.counts, { total: 120, verified: 7, quarantined: 113, unverifiedEvidence: 0 });
  assert.deepEqual(result.invariants, { productionWrites: 0, samePlaceIds: true, allDraft: true, allPendingReview: true, rawPayloadStored: false, quarantinedBoundaryPreserved: true });
  assert.deepEqual(result.diagnostic, {
    mode: 'direct-google-place-id-mismatch-diagnostic-no-write',
    counts: { reviewedEvidence: 7, strictVerified: 7, idMismatch: 0, normalizedNameMismatch: 0, sourceEvidenceMismatch: 0, seoulAddressMismatch: 0, wgs84Mismatch: 0 },
    invariants: { productionWrites: 0, aggregateOnly: true, rawPayloadStored: false, strictAcceptanceGateChanged: false, classifiedAllReviewedEvidence: true },
  });
  assert.equal(JSON.stringify(result).includes('official.example'), false);
  assert.equal(JSON.stringify(result).includes('ChIJ-reviewed'), false);
});

test('direct Place-ID runner fails closed unless the fixed evidence input has exactly seven IDs', async () => {
  const evidenceInput = {
    version: 'cross-source-evidence-v1',
    records: [{ googlePlaceId: 'ChIJ-one', primaryEvidence: { kind: 'official', url: 'https://official.example/one' } }],
  };
  await assert.rejects(
    () => runDirectGooglePlaceIdVerification({
      datasetPath,
      evidencePath: 'reviewed-evidence.json',
      apiKey: 'masked-test-key',
      readFileImpl: async () => JSON.stringify(evidenceInput),
    }),
    /Expected exactly 7 reviewed Google Place IDs/,
  );
});
