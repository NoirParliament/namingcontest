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

// ─────────────────────────────────────────────────────────────────────
// PNG: snapshot the share card.
// ─────────────────────────────────────────────────────────────────────
export async function downloadShareCard(element, contestName = 'winner') {
  if (!element) {
    console.warn('downloadShareCard: no element provided');
    return;
  }
  try {
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      cacheBust: true,
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
  }
}

// ─────────────────────────────────────────────────────────────────────
// PDF: capture the hidden <PdfReport /> HTML node at 4x and embed as
// a single A4 page. Trade-off: text isn't selectable, but the design
// matches the live website exactly (custom fonts, gradients, blobs).
// ─────────────────────────────────────────────────────────────────────
export async function downloadFullReport(reportElement, contestName = 'contest') {
  if (!reportElement) {
    console.warn('downloadFullReport: no element provided');
    window.alert('Report not ready yet — try again in a moment.');
    return;
  }
  // The report lives off-screen with opacity:0 so the user never sees
  // it. html-to-image won't render an opacity:0 element correctly
  // (rasterizes as transparent), so we temporarily bump opacity to 1
  // during capture, then revert.
  const prevOpacity = reportElement.style.opacity;
  reportElement.style.opacity = '1';
  try {
    // Wait one paint so the opacity change applies before capture.
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
