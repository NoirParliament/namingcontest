import { useState, useRef, useCallback, useEffect } from 'react';
import { Brain, FilePdf, Check } from '@phosphor-icons/react';

/* ─── Seed nodes per segment ─── */
const MIND_MAP_SEEDS = {
  'baby-name':            ['Heritage & Origin', 'Sounds I\'m Drawn To', 'Meanings That Matter', 'Sibling Harmony'],
  'pet-name':             ['Their Personality', 'How They Look', 'Funny & Ridiculous', 'Pop Culture Refs'],
  'home-property-fun':    ['The Feeling of the Place', 'The Land & Surroundings', 'History & Stories', 'First Impressions'],
  'sports-team':          ['Animals & Creatures', 'Local Geography', 'Forces of Nature', 'Mythology & Legends'],
  'band-music':           ['Moods & Atmospheres', 'Visual Imagery', 'Strange Combos', 'Genre Energy'],
  'podcast-channel':      ['Wordplay & Puns', 'Topic Hooks', 'Catchphrases', 'Search-Friendly Words'],
  'gaming-group':         ['Fantasy & Sci-Fi', 'Intimidation', 'Short Tags', 'Inside References'],
  'civic-school-nonprofit': ['Mission Words', 'Community Identity', 'Inspiration & Action', 'Acronym Seeds'],
  'company-name':         ['Trust & Authority', 'Whitespace vs Competitors', 'Invented Words', 'Global Appeal'],
  'product-name':         ['Core Benefit', 'User Emotion', 'Shelf Standout', 'Word Mashups'],
  'project-name':         ['Codename Energy', 'Goal References', 'Team Rally Words', 'Memorable & Fun'],
  'rebrand':              ['What to Keep', 'New Direction', 'Fresh Associations', 'Audience Signals'],
};

const ROOT_LABELS = {
  'baby-name': 'Baby Name Ideas', 'pet-name': 'Pet Name Ideas', 'home-property-fun': 'Place Name Ideas',
  'sports-team': 'Team Name Ideas', 'band-music': 'Band Name Ideas', 'podcast-channel': 'Show Name Ideas',
  'gaming-group': 'Crew Name Ideas', 'civic-school-nonprofit': 'Org Name Ideas',
  'company-name': 'Company Name Ideas', 'product-name': 'Product Name Ideas',
  'project-name': 'Project Name Ideas', 'rebrand': 'Rebrand Ideas',
};

let _nodeId = 100;
function nextId() { return `n${_nodeId++}`; }

function buildInitialNodes(subSegment) {
  const seeds = MIND_MAP_SEEDS[subSegment] || ['Explore Area 1', 'Explore Area 2', 'Explore Area 3', 'Explore Area 4'];
  const rootLabel = ROOT_LABELS[subSegment] || 'Name Ideas';
  const cx = 400, cy = 300, radius = 180;
  const root = { id: 'root', text: rootLabel, x: cx, y: cy, parentId: null, isRoot: true };
  const children = seeds.map((text, i) => {
    const angle = (Math.PI * 2 * i) / seeds.length - Math.PI / 2;
    return { id: nextId(), text, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, parentId: 'root', isRoot: false };
  });
  return [root, ...children];
}

/* ─── Edge (curved line between nodes) ─── */
function Edge({ parent, child, color }) {
  const mx = (parent.x + child.x) / 2;
  const my = (parent.y + child.y) / 2;
  const dx = child.x - parent.x;
  const dy = child.y - parent.y;
  const off = Math.min(40, Math.sqrt(dx * dx + dy * dy) * 0.15);
  const cx = mx + (dy > 0 ? -off : off);
  const cy = my + (dx > 0 ? off : -off);
  return (
    <path
      d={`M ${parent.x} ${parent.y} Q ${cx} ${cy} ${child.x} ${child.y}`}
      fill="none" stroke={color} strokeWidth={2} strokeOpacity={0.3}
    />
  );
}

/* ─── Main MindMap Component ─── */
export default function MindMap({ tc, onPoints, qualityPct, subSegment }) {
  const svgRef = useRef(null);
  const [nodes, setNodes] = useState(() => buildInitialNodes(subSegment));
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 800, h: 600 });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [hoverId, setHoverId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);
  const [pointsAwarded, setPointsAwarded] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const userNodeCount = nodes.length - 5; // root + 4 seeds

  const awardExplorePoints = useCallback(() => {
    if (!pointsAwarded) {
      setPointsAwarded(true);
      onPoints(5);
    }
  }, [pointsAwarded, onPoints]);

  /* ── coordinate helpers ── */
  const screenToSvg = useCallback((clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    return { x: viewBox.x + (clientX - rect.left) * scaleX, y: viewBox.y + (clientY - rect.top) * scaleY };
  }, [viewBox]);

  /* ── add child node ── */
  const addChild = useCallback((parentId) => {
    awardExplorePoints();
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;
    const siblings = nodes.filter(n => n.parentId === parentId);
    const angle = siblings.length > 0
      ? (Math.PI * 2 * siblings.length) / (siblings.length + 1) + Math.random() * 0.3
      : Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 40;
    const id = nextId();
    const newNode = { id, text: '', x: parent.x + Math.cos(angle) * dist, y: parent.y + Math.sin(angle) * dist, parentId, isRoot: false };
    setNodes(prev => [...prev, newNode]);
    setEditingId(id);
    setEditText('');
  }, [nodes]);

  /* ── delete node + descendants ── */
  const deleteNode = useCallback((id) => {
    if (id === 'root') return;
    const toRemove = new Set();
    const collect = (nid) => { toRemove.add(nid); nodes.filter(n => n.parentId === nid).forEach(n => collect(n.id)); };
    collect(id);
    setNodes(prev => prev.filter(n => !toRemove.has(n.id)));
    if (editingId === id) setEditingId(null);
  }, [nodes, editingId]);

  /* ── commit edit ── */
  const commitEdit = useCallback(() => {
    if (!editingId) return;
    if (editText.trim()) {
      setNodes(prev => prev.map(n => n.id === editingId ? { ...n, text: editText.trim() } : n));
    } else {
      // empty text — remove the node
      setNodes(prev => prev.filter(n => n.id !== editingId));
    }
    setEditingId(null);
  }, [editingId, editText]);

  /* ── pointer handlers ── */
  const handlePointerDown = useCallback((e) => {
    if (e.target === svgRef.current || e.target.tagName === 'path') {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y });
      e.preventDefault();
    }
  }, [viewBox]);

  const handlePointerMove = useCallback((e) => {
    if (isPanning && panStart) {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = viewBox.w / rect.width;
      const scaleY = viewBox.h / rect.height;
      setViewBox(v => ({ ...v, x: panStart.vx - (e.clientX - panStart.x) * scaleX, y: panStart.vy - (e.clientY - panStart.y) * scaleY }));
    }
    if (draggingId) {
      const pos = screenToSvg(e.clientX, e.clientY);
      setNodes(prev => prev.map(n => n.id === draggingId ? { ...n, x: pos.x - dragOffset.current.x, y: pos.y - dragOffset.current.y } : n));
    }
  }, [isPanning, panStart, draggingId, viewBox, screenToSvg]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    setPanStart(null);
    setDraggingId(null);
  }, []);

  /* ── zoom ── */
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const pos = screenToSvg(e.clientX, e.clientY);
    setViewBox(v => {
      const nw = Math.max(200, Math.min(3000, v.w * factor));
      const nh = Math.max(150, Math.min(2250, v.h * factor));
      const rx = (pos.x - v.x) / v.w;
      const ry = (pos.y - v.y) / v.h;
      return { x: pos.x - rx * nw, y: pos.y - ry * nh, w: nw, h: nh };
    });
  }, [screenToSvg]);

  const zoomIn = () => setViewBox(v => ({ ...v, w: Math.max(200, v.w * 0.8), h: Math.max(150, v.h * 0.8) }));
  const zoomOut = () => setViewBox(v => ({ ...v, w: Math.min(3000, v.w * 1.25), h: Math.min(2250, v.h * 1.25) }));
  const resetView = () => setViewBox({ x: 0, y: 0, w: 800, h: 600 });

  /* ── node drag start ── */
  const startDrag = useCallback((e, id) => {
    if (editingId) return;
    e.stopPropagation();
    awardExplorePoints();
    const pos = screenToSvg(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === id);
    if (!node) return;
    dragOffset.current = { x: pos.x - node.x, y: pos.y - node.y };
    setDraggingId(id);
  }, [editingId, screenToSvg, nodes, awardExplorePoints]);

  /* ── attach wheel listener (passive: false) ── */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const nodeMap = {};
  nodes.forEach(n => { nodeMap[n.id] = n; });
  const edges = nodes.filter(n => n.parentId && nodeMap[n.parentId]);

  const nodeW = 140, nodeH = 36, rootW = 160, rootH = 44;

  return (
    <div style={{ marginBottom: 28, background: '#fafaf5', border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '0.5px solid rgba(30,35,48,0.08)' }}>
        <div style={{ width: 32, height: 32, background: `rgba(${tc.rgb},0.1)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Brain size={16} color={tc.color} weight="duotone" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e2330' }}>Exploration Mind Map</div>
          <div style={{ fontSize: 11, color: '#7a7a7a' }}>Branch out your ideas — click + to add, drag to move, scroll to zoom</div>
        </div>
        <button onClick={() => alert('PDF export will be available in the full release.')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', border: `0.5px solid rgba(${tc.rgb},0.3)`, borderRadius: 6, background: 'transparent', color: tc.color, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
          <FilePdf size={13} /> Export PDF
        </button>
        {!pointsAwarded ? (
          <div style={{ fontSize: 11, color: tc.color, fontWeight: 600 }}>+{qualityPct} pts for exploring</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: tc.color, fontWeight: 600 }}><Check size={12} weight="bold" /> +{qualityPct} pts earned</div>
        )}
      </div>

      {/* SVG Canvas */}
      <div style={{ position: 'relative', height: 420, background: 'transparent', cursor: isPanning ? 'grabbing' : draggingId ? 'grabbing' : 'grab' }}>
        <svg
          ref={svgRef}
          width="100%" height="100%"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ display: 'block', userSelect: 'none' }}
        >
          {/* Grid dots */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="0.5" fill="rgba(30,35,48,0.06)" />
            </pattern>
          </defs>
          <rect x={viewBox.x - 500} y={viewBox.y - 500} width={viewBox.w + 1000} height={viewBox.h + 1000} fill="url(#grid)" />

          {/* Edges */}
          {edges.map(n => (
            <Edge key={`e-${n.id}`} parent={nodeMap[n.parentId]} child={n} color={tc.color} />
          ))}

          {/* Nodes */}
          {nodes.map(n => {
            const w = n.isRoot ? rootW : nodeW;
            const h = n.isRoot ? rootH : nodeH;
            const isHovered = hoverId === n.id;
            const isEditing = editingId === n.id;
            const isDragging = draggingId === n.id;

            return (
              <g key={n.id}
                onPointerEnter={() => setHoverId(n.id)}
                onPointerLeave={() => setHoverId(null)}
              >
                {/* Node body */}
                <rect
                  x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={n.isRoot ? 12 : 8}
                  fill={n.isRoot ? tc.color : `rgba(${tc.rgb},0.08)`}
                  stroke={n.isRoot ? 'none' : `rgba(${tc.rgb},${isHovered ? 0.6 : 0.25})`}
                  strokeWidth={1}
                  style={{ cursor: isDragging ? 'grabbing' : 'pointer', transition: 'stroke-opacity 0.15s' }}
                  onPointerDown={e => startDrag(e, n.id)}
                  onDoubleClick={(e) => { e.stopPropagation(); setEditingId(n.id); setEditText(n.text); }}
                />

                {/* Text or edit input */}
                {isEditing ? (
                  <foreignObject x={n.x - w / 2 + 4} y={n.y - h / 2 + 4} width={w - 8} height={h - 8}>
                    <input
                      autoFocus
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') { setEditingId(null); if (!editText.trim()) setNodes(prev => prev.filter(nd => nd.id !== n.id)); } }}
                      style={{ width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none', color: n.isRoot ? '#000' : '#1e2330', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', textAlign: 'center' }}
                    />
                  </foreignObject>
                ) : (
                  <text
                    x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central"
                    fill={n.isRoot ? '#000' : '#1e2330'} fontSize={n.isRoot ? 13 : 11} fontWeight={n.isRoot ? 700 : 600}
                    fontFamily="Inter, sans-serif"
                    style={{ pointerEvents: 'none' }}
                  >
                    {n.text.length > 18 ? n.text.slice(0, 16) + '…' : n.text}
                  </text>
                )}

                {/* Add button */}
                {isHovered && !isEditing && (
                  <g onClick={(e) => { e.stopPropagation(); addChild(n.id); }} style={{ cursor: 'pointer' }}>
                    <circle cx={n.x + w / 2 + 2} cy={n.y} r={10} fill={`rgba(${tc.rgb},0.15)`} stroke={`rgba(${tc.rgb},0.4)`} strokeWidth={0.5} />
                    <text x={n.x + w / 2 + 2} y={n.y} textAnchor="middle" dominantBaseline="central" fill={tc.color} fontSize={14} fontWeight={700} style={{ pointerEvents: 'none' }}>+</text>
                  </g>
                )}

                {/* Delete button */}
                {isHovered && !isEditing && !n.isRoot && (
                  <g onClick={(e) => { e.stopPropagation(); deleteNode(n.id); }} style={{ cursor: 'pointer' }}>
                    <circle cx={n.x - w / 2 - 2} cy={n.y - h / 2 - 2} r={8} fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.4)" strokeWidth={0.5} />
                    <text x={n.x - w / 2 - 2} y={n.y - h / 2 - 2} textAnchor="middle" dominantBaseline="central" fill="#ef4444" fontSize={10} fontWeight={700} style={{ pointerEvents: 'none' }}>×</text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: '+', fn: zoomIn }, { label: '−', fn: zoomOut }, { label: '⟲', fn: resetView }].map(b => (
            <button key={b.label} onClick={b.fn} style={{ width: 28, height: 28, border: '0.5px solid rgba(30,35,48,0.12)', borderRadius: 6, background: 'rgba(255,255,255,0.95)', color: '#1e2330', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {b.label}
            </button>
          ))}
        </div>

        {/* Node count */}
        <div style={{ position: 'absolute', bottom: 10, left: 14, fontSize: 11, color: '#8a8a82' }}>
          {nodes.length} nodes {userNodeCount > 0 && `· ${userNodeCount} added by you`}
        </div>
      </div>
    </div>
  );
}
