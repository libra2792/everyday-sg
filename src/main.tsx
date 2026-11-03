import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App, { preloadPage } from './App';
import { AppStateProvider } from './state/AppState';
import './index.css';

// Public pages arrive prerendered (vite.config.ts) for search engines and link previews.
// The app replaces that markup rather than hydrating it: the first render already reads
// what this browser saved (theme, ticks, inputs), which the build's first-visit HTML cannot
// match. React swaps the old markup for the new in one commit; loading the page's code
// first keeps a calculator from passing through "Loading…" on the way.
void preloadPage(window.location.pathname)
  .catch(() => undefined)
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <BrowserRouter>
          <AppStateProvider>
            <App />
          </AppStateProvider>
        </BrowserRouter>
      </StrictMode>,
    );
  });
