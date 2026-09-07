import { runGooglePlacesMatching } from './seoul-content-import.js';

const inputPath = process.argv.slice(2).find((value) => value !== '--');
if (!inputPath) throw new Error('Usage: pnpm data:seoul:google-places-match -- <path-to-json>');

runGooglePlacesMatching({ path: inputPath, apiKey: process.env.GOOGLE_PLACES_API_KEY })
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => { console.error(error.message); process.exitCode = 1; });
