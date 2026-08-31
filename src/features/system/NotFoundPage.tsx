import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}><section style={{ textAlign: 'center' }}><p>404</p><h1>找不到這一頁</h1><p>這個旅程入口可能已移動或尚未開放。</p><Link to="/trips">回到所有旅程</Link></section></main>;
}
