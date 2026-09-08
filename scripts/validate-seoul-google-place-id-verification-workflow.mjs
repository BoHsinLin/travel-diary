import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-google-place-id-verification.yml', import.meta.url), 'utf8');

assert.match(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /workflow_dispatch:\s*\n\s*inputs:/);
assert.match(workflow, /environment: production-content-import/);
assert.match(workflow, /GOOGLE_PLACES_API_KEY: \$\{\{ secrets\.GOOGLE_PLACES_API_KEY \}\}/);
assert.match(workflow, /CROSS_SOURCE_EVIDENCE_PATH: data\/imports\/cross-source-evidence-v1\.json/);
assert.match(workflow, /test -n "\$\{GOOGLE_PLACES_API_KEY:-\}"/);
assert.match(workflow, /test -f "\$\{CROSS_SOURCE_EVIDENCE_PATH\}"/);
assert.match(workflow, /data:seoul:google-place-id-verify/);
assert.match(workflow, /Production writes: 0/);
assert.doesNotMatch(workflow, /SUPABASE_|TOURAPI_SERVICE_KEY|data:seoul:import|writeSeoulImportPlan\(|db push|db reset|\bseed\b|\bfixture\b|curl |review_data_item.*publish/);

console.log('seoul direct Google Place ID verification workflow contract: PASS');
