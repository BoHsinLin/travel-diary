import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
export function ProtectedRoute() { const { user,loading } = useAuth(); const location = useLocation(); if(loading)return <main className="route-loading" aria-busy="true">正在確認登入狀態…</main>; return user ? <Outlet /> : <Navigate replace to="/login" state={{ from: location.pathname+location.search }} />; }
