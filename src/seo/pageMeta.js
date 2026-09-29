// Per-route SEO metadata: <title>, description, canonical, robots, Open
// Graph and Twitter cards. ONE place to edit copy (John / Mark): change the
// strings here and every page picks them up. PageMeta.jsx applies them on
// each route change; index.html carries the same defaults statically for
// crawlers and link-preview bots that don't run JavaScript.
//
// Rules:
// - Public pages (landing, contact, legal) are indexable with a canonical.
// - Everything under /v4/ is the app (contest setup, dashboard, private
//   contest pages) and is noindex. vercel.json also sends X-Robots-Tag for
//   those paths, so the signal reaches crawlers even before JS runs.
// - Contest invitation pages stay noindex but get share-friendly OG copy,
//   because creators paste those links into WhatsApp, Slack, and email.

export const SITE_NAME = 'NamingContest.com';
export const SITE_URL = 'https://namingcontest.com';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const DEFAULT_DESCRIPTION =
  'Run a naming contest in minutes. Invite friends, family, or your team, collect name ideas, ' +
  'vote on favorites, and crown the winner. For babies, pets, teams, bands, companies, and products.';

// Title pattern for inner pages: "Page · NamingContest.com".
const t = (page) => `${page} · ${SITE_NAME}`;

// Exact-path entries. `index: true` = indexable + canonical.
export const ROUTE_META = {
  '/': {
    title: 'NamingContest.com: Run a naming contest, crown the winner',
    description: DEFAULT_DESCRIPTION,
    index: true,
    ogType: 'website',
  },
  '/contact': {
    title: t('Contact us'),
    description:
      'Questions about running a naming contest, pricing, or your account? Send the NamingContest team a message.',
    index: true,
  },
  '/privacy': {
    title: t('Privacy Policy'),
    description: 'How NamingContest collects, uses, and protects your information.',
    index: true,
  },
  '/terms': {
    title: t('Terms of Service'),
    description: 'The terms that apply when you run or take part in a naming contest on NamingContest.com.',
    index: true,
  },
  '/cookies': {
    title: t('Cookie Policy'),
    description: 'What NamingContest stores in your browser and why.',
    index: true,
  },
  '/link-expired': {
    title: t('Link expired'),
    description: 'This sign-in link has expired. Request a new one to continue.',
    index: false,
  },
  '/error': {
    title: t('Something went wrong'),
    description: 'Something went wrong on our side. Please try again.',
    index: false,
  },
  '/v4/pick': {
    title: t('Start a contest'),
    description: 'Pick a path: personal, group, or business. You can change your mind anytime.',
    index: false,
  },
  '/v4/setup/brief': {
    title: t('Set up your contest'),
    description: 'Answer a few questions so participants know what to aim for.',
    index: false,
  },
  '/v4/setup/review': {
    title: t('Review and launch'),
    description: 'Check your brief, schedule, and settings, then launch your contest.',
    index: false,
  },
  '/v4/settings': {
    title: t('Contest Dashboard'),
    description: 'Your contests, results, and account.',
    index: false,
  },
};

// Prefix entries, checked in order after exact matches. Contest and join
// pages carry share copy because those links get pasted around.
export const PREFIX_META = [
  {
    prefix: '/v4/join/',
    title: t('You’re invited to a naming contest'),
    description: 'Suggest a name, then vote for your favorite. It takes a minute.',
    index: false,
  },
  {
    prefix: '/v4/contest/',
    title: t('Naming contest'),
    description: 'Suggest names, vote for your favorites, and see the winner.',
    index: false,
  },
  {
    prefix: '/v4/',
    title: t('Contest'),
    description: DEFAULT_DESCRIPTION,
    index: false,
  },
];

export const NOT_FOUND_META = {
  title: t('Page not found'),
  description: 'That page does not exist. Head back to the homepage to start a naming contest.',
  index: false,
};

// Strip a trailing slash (except root) so /contact and /contact/ resolve alike.
function normalize(pathname) {
  if (!pathname || pathname === '/') return '/';
  return pathname.replace(/\/+$/, '') || '/';
}

export function resolveMeta(pathname) {
  const path = normalize(pathname);
  const base = ROUTE_META[path]
    || PREFIX_META.find((p) => path.startsWith(p.prefix))
    || NOT_FOUND_META;
  return {
    title: base.title,
    description: base.description,
    index: !!base.index,
    ogType: base.ogType || 'website',
    // Canonical only for indexable pages; noindex pages get none.
    canonical: base.index ? `${SITE_URL}${path === '/' ? '/' : path}` : null,
    url: `${SITE_URL}${path === '/' ? '/' : path}`,
    image: DEFAULT_OG_IMAGE,
  };
}
