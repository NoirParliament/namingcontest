// V4 contest export utilities — PNG snapshot of the winner share card,
// and a full PDF report (rendered as a high-res image of the styled
// HTML PdfReport component, embedded in a single A4 page).
//
// The PDF embeds a 4x pixel-ratio capture of the HTML report so it
// prints sharply and zooms cleanly. Text isn't selectable (it's
// rasterized), but the design fidelity matches the website pixel for
// pixel — same fonts (Fraunces + Inter loaded via the page's @font-face),
// same segment blobs, same gradient washes, same icons.

import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

// Fixed pixel width the share card always renders at when captured,
// regardless of the user's viewport. Matches the desktop layout width
// of the WinnerHero card (max-width 740 minus a hair of padding), so a
// PNG exported from a 375px phone looks pixel-identical to one
// exported from a 1440px desktop.
const SHARE_CARD_EXPORT_WIDTH = 720;

// Force the winner name onto a SINGLE line in the export clone, shrinking
// its font-size to fit the card width if a long name would otherwise wrap.
// A one-line name can never wrap-and-overlap the credit line — the failure
// mode when html-to-image mis-measures wrapped text. Inline !important
// beats the [data-export-host] 64px rule; a Range measures the true text
// width without changing the element's display or centering.
function fitWinnerNameToOneLine(clone) {
  const nameEl = clone.querySelector('.v4-winner-hero-name');
  const parent = nameEl && nameEl.parentElement;
  if (!nameEl || !parent) return;
  const ps = getComputedStyle(parent);
  const avail = parent.clientWidth
    - parseFloat(ps.paddingLeft || '0')
    - parseFloat(ps.paddingRight || '0');
  nameEl.style.whiteSpace = 'nowrap';
  const textWidth = () => {
    const r = document.createRange();
    r.selectNodeContents(nameEl);
    return r.getBoundingClientRect().width;
  };
  let fs = 64, guard = 0;
  nameEl.style.setProperty('font-size', fs + 'px', 'important');
  while (textWidth() > avail && fs > 26 && guard++ < 40) {
    fs -= 1.5;
    nameEl.style.setProperty('font-size', fs + 'px', 'important');
  }
}

// ─────────────────────────────────────────────────────────────────────
// PNG: snapshot the share card.
//
// The on-screen WinnerHero is responsive (mobile @media rules shrink
// the title to 44px, tighten padding, and the card fills whatever
// width the parent container gives it). Capturing the LIVE element on
// a 375px phone therefore produced a tiny PNG with cramped mobile
// typography — a completely different artifact than the desktop one.
//
// Fix: deep-clone the element into a fixed-width off-screen host and
// snapshot the clone. The body picks up `.is-exporting-card` for the
// duration of capture, which scopes a set of !important overrides
// (see styles/v4.css) that re-assert the desktop font sizes / padding
// regardless of the surrounding @media queries. On-screen layout is
// untouched (the clone is at left:-10000px, opacity:0 host); the
// resulting PNG matches desktop exactly.
// ─────────────────────────────────────────────────────────────────────
export async function downloadShareCard(element, contestName = 'winner') {
  if (!element) {
    console.warn('downloadShareCard: no element provided');
    return;
  }
  const restore = mountDesktopExportClone(element);
  try {
    const clone = restore.clone;
    // Wait for web fonts to load AND a couple of paints before capture.
    // Without this, html-to-image measures the name with a fallback
    // serif (wider than Fraunces), wraps a 2-word name like "Brookside
    // Rovers" to two lines, but only reserves one line's height — so the
    // second line overflows down and collides with the credit line.
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch { /* fonts API unavailable */ }
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Guarantee a single-line name (shrink to fit) so it can never overlap
    // the credit, regardless of how html-to-image measures wrapped text.
    fitWinnerNameToOneLine(clone);
    await new Promise((r) => requestAnimationFrame(r));

    const dataUrl = await toPng(clone, {
      pixelRatio: 2,
      cacheBust: true,
      width: SHARE_CARD_EXPORT_WIDTH,
      // Transparent so the card's rounded corners stay rounded in the
      // PNG — no white rectangle bleeding outside the card edges.
      backgroundColor: undefined,
    });
    const safeName = (contestName || 'winner')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const link = document.createElement('a');
    link.download = `${safeName}-winner.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('PNG export failed', err);
    window.alert('Could not generate the share card image.');
  } finally {
    restore();
  }
}

// Deep-clone `source` into a fixed-width off-screen host so the export
// always renders at desktop dimensions. Adds `.is-exporting-card` to
// the body so the override stylesheet kicks in for the clone. Returns
// a restore function; the function also carries `.clone` as a property
// so the caller can capture from the clone directly.
function mountDesktopExportClone(source) {
  const clone = source.cloneNode(true);
  // Strip the entrance animation on the clone — html-to-image captures
  // a single frame and `opacity: 0` from `animation-fill-mode: forwards`
  // on the very first frame yields a blank PNG.
  clone.style.animation = 'none';
  clone.style.opacity = '1';
  clone.style.transform = 'none';

  const host = document.createElement('div');
  host.setAttribute('data-export-host', '1');
  host.style.cssText = [
    'position: fixed',
    'left: -10000px',
    'top: 0',
    `width: ${SHARE_CARD_EXPORT_WIDTH}px`,
    'background: transparent',
    'z-index: -1',
    'pointer-events: none',
    // Force a layout context so the clone resolves its dimensions.
    'contain: layout',
  ].join('; ');
  host.appendChild(clone);
  document.body.appendChild(host);

  const restore = () => {
    if (host.parentNode) host.parentNode.removeChild(host);
  };
  restore.clone = clone;
  return restore;
}

// ─────────────────────────────────────────────────────────────────────
// PDF: capture the hidden <PdfReport /> HTML node at 4x and embed as
// a single A4 page. Trade-off: text isn't selectable, but the design
// matches the live website exactly (custom fonts, gradients, blobs).
// ─────────────────────────────────────────────────────────────────────
export async function downloadFullReport(reportElement, contestName = 'contest') {
  if (!reportElement) {
    console.warn('downloadFullReport: no element provided');
    window.alert('Report not ready yet. Try again in a moment.');
    return;
  }
  // The report lives off-screen with opacity:0 so the user never sees
  // it. html-to-image won't render an opacity:0 element correctly
  // (rasterizes as transparent), so we temporarily bump opacity to 1
  // during capture, then revert.
  const prevOpacity = reportElement.style.opacity;
  reportElement.style.opacity = '1';
  try {
    // Wait for fonts + a paint so the opacity change applies and text is
    // measured/rendered with the real fonts (not a fallback) before capture.
    if (document.fonts && document.fonts.ready) {
      try { await document.fonts.ready; } catch { /* fonts API unavailable */ }
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    // 4x pixel ratio = ~3176 × 4492 image for an 794 × 1123 element.
    // Sharper than 2x, still under typical browser canvas limits.
    const dataUrl = await toPng(reportElement, {
      pixelRatio: 4,
      cacheBust: true,
      width: 794,
      height: 1123,
    });

    // Restore the hidden state before doing any other work.
    reportElement.style.opacity = prevOpacity || '0';

    if (!dataUrl || dataUrl.length < 1000) {
      throw new Error('Empty image data from html-to-image');
    }

    // Build a single A4 page and drop the image in full-bleed.
    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const W = doc.internal.pageSize.getWidth();   // 595pt
    const H = doc.internal.pageSize.getHeight();  // 842pt
    doc.addImage(dataUrl, 'PNG', 0, 0, W, H);

    const safeName = (contestName || 'contest')
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    doc.save(`${safeName}-report.pdf`);
  } catch (err) {
    // Always restore even on failure.
    reportElement.style.opacity = prevOpacity || '0';
    console.error('PDF export failed', err);
    window.alert('Could not generate the report PDF. Check the console for details.');
  }
}
