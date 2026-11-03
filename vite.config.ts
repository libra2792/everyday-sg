/// <reference types="vitest/config" />
import { createServer, defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const src = fileURLToPath(new URL('./src', import.meta.url));

/**
 * After the build, write a copy of index.html for every public route (guides, calculators,
 * tools, hubs, static pages) with that route's title, description and Open Graph tags, so
 * link previews and search engines see them without running JavaScript. The page body is
 * the same app shell; Netlify serves these files before the SPA fallback. Absolute URLs
 * (canonical, og:url, og:image) use Netlify's build-time URL when it is set.
 */
function routeHeads(): Plugin {
  let outDir = 'dist';
  return {
    name: 'everydaysg-route-heads',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const server = await createServer({ configFile: false, logLevel: 'silent', appType: 'custom', resolve: { alias: { '@': src } }, server: { middlewareMode: true, hmr: false } });
      try {
        const head = (await server.ssrLoadModule('/src/lib/head.ts')) as typeof import('./src/lib/head');
        const shell = readFileSync(join(outDir, 'index.html'), 'utf8');
        const origin = process.env.URL;
        const routes = head.headRoutes();
        for (const route of routes) {
          const html = shell.replace(/(<!-- route-head[^>]*-->)[\s\S]*?(<!-- \/route-head -->)/, (_, open: string, close: string) => `${open}\n    ${head.headTags(route, origin)}\n    ${close}`);
          // guides/x.html rather than guides/x/index.html: served at /guides/x with no trailing-slash redirect.
          const file = route === '/' ? join(outDir, 'index.html') : join(outDir, `${route.slice(1)}.html`);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, html);
        }
        this.info?.(`route heads written for ${routes.length} routes`);
      } finally {
        await server.close();
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), routeHeads()],
  resolve: {
    alias: {
      '@': src,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
