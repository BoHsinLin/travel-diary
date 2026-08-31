import { readFile } from 'node:fs/promises';

const [serviceWorker, registration, updatePrompt] = await Promise.all([
  readFile(new URL('../dist/sw.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/app/pwa.ts', import.meta.url), 'utf8'),
  readFile(new URL('../src/app/PwaUpdatePrompt.tsx', import.meta.url), 'utf8'),
]);
const requiredGuards = [
  "request.method !== 'GET'",
  "request.headers.has('authorization')",
  '"/auth/"',
  '"/rest/"',
  '"/realtime/"',
  '"/storage/"',
  'PRECACHE',
  './index.html',
];

const missing = requiredGuards.filter((guard) => !serviceWorker.includes(guard));
const hasHashedJavaScript = /\.\/assets\/[^"']+-[A-Za-z0-9_-]+\.js/.test(serviceWorker);
const hasHashedStylesheet = /\.\/assets\/[^"']+-[A-Za-z0-9_-]+\.css/.test(serviceWorker);
const updateContract = [
  ['service worker SKIP_WAITING handler', serviceWorker, 'SKIP_WAITING'],
  ['service worker clients.claim', serviceWorker, 'self.clients.claim()'],
  ['update event dispatch', registration, 'PWA_UPDATE_EVENT'],
  ['user-visible update action', updatePrompt, '立即更新'],
  ['update activation request', updatePrompt, 'applyPwaUpdate'],
];
const missingUpdateContract = updateContract
  .filter(([, source, expected]) => !source.includes(expected))
  .map(([name]) => name);

if (missing.length || !hasHashedJavaScript || !hasHashedStylesheet || missingUpdateContract.length) {
  console.error(`PWA cache policy is incomplete. Guards: ${missing.join(', ') || 'ok'}; update contract: ${missingUpdateContract.join(', ') || 'ok'}`);
  process.exit(1);
}

console.log('PWA build contract verified: versioned hashed JS/CSS app shell is precached; sensitive Supabase requests are excluded; update prompt is auditable.');
