import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';
import namicoIcon from '../assets/namico-icon.svg';
import { Users, CheckCircle, Lock, ArrowRight, ArrowLeft } from '@phosphor-icons/react';

const TYPES = [
  {
    id: 'submission_voting',
    label: 'Open Contest',
    sublabel: 'Submission + Voting',
    icon: Users,
    description: 'Invite people to suggest names, then vote on favorites',
    flow: ['Brief Builder', 'Invite', 'Submission Phase', 'Curation', 'Voting Phase', 'Results'],
    useCase: 'Get fresh ideas from your team or community',
    recommended: true,
  },
  {
    id: 'voting_only',
    label: 'Voting Only',
    sublabel: 'You already have name options',
    icon: CheckCircle,
    description: "You already have name options. Just need votes.",
    flow: ['Upload Names', 'Invite', 'Voting Phase', 'Results'],
    useCase: "You've narrowed to 5-10 finalists. Let people vote.",
    recommended: false,
  },
  {
    id: 'internal_brainstorm',
    label: 'Internal Brainstorm',
    sublabel: 'Separate submission + voting groups',
    icon: Lock,
    description: 'Small group submits names. Different group votes.',
    flow: ['Brief Builder', 'Invite Submitters', 'Submissions', 'Invite Voters', 'Voting', 'Results'],
    useCase: 'Creative team proposes. Leadership decides.',
    recommended: false,
  },
];

function FlowPill({ label, color }) {
  return (
    <span style={{ padding: '3px 9px', background: 'rgba(30,35,48,0.04)', border: '0.5px solid rgba(30,35,48,0.1)', borderRadius: 20, fontSize: 11, color: '#8a8a82', whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

function TypeCard({ type, isSelected, tc, onClick }) {
  const Icon = type.icon;
  return (
    <div
      onClick={onClick}
      style={{
        background: isSelected ? `rgba(${tc.rgb},0.06)` : '#ffffff',
        border: `1px solid ${isSelected ? `rgba(${tc.rgb},0.5)` : 'rgba(30,35,48,0.1)'}`,
        borderRadius: 14,
        padding: '20px 24px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      {type.recommended && (
        <div style={{ position: 'absolute', top: 14, right: 14, padding: '2px 8px', background: `rgba(${tc.rgb},0.15)`, border: `0.5px solid rgba(${tc.rgb},0.4)`, borderRadius: 10, fontSize: 10, fontWeight: 700, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Most Popular
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
        {/* Radio */}
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${isSelected ? tc.primary : 'rgba(30,35,48,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: tc.primary }} />}
        </div>
        {/* Icon + title */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: isSelected ? `rgba(${tc.rgb},0.15)` : 'rgba(30,35,48,0.04)', border: `0.5px solid ${isSelected ? `rgba(${tc.rgb},0.3)` : 'rgba(30,35,48,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={18} color={isSelected ? tc.primary : '#8a8a82'} weight="duotone" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e2330' }}>{type.label}</div>
              <div style={{ fontSize: 12, color: '#8a8a82' }}>{type.sublabel}</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: '#676b5f', lineHeight: 1.5, marginBottom: 12 }}>{type.description}</div>
          {/* Flow pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
            {type.flow.map((step, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FlowPill label={step} />
                {i < type.flow.length - 1 && <span style={{ fontSize: 10, color: '#8a8a82' }}>→</span>}
              </span>
            ))}
          </div>
          {/* Use case */}
          <div style={{ fontSize: 12, color: isSelected ? tc.primary : '#8a8a82', fontStyle: 'italic' }}>
            Best for: "{type.useCase}"
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContestTypeSelection() {
  const { group, subSegment } = useParams();
  const navigate = useNavigate();
  const tc = getGroupTheme(group);

  const [selectedType, setSelectedType] = useState(null);
  const [votingPermissions, setVotingPermissions] = useState('all_participants');
  const [allowNonSubmitters, setAllowNonSubmitters] = useState(true);
  const [voterEmails, setVoterEmails] = useState('');
  const [submitterEmails, setSubmitterEmails] = useState('');

  const canContinue = selectedType !== null &&
    (votingPermissions === 'all_participants' || voterEmails.trim().length > 0) &&
    (selectedType !== 'internal_brainstorm' || submitterEmails.trim().length > 0);

  const handleContinue = () => {
    if (!canContinue) return;
    localStorage.setItem('selectedGroup', group);
    localStorage.setItem('selectedSubSegment', subSegment);
    localStorage.setItem('contestType', selectedType);
    localStorage.setItem('votingPermissions', votingPermissions);
    localStorage.setItem('voterEmails', voterEmails);
    localStorage.setItem('submitterEmails', submitterEmails);
    if (selectedType === 'voting_only') {
      navigate('/upload-names');
    } else {
      navigate(`/brief/${group}/${subSegment}`);
    }
  };

  const voterCount = voterEmails.split('\n').filter(e => e.trim()).length;
  const submitterCount = submitterEmails.split('\n').filter(e => e.trim()).length;

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf5', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid rgba(30,35,48,0.08)', background: '#ffffff' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: tc.primary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="NamingContest" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#1e2330' }}>NamingContest</span>
        </Link>
        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {['Choose Type', 'Account', 'Sub-type', 'Contest Type', 'Brief'].map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: i <= 3 ? tc.primary : 'rgba(30,35,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i <= 3 ? tc.textColor : '#8a8a82' }}>
                  {i < 3 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i === 3 ? '#1e2330' : i < 3 ? tc.primary : '#8a8a82', fontWeight: i === 3 ? 600 : 400 }}>{step}</span>
              </div>
              {i < 4 && <div style={{ width: 16, height: 1, background: 'rgba(30,35,48,0.08)' }} />}
            </div>
          ))}
        </div>
        <div style={{ width: 160 }} />
      </div>

      {/* Main */}
      <div style={{ flex: 1, maxWidth: 720, margin: '0 auto', padding: '48px 24px', width: '100%' }}>

        <button onClick={() => navigate(`/select/${group}`)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#8a8a82', fontSize: 13, cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: 32, padding: 0 }}>
          <ArrowLeft size={14} /> Back to sub-type selection
        </button>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: `rgba(${tc.primaryRgb},0.1)`, border: `0.5px solid rgba(${tc.primaryRgb},0.25)`, borderRadius: 9999, padding: '3px 12px', fontSize: 11, fontWeight: 600, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            {tc.label} · Step 3 of 5
          </div>
          <h1 style={{ fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: '#1e2330', marginBottom: 10, fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>
            What type of contest do you need?
          </h1>
          <p style={{ fontSize: 15, color: '#676b5f', lineHeight: 1.5 }}>
            This determines the flow — who submits names, who votes, and how the winner is chosen.
          </p>
        </div>

        {/* Type cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
          {TYPES.map(type => (
            <TypeCard key={type.id} type={type} isSelected={selectedType === type.id} tc={tc} onClick={() => { setSelectedType(type.id); setVotingPermissions('all_participants'); }} />
          ))}
        </div>

        {/* ── Voting Permissions Panel (appears after type selected) ── */}
        {selectedType && (
          <div style={{ background: '#ffffff', border: `1px solid rgba(${tc.primaryRgb},0.2)`, borderRadius: 14, padding: '24px', marginBottom: 28, animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e2330', marginBottom: 4, fontFamily: "'Bricolage Grotesque', 'Inter', sans-serif" }}>Who can vote on the names?</h3>
            <p style={{ fontSize: 13, color: '#8a8a82', marginBottom: 20 }}>
              {selectedType === 'internal_brainstorm'
                ? 'For Internal Brainstorm: configure who can submit names AND who votes on them.'
                : "Decide whether everyone who submits names can also vote, or only specific people."}
            </p>

            {/* For internal_brainstorm: show submitter emails first */}
            {selectedType === 'internal_brainstorm' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1e2330', display: 'block', marginBottom: 8 }}>
                  Submitter emails <span style={{ color: tc.primary }}>*</span>
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#8a8a82', marginLeft: 8 }}>— people who propose names</span>
                </label>
                <textarea
                  value={submitterEmails}
                  onChange={e => setSubmitterEmails(e.target.value)}
                  rows={4}
                  placeholder={"designer@company.com\ncopywriter@company.com\nbrand@company.com"}
                  style={{ width: '100%', background: '#ffffff', border: `0.5px solid rgba(${tc.primaryRgb},0.3)`, borderRadius: 8, padding: '10px 12px', color: '#1e2330', fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical', boxSizing: 'border-box' }}
                />
                {submitterCount > 0 && <div style={{ fontSize: 12, color: tc.primary, marginTop: 4 }}>{submitterCount} submitter{submitterCount !== 1 ? 's' : ''} added</div>}
              </div>
            )}

            {/* Radio options — not shown for internal_brainstorm (voters always specific) */}
            {selectedType !== 'internal_brainstorm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  selectedType === 'voting_only'
                    ? { value: 'all_participants', label: 'Anyone with the link can vote', desc: 'Open voting — anyone you share the contest link with can cast a vote.' }
                    : { value: 'all_participants', label: 'Everyone who submits can vote', desc: 'Democratic approach. All contributors get a voice in the decision.' },
                  { value: 'specific_voters', label: 'Only specific people can vote', desc: 'You control the voter list. Only the people you invite can cast a vote.' },
                ].map(opt => (
                  <label key={opt.value} onClick={() => setVotingPermissions(opt.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: votingPermissions === opt.value ? `rgba(${tc.rgb},0.05)` : '#ffffff', border: `0.5px solid ${votingPermissions === opt.value ? `rgba(${tc.rgb},0.4)` : 'rgba(30,35,48,0.1)'}`, borderRadius: 10, cursor: 'pointer' }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${votingPermissions === opt.value ? tc.primary : 'rgba(30,35,48,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {votingPermissions === opt.value && <div style={{ width: 7, height: 7, borderRadius: '50%', background: tc.primary }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1e2330', marginBottom: 3 }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: '#8a8a82', lineHeight: 1.5 }}>{opt.desc}</div>
                      {opt.value === 'all_participants' && votingPermissions === 'all_participants' && selectedType !== 'voting_only' && (
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, cursor: 'pointer' }}>
                          <input type="checkbox" checked={allowNonSubmitters} onChange={e => setAllowNonSubmitters(e.target.checked)} style={{ accentColor: tc.primary, width: 14, height: 14 }} />
                          <span style={{ fontSize: 12, color: '#676b5f' }}>Allow voting even if someone didn't submit</span>
                        </label>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Voter email input — shown when specific_voters OR internal_brainstorm */}
            {(votingPermissions === 'specific_voters' || selectedType === 'internal_brainstorm') && (
              <div style={{ paddingTop: selectedType !== 'internal_brainstorm' ? 4 : 0 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#1e2330', display: 'block', marginBottom: 8 }}>
                  Voter emails <span style={{ color: tc.primary }}>*</span>
                  {selectedType === 'internal_brainstorm' && <span style={{ fontSize: 11, fontWeight: 400, color: '#8a8a82', marginLeft: 8 }}>— people who decide (can overlap with submitters)</span>}
                </label>
                <textarea
                  value={voterEmails}
                  onChange={e => setVoterEmails(e.target.value)}
                  rows={4}
                  placeholder={"sarah@company.com\njohn@company.com\nceo@company.com"}
                  style={{ width: '100%', background: '#ffffff', border: `0.5px solid rgba(${tc.primaryRgb},0.3)`, borderRadius: 8, padding: '10px 12px', color: '#1e2330', fontSize: 13, fontFamily: "'Inter', sans-serif", resize: 'vertical', boxSizing: 'border-box' }}
                />
                {voterCount > 0 && <div style={{ fontSize: 12, color: tc.primary, marginTop: 4 }}>{voterCount} voter{voterCount !== 1 ? 's' : ''} added</div>}
                {selectedType !== 'internal_brainstorm' && (
                  <>
                    <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 8 }}>These people will receive voting invites after the submission phase closes.</div>
                    <div style={{ fontSize: 12, color: '#8a8a82', marginTop: 4 }}>Voters will NOT see who submitted each name (unless you disable anonymous mode)</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          style={{ width: '100%', height: 52, background: canContinue ? tc.primary : 'rgba(30,35,48,0.1)', border: 'none', borderRadius: 12, color: canContinue ? tc.textColor : '#8a8a82', fontSize: 15, fontWeight: 700, cursor: canContinue ? 'pointer' : 'not-allowed', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: canContinue ? 1 : 0.5 }}
        >
          Continue <ArrowRight size={16} weight="bold" />
        </button>
        {!selectedType && <p style={{ textAlign: 'center', fontSize: 12, color: '#8a8a82', marginTop: 10 }}>Select a contest type to continue</p>}
      </div>

    </div>
  );
}
