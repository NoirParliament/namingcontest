// Shared email design system for all transactional mail.
//
// Design rules (deliberately restrained — this is what keeps us out of the
// Promotions tab as much as the copy does):
//   • Cream page, white card, dark logo band — no gradients (Outlook drops
//     them). There is deliberately NO accent strip under the band: against
//     the dark header it read as a seam rather than as design. The contest's
//     segment colour still comes through in the eyebrow, the tinted panel and
//     the feature line, so each email keeps its own identity.
//   • ONE image: the logo. Image-only emails and big hero graphics are what
//     trip spam filters; a small wordmark is standard transactional practice.
//     It's a PNG (clients strip SVG) served from our own domain, with alt text
//     styled to degrade into the brand name when images are blocked — which
//     Outlook does by default.
//   • Fraunces-first serif for the headline, Inter-first sans for body. Most
//     clients strip web fonts, so the fallbacks (Georgia / Arial) are what
//     people actually see — chosen to still read on-brand.
//   • ONE call to action, styled as our real black pill button (an <a>, since
//     email has no real buttons and no hover).
//   • Every message also ships a plain-text alternative, which measurably
//     improves spam scoring.
//
// Colours come from the segment (band = periwinkle, sports = mint, …) so each
// email wears its own contest's identity rather than a random accent.

const FONT_DISPLAY = "Fraunces, Georgia, 'Times New Roman', serif";
const FONT_TEXT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

// Absolute, and deliberately hardcoded to the production domain: an email is
// read long after it's sent, from a client that has no notion of our origin,
// so a preview/localhost URL would render as a broken image forever.
//
// The logo sits on a dark band rather than on the white card, which is what
// makes it dark-mode-proof: clients that force-invert backgrounds can turn a
// white card dark and swallow a dark wordmark, but a band we've explicitly
// painted stays put — and the white-on-dark logo reads either way.
const LOGO_URL = 'https://namingcontest.com/email-logo-white.png';
const LOGO_W = 180;
const LOGO_H = 41;
const BAND_BG = '#231f20';

const INK = '#030302';
const INK_SOFT = '#5a5754';
const INK_FAINT = '#8a8783';
const PAGE_BG = '#fcf9f7';
const CARD_BG = '#ffffff';
const CARD_BORDER = '#efeae6';

// segment id → { accent (pastel panel/bar), ink (deep tone for the eyebrow) }
const SEGMENT_COLORS: Record<string, { accent: string; ink: string }> = {
  p1: { accent: '#fadecc', ink: '#9c4818' }, // baby — blush
  p2: { accent: '#fceebc', ink: '#8a6a14' }, // pet — butter
  p3: { accent: '#a6dcb3', ink: '#1f5430' }, // home — mint
  p4: { accent: '#b3c4f0', ink: '#283b78' }, // other personal — periwinkle
  t1: { accent: '#a6dcb3', ink: '#1f5430' }, // sports — mint
  t2: { accent: '#b3c4f0', ink: '#283b78' }, // band — periwinkle
  t3: { accent: '#c4dffb', ink: '#1d4f7a' }, // podcast — sky
  t4: { accent: '#fadecc', ink: '#9c4818' }, // civic — blush
  t5: { accent: '#fceebc', ink: '#8a6a14' }, // gaming — butter
  t6: { accent: '#b3c4f0', ink: '#283b78' }, // other team — periwinkle
  b1: { accent: '#b3c4f0', ink: '#283b78' }, // company — periwinkle
  b2: { accent: '#fceebc', ink: '#8a6a14' }, // product — butter
  b3: { accent: '#fadecc', ink: '#9c4818' }, // project — blush
  b4: { accent: '#a6dcb3', ink: '#1f5430' }, // rebrand — mint
  b5: { accent: '#c4dffb', ink: '#1d4f7a' }, // other business — sky
};
const DEFAULT_COLORS = { accent: '#fadecc', ink: '#9c4818' };

export function segmentColors(subId?: string | null) {
  return (subId && SEGMENT_COLORS[subId]) || DEFAULT_COLORS;
}

// Everything we send goes out as noreply@ — Supabase Auth already does, and
// matching it keeps one sender identity across the product. hello@ stays the
// human channel (contact form, and the address quoted in the footer), it just
// isn't a FROM. Resend verifies the domain, not the local part, so no extra
// sender setup is needed.
export const FROM = 'NamingContest <noreply@namingcontest.com>';

// ⚠️ PLACEHOLDER HANDLES — these accounts don't exist yet. Confirm or register
// them before launch; an unowned handle sends recipients to a stranger's
// profile, which is worse than having no icon at all.
const SOCIAL = [
  { name: 'X', url: 'https://x.com/namingcontest', icon: 'email-icon-x.png' },
  { name: 'LinkedIn', url: 'https://www.linkedin.com/company/namingcontest', icon: 'email-icon-linkedin.png' },
  { name: 'Instagram', url: 'https://www.instagram.com/namingcontest', icon: 'email-icon-instagram.png' },
];

// The postal address isn't decoration: a real physical address is a
// legitimacy signal spam filters weigh, and CAN-SPAM requires one on
// commercial mail. Entity details come from the Privacy Policy.
const LEGAL_ENTITY = 'The Cypher Group, LLC · 3645 Grand Avenue, Suite 206, Oakland, CA 94610, USA';

const FOOTER_HTML = `
        <div style="border-top:1px solid ${CARD_BORDER};margin:28px 0 0;padding:22px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px;"><tr>
            ${SOCIAL.map((s) => `<td style="padding-right:10px;"><a href="${s.url}"><img src="https://namingcontest.com/${s.icon}" width="32" height="32" alt="${s.name}" style="display:block;border:0;outline:none;width:32px;height:32px;" /></a></td>`).join('')}
          </tr></table>
          <p style="font-family:${FONT_TEXT};font-size:12px;line-height:1.6;color:${INK_FAINT};margin:0 0 6px;">
            <a href="https://namingcontest.com/privacy" style="color:${INK_FAINT};">Privacy Policy</a>
            &nbsp;·&nbsp; <a href="https://namingcontest.com/terms" style="color:${INK_FAINT};">Terms of Service</a>
            &nbsp;·&nbsp; <a href="https://namingcontest.com/contact" style="color:${INK_FAINT};">Contact</a>
          </p>
          <p style="font-family:${FONT_TEXT};font-size:12px;line-height:1.6;color:${INK_FAINT};margin:0 0 4px;">${LEGAL_ENTITY}</p>
          <p style="font-family:${FONT_TEXT};font-size:12px;line-height:1.6;color:${INK_FAINT};margin:0;">© ${new Date().getFullYear()} NamingContest</p>
        </div>`;

const FOOTER_TEXT = [
  'Privacy Policy: https://namingcontest.com/privacy',
  'Terms of Service: https://namingcontest.com/terms',
  'Contact: https://namingcontest.com/contact',
  '',
  LEGAL_ENTITY,
  `© ${new Date().getFullYear()} NamingContest`,
].join('\n');

export type BuildEmailOpts = {
  subId?: string | null;
  eyebrow: string;
  headline: string;
  /** May contain <strong>. Keep it to a sentence or two. */
  bodyHtml: string;
  /** Plain-text equivalent of bodyHtml. */
  bodyText: string;
  /** Optional large serif feature line (e.g. the winning name). */
  feature?: string;
  /** Optional tinted detail panel. */
  panel?: { label: string; value: string; link?: { label: string; url: string } };
  ctaLabel: string;
  ctaUrl: string;
  /** Optional extra line under the CTA (e.g. a deadline). */
  note?: string;
};

export function buildEmail(o: BuildEmailOpts): { html: string; text: string } {
  const c = segmentColors(o.subId);

  const featureBlock = o.feature
    ? `<div style="font-family:${FONT_DISPLAY};font-style:italic;font-size:28px;line-height:1.2;font-weight:700;color:${INK};background:${c.accent};border-radius:14px;padding:18px 20px;margin:0 0 22px;">${o.feature}</div>`
    : '';

  const panelBlock = o.panel
    ? `<div style="background:${c.accent};border-radius:14px;padding:16px 18px;margin:0 0 24px;">
         <div style="font-family:${FONT_TEXT};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${c.ink};">${o.panel.label}</div>
         <div style="font-family:${FONT_TEXT};font-size:18px;font-weight:700;color:${INK};margin-top:4px;">${o.panel.value}</div>
         ${o.panel.link ? `<div style="margin-top:8px;"><a href="${o.panel.link.url}" style="font-family:${FONT_TEXT};font-size:14px;font-weight:600;color:${c.ink};">${o.panel.link.label} →</a></div>` : ''}
       </div>`
    : '';

  const noteBlock = o.note
    ? `<p style="font-family:${FONT_TEXT};font-size:13px;line-height:1.5;color:${INK_FAINT};margin:16px 0 0;">${o.note}</p>`
    : '';

  const html = `<!doctype html>
<html><head><meta charset="utf-8"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
  <div style="margin:0;padding:32px 16px;background:${PAGE_BG};">
    <div style="max-width:520px;margin:0 auto;background:${CARD_BG};border:1px solid ${CARD_BORDER};border-radius:20px;overflow:hidden;">
      <div style="background:${BAND_BG};padding:22px 32px;line-height:0;">
        <img src="${LOGO_URL}" width="${LOGO_W}" height="${LOGO_H}" alt="NamingContest" style="display:block;border:0;outline:none;text-decoration:none;width:${LOGO_W}px;height:${LOGO_H}px;font-family:${FONT_TEXT};font-size:18px;font-weight:700;color:#ffffff;" />
      </div>
      <div style="padding:32px;">
        <div style="font-family:${FONT_TEXT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${c.ink};">${o.eyebrow}</div>
        <h1 style="font-family:${FONT_DISPLAY};font-size:26px;line-height:1.25;font-weight:700;color:${INK};margin:12px 0 8px;">${o.headline}</h1>
        <p style="font-family:${FONT_TEXT};font-size:15px;line-height:1.55;color:${INK_SOFT};margin:0 0 22px;">${o.bodyHtml}</p>
        ${featureBlock}
        ${panelBlock}
        <a href="${o.ctaUrl}" style="display:inline-block;font-family:${FONT_TEXT};font-size:15px;font-weight:600;color:#ffffff;background:${INK};text-decoration:none;padding:14px 24px;border-radius:999px;">${o.ctaLabel}</a>
        ${noteBlock}
        <p style="font-family:${FONT_TEXT};font-size:13px;line-height:1.5;color:${INK_FAINT};margin:24px 0 0;">
          This message is sent automatically and replies aren't monitored. Questions? Reach us at <a href="mailto:hello@namingcontest.com" style="color:${INK_FAINT};">hello@namingcontest.com</a>.
        </p>
${FOOTER_HTML}
      </div>
    </div>
  </div>
</body></html>`;

  const text = [
    o.eyebrow.toUpperCase(),
    '',
    o.headline,
    '',
    o.bodyText,
    o.feature ? `\n${o.feature}\n` : '',
    o.panel ? `${o.panel.label}: ${o.panel.value}${o.panel.link ? `\n${o.panel.link.label}: ${o.panel.link.url}` : ''}\n` : '',
    `${o.ctaLabel}: ${o.ctaUrl}`,
    o.note ? `\n${o.note}` : '',
    '',
    "This message is sent automatically and replies aren't monitored.",
    'Questions? Reach us at hello@namingcontest.com',
    '',
    FOOTER_TEXT,
  ].filter(Boolean).join('\n');

  return { html, text };
}

/** Send one message through Resend (html + plain-text alternative). */
export async function sendEmail(apiKey: string, to: string, subject: string, body: { html: string; text: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html: body.html, text: body.text }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
