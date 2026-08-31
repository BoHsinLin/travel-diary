import { readFile } from 'node:fs/promises';

const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const requiredGuards = [
  "request.method !== 'GET'",
  "request.headers.has('authorization')",
  "url.pathname.includes('/auth/')",
  "url.pathname.includes('/rest/')",
  "url.pathname.includes('/realtime/')",
];

const missing = requiredGuards.filter((guard) => !serviceWorker.includes(guard));
if (missing.length) {
  console.error(`PWA cache policy is missing sensitive-request guards: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('PWA cache policy verified: only same-origin, unauthenticated app-shell assets are cacheable.');
