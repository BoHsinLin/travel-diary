import { useEffect, useState } from 'react';
import { applyPwaUpdate, PWA_UPDATE_EVENT } from './pwa';

export function PwaUpdatePrompt() {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    const show = () => setAvailable(true);
    const reload = () => window.location.reload();
    window.addEventListener(PWA_UPDATE_EVENT, show);
    navigator.serviceWorker?.addEventListener('controllerchange', reload, { once: true });
    return () => {
      window.removeEventListener(PWA_UPDATE_EVENT, show);
      navigator.serviceWorker?.removeEventListener('controllerchange', reload);
    };
  }, []);
  if (!available) return null;
  return <aside className="pwa-update" role="status"><span>新版旅程誌已可使用。</span><button onClick={applyPwaUpdate}>立即更新</button></aside>;
}
