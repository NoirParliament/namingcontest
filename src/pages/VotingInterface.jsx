import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Check, ArrowRight, Share } from '@phosphor-icons/react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { getJourneyMeta } from '../utils/journey';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business', textColor: '#000' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team', textColor: '#fff' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal', textColor: '#fff' },
};

// ── SortableItem for Ranked Choice ──
function SortableItem({ id, name, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={{ ...style, display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, marginBottom: 8, cursor: 'grab' }} {...attributes} {...listeners}>
      <span style={{ fontSize: 18, fontWeight: 700, color: '#eaef09', minWidth: 28 }}>#{index + 1}</span>
      <span style={{ fontSize: 18, fontFamily: 'Inter, sans-serif', color: '#fff' }}>{name}</span>
      <span style={{ marginLeft: 'auto', color: '#7a7a7a', fontSize: 18 }}>⠿</span>
    </div>
  );
}

// ── Success Screen ──
function SuccessScreen({ tc, contestId }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: `rgba(${tc.rgb},0.12)`, border: `2px solid ${tc.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <Check size={36} weight="bold" color={tc.color} />
      </div>
      <h2 style={{ fontFamily: 'Inter, sans-serif', fontSize: 32, color: '#fff', marginBottom: 8 }}>Your vote has been recorded!</h2>
      <p style={{ color: '#a1a1a1', fontSize: 15, marginBottom: 32 }}>
        Results will be published once voting closes.
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/results/${contestId}`)} style={{ height: 44, padding: '0 24px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          View Live Results
        </button>
        <button onClick={() => { navigator.clipboard.writeText(window.location.href).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{ height: 44, padding: '0 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, background: 'transparent', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Share size={16} /> {copied ? 'Copied!' : 'Share'}
        </button>
      </div>
    </div>
  );
}

// ── Simple Poll ──
function SimplePoll({ names, tc, onVote }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);

  const handleSubmit = () => {
    if (selected === null) return;
    setVoted(true);
    onVote();
  };

  if (voted) return null;

  return (
    <div>
      <div style={{ marginBottom: 24, fontSize: 13, color: '#a1a1a1' }}>Select the name you think best fits the brief.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {names.map((name, i) => (
          <label key={i} onClick={() => setSelected(i)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: selected === i ? `rgba(${tc.rgb},0.08)` : '#1a1a1a', border: `0.5px solid ${selected === i ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === i ? tc.color : '#444'}`, background: selected === i ? tc.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected === i && <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.textColor }} />}
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff' }}>{name}</span>
          </label>
        ))}
      </div>
      <button onClick={handleSubmit} disabled={selected === null} style={{ height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed', opacity: selected !== null ? 1 : 0.5 }}>
        Submit Vote
      </button>
    </div>
  );
}

// ── Ranked Choice ──
function RankedChoice({ names, tc, onVote }) {
  const [items, setItems] = useState(names.map((n, i) => ({ id: String(i), name: n })));
  const [voted, setVoted] = useState(false);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItems(items => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  if (voted) return null;

  return (
    <div>
      <div style={{ marginBottom: 20, fontSize: 13, color: '#a1a1a1' }}>Drag names to rank them from your favorite (#1) to least favorite.</div>
      <div style={{ padding: '10px 14px', background: '#141414', borderRadius: 8, marginBottom: 16, fontSize: 12, color: '#7a7a7a' }}>
        Your #1 choice: <strong style={{ color: '#fff' }}>{items[0]?.name}</strong>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableItem key={item.id} id={item.id} name={item.name} index={index} />
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={() => { setVoted(true); onVote(); }} style={{ marginTop: 16, height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Submit Ranking
      </button>
    </div>
  );
}

// ── Multi-Criteria ──
const CRITERIA = ['Magnetism', 'Distinctiveness', 'Brand Fit', 'Accessibility', 'Longevity'];

function MultiCriteria({ names, tc, onVote }) {
  const initScores = {};
  names.forEach(name => {
    initScores[name] = {};
    CRITERIA.forEach(c => { initScores[name][c] = 5; });
  });
  const [scores, setScores] = useState(initScores);
  const [showRadar, setShowRadar] = useState(false);
  const [voted, setVoted] = useState(false);

  const getAvg = (name) => {
    const vals = Object.values(scores[name]);
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  };

  const radarData = CRITERIA.map(c => ({
    criterion: c,
    ...Object.fromEntries(names.map(name => [name, scores[name][c]])),
  }));

  const radarColors = ['#eaef09', '#8B5CF6', '#10B981', '#3B82F6', '#f97316'];

  if (voted) return null;

  return (
    <div>
      <div style={{ marginBottom: 16, fontSize: 13, color: '#a1a1a1' }}>Rate each name 1-10 on all 5 criteria.</div>
      {names.map((name, ni) => (
        <div key={name} style={{ marginBottom: 20, padding: '16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#fff' }}>{name}</span>
            <span style={{ fontSize: 13, color: tc.color, fontWeight: 700 }}>Avg: {getAvg(name)}/10</span>
          </div>
          {CRITERIA.map(criterion => (
            <div key={criterion} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#a1a1a1' }}>{criterion}</span>
                <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>{scores[name][criterion]}</span>
              </div>
              <input type="range" min={1} max={10} value={scores[name][criterion]} onChange={e => setScores({ ...scores, [name]: { ...scores[name], [criterion]: Number(e.target.value) } })} style={{ width: '100%', accentColor: tc.color, height: 4 }} />
            </div>
          ))}
        </div>
      ))}
      <button onClick={() => setShowRadar(!showRadar)} style={{ marginBottom: 16, height: 36, padding: '0 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'transparent', color: '#a1a1a1', fontSize: 13, cursor: 'pointer' }}>
        {showRadar ? 'Hide' : 'Show'} Radar Comparison
      </button>
      {showRadar && (
        <div style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 16, height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis dataKey="criterion" tick={{ fill: '#7a7a7a', fontSize: 11 }} />
              {names.map((name, i) => (
                <Radar key={name} name={name} dataKey={name} stroke={radarColors[i % radarColors.length]} fill={radarColors[i % radarColors.length]} fillOpacity={0.15} />
              ))}
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 8 }}>
            {names.map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#a1a1a1' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: radarColors[i % radarColors.length] }} />
                {name}
              </div>
            ))}
          </div>
        </div>
      )}
      <button onClick={() => { setVoted(true); onVote(); }} style={{ height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Submit Scores
      </button>
    </div>
  );
}

// ── Pairwise ──
function Pairwise({ names, tc, onVote }) {
  const pairs = [];
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      pairs.push([names[i], names[j]]);
    }
  }
  const [pairIndex, setPairIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [wins, setWins] = useState({});
  const [voted, setVoted] = useState(false);

  const handleNext = () => {
    if (selected !== null) {
      setWins(w => ({ ...w, [selected]: (w[selected] || 0) + 1 }));
    }
    if (pairIndex >= pairs.length - 1) {
      setVoted(true);
      onVote();
    } else {
      setPairIndex(p => p + 1);
      setSelected(null);
    }
  };

  if (voted) return null;
  if (pairs.length === 0) return <div style={{ color: '#7a7a7a' }}>Not enough names for pairwise comparison.</div>;

  const currentPair = pairs[pairIndex];
  const progress = ((pairIndex) / pairs.length) * 100;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7a7a7a', marginBottom: 6 }}>
          <span>Comparison {pairIndex + 1} of {pairs.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div style={{ height: 4, background: '#222', borderRadius: 4 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: tc.color, borderRadius: 4, transition: 'width 0.3s' }} />
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: 13, color: '#a1a1a1', marginBottom: 20 }}>Which name better fits the brief?</div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {currentPair.map((name, i) => (
          <div key={i} onClick={() => setSelected(name)} style={{ flex: 1, padding: '32px 20px', background: selected === name ? `rgba(${tc.rgb},0.1)` : '#1a1a1a', border: `2px solid ${selected === name ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, textAlign: 'center', cursor: 'pointer', transition: 'all 0.15s', boxShadow: selected === name ? `0 0 20px rgba(${tc.rgb},0.2)` : 'none' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', marginBottom: 8 }}>{name}</div>
            {selected === name && <Check size={20} color={tc.color} weight="bold" style={{ margin: '0 auto' }} />}
          </div>
        ))}
      </div>
      <button onClick={handleNext} disabled={selected === null} style={{ height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed', opacity: selected !== null ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: 8 }}>
        {pairIndex < pairs.length - 1 ? 'Next Pair' : 'Submit'} <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ── Weighted Voting ──
function WeightedVoting({ names, tc, onVote }) {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const voterWeight = 3;

  if (voted) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `rgba(${tc.rgb},0.06)`, border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#a1a1a1' }}>
        Your vote weight: <span style={{ color: tc.color, fontWeight: 700 }}>3x</span>
        <span style={{ marginLeft: 4 }}>{'●'.repeat(voterWeight)}{'○'.repeat(3 - voterWeight)}</span>
      </div>
      <div style={{ marginBottom: 24, fontSize: 13, color: '#a1a1a1' }}>Select the name you think best fits the brief. Your vote carries extra weight.</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {names.map((name, i) => (
          <label key={i} onClick={() => setSelected(i)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px', background: selected === i ? `rgba(${tc.rgb},0.08)` : '#1a1a1a', border: `0.5px solid ${selected === i ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === i ? tc.color : '#444'}`, background: selected === i ? tc.color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {selected === i && <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.textColor }} />}
            </div>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', flex: 1 }}>{name}</span>
            <span style={{ fontSize: 11, color: '#7a7a7a' }}>×{voterWeight} weight</span>
          </label>
        ))}
      </div>
      <button onClick={() => { if (selected !== null) { setVoted(true); onVote(); } }} disabled={selected === null} style={{ height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: selected !== null ? 'pointer' : 'not-allowed', opacity: selected !== null ? 1 : 0.5 }}>
        Submit Vote (3x weight)
      </button>
    </div>
  );
}

// ── Main Component ──
export default function VotingInterface() {
  const { contestId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const meta = getJourneyMeta(contestId);
  const tc = meta;
  const names = meta.candidates.map(c => c.name);

  const methodParam = searchParams.get('method');
  const methodMap = { 'demo-1': 'simple', 'demo-2': 'ranked', 'demo-3': 'multicriteria', 'demo-4': 'pairwise', 'demo-5': 'weighted' };
  const method = methodParam || methodMap[contestId] || 'simple';

  const [voted, setVoted] = useState(false);

  const methodLabels = {
    simple: 'Simple Poll',
    ranked: 'Ranked Choice',
    multicriteria: 'Multi-Criteria Scoring',
    pairwise: 'Pairwise Comparison',
    weighted: 'Weighted Voting',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 26, height: 26, background: '#eaef09', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={13} weight="bold" color="#000" />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>NamingContest</span>
        </Link>
        <span style={{ color: '#444' }}>·</span>
        <span style={{ fontSize: 13, color: '#a1a1a1' }}>{meta.contestTitle}</span>
        <div style={{ marginLeft: 'auto', padding: '3px 10px', background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, borderRadius: 20, fontSize: 11, fontWeight: 600, color: tc.color, textTransform: 'uppercase' }}>
          {methodLabels[method]}
        </div>
      </div>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: '#0f0f0f', borderRight: '0.5px solid rgba(255,255,255,0.06)', padding: '24px 16px', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Shortlisted Names</div>
          {names.map((name, i) => (
            <div key={i} style={{ padding: '8px 10px', borderRadius: 7, marginBottom: 4, fontSize: 14, fontFamily: 'Inter, sans-serif', color: '#a1a1a1' }}>
              {name}
            </div>
          ))}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: '40px', maxWidth: 700 }}>
          {voted ? (
            <SuccessScreen tc={tc} contestId={contestId || 'demo-1'} />
          ) : (
            <>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#fff', marginBottom: 6 }}>Cast Your Vote</h1>
              <div style={{ fontSize: 13, color: '#7a7a7a', marginBottom: 32 }}>Method: {methodLabels[method]} · {names.length} names in the shortlist</div>

              {method === 'simple' && <SimplePoll names={names} tc={tc} onVote={() => setVoted(true)} />}
              {method === 'ranked' && <RankedChoice names={names} tc={tc} onVote={() => setVoted(true)} />}
              {method === 'multicriteria' && <MultiCriteria names={names} tc={tc} onVote={() => setVoted(true)} />}
              {method === 'pairwise' && <Pairwise names={names} tc={tc} onVote={() => setVoted(true)} />}
              {method === 'weighted' && <WeightedVoting names={names} tc={tc} onVote={() => setVoted(true)} />}

              {voted && <SuccessScreen tc={tc} contestId={contestId || 'demo-1'} />}
            </>
          )}

          {/* Method switcher for demo */}
          <div style={{ marginTop: 48, padding: '16px', background: '#141414', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 11, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Demo: Try other voting methods</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(methodLabels).map(([key, label]) => (
                <Link key={key} to={`/vote/${contestId || 'demo-1'}?method=${key}`} style={{ padding: '5px 10px', border: `1px solid ${method === key ? tc.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 6, background: method === key ? `rgba(${tc.rgb},0.1)` : 'transparent', color: method === key ? tc.color : '#7a7a7a', fontSize: 11, textDecoration: 'none', fontWeight: method === key ? 600 : 400 }} onClick={() => setVoted(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
