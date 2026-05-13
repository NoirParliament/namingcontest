// ════════════════════════════════════════════════════════════════
// V4 Brief Questions — extracted from src/pages/BriefBuilder.jsx
// Source of truth for V4 chat-style brief flows.
//
// Structure:
//   BRIEF_QUESTIONS         per-sub-segment question lists
//   SHARED_SETTINGS_QUESTIONS appended to every brief
//   ARTICLES                long-form CREATOR_ARTICLES content
//   PRIMERS                 "~90 second read" intros
//   INVITE_GUIDANCE         INVITE_CONFIG content
//   CUT_QUESTIONS           IDs cut from chat flow (data preserved)
//   MERGE_QUESTIONS         semantic merges (kept reversible)
//   FALLBACK_QUESTIONS      shape for b5 / p4 "something else"
//
// IDs follow V4 sub-segment naming:
//   b1 company-name · b2 product-name · b3 project-name · b4 rebrand · b5 other-business
//   t1 sports-team · t2 band-music · t3 podcast-channel · t4 civic-school-nonprofit · t5 gaming-group · t6 other-team
//   p1 baby-name · p2 pet-name · p3 home-property-fun · p4 other-personal
// ════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// 1. BRIEF_QUESTIONS — per sub-segment
// ────────────────────────────────────────────────────────────────
export const BRIEF_QUESTIONS = {
  // ── b1 · Company / startup ──
  b1: {
    label: 'Company / startup',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'currentName',
        label: 'Current name',
        prompt: 'What is your current brand name?',
        type: 'text',
        showWhen: { subSegment: 'rebrand' },
        placeholder: 'What is your current brand name?',
        required: false,
      },
      {
        id: 'rebrandReason',
        label: 'Why are you rebranding?',
        prompt: `What's prompting the rebrand — and what's changing about the business?`,
        type: 'textarea',
        rows: 3,
        showWhen: { subSegment: 'rebrand' },
        placeholder: `What prompted this rebrand? What's changing about your business?`,
        required: false,
      },
      {
        id: 'companyDesc',
        label: 'What does your company do?',
        prompt: 'In 2–3 sentences, what does your company do?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'Describe your company in 2-3 sentences...',
        hint: `Don't overthink this. You're not writing a mission statement. You're giving participants context. Example: 'We make project management software for remote teams' is perfect. Keep it to 2-3 sentences.`,
        guideId: 'b1-brief',
      },
      {
        id: 'namingStyle',
        label: 'Naming Style Preference',
        prompt: 'What kind of name fits your company best?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Descriptive', sublabel: 'QuickBooks' },
          { id: 'suggestive', label: 'Suggestive', sublabel: 'Salesforce' },
          { id: 'abstract', label: 'Abstract', sublabel: 'Verizon' },
          { id: 'any', label: 'Not sure (any)', sublabel: 'Show me all' },
        ],
        hint: `Descriptive names tell you what it is (QuickBooks). Suggestive names hint at benefits (Salesforce). Abstract names mean nothing until you make them mean something (Verizon). Most successful tech companies choose Suggestive — trademarkable + memorable + flexible as you scale. Real examples: Asana (suggestive), Notion (abstract), Basecamp (descriptive).`,
        guideId: 'b1-arc',
      },
      {
        id: 'targetAudience',
        label: 'Target audience',
        prompt: 'Who needs to love this name? Be specific.',
        type: 'textarea',
        rows: 2,
        placeholder: `Who needs to love this name? e.g. 'SMB owners aged 35-55, non-technical, price-sensitive'`,
        hint: `Names communicate differently to different audiences. 'Catalyst' reads as credible to VCs but vague to main street consumers. 'QuickBite' works for a food delivery app but would embarrass an enterprise software buyer. Tell participants who the name needs to resonate with — and who it shouldn't alienate.`,
      },
      {
        id: 'geoScope',
        label: 'Geographic scope',
        prompt: 'Where will this brand live — local, national, or global?',
        type: 'chips',
        options: ['Local / Regional', 'National', 'Global / International', 'Not sure yet'],
        hint: `Geographic scope affects naming strategy significantly. Local names can use place references and community language. National names need to be culturally neutral across regions. Global names must work across languages — avoid sounds that mean something rude in major languages (like Chevy Nova, which means 'doesn't go' in Spanish).`,
      },
      {
        id: 'competitors',
        label: 'Competitor Names (list 3-5)',
        prompt: 'List 3–5 direct competitors — so participants know what NOT to sound like.',
        type: 'textarea',
        rows: 3,
        placeholder: 'e.g. Slack, Notion, Asana, Monday',
        hint: `This is the most important field. If all your competitors sound the same, you need to sound different. List 3-5 direct competitors. Participants will see these and know what NOT to sound like. Example: If you list Asana, Monday, ClickUp — all suggestive, all 2-syllable compounds — the smart move is to go abstract (like Notion did).`,
        guideId: 'b1-comp',
      },
    ],
  },

  // ── b2 · Product / Service Name ──
  b2: {
    label: 'Product / service',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'prodDesc',
        label: 'What does this product / service do?',
        prompt: 'What does it do, who is it for, and what is the core benefit in one sentence?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `What does it do? Who is it for? What's the core benefit in one sentence?`,
        hint: `Be specific about the problem it solves and who it's for. Example: 'A B2B SaaS tool that automates payroll for remote teams under 50 employees.' Participants need this to name it intelligently.`,
        guideId: 'b2-diff',
      },
      {
        id: 'parentBrand',
        label: 'Company / Brand name (the parent)',
        prompt: 'What is the parent brand or company this product sits under?',
        type: 'text',
        placeholder: 'e.g. Acme Corp, or leave blank if not yet named',
        hint: `The product name needs to work with your company name. Participants will design a name that fits — whether that's extending your brand (like Salesforce → Sales Cloud) or standing alone (like Apple → iPhone).`,
      },
      {
        id: 'architecture',
        label: 'Brand architecture preference',
        prompt: 'How should this product relate to the parent brand?',
        type: 'radioCards',
        options: [
          { id: 'branded-house', label: 'Branded House', sublabel: 'Google Maps, Google Docs, Google Meet' },
          { id: 'house-of-brands', label: 'House of Brands', sublabel: 'P&G, Unilever — each product standalone' },
          { id: 'endorsed', label: 'Endorsed Brand', sublabel: 'Marriott Courtyard — parent lends credibility' },
          { id: 'standalone', label: 'Standalone (not sure)', sublabel: 'Figure it out later' },
        ],
        hint: `Branded house (Google) = all products feel like extensions of the parent. House of brands (P&G) = each product is its own world. Endorsed brand = parent name lends credibility but product has its own identity. This affects whether the product name should reference your company at all.`,
        guideId: 'b2-arch',
      },
      {
        id: 'primaryUser',
        label: 'Who is the primary user?',
        prompt: 'Who actually uses this product day-to-day?',
        type: 'textarea',
        rows: 2,
        placeholder: 'e.g. HR managers at mid-market companies, developers building APIs, first-time homebuyers...',
        hint: `Product names land differently with different users. A product name for developers can be technical or playful (Zapier, Twilio). A product name for executives needs to sound credible and substantial (Salesforce Revenue Cloud). A consumer product name needs to feel simple and emotional. Tell participants who will actually use this.`,
        guideId: 'b2-sound',
      },
      {
        id: 'differentiator',
        label: 'Key differentiator — what makes it different?',
        prompt: 'What does your product do that others do not — and what feeling does that create?',
        type: 'textarea',
        rows: 2,
        placeholder: 'e.g. 10x faster than alternatives, the only tool that does X without Y, designed specifically for Z',
        hint: `The best product names reflect a core differentiator without describing it literally. 'Superhuman' (email client) communicates speed without saying 'fast email'. 'Calm' (meditation app) is the exact emotion the product creates. What's the one thing your product does that others don't — and what feeling does that create?`,
      },
      {
        id: 'competitors',
        label: 'Competitor product names (list 3-5)',
        prompt: 'Which competing products are out there?',
        type: 'textarea',
        rows: 3,
        placeholder: 'e.g. Stripe Billing, Chargebee, Paddle...',
        hint: `Product naming needs market differentiation just as much as company naming. If all your competitors have technical/descriptive names, an evocative name will stand out — and vice versa.`,
      },
    ],
  },

  // ── b3 · Project / Initiative Name ──
  b3: {
    label: 'Project / initiative',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projDesc',
        label: 'What is this project / initiative?',
        prompt: `Describe the project's goal, scope, and who it affects.`,
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `What is the project's goal? Who is involved? What changes when it succeeds?`,
        hint: `Describe the project's goal, scope, and who it affects. Great internal names capture the spirit of the work, not just the task. 'Project Heartbeat' for a customer retention initiative says something about the stakes.`,
        guideId: 'b3-momentum',
      },
      {
        id: 'projDuration',
        label: 'How long will this project run?',
        prompt: 'Roughly how long will this project run?',
        type: 'chips',
        options: ['<3 months', '3–12 months', '1–3 years', 'Ongoing / permanent'],
      },
      {
        id: 'projNameType',
        label: 'Name type preference',
        prompt: 'What kind of project name feels right?',
        type: 'radioCards',
        options: [
          { id: 'functional', label: 'Functional', sublabel: '"Migration 2025", "Customer Portal Rebuild"' },
          { id: 'inspirational', label: 'Inspirational', sublabel: '"Project Phoenix", "Operation Clarity"' },
          { id: 'codename', label: 'Codename / Abstract', sublabel: 'Random word — Everest, Sequoia, Saturn' },
          { id: 'any', label: `Any — I'll know it when I see it`, sublabel: '' },
        ],
        hint: `Functional names are clear but forgettable. Inspirational names build morale but can feel forced. Codenames/abstract names (like Google's internal project names) feel cool but need internal adoption. The right choice depends on how much the name needs to communicate outside the core team.`,
        guideId: 'b3-funcvsinsp',
      },
    ],
  },

  // ── b4 · Rebrand (uses b1 question set, scoped here for clarity) ──
  b4: {
    label: 'Rebrand',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'currentName',
        label: 'Current name',
        prompt: 'What is your current brand name?',
        type: 'text',
        required: true,
        placeholder: 'What is your current brand name?',
      },
      {
        id: 'rebrandReason',
        label: 'Why are you rebranding?',
        prompt: `What's prompting the rebrand — and what's changing about the business?`,
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: `What prompted this rebrand? What's changing about your business?`,
        guideId: 'b4-equity',
      },
      {
        id: 'companyDesc',
        label: 'What does your company do?',
        prompt: 'In 2–3 sentences, what does your company do today?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'Describe your company in 2-3 sentences...',
        hint: `Don't overthink this. You're not writing a mission statement. You're giving participants context. Example: 'We make project management software for remote teams' is perfect. Keep it to 2-3 sentences.`,
      },
      {
        id: 'namingStyle',
        label: 'Naming Style Preference',
        prompt: 'What kind of name fits the new brand?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Descriptive', sublabel: 'QuickBooks' },
          { id: 'suggestive', label: 'Suggestive', sublabel: 'Salesforce' },
          { id: 'abstract', label: 'Abstract', sublabel: 'Verizon' },
          { id: 'any', label: 'Not sure (any)', sublabel: 'Show me all' },
        ],
        guideId: 'b4-evolverev',
      },
      {
        id: 'targetAudience',
        label: 'Target audience',
        prompt: 'Who needs to love the new name?',
        type: 'textarea',
        rows: 2,
        placeholder: `Who needs to love this name? e.g. 'SMB owners aged 35-55, non-technical, price-sensitive'`,
      },
      {
        id: 'competitors',
        label: 'Competitor Names (list 3-5)',
        prompt: 'List 3–5 direct competitors.',
        type: 'textarea',
        rows: 3,
        placeholder: 'e.g. Slack, Notion, Asana, Monday',
      },
    ],
  },

  // ── b5 · Something else (business) — no legacy content, t6-style fallback ──
  b5: {
    label: 'Something else (business)',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'groupDesc',
        label: 'Describe what you are naming',
        prompt: `In a few sentences, describe what you're naming and what makes it unique.`,
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `What kind of thing is this? Who does it serve? What makes it unique?`,
        hint: `The more context participants have, the better the names. What does your group do? Who's in it? What makes you unique?`,
      },
      {
        id: 'vibe',
        label: 'Vibe / personality',
        prompt: 'What vibe should the name carry?',
        type: 'chips',
        options: ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'],
      },
      {
        id: 'history',
        label: 'Any shared history or inside references?',
        prompt: 'Any shared story, inside reference, or origin moment that could inspire a name?',
        type: 'text',
        required: false,
        placeholder: 'e.g. We all met at a conference in Berlin, our group chat is named after an inside joke...',
        hint: `Group names with personal meaning create stronger belonging. If there's a shared joke, a founding story, or a place that matters — share it. Participants who know the group well might suggest something that hits differently.`,
      },
    ],
  },

  // ── t1 · Sports team ──
  t1: {
    label: 'Sports team',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'sportLeague',
        label: 'Sport and league / competition',
        prompt: 'What sport, and what league or level do you play in?',
        type: 'text',
        required: true,
        placeholder: 'e.g. Competitive soccer, U14 travel league, AYSO Region 12...',
        hint: `The sport shapes the naming territory. Soccer teams trend geographic or fierce animal. Hockey teams trend weather/nature. Esports teams trend aggressive or meme-worthy. Share your sport so participants know the naming conventions to break or follow.`,
        guideId: 't1-anatomy',
      },
      {
        id: 'ageGroup',
        label: 'Age group / competitive level',
        prompt: 'Who plays on the team?',
        type: 'chips',
        options: ['Youth (under 14)', 'High School (14-18)', 'College / University', 'Adult Amateur', 'Semi-Pro / Pro'],
      },
      {
        id: 'personality',
        label: 'Team Personality',
        prompt: `What's the team's personality?`,
        type: 'chips',
        options: ['Intimidating', 'Pride-Based', 'Fun / Playful', 'Underdog / Gritty', 'Not sure'],
        hint: `Personality drives tone. An intimidating name (Predators, Raptors) sets a different expectation than a pride-based name (Golden State, Pride FC). A fun name works for youth teams but may feel weak at adult competitive level. Be honest about your team's culture.`,
        guideId: 't1-chant',
      },
      {
        id: 'namingDirection',
        label: 'Naming direction',
        prompt: 'Which naming direction should participants explore?',
        type: 'radioCards',
        options: [
          { id: 'animal-mascot', label: 'Animal / Mascot', sublabel: '"Lions", "Hawks", "Wolves"' },
          { id: 'force-of-nature', label: 'Force of Nature', sublabel: '"Thunder", "Blaze", "Surge"' },
          { id: 'place-geographic', label: 'Place / Geographic', sublabel: '"Lakeview", "Riverside", "Northern"' },
          { id: 'abstract-fierce', label: 'Abstract / Fierce', sublabel: '"Renegades", "Vanguard", "Apex"' },
          { id: 'any', label: 'No preference — show me everything', sublabel: '' },
        ],
        hint: `The Oklahoma City Thunder was chosen from 64,000 public submissions — it won because it's both geographic and a force of nature. The Seattle Kraken broke convention with a creature name. Tell participants which direction to explore — or let them surprise you.`,
      },
      {
        id: 'geography',
        label: 'Local connection / geography',
        prompt: 'Any city, region, or local landmark that should inspire the name?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'City, region, or local landmarks that could inspire the name...',
        hint: `Place names ground a team in community. If your team is from a specific city, neighborhood, or region — share it. Local landmarks, rivers, weather patterns, and regional history can all inspire names that feel native to where you play.`,
      },
      {
        id: 'chantable',
        label: 'Chantability — will fans chant it?',
        prompt: 'Will fans actually chant this name on game day?',
        type: 'chips',
        options: ['Yes — fans will chant it', 'Not important for us', 'Not sure'],
        hint: `A chantable name changes the game-day experience. 'Let's go Thunder!' works because 'Thunder' is punchy and single-syllable. 'Let's go Riverside Athletic United!' doesn't chant. If this name will be chanted, it needs to be 1-2 syllables and end with energy.`,
      },
      {
        id: 'teamColors',
        label: 'Team colors',
        prompt: `What are your team colors?`,
        type: 'text',
        required: false,
        placeholder: 'e.g. Navy and gold, all black, red and white',
      },
    ],
  },

  // ── t2 · Band / music ──
  t2: {
    label: 'Band / music project',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'genre',
        label: 'Genre / Sound',
        prompt: `What's your genre and sound?`,
        type: 'text',
        required: true,
        placeholder: 'e.g. Indie rock, hip-hop, classical, electronic...',
        hint: `Genre shapes the name archetype. Metal names trend aggressive (Slayer, Pantera, Megadeth). Indie names trend literary/abstract (Fleet Foxes, Beach House, Bon Iver). Pop names trend catchy and pronounceable. Share the genre so participants know the naming territory.`,
      },
      {
        id: 'originStory',
        label: 'Band origin story',
        prompt: `How did the band form? Any inside references or stories worth naming around?`,
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'How did the band form? Any meaningful context, inside references, or stories that could inspire a name?',
        hint: `Fans always ask 'How did you get your name?' A name with a great story is a permanent conversation starter. Lynyrd Skynyrd = named after a gym teacher. Radiohead = from a Talking Heads song. Foo Fighters = Dave Grohl's WWII UFO reference. Share the origin context so participants can suggest something with meaning.`,
        guideId: 't2-firstsong',
      },
      {
        id: 'nameStyle',
        label: 'Name archetype preference',
        prompt: 'Which archetype fits your project?',
        type: 'radioCards',
        options: [
          { id: 'absurdist', label: 'Absurdist / Provocative', sublabel: 'Arctic Monkeys, Vampire Weekend' },
          { id: 'evocative', label: 'Evocative / Poetic', sublabel: 'The National, Fleet Foxes' },
          { id: 'personal', label: 'Personal / Story-based', sublabel: 'Dave Matthews Band, Lynyrd Skynyrd' },
          { id: 'any', label: 'Any', sublabel: '' },
        ],
        hint: `Three archetypes dominate great band names. Absurdist/Provocative (Arctic Monkeys, Vampire Weekend, Panic! at the Disco) — memorable for their strangeness. Evocative/Poetic (The National, Fleet Foxes, Portishead) — mood-first, feels like the music. Personal/Story-based (Dave Matthews Band, Lynyrd Skynyrd) — built around identity or lore. Pick one to guide submissions.`,
        guideId: 't2-archetypes',
      },
      {
        id: 'nameType',
        label: 'Stage name or legal name?',
        prompt: 'Is this a stage name or the legal band name for contracts and licensing?',
        type: 'chips',
        options: ['Stage name (creative freedom)', 'Legal name (needs trademark-ability)', 'Both same name'],
        hint: `If this is the legal band name for contracts, merch, and licensing — it needs to be distinctive enough to trademark and simple enough for legal docs. If it's a stage name only, you have more creative freedom. Some bands use a simplified version legally (The Artist Formerly Known As Prince → Prince legally).`,
      },
      {
        id: 'searchability',
        label: 'Google / searchability test',
        prompt: 'How searchable does the name need to be?',
        type: 'chips',
        options: ['Highly distinctive / searchable', 'Okay with some ambiguity', `Don't mind`],
        hint: `In the streaming era, a band name that's searchable without 10,000 false positives is a real competitive advantage. 'The The', 'Girls', and '!!!' are famously unsearchable. 'Foo Fighters' returns exactly what you want. Tell participants: do you want a highly distinctive, searchable name, or are you okay with something more common?`,
      },
    ],
  },

  // ── t3 · Podcast / Channel ──
  t3: {
    label: 'Podcast / channel',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'showDesc',
        label: 'What is your show about?',
        prompt: `What is the show about, and who is it for?`,
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `Describe the show's topic, angle, and target audience in 2-3 sentences...`,
        hint: `Be specific. 'Tech' is too broad. 'How solo founders build profitable SaaS businesses in under 12 months' is clear. Participants need to understand your show's topic to name it well.`,
        guideId: 't3-discovery',
      },
      {
        id: 'platform',
        label: 'Primary Platform',
        prompt: 'Where does the show live?',
        type: 'chips',
        options: ['Spotify / Apple Podcasts', 'YouTube', 'Twitch', 'Both Podcast + Video', 'Other'],
      },
      {
        id: 'tone',
        label: 'Tone / Format',
        prompt: `What's the show's tone and format?`,
        type: 'chips',
        options: ['Educational / Informative', 'Storytelling / Narrative', 'Interview-based', 'Comedy / Entertainment', 'News & Commentary', 'Any'],
        hint: `Tone affects the name hugely. A comedy podcast can be absurdist. An educational show needs clarity. An interview show might lean on the host's personality. Share the tone so participants name appropriately.`,
        guideId: 't3-algorithm',
      },
      {
        id: 'compShows',
        label: 'Existing shows you admire (name style reference)',
        prompt: 'Which existing shows do you admire — for naming inspiration?',
        type: 'text',
        required: false,
        placeholder: 'e.g. How I Built This, Lex Fridman, Hidden Brain...',
        hint: `Like competitor names for brands, comparable show names tell participants what naming territory is taken and what style resonates with you. e.g. 'I love how How I Built This is clear, but want something with more personality like Radiolab.'`,
      },
    ],
  },

  // ── t4 · Civic / School / Nonprofit ──
  t4: {
    label: 'Civic / school / nonprofit',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'orgType',
        label: 'Organization type',
        prompt: 'What kind of organization is this?',
        type: 'chips',
        options: ['School or PTA', 'Neighborhood Association', 'Nonprofit / Charity', 'Civic Group', 'Club or Society', 'Other'],
      },
      {
        id: 'mission',
        label: 'Mission / Purpose',
        prompt: `What's the mission — who does it serve and what change does it create?`,
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `What is this organization's mission? Who does it serve? What change does it create?`,
        hint: `Civic names need to communicate purpose instantly. Describe your mission in 1-2 sentences. The best civic names are either crystal-clear (Habitat for Humanity) or deeply aspirational (Doctors Without Borders). Tell participants which direction to go.`,
        guideId: 't4-community',
      },
      {
        id: 'community',
        label: 'Community served',
        prompt: 'Who do you serve, and where?',
        type: 'text',
        placeholder: 'e.g. Families in the Oak Park district, youth ages 12-18, local small businesses...',
        hint: `Is this local (a specific neighborhood), regional, or aspiring to be national? Geographic scope affects whether a location should be in the name. 'Riverside Community Garden' works locally but limits future expansion.`,
      },
      {
        id: 'acronymPref',
        label: 'Acronym test — will people use initials?',
        prompt: 'Will people refer to your org by its initials?',
        type: 'chips',
        options: ['Full name (no acronym expected)', 'Acronym likely (initials matter)', 'Not sure'],
        hint: `Some civic names are universally known by acronym: ACLU, YMCA, NAACP. If your organization will likely be shortened to initials, participants should know — so they can suggest names where the acronym is also strong. Ask yourself: will people say the full name or the letters?`,
      },
      {
        id: 'longevity',
        label: 'Longevity aspiration',
        prompt: 'How long should this name be built to last?',
        type: 'chips',
        options: ['5-10 years', '10-25 years', '25+ years / permanent'],
        hint: `Community organizations often outlast their founders. A name should work for 50+ years. Avoid trend-driven language, technology references, or anything that feels 'of this moment.' Participants should know: is this meant to be timeless?`,
        guideId: 't4-longevity',
      },
    ],
  },

  // ── t5 · Gaming group ──
  t5: {
    label: 'Gaming group',
    suggestedDeadlineDays: 5,
    questions: [
      {
        id: 'games',
        label: 'Games you play',
        prompt: 'Which games do you play together?',
        type: 'text',
        required: true,
        placeholder: 'e.g. Valorant, League of Legends, Minecraft, Fortnite...',
        hint: `Different games have different naming cultures. Valorant and CS:GO teams trend aggressive/short. Minecraft communities trend playful/creative. League of Legends teams often use mythological or nature references. Share your games so participants can name within that culture.`,
        guideId: 't5-psychology',
      },
      {
        id: 'competitiveLevel',
        label: 'Competitive or casual?',
        prompt: 'Are you competing, hanging out, or both?',
        type: 'chips',
        options: ['Tournament / Competitive', 'Casual / Social', 'Both — we do both'],
        hint: `Competitive teams need names that convey threat. Casual groups can lean into personality and in-jokes. A name like 'Ctrl+Alt+Delete' works for a casual squad but wouldn't intimidate at a tournament.`,
      },
      {
        id: 'vibe',
        label: 'Vibe',
        prompt: `What's the squad vibe?`,
        type: 'chips',
        options: ['Intimidating / Feared', 'Meme-worthy / Ironic', 'Clean / Professional', 'Fun / Casual'],
      },
      {
        id: 'platform',
        label: 'Primary platform',
        prompt: 'What platform do you mainly play on?',
        type: 'chips',
        options: ['PC / Desktop', 'Console (PS/Xbox)', 'Mobile', 'Multi-platform'],
      },
      {
        id: 'tagStyle',
        label: 'Clan tag / team name structure',
        prompt: 'How should the name be structured for tournaments and tags?',
        type: 'radioCards',
        options: [
          { id: 'prefix', label: 'Prefix style', sublabel: '"Team X", "FaZe X", "Cloud9 X"' },
          { id: 'single-word', label: 'Single word / No tag', sublabel: '"Liquid", "Sentinels", "NaVi"' },
          { id: 'clan-suffix', label: 'Clan suffix', sublabel: '"X Gaming", "X Esports", "X GG"' },
          { id: 'any', label: 'No preference', sublabel: '' },
        ],
        hint: `Esports teams are often known by tag (FaZe) or full name (FaZe Clan). Some teams use 'Gaming' or 'Esports' as a suffix when entering tournaments. Tell participants what structure you want — especially if the tag (3-5 letters shown in-game) matters.`,
        guideId: 't5-tag',
      },
      {
        id: 'crewHistory',
        label: 'Any inside references or crew history?',
        prompt: 'Any inside jokes, shared history, or crew origin stories?',
        type: 'text',
        required: false,
        placeholder: 'e.g. We all went to the same school, our squad name started as a joke...',
      },
    ],
  },

  // ── t6 · Other team / group ──
  t6: {
    label: 'Other team / group',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'groupDesc',
        label: 'Describe your group',
        prompt: 'What kind of group is this, and what do you do together?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'What kind of group is this? What do you do together? What makes your group unique?',
        hint: `The more context participants have, the better the names. What does your group do? Who's in it? What makes you unique?`,
        guideId: 't6-identity',
      },
      {
        id: 'vibe',
        label: 'Group vibe / personality',
        prompt: `What's the group's vibe?`,
        type: 'chips',
        options: ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'],
      },
      {
        id: 'history',
        label: 'Any shared history or inside references?',
        prompt: 'Any shared story, inside reference, or place that means something to the group?',
        type: 'text',
        required: false,
        placeholder: 'e.g. We all met at a conference in Berlin, our group chat is named after an inside joke...',
        hint: `Group names with personal meaning create stronger belonging. If there's a shared joke, a founding story, or a place that matters — share it. Participants who know the group well might suggest something that hits differently.`,
        guideId: 't6-future',
      },
    ],
  },

  // ── p1 · Baby name ──
  p1: {
    label: 'Baby name',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'dueDate',
        label: 'When is your baby due?',
        prompt: 'When is your baby due? (Or already born — pop in their birthday.)',
        type: 'date',
        required: false,
        hint: `If already born, enter birth date — we'll generate a 'Welcome to the world' certificate with the actual birth date.`,
      },
      {
        id: 'gender',
        label: 'Do you know the gender?',
        prompt: 'Do you know the gender — or is it a surprise?',
        type: 'chips',
        options: ['Boy', 'Girl', 'Surprise', 'Prefer not to say'],
        hint: `If surprise, people can suggest both boy and girl names. You pick after baby arrives. We'll keep all submissions organized.`,
      },
      {
        id: 'lastName',
        label: 'Last name (optional — helps test name flow)',
        prompt: 'What last name will the first name pair with?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Johnson, Park, Martinez (your last name)',
        hint: `Testing 'Emma Chen' vs 'Emma Rodriguez' vs 'Emma O'Brien' changes what works. A long last name pairs better with a short first name. A short last name can support something longer. Sharing this helps participants think about the full name.`,
      },
      {
        id: 'heritage',
        label: 'Cultural or heritage context',
        prompt: 'Any cultural or heritage context the name should honor — or work across?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Irish and Japanese heritage, prefer names that work in both cultures',
        hint: `Names carry cultural weight. Sharing heritage helps participants suggest names that honor your roots — or names that work across cultures if that's important to you. It also helps avoid names that mean something unfortunate in languages you're connected to.`,
        guideId: 'p1-science',
      },
      {
        id: 'lengthPref',
        label: 'Name length preference',
        prompt: 'Short and punchy, or longer and formal?',
        type: 'chips',
        options: ['Short (1-2 syllables)', 'Medium (2-3 syllables)', 'Long / Formal (3+ syllables)', 'No preference'],
        hint: `Short names (Ava, Max, Zoe) are easy to say and remember — great call names. Longer formal names (Alexander, Genevieve) have more nicknames built in. Think about what they'll be called at school, at work, and at 70.`,
        guideId: 'p1-lifetime',
      },
      {
        id: 'nicknamePreference',
        label: 'Nickname-friendly?',
        prompt: 'Do you want a name with a built-in nickname, or one used in full?',
        type: 'chips',
        options: ['Yes — should have a natural nickname', 'No — use the full name only', 'Flexible either way'],
        hint: `Some parents want only the full name used (no 'Rob' for Robert, no 'Liz' for Elizabeth). Others want a formal name with a built-in nickname. A few want something that can't be shortened. This shapes which names participants should suggest.`,
      },
      {
        id: 'avoidInitials',
        label: 'Initials to avoid',
        prompt: 'Any initial combinations to avoid?',
        type: 'text',
        required: false,
        placeholder: `e.g. Avoid initials 'E.D.' or anything that spells something unfortunate`,
        hint: `The initials test. 'ASS', 'DIE', 'FAT' — people have been caught off guard. Participants who know the last name can avoid unfortunate combinations. Share if there are initial sequences to avoid.`,
      },
      {
        id: 'traditions',
        label: 'Family naming traditions',
        prompt: 'Any family naming traditions to honor?',
        type: 'text',
        required: false,
        placeholder: `e.g. First child always has the father's name as middle name, names starting with 'M' for tradition...`,
      },
      {
        id: 'avoidNames',
        label: 'Any names to avoid?',
        prompt: 'Any names you want to keep off the table? (We keep these private.)',
        type: 'text',
        required: false,
        placeholder: `Ex: No names starting with K (too many cousins already), no 'Jennifer'`,
        hint: `Family names that didn't work out? Names of exes? We won't show these to voters — they stay private between you and the platform.`,
      },
    ],
  },

  // ── p2 · Pet name ──
  p2: {
    label: 'Pet name',
    suggestedDeadlineDays: 5,
    questions: [
      {
        id: 'petType',
        label: 'What kind of pet?',
        prompt: `What kind of pet are you naming?`,
        type: 'chips',
        options: ['Dog', 'Cat', 'Bird', 'Reptile', 'Rabbit / Small Animal', 'Fish / Aquatic', 'Other'],
        required: true,
      },
      {
        id: 'breed',
        label: 'Breed or description',
        prompt: 'What breed or what do they look like?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Golden Retriever, orange tabby, blue-eyed Husky, tiny black guinea pig...',
        hint: `Breed shapes the name archetype. A Chihuahua named 'Bruno' is funny. A Great Dane named 'Peanut' is funnier. A Siamese cat named 'Miso' fits perfectly. Participants who know the breed or look can suggest names that match the vibe.`,
        guideId: 'p2-personality',
      },
      {
        id: 'petPersonality',
        label: 'Describe their personality',
        prompt: `Describe their personality in a sentence or two.`,
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: `'Chaotic gremlin energy' or 'Regal and aloof' or 'Timid but playful once comfortable'`,
        hint: `The name should fit the animal. 'Chaos' works for a hyperactive dog. 'Professor' works for a dignified cat. Share what you've noticed — their quirks, habits, or early personality signals — and let participants match the name to the animal.`,
      },
      {
        id: 'callNamePref',
        label: 'Call name preference',
        prompt: 'How short does the call name need to be?',
        type: 'chips',
        options: ['Short call name (1-2 syllables)', 'Medium (2-3 syllables)', 'Longer / regal name', 'No preference'],
        hint: `The call name principle: dogs especially respond best to names ending in a vowel sound (Bella, Benny, Luna) because they're acoustically distinct. Short names are easier to shout across a park. Longer names work when you mostly use them at home.`,
      },
      {
        id: 'nameTone',
        label: 'Tone / naming style',
        prompt: 'What naming tone fits them?',
        type: 'chips',
        options: ['Dignified / Regal', 'Playful / Funny', 'Cute / Sweet', 'Tough / Strong', 'No preference'],
        guideId: 'p2-callname',
      },
      {
        id: 'avoidNames',
        label: 'Any names to avoid?',
        prompt: 'Any names already taken or off-limits?',
        type: 'text',
        required: false,
        placeholder: `Names already taken by other pets, names that sound like 'no', etc.`,
      },
    ],
  },

  // ── p3 · Home / Property / Fun ──
  p3: {
    label: 'Home / property / fun',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'namingTarget',
        label: 'What are you naming?',
        prompt: 'What are you naming?',
        type: 'chips',
        options: ['House / Home', 'Vacation Home / Cabin', 'Boat / Watercraft', 'Car / Vehicle', 'Camper / RV', 'Room / Space', 'Other'],
        required: true,
      },
      {
        id: 'propDesc',
        label: 'Tell people about it',
        prompt: 'Tell people about it — what makes it special?',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 1920s craftsman bungalow with a big porch, always full of people on summer evenings...',
        hint: `A little context sparks better names. Is there something unique about this place or thing? A quirk, a story, a feeling? Research shows named spaces are used more, cared for more, and remembered more fondly — the name you pick will become part of the story you tell about this place.`,
        guideId: 'p3-places',
      },
      {
        id: 'location',
        label: 'Location / environment',
        prompt: 'Where is it, or what surrounds it?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Pacific Northwest lakefront, New England colonial, urban brownstone in Brooklyn...',
        hint: `Local geography, nature, or architectural style can inspire names that feel native to the place. A cabin in the Adirondacks has different naming territory than a beach house in the Florida Keys. Share where it is — or what's around it.`,
      },
      {
        id: 'vibe',
        label: 'Vibe / personality',
        prompt: `What's the place's vibe?`,
        type: 'chips',
        options: ['Cozy / Warm', 'Adventurous / Outdoorsy', 'Elegant / Sophisticated', 'Funny / Playful', 'Nautical / Sea-themed', 'Not sure'],
      },
      {
        id: 'signDisplay',
        label: 'Will the name appear on a sign or plaque?',
        prompt: 'Will the name end up on a sign, plaque, or hull?',
        type: 'chips',
        options: ['Yes — will be on a sign/plaque', 'Just for us, informal use', 'Not decided yet'],
        hint: `Names that will be engraved or displayed need to look good in print — not just sound good spoken. Short, elegant names work best on plaques. Boats in particular display their name on the hull, which means it needs to look right at a distance and read well in a serif or display font.`,
        guideId: 'p3-stick',
      },
      {
        id: 'languagePref',
        label: 'Language preference',
        prompt: 'English only, or open to other languages?',
        type: 'chips',
        options: ['English only', 'Open to other languages', 'Specific language (describe below)'],
      },
      {
        id: 'avoidNames',
        label: 'Names or words to avoid',
        prompt: 'Any words or names that should be off the table?',
        type: 'text',
        required: false,
        placeholder: `e.g. Nothing too generic, avoid 'haven' or 'hideaway' — too overused`,
      },
    ],
  },

  // ── p4 · Other personal — no legacy content, t6-style fallback ──
  p4: {
    label: 'Something else (personal)',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'groupDesc',
        label: 'Describe what you are naming',
        prompt: `In a few sentences, tell people what you're naming and what makes it special.`,
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: `What is this? Who is it for? What makes it special?`,
        hint: `The more context participants have, the better the names.`,
        guideId: 'p4-generic',
      },
      {
        id: 'vibe',
        label: 'Vibe / personality',
        prompt: 'What vibe should the name carry?',
        type: 'chips',
        options: ['Cozy / Warm', 'Elegant / Sophisticated', 'Funny / Playful', 'Aspirational', 'Not sure'],
      },
      {
        id: 'history',
        label: 'Any shared story or context?',
        prompt: 'Any shared story or moment worth naming around?',
        type: 'text',
        required: false,
        placeholder: 'Any context, inside reference, or origin story that could inspire a name...',
        guideId: 'p4-collective',
      },
    ],
  },
};

// ────────────────────────────────────────────────────────────────
// 2. SHARED_SETTINGS_QUESTIONS — appended to every brief
// ────────────────────────────────────────────────────────────────
export const SHARED_SETTINGS_QUESTIONS = [
  {
    id: 'anonymous',
    type: 'toggle',
    label: 'Anonymous submissions?',
    prompt: 'Should submissions be anonymous?',
    defaultValue: true,
    hint: `We recommend anonymous for one simple reason: it removes bias. When people don't know who suggested what, they judge ideas on merit, not relationships. In our data, anonymous contests have 23% higher satisfaction with final results. The exception? If your team is small (<5 people) and wants attribution for morale, turn this off. Stat: 78% of contests use anonymous mode.`,
  },
  {
    id: 'submissionLimit',
    type: 'numberChips',
    options: [1, 2, 3, 5, 10, 'Unlimited'],
    defaultValue: 3,
    label: 'Submissions per person',
    prompt: 'How many names can each person submit?',
    hint: `Sweet spot: 3-5 names per person. Here's why: 1 name = overthinking. Unlimited = quality drops after the first few. 3-5 = people submit their best ideas without overthinking or spamming. Data: Contests with 3-5 limit have 31% more 'quality badge' submissions. Recommended: 3 for small teams (<10), 5 for larger groups.`,
  },
  {
    id: 'votingMethod',
    type: 'radioCards',
    defaultValue: 'multicriteria',
    options: [
      { id: 'simple', label: 'Simple poll', sublabel: 'Fast and familiar' },
      { id: 'ranked', label: 'Ranked choice', sublabel: 'Shows true consensus' },
      { id: 'multicriteria', label: 'Multi-criteria', sublabel: 'Score on 5 dimensions', recommended: true },
      { id: 'pairwise', label: 'Pairwise', sublabel: 'Head-to-head matchups' },
      { id: 'weighted', label: 'Weighted', sublabel: 'Some votes count more' },
    ],
    label: 'Voting method',
    prompt: 'How should votes work?',
    hint: `Simple Poll: Fast and familiar. Ranked Choice: Shows true consensus. Multi-Criteria: Most rigorous — score on 5 dimensions. Pairwise: Head-to-head matchups. Weighted: Assign different vote weights to key stakeholders (e.g. founder's vote counts 3x).`,
    conditionalQuestions: {
      weighted: [
        {
          id: 'weightedVoters',
          type: 'repeater',
          label: 'Weighted Voters',
          prompt: 'Add people whose votes should count more. Default weight is 1x for everyone else.',
          itemFields: [
            { id: 'email', type: 'email', placeholder: 'Email address' },
            { id: 'weight', type: 'select', options: [2, 3, 4, 5], suffix: 'x weight', defaultValue: 2 },
          ],
          minItems: 1,
          addLabel: '+ Add voter',
        },
      ],
    },
  },
  {
    id: 'customRequirements',
    type: 'toggleTextarea',
    defaultValue: false,
    label: 'Custom requirements',
    prompt: 'Anything else participants should know?',
    placeholder: `e.g. Must work as a .com domain, should not start with 'X', needs to sound good in Spanish...`,
    hint: `Use this to capture requirements unique to your situation — domain preferences, phonetic constraints, cultural considerations, or anything else participants should know.`,
  },
  {
    id: 'branding',
    type: 'brandingBlock',
    defaultValue: false,
    label: 'Custom branding',
    prompt: 'Want your logo and colors on reports?',
    hint: `Your logo and colors will appear on PDF reports and white-label output. For best results, upload a transparent PNG logo under 1MB.`,
  },
  {
    id: 'submitterPrize',
    type: 'toggleNameDesc',
    defaultValue: false,
    hideWhen: { contestType: 'voting_only' },
    label: 'Submitter prize',
    prompt: 'Prize for the winning submitter?',
    description: 'Reward the person who submitted the winning name',
    namePlaceholder: 'Prize name (e.g. $50 Gift Card)',
    descPlaceholder: 'Prize description (optional)',
    hint: `Prizes increase participation by up to 40%. Even small rewards like gift cards or recognition boost engagement significantly. Voter prizes encourage everyone to vote, not just submit.`,
  },
  {
    id: 'voterPrize',
    type: 'toggleNameDesc',
    defaultValue: false,
    label: 'Voter prize',
    prompt: 'Prize for voters too?',
    description: 'Award a random voter to encourage participation',
    namePlaceholder: 'Prize name (e.g. Free Coffee Voucher)',
    descPlaceholder: 'Prize description (optional)',
    hint: `Prizes increase participation by up to 40%. Even small rewards like gift cards or recognition boost engagement significantly. Voter prizes encourage everyone to vote, not just submit.`,
  },
  {
    id: 'transitionMode',
    type: 'radioCards',
    defaultValue: 'manual',
    options: [
      { id: 'manual', label: 'Manual review', sublabel: 'You start each phase' },
      { id: 'automatic', label: 'Automatic', sublabel: 'Phases advance on schedule' },
    ],
    label: 'Phase transitions',
    prompt: 'How should phase transitions work?',
    hint: '',
  },
  {
    id: 'votingDays',
    type: 'numberChips',
    options: [2, 3, 5, 7, 10],
    defaultValue: 5,
    label: 'Voting duration',
    prompt: 'How long should voting last?',
    hint: `Recommended timeline: 5-7 days for submissions, then 3-4 days for voting. Total: 8-11 days. Launch on Monday. Close submissions Friday. Open voting Monday. Close voting Thursday. Publish results Friday. Stat: 8-11 day contests have 76% avg participation vs 54% for <5 days.`,
  },
];

// ────────────────────────────────────────────────────────────────
// 3. ARTICLES — long-form CREATOR_ARTICLES content per sub-segment
//    (strict per-sub-segment scoping — never reused cross-tier)
// ────────────────────────────────────────────────────────────────
export const ARTICLES = {
  // ── b1 · Company / startup ──
  b1: [
    {
      id: 'b1-arc',
      title: 'The 5 Name Archetypes — and Which One Wins',
      readTime: '3 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Not all names are created equal',
          body: 'Every company name fits one of five archetypes: Descriptive, Suggestive, Abstract/Coined, Real-word repurposed, or Founder/Acronym. Each has tradeoffs. Understanding them is the difference between a name that constrains you at Series B and one that grows with you to IPO.',
        },
        {
          heading: 'Descriptive names (QuickBooks, PayPal)',
          body: `They tell you what they do. Good for early traction, SEO, zero ambiguity. Bad for future pivots, trademark protection, and global expansion. Rule of thumb: if you're 100% confident in your category and positioning for the next 10 years, descriptive can work. If not, think twice.`,
        },
        {
          heading: 'Suggestive names (Salesforce, Shopify, Slack)',
          body: `They hint at the benefit without stating it literally. Most Fortune 500 tech companies live here. Why? Trademarkable + memorable + flexible as the business evolves. 'Salesforce' became a CRM AND a marketing platform AND an AI company without the name fighting back.`,
        },
        {
          heading: 'Abstract/Coined names (Google, Xerox, Verizon)',
          body: 'Meaningless until you make them mean something. Hardest to launch, strongest moat once established. These require the most marketing investment but provide the deepest long-term competitive advantage — no one can accidentally use your name in a sentence.',
        },
      ],
      callout: {
        type: 'example',
        text: `Slack started as a gaming company's internal tool. A descriptive name like 'TeamChat' would have fought the pivot to enterprise. An abstract name gave them a clean surface to project any meaning onto.`,
      },
    },
    {
      id: 'b1-comp',
      title: 'Why Competitor Names Are Your Most Important Research',
      readTime: '2 min',
      icon: 'MagnifyingGlass',
      sections: [
        {
          heading: 'The differentiation principle',
          body: 'If five of your competitors have two-syllable, suggestive names — do not be the sixth. Research on brand recall is clear: names that do not fit the category pattern are remembered 47% more often than names that blend in. The competitor field in your brief is the highest-leverage field you will fill out.',
        },
        {
          heading: 'What to look for',
          body: `List 5 competitors and analyze: What archetype? What length? What tone (serious, playful, technical)? Where there's density — that's exactly where your name should not be.`,
        },
        {
          heading: 'The pattern break wins',
          body: 'When HubSpot launched, every CRM was descriptive or founder-named. HubSpot was a compound abstract — stood alone immediately. When Notion launched against Evernote, Confluence, OneNote — they chose a single abstract word. They owned that positioning.',
        },
      ],
      callout: {
        type: 'insight',
        text: `The sweet spot: sounds like it belongs in your category, but doesn't sound like anyone already there.`,
      },
    },
    {
      id: 'b1-brief',
      title: 'The Briefing Paradox: More Context = Better Names',
      readTime: '2 min',
      icon: 'ListChecks',
      sections: [
        {
          heading: 'The most common organizer mistake',
          body: `Most organizers share too little context, afraid of 'leading' participants. This is backwards. The more specific context you give, the more creative and on-target submissions become. Vague brief → creative anxiety → generic submissions. 'Make us something catchy' is not a brief.`,
        },
        {
          heading: 'What participants actually need',
          body: `They need: What you do (2-3 sentences), who it's for (specific, not "everyone"), what the name should signal (your tone/archetype preference), what the competition looks like (so they can differentiate), and what to avoid (saves everyone time).`,
        },
      ],
      callout: {
        type: 'warning',
        text: `Warning: 'I'll know the right name when I see it' is not a brief. That's a wish. Great briefs define success criteria before the contest starts — so participants aim at a defined target, not a moving one.`,
      },
    },
  ],

  // ── b2 · Product / service ──
  b2: [
    {
      id: 'b2-arch',
      title: 'Brand Architecture: Decide This Before Naming Anything',
      readTime: '2 min',
      icon: 'Compass',
      sections: [
        {
          heading: 'The decision that shapes everything',
          body: 'Before you name a product, decide: will this product extend your company brand, or live independently? This is brand architecture. Get it wrong and the product name will fight the company name rather than amplifying it.',
        },
        {
          heading: 'Three models',
          body: `Branded House (Google, Apple): every product extends the master brand. House of Brands (P&G, Unilever): each product is standalone — consumers don't know the parent. Endorsed Brand (Marriott Courtyard): parent lends credibility, product has distinct identity.`,
        },
        {
          heading: 'Which model is right?',
          body: `Branded house works when the parent brand is strong and consistent. House of brands works when products serve radically different markets. Tell participants which model you're using — it completely changes what 'good' looks like for a submission.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Salesforce chose branded house → Sales Cloud, Service Cloud, Marketing Cloud. Every product extends the master. Consistent, scalable — but every product must feel 'salesforce-y.' Choose your architecture before you brief.`,
      },
    },
    {
      id: 'b2-diff',
      title: 'Product Names Live in a Different Ecosystem',
      readTime: '2 min',
      icon: 'Target',
      sections: [
        {
          heading: 'Why product naming is harder',
          body: `Company names compete in a broad landscape. Product names must work in context: alongside your company name, your other products, competitors' products, and in specific usage contexts (app store, sales deck, support ticket). Each context adds pressure the company name never faces.`,
        },
        {
          heading: 'The precision requirement',
          body: `A new product name often has to work on first contact — in a headline, a demo, a pitch. If it doesn't land in 3 seconds, it's working against your sales team, not for them. Precision matters more in product naming than in company naming.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The best product name has a 'job.' AirPods = air (wireless, invisible) + pods (small, self-contained). Clear benefit, suggests the experience, in two syllables. Know the job before you name.`,
      },
    },
    {
      id: 'b2-sound',
      title: 'The Sound of Your Product: Phonetics That Match the Experience',
      readTime: '2 min',
      icon: 'MusicNote',
      sections: [
        {
          heading: 'Sound carries meaning before the dictionary does',
          body: `Hard consonants (K, T, B, P) signal speed, strength, and precision. Soft sounds (L, M, S, vowel-heavy names) signal ease, warmth, and approachability. 'Crisp' feels sharper than 'Smooth.' Neither is wrong — but the phonetic profile of your product name creates subconscious expectations before a customer reads a single word of copy.`,
        },
        {
          heading: 'Onomatopoeia is an underused weapon',
          body: `Names that sound like the experience they deliver are processed faster and remembered longer. 'Zip' for a file compressor. 'Glide' for a presentation tool. 'Snap' for anything instant. The product name that sounds like its core benefit is doing double marketing duty every time someone says it aloud.`,
        },
        {
          heading: 'Apply this to your brief',
          body: `Think about how your product feels to use — fast, calm, precise, expansive, warm? Write that adjective down before you brief. Tell participants the emotional experience the name should evoke. Sound design in naming is invisible when done right and glaring when wrong.`,
        },
      ],
      callout: {
        type: 'example',
        text: `'Zoom' — short, explosive, onomatopoeic. You feel the speed before you know it's a video tool. Compare to 'WebEx' — technical, hyphenated, sounds like IT infrastructure. Same category, completely different phonetic signal.`,
      },
    },
  ],

  // ── b3 · Project / initiative ──
  b3: [
    {
      id: 'b3-momentum',
      title: 'Generic Project Names Kill Momentum',
      readTime: '2 min',
      icon: 'Lightning',
      sections: [
        {
          heading: `What's in a project name?`,
          body: 'More than you think. Research shows named projects achieve their objectives 34% more often than unnamed or numbered ones. A great project name creates shared mental model, motivates ownership, and makes status updates feel like progress rather than reporting.',
        },
        {
          heading: '"Project Phoenix" has been done to death',
          body: 'Phoenix, Titan, Horizon, Compass, Catalyst — these are the cargo shorts of project naming. They signal nothing, commit to nothing. The most effective project names are: (a) crystal-clear about the goal, or (b) so specific to your culture that outsiders wouldn\'t get it but insiders feel it.',
        },
      ],
      callout: {
        type: 'example',
        text: `Google's 'Project Loon' (internet balloons) captured both the literal mechanism and the audacious feeling of the work. The name became a cultural touchstone inside and outside the company.`,
      },
    },
    {
      id: 'b3-funcvsinsp',
      title: 'Functional vs Inspirational: Two Cultures',
      readTime: '2 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'Functional names',
          body: '"Customer Portal Migration," "Q4 Data Architecture Upgrade." Pros: zero ambiguity, perfect for regulatory contexts. Cons: generates no energy, no ownership, no pride. People report the work but do not own the vision.',
        },
        {
          heading: 'Inspirational names',
          body: '"Project Catalyst," "Operation Clarity," "Mission Backbone." Research shows team members with project names they are proud of work 18% more hours and report 31% higher satisfaction with outcomes. Best for transformation and culture-change projects.',
        },
      ],
      callout: {
        type: 'insight',
        text: 'Research verdict: for culture-change or transformation projects, inspirational names outperform. For technical migrations or compliance work, functional wins. Know which you are running before you brief.',
      },
    },
  ],

  // ── b4 · Rebrand ──
  b4: [
    {
      id: 'b4-equity',
      title: 'What Is Your Brand Equity Actually Worth?',
      readTime: '3 min',
      icon: 'Tree',
      sections: [
        {
          heading: 'Brand equity is real money',
          body: `Before rebranding, answer honestly: what does the current name mean to customers? Not what you wish it meant — what does it actually mean? Brand equity is the sum of all associations, memories, and expectations your name triggers. Some is valuable. Some is what you're trying to escape.`,
        },
        {
          heading: 'What to preserve',
          body: `Mastercard evolved from 'MasterCard' — they kept the name, the red circle, the two-hemisphere concept because the equity was enormous. Before you start this contest: identify specifically what about the current name or brand is worth preserving. This becomes a constraint for participants.`,
        },
        {
          heading: 'What to escape',
          body: 'Philip Morris → Altria (after tobacco litigation). Facebook → Meta (after regulatory pressure). If the existing name has become a liability, the new name needs to create distance while preserving underlying trust. Tell participants what associations you are moving away from.',
        },
      ],
      callout: {
        type: 'warning',
        text: 'Warning: rebrands that change too much simultaneously (name + logo + color + tone) confuse customers more than they help. Research shows customers require 7-12 exposures to recognize a new brand from a previous relationship. Evolutionary rebrands outperform revolutionary ones in retention.',
      },
    },
    {
      id: 'b4-evolverev',
      title: 'Evolution vs Revolution — How to Choose',
      readTime: '2 min',
      icon: 'Hourglass',
      sections: [
        {
          heading: 'Evolution (the safer path)',
          body: `Tweak, modernize, refine. Dunkin' Donuts → Dunkin'. They shortened and simplified, kept the equity. Evolution works when the core identity is sound but the expression needs updating for a new era or market segment.`,
        },
        {
          heading: 'Revolution (the riskier path)',
          body: 'Rename and reposition entirely. Andersen Consulting → Accenture. BackRub → Google. Revolution is warranted when: (a) the existing name is a genuine barrier to growth, (b) scandal has made the name toxic, or (c) the business has fundamentally changed beyond what the name can contain.',
        },
      ],
      callout: {
        type: 'example',
        text: `Dunkin' removed 'Donuts' because 60% of revenue was beverages, not donuts. The word was misleading. They kept 'Dunkin'' because that's where 60+ years of equity lived. That's precision equity management.`,
      },
    },
  ],

  // ── b5 · Something else (business) — no legacy content ──
  b5: [],

  // ── t1 · Sports team ──
  t1: [
    {
      id: 't1-anatomy',
      title: 'The Anatomy of a Great Sports Team Name',
      readTime: '2 min',
      icon: 'Trophy',
      sections: [
        {
          heading: 'Four qualities that separate great from forgettable',
          body: 'Chantable (can 10,000 people yell it?), Visualizable (does it create an instant image?), Emotionally loaded (intimidating OR identity-building — pick one), Ownable (feels specific to this team, not interchangeable with anyone else).',
        },
        {
          heading: 'The geography question',
          body: 'Location-based names anchor the team in community. But they limit the team if it moves. Names that reference local culture without naming the city directly (Golden State Warriors) travel better. Think about whether this team will always be in one location.',
        },
        {
          heading: 'Mascot vs abstract',
          body: 'Miami Heat has no animal mascot. Oklahoma City Thunder has no mascot. Abstract team names (Heat, Magic, Jazz, Thunder) create more visual identity flexibility. But animal names are instantly visualizable. Both strategies have deep histories of success — choose based on your identity goals.',
        },
      ],
      callout: {
        type: 'example',
        text: 'Oklahoma City Thunder was chosen from 64,000 public submissions. It beat Bisons, Wind, and Energy. Thunder won because it was local, powerful, abstract, and chantable — without limiting the visual identity team.',
      },
    },
    {
      id: 't1-chant',
      title: 'Chantability: The Test Every Team Name Must Pass',
      readTime: '1 min',
      icon: 'SoccerBall',
      sections: [
        {
          heading: 'The stadium test',
          body: `Imagine 10,000 people chanting your team name after a goal. Not reading it. Not typing it. Screaming it. Does it work? Names with natural stress patterns and sharp endings pass this test: 'HEAT! HEAT! HEAT!' 'THUNDER! THUNDER!' Names with three syllables or soft endings fail it: try chanting 'Navigators' for 90 seconds. You will not enjoy it.`,
        },
        {
          heading: 'What makes a name chant-ready',
          body: `One or two syllables. A hard consonant or sharp vowel at the end. Or a name that compresses naturally (Sacramento Kings → 'KINGS!'). Test every submission by yelling it three times fast. If your voice trips on it, cut it from the shortlist.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Chantability correlates with merchandise sales. Names that are easy to chant are easy to print, easy to hashtag, and easy to remember mid-game. It is not a soft criterion — it is infrastructure.',
      },
    },
  ],

  // ── t2 · Band / music ──
  t2: [
    {
      id: 't2-firstsong',
      title: 'The Band Name Is Your First Song',
      readTime: '2 min',
      icon: 'MusicNote',
      sections: [
        {
          heading: 'The name sets tone before a note plays',
          body: `Before anyone hears your music, they see your name. It's on the flyer, the playlist, the algorithm recommendation. The name creates expectation. 'Death Cab for Cutie' creates completely different expectations than 'The 1975.' Both great — but they signal different worlds.`,
        },
        {
          heading: 'The story test',
          body: `Fans always ask: 'How did you get your name?' A great answer is a great story. Radiohead = from a Talking Heads B-side. Lynyrd Skynyrd = named after a gym teacher who told them to cut their hair. Foo Fighters = Dave Grohl's WWII UFO reference. A name with a story becomes band mythology before the first album.`,
        },
        {
          heading: 'The searchability problem',
          body: `In the streaming era, a searchable band name is a competitive advantage. 'The The', 'Girls', and '!!!' are all legitimate band names — and all impossible to find on any platform. 'Foo Fighters' returns exactly what you want. Distinctiveness and searchability are not the same thing — you need both.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Music discovery data: 67% of new listeners find artists through search (Spotify, YouTube, Google). A highly distinctive band name drives 2-3x more organic monthly plays in the first 6 months than a common word or phrase.',
      },
    },
    {
      id: 't2-archetypes',
      title: 'Three Archetypes That Dominate Music Naming History',
      readTime: '2 min',
      icon: 'Quotes',
      sections: [
        {
          heading: 'Absurdist / Provocative',
          body: `Arctic Monkeys, Vampire Weekend, Panic! at the Disco, Chumbawamba. Memorable for strangeness. Make you stop and think. Best for genres where personality is part of the brand. Risk: can feel gimmicky if the music doesn't match the name's attitude.`,
        },
        {
          heading: 'Evocative / Poetic',
          body: `The National, Fleet Foxes, Beach House, Portishead, Mazzy Star. Mood-first. Feels like the music before you hear it. Names that suggest a feeling, a place, an aesthetic. Ages beautifully — doesn't feel tied to any era or trend.`,
        },
        {
          heading: 'Personal / Story-based',
          body: `Dave Matthews Band, Lynyrd Skynyrd, Radiohead. The name carries identity — either the artist's or a moment in the band's history. Best for artist-driven projects where personality is the product.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Top 50 band names in history split roughly: 40% Absurdist, 40% Evocative, 20% Personal. Absurdist dominates indie/alt. Evocative dominates ambient/folk. Personal dominates hip-hop and country. Know your genre archetype before you brief.',
      },
    },
  ],

  // ── t3 · Podcast / channel ──
  t3: [
    {
      id: 't3-discovery',
      title: 'Discovery vs Memory: The Two Jobs of a Podcast Name',
      readTime: '2 min',
      icon: 'BookOpen',
      sections: [
        {
          heading: 'Job 1: Discovery',
          body: `When someone searches 'business podcast' or 'true crime,' does your name surface? Discovery-optimized names lean clear: 'The Daily,' 'Crime Junkie,' 'How I Built This.' These work when you have no existing audience and search is your primary acquisition channel.`,
        },
        {
          heading: 'Job 2: Memory',
          body: `When a listener recommends your show in conversation, can they remember the name? Memory-optimized names lean intriguing: 'Serial,' 'S-Town,' '99% Invisible,' 'Radiolab.' These work when word-of-mouth is your growth engine.`,
        },
        {
          heading: 'The balanced approach wins long-term',
          body: `'Hidden Brain' (NPR psychology): 'Hidden' = intriguing. 'Brain' = instantly signals the subject. You know it's about psychology before you read the description. Balanced names outperform pure-clarity or pure-mystery in long-term growth.`,
        },
      ],
      callout: {
        type: 'example',
        text: `'Stuff You Should Know' is extremely clear and SEO-rich — 2.5 billion downloads. 'Radiolab' is abstract and memorable — 120M downloads. Clear names front-load audience. Memorable names compound over time. Choose your growth strategy first.`,
      },
    },
    {
      id: 't3-algorithm',
      title: 'The Algorithm vs Memory Tension — How to Win Both',
      readTime: '2 min',
      icon: 'MagnifyingGlass',
      sections: [
        {
          heading: 'What the algorithm wants',
          body: `Podcast platforms surface shows based on keyword relevance. Clear, descriptive names ('The Marketing Podcast,' 'Daily News Brief') index well in search and get recommended in the right categories automatically. If search is your only acquisition channel, lean descriptive — you will get traffic earlier.`,
        },
        {
          heading: 'What memory wants',
          body: `Word-of-mouth — still the highest-conversion podcast acquisition channel — requires a name that lives in the brain and rolls off the tongue. 'You Must Remember This,' 'My Favorite Murder,' 'Conan Needs a Friend' spread because the names are interesting enough to repeat. Distinctive names compound.`,
        },
        {
          heading: 'The hybrid strategy',
          body: `Name the show memorably. Use the subtitle for clarity and keywords. 'Hidden Brain: A Podcast About the Unconscious Forces That Drive Human Behavior.' The name is memorable; the subtitle handles SEO. Many top shows use this approach — give participants both a name and subtitle brief.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Spotify's internal data shows that shows with distinctive (non-descriptive) names have 40% higher episode completion rates. Listeners who chose the show based on its name — not keywords — are more committed listeners.`,
      },
    },
  ],

  // ── t4 · Civic / school / nonprofit ──
  t4: [
    {
      id: 't4-longevity',
      title: 'The 50-Year Test for Civic Organization Names',
      readTime: '2 min',
      icon: 'Tree',
      sections: [
        {
          heading: 'Names that outlast their founders',
          body: 'YMCA was founded in 1844. Habitat for Humanity in 1976. Doctors Without Borders in 1971. None use trendy language. None reference technology. None use slang. Great civic organization names are built to outlast their founders by decades. Ask every participant: will this name still make sense in 50 years?',
        },
        {
          heading: 'What makes a civic name age well',
          body: `Names that age well: reference human values ('humanity' is permanent), name the impact not the process (Doctors Without Borders describes impact, not methodology), stay away from tech buzzwords (anything with 'digital,' 'smart,' 'e-,' 'cyber-' will be dated within 15 years).`,
        },
        {
          heading: 'The dual audience requirement',
          body: `Civic names must communicate purpose to two audiences: the people served AND the donors/funders. A name that resonates with one but not the other is a strategic liability. 'Feeding America' works for both: donors know what they're funding; recipients know what they're getting.`,
        },
      ],
      callout: {
        type: 'example',
        text: `'eCorps' (2000s nonprofit): the 'e-' prefix aged terribly. 'charity: water' (2006): aged beautifully — the lowercase and colon feel intentional and modern without being tied to any tech era.`,
      },
    },
    {
      id: 't4-community',
      title: 'Clarity vs Aspiration — When Each Approach Wins',
      readTime: '2 min',
      icon: 'Heart',
      sections: [
        {
          heading: 'The clarity approach',
          body: 'Crystal-clear civic names tell you exactly what they do: Habitat for Humanity, Feeding America, Girls Who Code. Best for service organizations where the mission IS the brand and you need to communicate in seconds without context.',
        },
        {
          heading: 'The aspiration approach',
          body: `Aspirational names evoke the world being worked toward. Aspiration works when you're building a movement, not just delivering a service. The name should inspire, not just describe — donors fund visions, not services.`,
        },
        {
          heading: 'Community ownership',
          body: `The best civic names feel like they belong to everyone. 'Big Brothers Big Sisters' could be anyone. 'The Johnson Initiative' belongs to Johnson. Unless your founder carries enormous equity (Gates, Obama), naming after a person limits community participation.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Research on donor behavior: civic names that communicate mission in the name receive 31% more first-time donations than abstract names. First impressions drive first dollars.',
      },
    },
  ],

  // ── t5 · Gaming group ──
  t5: [
    {
      id: 't5-psychology',
      title: 'The Psychology Behind Great Gaming Group Names',
      readTime: '1 min',
      icon: 'Lightning',
      sections: [
        {
          heading: 'Two camps, both dominate',
          body: `Intimidating names (FaZe Clan, Team Liquid, Cloud9) signal competitive dominance. Meme-worthy names (Panda Global, Golden Guardians) signal a different confidence: we're secure enough to be playful. Both work. Choice depends on how seriously competitive you are.`,
        },
        {
          heading: 'The functional tests',
          body: `Can you yell it when you clutch a 1v5? Can it go on a jersey? Does it have a tag/abbreviation that works? (Cloud9 → C9, Team Liquid → TL). Gaming names should be 1-2 words max, distinctive within your game's community, and functional as a competitive tag.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Merchandise data from top esports teams: 2-syllable team names generate 2.3x more fan gear searches than longer names. Brevity is a feature, not a constraint.',
      },
    },
    {
      id: 't5-tag',
      title: 'The Tag Test: How Esports Names Get Compressed',
      readTime: '1 min',
      icon: 'Wrench',
      sections: [
        {
          heading: 'Every name becomes a tag',
          body: `In competitive gaming, team names live as 2-3 character tags in brackets: [C9] Cloud9, [TL] Team Liquid, [FaZe] FaZe Clan. The tag is what players see in-game, in tournament brackets, and on leaderboards. A great team name produces a great tag naturally. Test every submission: what's the obvious 2-3 letter compression? If it's awkward, the name will feel wrong in competitive play.`,
        },
        {
          heading: 'Tag collision and uniqueness',
          body: `Before finalizing any name, check if the tag is already claimed in your game's community or in major esports. A unique tag is not just aesthetic — it determines search results, community identity on Discord and Reddit, and how other players refer to you in comms. 'GG' was taken before online gaming existed. Plan ahead.`,
        },
      ],
      callout: {
        type: 'example',
        text: `'NaVi' (Natus Vincere — Latin for 'born to win') compresses perfectly: memorable tag, meaningful full name, global audience doesn't need to know the Latin to feel the dominance. The tag and the name work as a system.`,
      },
    },
  ],

  // ── t6 · Other team / group ──
  t6: [
    {
      id: 't6-identity',
      title: 'Names Shape Group Identity Before the First Meeting',
      readTime: '2 min',
      icon: 'UsersThree',
      sections: [
        {
          heading: 'The name creates the group before the group exists',
          body: 'Research on organizational behavior shows groups given aspirational names produce measurably more creative output than groups with generic identifiers. The name becomes a self-fulfilling prophecy. A great group name is the first act of leadership.',
        },
        {
          heading: 'Inside vs. outside meaning',
          body: `The best group names work on two levels: they mean something to members (inside reference, shared history) AND they create the right impression for outsiders. A great group name says 'there's something going on here' even to people who don't know the inside story.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Groups with distinctive, creative names attract more qualified members than groups with generic identifiers. Your name is not just identity — it\'s a membership signal.',
      },
    },
    {
      id: 't6-future',
      title: 'Will Your Group Name Make Sense in 5 Years?',
      readTime: '1 min',
      icon: 'Clock',
      sections: [
        {
          heading: 'The time horizon problem',
          body: `Groups evolve. The 'Tuesday Night Crew' stops meeting Tuesdays. The 'Book Club' stops reading books and becomes a social outlet. The 'Marketing Brainstorm Team' becomes a full strategy department. Names built around logistics, schedules, or current activities age into irony. Names built around values, shared identity, or purpose stay accurate as the group evolves.`,
        },
        {
          heading: 'Future-proof naming criteria',
          body: `Ask: if this group's activity changes but the people stay the same, does the name still fit? If yes — it's identity-based and will age well. If no — it's activity-based and will need updating. For most groups, identity-based names are worth the extra effort to find.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'The best group names describe who you are, not what you do — because what you do will change.',
      },
    },
  ],

  // ── p1 · Baby name ──
  p1: [
    {
      id: 'p1-science',
      title: 'The Science of Name Perception',
      readTime: '2 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Sound shapes perception',
          body: 'Research in linguistics shows name sounds affect perceived personality. Names with hard consonants (Kate, Jack, Blake) are perceived as more assertive. Names with soft sounds (Lily, Maya, Noah) are perceived as warmer. Neither is better — but phonetics create expectations that follow a person into every introduction they make.',
        },
        {
          heading: 'The uniqueness question',
          body: 'Names easy to pronounce and spell correlate with slightly higher career success metrics — not because of the name itself, but because mispronunciation and misspelling create friction in every professional interaction over a lifetime. Consider the lifetime administrative cost of unusual spellings.',
        },
      ],
      callout: {
        type: 'insight',
        text: 'SSA data shows name popularity cycles every ~25 years. For uniqueness without invention, look at names ranked #500-1000: distinctive but phonetically established.',
      },
    },
    {
      id: 'p1-lifetime',
      title: 'The Lifetime Test: Toddler, Teen, Professional, Elderly',
      readTime: '2 min',
      icon: 'Hourglass',
      sections: [
        {
          heading: 'A name is worn for 80+ years',
          body: `Most parents think about how a name sounds for a baby. Few think about how it plays at a job interview, a first date, or at 75 years old. The most durable names work at every life stage. 'Eleanor' works for a toddler, a teenager, a CEO, and an 80-year-old. 'Braylee' is harder to carry into every stage with equal dignity.`,
        },
        {
          heading: 'The nickname architecture',
          body: `Built-in nickname flexibility is a feature, not a compromise. 'Alexander' gives you Alex, Al, Xander, Lex, Alec. The child gets to choose how they self-identify at different life stages. Single-form names (no natural nickname) give the name to the world; nickname-rich names give the child editorial control.`,
        },
        {
          heading: 'The professional context test',
          body: `Say the name in a business context: 'I'd like to introduce our CEO, [name].' Say it in a casual context: 'Have you met [name]?' If it sounds right in both settings, the name has range. If it only works in one, consider whether that constraint fits the life you're imagining for the child.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Research on name and career outcomes: names that are easy to pronounce and spell in the target culture correlate with fewer friction points across a lifetime of professional interactions. Spelling variation rarely adds character — it mainly adds correction burden.',
      },
    },
  ],

  // ── p2 · Pet name ──
  p2: [
    {
      id: 'p2-personality',
      title: 'Personality-Forward Naming Works Best for Pets',
      readTime: '1 min',
      icon: 'Heart',
      sections: [
        {
          heading: 'Names that fit the animal',
          body: `The best pet names capture personality rather than appearance. 'Chaos' or 'Gremlin' beats 'Spot' or 'Fluffy.' Personality names age better — a puppy grows into an adult but their personality tends to stay consistent.`,
        },
        {
          heading: 'The practical tests',
          body: `Say the name out loud 20 times: can you yell it in a dog park without embarrassment? Does it have a one-syllable call name? (Maximilian → Max). Can you say it with authority when they're misbehaving? The call name and the full name are both part of the choice.`,
        },
      ],
      callout: {
        type: 'example',
        text: 'Top pet names 2024: Luna, Bella, Charlie, Max, Cooper. If distinctiveness matters to you, these are the exact names to avoid. Look one tier down for uniqueness with established phonetics.',
      },
    },
    {
      id: 'p2-callname',
      title: 'The Call Name Principle',
      readTime: '1 min',
      icon: 'Hand',
      sections: [
        {
          heading: 'The name you actually use is the one that matters',
          body: `The formal name and the call name are two different things. 'Bartholomew' becomes 'Bart' at the dog park. 'Persephone' becomes 'Percy.' When naming a pet, work backward from the call name you will actually use 50 times a day. The full name can be ceremonial — but the one-syllable version is the functional name and it needs to work.`,
        },
        {
          heading: 'Response training and phonetics',
          body: `Animal trainers consistently recommend names ending in a vowel sound (Bella, Luna, Coco, Milo) because they carry further in open spaces and are easier for animals to distinguish from ambient noise. Hard consonants at the start also help: 'Kira' cuts through a crowd better than 'Nana.' Brief participants with both the aesthetic and the practical.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Veterinary behaviorists note that pets named with clear two-syllable patterns (MAX-i, BEL-la, CO-co) respond to recall commands faster than pets with names that blend into sentences. The call name is a functional tool, not just a label.',
      },
    },
  ],

  // ── p3 · Home / property / fun ──
  p3: [
    {
      id: 'p3-places',
      title: 'Why Named Places Feel Different Than Unnamed Ones',
      readTime: '1 min',
      icon: 'Tree',
      sections: [
        {
          heading: 'The psychology of place names',
          body: `Environmental psychology research shows named spaces are used differently than unnamed ones. Named vacation homes get booked more often, maintained better, remembered more fondly. A name creates emotional ownership that transfers — 'We're going to Willowbend' creates different anticipation than 'We're going to the lake house.'`,
        },
        {
          heading: 'What makes a great property name',
          body: `Great property names have: a story (where the name comes from matters), a sound that fits the place, and work as both formal name and casual reference. 'The Bungalow' works. 'Casa Serenidad' works. 'Our Place' doesn't — that's a pronoun, not a name.`,
        },
      ],
      callout: {
        type: 'example',
        text: 'Airbnb hosts who give their properties names see 23% higher booking rates than those who do not. The name creates a story guests want to be part of before they even arrive.',
      },
    },
    {
      id: 'p3-stick',
      title: 'What Makes a Property Name Stick',
      readTime: '1 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'The four sources that work',
          body: `The most memorable property names come from: (1) geography — a local feature, view, or landmark ('Ridgecrest,' 'Harborside'); (2) history — a previous use or long-ago owner ('The Old Mill,' 'Shepherd's Rest'); (3) nature — flora, fauna, or natural elements specific to the land ('Heronwood,' 'Cliffside'); (4) feeling — the emotional experience the place creates ('Stillwater,' 'Driftwood'). Abstract invented names rarely stick — grounding in something real gives people a story to tell.`,
        },
        {
          heading: 'The conversational test',
          body: `Will people use the name in natural conversation, or will it always need explanation? 'We're going to Willowbend' works. 'We're going to Casa Bella Serenissima Di Toscana' does not — it becomes 'the Italian place.' Shorter always wins. One or two words, phonetically easy, immediately evocative.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Property names that reference something visible from the property — a view, a tree, a body of water — are repeated more often by guests and neighbors. Anchoring the name to something people can point at makes it real, not decorative.',
      },
    },
  ],

  // ── p4 · Other personal ──
  p4: [
    {
      id: 'p4-generic',
      title: 'A Great Name Changes How Something Feels',
      readTime: '1 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'Names create meaning',
          body: `Research across psychology and linguistics consistently shows named things are treated differently than unnamed things. Named projects get more attention. Named spaces get more care. Named initiatives get more funding. Whatever you're naming, the act of choosing a name is the act of giving something a place in the world.`,
        },
        {
          heading: 'What makes it worth doing with a group',
          body: 'When people help name something, they feel invested in it. The process of finding the right name together is itself the first shared experience. Collective naming creates shared ownership from the very first moment.',
        },
      ],
      callout: {
        type: 'insight',
        text: `The right name doesn't just describe what something is — it tells people how to feel about it. A name is the shortest story you can tell.`,
      },
    },
    {
      id: 'p4-collective',
      title: 'Collective Naming Creates Collective Ownership',
      readTime: '1 min',
      icon: 'UsersThree',
      sections: [
        {
          heading: 'Why the process matters as much as the outcome',
          body: `When a group names something together — a friendship circle, a club, a tradition, a shared space — the naming process is itself the first shared act of ownership. Research on group cohesion shows that groups who create shared symbols (names, rituals, inside references) together report significantly higher belonging and commitment than groups where symbols are assigned from outside.`,
        },
        {
          heading: 'How to brief for collective resonance',
          body: `Tell participants who the group is and what it means to them. The best submissions will come from understanding the relationship, not just the object being named. A brief that says 'we are five friends who met studying abroad and this is our annual reunion' will generate completely different — and better — names than 'we need a name for our group.'`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'The name you choose together becomes a shared artifact — a piece of language that belongs to everyone who helped create it. That ownership transfers into how the name gets used and protected for years.',
      },
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// 4. PRIMERS — per sub-segment "~90 second read" intros
// ────────────────────────────────────────────────────────────────
export const PRIMERS = {
  b1: {
    title: 'Before You Start: The Naming Philosophy',
    quotes: [
      `"A name isn't a strategy. It's a vessel you fill with meaning."`,
      `"The best name isn't the one everyone likes. It's the one that works."`,
      `"Your job: Define what 'works' means for your company."`,
    ],
    example: `"Apple" tells you nothing about computers. But it's distinctive, memorable, ownable. That's what matters.`,
  },
  b2: {
    title: `Naming Products vs Companies: What's Different`,
    body: 'Products live under a brand umbrella. Your company name sets the stage. Your product name extends the story.',
    note: 'Branded house (Google everything) vs House of brands (P&G approach)',
    example: 'Salesforce → Sales Cloud, Service Cloud, Marketing Cloud',
  },
  b3: {
    title: 'Why Internal Project Names Matter More Than You Think',
    body: `Generic names kill momentum. 'Project Phoenix' has been done to death. A distinctive internal name drives adoption and builds morale.`,
    example: `Google's "Project Loon" (internet balloons) became a cultural touchstone`,
  },
  b4: {
    title: 'Rebranding: Evolution or Revolution?',
    body: `You're not starting from scratch. You have brand equity. The question is: Evolution or Revolution?`,
    example: `Mastercard (evolution — kept the name, dropped "MasterCard" spacing), Facebook→Meta (revolution), Dunkin' Donuts→Dunkin' (evolution — simplified)`,
  },
  b5: {
    title: 'Before You Start: The Naming Philosophy',
    body: `A great name doesn't just describe what you do — it creates a container for everything you'll become.`,
    example: `The best name isn't the one everyone likes. It's the one that works. Trust the process.`,
  },
  t1: {
    title: 'Sports Team Naming: What Makes Fans Yell It',
    body: 'The best sports names are chanted, cheerable, intimidating OR identity-building.',
    example: 'Oklahoma City Thunder (chosen by public vote from 64,000 submissions), Seattle Kraken',
  },
  t2: {
    title: 'Band Naming: The Mythology Matters',
    body: `Your band name is your first song. Fans will ask 'How'd you get your name?' — have a good story.`,
    example: `Radiohead (from Talking Heads song), Foo Fighters (Dave Grohl's WWII UFO reference)`,
  },
  t3: {
    title: 'Podcast Naming: Clarity vs. Intrigue — Both Can Win',
    body: `You're on a spectrum between ultra-clear ("How I Built This") and utterly intriguing ("Radiolab"). Both work — but they work differently.`,
    example: `The sweet spot: Most winning podcast names balance both. "Hidden Brain" is intriguing (why hidden?) but clearly about psychology. Aim for that.`,
  },
  t4: {
    title: 'Naming for Generations: Civic & Community Names',
    body: 'You\'re naming something that should outlast you by decades. Clarity beats cleverness. Aspiration beats description.',
    example: 'Habitat for Humanity (clear + aspirational), charity: water (memorable lowercase), Doctors Without Borders (communicates scope and courage in 3 words).',
  },
  t5: {
    title: 'Gaming Names: Intimidate or Meme — Both Work',
    body: 'Two camps: intimidating (FaZe Clan, Team Liquid) or meme-worthy (Panda Global, Golden Guardians).',
    example: 'Test: Can you yell it when you clutch a 1v5?',
  },
  t6: {
    title: 'Group Names Create Identity Before the First Meeting',
    body: `Names shape group identity before a single shared experience happens. A great group name creates belonging — outsiders want in.`,
    example: `Research shows: Groups named with aspirational titles ("The Visionaries") demonstrate more creative output than generic identifiers. Your name becomes a self-fulfilling prophecy.`,
  },
  p1: {
    title: 'Let Everyone Help Name Your Baby',
    body: 'Invite family and friends. Everyone gets a voice. All in one place. Private voting. Beautiful certificate.',
    example: 'The Morrison family invited 23 people. The certificate hangs in the nursery.',
  },
  p2: {
    title: 'Name Your New Best Friend',
    body: 'Pets are family. Get input from everyone who loves them.',
    example: 'A shared naming process means everyone feels invested from day one.',
  },
  p3: {
    title: 'Named Places Have Souls',
    body: `Named places feel more like home. "The Bungalow" becomes a person. "Stella" the sailboat becomes a family legend.`,
    example: 'Research shows: Named spaces are used more, cared for more, and remembered more fondly. The name you choose becomes part of the story you tell about this place.',
  },
  p4: {
    title: 'The Right Name Changes How Something Feels',
    body: `A great name doesn't just describe what you do — it creates a container for everything you'll become.`,
    example: `Key insight: The best name isn't the one everyone likes. It's the one that works. Trust the process.`,
  },
};

// ────────────────────────────────────────────────────────────────
// 5. INVITE_GUIDANCE — per sub-segment (from INVITE_CONFIG)
// ────────────────────────────────────────────────────────────────
export const INVITE_GUIDANCE = {
  b1: {
    essential: ['Founders / C-suite', 'Marketing / Brand lead', `Anyone who'll use the name daily`],
    recommended: ['2-3 outsiders — investors, advisors, or customers'],
    recommendedNote: `30% of winning names came from someone outside the company. Airbnb's name came from a designer they hired, not the founders.`,
    optional: ['Early employees (builds ownership)', 'Board members (if involved in brand decisions)'],
    sweetSpot: '12–25',
    sweetSpotNote: '<10 = not enough diversity · 12–25 = sweet spot · >30 = diminishing returns',
  },
  b2: {
    essential: ['Product team lead', 'Brand / Marketing team', 'Customer-facing staff (sales, support)'],
    recommended: ['2–3 existing customers who know the problem your product solves'],
    recommendedNote: `Customers name things differently than internal teams. They use the words your market actually uses — not your internal jargon.`,
    optional: ['Product designers / UX team', 'Key investors or advisors'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Product naming benefits from diverse internal + a few external voices. Keep it tight.',
  },
  b3: {
    essential: ['Project team lead(s)', 'Department heads impacted by the project', 'Executive sponsor'],
    recommended: ['2–3 people most affected by this project (end users, downstream teams)'],
    recommendedNote: `The people most affected by the project often suggest names that stick — they know what this work means on the ground.`,
    optional: ['Cross-functional stakeholders if broad impact'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Internal project naming works best with a focused group. Too many voices = political naming.',
  },
  b4: {
    essential: ['Founders / CEO', 'Brand / Marketing team', 'Long-tenured employees (they carry brand memory)'],
    recommended: ['Customers who know the current name and what it means to them'],
    recommendedNote: `Brand equity lives in customer memory. They'll tell you what's worth keeping — and what associations the new name needs to escape.`,
    optional: ['PR / Communications team', 'Board members if involved in brand decisions'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Rebrands need internal buy-in AND external reality check. Balance both.',
  },
  b5: {
    essential: ['Key decision-makers', 'Marketing or brand lead', `People who'll use the name daily`],
    recommended: ['2–3 outsiders for an external perspective'],
    recommendedNote: 'Fresh eyes catch assumptions insiders miss. Even one outside voice can unlock a better name.',
    optional: ['Advisors, investors, or stakeholders'],
    sweetSpot: '10–25',
    sweetSpotNote: 'Sweet spot for most business naming contests.',
  },
  t1: {
    essential: ['Team captain(s)', 'Coach / Manager'],
    recommended: ['3–5 core team members'],
    recommendedNote: 'The whole team should feel ownership of the name — it will define their identity every game.',
    optional: ['Parents or guardians (youth teams)', 'Fans or supporters if established'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Enough voices for variety, small enough for consensus.',
  },
  t2: {
    essential: ['All band members (everyone in)'],
    recommended: ['Producer or manager', '1–2 superfans who know your sound'],
    recommendedNote: 'Superfans tell you what the name means from the outside — they hear the music without the insider bias.',
    optional: ['Label reps if signed', 'Collaborators or session musicians'],
    sweetSpot: '5–10',
    sweetSpotNote: `Band names are personal — keep the circle tight. Too many outside voices dilute what makes you you.`,
  },
  t3: {
    essential: ['Host(s)', 'Producer / Editor'],
    recommended: ['3–5 people who match your target audience profile'],
    recommendedNote: `Your target listener knows what show names attract them. They're your most valuable naming input.`,
    optional: ['Guest speakers who know your content well', 'Social media followers you trust'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Mix of creators and target audience gives you both insider vision and market reality.',
  },
  t4: {
    essential: ['Founding team members', 'Board members', 'Executive Director'],
    recommended: ['5–10 community members you serve or plan to serve'],
    recommendedNote: `The community you serve should have a voice in what you're called. This is also a trust-building act — invite them in.`,
    optional: ['Major donors or funders (if brand matters to them)', 'Volunteers and long-term supporters'],
    sweetSpot: '15–25',
    sweetSpotNote: 'Civic naming benefits from broad inclusion. More voices = more community ownership of the final name.',
  },
  t5: {
    essential: ['All group members'],
    recommended: [],
    recommendedNote: '',
    optional: ['Friends who play with you regularly'],
    sweetSpot: '3–8',
    sweetSpotNote: 'Gaming groups are tight-knit. Everyone who matters is already in the group.',
  },
  t6: {
    essential: ['All group members'],
    recommended: ['Friends who know the group well — they see you from the outside'],
    recommendedNote: 'Outside friends often suggest names that capture what the group looks like from the outside — which is the name that will stick with others.',
    optional: ['Anyone who has been part of the group in the past'],
    sweetSpot: '8–20',
    sweetSpotNote: 'Depends on group size — invite everyone who matters.',
  },
  p1: {
    essential: ['Immediate family — parents, siblings, grandparents'],
    recommended: [`Close friends in the baby's life — godparents, best friends`],
    recommendedNote: `People who'll be in this child's life should feel included. It also means more people invested in the name from day one.`,
    optional: ['Distant relatives, coworkers — anyone you want to feel involved'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Great way to make distant relatives feel connected. The certificate on the nursery wall tells the whole story.',
  },
  p2: {
    essential: ['Immediate family members'],
    recommended: ['Anyone who will regularly see or care for the pet'],
    recommendedNote: `Pets become part of the community around them. The people who'll call the name most often should help choose it.`,
    optional: ['Friends of the family who know about the new pet'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it personal — this is a family moment.',
  },
  p3: {
    essential: [`People who'll live in or regularly use the space`],
    recommended: ['Friends who know the space and your style'],
    recommendedNote: `Friends who've visited often name places better than the owners — they see the vibe without the familiarity bias.`,
    optional: ['Neighbors, frequent guests, anyone with a connection to the space'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it fun and intimate.',
  },
  p4: {
    essential: [`People closest to you who understand what you're naming`],
    recommended: ['A few friends or family for fresh perspective'],
    recommendedNote: 'Outside voices catch what feels obvious to you but surprising to the world.',
    optional: [`Anyone with a connection to the thing you're naming`],
    sweetSpot: '5–15',
    sweetSpotNote: 'Scale to the occasion.',
  },
};

// ────────────────────────────────────────────────────────────────
// 6. CUT_QUESTIONS — IDs hidden at render time (data preserved, reversible)
// ────────────────────────────────────────────────────────────────
export const CUT_QUESTIONS = {
  b1: ['geoScope'],
  b2: ['differentiator'], // merged into prodDesc
  b3: [],
  b4: [],
  b5: [],
  t1: ['teamColors', 'chantable'],
  t2: ['searchability'], // merged into nameType
  t3: [],
  t4: ['acronymPref'],
  t5: ['platform'],
  t6: [],
  p1: ['traditions', 'avoidInitials'],
  p2: ['callNamePref'],
  p3: [],
  p4: [],
};

// ────────────────────────────────────────────────────────────────
// MERGE_QUESTIONS — semantic merges (combine legacy fields into one chat question)
// ────────────────────────────────────────────────────────────────
export const MERGE_QUESTIONS = {
  b2: [
    {
      keepId: 'prodDesc',
      merged: ['differentiator'],
      newPrompt: 'Describe your product and what makes it different from alternatives.',
    },
  ],
  t2: [
    {
      keepId: 'nameType',
      merged: ['searchability'],
      newPrompt: 'How will the name live in the world — legal name? stage only? searchable on Google?',
    },
  ],
  p1: [
    {
      keepId: 'lengthPref',
      merged: ['nicknamePreference'],
      newPrompt: 'Do you prefer short, formal, or nickname-rich names?',
    },
  ],
};

// ────────────────────────────────────────────────────────────────
// 7. FALLBACK_QUESTIONS — shape used by b5 / p4 ("something else")
//    Mirrors t6's shape — generic, low-context.
// ────────────────────────────────────────────────────────────────
export const FALLBACK_QUESTIONS = [
  {
    id: 'groupDesc',
    label: 'Describe what you are naming',
    prompt: `In a few sentences, describe what you're naming and what makes it unique.`,
    type: 'textarea',
    rows: 4,
    required: true,
    placeholder: `What is this? Who is it for? What makes it unique?`,
    hint: `The more context participants have, the better the names.`,
  },
  {
    id: 'vibe',
    label: 'Vibe / personality',
    prompt: 'What vibe should the name carry?',
    type: 'chips',
    options: ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'],
  },
  {
    id: 'history',
    label: 'Any shared history or inside references?',
    prompt: 'Any shared story, inside reference, or origin moment that could inspire a name?',
    type: 'text',
    required: false,
    placeholder: 'e.g. We all met at a conference in Berlin, our group chat is named after an inside joke...',
    hint: `Group names with personal meaning create stronger belonging. If there's a shared joke, a founding story, or a place that matters — share it.`,
  },
];

// ────────────────────────────────────────────────────────────────
// Helper: sub-segment ID → legacy slug (for any code still keyed on legacy)
// ────────────────────────────────────────────────────────────────
export const V4_TO_LEGACY_SLUG = {
  b1: 'company-name',
  b2: 'product-name',
  b3: 'project-name',
  b4: 'rebrand',
  b5: 'other-business',
  t1: 'sports-team',
  t2: 'band-music',
  t3: 'podcast-channel',
  t4: 'civic-school-nonprofit',
  t5: 'gaming-group',
  t6: 'other-team',
  p1: 'baby-name',
  p2: 'pet-name',
  p3: 'home-property-fun',
  p4: 'other-personal',
};
