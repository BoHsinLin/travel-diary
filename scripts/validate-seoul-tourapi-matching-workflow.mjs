import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-tourapi-matching.yml', import.meta.url), 'utf8');

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /environment: production-content-import/);
assert.match(workflow, /TOURAPI_SERVICE_KEY: \$\{\{ secrets\.TOURAPI_SERVICE_KEY \}\}/);
assert.match(workflow, /test -n "\$\{TOURAPI_SERVICE_KEY:-\}"/);
assert.match(workflow, /data:seoul:tourapi-match/);
assert.match(workflow, /Production writes: 0/);
assert.doesNotMatch(workflow, /runner\.temp/);
assert.doesNotMatch(workflow, /SUPABASE_|data:seoul:import|writeSeoulImportPlan\(|db push|db reset|\bseed\b|\bfixture\b|curl |review_data_item.*publish/);

console.log('seoul official TourAPI matching workflow contract: PASS');
