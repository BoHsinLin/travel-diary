import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workflow = await readFile(new URL('../.github/workflows/seoul-content-import.yml', import.meta.url), 'utf8');

assert.match(workflow, /workflow_dispatch:/);
assert.doesNotMatch(workflow, /\n\s+(push|pull_request|schedule):/);
assert.match(workflow, /seoul-content-dry-run-/);
assert.match(workflow, /data:seoul:dry-run/);
assert.match(workflow, /data\/imports\/seoul_canonical_places_optimized_v5\.json/);
assert.doesNotMatch(workflow, /SEOUL_DRY_RUN_SUMMARY:\s+\$\{\{\s*runner\./);
assert.doesNotMatch(workflow, /data:seoul:import|write_to_production|SUPABASE_|TOURAPI_SERVICE_KEY|secrets\.|environment:|curl |VITE_|db reset|db push|\bseed\b|\bfixture\b|review_data_item.*publish/);

console.log('Seoul content import workflow safety contract: PASS');
