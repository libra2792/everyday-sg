import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { headForPath, OG_IMAGE_PATH } from './head';

function setTag(selector: string, create: () => HTMLElement, attr: string, value: string | null) {
  let el = document.head.querySelector<HTMLElement>(selector);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = create();
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
}

function meta(key: 'name' | 'property', name: string, content: string | null) {
  const create = () => {
    const m = document.createElement('meta');
    m.setAttribute(key, name);
    return m;
  };
  setTag(`meta[${key}="${name}"]`, create, 'content', content);
}

/** Keeps <title>, the description, Open Graph tags and the canonical link in step with the route. */
export function useDocumentHead() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    const h = headForPath(pathname, search);
    const url = `${window.location.origin}${pathname}`;
    document.title = h.title;
    meta('name', 'description', h.description);
    meta('property', 'og:title', h.title);
    meta('property', 'og:description', h.description);
    meta('property', 'og:url', url);
    meta('property', 'og:image', `${window.location.origin}${OG_IMAGE_PATH}`);
    meta('name', 'robots', h.index ? null : 'noindex');
    setTag('link[rel="canonical"]', () => Object.assign(document.createElement('link'), { rel: 'canonical' }), 'href', url);
  }, [pathname, search]);
}
