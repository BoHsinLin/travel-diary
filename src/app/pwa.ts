export const PWA_UPDATE_EVENT = 'travel-journal:pwa-update';

export function registerPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((registration) => {
    const notifyUpdate = () => window.dispatchEvent(new CustomEvent(PWA_UPDATE_EVENT));
    if (registration.waiting) notifyUpdate();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) notifyUpdate();
      });
    });
  }).catch(() => {
    // Offline support is progressive enhancement; the main app remains available online.
  });
}

export function applyPwaUpdate() {
  void navigator.serviceWorker.getRegistration().then((registration) => registration?.waiting?.postMessage({ type: 'SKIP_WAITING' }));
}
