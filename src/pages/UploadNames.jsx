import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { ArrowRight, ArrowLeft, Plus, Trash, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';
import { UPLOAD_NAMES_ACTIONS, saveCreatorQuality } from '../utils/quality';

const VOTING_METHODS = [
  { id: 'simple_poll', label: 'Simple Poll', desc: 'One vote per person. Fast and clear.', best: 'Quick decisions, small groups' },
  { id: 'ranked_choice', label: 'Ranked Choice', desc: 'Rank all options in order of preference.', best: 'Consensus building, 5-10 names' },
  { id: 'multi_criteria', label: 'Multi-Criteria', desc: 'Rate each name on 4-5 dimensions.', best: 'Business naming, data-backed decisions' },
  { id: 'pairwise', label: 'Pairwise', desc: 'Head-to-head matchups between names.', best: '6-12 names, clear winner needed' },
];

export default function UploadNames() {
  const navigate = useNavigate();

  const group = localStorage.getItem('selectedGroup') || 'business';
  const subSegment = localStorage.getItem('selectedSubSegment') || 'company-name';
  const voterEmailsStored = localStorage.getItem('voterEmails') || '';
  const tc = getGroupTheme(group);

  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');
  // candidates: { name: string, description: string }[]
  const [candidates, setCandidates] = useState([]);
  const [votingMethod, setVotingMethod] = useState('simple_poll');
  const [votingDays, setVotingDays] = useState(3);
  const [tab, setTab] = useState('paste'); // 'paste' | 'type'

  const voterCount = voterEmailsStored.split('\n').filter(e => e.trim()).length;


  const parsedNames = nameInput
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  const handleAddFromInput = () => {
    const existing = new Set(candidates.map(c => c.name));
    const newCandidates = parsedNames
      .filter(n => !existing.has(n))
      .map(n => ({ name: n, description: '' }));
    setCandidates(prev => [...prev, ...newCandidates]);
    setNameInput('');
  };

  const handleAddOne = () => {
    const name = nameInput.trim();
    if (!name) return;
    if (candidates.some(c => c.name === name)) { setNameInput(''); setDescInput(''); return; }
    setCandidates(prev => [...prev, { name, description: descInput.trim() }]);
    setNameInput('');
    setDescInput('');
  };

  const handleRemove = (idx) => setCandidates(candidates.filter((_, i) => i !== idx));

  const handleDescChange = (idx, val) => {
    setCandidates(prev => prev.map((c, i) => i === idx ? { ...c, description: val } : c));
  };

  const isReady = candidates.length >= 2;
  const isIdeal = candidates.length >= 5 && candidates.length <= 20;

  // ── Quality score (creator side, 0–50) ──────────────────────────────────────
  const descCount = candidates.filter(c => c.description.trim()).length;
  const namesScore = Math.min(6, candidates.length) * UPLOAD_NAMES_ACTIONS.nameUploaded;
  const descsScore = Math.min(4, descCount) * UPLOAD_NAMES_ACTIONS.nameDescribed;
  const methodScore = isReady ? UPLOAD_NAMES_ACTIONS.votingMethod : 0;
  const durationScore = isReady ? UPLOAD_NAMES_ACTIONS.votingDuration : 0;
  const creatorScore = Math.min(50, namesScore + descsScore + methodScore + durationScore);

  useEffect(() => { saveCreatorQuality(group, creatorScore); }, [creatorScore, group]);

  const handleLaunch = () => {
    localStorage.setItem('uploadedNames', JSON.stringify(candidates));
    localStorage.setItem('votingMethod', votingMethod);
    localStorage.setItem('votingDays', String(votingDays));
    navigate('/invite/demo-1');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf5', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(30,35,48,0.08)', background: '#ffffff' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: tc.primary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="NamingContest" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e2330' }}>NamingContest</span>
        </Link>
        <div style={{ padding: '3px 12px', background: `rgba(${tc.primaryRgb},0.08)`, border: `0.5px solid rgba(${tc.primaryRgb},0.2)`, borderRadius: 20, fontSize: 11, fontWeight: 600, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Voting Only Flow
        </div>
        <div style={{ width: 160 }} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        <button onClick={() => navigate('/auth')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8a8a82', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Voting Only · Upload Name Candidates</div>
          <h1 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#1e2330', marginBottom: 10, fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>What names are you voting on?</h1>
          <p style={{ fontSize: 14, color: '#676b5f', lineHeight: 1.6 }}>
            Add 5–20 name candidates. Optionally include a short description or rationale for each name — voters will see it when casting their vote.
          </p>
        </div>

        {/* Input tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#fafaf5', borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {[{ id: 'paste', label: 'Paste a list' }, { id: 'type', label: 'Type one by one' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, height: 34, border: 'none', borderRadius: 7, background: tab === t.id ? 'rgba(30,35,48,0.06)' : 'transparent', color: tab === t.id ? '#1e2330' : '#8a8a82', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'paste' ? (
          <div style={{ marginBottom: 16 }}>
            <textarea
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              rows={6}
              placeholder={"Apex\nNova\nForgepoint\nStratus\nKindling\n(one name per line)"}
              style={{ width: '100%', background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.15)', borderRadius: 10, padding: '14px 16px', color: '#1e2330', fontSize: 15, fontFamily: 'Inter, sans-serif', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.8 }}
            />
            {parsedNames.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#8a8a82' }}>{parsedNames.length} name{parsedNames.length !== 1 ? 's' : ''} detected · add descriptions in the ballot below</span>
                <button onClick={handleAddFromInput} style={{ height: 34, padding: '0 16px', background: `rgba(${tc.primaryRgb},0.08)`, border: `1px solid rgba(${tc.primaryRgb},0.3)`, borderRadius: 8, color: tc.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Add to ballot →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddOne(); }}
                placeholder="Name (e.g. Apex)"
                style={{ flex: 1, background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.15)', borderRadius: 8, height: 40, padding: '0 14px', color: '#1e2330', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
              />
              <button onClick={handleAddOne} style={{ height: 40, width: 40, background: `rgba(${tc.primaryRgb},0.08)`, border: `1px solid rgba(${tc.primaryRgb},0.3)`, borderRadius: 8, color: tc.primary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Plus size={16} />
              </button>
            </div>
            <input
              value={descInput}
              onChange={e => setDescInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddOne(); }}
              placeholder="Optional: short rationale or description for voters"
              style={{ width: '100%', background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.12)', borderRadius: 8, height: 36, padding: '0 14px', color: '#676b5f', fontSize: 13, fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 6 }}>Press Enter after each name · description is optional</div>
          </div>
        )}

        {/* Ballot preview */}
        {candidates.length > 0 && (
          <div style={{ background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.1)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#8a8a82', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ballot — {candidates.length} name{candidates.length !== 1 ? 's' : ''}
              </div>
              {!isIdeal && candidates.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: candidates.length < 5 ? tc.primary : '#ef4444' }}>
                  <WarningCircle size={13} />
                  {candidates.length < 5 ? 'Add at least 5 names for best results' : 'Over 20 names may reduce participation quality'}
                </div>
              )}
              {isIdeal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: tc.primary }}>
                  <CheckCircle size={13} weight="fill" /> Ideal range
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {candidates.map((c, i) => (
                <div key={i} style={{ padding: '10px 12px', background: '#fafaf5', border: '0.5px solid rgba(30,35,48,0.08)', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: c.description !== undefined ? 6 : 0 }}>
                    <span style={{ fontSize: 11, color: '#8a8a82', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 15, color: '#1e2330', fontWeight: 600 }}>{c.name}</span>
                    <button onClick={() => handleRemove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a8a82', display: 'flex', alignItems: 'center', padding: 4, flexShrink: 0 }}>
                      <Trash size={13} />
                    </button>
                  </div>
                  <input
                    value={c.description}
                    onChange={e => handleDescChange(i, e.target.value)}
                    placeholder="Add a short description for voters (optional)"
                    style={{ width: '100%', background: 'transparent', border: 'none', borderTop: '0.5px solid rgba(30,35,48,0.06)', padding: '6px 0 2px 30px', color: '#8a8a82', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting method */}
        {isReady && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e2330', marginBottom: 12, fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>Voting method</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {VOTING_METHODS.map(m => (
                <div key={m.id} onClick={() => setVotingMethod(m.id)} style={{ padding: '14px 16px', background: votingMethod === m.id ? `rgba(${tc.primaryRgb},0.06)` : '#ffffff', border: `0.5px solid ${votingMethod === m.id ? `rgba(${tc.primaryRgb},0.4)` : 'rgba(30,35,48,0.1)'}`, borderRadius: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${votingMethod === m.id ? tc.primary : 'rgba(30,35,48,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {votingMethod === m.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: tc.primary }} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2330' }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#8a8a82', lineHeight: 1.4, marginBottom: 4, paddingLeft: 22 }}>{m.desc}</div>
                  <div style={{ fontSize: 11, color: '#8a8a82', paddingLeft: 22 }}>Best for: {m.best}</div>
                </div>
              ))}
            </div>

            {/* Voting duration */}
            <div style={{ background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.1)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e2330', marginBottom: 12, fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>Voting duration</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[2, 3, 5, 7].map(d => (
                    <button key={d} onClick={() => setVotingDays(d)} style={{ width: 44, height: 36, border: `1px solid ${votingDays === d ? tc.primary : 'rgba(30,35,48,0.15)'}`, borderRadius: 8, background: votingDays === d ? `rgba(${tc.primaryRgb},0.08)` : 'transparent', color: votingDays === d ? tc.primary : '#676b5f', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {d}d
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#8a8a82' }}>
                  Voting closes: {new Date(Date.now() + votingDays * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Voter summary */}
            <div style={{ padding: '14px 18px', background: `rgba(${tc.primaryRgb},0.04)`, border: `1px solid rgba(${tc.primaryRgb},0.15)`, borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e2330' }}>Voting permissions</div>
                <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 2 }}>
                  {voterCount > 0 ? `${voterCount} specific voter${voterCount !== 1 ? 's' : ''} will receive invites` : 'No voters added — go back to add voter emails'}
                </div>
              </div>
              <button onClick={() => navigate(`/contest-type/${group}/${subSegment}`)} style={{ fontSize: 12, color: tc.primary, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Edit voter list
              </button>
            </div>

            {/* Contest Quality Bar */}
            <div style={{ background: '#ffffff', border: '0.5px solid rgba(30,35,48,0.1)', borderRadius: 12, padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#676b5f' }}>
                  Your setup quality: <span style={{ color: tc.primary, fontWeight: 800 }}>{creatorScore}/50</span>
                </div>
                <div style={{ fontSize: 11, color: '#c8c8c0' }}>Voter score: 0/50</div>
              </div>
              <div style={{ height: 6, background: '#f0f0ec', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${(creatorScore / 50) * 100}%`, background: tc.primary, borderRadius: 3, transition: 'width 0.3s' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {[
                  { label: `Names (${Math.min(6, candidates.length)}/6)`, pts: namesScore, done: candidates.length >= 6 },
                  { label: `Descriptions (${Math.min(4, descCount)}/4)`, pts: descsScore, done: descCount >= 4 },
                  { label: 'Voting method', pts: UPLOAD_NAMES_ACTIONS.votingMethod, done: true },
                  { label: 'Duration set', pts: UPLOAD_NAMES_ACTIONS.votingDuration, done: true },
                ].map(({ label, pts, done }) => (
                  <span key={label} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 3,
                    padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                    background: done && pts > 0 ? `rgba(${tc.primaryRgb},0.1)` : 'rgba(30,35,48,0.04)',
                    border: `0.5px solid ${done && pts > 0 ? `rgba(${tc.primaryRgb},0.25)` : 'rgba(30,35,48,0.1)'}`,
                    color: done && pts > 0 ? tc.primary : '#a1a1a1', transition: 'all 0.2s',
                  }}>
                    {done && pts > 0 ? '✓' : '○'} {label} <span style={{ opacity: 0.55, marginLeft: 2 }}>+{pts}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              style={{ width: '100%', height: 52, background: tc.primary, border: 'none', borderRadius: 12, color: '#ffffff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Launch Voting Contest — {candidates.length} names, {votingDays} days
              <ArrowRight size={16} weight="bold" />
            </button>
          </>
        )}

        {!isReady && candidates.length === 0 && (
          <div style={{ padding: '24px', border: '1px dashed rgba(30,35,48,0.15)', borderRadius: 12, textAlign: 'center', color: '#8a8a82', fontSize: 14 }}>
            Add at least 2 names to continue
          </div>
        )}
      </div>

    </div>
  );
}
