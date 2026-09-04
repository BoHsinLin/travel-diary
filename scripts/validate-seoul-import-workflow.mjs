import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-content-import.yml', import.meta.url), 'utf8');

assert.match(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /\n\s+(push|pull_request|schedule):/);
assert.match(workflow, /environment: production-content-import/);
assert.match(workflow, /SUPABASE_PROJECT_REF: mgxsjobicqyddoaejqvf/);
assert.match(workflow, /write_to_production:[\s\S]*?type: boolean/);
assert.match(workflow, /if: \$\{\{ inputs\.write_to_production \}\}/);
assert.match(workflow, /seoul-content-dry-run-/);
assert.match(workflow, /data:seoul:dry-run/);
assert.match(workflow, /data:seoul:import/);
assert.match(workflow, /secrets\.SUPABASE_URL/);
assert.match(workflow, /secrets\.SUPABASE_SERVICE_ROLE_KEY/);
assert.match(workflow, /secrets\.TOURAPI_SERVICE_KEY/);
assert.doesNotMatch(workflow, /VITE_SUPABASE|db reset|db push|\bseed\b|\bfixture\b|review_data_item.*publish/);

console.log('Seoul content import workflow safety contract: PASS');
