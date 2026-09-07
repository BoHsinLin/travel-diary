import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-google-places-matching.yml', import.meta.url), 'utf8');
assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /environment: production-content-import/);
assert.match(workflow, /GOOGLE_PLACES_API_KEY: \$\{\{ secrets\.GOOGLE_PLACES_API_KEY \}\}/);
assert.match(workflow, /test -n "\$\{GOOGLE_PLACES_API_KEY:-\}"/);
assert.match(workflow, /data:seoul:google-places-match/);
assert.match(workflow, /Production writes: 0/);
assert.doesNotMatch(workflow, /SUPABASE_|TOURAPI_SERVICE_KEY|data:seoul:import|writeSeoulImportPlan\(|db push|db reset|\bseed\b|\bfixture\b|curl |review_data_item.*publish/);
console.log('seoul Google Places matching workflow contract: PASS');
