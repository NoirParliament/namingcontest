import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trophy, ArrowRight, ArrowLeft, Plus, Trash, CheckCircle, WarningCircle } from '@phosphor-icons/react';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', textColor: '#000', label: 'Business' },
  team:     { color: '#8B5CF6', rgb: '139,92,246', textColor: '#fff', label: 'Team' },
  personal: { color: '#10B981', rgb: '16,185,129', textColor: '#fff', label: 'Personal' },
};

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
  const tc = TIER[group] || TIER.business;

  const [nameInput, setNameInput] = useState('');
  const [names, setNames] = useState([]);
  const [votingMethod, setVotingMethod] = useState('simple_poll');
  const [votingDays, setVotingDays] = useState(3);
  const [tab, setTab] = useState('paste'); // 'paste' | 'type'

  const voterCount = voterEmailsStored.split('\n').filter(e => e.trim()).length;

  const parsedNames = nameInput
    .split('\n')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  const handleAddFromInput = () => {
    const newNames = [...new Set([...names, ...parsedNames])];
    setNames(newNames);
    setNameInput('');
  };

  const handleRemoveName = (idx) => setNames(names.filter((_, i) => i !== idx));

  const isReady = names.length >= 2;
  const isIdeal = names.length >= 5 && names.length <= 20;

  const handleLaunch = () => {
    localStorage.setItem('uploadedNames', JSON.stringify(names));
    localStorage.setItem('votingMethod', votingMethod);
    localStorage.setItem('votingDays', String(votingDays));
    navigate('/invite/demo-1');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: '#eaef09', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={15} weight="bold" color="#000" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>NamingContest</span>
        </Link>
        <div style={{ padding: '3px 12px', background: `rgba(${tc.rgb},0.1)`, border: `0.5px solid rgba(${tc.rgb},0.3)`, borderRadius: 20, fontSize: 11, fontWeight: 600, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Voting Only Flow
        </div>
        <div style={{ width: 160 }} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, maxWidth: 680, margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        <button onClick={() => navigate('/auth')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#7a7a7a', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif', marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Voting Only · Upload Name Candidates</div>
          <h1 style={{ fontSize: 'clamp(24px,3vw,38px)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>What names are you voting on?</h1>
          <p style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.6 }}>
            Add 5-20 name candidates. Your voters will see exactly these options. Recommended: 5-10 names for best participation.
          </p>
        </div>

        {/* Input tabs */}
        <div style={{ display: 'flex', gap: 4, background: '#141414', borderRadius: 10, padding: 4, marginBottom: 16 }}>
          {[{ id: 'paste', label: 'Paste a list' }, { id: 'type', label: 'Type one by one' }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, height: 34, border: 'none', borderRadius: 7, background: tab === t.id ? '#2a2a2a' : 'transparent', color: tab === t.id ? '#fff' : '#7a7a7a', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
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
              style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', color: '#fff', fontSize: 15, fontFamily: 'Inter, sans-serif', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.8 }}
            />
            {parsedNames.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <span style={{ fontSize: 12, color: '#7a7a7a' }}>{parsedNames.length} name{parsedNames.length !== 1 ? 's' : ''} detected</span>
                <button onClick={handleAddFromInput} style={{ height: 34, padding: '0 16px', background: `rgba(${tc.rgb},0.1)`, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, color: tc.color, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                  Add to ballot →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) { setNames(prev => [...new Set([...prev, nameInput.trim()])]); setNameInput(''); } }}
                placeholder="Type a name and press Enter"
                style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, height: 40, padding: '0 14px', color: '#fff', fontSize: 14, fontFamily: 'Inter, sans-serif' }}
              />
              <button onClick={() => { if (nameInput.trim()) { setNames(prev => [...new Set([...prev, nameInput.trim()])]); setNameInput(''); } }} style={{ height: 40, width: 40, background: `rgba(${tc.rgb},0.1)`, border: `1px solid rgba(${tc.rgb},0.4)`, borderRadius: 8, color: tc.color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ fontSize: 12, color: '#4a4a4a', marginTop: 6 }}>Press Enter after each name</div>
          </div>
        )}

        {/* Ballot preview */}
        {names.length > 0 && (
          <div style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ballot — {names.length} name{names.length !== 1 ? 's' : ''}
              </div>
              {!isIdeal && names.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: names.length < 5 ? '#eaef09' : '#ef4444' }}>
                  <WarningCircle size={13} />
                  {names.length < 5 ? 'Add at least 5 names for best results' : 'Over 20 names may reduce participation quality'}
                </div>
              )}
              {isIdeal && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10B981' }}>
                  <CheckCircle size={13} weight="fill" /> Ideal range
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {names.map((name, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: '#4a4a4a', width: 20, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ flex: 1, fontSize: 15, color: '#fff', fontWeight: 600 }}>{name}</span>
                  <button onClick={() => handleRemoveName(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4a4a4a', display: 'flex', alignItems: 'center', padding: 4 }}>
                    <Trash size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voting method */}
        {isReady && (
          <>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Voting method</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {VOTING_METHODS.map(m => (
                <div key={m.id} onClick={() => setVotingMethod(m.id)} style={{ padding: '14px 16px', background: votingMethod === m.id ? `rgba(${tc.rgb},0.06)` : '#1a1a1a', border: `0.5px solid ${votingMethod === m.id ? `rgba(${tc.rgb},0.4)` : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${votingMethod === m.id ? tc.color : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {votingMethod === m.id && <div style={{ width: 6, height: 6, borderRadius: '50%', background: tc.color }} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{m.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#7a7a7a', lineHeight: 1.4, marginBottom: 4, paddingLeft: 22 }}>{m.desc}</div>
                  <div style={{ fontSize: 11, color: '#4a4a4a', paddingLeft: 22 }}>Best for: {m.best}</div>
                </div>
              ))}
            </div>

            {/* Voting duration */}
            <div style={{ background: '#141414', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Voting duration</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[2, 3, 5, 7].map(d => (
                    <button key={d} onClick={() => setVotingDays(d)} style={{ width: 44, height: 36, border: `1px solid ${votingDays === d ? tc.color : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, background: votingDays === d ? `rgba(${tc.rgb},0.1)` : 'transparent', color: votingDays === d ? tc.color : '#a1a1a1', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                      {d}d
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: '#7a7a7a' }}>
                  Voting closes: {new Date(Date.now() + votingDays * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Voter summary */}
            <div style={{ padding: '14px 18px', background: `rgba(${tc.rgb},0.04)`, border: `1px solid rgba(${tc.rgb},0.15)`, borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Voting permissions</div>
                <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 2 }}>
                  {voterCount > 0 ? `${voterCount} specific voter${voterCount !== 1 ? 's' : ''} will receive invites` : 'No voters added — go back to add voter emails'}
                </div>
              </div>
              <button onClick={() => navigate(-1)} style={{ fontSize: 12, color: tc.color, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                Edit voter list
              </button>
            </div>

            {/* Launch button */}
            <button
              onClick={handleLaunch}
              style={{ width: '100%', height: 52, background: tc.color, border: 'none', borderRadius: 12, color: tc.textColor, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              Launch Voting Contest — {names.length} names, {votingDays} days
              <ArrowRight size={16} weight="bold" />
            </button>
          </>
        )}

        {!isReady && names.length === 0 && (
          <div style={{ padding: '24px', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, textAlign: 'center', color: '#4a4a4a', fontSize: 14 }}>
            Add at least 2 names to continue
          </div>
        )}
      </div>

    </div>
  );
}
