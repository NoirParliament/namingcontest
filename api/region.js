// GET /api/region -> { country: "DE" | null }
//
// The visitor's country from Vercel's own geolocation header, so the site
// knows whether to ask before loading analytics (EEA, UK, Switzerland) or
// not (utils/visitorChoice.js). Nothing is stored or logged here; the answer
// is cached only in the visitor's sessionStorage.
export default function handler(req, res) {
  const raw = req.headers['x-vercel-ip-country'];
  const country = typeof raw === 'string' && /^[A-Za-z]{2}$/.test(raw) ? raw.toUpperCase() : null;
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json({ country });
}
