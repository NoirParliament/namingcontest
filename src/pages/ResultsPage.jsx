import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { Trophy, Copy, Check, DownloadSimple, Share, ArrowRight, TwitterLogo, LinkedinLogo, Brain, Scales, Target, Envelope } from '@phosphor-icons/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getJourneyMeta } from '../utils/journey';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business', textColor: '#000' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team', textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal', textColor: '#fff' },
};

const MEDALS = ['#1', '#2', '#3'];

function CopyBtn({ text, label }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'transparent', color: copied ? '#10B981' : '#fff', fontSize: 13, cursor: 'pointer' }}>
      {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> {label}</>}
    </button>
  );
}

function ParticleCanvas({ baseHue }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const particlesArr = [], dustArr = [], ripplesArr = [], fwArr = [];
    let frameCount = 0, animId;
    const mouse = { x: null, y: null };

    class Particle {
      constructor(x, y, isFW = false) {
        const spd = isFW ? Math.random() * 2 + 1 : Math.random() * 0.5 + 0.3;
        Object.assign(this, {
          isFW, x, y,
          vx: Math.cos(Math.random() * Math.PI * 2) * spd,
          vy: Math.sin(Math.random() * Math.PI * 2) * spd,
          size: isFW ? Math.random() * 2 + 2 : Math.random() * 2.5 + 0.8,
          hue: baseHue + (Math.random() - 0.5) * 50,
          alpha: 1, sizeDir: Math.random() < 0.5 ? -1 : 1, trail: [],
        });
      }
      update() {
        const dist = mouse.x !== null ? (mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2 : 0;
        if (!this.isFW) {
          const force = dist && dist < 22500 ? (22500 - dist) / 22500 : 0;
          if (mouse.x === null) { this.vx += (Math.random() - 0.5) * 0.03; this.vy += (Math.random() - 0.5) * 0.03; }
          if (dist) { const sd = Math.sqrt(dist); this.vx += ((mouse.x - this.x) / sd) * force * 0.1; this.vy += ((mouse.y - this.y) / sd) * force * 0.1; }
          this.vx *= mouse.x !== null ? 0.99 : 0.998;
          this.vy *= mouse.y !== null ? 0.99 : 0.998;
          // Repel from centre text zone (ellipse covering ~middle 60% x 50% of canvas)
          const cx = canvas.width / 2, cy = canvas.height / 2;
          const rx = canvas.width * 0.30, ry = canvas.height * 0.28;
          const ex = (this.x - cx) / rx, ey = (this.y - cy) / ry;
          const ed = ex * ex + ey * ey;
          if (ed < 1) {
            const strength = (1 - ed) * 0.6;
            const angle = Math.atan2(this.y - cy, this.x - cx);
            this.vx += Math.cos(angle) * strength;
            this.vy += Math.sin(angle) * strength;
          }
        } else { this.alpha -= 0.02; }
        this.x += this.vx; this.y += this.vy;
        if (this.x <= 0 || this.x >= canvas.width) this.vx *= -0.9;
        if (this.y <= 0 || this.y >= canvas.height) this.vy *= -0.9;
        this.size += this.sizeDir * 0.05;
        if (this.size > 3.5 || this.size < 0.8) this.sizeDir *= -1;
        this.hue = baseHue + Math.sin(frameCount * 0.01 + this.x * 0.005) * 25;
        if (frameCount % 2 === 0 && (Math.abs(this.vx) > 0.1 || Math.abs(this.vy) > 0.1)) {
          this.trail.push({ x: this.x, y: this.y, hue: this.hue, alpha: this.alpha });
          if (this.trail.length > 10) this.trail.shift();
        }
      }
      draw() {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        g.addColorStop(0, `hsla(${this.hue},75%,65%,${Math.max(this.alpha, 0)})`);
        g.addColorStop(1, `hsla(${this.hue + 20},70%,35%,${Math.max(this.alpha, 0)})`);
        ctx.fillStyle = g; ctx.shadowBlur = 8; ctx.shadowColor = `hsl(${this.hue},75%,55%)`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        if (this.trail.length > 1) {
          ctx.lineWidth = 1;
          for (let i = 0; i < this.trail.length - 1; i++) {
            const t = this.trail[i], t2 = this.trail[i + 1];
            ctx.strokeStyle = `hsla(${t.hue},75%,60%,${Math.max(t.alpha * 0.25, 0)})`;
            ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(t2.x, t2.y); ctx.stroke();
          }
        }
      }
      isDead() { return this.isFW && this.alpha <= 0; }
      isDone() { return false; }
    }

    class Dust {
      constructor() {
        Object.assign(this, {
          x: Math.random() * canvas.width, y: Math.random() * canvas.height,
          size: Math.random() * 1 + 0.3, hue: baseHue + (Math.random() - 0.5) * 40,
          vx: (Math.random() - 0.5) * 0.05, vy: (Math.random() - 0.5) * 0.05,
        });
      }
      update() { this.x = (this.x + this.vx + canvas.width) % canvas.width; this.y = (this.y + this.vy + canvas.height) % canvas.height; }
      draw() { ctx.fillStyle = `hsla(${this.hue},35%,65%,0.18)`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
      isDead() { return false; }
      isDone() { return false; }
    }

    class Ripple {
      constructor(x, y) { Object.assign(this, { x, y, radius: 0, alpha: 0.35, hue: baseHue }); }
      update() { this.radius += 1.5; this.alpha -= 0.012; }
      draw() { ctx.strokeStyle = `hsla(${this.hue},75%,60%,${this.alpha})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.stroke(); }
      isDone() { return this.alpha <= 0; }
      isDead() { return false; }
    }

    function spawnOutsideCenter() {
      // Keep trying random positions until one lands outside the repulsion ellipse
      const cx = canvas.width / 2, cy = canvas.height / 2;
      const rx = canvas.width * 0.30, ry = canvas.height * 0.28;
      let x, y;
      do {
        x = Math.random() * canvas.width;
        y = Math.random() * canvas.height;
      } while (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1);
      return { x, y };
    }

    function build() {
      particlesArr.length = 0; dustArr.length = 0;
      const area = canvas.width * canvas.height;
      const count = Math.min(55, Math.max(15, Math.floor(area / 9000)));
      for (let i = 0; i < count; i++) { const { x, y } = spawnOutsideCenter(); particlesArr.push(new Particle(x, y)); }
      for (let i = 0; i < 70; i++) dustArr.push(new Dust());
    }

    function connect() {
      const gs = 100; const grid = new Map();
      particlesArr.forEach(p => { const k = `${Math.floor(p.x / gs)},${Math.floor(p.y / gs)}`; if (!grid.has(k)) grid.set(k, []); grid.get(k).push(p); });
      ctx.lineWidth = 1;
      particlesArr.forEach(p => {
        const gx = Math.floor(p.x / gs), gy = Math.floor(p.y / gs);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          (grid.get(`${gx + dx},${gy + dy}`) || []).forEach(n => {
            if (n === p) return;
            const d = (n.x - p.x) ** 2 + (n.y - p.y) ** 2;
            if (d < 9000) { ctx.strokeStyle = `hsla(${(p.hue + n.hue) / 2},70%,60%,${1 - Math.sqrt(d) / 95})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(n.x, n.y); ctx.stroke(); }
          });
        }
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(20,20,22,0.88)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      [dustArr, particlesArr, ripplesArr, fwArr].forEach(arr => {
        for (let i = arr.length - 1; i >= 0; i--) { arr[i].update(); arr[i].draw(); if (arr[i].isDone() || arr[i].isDead()) arr.splice(i, 1); }
      });
      connect();
      frameCount++;
      animId = requestAnimationFrame(animate);
    }

    function resize() {
      const p = canvas.parentElement; if (!p) return;
      const r = p.getBoundingClientRect();
      canvas.width = r.width; canvas.height = r.height; build();
    }

    const onMove = e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; ripplesArr.push(new Ripple(mouse.x, mouse.y)); };
    const onLeave = () => { mouse.x = null; mouse.y = null; };
    const onClick = e => {
      const r = canvas.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
      ripplesArr.push(new Ripple(x, y));
      for (let i = 0; i < 12; i++) { const p = new Particle(x, y, true); p.vx = Math.cos(Math.random() * Math.PI * 2) * (Math.random() * 2 + 1); p.vy = Math.sin(Math.random() * Math.PI * 2) * (Math.random() * 2 + 1); fwArr.push(p); }
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    canvas.addEventListener('click', onClick);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      canvas.removeEventListener('click', onClick);
      ro.disconnect();
    };
  }, [baseHue]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: 20, zIndex: 0, display: 'block', opacity: 1 }} />;
}

function SimBtn({ label, icon }) {
  const [clicked, setClicked] = useState(false);
  return (
    <button onClick={() => { setClicked(true); setTimeout(() => setClicked(false), 2000); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'transparent', color: clicked ? '#10B981' : '#fff', fontSize: 13, cursor: 'pointer' }}>
      {icon}{clicked ? 'Done!' : label}
    </button>
  );
}

// Domain checker widget
function DomainChecker() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState(null);
  const check = () => {
    if (!domain.trim()) return;
    const available = Math.random() > 0.4;
    setResult({ available, domain: domain.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') });
  };
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input value={domain} onChange={e => setDomain(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()} placeholder="yourname" style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 8, height: 36, padding: '0 12px', color: '#fff', fontSize: 14, width: 160 }} />
      <span style={{ color: '#7a7a7a', fontSize: 13 }}>.com</span>
      <button onClick={check} style={{ height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, background: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer' }}>Check</button>
      {result && (
        <span style={{ fontSize: 13, color: result.available ? '#10B981' : '#ef4444', fontWeight: 600 }}>
          {result.available ? `✓ ${result.domain}.com is Available!` : `✗ Taken — try .co or add a word`}
        </span>
      )}
    </div>
  );
}

// Social handle checker
function SocialChecker({ platform }) {
  const [checked, setChecked] = useState(false);
  const [available, setAvailable] = useState(null);
  const handle = () => {
    setChecked(true);
    setAvailable(Math.random() > 0.5);
  };
  return (
    <button onClick={handle} style={{ height: 32, padding: '0 12px', border: `1px solid ${checked ? (available ? '#10B981' : '#ef4444') : 'rgba(255,255,255,0.15)'}`, borderRadius: 6, background: 'transparent', color: checked ? (available ? '#10B981' : '#ef4444') : '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>
      {checked ? (available ? `✓ @handle available on ${platform}` : `✗ Taken on ${platform}`) : `Check ${platform}`}
    </button>
  );
}

export default function ResultsPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();

  const meta = getJourneyMeta(contestId);
  const tc = meta;
  // Segment-appropriate candidates (replaces mock submissions)
  const submissions = meta.candidates.map(c => ({ ...c, id: c.id, contestId }));
  const winner = submissions[0];
  const totalVotes = submissions.reduce((sum, s) => sum + s.voteCount, 0);
  const winnerPct = totalVotes > 0 ? Math.round((winner?.voteCount / totalVotes) * 100) : 62;
  const isBusiness = meta.group === 'business';
  const shareUrl = `namingcontest.com/r/${contestId || 'demo'}`;

  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);


  // Read prizes from localStorage (set by BriefBuilder)
  const prizeData = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem('contestPrizes') || '{}');
      return {
        submitter: stored.submitterPrizeEnabled ? { name: stored.submitterPrizeName, desc: stored.submitterPrizeDesc } : null,
        voter: stored.voterPrizeEnabled ? { name: stored.voterPrizeName, desc: stored.voterPrizeDesc } : null,
        winnerContact: stored.submitterPrizeEnabled ? { name: 'David Kim', email: 'david.k@example.com' } : null,
        voterWinner: stored.voterPrizeEnabled ? { name: 'Maria Santos', email: 'maria.s@example.com' } : null,
      };
    } catch { return { submitter: null, voter: null, winnerContact: null, voterWinner: null }; }
  })();

  const chartData = submissions.slice(0, 7).map(s => ({
    name: s.name.length > 12 ? s.name.slice(0, 10) + '…' : s.name,
    fullName: s.name,
    votes: s.voteCount,
    pct: totalVotes > 0 ? Math.round((s.voteCount / totalVotes) * 100) : 0,
  }));


  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @keyframes countPop { 0% { transform: scale(2.2); opacity: 0; } 30% { opacity: 1; } 75% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.8); opacity: 0; } }
        @keyframes winnerReveal { 0% { opacity: 0; transform: scale(0.85); filter: blur(16px); } 60% { filter: blur(0); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes overlayOut { 0% { opacity: 1; } 100% { opacity: 0; pointer-events: none; } }
      `}</style>
      {/* Nav */}
      <div style={{ background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 32px', height: 52, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <div style={{ width: 24, height: 24, background: '#eaef09', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="Namico" style={{ width: 16, height: 16, display: 'block' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Namico</span>
        </Link>
        <span style={{ color: '#444' }}>·</span>
        <span style={{ fontSize: 13, color: '#a1a1a1' }}>{meta.contestTitle} — Results</span>
        <button onClick={() => navigate('/dashboard')} style={{ marginLeft: 'auto', height: 32, padding: '0 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, background: 'transparent', color: '#a1a1a1', fontSize: 12, cursor: 'pointer' }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>

        {/* Zone 1: Winner Announcement */}
        <div style={{ position: 'relative', textAlign: 'center', marginBottom: 48, padding: '48px 24px', borderRadius: 20, border: `0.5px solid rgba(${tc.rgb},0.25)`, overflow: 'hidden' }}>
          <ParticleCanvas baseHue={tc.color === '#eaef09' ? 63 : tc.color === '#8B5CF6' ? 262 : 160} />
          {/* Winner content — always rendered at full size, revealed after countdown */}
          <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none', animation: countdown === 0 ? 'winnerReveal 0.9s cubic-bezier(0.22,1,0.36,1) forwards' : 'none', opacity: countdown > 0 ? 0 : undefined }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(${tc.rgb},0.18)`, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 20, fontSize: 12, fontWeight: 700, color: tc.color, textTransform: 'uppercase', marginBottom: 20, boxShadow: `0 0 12px rgba(${tc.rgb},0.5), 0 0 32px rgba(${tc.rgb},0.25)` }}>
              <Trophy size={14} weight="bold" /> Winner
            </div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 64, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 12, animation: countdown === 0 ? 'fadeSlideUp 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}>
              {winner?.name || 'Hollow Signal'}
            </div>
            {winner?.rationale && (
              <div style={{ maxWidth: 520, margin: '0 auto 16px', fontSize: 15, color: '#a1a1a1', lineHeight: 1.65, animation: countdown === 0 ? 'fadeSlideUp 0.7s 0.5s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}>
                {winner.rationale}
              </div>
            )}
            <div style={{ fontSize: 16, color: '#a1a1a1', marginBottom: 24, animation: countdown === 0 ? 'fadeSlideUp 0.7s 0.65s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}>
              <span style={{ color: tc.color, fontWeight: 700, fontSize: 20 }}>{winnerPct}%</span> of votes
            </div>
            {(prizeData.submitter || prizeData.voter) && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                {prizeData.submitter && (
                  <div style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(234,239,9,0.06), rgba(139,92,246,0.04))', border: '1px solid rgba(234,239,9,0.2)', borderRadius: 10, maxWidth: 320, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Trophy size={14} color="#eaef09" weight="fill" /><span style={{ fontSize: 11, fontWeight: 700, color: '#eaef09', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submitter Prize</span></div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{prizeData.submitter.name}</div>
                    {prizeData.submitter.desc && <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>{prizeData.submitter.desc}</div>}
                    {prizeData.winnerContact && <div style={{ fontSize: 12, color: '#a1a1a1' }}>Submitted by: <strong style={{ color: '#fff' }}>{prizeData.winnerContact.name}</strong> · {prizeData.winnerContact.email}</div>}
                  </div>
                )}
                {prizeData.voter && (
                  <div style={{ padding: '14px 18px', background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: 10, maxWidth: 320, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Trophy size={14} color="#8B5CF6" weight="fill" /><span style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voter Prize</span></div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{prizeData.voter.name}</div>
                    {prizeData.voter.desc && <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>{prizeData.voter.desc}</div>}
                    {prizeData.voterWinner && <div style={{ fontSize: 12, color: '#a1a1a1' }}>Random voter: <strong style={{ color: '#fff' }}>{prizeData.voterWinner.name}</strong> · {prizeData.voterWinner.email}</div>}
                  </div>
                )}
              </div>
            )}
            {isBusiness && (() => {
              const subCTA = {
                'company-name':   { body: 'You have a winning name — register your LLC before someone else does.',       cta: 'Register your business →' },
                'product-name':   { body: 'Lock it in — trademark your product name before a competitor does.',         cta: 'File a trademark →' },
                'project-name':   { body: 'Great project name. Protect it before it gets used elsewhere.',              cta: 'Protect your name →' },
                'rebrand':        { body: 'Rebrand complete — update your trademark to match the new name.',            cta: 'Update trademark →' },
                'other-business': { body: "You have a winning name — make sure it's legally yours.",                    cta: 'Protect your name →' },
              };
              const { body, cta } = subCTA[meta.sub] || subCTA['company-name'];
              return (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: '#141414', border: '0.5px solid rgba(234,239,9,0.3)', borderRadius: 10, fontSize: 13, color: '#a1a1a1' }}>
                  {body}
                  <a href="#" style={{ color: '#eaef09', fontWeight: 600, textDecoration: 'none', pointerEvents: 'auto', whiteSpace: 'nowrap' }}>{cta}</a>
                </div>
              );
            })()}
          </div>

          {/* Countdown overlay — sits on top, fades out when done */}
          {countdown > 0 && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 20 }}>
              <div key={countdown} style={{ fontSize: 140, fontWeight: 900, color: tc.color, lineHeight: 1, textShadow: `0 0 60px rgba(${tc.rgb},1), 0 0 120px rgba(${tc.rgb},0.5)`, animation: 'countPop 0.85s cubic-bezier(0.22,1,0.36,1) forwards' }}>
                {countdown}
              </div>
            </div>
          )}
        </div>

        {/* Zone 2: Analytics Dashboard */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Analytics Dashboard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Total Votes Cast', value: totalVotes || 47 },
              { label: 'Participation Rate', value: '78%' },
              { label: 'Contest Quality', value: '78%' },
              { label: 'Contest Duration', value: '9 days' },
            ].map((stat, i) => (
              <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '16px 14px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#7a7a7a' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px', height: 220 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 12 }}>Vote Distribution</div>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                <XAxis dataKey="name" tick={{ fill: '#7a7a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7a7a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} labelStyle={{ color: '#a1a1a1' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} formatter={(val, name, props) => [val, props.payload.fullName]} />
                <Bar dataKey="votes" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? tc.color : `rgba(${tc.rgb},${0.4 - index * 0.05})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Zone 3: Runner-Up & Shortlist */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>The Final Shortlist</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {submissions.slice(0, 5).map((sub, i) => (
              <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: i === 0 ? `rgba(${tc.rgb},0.06)` : '#1a1a1a', border: `0.5px solid ${i === 0 ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12 }}>
                <span style={{ fontSize: 20, minWidth: 28 }}>{MEDALS[i] || `#${i + 1}`}</span>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff', flex: 1 }}>{sub.name}</span>
                <span style={{ fontSize: 13, color: '#a1a1a1', minWidth: 60, textAlign: 'right' }}>{sub.voteCount} votes</span>
                <div style={{ width: 80, height: 6, background: '#222', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${totalVotes ? Math.round((sub.voteCount / totalVotes) * 100) : 0}%`, background: i === 0 ? tc.color : `rgba(${tc.rgb},0.5)`, borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 12, color: '#7a7a7a', minWidth: 36, textAlign: 'right' }}>{totalVotes ? Math.round((sub.voteCount / totalVotes) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Zone 4: Contest Quality Metrics */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Your Contest's Performance</h2>
          <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              {[
                { label: 'Creator completion', value: '38/50', color: '#10B981' },
                { label: 'Participant avg completion', value: '40/50', color: tc.color },
                { label: 'Overall contest quality', value: '78/100', color: '#8B5CF6' },
                { label: 'Quality tier', value: 'Strong', color: '#a1a1a1' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px 14px', background: '#141414', borderRadius: 8 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.color, marginBottom: 2 }}>{m.value}</div>
                  <div style={{ fontSize: 12, color: '#7a7a7a' }}>{m.label}</div>
                </div>
              ))}
            </div>
            {submissions.length >= 2 && Math.abs(submissions[0].voteCount - submissions[1].voteCount) / totalVotes < 0.05 && (
              <div style={{ padding: '10px 14px', background: 'rgba(234,239,9,0.06)', border: '1px solid rgba(234,239,9,0.2)', borderRadius: 8, fontSize: 13, color: '#eaef09' }}>
                Close call — {Math.round(Math.abs(submissions[0].voteCount - submissions[1].voteCount) / totalVotes * 100)}% separated winner and runner-up
              </div>
            )}
          </div>
        </div>

        {/* Zone 5: Affiliate Panel — segment-specific, high-intent CTAs */}
        {(() => {
          const sub = meta.sub;
          const isBiz = meta.group === 'business';
          const isTeam = meta.group === 'team';
          const isBand = sub === 'band-music';
          const isPodcast = sub === 'podcast-channel';
          const isSports = sub === 'sports-team';
          const isBaby = sub === 'baby-name';
          const isPet = sub === 'pet-name';
          const winName = winner?.name || 'your name';

          const AffCard = ({ badge, title, body, cta, href, accent, sub: subText }) => (
            <div style={{ background: '#1a1a1a', border: `1px solid ${accent || tc.color}30`, borderRadius: 14, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent || tc.color }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 800, background: `${accent || tc.color}20`, color: accent || tc.color, borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{badge}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 4, lineHeight: 1.5 }}>{body}</div>
              {subText && <div style={{ fontSize: 11, color: '#555', marginBottom: 14 }}>{subText}</div>}
              <a href={href || '#'} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, background: accent || tc.color, color: accent ? '#fff' : tc.textColor, fontSize: 13, fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}>
                {cta}
              </a>
            </div>
          );

          return (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', margin: 0 }}>
                  You have a name. Now make it real.
                </h2>
              </div>
              <p style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 20 }}>
                <strong style={{ color: tc.color }}>{winName}</strong> is chosen — here's what to do next, in order.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 14 }}>
                {/* Business (B1-B5) */}
                {isBiz && (
                  <>
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Claim your .com"
                      body={`${winName}.com — check availability now. .io, .co, .ai, and .net also checked automatically.`}
                      subText="20–30% off first purchase · Real-time availability"
                      cta="Check on Namecheap →"
                      href="https://namecheap.com"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Trademark · USPTO"
                      title="Free trademark search"
                      body={`Search the USPTO database for ${winName} before you invest further. Free, takes 10 minutes.`}
                      subText="Zero cost — builds confidence before you commit"
                      cta="Search TESS (Free) →"
                      href="https://tmsearch.uspto.gov"
                      accent="#3b82f6"
                    />
                    <AffCard
                      badge="Trademark · LegalZoom"
                      title="Full clearance search"
                      body="Professional trademark search catches phonetic matches, design marks, and conflicts USPTO search misses."
                      subText="~$199 · 30-day cookie · 15% commission"
                      cta="Full Search via LegalZoom →"
                      href="#"
                      accent="#8B5CF6"
                    />
                    {(sub === 'company-name' || sub === 'rebrand') && (
                      <AffCard
                        badge="LLC Formation · LegalZoom"
                        title={`Make ${winName} official`}
                        body="You have a name — now make it a legal entity. File your LLC before someone else registers it."
                        subText="~$149+ · 30-day cookie · 15% commission"
                        cta="Form Your LLC →"
                        href="#"
                        accent="#f97316"
                      />
                    )}
                    <AffCard
                      badge="Logo Design"
                      title="Get a logo to match"
                      body="Three paths: custom/premium (99designs), AI-fast (Looka), or accessible (Fiverr Logo Maker)."
                      subText="$40–$299 · Coverage at every price point"
                      cta="Design on Looka (fast) →"
                      href="#"
                      accent="#ec4899"
                    />
                  </>
                )}

                {/* Band */}
                {isBand && (
                  <>
                    <AffCard
                      badge="Music Distribution · DistroKid"
                      title={`Get ${winName} on Spotify`}
                      body="Your band has a name — now get on every streaming platform. Unlimited uploads, keep 100% of royalties."
                      subText="~$17/yr per signup · Highest expected conversion"
                      cta="Distribute on DistroKid →"
                      href="#"
                      accent="#1DB954"
                    />
                    <AffCard
                      badge="Trademark · LegalZoom"
                      title="Protect the band name"
                      body="Register your band name as a trademark in Class 41 (entertainment). Prevent another act from using it."
                      subText="~$199 full search · 30-day cookie"
                      cta="Trademark via LegalZoom →"
                      href="#"
                      accent="#8B5CF6"
                    />
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Claim your .com"
                      body={`Secure ${winName.toLowerCase().replace(/\s+/g,'')}.com and social handles before your launch announcement.`}
                      subText="20–30% off first purchase"
                      cta="Check on Namecheap →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Logo · 99designs / Looka"
                      title="Get your band logo"
                      body="Custom/premium (99designs), AI-fast (Looka), or budget (Fiverr). Coverage at every price point."
                      subText="$40–$299"
                      cta="Create on Looka →"
                      href="#"
                      accent="#ec4899"
                    />
                  </>
                )}

                {/* Podcast */}
                {isPodcast && (
                  <>
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Claim your podcast domain"
                      body={`A matching domain builds credibility with listeners and guests. Check ${winName.toLowerCase().replace(/\s+/g,'')}.com now.`}
                      subText="20–30% off first purchase"
                      cta="Check on Namecheap →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Cover Art · Looka"
                      title="Design your podcast cover"
                      body="Podcast cover art is your first impression. 3000×3000px required. Looka generates one in minutes."
                      subText="~$20 one-time · 25–35% commission"
                      cta="Create Cover Art →"
                      href="#"
                      accent="#ec4899"
                    />
                  </>
                )}

                {/* Sports Team */}
                {isSports && (
                  <>
                    <AffCard
                      badge="Merchandise · Printful"
                      title={`Gear up as ${winName}`}
                      body="Custom jerseys, hats, hoodies. No minimums. Ships in 3–5 days. Your team deserves the look."
                      subText="~15% per order · No minimums"
                      cta="Order Merch on Printful →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Merchandise · Custom Ink"
                      title="Bulk team uniforms"
                      body="Custom Ink specialises in team orders — jerseys, warm-ups, gear. Group pricing available."
                      subText="~15% per order"
                      cta="Quote on Custom Ink →"
                      href="#"
                      accent="#8B5CF6"
                    />
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Claim your team website"
                      body="Even a one-page site builds team identity. Grab the domain while it's available."
                      subText="From $10/yr · 20–30% off first purchase"
                      cta="Check on Namecheap →"
                      href="#"
                      accent="#3b82f6"
                    />
                  </>
                )}

                {/* Baby Name */}
                {isBaby && (
                  <>
                    <AffCard
                      badge="Announcement · Artifact Uprising"
                      title="Announce the name"
                      body={`"${winName}" is chosen — now share the news. Premium birth announcement cards, printed and shipped.`}
                      subText="~10% per order · Warm tone, not hard-sell · Ships in 5–7 days"
                      cta="Design Announcements →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Personalised Gifts · Etsy"
                      title={`Celebrate the name "${winName}".`}
                      body="Personalised gifts featuring the chosen name — nursery prints, keepsake books, embroidered blankets."
                      subText="Handmade · Ships worldwide"
                      cta="Shop personalised gifts →"
                      href="#"
                      accent="#f59e0b"
                    />
                  </>
                )}

                {/* Pet Name */}
                {isPet && (
                  <>
                    <AffCard
                      badge="Pet Accessories · Chewy"
                      title={`Make it official for ${winName}.`}
                      body="Custom ID tags and personalised accessories engraved with your pet's new name. Fast shipping."
                      subText="ID tags from $8 · Personalised collars, bowls, and more"
                      cta="Get a custom ID tag →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Personalised Gifts · Etsy"
                      title={`Celebrate ${winName} with something special.`}
                      body="Custom pet portraits, embroidered accessories, and personalised keepsakes for your new family member."
                      subText="Handmade · Ships worldwide"
                      cta="Shop pet gifts →"
                      href="#"
                      accent="#f59e0b"
                    />
                  </>
                )}

                {/* General Team fallback (gaming, civic, other-team — not sports/band/podcast) */}
                {isTeam && !isBand && !isPodcast && !isSports && (
                  <>
                    <AffCard
                      badge="Merchandise · Printful"
                      title={`Make it official with merch.`}
                      body={`Print "${winName}" on jerseys, hoodies, and gear. No minimums — order 1 or 100.`}
                      subText="~15% per order · Ships in 3–5 days"
                      cta="Design team merch →"
                      href="#"
                      accent={tc.color}
                    />
                    <AffCard
                      badge="Logo Design · 99designs"
                      title="Every great team name needs a great logo."
                      body="Work with a designer to create a logo that matches your new team identity. Multiple concepts, unlimited revisions."
                      subText="From $299 · 30-day cookie"
                      cta="Get a team logo →"
                      href="#"
                      accent="#ec4899"
                    />
                    <AffCard
                      badge="Website · Squarespace"
                      title="Claim your team's home online."
                      body="Build a simple team website with schedules, roster, and news. No coding required. Looks great on every device."
                      subText="From $16/mo · 14-day free trial"
                      cta="Build your team site →"
                      href="#"
                      accent="#3b82f6"
                    />
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Secure your team's domain."
                      body={`Lock in ${winName.toLowerCase().replace(/\s+/g,'')}.com before someone else does. 20–30% off first purchase.`}
                      subText="From $10/yr"
                      cta="Check domain →"
                      href="#"
                      accent="#8B5CF6"
                    />
                  </>
                )}

                {/* Personal fallback (home, other-personal — not biz/team sub-types) */}
                {!isBiz && !isTeam && !isBaby && !isPet && (
                  <>
                    <AffCard
                      badge="Personalised Gifts · Etsy"
                      title={`Celebrate "${winName}".`}
                      body="Personalised gifts, prints, and keepsakes featuring the chosen name. Handmade by independent creators."
                      subText="Ships worldwide"
                      cta="Shop personalised gifts →"
                      href="#"
                      accent="#f59e0b"
                    />
                    <AffCard
                      badge="Domain · Namecheap"
                      title="Claim the name online"
                      body="If you plan to create any presence around this name, grab the domain while it's available."
                      subText="From $10/yr · 20–30% off first purchase"
                      cta="Check on Namecheap →"
                      href="#"
                      accent={tc.color}
                    />
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Zone 6: Official Naming Certificate */}
        <CertificateSection winner={winner} meta={meta} tc={tc} />

        {/* Zone 8: Export */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Export Your Data</h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Download CSV', desc: 'All submissions, votes, timestamps' },
              ...(isBusiness ? [{ label: 'Download PDF Report', desc: 'Full results summary' }] : []),
              { label: 'Export Name DNA', desc: 'Multi-criteria scores breakdown' },
            ].map(item => (
              <div key={item.label}>
                <SimBtn label={item.label} icon={<DownloadSimple size={14} />} />
                <div style={{ fontSize: 11, color: '#7a7a7a', marginTop: 4 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone 9: Share & Next Steps */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Share Your Results</h2>
          <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Shareable results link:</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
              <div style={{ flex: 1, background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#a1a1a1', fontFamily: 'monospace' }}>
                {shareUrl}
              </div>
              <CopyBtn text={`https://${shareUrl}`} label="Copy" />
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <SimBtn label="Share on X" icon={<TwitterLogo size={14} />} />
              <SimBtn label="Share on LinkedIn" icon={<LinkedinLogo size={14} />} />
              <SimBtn label="Share on Facebook" icon={<Share size={14} />} />
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/select')} style={{ height: 44, padding: '0 20px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                Run Another Round <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate('/dashboard')} style={{ height: 44, padding: '0 20px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, background: 'transparent', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                Back to Dashboard
              </button>
            </div>

            {isBusiness && (
              <div style={{ marginTop: 20, padding: '20px 24px', background: 'rgba(234,239,9,0.04)', border: '1.5px solid rgba(234,239,9,0.25)', borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eaef09' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#eaef09', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Catchword Professional Services</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  Need a full brand identity? Catchword can help.
                </div>
                <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.6, marginBottom: 14 }}>
                  From naming to brand strategy, verbal identity, and taglines — Catchword has built 3,000+ brands.
                </div>
                <a href="#" style={{ fontSize: 13, color: '#eaef09', fontWeight: 600, textDecoration: 'none' }}>
                  Explore Catchword Services →
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Touchpoint 7: Post-Results Reflection (simulated email) ── */}
        <PostResultsReflection winnerName={winner?.name} contestTitle={meta.contestTitle} tc={tc} isBusiness={isBusiness} />

      </div>
    </div>
  );
}

function CertificateSection({ winner, meta, tc }) {
  const [whiteLabel, setWhiteLabel] = useState(false);
  const brandingText = whiteLabel ? '' : 'POWERED BY CATCHWORD BRANDING';

  return (
    <div style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 20 }}>Official Naming Certificate</h2>

      {/* Branding toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setWhiteLabel(false)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            background: !whiteLabel ? `rgba(${tc.rgb},0.15)` : 'transparent',
            border: `1px solid ${!whiteLabel ? tc.color : 'rgba(255,255,255,0.12)'}`,
            color: !whiteLabel ? tc.color : '#7a7a7a',
          }}
        >
          Powered by Catchword
        </button>
        <button
          onClick={() => setWhiteLabel(true)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
            background: whiteLabel ? `rgba(${tc.rgb},0.15)` : 'transparent',
            border: `1px solid ${whiteLabel ? tc.color : 'rgba(255,255,255,0.12)'}`,
            color: whiteLabel ? tc.color : '#7a7a7a',
          }}
        >
          Your Branding (White-label)
        </button>
      </div>

      {/* Certificate */}
      <div style={{ background: '#f9f6ef', border: '2px solid #d4a853', borderRadius: 16, padding: '32px', maxWidth: 480, marginBottom: 16 }}>
        <div style={{ textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Official Certificate of Naming</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>This certifies that the name</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>{winner?.name || 'Hollow Signal'}</div>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>was officially chosen for</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#333', marginBottom: 12 }}>{meta.contestTitle}</div>
          <div style={{ fontSize: 12, color: '#888' }}>with {6} participants · {'2026-03-05'}</div>
          {brandingText && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #ddd', fontSize: 10, color: '#aaa', letterSpacing: '0.1em' }}>{brandingText}</div>
          )}
          {whiteLabel && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #ddd' }}>
              <div style={{ fontSize: 10, color: '#aaa', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Your Company Logo Here</div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <SimBtn label="Download Certificate (PDF)" icon={<DownloadSimple size={14} />} />
        <SimBtn label="Share on X" icon={<TwitterLogo size={14} />} />
        <SimBtn label="Share on LinkedIn" icon={<LinkedinLogo size={14} />} />
        <SimBtn label="Share on Facebook" icon={<Share size={14} />} />
      </div>
    </div>
  );
}

function PostResultsReflection({ winnerName, contestTitle, tc, isBusiness }) {
  const [response, setResponse] = useState(null);

  const followUps = {
    confident: {
      headline: "That's the spirit. Here's your next-step checklist.",
      body: "Choosing a name is step one. Here's what to do in the next 7 days to make it official.",
      items: [
        { icon: '🔍', label: 'USPTO trademark search', sub: 'Search at USPTO.gov — look for exact matches in your category' },
        { icon: '🌐', label: 'Register the .com', sub: 'If not available, secure .co or .io and put a redirect on the .com' },
        { icon: '📱', label: 'Claim social handles', sub: '@YourName on X, Instagram, LinkedIn — even if you won\'t use them yet' },
        { icon: '🎨', label: 'Commission a wordmark', sub: 'A wordmark before a logo. Typography first. Marks come later.' },
        { icon: '📣', label: 'Draft the announcement', sub: 'Tell the story of how the name was chosen — people love the process.' },
      ],
      cta: isBusiness ? 'Register with LegalZoom →' : null,
      ctaNote: isBusiness ? 'File your LLC or corporation before someone else registers the name.' : null,
    },
    secondthoughts: {
      headline: "Second thoughts are normal. Here's how to tell if it's cold feet or a real problem.",
      body: "Most organizers feel doubt after choosing a name. Here's a diagnostic to separate real issues from nerves.",
      items: [
        { icon: <Brain size={14} weight="duotone" />, label: "Is it the name — or the change?", sub: 'Often what feels wrong is the change itself, not the name. Give it 72 hours before making any decisions.' },
        { icon: <ArrowRight size={14} weight="bold" />, label: 'Say it out loud 20 times', sub: "Strange names become familiar fast. Most 'bad' names just need time to feel natural." },
        { icon: <Share size={14} weight="duotone" />, label: 'Ask 3 people who weren\'t in the contest', sub: "Fresh ears catch things participants can't. Do they understand it? Does it feel right to them?" },
        { icon: <Scales size={14} weight="duotone" />, label: 'Compare to the runner-up', sub: 'Is the runner-up name actually better, or just different? Write down specifically why the winner beat it.' },
      ],
      cta: 'Run Another Round — 50% Off →',
      ctaNote: "Not confident? Open a new round with fresh candidates at half price.",
    },
    unsure: {
      headline: "Still not sure? That's okay. Use this framework.",
      body: "Uncertainty after choosing a name is common. Here's a structured way to evaluate it.",
      items: [
        { icon: <Copy size={14} weight="duotone" />, label: 'Write down what bothers you specifically', sub: 'Vague discomfort is not a reason to rechose. Specific concerns are. Write the actual words down.' },
        { icon: <Target size={14} weight="duotone" />, label: 'Test it on strangers', sub: 'Tell 5 people outside the contest the name only — no context. What do they assume about you?' },
        { icon: <Check size={14} weight="bold" />, label: 'Give it 7 days before acting', sub: 'The first week always feels uncomfortable. Check in after 7 days — the feeling usually shifts.' },
      ],
      cta: 'Run Another Round — 50% Off →',
      ctaNote: "Sometimes a second round with a fresh brief brings total clarity. Get 50% off your next contest.",
    },
  };

  const chosen = response ? followUps[response] : null;

  return (
    <div style={{ marginTop: 40, marginBottom: 40 }}>
      {/* Simulated email envelope header */}
      <div style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Email meta bar */}
        <div style={{ background: '#0f0f0f', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `rgba(${tc.rgb},0.15)`, border: `1px solid rgba(${tc.rgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Envelope size={14} color={tc.color} /></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>team@namingcontest.com → You</div>
            <div style={{ fontSize: 11, color: '#7a7a7a' }}>Subject: How did <em style={{ color: '#a1a1a1' }}>{winnerName || 'your winning name'}</em> turn out? · Touchpoint 7</div>
          </div>
          <div style={{ fontSize: 11, color: '#4a4a4a' }}>7 days post-results</div>
        </div>

        {/* Email body */}
        <div style={{ padding: '28px 28px 24px' }}>
          {!response ? (
            <>
              <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.7, marginBottom: 8 }}>Hi there,</p>
              <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.7, marginBottom: 16 }}>
                It's been a week since you chose <strong style={{ color: '#fff' }}>{winnerName || 'your winning name'}</strong>{contestTitle ? ` for ${contestTitle}` : ''}. Now that you've lived with it for a few days:
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>How do you feel about the name?</p>
              <p style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 20 }}>Click one of the options below to see what happens next.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {[
                  { key: 'confident', label: "✓  Yes, we're confident in this name", color: '#10B981', bg: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.3)' },
                  { key: 'secondthoughts', label: "↩  We're having second thoughts", color: '#eaef09', bg: 'rgba(234,239,9,0.06)', border: '1px solid rgba(234,239,9,0.2)' },
                  { key: 'unsure', label: "?  We're still not sure", color: '#8B5CF6', bg: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => setResponse(opt.key)} style={{ padding: '14px 20px', background: opt.bg, border: opt.border, borderRadius: 10, color: opt.color, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                    {opt.label}
                  </button>
                ))}
              </div>

              <p style={{ fontSize: 12, color: '#4a4a4a', lineHeight: 1.6 }}>
                Regardless of your answer, we'll follow up with guidance.<br />
                — The Namico.com Team · Powered by Catchword, the #1 Ranked Naming Agency Worldwide
              </p>
            </>
          ) : (
            <>
              <div style={{ padding: '4px 10px', background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, borderRadius: 6, fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-block', marginBottom: 16 }}>
                Response received — here's what to do next
              </div>
              <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff', marginBottom: 12, lineHeight: 1.3 }}>{chosen.headline}</h3>
              <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.6, marginBottom: 20 }}>{chosen.body}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {chosen.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.5 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {chosen.cta && (
                <div style={{ padding: '16px 20px', background: `rgba(${tc.rgb},0.06)`, border: `1px solid rgba(${tc.rgb},0.2)`, borderRadius: 10, marginBottom: 20 }}>
                  <button style={{ width: '100%', padding: '12px', border: `1.5px solid ${tc.color}`, borderRadius: 8, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    {chosen.cta}
                  </button>
                  {chosen.ctaNote && <p style={{ fontSize: 12, color: '#7a7a7a', marginTop: 8, textAlign: 'center', lineHeight: 1.5 }}>{chosen.ctaNote}</p>}
                </div>
              )}

              {/* Catchword Professional Services upsell — business only, unhappy responses */}
              {isBusiness && (response === 'secondthoughts' || response === 'unsure') && (
                <div style={{ padding: '20px 24px', background: 'rgba(234,239,9,0.04)', border: '1.5px solid rgba(234,239,9,0.25)', borderRadius: 12, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#eaef09' }} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#eaef09', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Catchword Professional Services</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                    Need expert help? Let Catchword name it for you.
                  </div>
                  <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.65, marginBottom: 16 }}>
                    Your contest data — brief, submissions, votes — becomes the starting point for Catchword's professional naming team. 25+ years of experience, 3,000+ brands named.
                  </div>
                  <button style={{ height: 40, padding: '0 20px', border: '1.5px solid #eaef09', borderRadius: 8, background: 'rgba(234,239,9,0.1)', color: '#eaef09', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Explore Catchword Services <ArrowRight size={14} />
                  </button>
                </div>
              )}

              <button onClick={() => setResponse(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4a4a', fontSize: 12, padding: 0 }}>
                ← Change my response
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
