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
  // 2026-07-10: replaced with the client-authored (Maria) 10-question guide.
  // All optional except projectSummary ("answer as many or as few as you'd
  // like"); prompt = the question bubble, hint = the explanation below it.
  b1: {
    label: 'Company / startup',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'namingTarget',
        briefLabel: 'What’s being named',
        label: 'What are you naming?',
        prompt: 'What are you naming?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. A new specialty coffee roaster launching this spring',
        hint: `Is this a brand-new name, or a rebrand of an existing company?`,
        guideId: 'b1-origins',
      },
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About the company',
        prompt: 'What does the company do, who is it for, and what sets it apart?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'e.g. We roast small-batch coffee for cafés across the Midwest. Direct trade, and fresher than the big wholesalers.',
        hint: `Share whatever context will help participants understand the business, such as who your customers are, what you offer, how you differ from competitors, or anything distinctive about your industry. The more participants understand about the company, the more relevant and meaningful their name ideas can be.`,
      },
      {
        id: 'nameCommunicate',
        label: 'What should the name communicate?',
        prompt: 'What should the name communicate? Are there ideas or themes you’d like participants to explore?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Explore light, clarity, and extreme speed. Maybe look at terms from space travel and really fast animals like falcons and cheetahs.',
        hint: `For example: speed, growth, simplicity, precision, trust, discovery, craftsmanship, or connection. You can also suggest creative territories such as nature, navigation, transformation, mythology, history, movement, or distinctive animals. Metaphors can open up even more possibilities: a company that simplifies complexity might explore ideas like bridges, shortcuts, or light.`,
      },
      {
        id: 'brandPersonality',
        label: 'Personality',
        prompt: 'What personality should the company name have?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Confident and modern, but still warm and approachable',
        hint: `Should it feel bold or understated? Playful or serious? Modern or timeless? Warm or authoritative? Describe the qualities you want people to sense when they encounter the name.`,
      },
      {
        id: 'nameStyles',
        label: 'Name styles',
        prompt: 'What kinds of name styles do you like? Pick any that apply.',
        type: 'multiChips',
        options: [
          { label: 'Real words',            eg: 'Nest, Amazon' },
          { label: 'Coined / made-up words', eg: 'Pixar, Verizon' },
          { label: 'Combined words',        eg: 'YouTube, MasterCard' },
        ],
        hint: `Pick any that appeal — the guide breaks each one down.`,
        guideId: 'b1-styles',
      },
      {
        id: 'descriptiveEvocative',
        label: 'Explain or suggest?',
        prompt: 'Should the name explain or suggest?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Descriptive', sublabel: 'Gives people a sense of what you do or offer, like PayPal or QuickBooks' },
          { id: 'suggestive', label: 'Suggestive', sublabel: 'Hints at an idea, feeling, or benefit without spelling it out, like Amazon or Versant' },
          { id: 'either', label: 'Either works', sublabel: '' },
        ],
        hint: `Do you want the name to clearly signal what the company does, or create a feeling, idea, or association around it? A name like PayPal tells you something about the service, while names like Apple or Amazon don’t describe the business directly but can build meaning over time.`,
      },
      {
        id: 'otherLanguages',
        label: 'Names from other languages?',
        prompt: 'Are you open to names drawn from other languages?',
        type: 'chips',
        options: ['Yes — open to it', 'Prefer English', 'Not sure'],
        describeOption: 'Yes — open to it',
        describePlaceholder: 'e.g. Latin, Italian, Japanese',
        hint: `For example, would you consider names that use or adapt words from Latin, Greek, Italian, or other languages?`,
      },
      {
        id: 'includeAvoid',
        label: 'Words or ideas to explore or avoid',
        prompt: 'Are there any words or ideas you’d like to explore or avoid?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Please avoid the words Go, Connect, Speed. Explore the idea of space travel.',
        hint: `Share any specific words, concepts, themes, or naming directions you’d like participants to consider or steer clear of. This could include words you love, words that feel overused in your industry, or anything that’s off-limits for the name.`,
      },
      {
        id: 'admiredNames',
        label: 'Names you’re drawn to',
        prompt: 'What existing names are you drawn to?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. I like Patagonia and the North Face for their sense of adventure.',
        hint: `Share a few company, product, or brand names that represent the kind of name you’d like for your company. They can come from any industry. Tell us what you like about them — whether it’s their sound, style, meaning, originality, or something else. This will help participants understand the naming direction you’re drawn to.`,
      },
      {
        id: 'practicalReqs',
        label: 'Practical requirements',
        prompt: 'Are there any practical requirements or restrictions?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Short, easy to spell, .com available',
        hint: `For example: a maximum number of letters or syllables, easy to pronounce or spell, a preference for the exact dot-com domain, works well internationally, no initials or acronyms — or anything else the name must, or ideally should, do.`,
      },
    ],
  },

  // ── b2 · Product / service ──
  // 2026-08-18: rebuilt to Maria's product question set (COPY NOTES). Her seven
  // product questions appear distinctly — the three brand-relationship Yes/Nos
  // combined into one — followed by the shared naming-preference questions
  // (Company wording). Two guides: product-vs-company + name styles.
  b2: {
    label: 'Product / service',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About the product',
        prompt: 'What exactly is the product?',
        type: 'textarea',
        rows: 4,
        required: true,
        placeholder: 'e.g. A hot sauce made with fermented local peppers. Three heat levels, aimed at home cooks who want flavor first and burn second.',
        hint: `Tell us what it is, what it does, and who it’s for — a physical product, an app, a service, or a feature. The clearer the picture participants have, the more relevant their name ideas can be.`,
        guideId: 'b2-vs-company',
      },
      {
        id: 'brandFamily',
        label: 'Part of a larger brand or family?',
        prompt: 'Is it part of a larger brand or product family?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Yes, it launches under our Red Barn Foods brand',
        hint: `Tell us the parent company or brand, and any sibling products the new name will sit alongside. A name that has to live in a family plays differently than one standing alone.`,
      },
      {
        id: 'productLine',
        label: 'Other products in this line?',
        prompt: 'Will there be other products in this line?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Two more sauces are planned for next year',
        hint: `If more products are coming, the name may need to work as a pattern — think Kindle, Kindle Paperwhite, Kindle Oasis. If this is a one-off, participants have more freedom.`,
      },
      {
        id: 'namingConventions',
        label: 'Existing naming conventions?',
        prompt: 'Are there existing naming conventions this product needs to follow?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. All our products are named after birds',
        hint: `Any pattern your existing names follow — a shared theme, a structure, a length, a starting letter. If the new name has to fit an established system, participants should know the rules.`,
      },
      {
        id: 'pairedWithCompany',
        label: 'Paired with the company name?',
        prompt: 'Will the product name be paired with the company name?',
        type: 'chips',
        options: ['Yes, usually together', 'No, it stands on its own', 'Not sure yet'],
        describeOption: 'Yes, usually together',
        describePlaceholder: 'e.g. Paired with Acme',
        hint: `Google Maps almost always appears with Google in front; Tide never mentions P&G. If the two names will be said and seen together, they need to sound good together, and the product name can stay simpler. If yes, tell us the company name.`,
      },
      {
        id: 'featuresBenefits',
        label: 'Features or benefits to convey?',
        prompt: 'Are there features or benefits this name should convey?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Big flavor, real ingredients, approachable heat',
        hint: `Product names can lean into what makes the product worth buying. Calm names the exact benefit of the app; Post-it describes the product in two syllables. Is there a feature, benefit, or feeling the name should carry?`,
      },
      {
        id: 'nameUsage',
        label: 'How will the name appear and be used?',
        prompt: 'How will the product name appear and be used?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. On the bottle label, a farmers-market banner, and our web shop',
        hint: `Where the name shows up shapes what works: a label on a shelf, an app-store listing, a URL, a menu, a sales call. Tell participants where people will encounter it.`,
      },
      {
        id: 'nameStyles',
        label: 'Name styles',
        prompt: 'What kinds of name styles do you like? Pick any that apply.',
        type: 'multiChips',
        options: [
          { label: 'Real words',            eg: 'Kindle, Tide' },
          { label: 'Coined / made-up words', eg: 'Swiffer, Prius' },
          { label: 'Combined words',        eg: 'PowerPoint, AirPods' },
        ],
        hint: `Pick any that appeal — the guide breaks each one down.`,
        guideId: 'b2-styles',
      },
      {
        id: 'descriptiveEvocative',
        label: 'Explain or suggest?',
        prompt: 'Should the name explain or suggest?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Descriptive', sublabel: 'Says what the product does, like QuickBooks or Post-it' },
          { id: 'suggestive', label: 'Suggestive', sublabel: 'Hints at an idea, feeling, or benefit without spelling it out, like Kindle or Swiffer' },
          { id: 'either', label: 'Either works', sublabel: '' },
        ],
        hint: `Do you want the name to clearly signal what the product does, or create a feeling, idea, or association around it? QuickBooks tells you what it’s for; Kindle doesn’t describe an e-reader, but it kindles exactly the right idea.`,
      },
      {
        id: 'otherLanguages',
        label: 'Names from other languages?',
        prompt: 'Are you open to names drawn from other languages?',
        type: 'chips',
        options: ['Yes — open to it', 'Prefer English', 'Not sure'],
        describeOption: 'Yes — open to it',
        describePlaceholder: 'e.g. Latin, Italian, Japanese',
        hint: `For example, would you consider names that use or adapt words from Latin, Greek, Italian, or other languages?`,
      },
      {
        id: 'includeAvoid',
        label: 'Words or ideas to explore or avoid',
        prompt: 'Are there any words or ideas you’d like to explore or avoid?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Please avoid Fire, Blaze, and Inferno. Explore harvest, craft, and small-batch ideas.',
        hint: `Share any specific words, concepts, themes, or naming directions you’d like participants to consider or steer clear of. This could include words you love, words that feel overused in your category, or anything that’s off-limits for the name.`,
      },
      {
        id: 'admiredNames',
        label: 'Names you’re drawn to',
        prompt: 'What existing names are you drawn to?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. I like Calm and Sharpie — each name is the product’s promise in one word.',
        hint: `Share a few product, company, or brand names that represent the kind of name you’d like for this product. They can come from any industry. Tell us what you like about them — whether it’s their sound, style, meaning, originality, or something else.`,
      },
      {
        id: 'practicalReqs',
        label: 'Practical requirements',
        prompt: 'Are there any practical requirements or restrictions?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Short, easy to spell, app-store friendly, .com available',
        hint: `For example: a maximum number of letters or syllables, easy to pronounce or spell, a preference for the exact dot-com domain, app-store or trademark friendly, works well internationally — plus where the name will appear and how it will be used. Anything the name must, or ideally should, do.`,
      },
    ],
  },

  // ── b3 · Project / Initiative Name ──
  b3: {
    label: 'Project / initiative',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: `What’s this project about?`,
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 6-month internal migration of our customer data from Snowflake to BigQuery. Touches every analytics pipeline and three customer-facing dashboards.',
      },
      {
        id: 'projDesc',
        label: 'What is this project / initiative?',
        prompt: `Describe the project’s goal, scope, and who it affects.`,
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: `What is the project’s goal? Who is involved? What changes when it succeeds?`,
        hint: `Describe the project’s goal, scope, and who it affects. Great internal names capture the spirit of the work, not just the task. “Project Heartbeat” for a customer retention initiative says something about the stakes.`,
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
          { id: 'functional', label: 'Functional', sublabel: '“Migration 2025”, “Customer Portal Rebuild”' },
          { id: 'inspirational', label: 'Inspirational', sublabel: '“Project Phoenix”, “Operation Clarity”' },
          { id: 'codename', label: 'Codename / Abstract', sublabel: 'Random word — Everest, Sequoia, Saturn' },
          { id: 'any', label: `Any — I’ll know it when I see it`, sublabel: '' },
        ],
        hint: `Functional names are clear but forgettable. Inspirational names build morale but can feel forced. Codenames/abstract names (like Google’s internal project names) feel cool but need internal adoption. The right choice depends on how much the name needs to communicate outside the core team.`,
        guideId: 'b3-funcvsinsp',
      },
      {
        id: 'admiredNames',
        label: 'Project names that landed well',
        prompt: 'Any past project names, yours or elsewhere, that landed well?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Everyone still says “Atlas” two years on. Short, serious, easy in a sentence.',
        hint: `Names that survived in your org are the best predictor of what the next one needs. Share the project names people actually still say out loud and what made them stick.`,
      },
      {
        id: 'includeAvoid',
        label: 'Words or acronyms to avoid',
        prompt: 'Any words, acronyms, or old project names to avoid?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Don’t reuse Phoenix, that was last year’s migration. Initials shouldn’t spell anything unfortunate.',
        hint: `Companies accumulate project-name history fast. If a name is already attached to last year’s initiative, or certain words are loaded in your org, participants should know before they suggest them.`,
      },
    ],
  },

  // ── b4 · Rebrand (uses b1 question set, scoped here for clarity) ──
  b4: {
    label: 'Rebrand',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: `What’s the company being rebranded — and what does it do today?`,
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 30-year-old commercial real estate firm pivoting into residential. Old name leans corporate; we need something that lands warmer with homeowners.',
      },
      {
        id: 'currentName',
        label: 'Current name',
        prompt: 'What is your current brand name?',
        type: 'text',
        required: false,
        placeholder: 'What is your current brand name?',
      },
      {
        id: 'rebrandReason',
        label: 'Why are you rebranding?',
        prompt: `What’s prompting the rebrand — and what’s changing about the business?`,
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: `What prompted this rebrand? What’s changing about your business?`,
        guideId: 'b4-equity',
      },
      {
        id: 'companyDesc',
        label: 'What does your company do?',
        prompt: 'In 2–3 sentences, what does your company do today?',
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: 'Describe your company in 2-3 sentences...',
        hint: `Don’t overthink this. You’re not writing a mission statement. You’re giving participants context. Example: “We make project management software for remote teams” is perfect. Keep it to 2-3 sentences.`,
      },
      {
        id: 'namingStyle',
        label: 'Naming Style Preference',
        prompt: 'What kind of name fits the new brand?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Descriptive', sublabel: 'QuickBooks' },
          { id: 'suggestive', label: 'Suggestive', sublabel: 'Salesforce' },
          { id: 'abstract', label: 'Abstract', sublabel: 'Kodak' },
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
        placeholder: `Who needs to love this name? e.g. “SMB owners aged 35-55, non-technical, price-sensitive”`,
      },
      {
        id: 'competitors',
        label: 'Competitor Names (list 3-5)',
        prompt: 'List 3–5 direct competitors.',
        type: 'textarea',
        rows: 3,
        placeholder: 'e.g. Slack, Notion, Asana, Monday',
      },
      {
        id: 'keepOrLeave',
        label: 'Keep or leave behind',
        prompt: 'Is there anything from the current name to keep, or to leave firmly behind?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Our current name is Fairway Solutions. Keep the friendly feel of “Fairway”, drop the word “Solutions”.',
        hint: `Rebrands succeed on continuity as much as change. A kept sound, initial, or idea helps customers carry trust to the new name; a word deliberately left behind tells participants what this rebrand is escaping. Name both if you can.`,
      },
    ],
  },

  // ── b5 · Something else (business) — no legacy content, t6-style fallback ──
  // 2026-08-18: client-authored (Maria) business "something else" question set.
  b5: {
    label: 'Something else (business)',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'What are we naming?',
        prompt: 'What are we naming?',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. An internal innovation program that runs company-wide hackathons twice a year',
        hint: `An initiative, a program, an event, an internal tool, a space — whatever it is, tell us what it is and what it’s for.`,
      },
      {
        id: 'nameUsage',
        label: 'How will the name be used?',
        prompt: 'How will the name be used?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. On an internal site, in emails, on event signage and swag',
        hint: `Where will people see or say this name? On a website, in conversation, on signage, in a logo? How it’s used shapes what kind of name works.`,
      },
      {
        id: 'audience',
        label: 'Who is the audience?',
        prompt: 'Who is the audience for the name?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Employees across every department, plus a few external partners',
        hint: `Who is this name for? The more participants understand the audience, the better they can pitch the tone and style.`,
      },
      {
        id: 'nameCommunicate',
        label: 'What should the name communicate?',
        prompt: 'What should the name communicate? Are there specific themes or ideas to explore?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. Energy, creativity, and momentum. Maybe play on building, launching, or sparks.',
        hint: `Share the ideas, feelings, or themes the name should carry, and any creative territories worth exploring.`,
      },
      {
        id: 'descriptiveEvocative',
        label: 'Direct or evocative?',
        prompt: 'Should the name be direct and clear, or more evocative and suggestive?',
        type: 'radioCards',
        options: [
          { id: 'descriptive', label: 'Direct and clear', sublabel: 'Says plainly what it is' },
          { id: 'suggestive', label: 'Evocative and suggestive', sublabel: 'Hints at an idea or feeling without spelling it out' },
          { id: 'either', label: 'Either works', sublabel: '' },
        ],
      },
      {
        id: 'nameConnection',
        label: 'Connection to other names?',
        prompt: 'Should the name connect to your company name or any other names?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. It should feel like part of the Acme family, or nod to our “Summit” event series.',
        hint: `Should it echo your company name, fit alongside existing names, or stand entirely on its own?`,
      },
      {
        id: 'admiredNames',
        label: 'Names you’ve considered or admire',
        prompt: 'Have you thought of any names for this, or names you admire, that you could share?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. We’ve floated “Ignite” and “Launchpad.” I also like how “Basecamp” feels.',
        hint: `Share anything you’ve considered, or names elsewhere you like, and what you respond to about them. It helps participants understand the direction you’re drawn to.`,
      },
      {
        id: 'practicalReqs',
        label: 'Practical restrictions',
        prompt: 'Are there any practical restrictions on the name, such as length, spelling, or words to avoid?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. One or two words, easy to say aloud, avoid anything too corporate',
        hint: `For example: a maximum length, easy to pronounce or spell, words to avoid, or anything else the name must, or ideally should, do.`,
      },
      {
        id: 'avoidNames',
        label: 'Names to avoid',
        prompt: 'Any names or words to steer clear of?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Nothing close to “Innovation Lab”, the last program burned that word out.',
        hint: `If a name is already taken nearby, attached to a past effort, or simply worn out in your world, say so. Participants can’t avoid what they don’t know about.`,
      },
    ],
  },

  // ── t1 · Sports team ──
  t1: {
    label: 'Sports team',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: 'Tell us about the team.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A Sunday-league 7-a-side football team in the Brookside Adult Rec League Division B. Mostly mates from work who took it more seriously than expected.',
      },
      {
        id: 'sportLeague',
        label: 'Sport and league / competition',
        prompt: 'What sport, league, or level is this team part of?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Adult rec soccer league',
        hint: `Different sports and leagues have their own naming traditions. Soccer teams might draw on places, animals, colors, or local references. Hockey names often lean into toughness, nature, or weather, while recreational teams can be much more playful. Tell participants what kind of team they’re naming, and they can draw on the conventions that fit — or take the name in a completely different direction.`,
        guideId: 't1-anatomy',
      },
      {
        id: 'ageGroup',
        label: 'Age group / competitive level',
        prompt: 'Who plays on the team?',
        type: 'chips',
        options: ['Youth (under 14)', 'High School (14-18)', 'College / University', 'Intramural', 'Adult Amateur', 'Semi-Pro / Pro'],
      },
      {
        id: 'personality',
        briefLabel: 'Team personality',
        label: 'Team Personality',
        prompt: `What’s the team’s personality? Pick any that apply.`,
        type: 'multiChips',
        options: ['Intimidating', 'Pride-Based', 'Fun / Playful', 'Underdog / Gritty', 'Not sure'],
        hint: `Personality sets the tone. A team name signals what kind of team you are. An intimidating name like Predators or Raptors projects power and aggression; a name rooted in place, community, or identity can create a different kind of pride and belonging. Playful names can be perfect for youth or rec teams, while a highly competitive team may want more edge. Let your names reflect your team’s personality, audience, and ambitions.`,
        guideId: 't1-chant',
      },
      {
        id: 'namingDirection',
        label: 'Naming territories',
        prompt: 'Which naming territories should participants explore? Pick any that apply.',
        type: 'multiChips',
        options: [
          { label: 'Animal / Mascot',    eg: 'Lions, Hawks' },
          { label: 'Force of Nature',    eg: 'Thunder, Blaze' },
          { label: 'Place / Geographic', eg: 'Riverside, Northern' },
          { label: 'Elite / Best',       eg: 'Apex, Vanguard' },
          { label: 'Tough / Fierce',     eg: 'Renegades, Predators' },
          { label: 'Open to anything',   eg: null },
        ],
        allowCustom: true,
        hint: `Oklahoma City’s Thunder was chosen through a fan vote from an ownership-selected shortlist that included Barons, Bison, Energy, and Wind. The name connects to the region while evoking a powerful force of nature. Seattle’s Kraken took a very different route, embracing a mythical creature with no obvious connection to the city. When briefing participants, you can point them toward a particular naming territory—or leave the door open for an unexpected idea.`,
      },
      {
        id: 'geography',
        label: 'Local connection & colors',
        prompt: 'Any city, region, landmark, or team colors that should inspire the name?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'Share city name, regional landmarks, notable weather patterns, interesting local history, team colors, etc.',
        hint: `A strong connection to place — or a signature color — can give a team name instant identity and local meaning. If your team represents a city, neighborhood, or region, share that context with participants. Local landmarks, landscapes, weather, history, cultural references, and team colors can all inspire names that feel connected to where the team plays.`,
      },
      {
        id: 'chantable',
        label: 'Chantability — will fans chant it?',
        prompt: 'Will fans actually chant this name on game day?',
        type: 'chips',
        options: ['Yes — fans will chant it', 'Not important for us', 'Not sure'],
        hint: `A chantable name changes the game-day experience. “Let’s go Thunder!” works because “Thunder” is punchy and single-syllable. “Let’s go Riverside Athletic United!” doesn’t chant. If this name will be chanted, it needs to be 1-2 syllables and end with energy.`,
      },
      {
        id: 'teamColors',
        label: 'Team colors',
        prompt: `What are your team colors?`,
        type: 'text',
        required: false,
        placeholder: 'e.g. Navy and gold, all black, red and white',
      },
      {
        id: 'admiredNames',
        label: 'Team names you like',
        prompt: 'Which team names do you like, at any level of sport?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We like names like Athletic Club and St. Pauli, names with history in them.',
        hint: `A few reference names tell participants more than a paragraph of description. Share team names you admire, from any sport or league, and say what you like about them. Participants will read the pattern and aim for it.`,
      },
      {
        id: 'avoidNames',
        briefLabel: 'Any names to avoid?',
        label: 'Names to avoid',
        prompt: 'Any names to steer clear of? Rivals, existing clubs, or names already taken in your league.',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Anything close to Riverside Rovers, they’re our rivals. And there’s already an FC United in our division.',
        hint: `Every league has its landmines: a rival’s name, a folded club everyone still remembers, a name already on the fixture list. Telling participants what’s off the table saves them from suggesting a name the room will instantly veto.`,
      },
    ],
  },

  // ── t2 · Band / music ──
  // 2026-08-17: keep "Tell us about the band" as the required description
  // opener, then genre. (The client suggested leading with genre, but the
  // brief needs a real description anchor first — genre alone is too thin.)
  // Legal-name and searchability questions dropped entirely —
  // "I'd like us not to address any legal stuff."
  t2: {
    label: 'Band / music project',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: 'Tell us about the band.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 4-piece dream-pop band from Bristol with one EP out. Booked for a small US tour in the fall and need a name we can grow into.',
      },
      {
        id: 'genre',
        label: 'Genre / Sound',
        prompt: `What’s your genre and sound?`,
        type: 'text',
        required: false,
        placeholder: 'e.g. Indie rock, hip-hop',
        hint: `Genres often have their own naming conventions. Metal favors names that feel powerful or intense: Slayer, Pantera, Megadeth. Indie bands often go literary, evocative, or unexpected: Fleet Foxes, Beach House, Bon Iver. Pop names tend to be broadly accessible and easy to say: The Weeknd, Maroon 5, Lady Gaga, 5 Seconds of Summer. Share the genre so participants know where to start, or what conventions they might break.`,
      },
      {
        id: 'originStory',
        label: 'Band origin story',
        prompt: `How did the band form? Any inside references or stories worth naming around?`,
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. All the band members have kids at the same school. We all love bad science fiction movies.',
        hint: `Fans inevitably ask, “How did you get your name?” A name with a good story gives people something to remember and talk about. Lynyrd Skynyrd took its name from a gym teacher, Radiohead from a Talking Heads song, and Foo Fighters from a World War II term for mysterious aerial sightings. Give participants some of the band's story or shared context, and they may find a name with meaning built in.`,
        guideId: 't2-firstsong',
      },
      {
        id: 'nameStyle',
        label: 'Naming territory',
        prompt: 'What naming territory fits your band? Pick any that apply.',
        type: 'multiChips',
        options: [
          { label: 'Pop culture',         eg: 'Radiohead' },
          { label: 'Inside jokes',        eg: 'Green Day, Garbage' },
          { label: 'Places',              eg: 'Cypress Hill' },
          { label: 'Food',                eg: 'The Cranberries' },
          { label: 'Names',               eg: 'Fleetwood Mac, Phish' },
          { label: 'Interesting words',   eg: 'Outkast, Ride' },
          { label: 'Meaningful phrases',  eg: 'AC/DC' },
          { label: 'Random combinations', eg: 'Arctic Monkeys' },
        ],
        hint: `Great band names can come from almost anywhere. These eight overlapping territories provide different ways into the creative process, from personal connections and pop-culture references to places, names, interesting words, and unexpected combinations. Explore several rather than locking into one. The goal is to give participants enough structure to spark ideas while leaving plenty of room for surprise.`,
        guideId: 't2-archetypes',
      },
      {
        id: 'admiredNames',
        briefLabel: 'Which band names do you admire?',
        label: 'Band names you admire',
        prompt: 'Which band or artist names do you love? They don’t need to match your genre.',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Fleetwood Mac, The National, Turnstile. Names that feel like a world you want to step into.',
        hint: `A few reference names tell participants more than a paragraph of description. Share the band names you find yourself admiring and say what you like about them: the sound, the imagery, the attitude. Participants will read the pattern and aim for it.`,
      },
      {
        id: 'avoidNames',
        briefLabel: 'Any names to avoid?',
        label: 'Names to avoid',
        prompt: 'Any names or directions to avoid? Similar-sounding acts count.',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Nothing too close to Velvet Nation, we gig with them.',
        hint: `The music world punishes name collisions: two similar acts split searches, playlists, and posters. If there’s a local band you share bills with or a direction you’ve grown out of, say so up front.`,
      },
    ],
  },

  // ── t3 · Podcast / Channel ──
  t3: {
    label: 'Podcast / channel',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: `Tell us about the show or concept. Who is it for, and where will they find it?`,
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A weekly podcast for first-time founders, on Spotify and YouTube with clips on TikTok. Honest conversations, no hype.',
        guideId: 't3-discovery',
      },
      {
        id: 'showDesc',
        label: 'What is your show about?',
        prompt: `What is the show about, and who is it for?`,
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: `Describe the show’s topic, angle, and target audience in 2-3 sentences...`,
        hint: `Be specific. “Tech” is too broad. “How solo founders build profitable SaaS businesses in under 12 months” is clear. Participants need to understand your show’s topic to name it well.`,
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
        prompt: `What’s the show’s tone and format? Pick any that apply.`,
        type: 'multiChips',
        options: ['Educational / Informative', 'Storytelling / Narrative', 'Interview-based', 'Comedy / Entertainment', 'News & Commentary', 'Any'],
        hint: `Tone affects the name hugely. A comedy podcast can be absurdist. An educational show needs clarity. An interview show might lean on the host’s personality. Share the tone so participants name appropriately.`,
        guideId: 't3-algorithm',
      },
      {
        id: 'compShows',
        label: 'Existing shows you admire (name style reference)',
        prompt: 'Any show or project names you admire?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Radiolab, Hidden Brain',
        hint: `Comparable show names give participants a useful sense of the territory you’re drawn to and what’s already out there. Share a few examples you like, and explain what you respond to about them. For example: “I like how How I Built This makes the subject clear, but I’d love something with more personality and intrigue, like Radiolab.”`,
      },
      {
        id: 'namingDirection',
        label: 'Naming territories',
        prompt: 'Which naming territories should participants explore? Pick any that apply.',
        type: 'multiChips',
        options: [
          { label: 'Says what it is',        eg: 'The Daily, How I Built This' },
          { label: 'Single evocative word',  eg: 'Serial, Heavyweight' },
          { label: 'Host-forward',           eg: 'The Joe Rogan Experience' },
          { label: 'A phrase with attitude', eg: 'Stuff You Should Know' },
          { label: 'Wordplay / pun',         eg: 'Pod Save America' },
          { label: 'Open to anything',       eg: null },
        ],
        allowCustom: true,
        hint: `Podcast names cluster into a few territories. Serial and Heavyweight bet on one evocative word; The Daily says exactly what it is; Pod Save America runs on the pun. Point participants at the territories that fit your show, or leave the door open.`,
      },
      {
        id: 'avoidNames',
        label: 'Names to avoid',
        prompt: 'Any names, words, or directions to avoid?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Nothing with “pod” in it. There’s already a show called Second Thoughts in our niche.',
        hint: `Podcast apps are crowded shelves. A name that collides with an existing show sends listeners to the wrong feed. Share the shows you’re avoiding overlap with and any words you’re tired of seeing in your category.`,
      },
    ],
  },

  // ── t4 · Club or civic group ──
  // 2026-08-17 client rescope (Maria/Mark): "Change this category to club or
  // civic group. If folks are naming a non-profit, they can use Business."
  // Mission / community-served / 50-year-longevity questions dropped (see
  // CUT_QUESTIONS) — these lighter groups don't need that framing.
  t4: {
    label: 'Club or civic group',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: 'What is this club or group, and what do you do together?',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A neighborhood chess club that meets Thursday nights at the library. About 20 regulars, all ages, half of us hooked since the pandemic.',
        guideId: 't4-community',
      },
      {
        id: 'orgType',
        label: 'Kind of group',
        prompt: 'What kind of group is this?',
        type: 'chips',
        options: ['Club or society', 'Civic or community group', 'Neighborhood association', 'Special-interest group', 'Other'],
        describeOption: 'Other',
        describePlaceholder: 'What kind of group is it?',
      },
      {
        id: 'vibe',
        label: 'Group vibe',
        briefLabel: 'Tone',
        prompt: `What’s the group’s vibe? Pick any that apply.`,
        type: 'multiChips',
        options: ['Welcoming / Inclusive', 'Fun / Social', 'Serious / Civic', 'Local / Grassroots', 'Spirited / Passionate'],
        allowCustom: true,
        hint: `The vibe steers the whole feel of a name. A welcoming book club and a spirited advocacy group want very different names, even in the same town. Tell participants the tone so the ideas match who you are.`,
        guideId: 't4-belonging',
      },
      {
        id: 'localConnection',
        label: 'Local connection',
        prompt: 'Is the group tied to a particular place or community?',
        type: 'text',
        required: false,
        placeholder: 'e.g. The Oak Park area',
        hint: `Many clubs and civic groups are rooted in a place, and that place can anchor a name. Share the neighborhood, town, campus, or region if it matters, or leave it blank if the group isn’t tied to one.`,
      },
      {
        id: 'story',
        label: 'Shared story',
        prompt: 'Any shared story, inside reference, or origin worth naming around?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Named after an inside joke',
        hint: `Group names with a story behind them tend to stick. If there’s a founding moment, an inside reference, or a reason you came together, share it — it often sparks the most meaningful names.`,
      },
      {
        id: 'mission',
        label: 'Mission / Purpose',
        prompt: `What’s the mission — who does it serve and what change does it create?`,
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: `What is this organization’s mission? Who does it serve? What change does it create?`,
        hint: `Civic names need to communicate purpose instantly. Describe your mission in 1-2 sentences. The best civic names are either crystal-clear (Habitat for Humanity) or deeply aspirational (Doctors Without Borders). Tell participants which direction to go.`,
        guideId: 't4-community',
      },
      {
        id: 'community',
        label: 'Community served',
        prompt: 'Who do you serve, and where?',
        type: 'text',
        placeholder: 'e.g. Families in the Oak Park district, youth ages 12-18, local small businesses...',
        hint: `Is this local (a specific neighborhood), regional, or aspiring to be national? Geographic scope affects whether a location should be in the name. “Riverside Community Garden” works locally but limits future expansion.`,
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
        hint: `Community organizations often outlast their founders. A name should work for 50+ years. Avoid trend-driven language, technology references, or anything that feels “of this moment.” Participants should know: is this meant to be timeless?`,
        guideId: 't4-longevity',
      },
      {
        id: 'admiredNames',
        label: 'Organization names you admire',
        prompt: 'Which organization or group names do you admire?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Feeding America says the mission in two words. We also like the warmth of The Neighborhood Table.',
        hint: `Reference names show participants the register you’re aiming for. Share a few organization names you admire, civic or otherwise, and what you like about them: the warmth, the clarity, the way they carry a mission.`,
      },
      {
        id: 'avoidNames',
        label: 'Names to avoid',
        prompt: 'Any names or words to steer clear of?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We can’t echo the Riverside Neighbors Association next door.',
        hint: `Civic names live in a neighborhood of other civic names. If a nearby group, a predecessor organization, or an overused word is off the table, tell participants so their ideas start from clear ground.`,
      },
    ],
  },

  // ── t5 · Gaming group ──
  t5: {
    label: 'Gaming group',
    suggestedDeadlineDays: 5,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: 'Tell us about the squad.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 6-player Valorant roster playing Diamond rank in NA East. Mix of an old college clan and two pickups — first time we’re properly registering as a team.',
      },
      {
        id: 'games',
        label: 'Games you play',
        prompt: 'Which games do you play together?',
        type: 'text',
        required: false,
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
        hint: `Competitive teams need names that convey threat. Casual groups can lean into personality and in-jokes. A name like “Ctrl+Alt+Delete” works for a casual squad but wouldn’t intimidate at a tournament.`,
      },
      {
        id: 'vibe',
        label: 'Vibe',
        briefLabel: 'Tone',
        prompt: `What’s the squad vibe? Pick any that apply.`,
        type: 'multiChips',
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
          { id: 'prefix', label: 'Prefix style', sublabel: '“Team X”, “FaZe X”, “Cloud9 X”' },
          { id: 'single-word', label: 'Single word / No tag', sublabel: '“Liquid”, “Sentinels”, “NaVi”' },
          { id: 'clan-suffix', label: 'Clan suffix', sublabel: '“X Gaming”, “X Esports”, “X GG”' },
          { id: 'any', label: 'No preference', sublabel: '' },
        ],
        hint: `Esports teams are often known by tag (FaZe) or full name (FaZe Clan). Some teams use “Gaming” or “Esports” as a suffix when entering tournaments. Tell participants what structure you want — especially if the tag (3-5 letters shown in-game) matters.`,
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
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: 'What is this group, and what do you do together?',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: `e.g. A monthly potluck club of 8 friends who’ve been meeting since college. Almost a decade in and someone finally said “we should name this.”`,
      },
      {
        id: 'groupDesc',
        label: 'Describe your group',
        prompt: 'What kind of group is this, and what do you do together?',
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: 'What kind of group is this? What do you do together? What makes your group unique?',
        hint: `The more context participants have, the better the names. What does your group do? Who’s in it? What makes you unique?`,
        guideId: 't6-identity',
      },
      {
        id: 'vibe',
        label: 'Group vibe / personality',
        briefLabel: 'Tone',
        prompt: `What’s the group’s vibe? Pick any that apply.`,
        type: 'multiChips',
        options: ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'],
        allowCustom: true,
      },
      {
        id: 'history',
        label: 'Any shared history or inside references?',
        prompt: 'Any shared story, inside reference, or place that means something to the group?',
        type: 'text',
        required: false,
        placeholder: 'e.g. We all met in Berlin',
        hint: `Group names with personal meaning create stronger belonging. If there’s a shared joke, a founding story, or a place that matters — share it. Participants who know the group well might suggest something that hits differently.`,
      },
      {
        id: 'namesConsidered',
        label: 'Names you’ve floated',
        prompt: 'Any names the group has already tried on, kept or rejected?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We almost went with The Committee, too stiff. Half of us still like Thursday Club.',
        hint: `Most groups arrive with a few half-names already in the air. Share them, including the rejects and why they missed. It gives participants a head start on your taste and stops them re-suggesting what you’ve already ruled out.`,
      },
      {
        id: 'avoidNames',
        label: 'Names to avoid',
        prompt: 'Any names that are off-limits or already taken?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Another crew at work already goes by The Regulars.',
        hint: `If a name is claimed by another group in your orbit, or just banned by popular vote, say so here.`,
      },
    ],
  },

  // ── p1 · Baby name ──
  p1: {
    label: 'Baby name',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: 'Tell us about the baby — anything that might help shape the name.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: `e.g. First baby, a girl, due in March. We want something timeless but not in this year’s top 100, and ideally something that travels well across our two families’ languages.`,
      },

      {
        id: 'dueDate',
        briefLabel: 'Due date',
        label: 'Due date',
        prompt: 'What is your baby’s due date?',
        type: 'date',
        required: false,
      },
      {
        id: 'gender',
        briefLabel: 'Gender',
        label: 'Do you know the gender?',
        prompt: 'Do you know the gender — or is it a surprise?',
        type: 'chips',
        options: ['Boy', 'Girl', 'Surprise', 'Prefer not to say'],
        hint: `If surprise, people can suggest both boy and girl names. You pick after baby arrives. We’ll keep all submissions organized.`,
      },

      {
        id: 'lastName',
        label: 'Last name (optional — helps test name flow)',
        prompt: 'What will be the baby’s last name?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Johnson, Park, Martinez',
        hint: `A proposed baby name should always be considered with the last name to make sure it flows naturally and doesn’t create unintended initials, associations, or unfortunate combinations. Also, long last names often pair better with short first names and vice-versa.`,
        guideId: 'p1-science',
      },
      {
        id: 'heritage',
        label: 'Cultural or heritage context',
        prompt: 'Are there any cultural or heritage connections the name should honor or reflect?',
        type: 'text',
        required: false,
        placeholder: 'e.g. Irish and Japanese',
        hint: `Names carry cultural weight. Sharing heritage helps participants suggest names that honor your roots — or names that work across cultures if that’s important to you. It also helps avoid names that mean something unfortunate in languages you’re connected to.`,
      },
      {
        id: 'lengthPref',
        briefLabel: 'Name length',
        label: 'Name length preference',
        prompt: 'Do you prefer short names, longer names (which may have more nickname options), or something in between?',
        type: 'chips',
        options: ['Short (1-2 syllables)', 'Medium (2-3 syllables)', 'Long (3+ syllables)', 'No preference'],
        hint: `Short names (Ava, Max, Zoe) are easy to say and remember, while longer names (Alexander, Genevieve) can offer more nickname possibilities. Think about how the name might be used at school, at work, and later in life—and whether you like having different versions to choose from.`,
        guideId: 'p1-lifetime',
      },
      {
        id: 'nicknamePreference',
        label: 'Nickname-friendly?',
        prompt: 'Do you want a name with a built-in nickname, or one used in full?',
        type: 'chips',
        options: ['Yes — should have a natural nickname', 'No — use the full name only', 'Flexible either way'],
        hint: `Some parents want only the full name used (no “Rob” for Robert, no “Liz” for Elizabeth). Others want a formal name with a built-in nickname. A few want something that can’t be shortened. This shapes which names participants should suggest.`,
      },
      {
        id: 'avoidInitials',
        label: 'Initials to avoid',
        prompt: 'Any initial combinations to avoid?',
        type: 'text',
        required: false,
        placeholder: `e.g. Avoid initials “E.D.” or anything that spells something unfortunate`,
        hint: `The initials test. “ASS”, “DIE”, “FAT” — people have been caught off guard. Participants who know the last name can avoid unfortunate combinations. Share if there are initial sequences to avoid.`,
      },
      {
        id: 'traditions',
        label: 'Family naming traditions',
        prompt: 'Any family naming traditions to honor?',
        type: 'text',
        required: false,
        placeholder: `e.g. First child always has the father’s name as middle name, names starting with “M” for tradition...`,
      },
      {
        id: 'exploreDirections',
        label: 'Directions to explore',
        prompt: 'Is there anything you’d like folks to specifically explore, like names that start with a certain letter, a connection to a sibling name, or a family tradition?',
        type: 'text',
        required: false,
        placeholder: `e.g. Match a sibling’s initial`,
      },
      {
        id: 'avoidDirections',
        label: 'Anything to avoid?',
        prompt: 'Is there anything folks should specifically avoid, like names that start with a certain letter to avoid awkward initials, relatives’ names, or anything off the table?',
        type: 'text',
        required: false,
        placeholder: `e.g. Avoid the letter “K”`,
        hint: `Participants will see this, so they know what to steer clear of.`,
      },
      {
        id: 'namesConsidered',
        label: 'Names you’ve considered',
        prompt: 'Any names already on your shortlist, or ones you had to rule out?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Nora is on our list but a cousin claimed it. We loved Ivy until it went everywhere.',
        hint: `Your shortlist so far is the fastest way to show participants your taste. Share the names still in the running and the ones you had to let go, with the reason. Near-misses point straight at what the right name feels like.`,
      },
    ],
  },

  // ── p2 · Pet name ──
  p2: {
    label: 'Pet name',
    suggestedDeadlineDays: 5,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: 'Tell us about the pet — personality, looks, anything fun.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 10-week-old female golden retriever puppy. Goofy, sleeps in weird positions, and has a permanent zoomies mode. Will be our first dog.',
      },
      {
        id: 'petType',
        briefLabel: 'Kind of pet',
        label: 'What kind of pet?',
        prompt: `What kind of pet are you naming?`,
        type: 'chips',
        options: ['Dog', 'Cat', 'Bird', 'Reptile', 'Rabbit / Small Animal', 'Fish / Aquatic', 'Other'],
        describeOption: 'Other',
        describePlaceholder: 'e.g. Ferret, horse, tortoise',
        required: true,
      },
      {
        id: 'breed',
        label: 'Breed, looks, and personality',
        prompt: 'Describe their breed, appearance, and personality',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Golden retriever puppy, goofy and permanently mid-zoomie',
        hint: `Breed, looks, and personality all spark names. A Chihuahua named “Bruno” is funny; a Great Dane named “Peanut” is funnier. And the name should fit the animal: “Chaos” for a hyperactive dog, “Professor” for a dignified cat.`,
        guideId: 'p2-personality',
      },
      {
        id: 'petPersonality',
        label: 'Describe their personality',
        prompt: `Describe their personality in a sentence or two.`,
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: `“Chaotic gremlin energy” or “Regal and aloof” or “Timid but playful once comfortable”`,
        hint: `The name should fit the animal. “Chaos” works for a hyperactive dog. “Professor” works for a dignified cat. Share what you’ve noticed — their quirks, habits, or early personality signals — and let participants match the name to the animal.`,
      },
      {
        id: 'callNamePref',
        label: 'Call name preference',
        prompt: 'How short does the call name need to be?',
        type: 'chips',
        options: ['Short call name (1-2 syllables)', 'Medium (2-3 syllables)', 'Longer / regal name', 'No preference'],
        hint: `The call name principle: dogs especially respond best to names ending in a vowel sound (Bella, Benny, Luna) because they’re acoustically distinct. Short names are easier to shout across a park. Longer names work when you mostly use them at home.`,
      },
      {
        id: 'nameTone',
        label: 'Tone / naming style',
        briefLabel: 'Tone',
        prompt: 'What naming tone fits them? Pick any that apply.',
        type: 'multiChips',
        options: ['Dignified / Regal', 'Playful / Funny', 'Cute / Sweet', 'Tough / Strong', 'No preference'],
        allowCustom: true,
        guideId: 'p2-callname',
      },
      {
        id: 'avoidNames',
        label: 'Any names to avoid?',
        prompt: 'Any names already taken or off-limits?',
        type: 'text',
        required: false,
        placeholder: `e.g. Names already taken`,
      },
      {
        id: 'namesConsidered',
        label: 'Names you’ve considered',
        prompt: 'Any names you’ve already considered or almost used?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We keep coming back to Miso but it doesn’t feel quite right. Rejected Rex, too common.',
        hint: `The names you’ve circled and the ones you’ve rejected are both signals. Share your shortlist so far and what stopped each one; participants will aim closer on the first try.`,
      },
    ],
  },

  // ── p3 · Home / Property / Fun ──
  p3: {
    label: 'Home, WiFi network, boat, and more',
    suggestedDeadlineDays: 7,
    questions: [
      {
        id: 'projectSummary',
        label: 'About this',
        prompt: 'Tell us about the place.',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: 'e.g. A 1920s lake cabin in northern Wisconsin we just inherited from my grandmother. Sits between two big pines, the dock is original, and the kitchen still has her wallpaper.',
      },
      {
        id: 'namingTarget',
        briefLabel: 'What’s being named',
        label: 'What are you naming?',
        prompt: 'What are you naming?',
        type: 'chips',
        options: ['House / Home', 'Vacation Home / Cabin', 'Boat / Watercraft', 'Car / Vehicle', 'WiFi network', 'Other'],
        describeOption: 'Other',
        describePlaceholder: 'e.g. A treehouse, a fire pit, a boat trailer',
        required: true,
      },
      {
        id: 'propDesc',
        briefLabel: 'What makes it special?',
        label: 'Tell people about it',
        prompt: 'Tell people about it — what makes it special?',
        type: 'textarea',
        rows: 3,
        required: false,
        placeholder: 'e.g. A 1920s craftsman bungalow with a big porch, always full of people on summer evenings',
        hint: `A little context sparks better names. Is there something unique about this place or thing? A quirk, a story, a feeling? Research shows named spaces are used more, cared for more, and remembered more fondly — the name you pick will become part of the story you tell about this place.`,
        guideId: 'p3-places',
      },
      {
        id: 'location',
        label: 'Location / environment',
        prompt: 'Where is it, or what surrounds it? If this isn’t a place or property, skip to the next question.',
        type: 'text',
        required: false,
        placeholder: 'e.g. A lakefront cabin',
        hint: `Local geography, nature, or architectural style can inspire names that feel native to the place — a cabin in the Adirondacks has different naming territory than a beach house in the Florida Keys.`,
      },
      {
        id: 'vibe',
        label: 'Vibe / personality',
    briefLabel: 'Tone',
        briefLabel: 'Tone',
        prompt: `What is the general tone of the name you’re looking for? Pick any that apply.`,
        type: 'multiChips',
        options: ['Cozy / Warm', 'Adventurous / Outdoorsy', 'Elegant / Sophisticated', 'Funny / Playful', 'Intellectual / Scientific', 'Not sure'],
      },
      {
        id: 'signDisplay',
        label: 'Will the name appear on a sign or plaque?',
        prompt: 'Will the name appear on a sign, plaque, hull, or other physical display?',
        type: 'chips',
        options: ['Yes — will be on a sign/plaque', 'Just for us, informal use', 'Not decided yet'],
        hint: `If so, consider how the name will look as well as how it sounds. Think about length, readability, and how it will appear in the typeface or lettering style you have in mind. A name that sounds perfect but becomes hard to read when engraved, painted, or viewed from a distance may not be the best fit.`,
        guideId: 'p3-stick',
      },
      {
        id: 'languagePref',
        label: 'Language preference',
        prompt: 'English only, or open to other languages?',
        type: 'chips',
        options: ['English only', 'Open to other languages', 'Specific language'],
        describeOption: 'Specific language',
        describePlaceholder: 'e.g. French, Japanese',
      },
      {
        id: 'avoidNames',
        label: 'Names or words to avoid',
        prompt: 'Any words or concepts that should be off the table?',
        type: 'text',
        required: false,
        placeholder: `e.g. Avoid “haven”`,
      },
      {
        id: 'namesConsidered',
        label: 'Names you’ve considered',
        prompt: 'Any names you’ve tried on for it already?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We called it The Nest for a summer but it never stuck. Something with more of the lake in it.',
        hint: `Places often carry a working nickname before they get a real name. If you’ve tried anything on, share it and say why it didn’t stick. The gap between almost-right and right is where good suggestions live.`,
      },
    ],
  },

  // ── p4 · Other personal — no legacy content, t6-style fallback ──
  p4: {
    label: 'Something else (personal)',
    suggestedDeadlineDays: 10,
    questions: [
      {
        id: 'projectSummary',
        briefLabel: 'In short',
        label: 'About this',
        prompt: 'What are you naming, and what makes it special?',
        type: 'textarea',
        rows: 3,
        required: true,
        placeholder: `e.g. Our weekly Saturday brunch crew — 6 friends, 4 years, still unnamed`,
        guideId: 'p4-generic',
      },
      {
        id: 'groupDesc',
        label: 'Describe what you are naming',
        prompt: `In a few sentences, tell people what you’re naming and what makes it special.`,
        type: 'textarea',
        rows: 4,
        required: false,
        placeholder: `What is this? Who is it for? What makes it special?`,
        hint: `The more context participants have, the better the names.`,
        guideId: 'p4-generic',
      },
      {
        id: 'vibe',
        briefLabel: 'Tone',
        label: 'Vibe / personality',
        prompt: 'What vibe should the name carry? Pick any that apply.',
        type: 'multiChips',
        options: ['Cozy / Warm', 'Elegant / Sophisticated', 'Funny / Playful', 'Aspirational', 'Not sure'],
      },
      {
        id: 'history',
        label: 'Any shared story or context?',
        prompt: 'Any shared story or moment worth naming around?',
        type: 'text',
        required: false,
        placeholder: 'e.g. An old inside joke',
        guideId: 'p4-collective',
      },
      {
        id: 'namesConsidered',
        label: 'Names you’ve floated',
        prompt: 'Any names you’ve already tried on, kept or rejected?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. We tried The Brunch Bunch for a week. Too cute. Somebody keeps pushing Sunday Service.',
        hint: `Most groups arrive with a few half-names already in the air. Share them, including the rejects and why they missed. It gives participants a head start on your taste and stops them re-suggesting what you’ve already ruled out.`,
      },
      {
        id: 'avoidNames',
        label: 'Names to avoid',
        prompt: 'Any names that are off-limits or already taken?',
        type: 'textarea',
        rows: 2,
        required: false,
        placeholder: 'e.g. Please, nothing with “squad” in it.',
        hint: `If a name is claimed elsewhere in your orbit, or just banned by popular vote, say so here.`,
      },
    ],
  },
};

// 2026-08-18: Product (b2) is its own brief again — Maria sent product-specific
// questions, so b2 uses the distinct set defined above (built on Company's
// shared questions plus product context + a product-vs-company guide). The
// 2026-07-13 "mirror b1" override was removed.

// ────────────────────────────────────────────────────────────────
// 2. SHARED_SETTINGS_QUESTIONS — appended to every brief
// ────────────────────────────────────────────────────────────────
export const SHARED_SETTINGS_QUESTIONS = [
  {
    id: 'anonymity',
    type: 'radioCards',
    label: 'Credit',
    prompt: 'How should people’s names appear with their submissions?',
    defaultValue: 'Let participants choose',
    options: [
      {
        id: 'participant',
        label: 'Let participants choose',
        sublabel: 'Each person decides — credited or anonymous, name by name',
        recommended: true,
      },
      {
        id: 'public',
        label: 'Public',
        sublabel: 'Every name shows who suggested it',
      },
      {
        id: 'anonymous',
        label: 'Anonymous',
        sublabel: 'No names are credited to anyone',
      },
    ],
    hint: `Participants can choose to be credited or stay anonymous, or you can set one approach for everyone. Some people like getting credit for a clever name; others would rather keep it private.`,
  },
  {
    id: 'submissionLimit',
    type: 'numberChips',
    // 2026-08-18 client decision: 1 / 2 / 3 / 5 / 10. The database enforces
    // the same 10 ceiling (migration 0025), so this list is the polite
    // version of a rule that holds either way.
    options: [1, 2, 3, 5, 10],
    defaultValue: 3,
    label: 'Submissions per person',
    prompt: 'How many names can each person submit?',
    hint: `3 is the default and works for most groups. Pick 1 or 2 when you want people to commit to their single best ideas, or 5 to 10 when the group is small and you need volume.`,
  },
  // Custom branding moved out of the brief — handled at the winner
  // stage instead, where it directly customizes the share card.
  {
    id: 'submitterPrize',
    type: 'toggleNameDesc',
    defaultValue: false,
    hideWhen: { contestType: 'voting_only' },
    label: 'Winner prize',
    prompt: 'Want to offer a prize for the winning name?',
    description: 'Reward the person who submitted the winning name',
    namePlaceholder: 'Prize name (e.g. $50 gift card)',
    descPlaceholder: 'Prize description (optional)',
    hint: `A small reward—a gift card, a shout-out, or something else—can get more people submitting. Totally optional. If you do offer a prize, you're responsible for providing it to the winner.`,
  },
  // 2026-08-18: ONE schedule question replaces the two window questions.
  // Rendered as a vertical roadmap (Launch → Submissions → Names in →
  // Voting → Winner); tapping a leg opens a focused picker (day chips per
  // the client: submissions 1/2/5/7/10 rec 5, voting 1/2/3/5 rec 3, plus
  // 3/6/12h same-day presets stored as day fractions), then returns to the
  // roadmap. Continue submits BOTH values, still stored as
  // settings.submissionDays / settings.votingDays so launch, cron, and
  // every reader are untouched.
  {
    id: 'schedule',
    type: 'contestSchedule',
    label: 'Schedule',
    prompt: 'How long should your contest run?',
    // One standardized scale for BOTH stages, from a 3-hour sprint to 10
    // days (hours store as day fractions). Only the recommendation differs.
    dayOptions: [1, 2, 3, 5, 7, 10],
    hourOptions: [3, 6, 12],
    subDefault: 5,
    voteDefault: 3,
    hint: `Here’s your contest from launch to winner. Tap a stage to change how long it runs; most contests do well with 5 days of submissions and 3 of voting.`,
  },
];

// ────────────────────────────────────────────────────────────────
// 2b. BRIEF_CLOSING_QUESTIONS — appended to the END of every brief's
// effective question list (see getQuestionsFor). customRequirements moved
// here from SHARED_SETTINGS_QUESTIONS on 2026-08-17: it's creative fodder
// that also reaches participants, so it belongs with the brief, not the
// logistics settings (client note: "should appear higher up... more about
// the creative fodder than the logistics/settings"). Stored under
// setup.brief.customRequirements; older contests keep it under settings and
// the readers fall back for display.
// ────────────────────────────────────────────────────────────────
// ────────────────────────────────────────────────────────────────
// 2a. INTRO_QUESTION — the creator's personal note to participants
// (client request 2026-08-18: "Write a short intro paragraph to your
// participants"). NOT part of any chat flow: it's written on the REVIEW
// page, after the creator has seen their whole brief — a cover letter is
// written last. Stored at brief.intro; shown at the top of the join page
// and both participant brief cards. Required to launch.
// ────────────────────────────────────────────────────────────────
export const INTRO_QUESTION = {
  id: 'intro',
  label: 'Intro to participants',
  prompt: 'One last thing: write a short intro for your participants. It opens your invitation, so it’s the first thing they read.',
  type: 'textarea',
  rows: 4,
  required: true,
  hint: `A couple of sentences in your own voice: what you’re naming, what would make a great name, and a little enthusiasm. It sits above the brief on every page your participants see.`,
  placeholder: `e.g. Please help us name our new band! We're an all-girl punk group with a shared obsession with cats, and we're after something catchy and unusual. The guidelines are below, but use your imagination. Can't wait to see your ideas!`,
};

// Per-category intro placeholders — the example a baby-naming parent needs is
// not the one a founder needs. Falls back to INTRO_QUESTION.placeholder for
// unmapped ids (b3/b4, future categories).
export const INTRO_PLACEHOLDERS = {
  p1: `e.g. We're expecting a baby girl in March and would love your help finding her name! We like timeless names that aren't in this year's top 100. Can't wait to see your ideas!`,
  p2: `e.g. Help us name our new golden retriever puppy! She's goofy, fearless, and sleeps in the strangest positions. We'd love a name that's as fun as she is.`,
  p3: `e.g. We finally have the lake cabin of our dreams, and it needs a name! Something warm and a little witty that looks right on a sign by the door. Excited to see your ideas!`,
  p4: `e.g. Our Saturday brunch crew has gone four years without a name, and it's time to fix that. Help us find something that captures the chaos. Best idea earns eternal glory!`,
  t1: `e.g. Our Sunday soccer team needs a real name before the season starts! We're scrappy, loud, and more serious than we look. Give us something we can chant from the sideline!`,
  t2: `e.g. Please help us name our new band! We're an all-girl punk group obsessed with cats, and we want something catchy and unusual. Use your imagination, and have fun with it!`,
  t3: `e.g. We're launching a podcast where first-time founders tell the truth about year one, and it needs a name! Something sharp people will remember. Can't wait to hear your ideas!`,
  t4: `e.g. Our Thursday-night chess club has officially outgrown "the chess club", and we want a proper name! Something welcoming with a bit of wit. Help us out!`,
  t6: `e.g. We've been meeting for years and still don't have a name, and it's starting to get embarrassing. Help us find one that feels like us. Best suggestion wins bragging rights!`,
  b1: `e.g. We're launching our new company and need a name that sticks! We roast small-batch coffee for cafés across the Midwest, and we'd love something warm and confident. Thanks for helping us name this thing!`,
  b2: `e.g. Help us name our newest product! It's a hot sauce made with fermented local peppers, flavor first, and the name should be as bold as the sauce. Excited for your ideas!`,
  b5: `e.g. We're naming our company's new innovation program and want your ideas! It runs two hackathons a year and deserves better than "the program". Have fun with this one!`,
};

export function getIntroQuestionFor(subId) {
  const placeholder = INTRO_PLACEHOLDERS[subId];
  return placeholder ? { ...INTRO_QUESTION, placeholder } : INTRO_QUESTION;
}

export const BRIEF_CLOSING_QUESTIONS = [
  {
    id: 'customRequirements',
    type: 'toggleTextarea',
    defaultValue: false,
    label: 'Custom requirements',
    prompt: 'Anything else you’d like to add?',
    placeholder: `e.g. A word to avoid, or a language it should work in`,
    hint: `Add anything else that would be helpful. Skip if there’s nothing.`,
  },
];

// ────────────────────────────────────────────────────────────────
// 3. ARTICLES — long-form CREATOR_ARTICLES content per sub-segment
//    (strict per-sub-segment scoping — never reused cross-tier)
// ────────────────────────────────────────────────────────────────
export const ARTICLES = {
  // ── b1 · Company / startup ──
  // The two live b1 guides (2026-07-10) — written for the client 10-question
  // set, fact-checked against primary sources; drawing on Catchword's
  // "Creating the Perfect Name" guide for the taxonomy and selection wisdom.
  b1: [
    {
      id: 'b1-origins',
      title: 'Great Names Can Come From Anywhere',
      readTime: '4 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'Every great name looks inevitable — later',
          body: `Amazon. Google. Starbucks. Say them now and they sound like they were always destined to exist. They weren’t. Behind many famous names is a winding path of ideas, arguments, accidents, associations, and near-misses. Sometimes inspiration comes from an unexpected place. The challenge isn’t simply having an idea — it’s recognizing when an idea has the potential to become a great name.`,
        },
        {
          heading: 'The ice cream invented at a kitchen table',
          body: `In 1959, Reuben Mattus, a Polish-born ice cream maker working in the Bronx, wanted a name that sounded Danish, inspired by Denmark’s protection of Jews during the war. His daughter recalled him sitting at the kitchen table for hours, experimenting with sounds until a combination felt right. He landed on Häagen-Dazs. It means nothing in Danish, and the umlaut isn’t Danish either. But Mattus understood that the unfamiliar name would attract attention. Sometimes a name’s power comes from how it sounds and feels, not what it literally means.`,
        },
        {
          heading: 'The bookstore saved by a mishearing',
          body: `Jeff Bezos incorporated his company in 1994 as Cadabra, Inc., short for abracadabra. It didn’t last long: his lawyer kept hearing “cadaver” on the phone. Bezos went looking for a replacement, reportedly favoring a name beginning with A, and landed on Amazon, the world’s largest river. The name connected naturally to his ambition for the world’s largest bookstore — and eventually much more.`,
        },
        {
          heading: 'The search engine that misspelled itself',
          body: `Google began life as BackRub, a reference to its analysis of the web’s “back links.” In 1997, a brainstorming session produced the word “googol,” the mathematical term for the number 1 followed by 100 zeros. When someone checked the domain, the word was entered incorrectly. Larry Page liked “Google” better. A typo became one of the world’s most recognizable names.`,
        },
        {
          heading: 'A near-miss and a bottle of wine',
          body: `Starbucks was nearly called Pequod, after the ship in Moby-Dick, until the founders decided it wasn’t quite right. A search for alternatives led to Starbo, an old mining site near Mount Rainier, and ultimately to Starbuck, the Pequod’s first mate. And Lego? In 1934, its founder held a naming contest among his employees, offering a bottle of homemade wine as the prize. He ultimately chose his own suggestion, derived from the Danish phrase leg godt, meaning “play well.”`,
        },
        {
          heading: 'What this means for your contest',
          body: `Great names can start with a sound, a story, a place, a personal connection, a cultural reference, or even an unexpected mistake. That’s one reason a diverse group can be valuable: different people notice different possibilities. Your job in this brief isn’t to come up with the answer yourself. It’s to give participants enough context to understand what you’re naming, what it needs to accomplish, and what territory might be worth exploring. From there, the best ideas can emerge — and the strongest can be recognized, refined, and tested.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Great names rarely arrive with a flashing sign that says “this is it.” They emerge through exploration, comparison, and refinement. A naming contest can widen the field of ideas and bring unexpected possibilities to the table.`,
      },
    },
    {
      id: 'b1-styles',
      title: 'Real, Coined or Compound?',
      readTime: '4 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Three ways to build a name',
          body: `Great names can be built in different ways. Some borrow a word that already has meaning. Some create a new word from existing sounds, roots, or ideas. Others combine familiar words to create something new. None is inherently better. Each offers a different balance of familiarity, distinctiveness, meaning, and flexibility.`,
        },
        {
          heading: 'Real words: meaning you already know',
          body: `Apple. Amazon. Nest. Denim. Real words come with associations built in, which can make them elegant, memorable, and emotionally resonant from the start. The challenge is distinctiveness: familiar words can be harder to search for and protect as trademarks. But an unexpected connection can be powerful. Apple has nothing to do with computers; Denim has nothing to do with freight finance. That distance can make a familiar word feel fresh in an unexpected context.`,
        },
        {
          heading: 'Coined names: create something new',
          body: `Zappos. Verizon. Versant. Google. Coined names are newly created, but they don’t have to be completely invented. They can combine or modify existing words, roots, sounds, or ideas to create something distinctive. Versant draws on “versatile” and “conversant”; Verizon combines ideas of verity and horizon. Google began with “googol,” then took on its own identity through a playful spelling. The best coined names can feel new while still giving people something to understand, remember, or discover.`,
        },
        {
          heading: 'Compound names: put ideas together',
          body: `YouTube. Keysight. Facebook. Upwork. Compound names bring two or more recognizable words or word elements together to create a new idea. YouTube and Facebook are straightforward combinations; Keysight pairs “key” with “sight” to suggest important insight. Upwork is a more natural coining, combining “up” and “work” to suggest elevating or improving work. The combination can be literal, suggestive, or unexpected.`,
        },
        {
          heading: 'Which approach feels right?',
          body: `Think about how much meaning you want to inherit versus create. A real word brings established associations. A coined name lets you shape something new around an idea or linguistic connection. A compound uses familiar building blocks to create a fresh concept. You don’t need to choose one approach before seeing the ideas. If you’re open to all three, exploring them can reveal a direction you hadn’t considered.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The best naming process doesn’t assume that one construction is always right. It explores different ways of creating meaning, then weighs the strongest candidates against what the name needs to accomplish.`,
      },
    },
    {
      id: 'b1-arc',
      title: 'The 3 Name Archetypes That Win',
      readTime: '3 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Not all names are created equal',
          body: 'Every company name fits one of five archetypes — but for a brand-new name, three do the heavy lifting: Descriptive, Suggestive, and Abstract/Coined. (The other two — a repurposed real word like Apple, or a founder/acronym like Dell — can work, but rarely beat these three out of the gate.) Each of the three has tradeoffs, and knowing them is the difference between a name that constrains you at Series B and one that grows with you to IPO.',
        },
        {
          heading: 'Descriptive names (QuickBooks, PayPal)',
          body: `They tell you what they do. Good for early traction, SEO, zero ambiguity. Bad for future pivots, trademark protection, and global expansion. Rule of thumb: if you’re 100% confident in your category and positioning for the next 10 years, descriptive can work. If not, think twice.`,
        },
        {
          heading: 'Suggestive names (Salesforce, Shopify, Slack)',
          body: `They hint at the benefit without stating it literally. Most Fortune 500 tech companies live here. Why? Trademarkable + memorable + flexible as the business evolves. “Salesforce” became a CRM AND a marketing platform AND an AI company without the name fighting back.`,
        },
        {
          heading: 'Abstract/Coined names (Google, Kodak, Xerox)',
          body: 'Meaningless until you make them mean something. Hardest to launch, strongest moat once established. These require the most marketing investment but provide the deepest long-term competitive advantage — no one can accidentally use your name in a sentence.',
        },
      ],
      callout: {
        type: 'example',
        text: `Slack started as a gaming company’s internal tool. A descriptive name like “TeamChat” would have fought the pivot to enterprise. An abstract name gave them a clean surface to project any meaning onto.`,
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
          body: 'If five of your competitors have two-syllable, suggestive names — do not be the sixth. Brand-distinctiveness research is blunt about this: in one analysis of over 5,000 brand assets, fewer than one in five were actually distinctive. Most brands blend in. The competitor field in your brief is the highest-leverage field you will fill out.',
        },
        {
          heading: 'What to look for',
          body: `List 5 competitors and analyze: What archetype? What length? What tone (serious, playful, technical)? Where there’s density — that’s exactly where your name should not be.`,
        },
        {
          heading: 'The pattern break wins',
          body: 'When HubSpot launched, every CRM was descriptive or founder-named. HubSpot was a compound abstract — stood alone immediately. When Notion launched against Evernote, Confluence, OneNote — they chose a single abstract word. They owned that positioning.',
        },
      ],
      callout: {
        type: 'insight',
        text: `The sweet spot: sounds like it belongs in your category, but doesn’t sound like anyone already there.`,
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
          body: `Most organizers share too little context, afraid of “leading” participants. This is backwards. The more specific context you give, the more creative and on-target submissions become. Vague brief → creative anxiety → generic submissions. “Make us something catchy” is not a brief.`,
        },
        {
          heading: 'What participants actually need',
          body: `They need: What you do (2-3 sentences), who it’s for (specific, not “everyone”), what the name should signal (your tone/archetype preference), what the competition looks like (so they can differentiate), and what to avoid (saves everyone time).`,
        },
      ],
      callout: {
        type: 'warning',
        text: `Warning: “I’ll know the right name when I see it” is not a brief. That’s a wish. Great briefs define success criteria before the contest starts — so participants aim at a defined target, not a moving one.`,
      },
    },
  ],

  // ── b2 · Product / service ──
  b2: [
    {
      id: 'b2-vs-company',
      title: 'Product Names Play by Different Rules',
      readTime: '2 min',
      icon: 'Compass',
      sections: [
        {
          heading: 'A company name has to hold everything',
          body: `A company name represents the whole organization: every product it sells today, everything it might do in ten years, and the culture of the people behind it. That tends to push company names toward the broad and flexible. Amazon started with books, and the name had room for everything that came after. A name that locks a company into one offering can become a constraint as the business grows.`,
        },
        {
          heading: 'A product name can be more focused',
          body: `A product name has one job: to represent this particular offering to the people who will buy and use it. That freedom lets it tie more closely to a specific feature, benefit, or feeling. Calm names the exact result of using the app. Post-it describes what the product does in two syllables. Sharpie captures the pen’s defining quality. A product name can be more literal, more playful, or more pointed than a company name could afford to be.`,
        },
        {
          heading: 'The name doesn’t stand alone',
          body: `Unlike a company name, a product name usually appears next to other names: the company’s, and often its sibling products’. Google Maps and Google Docs lean on the parent and stay simple. Tide and Pampers stand fully on their own, and many people never think about P&G behind them. Courtyard by Marriott sits in between, borrowing credibility while keeping its own identity. Knowing how your product name will sit alongside your brand tells participants what kind of name to aim for.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `A company name is a promise about who you are. A product name is a promise about what this one thing does. The more clearly you define that narrower promise in your brief, the sharper the name ideas will be.`,
      },
    },
    {
      id: 'b2-styles',
      title: 'Real, Coined or Compound?',
      readTime: '4 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Three ways to build a product name',
          body: `Great product names can be built in different ways. Some borrow a word that already has meaning. Some create a new word from existing sounds, roots, or ideas. Others combine familiar words to create something new. None is inherently better. Each offers a different balance of familiarity, distinctiveness, meaning, and flexibility.`,
        },
        {
          heading: 'Real words: meaning you already know',
          body: `Kindle. Tide. Bounce. Ring. Real words come with associations built in, which can make a product feel understood at a glance. Kindle has nothing literally to do with e-readers, but it sparks exactly the right idea of starting a fire for reading. Tide and Bounce borrow everyday words that carry freshness and lightness straight onto a laundry shelf. The challenge is distinctiveness: familiar words can be harder to search for and protect as trademarks, so the unexpected connection is where the power is.`,
        },
        {
          heading: 'Coined names: create something new',
          body: `Swiffer. Febreze. Prius. Advil. Coined names are newly created, but the best ones still whisper their meaning. Swiffer sounds like the swift sweep it does; Febreze blends “fabric” and “breeze”; Prius comes from the Latin for “to go before.” A coined name is the easiest to own and trademark, and it can grow into a family of its own — Swiffer became Swiffer WetJet and Swiffer Duster without missing a step.`,
        },
        {
          heading: 'Compound names: put ideas together',
          body: `PowerPoint. AirPods. PlayStation. Photoshop. Compound names weld two recognizable words into one new idea, and the meaning assembles itself on first read — you know roughly what a PlayStation is before anyone explains it. The combination can be literal (Photoshop), suggestive (PowerPoint), or playful (AirPods), and compounds tend to sit comfortably next to a company name.`,
        },
        {
          heading: 'Which approach fits your product?',
          body: `Think about how much meaning you want to inherit versus create. A real word brings instant associations to the shelf or the app store. A coined name gives you something ownable that can anchor a whole product line. A compound explains itself fastest, which helps when a product is new and unfamiliar. You don’t need to choose before seeing the ideas — if you’re open to all three, the contest can reveal a direction you hadn’t considered.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The best naming process doesn’t assume that one construction is always right. It explores different ways of creating meaning, then weighs the strongest candidates against what this product’s name needs to accomplish.`,
      },
    },
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
          body: `Branded House (Google, Apple): every product extends the master brand. House of Brands (P&G, Unilever): each product is standalone — consumers don’t know the parent. Endorsed Brand (Marriott Courtyard): parent lends credibility, product has distinct identity.`,
        },
        {
          heading: 'Which model is right?',
          body: `Branded house works when the parent brand is strong and consistent. House of brands works when products serve radically different markets. Tell participants which model you’re using — it completely changes what “good” looks like for a submission.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Salesforce chose branded house → Sales Cloud, Service Cloud, Marketing Cloud. Every product extends the master. Consistent, scalable — but every product must feel “salesforce-y.” Choose your architecture before you brief.`,
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
          body: `Company names compete in a broad landscape. Product names must work in context: alongside your company name, your other products, competitors’ products, and in specific usage contexts (app store, sales deck, support ticket). Each context adds pressure the company name never faces.`,
        },
        {
          heading: 'The precision requirement',
          body: `A new product name often has to work on first contact — in a headline, a demo, a pitch. If it doesn’t land in 3 seconds, it’s working against your sales team, not for them. Precision matters more in product naming than in company naming.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The best product name has a “job.” AirPods = air (wireless, invisible) + pods (small, self-contained). Clear benefit, suggests the experience, in two syllables. Know the job before you name.`,
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
          body: `Hard consonants (K, T, B, P) signal speed, strength, and precision. Soft sounds (L, M, S, vowel-heavy names) signal ease, warmth, and approachability. “Crisp” feels sharper than “Smooth.” Neither is wrong — but the phonetic profile of your product name creates subconscious expectations before a customer reads a single word of copy.`,
        },
        {
          heading: 'Onomatopoeia is one option when speed is the point',
          body: `When your product’s core benefit is speed or instantness, a name that sounds like the experience it delivers can be processed faster and remembered longer. “Zip” for a file compressor. “Zoom” for anything that should feel instant. It’s a narrow tool, not a universal one — it works when the sound genuinely matches the benefit, and falls flat when it’s forced. The product name that sounds like its core benefit is doing double marketing duty every time someone says it aloud.`,
        },
        {
          heading: 'Apply this to your brief',
          body: `Think about how your product feels to use — fast, calm, precise, expansive, warm? Write that adjective down before you brief. Tell participants the emotional experience the name should evoke. Sound design in naming is invisible when done right and glaring when wrong.`,
        },
      ],
      callout: {
        type: 'example',
        text: `“Zoom” — short, explosive, onomatopoeic. You feel the speed before you know it’s a video tool. Compare to “WebEx” — technical, hyphenated, sounds like IT infrastructure. Same category, completely different phonetic signal.`,
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
          heading: `What’s in a project name?`,
          body: `More than you think. A name gives people something to rally behind — “Torque shipped” lands differently than “data-sync v2 deployed.” A great project name creates a shared mental model, motivates ownership, and makes status updates feel like progress rather than reporting.`,
        },
        {
          heading: '“Project Phoenix” has been done to death',
          body: `Phoenix, Titan, Horizon, Apollo, Catalyst — the cargo shorts of project naming. They’re so overused they signal nothing: each one could belong to any project at any company, which means none of them belong to yours. A name that could mean anything ends up meaning nothing. The names that actually work are either (a) crystal-clear about the goal, or (b) specific to your culture — something outsiders wouldn’t get but insiders feel.`,
        },
      ],
      callout: {
        type: 'example',
        text: `Google’s “Project Loon” (internet balloons) captured both the literal mechanism and the audacious feeling of the work. The name became a cultural touchstone inside and outside the company.`,
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
          body: '“Customer Portal Migration,” “Q4 Data Architecture Upgrade.” Pros: zero ambiguity, perfect for regulatory contexts. Cons: generates no energy, no ownership, no pride. People report the work but do not own the vision.',
        },
        {
          heading: 'Inspirational names',
          body: `The good ones connect to the actual work, so you feel the goal in the name — a latency push called “Greyhound,” a retention effort called “Heartbeat,” a security sprint called “Drawbridge.” That pride builds ownership the way a ticket number never will. The trap is grabbing a generic stock codename (Phoenix, Catalyst, Titan) — those wear the costume of inspiration without the substance. And any codename has a cost: it adds friction for newcomers and partner teams, trading a little legibility for a lot of energy. Best for transformation and culture-change projects.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'The rule of thumb: for culture-change or transformation projects, inspirational names earn their keep. For technical migrations or compliance work, functional wins. Know which you are running before you brief.',
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
          body: `Before rebranding, answer honestly: what does the current name mean to customers? Not what you wish it meant — what does it actually mean? Brand equity is the sum of all associations, memories, and expectations your name triggers. Some is valuable. Some is what you’re trying to escape.`,
        },
        {
          heading: 'What to preserve',
          body: `Mastercard evolved from “MasterCard” — they kept the name, the red circle, the two-hemisphere concept because the equity was enormous. Before you start this contest: identify specifically what about the current name or brand is worth preserving. This becomes a constraint for participants.`,
        },
        {
          heading: 'What to escape',
          body: 'Philip Morris → Altria (after tobacco litigation). Facebook → Meta (after regulatory pressure). If the existing name has become a liability, the new name needs to create distance while preserving underlying trust. Tell participants what associations you are moving away from.',
        },
      ],
      callout: {
        type: 'warning',
        text: `Warning: rebrands that change too much at once (name + logo + color + tone) confuse customers more than they help. The marketing “rule of seven” is a useful gut-check — people need to encounter a brand roughly seven times before it registers, so every element you reset starts that clock over. Evolutionary rebrands tend to hold onto existing customers better than revolutionary ones.`,
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
          body: `Tweak, modernize, refine. Dunkin’ Donuts → Dunkin’. They shortened and simplified, kept the equity. Evolution works when the core identity is sound but the expression needs updating for a new era or market segment.`,
        },
        {
          heading: 'Revolution (the riskier path)',
          body: 'Rename and reposition entirely. Andersen Consulting → Accenture. BackRub → Google. Revolution is warranted when: (a) the existing name is a genuine barrier to growth, (b) scandal has made the name toxic, or (c) the business has fundamentally changed beyond what the name can contain.',
        },
      ],
      callout: {
        type: 'example',
        text: `Dunkin’ removed “Donuts” because 60% of revenue was beverages, not donuts. The word was misleading. They kept “Dunkin”“ because that’s where 60+ years of equity lived. That’s precision equity management.`,
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
          heading: 'Four qualities that make a name memorable',
          body: `Chantable: can fans yell it together? Visual: does it conjure an image, symbol, or idea? Emotional: does it create energy, pride, toughness, fun, or a sense of belonging? Distinctive: does it feel like it belongs to this team rather than any team? The strongest names often hit several of these at once — but they don’t all have to.`,
        },
        {
          heading: 'The geography question',
          body: `A location-based name can instantly connect a team to its community. But think about how much you want the name tied to a particular place. Names that reference local culture, history, or landscape without simply using the city name can create a strong sense of place while giving the team more room to grow.`,
        },
        {
          heading: 'Mascot or something more abstract?',
          body: `Not every great team name needs an animal. Miami Heat, Oklahoma City Thunder, and Utah Jazz all create strong identities without one. Abstract names can open up more possibilities for visual identity and storytelling, while animal names offer an immediate character and image. Neither approach is inherently better — the right choice depends on the personality you want the team to project.`,
        },
      ],
      callout: {
        type: 'example',
        text: `When Oklahoma City named its NBA team, fans were invited to weigh in on finalists including Thunder, Barons, Bison, Energy, and Wind. “Thunder” ultimately offered a strong connection to the region while feeling powerful, memorable, and flexible enough to build an identity around.`,
      },
    },
    {
      id: 't1-chant',
      title: 'Chantability: The Test Every Team Name Should Pass',
      readTime: '1 min',
      icon: 'SoccerBall',
      sections: [
        {
          heading: 'The stadium test',
          body: `Imagine thousands of fans chanting your team name after a big play. Not reading it or typing it — shouting it together. Does it have a natural rhythm? Can the crowd easily land on the key word? “HEAT! HEAT! HEAT!” and “THUNDER! THUNDER!” practically chant themselves. Longer names can work, too, if they have a natural way to shorten or emphasize them.`,
        },
        {
          heading: 'What makes a name chant-ready',
          body: `Short, punchy names tend to be easiest, especially those with strong sounds or a natural cadence. But there’s no single formula. “KINGS!” works beautifully for Sacramento, while “WARRIORS!” has a different rhythm that still carries. Try saying each finalist loudly three times in a row. Better yet, imagine thousands of people saying it together. If it feels awkward in your mouth, it probably won’t feel great in a stadium.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `A great team name should work with the voice as well as on the page. If fans can say it together without thinking about it, the name becomes part of the team’s energy — not just its identity.`,
      },
    },
  ],

  // ── t2 · Band / music ──
  t2: [
    {
      id: 't2-firstsong',
      title: 'The Band Name Is the First Note',
      readTime: '2 min',
      icon: 'MusicNote',
      sections: [
        {
          heading: 'The name sets the stage',
          body: `Before anyone hears your music, they encounter your name. It appears on a festival poster, streaming service, social feed, or T-shirt. A great name can suggest a mood, image, or entire world before the first note plays. Metallica, The Cure, and Talking Heads each create a different expectation without explaining what the music sounds like.`,
        },
        {
          heading: 'Make it memorable, distinctive, and evocative',
          body: `The best band names stick after one listen and feel like they belong to no other band. They might create a vivid image, combine unexpected ideas, or simply have a satisfying rhythm or sound. Fleet Foxes, Arctic Monkeys, Pearl Jam, and The Strokes all give listeners something to picture and remember. Give participants a sense of your music, story, influences, and audience so they have something real to build from.`,
        },
        {
          heading: 'Leave room to grow',
          body: `A name that perfectly describes your sound today can become a creative cage tomorrow. If you might evolve, experiment, or cross genres, look for a name that can grow with you. Radiohead has worked across radically different musical territory precisely because the name never locked the band into one sound.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Before you fall in love with a name, stress-test it. Say it aloud. Imagine it on a festival poster and a T-shirt. Search for it on Google, Spotify, social platforms, and trademark databases. A great band name should sound right, look right, stick in people’s minds, and give listeners a clear path back to you.`,
      },
    },
    {
      id: 't2-archetypes',
      title: 'Where Great Band Names Come From',
      readTime: '2 min',
      icon: 'Quotes',
      sections: [
        {
          heading: 'Eight naming territories to explore',
          body: `Band names often come from surprisingly different places. Use these territories to get the ideas flowing. Pop culture: songs, movies, books, characters, or other cultural references (Radiohead, The All-American Rejects). Inside jokes: a shared experience, phrase, interest, or story that means something to the band (Green Day, Garbage). Places: a neighborhood, city, landmark, or other meaningful location (Cypress Hill, Linkin Park, Soundgarden). Food: everyday foods can make unexpectedly memorable names (The Cranberries, The Black Eyed Peas, Red Hot Chili Peppers). Names: first names, surnames, combinations, or names with a twist (Fleetwood Mac, Kings of Leon, Phish). Interesting words: a single word can be powerful, especially with an unexpected meaning or sound (Outkast, Ride, The Pixies). Meaningful phrases: multiple words that create a clear idea or reference (AC/DC, New Found Glory, Stockholm Syndrome). Random combinations: two or more words that simply create an intriguing, memorable image together (Arctic Monkeys, My Morning Jacket, Blink-182).`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Don’t wait for one perfect naming idea to appear. Explore different territories first. A great name might come from your music, your story, a shared joke, a place, a favorite food — or two completely unrelated words that simply sound right together.`,
      },
    },
  ],

  // ── t3 · Podcast / channel ──
  t3: [
    {
      id: 't3-discovery',
      title: 'Discovery vs. Memory: The Two Jobs of a Podcast Name',
      readTime: '2 min',
      icon: 'BookOpen',
      sections: [
        {
          heading: 'Job 1: Discovery',
          body: `When someone is looking for a podcast about business, true crime, or psychology, does the name give them a clue that they’ve found the right show? Discovery-friendly names tend to signal the subject clearly: Crime Junkie, How I Built This, or Stuff You Should Know. This approach can be especially helpful when you’re building an audience from scratch.`,
        },
        {
          heading: 'Job 2: Memory',
          body: `When a listener recommends your show to a friend, will they remember the name? Memory-friendly names can be more intriguing or unexpected: Serial, S-Town, 99% Invisible, or Radiolab. They may reveal less about the subject, but they give listeners something distinctive to remember and talk about.`,
        },
        {
          heading: 'The sweet spot: a clue + a hook',
          body: `The strongest names can do both. Hidden Brain gives you an immediate clue about the subject while adding an intriguing idea you want to explore. SmartLess signals intelligence and humor without spelling out the format. A useful question for participants is: can the name tell me something, while still giving me something to remember?`,
        },
      ],
      callout: {
        type: 'example',
        text: `You don’t necessarily have to choose between clarity and creativity. A descriptive name can help people understand what a show is about; a more distinctive name can give it personality and make it easier to remember. The right balance depends on how you expect listeners to discover and share the show.`,
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
          body: `Podcast platforms surface shows based on keyword relevance. Clear, descriptive names (“The Marketing Podcast,” “Daily News Brief”) index well in search and get recommended in the right categories automatically. If search is your only acquisition channel, lean descriptive — you will get traffic earlier.`,
        },
        {
          heading: 'What memory wants',
          body: `Word-of-mouth — still the highest-conversion podcast acquisition channel — requires a name that lives in the brain and rolls off the tongue. “You Must Remember This,” “My Favorite Murder,” “Conan Needs a Friend” spread because the names are interesting enough to repeat. Distinctive names compound.`,
        },
        {
          heading: 'The hybrid strategy',
          body: `Name the show memorably. Use the subtitle for clarity and keywords. “Hidden Brain: A Podcast About the Unconscious Forces That Drive Human Behavior.” The name is memorable; the subtitle handles SEO. Many top shows use this approach — give participants both a name and subtitle brief.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The hybrid move: name the show memorably, then let the subtitle carry the keywords. “Hidden Brain: A Podcast About the Unconscious Forces That Drive Human Behavior” — the name sticks in memory, the subtitle does the SEO.`,
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
          body: `Names that age well: reference human values (“humanity” is permanent), name the impact not the process (Doctors Without Borders describes impact, not methodology), stay away from tech buzzwords (anything with “digital,” “smart,” “e-,” “cyber-” will be dated within 15 years).`,
        },
        {
          heading: 'The dual audience requirement',
          body: `Civic names must communicate purpose to two audiences: the people served AND the donors/funders. A name that resonates with one but not the other is a strategic liability. “Feeding America” works for both: donors know what they’re funding; recipients know what they’re getting.`,
        },
      ],
      callout: {
        type: 'example',
        text: `“eCorps” (2000s nonprofit): the “e-” prefix aged terribly. “charity: water” (2006): aged beautifully — the lowercase and colon feel intentional and modern without being tied to any tech era.`,
      },
    },
    {
      id: 't4-community',
      title: 'Naming a Club or Civic Group',
      readTime: '2 min',
      icon: 'Heart',
      sections: [
        {
          heading: 'Make it easy to say and share',
          body: `For most clubs and civic groups, the first test is simple: is it a name people will actually say out loud, and does it fit on a flyer, a banner, or a group chat? A name that’s easy to say gets used, and a name that gets used is the one that sticks.`,
        },
        {
          heading: 'Say what brings people together',
          body: `The strongest group names hint at what you share — an activity, a place, a purpose, or a cause. “Thursday Night Chess” says exactly what it is; “The Riverside Readers” pairs a place with a pastime; “Neighbors for Fair Housing” puts the cause right up front. You don’t need to explain everything, just give participants a clear sense of who you are and what brings you together.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `A group name doesn’t have to last forever. If what you do changes, the name can change with it. Aim for something that feels right for the people in the room today.`,
      },
    },
    {
      id: 't4-belonging',
      title: 'A Name Is a Membership Signal',
      readTime: '2 min',
      icon: 'UsersThree',
      sections: [
        {
          heading: 'Names tell people whether they belong',
          body: `A group’s name is the first thing a newcomer reads, and it quietly answers “is this for me?” A warm, plain name like “Neighborhood Coffee Club” feels open to anyone; “Voters for Fair Maps” signals a clear cause and the people it’s rallying. Decide who you want to feel invited, and let the name do that work.`,
        },
        {
          heading: 'Inside meaning and outside meaning',
          body: `The best group names often work on two levels: they mean something to the people already in the group, and they still make sense to someone hearing it for the first time. “The Thursday Table” means a specific weekly dinner to its members, and reads as friendly and low-key to everyone else. An inside reference is great, as long as it doesn’t lock newcomers out.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Say the name out loud as if you’re inviting someone to join. If it sounds welcoming and easy to repeat, it will do a lot of quiet recruiting for you.`,
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
          body: `Intimidating names (FaZe Clan, Team Liquid, Cloud9) signal competitive dominance. Meme-worthy names (Panda Global, Golden Guardians) signal a different confidence: we’re secure enough to be playful. Both work. Choice depends on how seriously competitive you are.`,
        },
        {
          heading: 'The functional tests',
          body: `Can you yell it when you clutch a 1v5? Can it go on a jersey? Does it have a tag/abbreviation that works? (Cloud9 → C9, Team Liquid → TL). Gaming names should be 1-2 words max, distinctive within your game’s community, and functional as a competitive tag.`,
        },
      ],
      callout: {
        type: 'insight',
        text: 'Look at the names that actually move merch — Liquid, FaZe, C9, NaVi. Short compresses into a tag, a chant, and a logo. Brevity is a feature, not a constraint.',
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
          body: `In competitive gaming, team names live as 2-3 character tags in brackets: [C9] Cloud9, [TL] Team Liquid, [FaZe] FaZe Clan. The tag is what players see in-game, in tournament brackets, and on leaderboards. A great team name produces a great tag naturally. Test every submission: what’s the obvious 2-3 letter compression? If it’s awkward, the name will feel wrong in competitive play.`,
        },
        {
          heading: 'Tag collision and uniqueness',
          body: `Before finalizing any name, check if the tag is already claimed in your game’s community or in major esports. A unique tag is not just aesthetic — it determines search results, community identity on Discord and Reddit, and how other players refer to you in comms. “GG” was taken before online gaming existed. Plan ahead.`,
        },
      ],
      callout: {
        type: 'example',
        text: `“NaVi” (Natus Vincere — Latin for “born to win”) compresses perfectly: memorable tag, meaningful full name, global audience doesn’t need to know the Latin to feel the dominance. The tag and the name work as a system.`,
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
          body: 'Groups that rally around an aspirational name tend to act like it — the name becomes a quiet self-fulfilling prophecy. A great group name is the first act of leadership.',
        },
        {
          heading: 'Inside vs. outside meaning',
          body: `The best group names work on two levels: they mean something to members (inside reference, shared history) AND they create the right impression for outsiders. A great group name says “there’s something going on here” even to people who don’t know the inside story.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `A distinctive, creative name tends to attract more committed members than a generic identifier. Your name isn’t just identity — it’s a membership signal.`,
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
          body: `Groups evolve. The “Tuesday Night Crew” stops meeting Tuesdays. The “Book Club” stops reading books and becomes a social outlet. The “Marketing Brainstorm Team” becomes a full strategy department. Names built around logistics, schedules, or current activities age into irony. Names built around values, shared identity, or purpose stay accurate as the group evolves.`,
        },
        {
          heading: 'Future-proof naming criteria',
          body: `Ask: if this group’s activity changes but the people stay the same, does the name still fit? If yes — it’s identity-based and will age well. If no — it’s activity-based and will need updating. For most groups, identity-based names are worth the extra effort to find.`,
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
      title: 'How Names Are Perceived',
      readTime: '2 min',
      icon: 'TextAa',
      sections: [
        {
          heading: 'Sound shapes perception',
          body: `The sounds in a name can subtly influence how it feels. Names with crisp, hard consonants—Kate, Jack, Blake—may come across as more energetic or assertive, while names with softer sounds—Lily, Maya, Noah—can feel warmer or gentler. Neither is better. The key is to consider what you want the name to convey—and how it sounds when spoken aloud.`,
        },
        {
          heading: 'The uniqueness question',
          body: `A distinctive or culturally specific name can be memorable and meaningful. The question isn’t whether a name is familiar to everyone—it’s whether it feels right for the child and family. If a name has an uncommon spelling or pronunciation, consider how easily people are likely to say, spell, and remember it, and whether that tradeoff matters to you.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Names tend to move in cycles. What feels old-fashioned to one generation can feel fresh and distinctive to the next—which is why names like Eleanor, Theodore, and Hazel have made such strong comebacks. And there’s no rule that a great name has to come from the top 100—or from any list at all. A name can be inherited, rediscovered, invented, or completely your own.`,
      },
    },
    {
      id: 'p1-lifetime',
      title: 'The Lifetime Test: Toddler, Teen, Professional, Older Adult',
      readTime: '2 min',
      icon: 'Hourglass',
      sections: [
        {
          heading: 'A name grows with a person',
          body: `Most parents picture a name on a baby. It’s worth picturing it at every stage of life, too: on a school roster, at a first job, on a wedding invitation, or at 75. The most versatile names can evolve with the person who carries them. “Eleanor” works for a toddler, a teenager, a CEO, and an older adult—that’s range. But there’s no single formula for a name that works across a lifetime. A playful name may be exactly right for your family; a more formal one may offer a different kind of flexibility. The question is whether the name feels right for the person you imagine growing into it.`,
        },
        {
          heading: 'The nickname architecture',
          body: `Built-in nickname flexibility can be a feature, not a compromise. “Alexander” offers Alex, Al, Xander, Lex, and Alec, giving the person who wears it options as they grow. Other names have no obvious nickname—and that can be just as appealing. Think about whether you want a name that offers different ways to use it, or one that feels complete just as it is.`,
        },
        {
          heading: 'The professional context test',
          body: `Try the name in a few different settings: “I’d like to introduce our CEO, [name].” Then: “Have you met [name]?” And imagine it on a school roster, a diploma, or a wedding invitation. If it feels natural across different contexts, the name has range. If it feels especially tied to one stage or setting, consider whether that’s part of its charm—or a limitation you want to avoid.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Some research suggests that names that are easier for others to pronounce can lead to more positive judgments in certain professional contexts. That doesn’t mean an unfamiliar, culturally specific, or creatively invented name is a disadvantage—it simply highlights one practical consideration: if a name is frequently mispronounced or misspelled, think about whether that matters to you and your child. And remember, pronunciation and spelling are often matters of familiarity, not inherent difficulty.`,
      },
    },
  ],

  // ── p2 · Pet name ──
  p2: [
    {
      id: 'p2-personality',
      title: 'Personality-Forward Naming',
      readTime: '1 min',
      icon: 'Heart',
      sections: [
        {
          heading: 'Names that fit the animal',
          body: `A pet’s personality can be one of the richest sources of naming inspiration. Is your dog a little Chaos? A total Gremlin? Is your cat a Diva, a Professor, or a Couch Potato? Names that capture a pet’s quirks can feel especially personal—and give participants something specific to riff on. Rover’s 2025 research found that nearly half of pet parents choose names based on personality or appearance. Give participants a glimpse of what makes the animal unique, and let that personality spark the ideas.`,
        },
        {
          heading: 'The practical tests',
          body: `Say the name out loud. Can you imagine calling it across a dog park without feeling awkward? Is there a natural short form for everyday use? (Maximilian → Max.) Can you say it warmly when they’re being good—and with authority when they’re not? For pets, the name you write down and the name you actually call can be two different things. Both are worth considering.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Rover’s 2025 U.S. data puts Luna and Charlie at the top of the dog-name charts, with Luna and Milo leading for cats. Popular names have staying power, but if you want something more distinctive, look beyond the usual choices. The goal isn’t simply an uncommon name—it’s one that feels unmistakably like your pet.`,
      },
    },
    {
      id: 'p2-callname',
      title: 'The Call Name Principle',
      readTime: '1 min',
      icon: 'Hand',
      sections: [
        {
          heading: 'Make sure both names work',
          body: `A pet’s full name and everyday call name can serve different purposes. “Bartholomew” can be wonderfully over-the-top, while “Bart” is what you’ll actually call him at the dog park. “Persephone” has a certain grandeur; “Percy” is easy to toss across the room. There’s no need to choose between the two—just make sure you like both the full name and the version that will become part of everyday life.`,
        },
        {
          heading: 'Make the call name easy to hear',
          body: `For dogs especially, short names are practical: one or two syllables are easy to say and give you room to vary your tone. Hard consonants at the beginning can help a name stand out in a noisy environment, while vowel endings can make it easier to stretch or emphasize the sound. Also consider whether the name sounds too much like an everyday command—“Kit” and “Sit,” for example, could get confusing.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `Your pet will hear their call name hundreds of times. Choose something that’s easy to say clearly, sounds good in your voice, and feels natural whether you’re calling them in from the yard or introducing them to someone new.`,
      },
    },
  ],

  // ── p3 · Home / property / fun ──
  p3: [
    {
      id: 'p3-places',
      title: 'The Power of Giving a Place a Name',
      readTime: '1 min',
      icon: 'Tree',
      sections: [
        {
          heading: 'The psychology of place names',
          body: `Giving a place a name can make it feel more distinctive, memorable, and personal. “We’re going to Willowbend” creates a different feeling than “We’re going to the lake house.” A name gives a place an identity—and over time, that identity can become part of the stories and memories associated with it.`,
        },
        {
          heading: 'What makes a great place name',
          body: `Great place names often have three things going for them: a story or connection, a sound that suits the place, and enough flexibility to work both formally and casually. A name might capture the setting, history, personality, or simply a feeling. “Willowbend” suggests a landscape; “Casa Serenidad” evokes a mood; “Our Place” can work beautifully if it means something to the people who use it.`,
        },
      ],
      callout: {
        type: 'example',
        text: `A good name gives people something to remember and share. “We loved Willowbend” is more distinctive than “we loved the lake house”—and a memorable name can become part of the experience of visiting, staying, or returning to a place.`,
      },
    },
    {
      id: 'p3-stick',
      title: 'What Makes a Property Name Stick',
      readTime: '1 min',
      icon: 'Sparkle',
      sections: [
        {
          heading: 'Four sources that inspire great names',
          body: `Memorable property names often draw from four places: geography (a local feature, view, or landmark—“Ridgecrest,” “Harborside”), history (a former use, previous owner, or story connected to the property—“The Old Mill,” “Shepherd’s Rest”), nature (something distinctive about the landscape—“Heronwood,” “Cliffside”), and feeling (the experience or mood the place creates—“Stillwater,” “Driftwood”). The more a name has a story behind it, the more there is to remember and share.`,
        },
        {
          heading: 'The conversational test',
          body: `Will people naturally use the name, or will they keep reverting to “the lake house” or “the beach place”? “We’re going to Willowbend” rolls off the tongue. A long, elaborate name may look beautiful on a plaque but become unwieldy in conversation. Aim for something easy to say, easy to remember, and evocative enough to conjure the place.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The strongest names often give people something concrete to point to or a story to tell. A distinctive tree, sweeping view, piece of history, or even an inside joke can turn a name from a label into part of the place’s identity.`,
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
          body: `Giving something a name gives it an identity. A named project feels more tangible. A named place becomes somewhere you can talk about. A named initiative becomes something people can rally around. Whatever you’re naming, choosing a name is a way of giving it a place in the world.`,
        },
        {
          heading: 'Why naming together matters',
          body: `When people have a hand in naming something, they have a reason to care about the outcome. They contribute ideas, see what others come up with, and have a voice in choosing the name. The process itself becomes a shared experience—and when the winning name emerges, people are more likely to feel they had a part in it.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The right name doesn’t just describe what something is—it shapes how people think and talk about it. A great name can turn something ordinary into something that feels like it has an identity of its own.`,
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
          body: `When a group names something together—a friendship circle, club, tradition, shared space, or inside joke—the process becomes part of the story. Everyone gets to contribute, react, and have a say in what the group will call its thing. That shared experience can make the final name feel more meaningful than one chosen by someone else.`,
        },
        {
          heading: 'Give participants the backstory',
          body: `The more context participants have, the more meaningful their ideas can be. Share what the group has in common, what you’re naming, and what makes it special. “We’re five friends who met studying abroad and reunite every year” gives people much more to work with than “We need a name for our group.” The goal is to give participants something real to build on.`,
        },
      ],
      callout: {
        type: 'insight',
        text: `The name you choose together becomes part of your shared history—a little piece of language that everyone helped create. Years later, the name can carry the memories, jokes, and stories that inspired it.`,
      },
    },
  ],
};

// 2026-08-18: b2 uses its own guides (defined above): b2-vs-company plus the
// legacy product guides. The 2026-07-13 "mirror b1's guides" override was removed.

// ────────────────────────────────────────────────────────────────
// 4. PRIMERS — per sub-segment "~90 second read" intros
// ────────────────────────────────────────────────────────────────
export const PRIMERS = {
  b1: {
    title: 'Before You Start: The Naming Philosophy',
    quotes: [
      `“A name isn’t a strategy. It’s a vessel you fill with meaning.”`,
      `“The best name isn’t the one everyone likes. It’s the one that works.”`,
      `“Your job: Define what “works” means for your company.”`,
    ],
    example: `“Apple” tells you nothing about computers. But it’s distinctive, memorable, ownable. That’s what matters.`,
  },
  b2: {
    title: `Naming Products vs Companies: What’s Different`,
    body: 'Products live under a brand umbrella. Your company name sets the stage. Your product name extends the story.',
    note: 'Branded house (Google everything) vs House of brands (P&G approach)',
    example: 'Salesforce → Sales Cloud, Service Cloud, Marketing Cloud',
  },
  b3: {
    title: 'Why Internal Project Names Matter More Than You Think',
    body: `Generic names kill momentum. “Project Phoenix” has been done to death. A distinctive internal name drives adoption and builds morale.`,
    example: `Google’s “Project Loon” (internet balloons) became a cultural touchstone`,
  },
  b4: {
    title: 'Rebranding: Evolution or Revolution?',
    body: `You’re not starting from scratch. You have brand equity. The question is: Evolution or Revolution?`,
    example: `Mastercard (evolution — kept the name, dropped “MasterCard” spacing), Facebook→Meta (revolution), Dunkin’ Donuts→Dunkin’ (evolution — simplified)`,
  },
  b5: {
    title: 'Before You Start: The Naming Philosophy',
    body: `A name is the shortest story you can tell about something — it doesn’t just describe what you do, it sets up everything you’ll become.`,
    example: `The best name isn’t the one everyone likes. It’s the one that works. Trust the process.`,
  },
  t1: {
    title: 'Sports Team Naming: What Makes Fans Yell It',
    body: 'The best sports names are chanted, cheerable, intimidating OR identity-building.',
    example: 'Oklahoma City Thunder (picked by fan vote off an ownership shortlist), Seattle Kraken',
  },
  t2: {
    title: 'Band Naming: The Mythology Matters',
    body: `Your band name is your first song. Fans will ask “How’d you get your name?” — have a good story.`,
    example: `Radiohead (from Talking Heads song), Foo Fighters (Dave Grohl’s WWII UFO reference)`,
  },
  t3: {
    title: 'Podcast Naming: Clarity vs. Intrigue — Both Can Win',
    body: `You’re on a spectrum between ultra-clear (“How I Built This”) and utterly intriguing (“Radiolab”). Both work — but they work differently.`,
    example: `The sweet spot: Most winning podcast names balance both. “Hidden Brain” is intriguing (why hidden?) but clearly about psychology. Aim for that.`,
  },
  t4: {
    title: 'Naming for Generations: Civic & Community Names',
    body: 'You’re naming something that should outlast you by decades. Clarity beats cleverness. Aspiration beats description.',
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
    example: `Groups that rally around an aspirational title (“The Visionaries”) tend to act more like it than ones with a generic identifier. Your name becomes a self-fulfilling prophecy.`,
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
    body: `Named places feel more like home. “The Bungalow” becomes a person. “Stella” the sailboat becomes a family legend.`,
    example: 'Named places tend to get talked about and cared for more, and remembered more fondly. The name you choose becomes part of the story you tell about this place.',
  },
  p4: {
    title: 'The Right Name Changes How Something Feels',
    body: `A great name doesn’t just describe what you do — it gives the thing room to grow into.`,
    example: `Key insight: The best name isn’t the one everyone likes. It’s the one that works. Trust the process.`,
  },
};

// ────────────────────────────────────────────────────────────────
// 5. INVITE_GUIDANCE — per sub-segment (from INVITE_CONFIG)
// ────────────────────────────────────────────────────────────────
export const INVITE_GUIDANCE = {
  b1: {
    essential: ['Founders / C-suite', 'Marketing / Brand lead', `Anyone who’ll use the name daily`],
    recommended: ['2-3 outsiders — investors, advisors, or customers'],
    recommendedNote: `30% of winning names came from someone outside the company. Airbnb’s name came from a designer they hired, not the founders.`,
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
    recommendedNote: `Brand equity lives in customer memory. They’ll tell you what’s worth keeping — and what associations the new name needs to escape.`,
    optional: ['PR / Communications team', 'Board members if involved in brand decisions'],
    sweetSpot: '10–20',
    sweetSpotNote: 'Rebrands need internal buy-in AND external reality check. Balance both.',
  },
  b5: {
    essential: ['Key decision-makers', 'Marketing or brand lead', `People who’ll use the name daily`],
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
    recommendedNote: `Your target listener knows what show names attract them. They’re your most valuable naming input.`,
    optional: ['Guest speakers who know your content well', 'Social media followers you trust'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Mix of creators and target audience gives you both insider vision and market reality.',
  },
  t4: {
    essential: ['Founding team members', 'Board members', 'Executive Director'],
    recommended: ['5–10 community members you serve or plan to serve'],
    recommendedNote: `The community you serve should have a voice in what you’re called. This is also a trust-building act — invite them in.`,
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
    recommended: [`Close friends in the baby’s life — godparents, best friends`],
    recommendedNote: `People who’ll be in this child’s life should feel included. It also means more people invested in the name from day one.`,
    optional: ['Distant relatives, coworkers — anyone you want to feel involved'],
    sweetSpot: '8–15',
    sweetSpotNote: 'Great way to make distant relatives feel connected. The certificate on the nursery wall tells the whole story.',
  },
  p2: {
    essential: ['Immediate family members'],
    recommended: ['Anyone who will regularly see or care for the pet'],
    recommendedNote: `Pets become part of the community around them. The people who’ll call the name most often should help choose it.`,
    optional: ['Friends of the family who know about the new pet'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it personal — this is a family moment.',
  },
  p3: {
    essential: [`People who’ll live in or regularly use the space`],
    recommended: ['Friends who know the space and your style'],
    recommendedNote: `Friends who’ve visited often name places better than the owners — they see the vibe without the familiarity bias.`,
    optional: ['Neighbors, frequent guests, anyone with a connection to the space'],
    sweetSpot: '5–15',
    sweetSpotNote: 'Keep it fun and intimate.',
  },
  p4: {
    essential: [`People closest to you who understand what you’re naming`],
    recommended: ['A few friends or family for fresh perspective'],
    recommendedNote: 'Outside voices catch what feels obvious to you but surprising to the world.',
    optional: [`Anyone with a connection to the thing you’re naming`],
    sweetSpot: '5–15',
    sweetSpotNote: 'Scale to the occasion.',
  },
};

// ────────────────────────────────────────────────────────────────
// 6. CUT_QUESTIONS — IDs hidden at render time (data preserved, reversible)
// ────────────────────────────────────────────────────────────────
export const CUT_QUESTIONS = {
  // b1 rewritten 2026-07-10 (client 10-question guide) — no cuts apply.
  b1: [],
  b2: [], // mirrors b1 since 2026-07-13 — its old 'differentiator' cut no longer applies
  b3: [],
  b4: [],
  b5: [],
  t1: ['teamColors', 'chantable'], // 2026-08-17: chantable stays cut (its guide covers it via the personality Q); teamColors folded into the geography question's prompt/hint
  t2: [], // 2026-08-17: nameType + searchability removed from the band set (client: no legal / searchability)
  t3: ['platform', 'tone'], // 2026-08-17 client: fold "where it lives" into the concept Q; drop tone/format + its duplicate guide
  t4: ['acronymPref', 'mission', 'community', 'longevity'], // 2026-08-17 rescope to club/civic — no mission / served / 50-year longevity
  t5: ['platform'],
  t6: [],
  p1: ['traditions', 'avoidInitials', 'projectSummary'],
  p2: ['callNamePref', 'projectSummary', 'petPersonality'],
  p3: ['projectSummary'],
  p4: [],
};

// ────────────────────────────────────────────────────────────────
// MERGE_QUESTIONS — semantic merges (combine legacy fields into one chat question)
// ────────────────────────────────────────────────────────────────
export const MERGE_QUESTIONS = {
  // De-duped "About this" openers: every segment used to ask for a
  // one-line summary (projectSummary) AND a near-identical fuller
  // description right after — so people felt they answered the same
  // question twice. We keep projectSummary (it also feeds the
  // participant-facing summary on /join) and fold the second field in.
  // The kept question's prompt is edited directly in BRIEF_QUESTIONS so
  // the final copy lives in one place; no newPrompt needed here. Where
  // the dropped field carried a "read the guide" article, that guideId
  // is moved onto projectSummary in BRIEF_QUESTIONS so the guide stays.
  // b1 rewritten 2026-07-10 — its old projectSummary/companyDesc merge no
  // longer applies (companyDesc doesn't exist in the new set).
  b4: [{ keepId: 'projectSummary', merged: ['companyDesc'] }],
  // b5 rewritten 2026-08-18 (client business set) — no groupDesc to merge.
  t3: [{ keepId: 'projectSummary', merged: ['showDesc'] }],
  t6: [{ keepId: 'projectSummary', merged: ['groupDesc'] }],
  p4: [{ keepId: 'projectSummary', merged: ['groupDesc'] }],

  // b2 mirrors b1 since 2026-07-13 — its old prodDesc/differentiator merge
  // no longer applies (those ids don't exist in the mirrored set).
  // t2's old nameType/searchability merge removed 2026-08-17 — both questions
  // were dropped from the band set (client: no legal / searchability questions).
  p1: [
    {
      keepId: 'lengthPref',
      merged: ['nicknamePreference'],
      newPrompt: 'Do you prefer short names, longer names (which may have more nickname options), or something in between?',
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
    prompt: `In a few sentences, describe what you’re naming and what makes it unique.`,
    type: 'textarea',
    rows: 4,
    required: false,
    placeholder: `What is this? Who is it for? What makes it unique?`,
    hint: `The more context participants have, the better the names.`,
  },
  {
    id: 'vibe',
    label: 'Vibe / personality',
    prompt: 'What vibe should the name carry? Pick any that apply.',
    type: 'multiChips',
    options: ['Serious / Professional', 'Fun / Casual', 'Aspirational', 'Irreverent / Playful'],
  },
  {
    id: 'history',
    label: 'Any shared history or inside references?',
    prompt: 'Any shared story, inside reference, or origin moment that could inspire a name?',
    type: 'text',
    required: false,
    placeholder: 'e.g. We all met in Berlin',
    hint: `Group names with personal meaning create stronger belonging. If there’s a shared joke, a founding story, or a place that matters — share it.`,
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
