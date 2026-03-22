import { useEffect, useRef } from 'react';

const CARD_W = 300;
const CARD_H = 190;
const CARD_GAP = 36;
const CARD_COUNT = 24;
const LIGHT_BAR_W = 3;
const FADE_ZONE = 50;

const SEGMENTS = [
  {
    group: 'business', color: '#eaef09', rgb: '234,239,9',
    title: 'Business Names',
    tags: ['Company', 'Product', 'Project', 'Rebrand'],
  },
  {
    group: 'team', color: '#8B5CF6', rgb: '139,92,246',
    title: 'Group Names',
    tags: ['Sports Team', 'Band', 'Podcast', 'Gaming'],
  },
  {
    group: 'personal', color: '#10B981', rgb: '16,185,129',
    title: 'Personal Names',
    tags: ['Baby Name', 'Pet Name', 'Home', 'Something Fun'],
  },
];

const PROCESS_WORDS = [
  'Submit a Brief', 'Collect Ideas', 'Anonymous Voting', 'Curate Shortlist',
  'Review Finalists', 'Final Vote', 'Announce Winner', 'PDF Report',
  'Quality Score', 'Naming Tips', 'Distinctiveness', 'Memorability',
  'Pronunciation', 'Brand Equity', 'Brevity', 'Clarity', 'Euphony',
  'Trademark Fit', 'Cultural Alignment', 'Build Your Brief',
  'Invite Participants', 'Open Submissions', 'Catchword Method',
  '10 Naming Criteria', 'Voting Phase', 'Creator Flow', 'Participant Flow',
  'Name Shortlist', 'Team Alignment', 'Democratic Choice',
  'Structured Process', 'Brief Builder', 'Contest Overview',
  'Naming Methodology', '25 Years Expertise', 'Shortlist Review',
];

function genText(cols, rows) {
  let flow = PROCESS_WORDS.join(' · ');
  while (flow.length < cols * rows + cols) {
    flow += ' · ' + PROCESS_WORDS[Math.floor(Math.random() * PROCESS_WORDS.length)];
  }
  let out = '';
  for (let r = 0; r < rows; r++) {
    let line = flow.slice(r * cols, (r + 1) * cols);
    if (line.length < cols) line += ' '.repeat(cols - line.length);
    out += line + (r < rows - 1 ? '\n' : '');
  }
  return out;
}

function buildCard(idx) {
  const seg = SEGMENTS[idx % 3];
  const wrapper = document.createElement('div');
  wrapper.className = 'nc-card-wrapper';
  wrapper.style.cssText = `position:relative;width:${CARD_W}px;height:${CARD_H}px;flex-shrink:0;`;

  // Back — process text, revealed left of scanner
  const back = document.createElement('div');
  back.dataset.role = 'back';
  back.style.cssText = `
    position:absolute;inset:0;border-radius:14px;overflow:hidden;
    background:#0d0d0d;border:0.5px solid rgba(${seg.rgb},0.15);z-index:1;
  `;
  const pre = document.createElement('pre');
  const charW = 6; const lineH = 12;
  const cols = Math.floor(CARD_W / charW);
  const rows = Math.floor(CARD_H / lineH);
  pre.style.cssText = `
    position:absolute;top:0;left:0;width:100%;height:100%;
    color:rgba(${seg.rgb},0.55);font-family:'Courier New',monospace;
    font-size:9.5px;line-height:${lineH}px;overflow:hidden;white-space:pre;
    margin:0;padding:4px 0 0 3px;box-sizing:border-box;
  `;
  pre.textContent = genText(cols, rows);
  back.appendChild(pre);

  // Front — styled segment card, visible right of scanner
  const front = document.createElement('div');
  front.dataset.role = 'front';
  front.style.cssText = `
    position:absolute;inset:0;border-radius:14px;overflow:hidden;
    background:#1a1a1a;border:0.5px solid rgba(${seg.rgb},0.2);
    padding:20px 18px;box-sizing:border-box;
    display:flex;flex-direction:column;gap:10px;z-index:2;
  `;

  // Accent dot
  const dot = document.createElement('div');
  dot.style.cssText = `
    position:absolute;top:14px;right:14px;
    width:6px;height:6px;border-radius:50%;
    background:${seg.color};box-shadow:0 0 8px ${seg.color};
  `;
  front.appendChild(dot);

  // Title
  const title = document.createElement('div');
  title.style.cssText = `
    font-family:Inter,sans-serif;font-size:14px;font-weight:700;
    color:#fff;line-height:1.3;padding-right:18px;flex:1;
  `;
  title.textContent = seg.title;
  front.appendChild(title);

  // Tags
  const tagRow = document.createElement('div');
  tagRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';
  seg.tags.forEach(t => {
    const el = document.createElement('span');
    el.style.cssText = `
      padding:2px 8px;font-size:9.5px;font-weight:600;font-family:Inter,sans-serif;
      color:${seg.color};background:rgba(${seg.rgb},0.1);
      border:0.5px solid rgba(${seg.rgb},0.3);border-radius:9999px;
    `;
    el.textContent = t;
    tagRow.appendChild(el);
  });
  front.appendChild(tagRow);

  wrapper.appendChild(back);
  wrapper.appendChild(front);
  return wrapper;
}

export default function HeroCardStream() {
  const wrapRef = useRef(null);
  const scanCanvasRef = useRef(null);
  const cardLineRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const scanCanvas = scanCanvasRef.current;
    const cardLine = cardLineRef.current;
    if (!wrap || !scanCanvas || !cardLine) return;

    // Build cards
    for (let i = 0; i < CARD_COUNT; i++) cardLine.appendChild(buildCard(i));

    let containerW = wrap.offsetWidth;
    let containerH = wrap.offsetHeight;
    const cardLineWidth = (CARD_W + CARD_GAP) * CARD_COUNT;

    // Scanner canvas setup
    const ctx = scanCanvas.getContext('2d');
    scanCanvas.width = containerW;
    scanCanvas.height = containerH;

    // Particle gradient sprite
    const gCvs = document.createElement('canvas');
    gCvs.width = gCvs.height = 6;
    const gCtx = gCvs.getContext('2d');
    const gh = 3;
    const grd = gCtx.createRadialGradient(gh, gh, 0, gh, gh, gh);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grd.addColorStop(0.7, 'rgba(255,255,255,0.3)');
    grd.addColorStop(1, 'transparent');
    gCtx.fillStyle = grd;
    gCtx.beginPath();
    gCtx.arc(gh, gh, gh, 0, Math.PI * 2);
    gCtx.fill();

    // Particles
    let scanningActive = false;
    let currentGlow = 1;
    const particles = [];

    function mkParticle() {
      return {
        x: containerW / 2 + (Math.random() - 0.5) * LIGHT_BAR_W,
        y: Math.random() * containerH,
        vx: Math.random() * 0.7 + 0.15,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 0.6 + 0.3,
        alpha: Math.random() * 0.4 + 0.55,
        origAlpha: 0,
        life: 1,
        decay: Math.random() * 0.018 + 0.004,
        time: 0,
        tSpeed: Math.random() * 0.06 + 0.02,
        tAmt: Math.random() * 0.18 + 0.08,
      };
    }
    for (let i = 0; i < 280; i++) {
      const p = mkParticle(); p.origAlpha = p.alpha; particles.push(p);
    }

    function drawScanner() {
      const lx = containerW / 2;

      const beamH = CARD_H + 24;
      const beamTop = (containerH - beamH) / 2;

      const vertGrad = ctx.createLinearGradient(0, beamTop, 0, beamTop + beamH);
      vertGrad.addColorStop(0, 'rgba(255,255,255,0)');
      vertGrad.addColorStop(FADE_ZONE / beamH, 'rgba(255,255,255,1)');
      vertGrad.addColorStop(1 - FADE_ZONE / beamH, 'rgba(255,255,255,1)');
      vertGrad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.globalCompositeOperation = 'lighter';

      // Core beam — stays at LIGHT_BAR_W wide always
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(255,255,255,1)';
      ctx.beginPath();
      ctx.roundRect(lx - LIGHT_BAR_W / 2, beamTop, LIGHT_BAR_W, beamH, 2);
      ctx.fill();

      // Tiny soft edge (max 6px) — no pulsing
      const edge = ctx.createLinearGradient(lx - 6, 0, lx + 6, 0);
      edge.addColorStop(0, 'rgba(255,255,255,0)');
      edge.addColorStop(0.5, 'rgba(255,255,255,0.15)');
      edge.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = edge;
      ctx.beginPath();
      ctx.roundRect(lx - 6, beamTop, 12, beamH, 4);
      ctx.fill();

      // Vertical fade mask
      ctx.globalCompositeOperation = 'destination-in';
      ctx.globalAlpha = 1;
      ctx.fillStyle = vertGrad;
      ctx.fillRect(0, beamTop, containerW, beamH);
    }

    function renderFrame() {
      currentGlow += ((scanningActive ? 3.5 : 1) - currentGlow) * 0.05;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, containerW, containerH);
      drawScanner();

      ctx.globalCompositeOperation = 'lighter';
      const beamH = CARD_H + 24;
      const beamTop = (containerH - beamH) / 2;
      const beamBot = beamTop + beamH;
      const maxP = scanningActive ? 200 : 100;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy; p.time++;
        p.alpha = p.origAlpha * p.life + Math.sin(p.time * p.tSpeed) * p.tAmt;
        p.life -= p.decay;
        if (p.x > containerW + 10 || p.life <= 0) {
          p.x = containerW / 2 + (Math.random() - 0.5) * LIGHT_BAR_W;
          p.y = beamTop + Math.random() * beamH;
          p.vx = Math.random() * 0.7 + 0.15;
          p.vy = (Math.random() - 0.5) * 0.25;
          p.alpha = Math.random() * 0.4 + 0.55;
          p.origAlpha = p.alpha;
          p.life = 1; p.time = 0;
        }
        if (p.life <= 0) continue;
        let fade = 1;
        if (p.y < beamTop + FADE_ZONE) fade = (p.y - beamTop) / FADE_ZONE;
        else if (p.y > beamBot - FADE_ZONE) fade = (beamBot - p.y) / FADE_ZONE;
        ctx.globalAlpha = p.alpha * Math.max(0, Math.min(1, fade));
        ctx.drawImage(gCvs, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      if (particles.length < maxP) {
        const np = mkParticle(); np.origAlpha = np.alpha; particles.push(np);
      }
    }

    // Card stream
    // Start with Team card (index 1, purple) centered under the scanner
    let position = containerW / 2 - (1 * (CARD_W + CARD_GAP)) - CARD_W / 2;
    let velocity = 150;
    let isAnimating = true;
    let isDragging = false;
    let lastMouseX = 0;
    let mouseVelocity = 0;
    let lastTime = 0;

    function updateClipping() {
      const wrapRect = wrap.getBoundingClientRect();
      const scannerX = wrapRect.left + wrapRect.width / 2;
      const sL = scannerX - LIGHT_BAR_W / 2;
      const sR = scannerX + LIGHT_BAR_W / 2;
      let any = false;

      cardLine.querySelectorAll('.nc-card-wrapper').forEach(card => {
        const rect = card.getBoundingClientRect();
        const front = card.querySelector('[data-role="front"]');
        const back = card.querySelector('[data-role="back"]');
        if (!front || !back) return;

        if (rect.left < sR && rect.right > sL) {
          any = true;
          const iL = Math.max(sL - rect.left, 0);
          const iR = Math.min(sR - rect.left, rect.width);
          front.style.clipPath = `inset(0 0 0 ${(iL / rect.width) * 100}%)`;
          back.style.clipPath = `inset(0 calc(100% - ${(iR / rect.width) * 100}%) 0 0)`;
        } else if (rect.right < sL) {
          front.style.clipPath = 'inset(0 0 0 100%)';
          back.style.clipPath = 'none';
        } else {
          front.style.clipPath = 'none';
          back.style.clipPath = 'inset(0 100% 0 0)';
        }
      });
      scanningActive = any;
    }

    function updatePosition() {
      if (position < -cardLineWidth) position = containerW;
      else if (position > containerW) position = -cardLineWidth;
      cardLine.style.transform = `translateX(${position}px)`;
      updateClipping();
    }

    let rafId;
    function loop(ts) {
      const dt = Math.min((ts - lastTime) / 1000, 0.05);
      lastTime = ts;
      if (isAnimating && !isDragging) {
        velocity = velocity > 50 ? velocity * 0.97 : 50;
        position += velocity * -1 * dt;
        updatePosition();
      }
      renderFrame();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    function onDown(e) {
      isDragging = true; isAnimating = false;
      lastMouseX = e.clientX; mouseVelocity = 0;
      const t = window.getComputedStyle(cardLine).transform;
      if (t !== 'none') position = new DOMMatrix(t).m41;
      cardLine.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }
    function onMove(e) {
      if (!isDragging) return;
      const dx = e.clientX - lastMouseX;
      position += dx; mouseVelocity = dx * 60; lastMouseX = e.clientX;
      cardLine.style.transform = `translateX(${position}px)`;
      updateClipping();
    }
    function onUp() {
      if (!isDragging) return;
      isDragging = false;
      cardLine.style.cursor = 'grab';
      velocity = Math.abs(mouseVelocity) > 25 ? Math.abs(mouseVelocity) : 75;
      isAnimating = true;
      document.body.style.userSelect = '';
    }
    function onResize() {
      containerW = wrap.offsetWidth;
      containerH = wrap.offsetHeight;
      scanCanvas.width = containerW;
      scanCanvas.height = containerH;
    }

    cardLine.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    window.addEventListener('resize', onResize);
    updatePosition();

    return () => {
      cancelAnimationFrame(rafId);
      cardLine.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: 360, overflow: 'hidden' }}>

      <div ref={wrapRef} style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
        <canvas ref={scanCanvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 15, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: '100%', height: CARD_H, display: 'flex', alignItems: 'center', overflow: 'visible' }}>
          <div
            ref={cardLineRef}
            style={{ display: 'flex', alignItems: 'center', gap: CARD_GAP, whiteSpace: 'nowrap', cursor: 'grab', userSelect: 'none', willChange: 'transform' }}
          />
        </div>
      </div>
    </div>
  );
}
