import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy, BookOpen, PencilSimple, Check, Plus, Trash, ArrowRight, Clock,
  Star, Lightbulb, NotePencil, CheckCircle, WarningCircle, ChartBar, Users,
  Shuffle,
} from '@phosphor-icons/react';
import { mockContests } from '../data/mockData';
import { getJourneyMeta } from '../utils/journey';
import { loadCreatorQuality, computeParticipantScore, saveParticipantQuality } from '../utils/quality';

const TIER = {
  business: { color: '#eaef09', rgb: '234,239,9', label: 'Business' },
  team: { color: '#8B5CF6', rgb: '139,92,246', label: 'Team' },
  personal: { color: '#10B981', rgb: '16,185,129', label: 'Personal' },
};

/* ─── Quiz ─── */
function Quiz({ questions, onComplete, points, tc, qualityPct }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const earned = Math.round((correct / questions.length) * points);
    setScore(earned);
    setSubmitted(true);
    setTimeout(() => onComplete(earned), 1400);
  };

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '24px', background: `rgba(${tc.rgb},0.06)`, border: `1px solid rgba(${tc.rgb},0.2)`, borderRadius: 10 }}>
      <div style={{ fontSize: 28 }}>🎉</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginTop: 8 }}>+{Math.round((score / points) * qualityPct)}% quality</div>
      <div style={{ fontSize: 13, color: '#a1a1a1', marginTop: 4 }}>Article & quiz complete</div>
    </div>
  );

  return (
    <div>
      {questions.map((q, qi) => (
        <div key={qi} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 10, lineHeight: 1.5 }}>Q{qi + 1}: {q.question}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {q.options.map((opt, oi) => (
              <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: answers[qi] === oi ? `rgba(${tc.rgb},0.08)` : '#141414', border: `0.5px solid ${answers[qi] === oi ? tc.color : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, cursor: 'pointer' }}>
                <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers({ ...answers, [qi]: oi })} style={{ accentColor: tc.color }} />
                <span style={{ fontSize: 13, color: '#fff' }}>{opt}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
      <button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length} style={{ width: '100%', height: 40, border: `1px solid ${tc.color}`, borderRadius: 8, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 600, cursor: Object.keys(answers).length < questions.length ? 'not-allowed' : 'pointer', opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>
        Submit Quiz (+{qualityPct}% quality)
      </button>
    </div>
  );
}

/* ─── Article ─── */
function Article({ article, tc, onComplete, quizPoints, articleN, totalMaxPoints }) {
  const [quizOpen, setQuizOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);

  const readQualityPct   = Math.max(1, Math.round(article.readPoints / totalMaxPoints * 25));
  const completionPct    = Math.max(1, Math.round(25 / articleN));
  const quizQualityPct   = Math.max(1, Math.round(quizPoints / totalMaxPoints * 25));
  const totalArticlePct  = readQualityPct + quizQualityPct + completionPct;

  const handleRead = () => { setQuizOpen(true); onComplete(article.readPoints, 'read'); };
  const handleQuizComplete = (pts) => { setEarned(pts); setDone(true); onComplete(pts, 'quiz'); };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#7a7a7a' }}>📖 {article.readTime} read</span>
        <span style={{ fontSize: 12, color: `rgba(${tc.rgb},0.8)` }}>+{totalArticlePct}% quality</span>
      </div>
      <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: 22, color: '#fff', marginBottom: 16 }}>{article.title}</h3>
      <div style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.75, marginBottom: 16 }}>
        {article.body.map((para, i) => (
          <p key={i} style={{ marginBottom: 14 }} dangerouslySetInnerHTML={{ __html: para }} />
        ))}
      </div>
      {!quizOpen && !done && (
        <button onClick={handleRead} style={{ height: 40, padding: '0 20px', border: `1px solid ${tc.color}`, borderRadius: 8, background: `rgba(${tc.rgb},0.08)`, color: tc.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Mark as Read (+{readQualityPct}% quality) →
        </button>
      )}
      {quizOpen && !done && (
        <div style={{ marginTop: 20, padding: 20, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>Quick Quiz</div>
          <Quiz questions={article.quiz} onComplete={handleQuizComplete} points={quizPoints} tc={tc} qualityPct={quizQualityPct + completionPct} />
        </div>
      )}
      {done && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#10B981', fontSize: 13 }}>
          <Check size={16} weight="bold" /> Article & quiz complete · +{readQualityPct + Math.round((earned / quizPoints) * (quizQualityPct + completionPct))}% quality
        </div>
      )}
    </div>
  );
}

/* ─── Article Data ─── */
const B1_ARTICLES = [
  {
    id: 'b1-a1', title: 'Why Company Names Matter More Than You Think', readTime: '3 min', readPoints: 25,
    body: [
      'Naming is one of the most consequential decisions a company makes — and one of the least understood.',
      'A great name doesn\'t just describe your product. It creates a container for everything your brand will become. Apple tells you nothing about computers. Amazon tells you nothing about retail. Google doesn\'t even look like a real word. But each of these names became synonymous with their categories.',
      'The cost of getting it wrong is enormous. RadioShack, Friendster, Flooz — these aren\'t just failed names, they\'re cautionary tales about companies that couldn\'t outrun their branding.',
      '<strong>Why group naming fails:</strong> In most organizations, naming decisions fall to whoever speaks loudest in the room. The CEO\'s gut wins. The founder\'s first idea anchors the conversation. The loudest personality steamrolls nuance. This platform is designed to fix that. Anonymous submissions. Structured voting. Data-driven shortlisting.',
      '<strong>Three myths about naming:</strong><br>1. "It has to describe what we do" — Apple, Amazon, Google are all non-descriptive. The best names leave room to grow.<br>2. "Everyone has to love it" — The best name isn\'t the one everyone likes. It\'s the one that works.<br>3. "We\'ll know the right name when we hear it" — You won\'t. You\'ll feel uncertain. That\'s normal. Trust the process.',
    ],
    quiz: [
      { question: 'What\'s the PRIMARY reason group naming usually fails?', options: ['No one has good ideas', 'The loudest voice wins, not the best idea', 'Names are too expensive to research', 'Groups are too large'], correct: 1 },
      { question: 'Which of these is a myth about brand naming?', options: ['Abstract names can become iconic', 'You need to describe what you do for a name to work', 'Polarizing names can be memorable', 'You won\'t always feel certain about the right name'], correct: 1 },
      { question: 'Apple, Amazon, and Google are all examples of...', options: ['Descriptive names', 'Names that describe their products clearly', 'Abstract or non-descriptive names that became iconic', 'Failed naming decisions'], correct: 2 },
    ],
  },
  {
    id: 'b1-a2', title: 'The Five Types of Brand Names', readTime: '4 min', readPoints: 25,
    body: [
      'Not all names are created equal. Brand naming professionals classify names on a spectrum from Descriptive to Abstract.',
      '<strong>Descriptive:</strong> Says exactly what you do. Easy to understand, hard to trademark. Examples: General Motors, General Electric, The Weather Channel.',
      '<strong>Suggestive:</strong> Hints at benefits without stating them. The sweet spot for most brands. Examples: Amazon (vast), Salesforce (powerful CRM), Slack (the loosening of tension).',
      '<strong>Abstract:</strong> Invented or borrowed words with no inherent meaning. Examples: Kodak, Xerox, Verizon, Google. Risk: You have to build meaning from scratch. Reward: Total owability.',
      '<strong>Compound:</strong> Two words merged or blended. Examples: Microsoft, Facebook, Snapchat.',
      '<strong>Real word (repurposed):</strong> Existing words given new context. Examples: Apple, Amazon, Target, Uber.',
      '<strong>What this means for your submission:</strong> Look at the competitor names in the brief. If they\'re all suggestive, consider abstract. Differentiation starts with name type.',
    ],
    quiz: [
      { question: 'Amazon is an example of what type of brand name?', options: ['Descriptive', 'Abstract / coined', 'Real word repurposed', 'Compound'], correct: 2 },
      { question: 'Which type of name is typically the easiest to trademark?', options: ['Descriptive', 'Suggestive', 'Abstract or coined names', 'Compound'], correct: 2 },
      { question: 'If all competitors use suggestive names, what\'s often the smart move?', options: ['Use a descriptive name to stand out', 'Use a suggestive name too', 'Go abstract for maximum differentiation', 'Name type doesn\'t matter'], correct: 2 },
    ],
  },
  {
    id: 'b1-a3', title: "Catchword's 10 Criteria for Great Brand Names", readTime: '4 min', readPoints: 25,
    body: [
      'A name that "sounds cool" isn\'t enough. Catchword — one of the world\'s top naming agencies — evaluates names across 10 dimensions.',
      '<strong>The 10 Criteria:</strong><br>1. <strong>Magnetism</strong> — Does it draw you in?<br>2. <strong>Distinctiveness</strong> — Will it stand out?<br>3. <strong>Brand Fit</strong> — Does it align with values?<br>4. <strong>Accessibility</strong> — Easy to say, spell, remember?<br>5. <strong>Longevity</strong> — Will it still work in 10 years?<br>6. <strong>Conciseness</strong> — Is it appropriately short?<br>7. <strong>Euphony</strong> — Does it sound good aloud?<br>8. <strong>Appropriateness</strong> — Does it fit the industry?<br>9. <strong>Consistency</strong> — Can it work across all uses?<br>10. <strong>Protectability</strong> — Can it be trademarked?',
      '<strong>Critical insight:</strong> Your job is NOT to pick the name you personally like most. It\'s to pick the name that scores highest on the criteria that matter for THIS brand.',
      '<strong>Real examples:</strong> Häagen-Dazs fails accessibility but wins magnetism. Wii was wildly polarizing but won distinctiveness and conciseness. Sold 102 million units.',
    ],
    quiz: [
      { question: 'Your MAIN job as a voter is to...', options: ['Vote for the name you personally like most', 'Vote for the name that sounds coolest', 'Evaluate names against objective criteria for this brand', 'Pick the safest option'], correct: 2 },
      { question: 'Häagen-Dazs is a great example because it...', options: ['Scores perfectly on all 10 criteria', 'Shows that a name can succeed despite failing some criteria', 'Demonstrates why accessibility is the most important criterion', 'Proves abstract names always win'], correct: 1 },
      { question: 'What does "euphony" mean in brand naming?', options: ['The ability to trademark the name', 'How short the name is', 'How pleasant it sounds when spoken aloud', 'How well it fits on a logo'], correct: 2 },
    ],
  },
];

const B2_ARTICLES = [
  {
    id: 'b2-a1', title: 'Products vs. Companies: Why the Rules Are Different', readTime: '3 min', readPoints: 25,
    body: [
      'Naming a product is fundamentally different from naming a company. The product name lives inside a brand architecture — it has a parent company framing it.',
      '<strong>Branded House:</strong> The company name is primary. Products are sub-brands. Google Search, Google Maps, Google Drive. The Google brand does the heavy lifting. Products just need descriptive clarity.',
      '<strong>House of Brands:</strong> Each product stands alone. P&G\'s portfolio: Tide, Pampers, Gillette, Febreze. No visible parent company. Each name must carry its own weight.',
      '<strong>Hybrid:</strong> Mix of both. Apple uses ApplePay, AppleTV (branded house) but also Beats (standalone). Microsoft uses Azure, Teams, but acquired GitHub and kept its name.',
      '<strong>Your submission strategy:</strong> First, understand which architecture this company uses. Then name accordingly. A branded-house product name can afford to be functional. A standalone product needs the full naming firepower.',
    ],
    quiz: [
      { question: 'In a "Branded House" architecture, product names need to...', options: ['Be completely standalone with their own identity', 'Carry the full brand weight independently', 'Primarily provide descriptive clarity under the parent brand', 'Sound as abstract as possible'], correct: 2 },
      { question: 'Tide, Pampers, and Gillette are all examples of...', options: ['Branded House architecture', 'House of Brands architecture', 'Hybrid architecture', 'Co-branding'], correct: 1 },
      { question: 'Why does the brand architecture matter for naming?', options: ['It determines the legal requirements', 'It dictates how much work the product name needs to do alone', 'It affects trademark filing', 'It doesn\'t matter for naming'], correct: 1 },
    ],
  },
  {
    id: 'b2-a2', title: 'Scalability: Will This Name Still Work When the Product Changes?', readTime: '3 min', readPoints: 25,
    body: [
      'Product names often outlast their original scope. The name you pick today needs to survive pivots, expansions, and acquisitions.',
      '<strong>The specificity trap:</strong> "QuickDelivery" works when you\'re a local courier. It doesn\'t work when you pivot to same-day grocery, then pharmacy, then nationwide logistics. The name that perfectly describes your product today can cage you tomorrow.',
      '<strong>Instagram\'s lesson:</strong> Originally named "Burbn" (a location check-in app). When they pivoted to photo sharing, they needed a new name. "Instagram" = Instant + Telegram. It was built for sharing from the start, not a pivot afterthought.',
      '<strong>The horizon test:</strong> Ask yourself — "If this product doubles in scope, does the name still work?" If not, you\'re naming the version 1.0, not the product.',
      '<strong>For your submission:</strong> Avoid hyper-literal names. Leave room to grow. Suggestive names (hint at benefit without describing the feature) age far better than descriptive names.',
    ],
    quiz: [
      { question: 'The "specificity trap" in product naming means...', options: ['The name is too short', 'A highly descriptive name can cage a product as it evolves', 'The name has trademark issues', 'The product is too specific to name'], correct: 1 },
      { question: 'Instagram was originally named...', options: ['PhotoShare', 'Burbn', 'Pixie', 'Snappr'], correct: 1 },
      { question: 'The "horizon test" asks...', options: ['Is the name short enough?', 'Can the name be trademarked?', 'If the product doubles in scope, does the name still work?', 'Does the name sound good internationally?'], correct: 2 },
    ],
  },
  {
    id: 'b2-a3', title: "Naming Criteria for Product Names", readTime: '3 min', readPoints: 25,
    body: [
      'Product names are evaluated on a slightly different rubric than company names. Here\'s what matters most:',
      '<strong>1. Distinctiveness within the portfolio:</strong> Does it stand out from the company\'s other products? If a company has "Pro," "Plus," and "Max" — those names have lost all meaning.',
      '<strong>2. Memorability over SEO:</strong> Counterintuitive, but product names that are memorable beat product names that are keyword-heavy. "Notion" ranks better long-term than "ProjectManagementTool."',
      '<strong>3. Emotional resonance:</strong> Great product names evoke a feeling. Slack feels relaxed. Stripe feels clean and efficient. Zoom feels fast. What feeling should your product name evoke?',
      '<strong>4. System coherence:</strong> If this is product #3 in a suite, does it rhyme with the naming system? Breaking a naming pattern is jarring (Microsoft Office, Microsoft Teams, Microsoft... Viva? The pattern breaks).',
      '<strong>Your submission:</strong> Think about how the name will appear next to its siblings in the product family.',
    ],
    quiz: [
      { question: '"Pro," "Plus," and "Max" as product names are problematic because...', options: ['They\'re too hard to trademark', 'They\'re generic and have lost differentiation meaning', 'They\'re too long', 'They don\'t work internationally'], correct: 1 },
      { question: 'Why does "memorability over SEO" matter for product names?', options: ['Search doesn\'t apply to products', 'Memorable names build brand equity that outlasts any SEO advantage', 'Keyword names are usually taken', 'SEO doesn\'t help product discovery'], correct: 1 },
      { question: 'The name "Slack" evokes a feeling of...', options: ['Speed and efficiency', 'Power and control', 'Relaxation and ease', 'Innovation'], correct: 2 },
    ],
  },
];

const B3_ARTICLES = [
  {
    id: 'b3-a1', title: 'Why Internal Project Names Matter More Than You Think', readTime: '3 min', readPoints: 25,
    body: [
      'Generic names kill momentum. "Project Phoenix" has been done to death. "Project Alpha" signals nothing. A distinctive internal name is a leadership tool — it drives adoption, builds shared ownership, and creates morale.',
      '<strong>The rallying effect:</strong> NASA\'s Apollo program wasn\'t called "Moon Mission 1." It was named after the Greek god of the sun — a name that conveyed ambition, light, and reaching. People NAMED who they were when they said "I work on Apollo."',
      '<strong>Google\'s naming culture:</strong> Project Loon (internet balloons), Project Sunroof (solar energy), Project Wing (drone delivery). Each name creates a vivid mental picture. You know the project\'s spirit before anyone explains it.',
      '<strong>Two camps:</strong> 1) Functional names ("Project Unify," "Initiative 2026") — tell you the goal. 2) Evocative names ("Project Everest," "Operation Clarity") — create a feeling. Evocative names win on adoption. Teams rally around them.',
    ],
    quiz: [
      { question: 'NASA named its moon program "Apollo" (not "Moon Mission 1") because...', options: ['Legal required it', 'It conveyed ambition and meaning — people identified with it', 'It was shorter', 'They randomly chose Greek myths'], correct: 1 },
      { question: 'Google\'s internal project names (Loon, Sunroof, Wing) work because they...', options: ['Are short', 'Create vivid mental pictures of the project\'s spirit', 'Are easy to trademark', 'Match the product\'s technical function exactly'], correct: 1 },
      { question: 'Evocative project names beat functional names because...', options: ['They\'re easier to trademark', 'Teams rally around them — adoption is higher', 'They\'re shorter', 'Functional names cause legal issues'], correct: 1 },
    ],
  },
  {
    id: 'b3-a2', title: 'Functional vs. Inspirational: Which Type of Project Name Works?', readTime: '3 min', readPoints: 25,
    body: [
      'Not every project needs a mythological name. Context matters. Here\'s how to decide.',
      '<strong>Short-term, tactical projects:</strong> Use functional names. "Migration 2026," "Q4 Launch," "Brand Refresh." These signal urgency and clarity. Teams know exactly what they\'re working on.',
      '<strong>Long-term, strategic initiatives:</strong> Use inspirational names. "Project Aurora," "Initiative Clarity," "Program Elevate." These need to survive leadership changes, budget cycles, and team turnover. A great name creates continuity.',
      '<strong>Cross-functional projects:</strong> ALWAYS use inspirational names. When a project spans departments, the name becomes the shared identity. "Finance and HR\'s Q3 Integration" is forgettable. "Project Bridge" is a rallying point.',
      '<strong>The test:</strong> Will someone mention this project by name at a company all-hands 2 years from now? If yes, go inspirational. If no, functional is fine.',
    ],
    quiz: [
      { question: 'Cross-functional projects should use inspirational names because...', options: ['It\'s a legal requirement', 'The name becomes the shared identity across departments', 'Functional names are trademarked', 'It looks better in presentations'], correct: 1 },
      { question: '"Migration 2026" is an example of a...', options: ['Inspirational name', 'Functional name', 'Abstract name', 'Compound name'], correct: 1 },
      { question: 'The "2-year all-hands test" determines...', options: ['If the name is trademark-safe', 'Whether to use an inspirational vs functional name based on project longevity', 'If the name is too long', 'The project\'s success probability'], correct: 1 },
    ],
  },
  {
    id: 'b3-a3', title: 'Criteria for Great Internal Project Names', readTime: '3 min', readPoints: 25,
    body: [
      'Internal names are judged by a different standard than external brand names. Here are the key criteria:',
      '<strong>1. Rallying potential:</strong> Can people shout it at a kickoff meeting? Does it have energy?',
      '<strong>2. Clarity of scope:</strong> Does the name hint at what the project is about — without needing a 3-sentence explanation?',
      '<strong>3. Neutrality:</strong> Internal names should work across hierarchy levels. "Project Titan" sounds ambitious. "Project Caretaker" sounds supportive. Make sure the vibe fits the culture.',
      '<strong>4. Global sensitivity:</strong> If your company is multinational, avoid names that have negative meanings in other languages. "Nova" means "doesn\'t go" in Spanish (famously problematic for a car name). Internal projects can cause the same friction.',
      '<strong>5. Memorability:</strong> Simple. Concrete. 1-2 words. "Project Anchor" beats "The Digital Transformation Acceleration Initiative."',
    ],
    quiz: [
      { question: 'Internal project names should be...', options: ['As descriptive as possible', 'Simple and memorable — 1-2 words with rallying potential', 'Always mythological', 'Always functional'], correct: 1 },
      { question: 'Why does "global sensitivity" matter for project names?', options: ['Legal filing requires it', 'Names can have negative meanings in other languages', 'Global names rank better in search', 'It doesn\'t matter for internal projects'], correct: 1 },
      { question: '"Project Digital Transformation Acceleration Initiative" fails because...', options: ['It\'s not trademarked', 'It\'s not memorable — it\'s too long and functional', 'It\'s culturally insensitive', 'It uses too many verbs'], correct: 1 },
    ],
  },
];

const B4_ARTICLES = [
  {
    id: 'b4-a1', title: 'Why Companies Rebrand: The 5 Real Reasons', readTime: '3 min', readPoints: 25,
    body: [
      'Rebranding is one of the highest-stakes decisions a company makes. Done right, it unlocks new growth. Done wrong, it destroys decades of equity.',
      '<strong>The 5 real reasons companies rebrand:</strong><br>1. <strong>Scope expansion</strong> — The name no longer fits the business. Dunkin\' Donuts → Dunkin\' (they sell more than donuts). Google → Alphabet (holding company for multiple businesses).<br>2. <strong>Reputation crisis</strong> — The name carries baggage. Facebook → Meta (distance from controversy).<br>3. <strong>Competitive differentiation</strong> — They need to stand out. Weight Watchers → WW (broader wellness positioning).<br>4. <strong>Merger/acquisition</strong> — Two names become one. United-Continental merger → United.<br>5. <strong>Geographic expansion</strong> — The name doesn\'t translate. International names often change for new markets.',
      '<strong>What NOT to rebrand for:</strong> Boredom, a new CEO\'s ego, or because the logo looks dated. Those are design problems, not naming problems.',
    ],
    quiz: [
      { question: 'Dunkin\' Donuts renamed to Dunkin\' because...', options: ['Donuts became unpopular', 'They expanded beyond donuts and needed a broader name', 'They had trademark issues', 'A new CEO demanded it'], correct: 1 },
      { question: 'Facebook became Meta primarily because of...', options: ['VR/AR expansion strategy and reputation distance', 'Trademark issues with other Facebooks', 'Geographic expansion to new markets', 'A merger with Instagram'], correct: 0 },
      { question: 'What is NOT a good reason to rebrand?', options: ['Scope expansion beyond the current name', 'Reputation crisis tied to the name', 'A new CEO wanting a fresh start', 'Geographic expansion requiring translation'], correct: 2 },
    ],
  },
  {
    id: 'b4-a2', title: 'Evolution vs. Revolution: How Far Should a Rebrand Go?', readTime: '4 min', readPoints: 25,
    body: [
      'Every rebrand sits on a spectrum from subtle refinement to complete reinvention. Getting the calibration right is everything.',
      '<strong>Evolution (low disruption):</strong> Keep the core equity, modernize the expression. Mastercard: kept the overlapping circles (icon) and the name, dropped "MasterCard" capitalization and the word mark from payment terminals. Coca-Cola: virtually identical logo since 1887. The brand is the consistency.',
      '<strong>Revolution (high disruption):</strong> Start fresh, abandon old equity. This is rare and high-risk. Facebook → Meta, Andersen Consulting → Accenture, Philip Morris → Altria. Altria is a textbook revolution — they needed to distance from tobacco entirely.',
      '<strong>The equity audit test:</strong> Before deciding how far to go, ask: "What equity does the current name actually carry?" If the answer is "strong positive associations," go evolutionary. If the answer is "mostly negative or neutral associations," revolution makes sense.',
      '<strong>For your submissions:</strong> Read the brief carefully. Understand WHY they\'re rebranding. Name accordingly. If it\'s scope expansion, suggest names that nod to the heritage while opening new doors. If it\'s reputation crisis, suggest clean breaks.',
    ],
    quiz: [
      { question: 'Mastercard\'s rebrand is an example of...', options: ['Evolution — kept core equity, modernized expression', 'Revolution — complete reinvention', 'Merger-driven rebrand', 'Geographic expansion rebrand'], correct: 0 },
      { question: 'The "equity audit test" asks...', options: ['How much the rebrand will cost', 'What equity the current name actually carries — positive or negative?', 'How many employees know the current name', 'Whether the trademark can be transferred'], correct: 1 },
      { question: 'If a company is rebranding because of a reputation crisis, you should suggest...', options: ['Names that strongly reference the old brand', 'Clean break names with no heritage connection', 'Only descriptive names', 'Exactly the same name with new typography'], correct: 1 },
    ],
  },
  {
    id: 'b4-a3', title: 'Equity Preservation: Carrying the Heritage Forward', readTime: '3 min', readPoints: 25,
    body: [
      'Not all rebrands start from zero. Many companies want to evolve, not abandon. The art is preserving what\'s valuable while creating room to grow.',
      '<strong>What equity looks like:</strong> Equity can be visual (the Nike swoosh), sonic (Intel\'s 5-note chime), verbal (Apple\'s simplicity and contrarianism), or conceptual (Amazon\'s "everything store" positioning).',
      '<strong>Thread-carrying techniques:</strong><br>1. <strong>Phonetic similarity</strong> — Keep similar sounds. "Cingular" → "AT&T" (lost equity, bad). "KPMG" → "Klynveld Peat Marwick Goerdeler" (phonetic equity preserved in initials).<br>2. <strong>Meaning bridge</strong> — The new name evokes the old values. Weight Watchers → WW preserves the wellness mission even without "weight."<br>3. <strong>Visual anchor</strong> — Keep a visual element. The Shell logo has been recognizably the same since 1904.',
      '<strong>For your submissions:</strong> If the brief mentions "we want to preserve brand recognition," look for names that share phonetic or conceptual bridges with the current name.',
    ],
    quiz: [
      { question: 'Brand equity can be expressed through...', options: ['Only the company name', 'Visual, sonic, verbal, and conceptual elements', 'Only visual elements like logos', 'Only financial valuation'], correct: 1 },
      { question: 'Weight Watchers → WW is a good rebrand because...', options: ['WW is shorter and easier to say', 'It preserves the wellness mission while dropping the stigmatized word "weight"', 'WW has better trademark protection', 'It was driven by a merger'], correct: 1 },
      { question: 'A "meaning bridge" in rebranding means...', options: ['Building a physical connection between old and new offices', 'The new name evokes the same values as the old one', 'Using the same logo', 'Keeping the same employees'], correct: 1 },
    ],
  },
];

const SPORTS_ARTICLE = {
  id: 'sports1', title: '4 Things That Make a Great Sports Team Name', readTime: '3 min', readPoints: 20,
  body: [
    'Great sports names share 4 characteristics.',
    '<strong>1. Intimidating OR Identity-Building</strong> — Two camps work. Intimidating: Sharks, Predators, Vipers. Identity-Building: Saints, Patriots, Warriors.',
    '<strong>2. Local Connection</strong> — The best sports names root you in a place. Lakers = Land of 10,000 Lakes (Minnesota). Grizzlies = Vancouver\'s wilderness.',
    '<strong>3. Timelessness</strong> — Avoid trendy references. "Miami Heat" works forever. Ask: will this name still sound good in 20 years?',
    '<strong>4. Merchandisable</strong> — Will people wear this on a jersey? The "Let\'s go [NAME]!" test is real.',
  ],
  quiz: [
    { question: "What's the 'jersey test' for sports team names?", options: ['Is it the right length to fit on a jersey?', 'Will people be proud to wear it? Can you chant it?', 'Does it have good colors?', 'Is it approved by the league?'], correct: 1 },
    { question: 'Why should you avoid trendy references in a sports team name?', options: ["Because leagues don't allow them", 'Because trending references age poorly and names should be timeless', "Because they're harder to trademark", 'Trendy references are actually fine'], correct: 1 },
    { question: 'The Oklahoma City Thunder is a great example because...', options: ['It was chosen by the owner without any public input', 'It was chosen by public vote from 64,000 submissions, giving the community ownership', "It perfectly describes the city's weather", 'It is abstract with no meaning'], correct: 1 },
  ],
};

const BAND_ARTICLE = {
  id: 'band1', title: 'What Makes a Band Name Actually Work?', readTime: '3 min', readPoints: 20,
  body: [
    'Band names fall into 3 archetypes — and the best ones stick to one.',
    '<strong>1. The Absurdist</strong> — Arctic Monkeys, Tame Impala, Vampire Weekend. Memorable precisely because they\'re strange.',
    '<strong>2. The Evocative</strong> — Radiohead, Portishead, The National. Mood-first. These names feel like the music before you\'ve heard a note.',
    '<strong>3. The Personal</strong> — Dave Matthews Band, Bon Iver, Sufjan Stevens. Built around identity.',
    '<strong>Searchability matters:</strong> In the streaming era, a name that\'s searchable without 10,000 false positives is valuable.',
    '<strong>The story test:</strong> Fans will ask "How did you get your name?" Have an answer. Better yet, have a great one.',
  ],
  quiz: [
    { question: 'Which archetype does "Arctic Monkeys" fall into?', options: ['Evocative', 'Absurdist', 'Personal / Biographical', 'Descriptive'], correct: 1 },
    { question: 'Why does searchability matter for band names in the streaming era?', options: ["It doesn't matter", 'Names with too many false positives make it hard to find your music', 'Streaming platforms require unique names', 'Searchable names rank higher on Billboard'], correct: 1 },
    { question: 'The "story test" means...', options: ['Your name should describe your music genre', 'Your name should be short enough to tweet', "Your band name should have an interesting origin story", 'Your name should test well in market research'], correct: 2 },
  ],
};

const PODCAST_ARTICLE = {
  id: 'pod1', title: 'Naming Your Show: The Clarity vs Intrigue Spectrum', readTime: '3 min', readPoints: 20,
  body: [
    'Every podcast name sits on a spectrum between ultra-clear and utterly mysterious.',
    '<strong>Clarity-first:</strong> "How I Built This," "My First Million," "The Daily." You know exactly what you\'re getting. Maximum discoverability. Minimum personality.',
    '<strong>Intrigue-first:</strong> "Radiolab," "Serial," "99% Invisible." Memorable brand. Less obvious. Requires building an audience to explain itself.',
    '<strong>The sweet spot:</strong> Most successful podcasts balance both. "Hidden Brain" is intriguing but clearly about psychology.',
    '<strong>SEO matters:</strong> If your show is about true crime, having "crime" or "murder" in the name dramatically increases discovery.',
  ],
  quiz: [
    { question: '"How I Built This" is an example of a...', options: ['Intrigue-first name', 'Clarity-first name', 'Abstract name', 'Personality-brand name'], correct: 1 },
    { question: 'The "sweet spot" for podcast names is...', options: ['Maximum clarity at all times', 'Maximum intrigue at all times', 'A balance of clarity and memorability', 'The shortest possible name'], correct: 2 },
    { question: 'For a true crime podcast, having "crime" in the name helps with...', options: ['Trademark protection', 'SEO and discoverability on podcast platforms', 'Advertising rates', 'Listener retention'], correct: 1 },
  ],
};

const CIVIC_ARTICLE = {
  id: 'civic1', title: 'Naming for the Long Term: Civic & Community Organizations', readTime: '3 min', readPoints: 20,
  body: [
    'You\'re naming something that should outlast you by decades. The standards are different from commercial naming.',
    '<strong>Clarity over cleverness:</strong> Community organizations are discovered by people who need them. "Habitat for Humanity" tells you exactly what it is. "charity: water" tells you exactly what it does. Both are memorable AND clear.',
    '<strong>Aspiration matters:</strong> Great civic names carry a mission. They\'re not just names — they\'re rallying cries. "Doctors Without Borders" (Médecins Sans Frontières) communicates scale, courage, and scope in 3 words.',
    '<strong>Longevity test:</strong> Ask: will this name still feel right in 30 years? Avoid technology-specific terms (they date fast) and trendy language. Focus on human values: community, courage, growth, connection.',
    '<strong>The Google test:</strong> Will people find you when they search your mission? Civic orgs live and die by discoverability. Balance inspiration with findability.',
  ],
  quiz: [
    { question: '"Habitat for Humanity" is effective because...', options: ['It uses aspirational religious language', 'It\'s both clear about its mission AND memorable', 'It was founder\'s name', 'It has great SEO keywords'], correct: 1 },
    { question: 'For civic organizations, longevity testing means avoiding...', options: ['Long names', 'Technology-specific terms that will date the organization', 'Aspirational language', 'Geographic references'], correct: 1 },
    { question: '"Doctors Without Borders" communicates...', options: ['A pharmaceutical company\'s global reach', 'Scale, courage, and scope in 3 words', 'A government health program', 'A medical school'], correct: 1 },
  ],
};

const OTHER_TEAM_ARTICLE = {
  id: 'other-team1', title: 'The Psychology of Group Names', readTime: '3 min', readPoints: 20,
  body: [
    'Names shape group identity before a single shared experience happens. A great group name creates belonging — outsiders want in.',
    '<strong>Three archetypes for group names:</strong><br>1. <strong>Identity-first</strong> — Defined by who you ARE. "The Visionaries," "The Wolves." Creates pride.<br>2. <strong>Mission-first</strong> — Defined by what you DO. "The Builders," "The Connectors." Creates purpose.<br>3. <strong>Culture-first</strong> — An inside reference only members understand. Creates exclusivity and belonging.',
    '<strong>The in-group test:</strong> The best group names have meaning for members AND create curiosity for outsiders. If a stranger sees the name, do they want to know more?',
    '<strong>Names create behavior:</strong> Groups named "The Visionaries" in studies demonstrated more creative output than groups with generic identifiers. Your name becomes a self-fulfilling prophecy.',
    '<strong>For your submission:</strong> Think about what behavior you want to reinforce in this group. Then name toward that.',
  ],
  quiz: [
    { question: '"The Builders" is an example of which archetype?', options: ['Identity-first', 'Mission-first', 'Culture-first', 'Brand-first'], correct: 1 },
    { question: 'The in-group test says the best group names should...', options: ['Only make sense to members', 'Have meaning for members AND create curiosity for outsiders', 'Be as generic as possible', 'Reference the founding date'], correct: 1 },
    { question: 'Studies showed groups named "The Visionaries" demonstrated...', options: ['Lower performance due to pressure', 'More creative output — names shape group behavior', 'No difference from control groups', 'Higher conflict rates'], correct: 1 },
  ],
};

const GAMING_TIPS = [
  { emoji: '🎮', title: 'Test #1: The Clutch Call', text: 'Can you yell your team name when you clutch a 1v5? If it sounds weak, think harder. "FaZe Clan" → "LET\'S GO FAZE!" works.' },
  { emoji: '🔥', title: 'Two Camps That Win', text: 'Intimidating (FaZe Clan, Team Liquid, 100 Thieves) or Meme-worthy (Panda Global, Golden Guardians). Pick a lane — middleground names get forgotten.' },
  { emoji: '🌐', title: 'Searchability Matters', text: 'Your tag will appear in tournament brackets, streaming titles, and social handles. Can people find you? Is it unique enough to own?' },
];

const PERSONAL_TIPS_BY_SEGMENT = {
  'baby-name': [
    { emoji: '💛', title: 'Did You Know?', text: 'Names with 2-3 syllables are easiest for babies to learn to respond to. Mo-na. Eli-as. Lu-cy. Science backs the sweet spot.' },
    { emoji: '📊', title: 'Family Input Matters', text: '23% of parents say they wished they\'d gotten more input on their baby\'s name. That\'s why you\'re here — your voice genuinely matters.' },
    { emoji: '🌱', title: 'Grow-Up Test', text: 'The best baby names work at every life stage: on a birth announcement, a kindergarten cubby, a college application, and a professional bio. Think long-term.' },
  ],
  'pet-name': [
    { emoji: '🐾', title: 'The Shout Test', text: 'You\'ll say this name hundreds of times — often loudly, in public. "Luna!" "Max!" "Sir Biscuit!" Try shouting it. If it feels natural, it\'s a good name.' },
    { emoji: '🧠', title: 'Short Names Work Best', text: 'Pets respond better to 1-2 syllable names with sharp consonants. "Rex," "Pip," "Zara." They distinguish these sounds more easily than multi-syllable names.' },
    { emoji: '💛', title: 'Make It Yours', text: 'The best pet names have a story. "Pretzel" (found at a bakery). "Bandit" (escaped the shelter twice). What story will this pet\'s name tell?' },
  ],
  'home-property-fun': [
    { emoji: '🏡', title: 'Great Home Names Are Personal', text: 'The best house names reflect who lives there or the home\'s character. "The Weeping Willow House." "La Casita." "The Nook." Think about what makes this place yours.' },
    { emoji: '🌿', title: 'Lean Into History or Geography', text: 'Does the property have a history? Previous owners? A notable tree? A view? The best property names anchor to something real and specific.' },
    { emoji: '✉️', title: 'It Should Look Good on an Envelope', text: 'Property names appear on holiday cards, real estate listings, and mail. Test your suggestion: write it on an imaginary envelope. Does it feel right?' },
  ],
  default: [
    { emoji: '🎉', title: 'Have Fun With It', text: 'This is a low-stakes naming exercise. Creativity and personality beat safe and predictable. What name would make people smile?' },
    { emoji: '💡', title: 'Think Story-First', text: 'The best names come with a story attached. "How did you come up with that?" should have a great answer.' },
    { emoji: '✨', title: 'Surprise the Organizer', text: 'The name they pick might not be yours — but a surprising, unexpected option often sparks the creative thinking that leads to the winner.' },
  ],
};

function getPersonalTips(subSegment) {
  return PERSONAL_TIPS_BY_SEGMENT[subSegment] || PERSONAL_TIPS_BY_SEGMENT.default;
}

function getArticlesForContest(contest) {
  if (!contest) return [];
  const sub = contest.subSegment;
  if (contest.group === 'business') {
    if (sub === 'product-name') return B2_ARTICLES;
    if (sub === 'project-name') return B3_ARTICLES;
    if (sub === 'rebrand') return B4_ARTICLES;
    return B1_ARTICLES; // company-name, other-business, fallback
  }
  if (contest.group === 'team') {
    if (sub === 'sports-team') return [SPORTS_ARTICLE];
    if (sub === 'band-music') return [BAND_ARTICLE];
    if (sub === 'podcast-channel') return [PODCAST_ARTICLE];
    if (sub === 'civic-school-nonprofit') return [CIVIC_ARTICLE];
    if (sub === 'gaming-group') return []; // tip cards only
    return [OTHER_TEAM_ARTICLE];
  }
  return []; // personal — tip cards
}

function isPersonal(contest) { return contest?.group === 'personal'; }
function isGaming(contest) { return contest?.group === 'team' && contest?.subSegment === 'gaming-group'; }

/* ─── Brief Immersion Card ─── */
function BriefImmersionCard({ contest, tc, onPoints, qualityPct }) {
  const [expanded, setExpanded] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const handleRead = () => {
    setExpanded(true);
    if (!pointsAwarded) {
      setPointsAwarded(true);
      onPoints(5);
    }
  };

  return (
    <div style={{ marginBottom: 28, padding: 20, background: '#1a1a1a', border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 32, height: 32, background: `rgba(${tc.rgb},0.1)`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <BookOpen size={16} color={tc.color} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Brief Immersion</div>
          <div style={{ fontSize: 11, color: '#7a7a7a' }}>Understand the contest context before you submit</div>
        </div>
        {!pointsAwarded && (
          <div style={{ marginLeft: 'auto', fontSize: 11, color: tc.color, fontWeight: 600 }}>+{qualityPct}% quality</div>
        )}
        {pointsAwarded && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10B981' }}>
            <Check size={12} weight="bold" /> +{qualityPct}% quality added
          </div>
        )}
      </div>
      {!expanded ? (
        <button onClick={handleRead} style={{ height: 36, padding: '0 16px', border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 8, background: 'transparent', color: tc.color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Read the Brief (+{qualityPct}% quality) →
        </button>
      ) : (
        <div style={{ fontSize: 13, color: '#a1a1a1', lineHeight: 1.75 }}>
          <div style={{ marginBottom: 10 }}><strong style={{ color: '#fff' }}>Contest:</strong> {contest?.title}</div>
          <div style={{ marginBottom: 10 }}><strong style={{ color: '#fff' }}>Organized by:</strong> {contest?.organizer}</div>
          <div style={{ marginBottom: 10 }}><strong style={{ color: '#fff' }}>Category:</strong> {tc.label}</div>
          <div style={{ marginBottom: 10 }}><strong style={{ color: '#fff' }}>Deadline:</strong> {contest?.daysLeft || 5} days left to submit</div>
          <div style={{ padding: '12px 14px', background: '#141414', borderRadius: 8, fontSize: 13, color: '#a1a1a1', fontStyle: 'italic', marginTop: 12 }}>
            "We're looking for a name that's distinctive, memorable, and positions us for growth. Read the articles below to understand what makes a great name in this context."
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Scratch Pad ─── */
function ScratchPad({ tc, onPoints, qualityPct }) {
  const [notes, setNotes] = useState('');
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const handleNotes = (val) => {
    setNotes(val);
    if (!pointsAwarded && val.length > 30) {
      setPointsAwarded(true);
      onPoints(5);
    }
  };

  const prompts = [
    'What imagery or feelings should the name evoke?',
    'List 5 words you associate with this brand/team/concept:',
    'What names are you already considering? (brainstorm freely)',
    'What should the name NOT sound like?',
  ];

  return (
    <div style={{ marginBottom: 28, padding: 20, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <NotePencil size={16} color="#a1a1a1" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Exploration Scratch Pad</div>
          <div style={{ fontSize: 11, color: '#7a7a7a' }}>Brainstorm freely — your notes are private</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: pointsAwarded ? '#10B981' : '#7a7a7a', fontWeight: 600 }}>
          {pointsAwarded ? `✓ +${qualityPct}% quality` : `+${qualityPct}% quality for using`}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
        {prompts.map((p, i) => (
          <div key={i} style={{ fontSize: 12, color: '#7a7a7a', padding: '6px 10px', background: '#141414', borderRadius: 6 }}>
            💭 {p}
          </div>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={e => handleNotes(e.target.value)}
        placeholder="Start brainstorming here..."
        style={{ width: '100%', boxSizing: 'border-box', minHeight: 100, background: '#141414', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 13, fontFamily: 'Inter, sans-serif', resize: 'vertical' }}
      />
    </div>
  );
}

/* ─── Self-Screening Checklist ─── */
function SelfScreeningChecklist({ tc, group }) {
  const businessItems = [
    { id: 'check1', label: 'Is it easy to spell on first hearing?', tip: 'If you have to say "no, with a K" — reconsider.' },
    { id: 'check2', label: 'Does it avoid acronyms that could embarrass? (ASS, WTF, etc.)', tip: 'Do a quick mental check of the initials.' },
    { id: 'check3', label: 'Is it distinctly different from the competitors listed in the brief?', tip: 'Names that blend in won\'t make the shortlist.' },
    { id: 'check4', label: 'Does it avoid literal descriptions of the category?', tip: '"Best Insurance" can\'t be trademarked. Abstract or suggestive is better.' },
    { id: 'check5', label: 'Would you be comfortable saying it in a board meeting?', tip: 'The client test: would a Fortune 500 CEO put it on their business card?' },
  ];
  const teamItems = [
    { id: 'check1', label: 'Can it be chanted or cheered easily?', tip: 'Short names with strong consonants chant best.' },
    { id: 'check2', label: 'Would members be proud to wear it on a jersey or hoodie?', tip: 'The merchandise test is real.' },
    { id: 'check3', label: 'Does it avoid clichés? (Wolves, Eagles, Warriors are overused)', tip: 'Originality gets noticed.' },
  ];
  const personalItems = [
    { id: 'check1', label: 'Is it easy to say and spell?', tip: 'People will use this name constantly.' },
    { id: 'check2', label: 'Does it feel personal and meaningful?', tip: 'The best submissions have a reason behind them.' },
  ];
  const items = group === 'business' ? businessItems : group === 'team' ? teamItems : personalItems;

  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  const allChecked = items.every(item => checked[item.id]);

  return (
    <div style={{ marginBottom: 28, padding: 20, background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.04)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={16} color="#a1a1a1" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Self-Screening Checklist</div>
          <div style={{ fontSize: 11, color: '#7a7a7a' }}>Run your names through this before submitting</div>
        </div>
      </div>
      {items.map(item => (
        <div key={item.id} style={{ marginBottom: 10 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <div
              onClick={() => toggle(item.id)}
              style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                background: checked[item.id] ? tc.color : 'transparent',
                border: `1.5px solid ${checked[item.id] ? tc.color : 'rgba(255,255,255,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {checked[item.id] && <Check size={11} weight="bold" color={tc.color === '#eaef09' ? '#000' : '#fff'} />}
            </div>
            <div>
              <div style={{ fontSize: 13, color: checked[item.id] ? '#fff' : '#a1a1a1', fontWeight: checked[item.id] ? 600 : 400, transition: 'all 0.15s' }}>{item.label}</div>
              <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{item.tip}</div>
            </div>
          </label>
        </div>
      ))}
      {allChecked && (
        <div style={{ marginTop: 12, padding: '10px 14px', background: `rgba(${tc.rgb},0.08)`, border: `1px solid rgba(${tc.rgb},0.3)`, borderRadius: 8, fontSize: 13, color: tc.color, fontWeight: 600 }}>
          ✓ All checks passed — ready to submit!
        </div>
      )}
    </div>
  );
}

/* ─── Context Stats (post-submission) ─── */
function ContextStats({ submittedNames, totalPoints, maxPoints, tc, group, participantQuality }) {
  const totalSubs = 47 + submittedNames.length;
  const totalParticipants = 18;
  const yourRank = Math.floor(Math.random() * 15) + 1;
  const avgPoints = group === 'business' ? 112 : group === 'team' ? 28 : 10;
  const avgQuality = Math.round(avgPoints / maxPoints * 25);
  const qualityBadges = { notable: 3, quality: 12, standard: totalSubs - 15 };
  const timeline = [
    { label: 'Day 1', subs: 8 }, { label: 'Day 2', subs: 11 }, { label: 'Day 3', subs: 19 },
    { label: 'Day 4', subs: 31 }, { label: 'Day 5 (now)', subs: totalSubs },
  ];
  const maxSubs = Math.max(...timeline.map(t => t.subs));

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <ChartBar size={18} color={tc.color} /> Contest Stats
      </div>

      {/* Key stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Submissions', value: totalSubs, sub: 'so far' },
          { label: 'Participants', value: totalParticipants, sub: 'joined' },
          { label: 'Your Rank', value: `~#${yourRank}`, sub: 'quality estimate' },
          { label: 'Quality Score', value: `${participantQuality}/50`, sub: 'your contribution' },
        ].map((stat, i) => (
          <div key={i} style={{ padding: '16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 800, color: i < 2 ? '#fff' : tc.color, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#a1a1a1' }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#555' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Avg quality */}
      <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Average participant quality score</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((avgQuality / 50) * 100)}%`, background: '#555', borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 13, color: '#a1a1a1', minWidth: 40 }}>{avgQuality}/50</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
          <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((participantQuality / 50) * 100)}%`, background: tc.color, borderRadius: 3 }} />
          </div>
          <span style={{ fontSize: 13, color: tc.color, minWidth: 40 }}>You: {participantQuality}/50</span>
        </div>
      </div>

      {/* Quality breakdown */}
      <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10, marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Submission Quality Breakdown</div>
        {[
          { label: '⭐ Notable', count: qualityBadges.notable, color: '#eaef09', desc: 'High points + originality score' },
          { label: '✓ Quality', count: qualityBadges.quality, color: '#10B981', desc: 'Meets brief + naming criteria' },
          { label: '○ Standard', count: qualityBadges.standard, color: '#555', desc: 'Entered, no quality signals' },
        ].map((badge, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: badge.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: badge.color, fontWeight: 600, minWidth: 80 }}>{badge.label}</span>
            <span style={{ fontSize: 13, color: '#fff', minWidth: 24 }}>{badge.count}</span>
            <span style={{ fontSize: 12, color: '#555' }}>{badge.desc}</span>
          </div>
        ))}
      </div>

      {/* Submission timeline */}
      <div style={{ padding: '14px 16px', background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 12 }}>Submission Timeline</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 60 }}>
          {timeline.map((t, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', background: i === timeline.length - 1 ? tc.color : 'rgba(255,255,255,0.15)', borderRadius: '3px 3px 0 0', height: `${Math.round((t.subs / maxSubs) * 48)}px`, minHeight: 4 }} />
              <div style={{ fontSize: 10, color: '#555', textAlign: 'center' }}>{t.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 8 }}>
          Tip: Most submissions come in the last 48 hours. You're ahead of the curve.
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function ContestLive() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const _contest = mockContests.find(c => c.id === contestId) || mockContests[0];
  const meta = getJourneyMeta(contestId);
  const tc = meta;
  // Override contest group and title with journey context so articles/content match
  const contest = { ..._contest, group: meta.group, title: meta.contestTitle };

  const [tab, setTab] = useState('education');
  const [completedArticles, setCompletedArticles] = useState({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [names, setNames] = useState([{ name: '', description: '' }]);
  const [submitted, setSubmitted] = useState(false);
  const [submittedNames, setSubmittedNames] = useState([]);
  const [tipsCollected, setTipsCollected] = useState({});

  const articles = getArticlesForContest(contest);
  const isPersonalContest = isPersonal(contest);
  const isGamingContest = isGaming(contest);
  const limit = isGamingContest ? 3 : 5;
  const maxPoints = articles.reduce((sum, a) => sum + a.readPoints + 30, 0) + 15 || (isPersonalContest || isGamingContest ? 15 : 165);
  const educationDone = isPersonalContest || isGamingContest || Object.keys(completedArticles).length >= articles.length;

  // Quality scores
  const creatorQuality = loadCreatorQuality(meta.group);
  const participantQuality = computeParticipantScore(
    Object.keys(completedArticles).length,
    articles.length || 1,
    totalPoints,
    maxPoints,
  );
  useEffect(() => {
    saveParticipantQuality(meta.group, participantQuality);
  }, [participantQuality, meta.group]);
  const daysLeft = contest?.daysLeft || 5;
  const smallQualityPct = Math.max(1, Math.round(5 / maxPoints * 25));

  const addPoints = (pts) => setTotalPoints(p => p + pts);

  const handleArticleComplete = (articleId, pts, type) => {
    addPoints(pts);
    if (type === 'quiz') setCompletedArticles(prev => ({ ...prev, [articleId]: true }));
  };

  const handleTipCollect = (key) => {
    if (!tipsCollected[key]) {
      setTipsCollected(prev => ({ ...prev, [key]: true }));
      addPoints(5);
    }
  };

  const handleAddName = () => { if (names.length < limit) setNames([...names, { name: '', description: '' }]); };
  const handleNameChange = (i, val) => { const u = [...names]; u[i] = { ...u[i], name: val }; setNames(u); };
  const handleDescChange = (i, val) => { const u = [...names]; u[i] = { ...u[i], description: val }; setNames(u); };
  const handleRemoveName = (i) => { if (names.length > 1) setNames(names.filter((_, idx) => idx !== i)); };

  const handleSubmit = () => {
    const valid = names.filter(n => n.name.trim());
    if (valid.length === 0) return;
    setSubmittedNames(valid);
    setSubmitted(true);
  };

  const personalTips = getPersonalTips(contest?.subSegment);
  const tipCards = isGamingContest ? GAMING_TIPS : (isPersonalContest ? personalTips : []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <div style={{ height: 52, background: '#141414', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12, flexShrink: 0 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          <div style={{ width: 24, height: 24, background: '#eaef09', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={12} weight="bold" color="#000" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>NamingContest</span>
        </Link>
        <span style={{ color: '#444', fontSize: 13 }}>·</span>
        <span style={{ fontSize: 13, color: '#a1a1a1' }}>{contest?.title}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={13} color="#7a7a7a" />
          <span style={{ fontSize: 12, color: '#7a7a7a' }}>{daysLeft} days left</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 240, background: '#0f0f0f', borderRight: '0.5px solid rgba(255,255,255,0.06)', padding: 20, flexShrink: 0, overflowY: 'auto' }}>
          {/* Contest card */}
          <div style={{ padding: '14px', background: '#1a1a1a', border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{tc.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{contest?.title}</div>
            <div style={{ fontSize: 12, color: '#7a7a7a' }}>by {contest?.organizer}</div>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#7a7a7a', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Your Progress</div>
            {[
              { label: 'Education', done: educationDone },
              { label: 'Names submitted', done: submitted },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: item.done ? tc.color : '#222', border: item.done ? 'none' : '1px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.done && <Check size={10} weight="bold" color={tc.color === '#eaef09' ? '#000' : '#fff'} />}
                </div>
                <span style={{ fontSize: 12, color: item.done ? '#fff' : '#7a7a7a' }}>{item.label}</span>
              </div>
            ))}
          </div>

          {/* ── Contest Quality Bar ── */}
          <div style={{ marginBottom: 20, padding: '14px', background: '#111', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: tc.color, marginBottom: 8 }}>
              Contest Quality
            </div>

            {/* Bar track */}
            <div style={{ position: 'relative', height: 7, borderRadius: 3, background: '#1e1e1e', marginBottom: 6 }}>
              {/* Creator fill (left half) */}
              <div style={{
                position: 'absolute', left: 0, top: 0, height: '100%',
                width: `${creatorQuality}%`,
                background: tc.color,
                borderRadius: 3, opacity: 0.7,
              }} />
              {/* Participant fill (right half, starts at 50%) */}
              <div style={{
                position: 'absolute',
                left: `${50}%`,
                top: 0, height: '100%',
                width: `${participantQuality}%`,
                background: tc.color,
                borderRadius: 3,
                transition: 'width 0.4s ease',
              }} />
              {/* Midpoint divider */}
              <div style={{
                position: 'absolute', left: '50%', top: -2, bottom: -2,
                width: 1.5, background: 'rgba(255,255,255,0.2)',
              }} />
            </div>

            {/* Scores */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
              <span style={{ color: '#555' }}>Creator: <span style={{ color: tc.color, fontWeight: 700 }}>{creatorQuality}/50</span></span>
              <span style={{ color: '#555' }}>You: <span style={{ color: tc.color, fontWeight: 700 }}>{participantQuality}/50</span></span>
            </div>
            <div style={{ fontSize: 10, color: '#383838', lineHeight: 1.5 }}>
              Creator did {creatorQuality}/50 of the work. Earn points to fill your half.
            </div>
          </div>

          {/* Nav */}
          {[
            { id: 'education', label: 'Learn & Explore', icon: <BookOpen size={14} /> },
            { id: 'submit', label: 'Submit Names', icon: <PencilSimple size={14} /> },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ width: '100%', height: 36, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', borderRadius: 8, border: 'none', background: tab === item.id ? `rgba(${tc.rgb},0.1)` : 'transparent', color: tab === item.id ? tc.color : '#7a7a7a', fontSize: 13, cursor: 'pointer', marginBottom: 4, textAlign: 'left' }}>
              {item.icon} {item.label}
            </button>
          ))}

        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px', maxWidth: 820 }}>

          {/* EDUCATION TAB */}
          {tab === 'education' && (
            <div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, color: '#fff', marginBottom: 6 }}>
                {(isPersonalContest || isGamingContest) ? 'Fun Tips to Get You in the Spirit' : 'Learn to Name Like a Pro'}
              </h1>
              <p style={{ color: '#a1a1a1', fontSize: 13, marginBottom: 28 }}>
                {(isPersonalContest || isGamingContest)
                  ? 'No articles needed — just read these tips and jump in.'
                  : `Complete all ${articles.length} articles to boost your quality score. Then submit your names.`}
              </p>

              {/* Brief Immersion Card */}
              <BriefImmersionCard contest={contest} tc={tc} onPoints={addPoints} qualityPct={smallQualityPct} />

              {/* Scratch Pad */}
              <ScratchPad tc={tc} onPoints={addPoints} qualityPct={smallQualityPct} />

              {/* Tip Cards (personal / gaming) */}
              {(isPersonalContest || isGamingContest) && (
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 16 }}>
                    {isGamingContest ? '🎮 Gaming Name Tips' : '💛 Fun Facts'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
                    {tipCards.map((tip, i) => (
                      <div
                        key={i}
                        onClick={() => handleTipCollect(`tip-${i}`)}
                        style={{
                          padding: '20px', background: '#1a1a1a',
                          border: `0.5px solid ${tipsCollected[`tip-${i}`] ? `rgba(${tc.rgb},0.3)` : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 24, marginBottom: 10 }}>{tip.emoji}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{tip.title}</div>
                            <div style={{ fontSize: 14, color: '#a1a1a1', lineHeight: 1.65 }}>{tip.text}</div>
                          </div>
                          <div style={{ fontSize: 11, color: tipsCollected[`tip-${i}`] ? '#10B981' : '#555', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                            {tipsCollected[`tip-${i}`] ? `✓ +${smallQualityPct}%` : `+${smallQualityPct}% quality`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setTab('submit')} style={{ height: 44, padding: '0 24px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Submit Names <ArrowRight size={16} />
                  </button>
                </div>
              )}

              {/* Articles (business / team) */}
              {!isPersonalContest && !isGamingContest && (
                <div>
                  {articles.map((article, i) => (
                    <div key={article.id}>
                      {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: completedArticles[article.id] ? tc.color : '#222', border: completedArticles[article.id] ? 'none' : `1px solid rgba(${tc.rgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: completedArticles[article.id] ? (tc.color === '#eaef09' ? '#000' : '#fff') : tc.color }}>
                          {completedArticles[article.id] ? <Check size={12} weight="bold" color={tc.color === '#eaef09' ? '#000' : '#fff'} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 12, color: '#7a7a7a' }}>Article {i + 1} of {articles.length}</span>
                      </div>
                      <Article article={article} tc={tc} quizPoints={30} onComplete={(pts, type) => handleArticleComplete(article.id, pts, type)} articleN={articles.length} totalMaxPoints={maxPoints} />
                    </div>
                  ))}
                  {educationDone && (
                    <div style={{ marginTop: 20 }}>
                      <button onClick={() => setTab('submit')} style={{ height: 44, padding: '0 24px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.1)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        Education complete! Submit your names <ArrowRight size={16} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SUBMIT TAB */}
          {tab === 'submit' && (
            <div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 26, color: '#fff', marginBottom: 6 }}>Submit Your Names</h1>
              <div style={{ padding: '10px 14px', background: `rgba(${tc.rgb},0.06)`, border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 8, fontSize: 13, color: tc.color, marginBottom: 24 }}>
                You can submit up to {limit} names · {participantQuality}/50 quality score earned
              </div>

              {/* Self-screening checklist */}
              <SelfScreeningChecklist tc={tc} group={contest?.group} />

              {submitted ? (
                <div>
                  <div style={{ padding: '20px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <CheckCircle size={22} color="#10B981" weight="fill" />
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#fff' }}>Names submitted successfully!</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#a1a1a1' }}>You submitted {submittedNames.length} name{submittedNames.length !== 1 ? 's' : ''}. You can add more or remove until the deadline.</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                    {submittedNames.map((entry, i) => (
                      <div key={i} style={{ padding: '12px 16px', background: '#1a1a1a', border: `0.5px solid rgba(${tc.rgb},0.2)`, borderRadius: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Check size={16} color="#10B981" weight="bold" />
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#fff', flex: 1 }}>{entry.name || entry}</span>
                          <button onClick={() => {
                            const updated = submittedNames.filter((_, idx) => idx !== i);
                            setSubmittedNames(updated);
                            if (updated.length === 0) setSubmitted(false);
                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a7a', flexShrink: 0 }}>
                            <Trash size={14} />
                          </button>
                        </div>
                        {(entry.description || typeof entry === 'object') && entry.description && (
                          <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 4, paddingLeft: 26, lineHeight: 1.5 }}>{entry.description}</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {submittedNames.length < limit && (
                    <button onClick={() => { setSubmitted(false); setNames(['']); }} style={{ height: 36, padding: '0 16px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, background: 'transparent', color: '#fff', fontSize: 13, cursor: 'pointer', marginBottom: 8 }}>
                      + Add more names
                    </button>
                  )}

                  {/* Context stats */}
                  <ContextStats submittedNames={submittedNames} totalPoints={totalPoints} maxPoints={maxPoints} tc={tc} group={contest?.group} participantQuality={participantQuality} />

                  {meta.transitionMode === 'manual' ? (
                    <div style={{ marginTop: 24, padding: '24px 20px', background: '#111', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 12, textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                        Waiting for the creator to open voting
                      </div>
                      <div style={{ fontSize: 13, color: '#7a7a7a', lineHeight: 1.6, marginBottom: 16 }}>
                        The contest organizer will review all submissions and hand-pick a shortlist before opening voting. You'll receive an email as soon as voting opens.
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: `${tc.color}15`, border: `0.5px solid ${tc.color}35`, fontSize: 12, fontWeight: 600, color: tc.color }}>
                        <Clock size={12} /> Your submission is in — sit tight
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                      <button onClick={() => navigate(`/vote/${contest?.id || 'demo-1'}`)} style={{ flex: 1, height: 44, border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                        See Voting Interface →
                      </button>
                      <button onClick={() => navigate('/dashboard')} style={{ height: 44, padding: '0 20px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, background: 'transparent', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
                        Dashboard
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                    {names.map((entry, i) => (
                      <div key={i} style={{ background: '#1a1a1a', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', gap: 0 }}>
                          <input value={entry.name} onChange={e => handleNameChange(i, e.target.value)} placeholder="Enter a name..." style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.08)', height: 44, padding: '0 14px', color: '#fff', fontSize: 16, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                          {names.length > 1 && (
                            <button onClick={() => handleRemoveName(i)} style={{ height: 44, width: 44, border: 'none', borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#7a7a7a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Trash size={14} />
                            </button>
                          )}
                        </div>
                        <input value={entry.description} onChange={e => handleDescChange(i, e.target.value)} placeholder="Why this name? Short rationale (optional)" style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: 'none', height: 34, padding: '0 14px', color: '#7a7a7a', fontSize: 12, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
                      </div>
                    ))}
                  </div>

                  {names.length < limit && (
                    <button onClick={handleAddName} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 14px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, background: 'transparent', color: '#7a7a7a', fontSize: 13, cursor: 'pointer', marginBottom: 20 }}>
                      <Plus size={14} /> Add another name
                    </button>
                  )}

                  <button onClick={handleSubmit} disabled={!names.some(n => n.name.trim())} style={{ height: 48, padding: '0 28px', border: `1.5px solid ${tc.color}`, borderRadius: 10, background: `rgba(${tc.rgb},0.12)`, color: tc.color, fontSize: 15, fontWeight: 700, cursor: names.some(n => n.name.trim()) ? 'pointer' : 'not-allowed', opacity: names.some(n => n.name.trim()) ? 1 : 0.5 }}>
                    Submit Names
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
