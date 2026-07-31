import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css';
import { AppRouter } from './routes';
import { AppProviders } from '@workspace/frontend-core';

async function enableMocking() {
  if (import.meta.env.VITE_USE_MSW !== 'true') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  return worker.start();
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </StrictMode>,
  )
})
