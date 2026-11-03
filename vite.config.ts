/// <reference types="vitest/config" />
import { createServer, defineConfig, type Plugin } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const src = fileURLToPath(new URL('./src', import.meta.url));

/** The empty app shell, for pages that are not prerendered (netlify.toml sends them here). */
const APP_SHELL = 'app.html';

/**
 * After the build, write a page for every public route (guides, calculators, tools, hubs,
 * static pages): index.html with that route's title, description and Open Graph tags, and
 * the page itself rendered into #root (src/entry-server.tsx), so search engines and link
 * previews see the content without running JavaScript. The app then replaces it (see
 * src/main.tsx). Netlify serves these files before the SPA fallback, which gets the empty
 * shell instead: My Plan, Saved, search and unknown paths, none of which is indexed.
 * Absolute URLs (canonical, og:url, og:image) use Netlify's build-time URL when it is set.
 */
function prerenderPages(): Plugin {
  let outDir = 'dist';
  return {
    name: 'everydaysg-prerender',
    apply: (_, env) => env.command === 'build' || env.isPreview === true,
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const server = await createServer({ configFile: false, logLevel: 'silent', appType: 'custom', resolve: { alias: { '@': src } }, server: { middlewareMode: true, hmr: false } });
      try {
        const head = (await server.ssrLoadModule('/src/lib/head.ts')) as typeof import('./src/lib/head');
        const { renderRoute } = (await server.ssrLoadModule('/src/entry-server.tsx')) as typeof import('./src/entry-server');
        const shell = readFileSync(join(outDir, 'index.html'), 'utf8');
        if (!shell.includes('<div id="root"></div>')) throw new Error('index.html has no empty <div id="root"></div> to prerender into');
        writeFileSync(join(outDir, APP_SHELL), shell.replace('<!-- /route-head -->', '<meta name="robots" content="noindex" />\n    <!-- /route-head -->'));
        const origin = process.env.URL;
        const routes = head.headRoutes();
        for (const route of routes) {
          const body = await renderRoute(route);
          if (/<script|<template/.test(body)) throw new Error(`${route} prerendered with a script or template: it would not read without JavaScript`);
          const html = shell
            .replace(/(<!-- route-head[^>]*-->)[\s\S]*?(<!-- \/route-head -->)/, (_, open: string, close: string) => `${open}\n    ${head.headTags(route, origin)}\n    ${close}`)
            .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`);
          // guides/x.html rather than guides/x/index.html: served at /guides/x with no trailing-slash redirect.
          const file = route === '/' ? join(outDir, 'index.html') : join(outDir, `${route.slice(1)}.html`);
          mkdirSync(dirname(file), { recursive: true });
          writeFileSync(file, html);
        }
        this.info?.(`prerendered ${routes.length} routes`);
      } finally {
        await server.close();
      }
    },
    // `vite preview` falls back to index.html, now the prerendered home page: like Netlify,
    // send paths without a page of their own to the empty shell instead.
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        let path = '/';
        try {
          path = decodeURIComponent((req.url ?? '/').split(/[?#]/)[0]);
        } catch {
          return next();
        }
        const html = req.method === 'GET' && (req.headers.accept ?? '').includes('text/html');
        if (html && ![path, `${path}.html`, join(path, 'index.html')].some((p) => existsSync(join(outDir, p)))) req.url = `/${APP_SHELL}`;
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderPages()],
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
