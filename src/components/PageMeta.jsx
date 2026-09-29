// Applies per-route <head> metadata (see src/seo/pageMeta.js) whenever the
// route changes: title, description, robots, canonical, Open Graph, Twitter.
// Mounted once inside BrowserRouter (App.jsx), outside the BetaGate so even
// the gate screen carries the right title.
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveMeta, SITE_NAME, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT } from '../seo/pageMeta';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', String(content));
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!href) { el?.remove(); return; }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function applyMeta(pathname) {
  const m = resolveMeta(pathname);
  document.title = m.title;
  upsertMeta('name', 'description', m.description);
  upsertMeta('name', 'robots', m.index ? 'index, follow' : 'noindex, nofollow');
  upsertLink('canonical', m.canonical);

  upsertMeta('property', 'og:site_name', SITE_NAME);
  upsertMeta('property', 'og:type', m.ogType);
  upsertMeta('property', 'og:title', m.title);
  upsertMeta('property', 'og:description', m.description);
  upsertMeta('property', 'og:url', m.url);
  upsertMeta('property', 'og:image', m.image);
  upsertMeta('property', 'og:image:width', OG_IMAGE_WIDTH);
  upsertMeta('property', 'og:image:height', OG_IMAGE_HEIGHT);
  upsertMeta('property', 'og:locale', 'en_US');

  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', m.title);
  upsertMeta('name', 'twitter:description', m.description);
  upsertMeta('name', 'twitter:image', m.image);
}

export default function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => { applyMeta(pathname); }, [pathname]);
  return null;
}
