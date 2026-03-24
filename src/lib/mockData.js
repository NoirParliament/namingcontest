// ═══════════════════════════════════════════════════════════
// NamingContest.com — Mock Data
// All simulated data — no real backend
// ═══════════════════════════════════════════════════════════

export const MOCK_USER = {
  id: 'user_1',
  firstName: 'Sarah',
  lastName: 'Chen',
  email: 'sarah@example.com',
  initials: 'SC',
  createdAt: '2025-09-15',
  tier: 'business',
  totalContests: 12,
  totalParticipantsReached: 247,
  avgParticipationRate: 74,
};

export const PLATFORM_STATS = {
  totalContests: 12847,
  totalParticipants: 47392,
  successRate: 89,
  avgRating: 4.8,
};

// ─── Sample Names for Voting ───
export const SAMPLE_NAMES = [
  { id: 'n1', text: 'Stratus', type: 'abstract', submitter: 'Alex T.' },
  { id: 'n2', text: 'LaunchPath', type: 'suggestive', submitter: 'Maria S.' },
  { id: 'n3', text: 'Forgepoint', type: 'compound', submitter: 'James K.' },
  { id: 'n4', text: 'Helix', type: 'real-word', submitter: 'Chen L.' },
  { id: 'n5', text: 'Kindling', type: 'metaphorical', submitter: 'Priya R.' },
  { id: 'n6', text: 'Vantage', type: 'suggestive', submitter: 'Tom B.' },
  { id: 'n7', text: 'Apex', type: 'real-word', submitter: 'Dana M.' },
  { id: 'n8', text: 'Nexum', type: 'coined', submitter: 'Sam W.' },
];

// ─── Sample Submissions ───
export const SAMPLE_SUBMISSIONS = [
  { id: 's1', name: 'Stratus', submitter: 'Alex Thompson', submittedAt: '2025-11-03 10:22', quality: true, starred: false, flagged: false },
  { id: 's2', name: 'LaunchPath', submitter: 'Maria Santos', submittedAt: '2025-11-03 11:45', quality: true, starred: true, flagged: false },
  { id: 's3', name: 'Forgepoint', submitter: 'James Kim', submittedAt: '2025-11-03 14:10', quality: false, starred: false, flagged: false },
  { id: 's4', name: 'Helix', submitter: 'Chen Liu', submittedAt: '2025-11-04 09:33', quality: true, starred: true, flagged: false },
  { id: 's5', name: 'Kindling', submitter: 'Priya Reddy', submittedAt: '2025-11-04 15:55', quality: true, starred: false, flagged: false },
  { id: 's6', name: 'Vantage', submitter: 'Tom Baker', submittedAt: '2025-11-05 08:20', quality: false, starred: false, flagged: false },
  { id: 's7', name: 'Nexum', submitter: 'Sam Wilson', submittedAt: '2025-11-05 12:40', quality: true, starred: false, flagged: false },
  { id: 's8', name: 'FlowForge', submitter: 'Rachel Green', submittedAt: '2025-11-05 16:05', quality: false, starred: false, flagged: false },
  { id: 's9', name: 'Pivot', submitter: 'Alex Thompson', submittedAt: '2025-11-06 10:00', quality: false, starred: false, flagged: false },
  { id: 's10', name: 'CoreShift', submitter: 'Maria Santos', submittedAt: '2025-11-06 13:22', quality: false, starred: false, flagged: false },
  { id: 's11', name: 'Amplify', submitter: 'James Kim', submittedAt: '2025-11-07 09:45', quality: true, starred: false, flagged: false },
  { id: 's12', name: 'Onyx', submitter: 'Chen Liu', submittedAt: '2025-11-07 14:18', quality: true, starred: false, flagged: false },
];

// ─── Sample Participants ───
export const SAMPLE_PARTICIPANTS = [
  { id: 'p1', name: 'Alex Thompson', email: 'alex@co.com', submitted: true, voted: true, points: 145, status: 'full' },
  { id: 'p2', name: 'Maria Santos', email: 'maria@co.com', submitted: true, voted: true, points: 165, status: 'full' },
  { id: 'p3', name: 'James Kim', email: 'james@co.com', submitted: true, voted: false, points: 110, status: 'submitted' },
  { id: 'p4', name: 'Chen Liu', email: 'chen@co.com', submitted: true, voted: true, points: 165, status: 'full' },
  { id: 'p5', name: 'Priya Reddy', email: 'priya@co.com', submitted: true, voted: true, points: 85, status: 'full' },
  { id: 'p6', name: 'Tom Baker', email: 'tom@co.com', submitted: false, voted: false, points: 0, status: 'invited' },
  { id: 'p7', name: 'Sam Wilson', email: 'sam@co.com', submitted: true, voted: true, points: 55, status: 'full' },
  { id: 'p8', name: 'Rachel Green', email: 'rachel@co.com', submitted: false, voted: false, points: 0, status: 'invited' },
  { id: 'p9', name: 'David Park', email: 'david@co.com', submitted: true, voted: false, points: 110, status: 'submitted' },
  { id: 'p10', name: 'Lisa Chen', email: 'lisa@co.com', submitted: true, voted: true, points: 165, status: 'full' },
  { id: 'p11', name: 'Mike Ross', email: 'mike@co.com', submitted: false, voted: false, points: 0, status: 'invited' },
  { id: 'p12', name: 'Emma Davis', email: 'emma@co.com', submitted: true, voted: true, points: 120, status: 'full' },
];

// ─── Active Contests ───
export const ACTIVE_CONTESTS = [
  {
    id: 'c1',
    name: 'Tech Startup Company Name',
    segment: 'business',
    subsegment: 'b1',
    subsegmentLabel: 'Company Name',
    phase: 'submission',
    phaseLabel: 'Submissions Open',
    deadline: '2025-11-14',
    daysRemaining: 7,
    participantCount: 12,
    submissionCount: 47,
    voteCount: 0,
    participationRate: 71,
    tier: 'standard',
    votingMethod: 'multi_criteria',
    anonymous: true,
  },
  {
    id: 'c2',
    name: 'Project Phoenix Initiative',
    segment: 'business',
    subsegment: 'b3',
    subsegmentLabel: 'Project Name',
    phase: 'voting',
    phaseLabel: 'Voting Phase',
    deadline: '2025-11-10',
    daysRemaining: 3,
    participantCount: 8,
    submissionCount: 23,
    voteCount: 6,
    participationRate: 88,
    tier: 'free',
    votingMethod: 'simple_poll',
    anonymous: false,
  },
];

// ─── Completed Contests ───
export const COMPLETED_CONTESTS = [
  {
    id: 'cc1',
    name: 'Band Name Contest',
    segment: 'team',
    subsegment: 't2',
    subsegmentLabel: 'Band Name',
    winner: 'The Velvet Standard',
    completedAt: '2025-10-22',
    participationRate: 82,
    participantCount: 7,
  },
  {
    id: 'cc2',
    name: 'Baby Name — Morrison Family',
    segment: 'personal',
    subsegment: 'p1',
    subsegmentLabel: 'Baby Name',
    winner: 'Olivia Grace',
    completedAt: '2025-10-15',
    participationRate: 91,
    participantCount: 23,
  },
  {
    id: 'cc3',
    name: 'SaaS Product Name',
    segment: 'business',
    subsegment: 'b2',
    subsegmentLabel: 'Product Name',
    winner: 'Flowbase',
    completedAt: '2025-09-30',
    participationRate: 67,
    participantCount: 15,
  },
  {
    id: 'cc4',
    name: 'Community Org Name',
    segment: 'team',
    subsegment: 't4',
    subsegmentLabel: 'Civic Org',
    winner: 'BrightPath Initiative',
    completedAt: '2025-09-18',
    participationRate: 78,
    participantCount: 25,
  },
];

// ─── Vote Data (Simple Poll) ───
export const SIMPLE_POLL_VOTES = [
  { participantId: 'p1', selectedNameId: 'n1' },
  { participantId: 'p2', selectedNameId: 'n1' },
  { participantId: 'p3', selectedNameId: 'n4' },
  { participantId: 'p4', selectedNameId: 'n2' },
  { participantId: 'p5', selectedNameId: 'n1' },
  { participantId: 'p7', selectedNameId: 'n4' },
  { participantId: 'p9', selectedNameId: 'n2' },
  { participantId: 'p10', selectedNameId: 'n1' },
  { participantId: 'p12', selectedNameId: 'n5' },
];

// ─── Vote Data (Ranked Choice) ───
export const RANKED_CHOICE_VOTES = [
  { participantId: 'p1', rankings: ['n1','n4','n2','n5','n3'] },
  { participantId: 'p2', rankings: ['n4','n1','n2','n3','n5'] },
  { participantId: 'p3', rankings: ['n2','n1','n4','n5','n3'] },
  { participantId: 'p4', rankings: ['n1','n5','n4','n2','n3'] },
  { participantId: 'p5', rankings: ['n1','n2','n4','n3','n5'] },
  { participantId: 'p7', rankings: ['n4','n5','n1','n2','n3'] },
  { participantId: 'p9', rankings: ['n2','n4','n1','n3','n5'] },
  { participantId: 'p10', rankings: ['n1','n4','n2','n5','n3'] },
];

// ─── Vote Data (Multi-Criteria) ───
export const MULTI_CRITERIA_VOTES = [
  {
    participantId: 'p1',
    criteria: {
      n1: { magnetism:8, distinctiveness:9, brandFit:8, accessibility:7, longevity:8 },
      n2: { magnetism:6, distinctiveness:5, brandFit:7, accessibility:9, longevity:6 },
      n4: { magnetism:7, distinctiveness:6, brandFit:7, accessibility:8, longevity:7 },
      n5: { magnetism:5, distinctiveness:7, brandFit:6, accessibility:7, longevity:8 },
    }
  },
  {
    participantId: 'p2',
    criteria: {
      n1: { magnetism:9, distinctiveness:8, brandFit:9, accessibility:8, longevity:9 },
      n2: { magnetism:7, distinctiveness:6, brandFit:8, accessibility:9, longevity:7 },
      n4: { magnetism:6, distinctiveness:7, brandFit:7, accessibility:7, longevity:6 },
      n5: { magnetism:8, distinctiveness:8, brandFit:7, accessibility:8, longevity:8 },
    }
  },
  {
    participantId: 'p4',
    criteria: {
      n1: { magnetism:7, distinctiveness:8, brandFit:8, accessibility:7, longevity:8 },
      n2: { magnetism:8, distinctiveness:7, brandFit:8, accessibility:9, longevity:7 },
      n4: { magnetism:9, distinctiveness:9, brandFit:8, accessibility:8, longevity:9 },
      n5: { magnetism:6, distinctiveness:7, brandFit:6, accessibility:7, longevity:7 },
    }
  },
];

// ─── Education Articles ───
export const EDUCATION_ARTICLES = {
  // B1: Company Name — 3 articles, 165pts
  b1: [
    {
      id: 'b1_a1',
      title: 'Why Company Names Matter More Than You Think',
      source: 'howbrandsarebuilt.com',
      readTime: '3 min',
      readPoints: 25,
      quizPoints: 30,
      content: `Every year, companies spend millions fixing names that never should have been chosen. Trademark battles. Rebrand costs. Lost customer recognition. A bad name isn't just aesthetically unpleasant — it's a strategic liability.

**Why Group Naming Usually Fails**

Left unchecked, group naming produces predictable results:

- **The loudest voice wins.** Not the best name. The one championed by whoever has the most social capital in the room.
- **Authority bias takes over.** The CEO suggests something, and suddenly everyone thinks it's great.
- **Recency bias skews everything.** The last name suggested gets more attention simply because it's fresh.

This isn't theoretical. Research on group decision-making consistently shows that unstructured naming sessions produce anchored, biased results — regardless of how thoughtful the participants are.

**What a Name Can (and Can't) Do**

A name can be distinctive. Memorable. Ownable. It can signal your positioning, hint at your value, and create the conditions for a strong brand.

What a name can't do is replace a strategy. "Apple" tells you nothing about computers. But it's distinctive, memorable, and infinitely ownable. Meaning was built around it over decades.

Your job isn't to find the perfect name — perfect doesn't exist. Your job is to find a name that works: one that can carry meaning as you build it.

**The Cost of Getting It Wrong**

Minor trademark disputes: $5,000–$50,000 to resolve. Major ones: $500,000+. Rebrands: $100,000–$1M+ for mid-size companies. Loss of brand equity: incalculable.

The structured contest approach exists precisely because the stakes are high — and the tools that reduce bias are available.`,
      quiz: [
        {
          question: 'What is the most common reason group naming fails?',
          options: ['Not enough time allocated', 'The loudest voice wins', 'Too many options to evaluate', 'Lack of creativity'],
          correct: 1,
          explanation: 'Research consistently shows that unstructured naming sessions are dominated by whoever has the most social capital — not whoever has the best idea.',
        },
        {
          question: 'Which statement about company names is FALSE?',
          options: ['Names can be distinctive and memorable', 'A great name replaces a marketing strategy', 'Names can signal positioning', 'Names need to be ownable'],
          correct: 1,
          explanation: 'Apple tells you nothing about computers. Names create conditions for brand-building — they don\'t replace the strategy itself.',
        },
        {
          question: 'What is something a name CANNOT do for your company?',
          options: ['Be memorable and distinctive', 'Hint at your value proposition', 'Replace your marketing strategy', 'Signal your positioning'],
          correct: 2,
          explanation: 'A name is a vessel you fill with meaning over time. It cannot substitute for strategy, marketing, or product quality.',
        },
      ],
    },
    {
      id: 'b1_a2',
      title: 'The Five Types of Brand Names',
      source: 'Catchword Branding + howbrandsarebuilt.com',
      readTime: '4 min',
      readPoints: 25,
      quizPoints: 30,
      content: `Not all names are created equal — and not all name types work equally well in every competitive context. Understanding the spectrum helps you evaluate submissions more intelligently.

**The Two-Axis Framework**

Names exist on two axes:

*Axis 1: Meaning Spectrum*
- **Descriptive** → Tells you exactly what it is (QuickBooks, General Electric)
- **Suggestive** → Hints at a benefit without stating it (Salesforce, Amazon, Fitbit)
- **Abstract** → Carries no inherent meaning until you build it (Verizon, Kodak, Uber)

*Axis 2: Construction Type*
- **Real word** (Apple, Target, Amazon)
- **Compound** (Facebook, YouTube, Salesforce)
- **Coined/invented** (Xerox, Kodak, Häagen-Dazs)

**Why Most Successful Tech Companies Choose Suggestive**

The sweet spot for tech and B2B companies is suggestive: enough meaning to orient, enough abstraction to own.

- Asana (Sanskrit for "yoga pose" — implies balance/flow) ✓ Suggestive
- Notion (implies a concept, an idea) ✓ Abstract
- Basecamp (implies a starting point, home base) ✓ Suggestive

**Trademark Strength Increases with Abstraction**

Descriptive names are hardest to trademark (everyone can describe what they make). Abstract/coined names are easiest — they're genuinely unique.

Implication for your contest: if you're evaluating names, ask "does this stand out from how competitors sound?" The competitive landscape determines which direction to explore.`,
      quiz: [
        {
          question: 'What type of names are Amazon, Slack, and Fitbit?',
          options: ['Descriptive', 'Suggestive', 'Abstract', 'Coined'],
          correct: 1,
          explanation: 'Suggestive names hint at benefits without stating them directly. Amazon suggests enormity. Slack suggests ease/reduction of friction. Fitbit suggests fitness tracking.',
        },
        {
          question: 'Which type of name is easiest to trademark?',
          options: ['Descriptive (QuickBooks)', 'Suggestive (Salesforce)', 'Abstract/Coined (Kodak)', 'Compound (Facebook)'],
          correct: 2,
          explanation: 'Abstract and coined names are unique — no one else uses that word in that context. Descriptive names can\'t be owned because they describe generic qualities.',
        },
        {
          question: 'When evaluating competitive differentiation, what\'s the key question?',
          options: ['Is it the shortest name?', 'Does it stand out from how competitors sound?', 'Does it describe the product perfectly?', 'Is it easy to pronounce?'],
          correct: 1,
          explanation: 'Notion entered a crowded space (Asana, Trello, Monday — all suggestive, 2-syllable compounds) and went abstract. The differentiation was strategic, not accidental.',
        },
      ],
    },
    {
      id: 'b1_a3',
      title: "Catchword's 10 Criteria for Great Brand Names",
      source: 'Catchword Branding Methodology',
      readTime: '4 min',
      readPoints: 25,
      quizPoints: 30,
      content: `Catchword has named hundreds of companies over 25+ years. Their framework for evaluating names is the industry standard. Here are the 10 criteria you should apply when evaluating submissions.

**The 10 Criteria**

1. **Magnetism** — Is it intriguing? Does it draw people in?
2. **Distinctiveness** — Does it stand out? Is it unique in the competitive landscape?
3. **Brand Fit** — Does it fit the company's personality, values, and positioning?
4. **Accessibility** — Is it easy to spell, say, and remember?
5. **Longevity** — Will it still work in 10–20 years?
6. **Conciseness** — Short enough to be memorable? (Under 3 syllables ideal)
7. **Euphony** — Does it sound good when spoken aloud?
8. **Appropriateness** — Does it avoid negative connotations in target markets?
9. **Consistency** — Does it work across all intended uses (products, taglines, domain)?
10. **Protectability** — Can it be trademarked? Is the domain available?

**The Critical Message: Vote for Brand Fit, Not Personal Preference**

This is the most important thing participants can learn. When you vote, ask:
*"Does this name serve the brand?" — not "Do I personally like it?"*

Häagen-Dazs is a made-up word that means nothing in any language. It tests terribly in focus groups. But it sounds luxurious, European, premium. It built an $800M brand. Your gut reaction is not the test.

**No Name Is Perfect**

Wii was nearly universally mocked before launch. "Wee? Like urination?" But it was distinctive, short, euphonic, and branded Nintendo's next generation perfectly. When applying the 10 criteria, you're looking for the name that scores highest overall — not 10/10 on every dimension.`,
      quiz: [
        {
          question: 'When voting on names, what should participants prioritize?',
          options: ['Personal preference', 'Brand fit over time', 'The most familiar-sounding option', 'The shortest name'],
          correct: 1,
          explanation: 'The most common voting mistake is choosing "the name I like" over "the name that serves the brand." Häagen-Dazs tested poorly but built an $800M brand.',
        },
        {
          question: 'What does the Catchword example of Häagen-Dazs demonstrate?',
          options: ['Names must be meaningful', 'Even imperfect names can build iconic brands', 'Foreign words work best', 'Names must be easy to pronounce'],
          correct: 1,
          explanation: 'Häagen-Dazs is a made-up word in no real language. It tested poorly. But it sounds premium and helped build an enormous brand. Perfection is not the standard.',
        },
        {
          question: 'What does "Euphony" mean in the context of naming?',
          options: ['The name\'s trademark strength', 'How the name sounds when spoken aloud', 'Whether the domain is available', 'The name\'s length in syllables'],
          correct: 1,
          explanation: 'Euphony refers to the acoustic quality — how a name sounds when spoken. Some names have natural rhythm and flow; others feel awkward or harsh.',
        },
      ],
    },
  ],

  // B2: Product Name
  b2: [
    {
      id: 'b2_a1',
      title: 'Product Naming vs Company Naming: What\'s Different',
      source: 'howbrandsarebuilt.com — Product Naming Guide',
      readTime: '3 min',
      readPoints: 25,
      quizPoints: 30,
      content: `Naming a product is fundamentally different from naming a company. The stakes are different, the constraints are different, and the strategies available to you are different.

**Products Live Under a Brand Umbrella**

Your company name sets the stage. Your product names extend the story. This relationship defines your options.

**The Two Portfolio Architectures**

*Branded House* — One master brand, everything carries it:
- Google → Gmail, Google Drive, Google Maps, Google Meet
- Salesforce → Sales Cloud, Service Cloud, Marketing Cloud
- Apple → iPhone, iPad, iMac, AirPods

*House of Brands* — Each product stands alone:
- P&G → Tide, Gillette, Pampers, Febreze (independent brands)
- Unilever → Dove, Axe, Hellmann's (no parent brand visible)

**Which Strategy Is Right?**

Branded house: Use if you want every product to benefit from company reputation. Efficient. Scalable. Requires a strong master brand.

House of brands: Use if products serve radically different markets. Allows distinct positioning. More expensive to maintain.

**Most Startups Default to Branded House**

For early-stage companies, a modular approach works well: [Company] [Descriptor]. Example: Notion Calendar, Notion AI. This scales cleanly.`,
      quiz: [
        {
          question: 'What is a "Branded House" naming architecture?',
          options: ['Multiple independent brands under one parent', 'One master brand applied to all products', 'A naming strategy for B2C products only', 'Product names that describe their function'],
          correct: 1,
          explanation: 'Google (Gmail, Drive, Maps), Apple (iPhone, iPad, iMac) — one master brand carries everything. Efficient and scalable when the master brand is strong.',
        },
        {
          question: 'Which company uses a "House of Brands" strategy?',
          options: ['Google', 'Apple', 'P&G (Tide, Gillette, Pampers)', 'Salesforce'],
          correct: 2,
          explanation: 'P&G\'s brands (Tide, Gillette, Pampers, Febreze) are independent — consumers often don\'t know they share a parent company. This is classic "house of brands."',
        },
        {
          question: 'For early-stage startups, which portfolio approach is usually recommended?',
          options: ['House of brands', 'Branded house with modular naming', 'No naming system', 'Descriptive product names only'],
          correct: 1,
          explanation: 'Branded house with a modular approach scales cleanly: [Company] [Descriptor] lets every product benefit from the master brand while maintaining distinct identities.',
        },
      ],
    },
    {
      id: 'b2_a2',
      title: 'Naming Product Lines: The Scalability Test',
      source: 'Nomenclature best practices',
      readTime: '4 min',
      readPoints: 25,
      quizPoints: 30,
      content: `The worst time to realize your product name doesn't scale is when you're about to launch version 2.0. Plan ahead.

**The Scalability Test**

Ask three questions before finalizing any product name:
1. Does this work for a "Pro" version? → [Name] Pro
2. Does this work for a "Lite" version? → [Name] Lite
3. Does this work as part of a suite? → [Name] + sibling product names

**Real Failures: Dead-End Names**

Apple's iPhone naming became a problem: iPhone 1, 2, 3, 4, 5, 6, 7, 8 — then what? They jumped to iPhone X (10). The linear numbering system painted them into a corner.

**Real Successes: Scalable Systems**

Salesforce Clouds: Sales Cloud, Service Cloud, Marketing Cloud, Commerce Cloud. The word "Cloud" anchors the whole suite. New products simply add a descriptor before "Cloud." Infinitely scalable.

**The Modular Approach**

[Anchor Word] + [Descriptor] = scalable product architecture.

Adobe: Creative Suite → Creative Cloud (same anchor, evolved with the market)
Microsoft: Microsoft Teams, Microsoft 365, Microsoft Azure (company name as anchor)

**The Naming Exercise**

Before submitting or evaluating names, say this aloud:
"Introducing [Name], [Name] Pro, [Name] Lite, and [Name] Enterprise."

If it sounds right, the name scales.`,
      quiz: [
        {
          question: 'What is the "Scalability Test" for product names?',
          options: ['Test if the name is short enough', 'Test if the name works for Pro/Lite/Suite versions', 'Test if the domain is available', 'Test if the name is trademarked'],
          correct: 1,
          explanation: 'Before finalizing a product name, check: Does "[Name] Pro" work? "[Name] Lite"? Part of a suite? Planning ahead prevents dead-end names.',
        },
        {
          question: 'What naming problem did Apple encounter with iPhone?',
          options: ['The name was too short', 'Linear numbering painted them into a corner', 'iPhone was too similar to competitor names', 'The trademark was unavailable'],
          correct: 1,
          explanation: 'iPhone 1-8 worked until it didn\'t — they jumped to iPhone X (10) rather than iPhone 9. A scalable naming system avoids this problem.',
        },
        {
          question: 'Which is an example of a scalable product naming architecture?',
          options: ['iPhone 1, 2, 3, 4...', 'Salesforce Sales Cloud, Service Cloud, Marketing Cloud', 'A single descriptive product name', 'Brand names with founder surnames'],
          correct: 1,
          explanation: 'Salesforce\'s Cloud system adds a simple descriptor before "Cloud" for each new product. Infinitely scalable without any naming dead-ends.',
        },
      ],
    },
    {
      id: 'b2_a3',
      title: 'The Same 10 Criteria — Applied to Products',
      source: 'Catchword Branding — Product Naming Framework',
      readTime: '4 min',
      readPoints: 25,
      quizPoints: 30,
      content: `Catchword's 10 criteria apply to products just as they do to company names — but the weighting shifts. When you're naming a product, certain criteria take on more importance.

**Most Critical for Products**

1. **Brand Fit** (weight: highest) — The product name must extend the brand story, not contradict it. If your company sounds premium and modern, a product that sounds cheap undermines everything.

2. **Consistency** — Will this name work across all SKUs, packaging, digital surfaces, and documentation?

3. **Longevity** — Will this name still work when the product is in version 5.0? When the market has shifted?

4. **Accessibility** — Customer-facing teams (sales, support) will say this name hundreds of times a day. It must be easy.

**Context: The Competitive Product Landscape**

When evaluating names for your product, always ask: "If I heard this name with no context, would I know it's a [category]?"

Examples:
- Slack → Immediately feels like a work tool (suggestive of ease)
- Dropbox → Immediately communicates file storage (descriptive)
- Figma → Abstract, but distinctive in design tool category

**The Portfolio Check**

After choosing a finalist, say all your products together:
"[Company] makes [Product1], [Product2], and [NewProduct]."

Does it sound like a family? If the new name sounds like it belongs to a different company, reconsider.`,
      quiz: [
        {
          question: 'Which criteria is MOST important when naming a product?',
          options: ['Conciseness', 'Brand Fit', 'Euphony', 'Magnetism'],
          correct: 1,
          explanation: 'A product name that contradicts the brand personality undermines the entire brand. Brand Fit is weighted highest in product naming because products live under the company umbrella.',
        },
        {
          question: 'What is the "Portfolio Check" in product naming?',
          options: ['Checking trademark availability', 'Saying all product names together to test family sound', 'Counting syllables in product names', 'Comparing to competitor product names'],
          correct: 1,
          explanation: 'Say "[Company] makes [Product1], [Product2], and [NewProduct]" aloud. Does it sound like a coherent product family? If the new name sounds foreign, reconsider.',
        },
        {
          question: 'Why is Accessibility especially important in product naming?',
          options: ['Products need to be searchable online', 'Customer-facing teams say the name hundreds of times daily', 'Products need shorter names than companies', 'Product names must be international'],
          correct: 1,
          explanation: 'Sales reps, support agents, and account managers will say the product name constantly. If it\'s hard to say or remember, it becomes a daily friction point.',
        },
      ],
    },
  ],

  // T1: Sports Team
  t1: [
    {
      id: 't1_a1',
      title: '4 Things That Make a Great Sports Team Name',
      source: 'Sports branding research',
      readTime: '3 min',
      readPoints: 20,
      quizPoints: 15,
      content: `Sports names have a unique set of requirements. They're chanted. They're on jerseys. They're defended fiercely by fans for generations. Here's what separates the great ones from the forgettable ones.

**1. Intimidation or Identity — Pick Your Camp**

*Intimidating:* Sharks, Predators, Ravens, Thunder
*Pride/Identity-based:* Patriots, Saints, Warriors, Kings

Both work — the key is committing to one. Youth teams often lean pride (Fireflies, Thunderbolts). Competitive adult leagues lean intimidation (Vipers, Reapers). Match the tone to your actual team culture.

**2. Local Connection**

The best sports names have geographic or cultural roots:
- Lakers = Minnesota's "Land of 10,000 Lakes" (yes, even after moving to LA)
- Grizzlies = Vancouver's wilderness heritage
- Golden State Warriors = San Francisco's Gold Rush history
- Cleveland Guardians = Named after the Guardians of Traffic statues on the Hope Memorial Bridge

A local connection gives fans a reason to own the name beyond just sports loyalty.

**3. Timelessness**

Avoid trendy references. "Miami Heat" works forever. A name based on a pop culture moment would've aged terribly.

Oklahoma City Thunder beat out finalists: Barons, Energy, and Marshalls in their 2008 public vote — specifically because Thunder felt timeless and intimidating.

**4. Merchandisable**

Will people wear this on a jersey? Say it at games? Chant it?

The test: "Defense! Defense! Let's go [NAME]!"

If it sounds awkward in that sentence, reconsider.`,
      quiz: [
        {
          question: 'What should sports team names prioritize above trends?',
          options: ['Trending pop culture references', 'Timelessness', 'The most aggressive-sounding option', 'The longest name possible'],
          correct: 1,
          explanation: '"Miami Heat" works forever. A name based on a 2008 trend would have aged poorly. When evaluating names, ask: will this still be great in 20 years?',
        },
        {
          question: 'What is the "Local Connection" principle in sports naming?',
          options: ['The name must describe the sport', 'Geographic or cultural roots give fans reason to own the name', 'The name must use the city\'s name directly', 'Names should reference local politicians'],
          correct: 1,
          explanation: 'Lakers, Grizzlies, Warriors, Guardians — all have roots in local geography or culture. This creates deeper fan ownership beyond just team loyalty.',
        },
        {
          question: 'What\'s the best test for a sports team name?',
          options: ['Does it look good on a logo?', 'Can you yell it in a game context: "Let\'s go [NAME]!"', 'Is it the shortest option?', 'Does the coach like it?'],
          correct: 1,
          explanation: 'Sports names live in chants and crowds. If "Let\'s go [NAME]!" sounds awkward, the name won\'t work in its primary environment — the game.',
        },
      ],
    },
  ],

  // T2: Band
  t2: [
    {
      id: 't2_a1',
      title: 'What Makes a Band Name Actually Work?',
      source: 'Music industry naming analysis',
      readTime: '3 min',
      readPoints: 20,
      quizPoints: 15,
      content: `Your band name is your first song. Before a note is played, it sets expectations. Genre. Attitude. Story. Here's the framework that separates legendary band names from forgettable ones.

**The 3 Band Name Archetypes**

*1. Absurdist/Provocative*
Examples: Butthole Surfers, Panic! at the Disco, Arctic Monkeys
Gets attention, hard to forget. Risk: may not age well or may limit mainstream appeal.

*2. Evocative/Poetic*
Examples: The National, Fleet Foxes, Beach House, Sufjan Stevens
Sets mood without being literal. Works for longevity. Often the most critically respected approach.

*3. Personal/Story*
Examples: Lynyrd Skynyrd (after gym teacher Leonard Skinner), Radiohead (from Talking Heads song "Radio Head"), Foo Fighters (Dave Grohl's WWII UFO reference)
Authentic origin creates mythology. Fans love "how we got our name" stories.

**Genre Matters**

- Metal: Aggressive, dark (Slayer, Megadeth, Lamb of God)
- Indie: Abstract/literary (Bon Iver, Fleet Foxes, Phoebe Bridgers)
- Pop: Catchy/memorable (HAIM, CHVRCHES, MUNA)

Your name signals your genre before anyone hears you.

**The Google Test**

Is your name searchable? "The The," "Girls," and "!!!" are real band names that are essentially impossible to search online.

CHVRCHES uses a V instead of a U — ugly? Maybe. But instantly searchable.

**The Origin Story**

Pink Floyd = Pink Anderson + Floyd Council (two blues musicians Syd Barrett loved).
The Beatles = pun on "beat" + Buddy Holly's Crickets.

Even if your name sounds random, having a story makes it mythological.`,
      quiz: [
        {
          question: 'Which best describes the 3 band name archetypes?',
          options: ['Short, Medium, Long', 'Absurdist, Evocative, Personal/Story', 'Descriptive, Suggestive, Abstract', 'Metal, Indie, Pop'],
          correct: 1,
          explanation: 'The three archetypes are: Absurdist/Provocative (Arctic Monkeys), Evocative/Poetic (The National), and Personal/Story (Radiohead, Lynyrd Skynyrd). Each has different strengths.',
        },
        {
          question: 'Why does genre matter in band naming?',
          options: ['Judges prefer genre-matching names', 'The name signals genre before anyone hears you', 'Genre names are easier to trademark', 'Genre names get more streams'],
          correct: 1,
          explanation: 'Metal bands use aggressive names (Slayer). Indie bands use literary/abstract names (Fleet Foxes). Your name sets expectations before a note is played.',
        },
        {
          question: 'What is the "Google Test" for band names?',
          options: ['Does the name appear in Google results?', 'Is the name searchable — not a common word or impossible to find?', 'Did Google name any bands using this method?', 'Is the .com domain available?'],
          correct: 1,
          explanation: '"The The," "Girls," "!!!" — all real bands impossible to search online. CHVRCHES deliberately misspells their name to be searchable. This matters for discoverability.',
        },
      ],
    },
  ],

  // T3: Podcast
  t3: [
    {
      id: 't3_a1',
      title: 'Naming Your Show: The Clarity vs Intrigue Spectrum',
      source: 'Podcast naming best practices',
      readTime: '3 min',
      readPoints: 20,
      quizPoints: 15,
      content: `Podcast naming has a unique tension: you need to be discoverable (searchable on Apple Podcasts) AND memorable (someone recommends you to a friend and they remember the name 3 days later). Most shows sacrifice one for the other. The best names balance both.

**The Clarity vs Intrigue Spectrum**

*Ultra-clear:* "How I Built This" — exactly what it is. Perfect SEO, immediate value prop.
*Balanced:* "Serial" — intriguing word that implies episodic, genre-appropriate, one word.
*Abstract:* "99% Invisible" — memorable, thought-provoking, requires explanation. Roman Mars built it into a legend.

We recommend "Balanced" for new shows — unless you have an existing audience that will follow you regardless.

**The Format Factor**

- Interview shows: Often host-named (Joe Rogan Experience, Armchair Expert)
- Narrative/investigative: Story-focused names (Serial, S-Town, Dr. Death)
- News/analysis: Topic-clear (The Daily, Up First, Marketplace)

**The Recommendation Test**

The real test: Can someone say "You should listen to [NAME]" and have the other person remember it three days later?

"Have you heard Criminal?" → Yes, they remember.
"Have you heard The Podcast About Crime Stories?" → They forget it immediately.

**Discovery Strategy**

If Apple Podcasts search is your primary acquisition channel → lean clearer.
If word-of-mouth is your strategy → lean more memorable.

Reply All had a strong brand but was hard to discover. "How I Built This" is discoverable but less mythological. Know your strategy.`,
      quiz: [
        {
          question: 'The clarity vs intrigue spectrum for podcasts suggests:',
          options: ['Always be ultra-clear for SEO', 'Balance based on your distribution strategy', 'Always be abstract to stand out', 'Use the host name always'],
          correct: 1,
          explanation: 'The right balance depends on how people find you. Search-driven shows lean clearer. Word-of-mouth shows can afford more intrigue. New shows without existing audiences should balance both.',
        },
        {
          question: 'Interview-format shows commonly use which naming approach?',
          options: ['Abstract single-word names', 'Geographic names', "The host's name", 'Descriptive topic names'],
          correct: 2,
          explanation: 'Joe Rogan Experience, Armchair Expert (Dax Shepard), WTF with Marc Maron — interview shows often use the host\'s name because it\'s a personal brand play.',
        },
        {
          question: 'What is the "Recommendation Test" for podcast names?',
          options: ['Did your friends recommend you start a podcast?', 'Can someone say the name and have others remember it days later?', 'Did other podcasters recommend the name?', 'Is the name recommended by Apple Podcasts?'],
          correct: 1,
          explanation: '"Have you heard Criminal?" sticks. "Have you heard The True Crime Investigation Podcast?" doesn\'t. The recommendation test checks memorability — the most important word-of-mouth quality.',
        },
      ],
    },
  ],

  // T4: Civic/Nonprofit
  t4: [
    {
      id: 't4_a1',
      title: 'Naming for the Long Term: Civic & Community Organizations',
      source: 'Nonprofit branding guides + institutional naming',
      readTime: '3 min',
      readPoints: 20,
      quizPoints: 15,
      content: `When you're naming a school, nonprofit, or civic organization, you're naming something that should outlast you by decades. The priorities shift dramatically from commercial naming.

**Longevity First**

Avoid trendy language. No "cyber-," "e-," "i-" prefixes. No slang. No references that will date your organization.

Ask: "Will this name make sense in 50 years?"

"Tech for America" would've aged better than "CyberCorps." "Feeding America" will still be understood in 2075. "Digital Hunger Initiative" won't.

**Community Ownership**

The name should feel like it belongs to everyone — not to one person's vision.

Names that feel communal: Big Brothers Big Sisters, Habitat for Humanity, Teach For America.
Names that feel like one person's project: The Johnson Initiative, Sarah's Foundation.

Avoid founder names unless the founder is legendary (Ford Foundation works because Henry Ford was legendary). For most organizations, founder names limit the name's ability to outlive its originator.

**The Acronym Test**

Many civic organizations become acronyms. ACLU, NAACP, YMCA, NASA — these initials are now more recognized than the full names.

Check: Will your acronym work? Is it pronounceable (NASA) or does it spell out (NAACP)? Is the acronym already taken by another organization?

**Mission Clarity**

Unlike brands, civic names often benefit from stating their mission directly:
- Doctors Without Borders → clear mission, global resonance
- charity: water → clean, lowercase, memorable
- The Nature Conservancy → exactly describes the work

The risk of pure abstraction: if donors and supporters can't understand what you do, you're always explaining yourself.`,
      quiz: [
        {
          question: 'What should civic and nonprofit names prioritize above all else?',
          options: ['Memorability and trendiness', 'Longevity and clarity', 'Founder recognition', 'Geographic specificity'],
          correct: 1,
          explanation: 'Organizations outlast their founders. A name built for longevity and clarity will serve the mission across generations. Trendy names age badly and require costly updates.',
        },
        {
          question: 'What does the Acronym Test check?',
          options: ['Whether the name is too long', 'Whether the initials work as an acronym and aren\'t already taken', 'Whether the name uses abbreviations', 'Whether board members like the initials'],
          correct: 1,
          explanation: 'ACLU, YMCA, NAACP — many civic organizations become their acronyms. Before finalizing a name, check if the initials work, are pronounceable or spell-outable, and aren\'t already taken.',
        },
        {
          question: 'Why should most civic organizations avoid founder names?',
          options: ['Founder names are harder to trademark', 'Founder names limit the organization\'s ability to outlive its originator', 'Donors dislike personal names', 'Founder names are too long'],
          correct: 1,
          explanation: 'Unless the founder is legendary (Ford Foundation), a founder name limits the organization. "The Morrison Foundation" dies with the Morrisons. "Community Health Partners" can outlast anyone.',
        },
      ],
    },
  ],

  // T5: Gaming (minimal — just tip card)
  t5: [],

  // T6: Other Team
  t6: [
    {
      id: 't6_a1',
      title: 'The Psychology of Group Names',
      source: 'Social psychology + group identity research',
      readTime: '3 min',
      readPoints: 20,
      quizPoints: 15,
      content: `Whether you're naming a running club, book club, D&D party, supper club, or fantasy league, the psychology is the same: names create identity, and identity drives belonging.

**Names Create In-Group Signaling**

Research in social psychology consistently shows that named groups have stronger cohesion than unnamed ones. The name becomes a shorthand for everything the group represents.

When someone says "I'm part of [Group Name]," they're claiming an identity — not just describing an activity.

**Names Signal What the Group Is About**

"The Tuesday Readers" tells you it's a book club that meets on Tuesdays. Functional. Clear. Forgettable.

"The Shelf Life Club" tells you it's a book club with a sense of humor. Slightly more memorable. Still clear enough.

"The Unread Pile" tells you it's a book club with self-aware irony about the stacks of unread books everyone has. That's a personality.

**Names Make Groups Feel Real**

Before naming, a group is just "some people who do X together." After naming, it's an institution. People invite others. They make merchandise. They develop rituals and inside jokes that attach to the name.

**The Good Story Test**

The best group names usually have a story: where they came from, what they mean, why they work.

D&D parties often name themselves after their first campaign's location or villain. Running clubs name themselves after a local landmark or inside joke. Supper clubs often riff on food puns.

Give participants context — the best name often comes from a shared experience or inside joke.`,
      quiz: [
        {
          question: 'According to social psychology, what do named groups have compared to unnamed ones?',
          options: ['More members', 'Stronger cohesion and identity', 'Better organizational structure', 'More formal leadership'],
          correct: 1,
          explanation: 'Research shows named groups have significantly stronger cohesion. The name becomes a shorthand for everything the group represents — it makes the group "real."',
        },
        {
          question: 'What does a good group name do beyond describing the activity?',
          options: ['Makes it official', 'Signals the group\'s personality and creates identity', 'Helps with recruitment', 'Makes scheduling easier'],
          correct: 1,
          explanation: '"The Unread Pile" vs "Tuesday Readers" — both are book clubs. But one has personality. Names that signal personality attract people who share that personality.',
        },
        {
          question: 'What is the "Good Story Test" for group names?',
          options: ['Does the name sound good in a story?', 'Does the name have an origin story that will become group mythology?', 'Is the name based on a famous story?', 'Would the name work for a storytelling group?'],
          correct: 1,
          explanation: 'The best group names come from shared experiences or inside jokes. When someone new asks "how\'d you get that name?" and the answer is a great story, the name does extra work building group identity.',
        },
      ],
    },
  ],

  // P1-P4: Personal — no articles, just tip cards
  p1: [], p2: [], p3: [], p4: [],
};

// ─── Tip Cards for Personal paths ───
export const PERSONAL_TIP_CARDS = {
  p1: [
    { id: 'p1_t1', emoji: '👶', title: 'The Playground Test', tip: 'Imagine calling the name across a crowded playground. Can you yell it clearly? Does it stand out without sounding harsh? If yes, you\'re on the right track.', points: 5 },
    { id: 'p1_t2', emoji: '✨', title: 'The Initials Check', tip: 'Write out the full name with initials. Fun fact: parents of a child named Andrew Steven Smith only realized later their kid\'s initials spelled A-S-S. Check yours!', points: 5 },
    { id: 'p1_t3', emoji: '💡', title: 'The 30% Rule', tip: 'On our platform, 30% of winning baby names were NOT in the parents\' initial top-3. Trust the process — the crowd often sees what you\'ve been too close to notice.', points: 5 },
  ],
  p2: [
    { id: 'p2_t1', emoji: '🐾', title: 'Short Names Win', tip: '1-2 syllables is ideal for pet names. Your pet will respond to shorter names faster — and you\'ll be yelling it at the dog park. "Max!" works. "Bartholomew!" doesn\'t.', points: 5 },
    { id: 'p2_t2', emoji: '🏆', title: 'The Park Test', tip: 'Imagine calling the name loudly at a dog park or across the house. Does it sound natural? Would you be embarrassed yelling it in public? That\'s your test.', points: 5 },
  ],
  p3: [
    { id: 'p3_t1', emoji: '🏡', title: 'The Invitation Test', tip: 'You\'ll be telling people "come stay at [Property Name]." Does it sound inviting? Does it make people curious? That\'s the test for home and property names.', points: 5 },
    { id: 'p3_t2', emoji: '⚓', title: 'Boats Have Stories', tip: 'The best boat names have a story behind them — a place you love, a person who matters, an inside joke. When someone asks "Why\'d you name it that?" you want a good answer.', points: 5 },
  ],
  p4: [
    { id: 'p4_t1', emoji: '🎲', title: 'Names Make Groups Real', tip: 'Research shows named groups have stronger cohesion than unnamed ones. Your fantasy league, book club, or D&D party will meet more consistently once it has an identity.', points: 5 },
    { id: 'p4_t2', emoji: '😄', title: 'The Inside Joke Goldmine', tip: 'The best group names often come from inside jokes or shared experiences. Give people context about your group\'s history — the best name is often already in your story.', points: 5 },
  ],
};

// ─── Exploration Prompts ───
export const EXPLORATION_PROMPTS = {
  b1: [
    "What's the one word that captures what your company does differently from everyone else?",
    "If your company were a person, what would their nickname be?",
    "What metaphor best describes your company's core value? (e.g., 'a bridge,' 'a compass,' 'a spark')",
    "What do your best customers say when they describe you to others?",
    "What would competitors never say about themselves that's actually true of you?",
  ],
  b2: [
    "What transformation does this product create for the user?",
    "If this product were a tool in a physical workshop, what would it be?",
    "What's the one moment when this product is most valuable?",
    "What do users feel after using this product that they didn't feel before?",
  ],
  t1: [
    "What makes this team different from all the others in your league?",
    "What's the one thing that makes teammates excited to show up?",
    "If the team were an animal, what would it be and why?",
  ],
  t2: [
    "What's the first song you ever played together?",
    "What's an inside joke or shared experience that defines the band?",
    "What 3 adjectives describe your sound?",
  ],
  p1: [
    "Say each finalist name with your last name out loud. Which flows best?",
    "Imagine your child introducing themselves at age 25. Which name fits?",
  ],
};

// ─── Famous Rejected Names (Flip Cards) ───
export const REJECTED_NAMES = [
  { brand: 'Amazon', current: 'Amazon', rejected: ['Cadabra', 'Relentless', 'Awake', 'MakeItSo'], note: "Bezos's lawyer misheard 'Cadabra' as 'Cadaver' on the phone", source: 'Brad Stone, "The Everything Store"' },
  { brand: 'Google', current: 'Google', rejected: ['BackRub', 'Googol'], note: "The misspelling of 'Googol' stuck — and became worth trillions", source: 'Stanford archives' },
  { brand: 'Nike', current: 'Nike', rejected: ['Dimension Six'], note: "Named after the Greek goddess of victory at the last minute", source: 'Phil Knight memoir "Shoe Dog"' },
  { brand: 'Pepsi', current: 'Pepsi', rejected: ["Brad's Drink"], note: "Named after dyspepsia (indigestion) it claimed to cure", source: 'Pepsi company history' },
  { brand: 'Sony', current: 'Sony', rejected: ['Tokyo Tsushin Kogyo', 'Sonny Boy'], note: "Combined 'sonus' (Latin: sound) + 'sonny' (American slang: boy)", source: 'Akio Morita autobiography' },
  { brand: 'Starbucks', current: 'Starbucks', rejected: ['Cargo House', 'Pequod'], note: "Named after Starbuck, first mate in Moby Dick", source: 'Howard Schultz interviews' },
  { brand: 'Instagram', current: 'Instagram', rejected: ['Burbn', 'Codename', 'Scotch'], note: "Burbn was a check-in app; they pivoted to photos only and renamed", source: 'Kevin Systrom interviews' },
  { brand: 'Twitter', current: 'Twitter', rejected: ['twttr', 'Jitter', 'Smssy'], note: "Jack Dorsey wanted a name that sounded like birds chirping", source: 'Dom Sagolla, Twitter co-founder' },
  { brand: 'Netflix', current: 'Netflix', rejected: ['Kibble'], note: "Almost named after Reed Hastings' dog before cooler heads prevailed", source: 'Marc Randolph co-founder memoir' },
  { brand: 'Spotify', current: 'Spotify', rejected: ['MusicTorrent', 'Tunigo', 'Peer Tracks'], note: "Created by combining 'spot' and 'identify'", source: 'Daniel Ek interviews' },
  { brand: 'Yahoo', current: 'Yahoo', rejected: ["Jerry and David's Guide to the World Wide Web"], note: "Yahoo = 'Yet Another Hierarchical Officious Oracle'", source: 'Jerry Yang, co-founder' },
  { brand: 'Slack', current: 'Slack', rejected: ['Glitch'], note: "Pivoted from a game called Glitch; the acronym came after — they worked backward from 'Slack'", source: 'Stewart Butterfield interviews' },
];

// ─── FAQ ───
export const FAQ_ITEMS = [
  { q: 'Do participants need accounts?', a: 'No. Share a link, they join instantly. Only organizers create accounts (and only at contest launch). Participants click the link, see the brief, read the education content, and submit — zero friction.' },
  { q: 'How does anonymous submission work?', a: 'Names appear without attribution during voting. Even the organizer doesn\'t see who suggested what until after voting closes. In our data, anonymous contests have 23% higher satisfaction with final results.' },
  { q: 'Can I run a free contest?', a: 'Yes. Free tier includes up to 5 participants, basic voting (Simple Poll), and a results summary. Upgrade to Standard ($9–$29) for unlimited participants, all 5 voting methods, PDF reports, and analytics.' },
  { q: 'What\'s the Catchword connection?', a: 'Namico.com is built using Catchword\'s 25-year naming methodology. Every article, every criterion, every tip — backed by the firm that named TikTok, Rivian, and Intel. Catchword consultants are available for post-contest support.' },
  { q: 'How long does a typical contest take?', a: 'Recommended: 5-7 days for submissions, then 3-4 days for voting. Total: 8-11 days. Contests under 5 days have 54% avg participation. Contests of 8-11 days have 76% avg participation. You control the timeline.' },
  { q: 'What are the pricing tiers?', a: 'Personal: Free (5 participants) or $9 (up to 15). Team: Free or $29 (up to 60). Business: Free or $89 (up to 240). All paid plans include every voting method, naming methodology, and automated reminders.' },
  { q: 'What is Multi-Round Series?', a: 'For Business and Civic contests, you can run 2-3 rounds: submit many names in Round 1, advance the top 8 to Round 2, then the top 3 to a final vote. Standard tier supports 2 rounds; Professional supports 3.' },
  { q: 'What voting methods are available?', a: 'Five methods: Simple Poll (one vote), Ranked-Choice (drag to rank your top 5), Multi-Criteria Scoring (rate names on 5 dimensions), Pairwise Comparison (head-to-head matchups), and Weighted Voting (some votes count more).' },
  { q: 'Can I export my contest data?', a: 'Yes. CSV export includes all votes, submissions, and timestamps. PDF report (Business tier) includes a 9-page analysis. Name DNA Breakdown shows multi-criteria scores by dimension.' },
  { q: 'What support is available?', a: 'Documentation, email support, and Catchword consultation bookings (from $299). For Professional tier, priority support is included. We also have a 15-min free consultation available after any completed contest.' },
];

// ─── Segment / Subsegment Definitions ───
export const SEGMENTS = {
  business: {
    id: 'business',
    label: 'Business',
    color: '#eaef09',
    colorRgb: '234,239,9',
    icon: '🏢',
    description: 'Name something that means business',
    hoverHeadline: 'Your team has ideas. Structure the conversation.',
    subsegments: [
      { id: 'b1', label: 'Company or Startup Name', description: 'Name a new business entity', icon: '🚀', briefSteps: 7 },
      { id: 'b2', label: 'Product or Service Name', description: 'Name a product, service, or offering', icon: '📦', briefSteps: 7 },
      { id: 'b3', label: 'Project or Initiative Name', description: 'Name an internal project or initiative', icon: '📋', briefSteps: 5 },
      { id: 'b4', label: 'Rebrand', description: 'Rename an existing brand or entity', icon: '🔄', briefSteps: 7 },
      { id: 'b5', label: 'Other Business Naming', description: 'Any other business naming need', icon: '💼', briefSteps: 5 },
    ],
  },
  team: {
    id: 'team',
    label: 'Team or Group',
    color: '#8B5CF6',
    colorRgb: '139,92,246',
    icon: '👥',
    description: 'Give your whole group a voice',
    hoverHeadline: 'Give everyone a voice. Pick a name you\'ll all own.',
    subsegments: [
      { id: 't1', label: 'Sports Team', description: 'Name a recreational or competitive team', icon: '🏆', briefSteps: 4 },
      { id: 't2', label: 'Band or Music Group', description: 'Name a musical act or band', icon: '🎸', briefSteps: 5 },
      { id: 't3', label: 'Podcast or Channel', description: 'Name a media project or creative show', icon: '🎙️', briefSteps: 4 },
      { id: 't4', label: 'Civic, School, or Nonprofit', description: 'Name an organization or formal group', icon: '🏛️', briefSteps: 5 },
      { id: 't5', label: 'Gaming Group', description: 'Name a gaming team, guild, or clan', icon: '🎮', briefSteps: 3 },
      { id: 't6', label: 'Other Team or Group', description: 'Any other group naming need', icon: '✨', briefSteps: 3 },
    ],
  },
  personal: {
    id: 'personal',
    label: 'Something Personal',
    color: '#10B981',
    colorRgb: '16,185,129',
    icon: '✨',
    description: 'Let everyone weigh in. Make it official.',
    hoverHeadline: 'Let everyone vote. Pick the name you\'ll love.',
    subsegments: [
      { id: 'p1', label: 'Baby Name', description: 'Choosing a name for your baby', icon: '👶', briefSteps: 1 },
      { id: 'p2', label: 'Pet Name', description: 'Naming your new pet', icon: '🐾', briefSteps: 1 },
      { id: 'p3', label: 'Home, Property, or Something Fun', description: 'Name a house, boat, or fun project', icon: '🏡', briefSteps: 1 },
      { id: 'p4', label: 'Other Personal Naming', description: 'Any other personal naming decision', icon: '🎯', briefSteps: 1 },
    ],
  },
};

export const getSegmentColor = (segmentId) => {
  const seg = SEGMENTS[segmentId];
  return seg ? seg.color : '#ffffff';
};

export const getSegmentColorRgb = (segmentId) => {
  const seg = SEGMENTS[segmentId];
  return seg ? seg.colorRgb : '255,255,255';
};

export const getTierClass = (segmentId) => {
  const map = { business: 'tier-business', team: 'tier-team', personal: 'tier-personal' };
  return map[segmentId] || '';
};

export const getBtnClass = (segmentId) => {
  const map = { business: 'btn-business', team: 'btn-team', personal: 'btn-personal' };
  return map[segmentId] || 'btn-ghost';
};
