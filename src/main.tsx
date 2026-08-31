import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app/App';
import { TripDataProvider } from './app/TripDataContext';
import { AuthProvider } from './app/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './app/query-client';
import { registerPwa } from './app/pwa';
import './design-system/tokens.css';
import './design-system/global.css';
import './design-system/responsive.css';

registerPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}><AuthProvider><BrowserRouter basename={import.meta.env.BASE_URL}>
      <TripDataProvider><App /></TripDataProvider>
    </BrowserRouter></AuthProvider></QueryClientProvider>
  </StrictMode>,
);
