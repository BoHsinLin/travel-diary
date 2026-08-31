import { createHash } from 'node:crypto';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const sensitivePaths = ["/auth/", "/rest/", "/realtime/", "/storage/"];

function appShellServiceWorker(): Plugin {
  return {
    name: 'travel-journal-app-shell-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const generatedAssets = Object.values(bundle)
        .filter((file) => file.type === 'chunk' || file.fileName.endsWith('.css'))
        .map((file) => `./${file.fileName}`)
        .sort();
      const precache = ['./', './index.html', './manifest.webmanifest', './pwa-icon-192.svg', './pwa-icon-512.svg', ...generatedAssets];
      const version = createHash('sha256').update(precache.join('|')).digest('hex').slice(0, 12);
      const source = `const CACHE_NAME = 'travel-journal-shell-${version}';
const PRECACHE = ${JSON.stringify(precache)};
const SENSITIVE_PATHS = ${JSON.stringify(sensitivePaths)};
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))); });
self.addEventListener('activate', (event) => { event.waitUntil(Promise.all([caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))), self.clients.claim()])); });
self.addEventListener('message', (event) => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', (event) => {
  const { request } = event; const url = new URL(request.url);
  if (url.origin !== self.location.origin || request.method !== 'GET' || request.headers.has('authorization')) return;
  if (SENSITIVE_PATHS.some((path) => url.pathname.includes(path))) return;
  if (request.mode === 'navigate') { event.respondWith(fetch(request).catch(() => caches.match('./index.html'))); return; }
  if (!['script', 'style', 'image', 'font', 'manifest'].includes(request.destination)) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => { if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone())); return response; })));
});`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (env.VITE_REQUIRE_SUPABASE_CONFIG === 'true' && (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY)) {
    throw new Error('Production Supabase configuration is required: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return {
    base: env.VITE_BASE_PATH || '/',
    plugins: [react(), appShellServiceWorker()],
    build: { manifest: true },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  };
});
