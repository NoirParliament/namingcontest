// Shared email design system for all transactional mail.
//
// Design rules (deliberately restrained — this is what keeps us out of the
// Promotions tab as much as the copy does):
//   • Cream page, white card, ONE solid accent bar in the CONTEST'S segment
//     colour — no gradients (Outlook drops them) and no images.
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

export const FROM = 'NamingContest <hello@namingcontest.com>';

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
      <div style="height:5px;background:${c.accent};line-height:5px;font-size:0;">&nbsp;</div>
      <div style="padding:32px;">
        <div style="font-family:${FONT_TEXT};font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${c.ink};">${o.eyebrow}</div>
        <h1 style="font-family:${FONT_DISPLAY};font-size:26px;line-height:1.25;font-weight:700;color:${INK};margin:12px 0 8px;">${o.headline}</h1>
        <p style="font-family:${FONT_TEXT};font-size:15px;line-height:1.55;color:${INK_SOFT};margin:0 0 22px;">${o.bodyHtml}</p>
        ${featureBlock}
        ${panelBlock}
        <a href="${o.ctaUrl}" style="display:inline-block;font-family:${FONT_TEXT};font-size:15px;font-weight:600;color:#ffffff;background:${INK};text-decoration:none;padding:14px 24px;border-radius:999px;">${o.ctaLabel}</a>
        ${noteBlock}
        <p style="font-family:${FONT_TEXT};font-size:13px;line-height:1.5;color:${INK_FAINT};margin:24px 0 0;">
          Questions? Just reply, or reach us at <a href="mailto:hello@namingcontest.com" style="color:${INK_FAINT};">hello@namingcontest.com</a>.
        </p>
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
    'Questions? Just reply, or reach us at hello@namingcontest.com',
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
