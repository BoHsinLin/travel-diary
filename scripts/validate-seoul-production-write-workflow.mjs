import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-content-production-write.yml', import.meta.url), 'utf8');

assert.match(workflow, /workflow_dispatch:/);
assert.match(workflow, /validate_write_path:/);
assert.match(workflow, /environment: production-content-import/);
assert.match(workflow, /SUPABASE_URL: \$\{\{ secrets\.SUPABASE_URL \}\}/);
assert.match(workflow, /SUPABASE_SERVICE_ROLE_KEY: \$\{\{ secrets\.SUPABASE_SERVICE_ROLE_KEY \}\}/);
assert.match(workflow, /inputs\.validate_write_path == true/);
assert.match(workflow, /test -n "\$\{SUPABASE_URL:-\}"/);
assert.match(workflow, /test -n "\$\{SUPABASE_SERVICE_ROLE_KEY:-\}"/);
assert.match(workflow, /seoul-content-import\.node-test\.js/);
assert.match(workflow, /Production writes: 0/);
assert.doesNotMatch(workflow, /data:seoul:import|writeSeoulImportPlan\(|db push|db reset|\bseed\b|\bfixture\b|curl |review_data_item.*publish/);

console.log('seoul production write workflow contract: PASS');
