import { runOfficialTourApiMatching } from './seoul-content-import.js';

const inputPath = process.argv.slice(2).find((value) => value !== '--');
if (!inputPath) throw new Error('Usage: pnpm data:seoul:tourapi-match -- <path-to-json>');

runOfficialTourApiMatching({ path: inputPath, serviceKey: process.env.TOURAPI_SERVICE_KEY })
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => { console.error(error.message); process.exitCode = 1; });
