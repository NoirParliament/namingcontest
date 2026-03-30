import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import namicoIcon from '../assets/namico-icon.svg';
import { Link as LinkIcon, Envelope, QrCode, Copy, Check, ArrowRight, Users, Star, Info, ChatCircle, DeviceMobile } from '@phosphor-icons/react';
import { getJourneyMeta } from '../utils/journey';
import { getGroupTheme, LIGHT_THEME } from '../data/themeConfig';

const INVITE_CONFIG = {
  'company-name': {
    essential: ['Founders / C-suite', 'Marketing / Brand lead', "Anyone who'll use the name daily"],
    recommended: ['2-3 outsiders — investors, advisors, or customers'],
    recommendedNote: "30% of winning names came from someone outside the company. Airbnb's name came from a designer they hired, not the founders.",
    optional: ['Early employees (builds ownership)', 'Board members (if involved in brand decisions)'],
    sweetSpot: '12–25',
    sweetSpotNote: '<10 = not enough diversity · 12–25 = sweet spot · >30 = diminishing returns',
  },
  'product-name': {
    essential: ['Product team lead', 'Brand / Marketing team', 'Customer-facing staff (sales, support)'],
    recommended: ['2–3 existing customers who know the problem your product solves'],
    recommendedNote: "Customers name things differently than internal teams. They use the words your market actually uses — not your internal jargon.",
    optional: ['Product designers / UX team', 'Key investors or advisors'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Product naming benefits from diverse internal + a few external voices. Keep it tight.',
  },
  'project-name': {
    essential: ['Project team lead(s)', 'Department heads impacted by the project', 'Executive sponsor'],
    recommended: ['2–3 people most affected by this project (end users, downstream teams)'],
    recommendedNote: "The people most affected by the project often suggest names that stick — they know what this work means on the ground.",
    optional: ['Cross-functional stakeholders if broad impact'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Internal project naming works best with a focused group. Too many voices = political naming.',
  },
  'rebrand': {
    essential: ['Founders / CEO', 'Brand / Marketing team', 'Long-tenured employees (they carry brand memory)'],
    recommended: ['Customers who know the current name and what it means to them'],
    recommendedNote: "Brand equity lives in customer memory. They'll tell you what's worth keeping — and what associations the new name needs to escape.",
    optional: ['PR / Communications team', 'Board members if involved in brand decisions'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Rebrands need internal buy-in AND external reality check. Balance both.',
  },
  'other-business': {
    essential: ['Key decision-makers', 'Marketing or brand lead', "People who'll use the name daily"],
    recommended: ['2–3 outsiders for an external perspective'],
    recommendedNote: "Fresh eyes catch assumptions insiders miss. Even one outside voice can unlock a better name.",
    optional: ['Advisors, investors, or stakeholders'],
    sweetSpot: '10–25',
    sweetSpotNote: 'Sweet spot for most business naming contests.',
  },
  'sports-team': {
    essential: ['Team captain(s)', 'Coach / Manager'],
    recommended: ['3–5 core team members'],
    recommendedNote: "The whole team should feel ownership of the name — it will define their identity every game.",
    optional: ['Parents or guardians (youth teams)', 'Fans or supporters if established'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Enough voices for variety, small enough for consensus.',
  },
  'band-music': {
    essential: ['All band members (everyone in)'],
    recommended: ['Producer or manager', '1–2 superfans who know your sound'],
    recommendedNote: "Superfans tell you what the name means from the outside — they hear the music without the insider bias.",
    optional: ['Label reps if signed', 'Collaborators or session musicians'],
    sweetSpot: '5–10',
    sweetSpotNote: "Band names are personal — keep the circle tight. Too many outside voices dilute what makes you you.",
  },
  'podcast-channel': {
    essential: ['Host(s)', 'Producer / Editor'],
    recommended: ['3–5 people who match your target audience profile'],
    recommendedNote: "Your target listener knows what show names attract them. They're your most valuable naming input.",
    optional: ['Guest speakers who know your content well', 'Social media followers you trust'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Mix of creators and target audience gives you both insider vision and market reality.',
  },
  'civic-school-nonprofit': {
    essential: ['Founding team members', 'Board members', 'Executive Director'],
    recommended: ['5–10 community members you serve or plan to serve'],
    recommendedNote: "The community you serve should have a voice in what you're called. This is also a trust-building act — invite them in.",
    optional: ['Major donors or funders (if brand matters to them)', 'Volunteers and long-term supporters'],
    sweetSpot: '15–25',
    sweetSpotNote: 'Civic naming benefits from broad inclusion. More voices = more community ownership of the final name.',
  },
  'gaming-group': {
    essential: ['All group members'],
    recommended: [],
    recommendedNote: '',
    optional: ['Friends who play with you regularly'],
    sweetSpot: '3–8',
    sweetSpotNote: "Gaming groups are tight-knit. Everyone who matters is already in the group.",
  },
  'other-team': {
    essential: ['All group members'],
    recommended: ['Friends who know the group well — they see you from the outside'],
    recommendedNote: "Outside friends often suggest names that capture what the group looks like from the outside — which is the name that will stick with others.",
    optional: ['Anyone who has been part of the group in the past'],
    sweetSpot: '8–20',
    sweetSpotNote: 'Depends on group size — invite everyone who matters.',
  },
  'baby-name': {
    essential: ['Immediate family — parents, siblings, grandparents'],
    recommended: ["Close friends in the baby's life — godparents, best friends"],
    recommendedNote: "People who'll be in this child's life should feel included. It also means more people invested in the name from day one.",
    optional: ['Distant relatives, coworkers — anyone you want to feel involved'],
    sweetSpot: '8–15',
    sweetSpotNote: "Great way to make distant relatives feel connected. The certificate on the nursery wall tells the whole story.",
  },
  'pet-name': {
    essential: ['Immediate family members'],
    recommended: ['Anyone who will regularly see or care for the pet'],
    recommendedNote: "Pets become part of the community around them. The people who'll call the name most often should help choose it.",
    optional: ['Friends of the family who know about the new pet'],
    sweetSpot: '5–15',
    sweetSpotNote: "Keep it personal — this is a family moment.",
  },
  'home-property-fun': {
    essential: ["People who'll live in or regularly use the space"],
    recommended: ['Friends who know the space and your style'],
    recommendedNote: "Friends who've visited often name places better than the owners — they see the vibe without the familiarity bias.",
    optional: ['Neighbors, frequent guests, anyone with a connection to the space'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it fun and intimate.',
  },
  'other-personal': {
    essential: ["People closest to you who understand what you're naming"],
    recommended: ['A few friends or family for fresh perspective'],
    recommendedNote: "Outside voices catch what feels obvious to you but surprising to the world.",
    optional: ["Anyone with a connection to the thing you're naming"],
    sweetSpot: '5–15',
    sweetSpotNote: 'Scale to the occasion.',
  },
};

const EMAIL_TEMPLATES = {
  personalized: {
    subject: 'I need your help naming something important',
    body: `Hi [Name],

I'm running a naming contest and I'd love your input. You know my situation well, so your perspective would be genuinely valuable.

The contest is live now — just click the link below, submit one or more name ideas, and explain what you like about them. It takes less than 5 minutes.

[Contest Link]
PIN: [PIN]

Submissions close [Date]. Thanks so much!`,
  },
  generic: {
    subject: 'You\'re invited to a naming contest',
    body: `Hi there,

You're invited to participate in a collaborative naming contest on NamingContest.com.

Click the link below to submit your name ideas — no account required. The more perspectives we get, the better our final decision will be.

[Contest Link]
PIN: [PIN]

Deadline: [Date]

Thanks for participating!`,
  },
};

export default function InvitationGuidance() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const meta = getJourneyMeta(contestId);
  const tc = getGroupTheme(meta.group);
  const contest = { color: tc.primary, label: meta.label, title: meta.contestTitle };
  const contestUrl = `https://namingcontest.com/contest/${contestId}`;
  const contestPin = '7429';

  const [activeTab, setActiveTab] = useState('link');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [emailMode, setEmailMode] = useState('personalized');
  const [recipients, setRecipients] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const recipientCount = recipients.split('\n').filter(l => l.trim()).length;

  function handleCopy(text, setter) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 2000);
  }

  function handleSendEmail() {
    setEmailSent(true);
    setTimeout(() => setEmailSent(false), 3000);
  }

  const tabs = [
    { id: 'link', label: 'Share Link', icon: <LinkIcon size={15} /> },
    { id: 'email', label: 'Send Email', icon: <Envelope size={15} /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode size={15} /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: LIGHT_THEME.pageBg, fontFamily: LIGHT_THEME.fontBody, padding: '0 0 80px' }}>

      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px',
        background: LIGHT_THEME.navBg,
        borderBottom: `0.5px solid ${LIGHT_THEME.navBorder}`,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 28, height: 28, background: tc.primary, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={namicoIcon} alt="Naming Contest" style={{ width: 20, height: 20, display: 'block', filter: 'brightness(0) invert(1)' }} />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: LIGHT_THEME.textPrimary }}>NamingContest</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: tc.tagText,
            background: tc.tagBg,
            border: `0.5px solid ${tc.tagBorder}`,
            borderRadius: 9999, padding: '3px 10px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {contest.label}
          </span>
          <span style={{ fontSize: 13, color: LIGHT_THEME.textSecondary, fontWeight: 500 }}>{contest.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '48px 24px 0' }}>

        {/* Phase badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: tc.tagText,
            background: tc.tagBg, border: `0.5px solid ${tc.tagBorder}`,
            borderRadius: 4, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>
            Phase 5
          </div>
          <span style={{ fontSize: 14, color: LIGHT_THEME.textMuted }}>Invitation & Outreach</span>
        </div>

        <h1 style={{ fontSize: 30, fontWeight: 800, color: LIGHT_THEME.textPrimary, marginBottom: 8, fontFamily: LIGHT_THEME.fontDisplay }}>
          Your contest is live. Now invite participants.
        </h1>
        <p style={{ fontSize: 15, color: LIGHT_THEME.textMuted, marginBottom: 40, lineHeight: 1.6 }}>
          The more perspectives you gather, the better your final name. Choose how you want to reach people below.
        </p>

        {/* Contest Access Card */}
        <div style={{
          background: LIGHT_THEME.cardBg,
          border: `0.5px solid ${tc.tagBorder}`,
          borderRadius: 14,
          padding: '20px 24px',
          marginBottom: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          flexWrap: 'wrap',
          boxShadow: LIGHT_THEME.cardShadow,
        }}>
          <div>
            <div style={{ fontSize: 10, color: LIGHT_THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Contest Access</div>
            <div style={{ fontSize: 14, color: LIGHT_THEME.textPrimary, fontFamily: 'monospace', marginBottom: 4 }}>{contestUrl}</div>
            <div style={{ fontSize: 12, color: LIGHT_THEME.textSecondary }}>PIN: <span style={{ color: tc.primary, fontFamily: 'monospace', fontWeight: 700 }}>{contestPin}</span></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleCopy(`${contestUrl}\nPIN: ${contestPin}`, setCopiedCode)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 14px', borderRadius: 8, border: `0.5px solid ${LIGHT_THEME.inputBorder}`,
                background: LIGHT_THEME.cardBg, color: copiedCode ? tc.primary : LIGHT_THEME.textPrimary,
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {copiedCode ? <Check size={13} /> : <Copy size={13} />}
              {copiedCode ? 'Copied!' : 'Copy Both'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4,
          background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
          borderRadius: 10, padding: 4, marginBottom: 24,
          boxShadow: LIGHT_THEME.cardShadow,
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px 16px', borderRadius: 7,
                background: activeTab === tab.id ? `rgba(${tc.primaryRgb},0.08)` : 'transparent',
                border: activeTab === tab.id ? `0.5px solid rgba(${tc.primaryRgb},0.2)` : '0.5px solid transparent',
                color: activeTab === tab.id ? tc.primary : LIGHT_THEME.textMuted,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Share Link */}
        {activeTab === 'link' && (
          <div>
            <div style={{
              background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
              borderRadius: 12, padding: 20, marginBottom: 16,
              display: 'flex', gap: 10, alignItems: 'center',
              boxShadow: LIGHT_THEME.cardShadow,
            }}>
              <div style={{
                flex: 1, fontSize: 13, color: LIGHT_THEME.textSecondary, fontFamily: 'monospace',
                background: LIGHT_THEME.pageBg, border: `0.5px solid ${LIGHT_THEME.inputBorder}`,
                borderRadius: 7, padding: '10px 14px',
              }}>
                {contestUrl}
              </div>
              <button
                onClick={() => handleCopy(contestUrl, setCopiedUrl)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 16px', borderRadius: 8,
                  background: copiedUrl ? `rgba(${tc.primaryRgb},0.1)` : tc.primary,
                  border: copiedUrl ? `0.5px solid rgba(${tc.primaryRgb},0.3)` : 'none',
                  color: copiedUrl ? tc.primary : '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                {copiedUrl ? <Check size={14} /> : <Copy size={14} />}
                {copiedUrl ? 'Copied!' : 'Copy Link'}
              </button>
            </div>

            <div style={{ fontSize: 12, color: LIGHT_THEME.textMuted, marginBottom: 20, textAlign: 'center' }}>Share via platform</div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 8 }}>
              {[
                { name: 'Slack', icon: ChatCircle, desc: 'Post in a channel or DM', hint: 'Best for team contests' },
                { name: 'Email', icon: Envelope, desc: 'Send to your list', hint: 'High open rates' },
                { name: 'WhatsApp', icon: DeviceMobile, desc: 'Share with groups', hint: 'Fast mobile reach' },
              ].map(p => (
                <div key={p.name} style={{
                  background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
                  borderRadius: 10, padding: '16px 14px', cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  boxShadow: LIGHT_THEME.cardShadow,
                }}>
                  <div style={{ marginBottom: 8 }}>{(() => { const I = p.icon; return <I size={22} weight="duotone" />; })()}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: LIGHT_THEME.textPrimary, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: LIGHT_THEME.textMuted, marginBottom: 6 }}>{p.desc}</div>
                  <div style={{ fontSize: 10, color: tc.primary, fontWeight: 600 }}>{p.hint}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Send Email */}
        {activeTab === 'email' && (
          <div>
            {/* Personalized/Generic toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              {['personalized', 'generic'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setEmailMode(mode)}
                  style={{
                    padding: '7px 16px', borderRadius: 7,
                    background: emailMode === mode ? `rgba(${tc.primaryRgb},0.08)` : 'transparent',
                    border: `0.5px solid ${emailMode === mode ? `rgba(${tc.primaryRgb},0.2)` : LIGHT_THEME.cardBorder}`,
                    color: emailMode === mode ? tc.primary : LIGHT_THEME.textMuted,
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
              <span style={{ fontSize: 11, color: LIGHT_THEME.textMuted, alignSelf: 'center', marginLeft: 4 }}>
                {emailMode === 'personalized' ? 'Higher open rates, feels human' : 'Efficient for larger lists'}
              </span>
            </div>

            {/* Email preview */}
            <div style={{
              background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
              borderRadius: 12, padding: 20, marginBottom: 16,
              boxShadow: LIGHT_THEME.cardShadow,
            }}>
              <div style={{ fontSize: 10, color: LIGHT_THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Preview</div>
              <div style={{ fontSize: 12, color: LIGHT_THEME.textSecondary, marginBottom: 6 }}>
                <span style={{ color: LIGHT_THEME.textMuted }}>Subject: </span>
                {EMAIL_TEMPLATES[emailMode].subject}
              </div>
              <div style={{
                background: LIGHT_THEME.pageBg, border: `0.5px solid ${LIGHT_THEME.inputBorder}`,
                borderRadius: 8, padding: 14,
                fontSize: 12, color: LIGHT_THEME.textSecondary, lineHeight: 1.7,
                whiteSpace: 'pre-wrap', fontFamily: 'monospace',
              }}>
                {EMAIL_TEMPLATES[emailMode].body}
              </div>
            </div>

            {/* Recipients */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: LIGHT_THEME.textMuted, marginBottom: 8 }}>
                Recipients — one email per line
                {recipientCount > 0 && <span style={{ color: tc.primary, marginLeft: 8 }}>{recipientCount} added</span>}
              </div>
              <textarea
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder={'alice@company.com\nbob@company.com\ncharlie@company.com'}
                rows={5}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: LIGHT_THEME.inputBg, border: `0.5px solid ${LIGHT_THEME.inputBorder}`,
                  borderRadius: 8, padding: '12px 14px',
                  color: LIGHT_THEME.inputText, fontSize: 13, fontFamily: 'monospace',
                  resize: 'vertical', outline: 'none',
                }}
              />
            </div>

            <button
              onClick={handleSendEmail}
              disabled={recipientCount === 0}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 24px', borderRadius: 10,
                background: emailSent ? `rgba(${tc.primaryRgb},0.1)` : recipientCount > 0 ? tc.primary : LIGHT_THEME.pageBg,
                border: emailSent ? `0.5px solid rgba(${tc.primaryRgb},0.3)` : recipientCount > 0 ? 'none' : `0.5px solid ${LIGHT_THEME.cardBorder}`,
                color: emailSent ? tc.primary : recipientCount > 0 ? '#fff' : LIGHT_THEME.textMuted,
                fontSize: 13, fontWeight: 700, cursor: recipientCount > 0 ? 'pointer' : 'default',
              }}
            >
              {emailSent ? <Check size={14} /> : <Envelope size={14} />}
              {emailSent ? `Sent to ${recipientCount} recipients!` : `Send to ${recipientCount || 0} recipient${recipientCount !== 1 ? 's' : ''}`}
            </button>
          </div>
        )}

        {/* Tab: QR Code */}
        {activeTab === 'qr' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              display: 'inline-block',
              background: '#fff', borderRadius: 16, padding: 24, marginBottom: 24,
              border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
              boxShadow: LIGHT_THEME.cardShadow,
            }}>
              {/* SVG QR mock */}
              <svg width={180} height={180} viewBox="0 0 180 180" fill="none">
                {/* Finder patterns */}
                <rect x="10" y="10" width="50" height="50" rx="4" fill="#000"/>
                <rect x="18" y="18" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="26" y="26" width="18" height="18" rx="1" fill="#000"/>
                <rect x="120" y="10" width="50" height="50" rx="4" fill="#000"/>
                <rect x="128" y="18" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="136" y="26" width="18" height="18" rx="1" fill="#000"/>
                <rect x="10" y="120" width="50" height="50" rx="4" fill="#000"/>
                <rect x="18" y="128" width="34" height="34" rx="2" fill="#fff"/>
                <rect x="26" y="136" width="18" height="18" rx="1" fill="#000"/>
                {/* Data modules (scattered) */}
                {[70,76,82,88,94,100,106,112].map((x,i) => (
                  [70,76,82,88,94,100,106,112].map((y,j) => (
                    (i+j) % 3 !== 0 ? <rect key={`${i}-${j}`} x={x} y={y} width={5} height={5} fill="#000"/> : null
                  ))
                ))}
                {[70,76,82,88,94].map((x,i) => (
                  [10,16,22,28].map((y,j) => (
                    (i*j+i) % 2 === 0 ? <rect key={`t-${i}-${j}`} x={x} y={y} width={5} height={5} fill="#000"/> : null
                  ))
                ))}
              </svg>
            </div>
            <p style={{ fontSize: 13, color: LIGHT_THEME.textMuted, marginBottom: 24 }}>
              Scan to open the contest — no link needed.<br/>Perfect for physical spaces, events, or printed materials.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {['Download PNG', 'Print PDF'].map(action => (
                <button key={action} style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.inputBorder}`,
                  color: LIGHT_THEME.textPrimary, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>
                  {action}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Who Should You Invite? */}
        <div style={{ marginTop: 48 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              Who Should You Invite?
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: LIGHT_THEME.textPrimary, marginBottom: 6, fontFamily: LIGHT_THEME.fontDisplay }}>
              Choose carefully — the right voices lead to the best names.
            </div>
            <div style={{ fontSize: 14, color: LIGHT_THEME.textMuted }}>
              Not all opinions are equal. Here's who will give you the most useful input for this specific naming contest.
            </div>
          </div>

          {(() => {
            const cfg = INVITE_CONFIG[meta.sub] || INVITE_CONFIG['other-personal'];
            const tierDefs = [
              { key: 'essential', label: 'Essential', icon: <Star size={14} weight="fill" />, color: tc.primary, bg: `rgba(${tc.primaryRgb},0.06)`, border: `rgba(${tc.primaryRgb},0.2)`, items: cfg.essential, note: null },
              ...(cfg.recommended.length > 0 ? [{ key: 'recommended', label: 'Recommended', icon: <Users size={14} weight="fill" />, color: tc.primary, bg: `rgba(${tc.primaryRgb},0.04)`, border: `rgba(${tc.primaryRgb},0.15)`, items: cfg.recommended, note: cfg.recommendedNote }] : []),
              ...(cfg.optional.length > 0 ? [{ key: 'optional', label: 'Optional', icon: <Info size={14} weight="fill" />, color: LIGHT_THEME.textMuted, bg: 'rgba(30,35,48,0.03)', border: LIGHT_THEME.cardBorder, items: cfg.optional, note: null }] : []),
            ];
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tierDefs.map(tier => (
                  <div key={tier.key} style={{ background: tier.bg, border: `0.5px solid ${tier.border}`, borderRadius: 12, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12, color: tier.color }}>
                      {tier.icon}
                      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{tier.label}</span>
                    </div>
                    {tier.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 7 }}>
                        <span style={{ color: tier.color, flexShrink: 0, marginTop: 2, fontSize: 13 }}>·</span>
                        <span style={{ fontSize: 13, color: LIGHT_THEME.textSecondary, lineHeight: 1.55 }}>{item}</span>
                      </div>
                    ))}
                    {tier.note && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `0.5px solid ${LIGHT_THEME.divider}`, fontSize: 12, color: LIGHT_THEME.textMuted, lineHeight: 1.6, fontStyle: 'italic' }}>
                        {tier.note}
                      </div>
                    )}
                  </div>
                ))}

                {/* Sweet spot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: LIGHT_THEME.cardBg, borderRadius: 10, border: `0.5px solid ${tc.tagBorder}`, boxShadow: LIGHT_THEME.cardShadow }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: tc.primary, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Sweet Spot</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: LIGHT_THEME.textPrimary, fontFamily: LIGHT_THEME.fontDisplay }}>{cfg.sweetSpot} <span style={{ fontSize: 14, fontWeight: 500, color: LIGHT_THEME.textMuted }}>people</span></div>
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: LIGHT_THEME.textMuted, lineHeight: 1.55 }}>{cfg.sweetSpotNote}</div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 48, padding: '28px 32px',
          background: LIGHT_THEME.cardBg, border: `0.5px solid ${LIGHT_THEME.cardBorder}`,
          borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, flexWrap: 'wrap',
          boxShadow: LIGHT_THEME.cardShadow,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: LIGHT_THEME.textPrimary, marginBottom: 4 }}>Invites sent? Head to your contest overview.</div>
            <div style={{ fontSize: 13, color: LIGHT_THEME.textMuted }}>Monitor submissions, manage phases, and track everything from your contest overview.</div>
          </div>
          <button
            onClick={() => navigate(`/contest-detail/${contestId}`)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 24px', borderRadius: 10,
              background: tc.primary, border: 'none',
              color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            View Contest Overview
            <ArrowRight size={16} weight="bold" />
          </button>
        </div>

      </div>
    </div>
  );
}
