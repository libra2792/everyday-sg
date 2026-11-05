import { StrictMode } from 'react';
import { prerender } from 'react-dom/static';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { AppStateProvider } from './state/AppState';

/**
 * The page body for a route, as HTML, for the build step (vite.config.ts). Rendered as a
 * first-time visitor sees it: nothing saved, the default theme, wide charts and figures.
 * Waits for the calculators' on-demand code, so their pages arrive complete, not "Loading…".
 */
export async function renderRoute(url: string): Promise<string> {
  const { prelude } = await prerender(
    <StrictMode>
      <StaticRouter location={url}>
        <AppStateProvider>
          <App />
        </AppStateProvider>
      </StaticRouter>
    </StrictMode>,
    // Never split a page into chunks that an inline script stitches together: without
    // JavaScript, readers would see "Loading…" and nothing else.
    { progressiveChunkSize: Infinity },
  );
  return new Response(prelude).text();
}
