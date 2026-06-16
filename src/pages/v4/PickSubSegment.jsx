import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Baby, PawPrint, House, PencilSimple,
  Guitar, Microphone, GraduationCap, GameController,
  Buildings, Package, Target, ArrowsClockwise,
  Heart, UsersThree, Briefcase,
  X,
} from '@phosphor-icons/react';
import ExitLink from '../../components/v4/ExitLink';

const TIER_META = {
  personal: { Icon: Heart,      tone: { bg: '#fadecc', fg: '#9c4818' }, label: 'Personal contest' },
  group:    { Icon: UsersThree, tone: { bg: '#c4cff5', fg: '#283b78' }, label: 'Group contest' },
  business: { Icon: Briefcase,  tone: { bg: '#bce5c8', fg: '#1f5430' }, label: 'Business contest' },
};
import namingContestLogo from '../../assets/namingcontestlogo-cropped.svg';
import BrandLink from '../../components/v4/BrandLink';
import '../../styles/v4.css';

// Pastel tones drawn from homepage palette — each option gets its own warm color.
const TONES = {
  blush:      { bg: '#fadecc', fg: '#9c4818' },
  butter:     { bg: '#fceebc', fg: '#8a6a14' },
  mint:       { bg: '#bce5c8', fg: '#1f5430' },
  periwinkle: { bg: '#c4cff5', fg: '#283b78' },
  sky:        { bg: '#c4dffb', fg: '#1d4f7a' },
  pink:       { bg: '#f4cce0', fg: '#8a2864' },
  lavender:   { bg: '#dccaf2', fg: '#4f1d80' },
};

const SUB_SEGMENTS = {
  personal: {
    label: 'personal',
    options: [
      { id: 'p1', Icon: Baby,         tone: TONES.pink,       title: 'A new baby',                       body: "The most exciting naming you’ll ever do." },
      { id: 'p2', Icon: PawPrint,     tone: TONES.butter,     title: 'A pet',                            body: 'Dogs, cats, horses, the lot.' },
      { id: 'p3', Icon: House,        tone: TONES.mint,       title: 'Home, property, or something fun', body: 'Holiday cottage, boat, or anything in between.' },
      { id: 'p4', Icon: PencilSimple, tone: TONES.periwinkle, title: 'Something else',                   body: 'Tell us about it in the brief.' },
    ],
  },
  group: {
    label: 'group',
    options: [
      { id: 't1', Icon: UsersThree,    tone: TONES.mint,       title: 'A sports team',                            body: 'Local league, school squad, recreational team.' },
      { id: 't2', Icon: Guitar,        tone: TONES.lavender,   title: 'A band or music group',                    body: 'Whatever the genre.' },
      { id: 't3', Icon: Microphone,    tone: TONES.sky,        title: 'A podcast, channel, or creative project',  body: 'Audio, video, or anything in between.' },
      { id: 't4', Icon: GraduationCap, tone: TONES.blush,      title: 'A school, club, or nonprofit',             body: 'Civic, community, or institutional.' },
      { id: 't5', Icon: GameController,tone: TONES.butter,     title: 'A gaming group',                           body: 'Team, guild, or clan.' },
      { id: 't6', Icon: PencilSimple,  tone: TONES.periwinkle, title: 'Something else',                           body: 'Tell us about it in the brief.' },
    ],
  },
  business: {
    label: 'business',
    options: [
      { id: 'b1', Icon: Buildings,        tone: TONES.periwinkle, title: 'A company or startup',     body: 'Brand-new venture or established entity.' },
      { id: 'b2', Icon: Package,          tone: TONES.butter,     title: 'A product or service',     body: 'Software, physical good, or service offering.' },
      { id: 'b3', Icon: Target,           tone: TONES.blush,      title: 'A project or initiative',  body: 'Internal initiative, campaign, or program.' },
      { id: 'b4', Icon: ArrowsClockwise,  tone: TONES.mint,       title: 'A rebrand',                body: 'Refresh of an existing name.' },
      { id: 'b5', Icon: PencilSimple,     tone: TONES.sky,        title: 'Something else',           body: 'Tell us about it in the brief.' },
    ],
  },
};

// Phase progression for the chat reveal:
// 0 = nothing yet
// 1 = typing #1 (greeting)
// 2 = greeting bubble visible
// 3 = typing #2 (question)
// 4 = question bubble visible
// 5 = choices + next-up preview visible
const PHASE_TIMINGS = [
  { phase: 1, at: 300 },
  { phase: 2, at: 1100 },
  { phase: 3, at: 1700 },
  { phase: 4, at: 2400 },
  { phase: 5, at: 2700 },
];

export default function PickSubSegment() {
  const { group = 'personal' } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState(null);
  const data = SUB_SEGMENTS[group] || SUB_SEGMENTS.personal;
  const tierMeta = TIER_META[group] || TIER_META.personal;
  const selectedOption = selected ? data.options.find((o) => o.id === selected) : null;

  useEffect(() => {
    const timers = PHASE_TIMINGS.map(({ phase: p, at }) =>
      setTimeout(() => setPhase(p), at)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option.id);

    // Persist selection so subsequent setup screens can read it.
    try {
      const raw = localStorage.getItem('v4_contest_setup');
      const current = raw ? JSON.parse(raw) : {};
      const next = {
        ...current,
        group,
        subSegmentId: option.id,
        subSegmentTitle: option.title,
      };
      localStorage.setItem('v4_contest_setup', JSON.stringify(next));
    } catch {
      // localStorage unavailable — proceed anyway
    }

    setTimeout(() => navigate('/v4/setup/brief'), 1500);
  };

  return (
    <div className="v4">
      <div className="v4-screen">
        {/* Slim nav */}
        <header className="v4-nav">
          <BrandLink />
          <div className="v4-progress">
            <span className="v4-step-dot is-active"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-dot"></span>
            <span className="v4-step-label">Step 1 of 3</span>
          </div>
          <ExitLink to="/" aria-label="Exit" />
        </header>

        {/* Decorative pastel blobs */}
        <span className="v4-blob v4-blob-1" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-2" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-3" aria-hidden="true"></span>
        <span className="v4-blob v4-blob-4" aria-hidden="true"></span>

        {/* Chat container */}
        <main className="v4-chat" role="main">
          {/* Greeting — typing then bubble */}
          {phase === 1 && (
            <div className="v4-typing" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          )}
          {phase >= 2 && (
            <div className="v4-bubble">
              <span className="v4-bubble-icon" aria-hidden="true">👋</span>
              <span>Hi! Let’s set up your {data.label} contest. Won’t take long.</span>
            </div>
          )}

          {/* Question — typing then bubble */}
          {phase === 3 && (
            <div className="v4-typing" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
          )}
          {phase >= 4 && (
            <div className="v4-bubble">
              First — which kind of naming is this?
            </div>
          )}

          {/* Choices */}
          {phase >= 5 && !selected && (
            <div className="v4-choices" role="radiogroup" aria-label="Select naming type">
              {data.options.map((opt, i) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={selected === opt.id}
                  className="v4-choice"
                  onClick={() => handleSelect(opt)}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <span
                    className="v4-choice-icon"
                    style={{
                      background: opt.tone.bg,
                      color: opt.tone.fg,
                      animationDelay: `${-i * 0.4}s`,
                    }}
                    aria-hidden="true"
                  >
                    <opt.Icon weight="duotone" size={28} />
                  </span>
                  <div className="v4-choice-text">
                    <div className="v4-choice-title">{opt.title}</div>
                    <div className="v4-choice-body">{opt.body}</div>
                  </div>
                  <span className="v4-choice-arrow" aria-hidden="true">→</span>
                </button>
              ))}
            </div>
          )}

          {/* User reply bubble after selection */}
          {selected && selectedOption && (
            <div className="v4-bubble v4-bubble-user">
              <span
                className="v4-bubble-user-icon"
                style={{ background: selectedOption.tone.bg, color: selectedOption.tone.fg }}
                aria-hidden="true"
              >
                <selectedOption.Icon weight="duotone" size={18} />
              </span>
              <span>{selectedOption.title}</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
