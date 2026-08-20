// Brief expansions — turns bare option labels into meaningful lines on the
// participant-facing brief. When a creator picks "Force of Nature", the
// participant shouldn't see just the label: they see what it means and the
// examples that made the option make sense in the picker.
//
// Keyed by question id → option label → one-line expansion, with optional
// per-segment overrides (BY_SUB) where the same label means something
// different in context: "Funny / Playful" for a boat is pun-on-the-hull
// territory; for a brunch crew it's group-chat humor.
//
// EDITORIAL LOGIC (mirrors the client's authored hints): each line states
// what the territory means, then grounds it in a real, verifiable example
// from naming tradition, the same way the hints use OKC Thunder, Häagen-
// Dazs, or "'Professor' works for a dignified cat".
//
// SOURCES — every line is tagged for editorial review:
//   [hint]     derived from the client-authored question hint's own wording
//   [eg]       examples come from the option's authored eg field
//   [sublabel] restates the option's authored picker sublabel
//   [lore]     real, documented naming tradition/origin (fact-checked)
//   [proposed] our phrasing alone; needs client OK
//
// Copy rules: one sentence, lowercase start (it follows the bold label),
// no em dashes.

export const BRIEF_EXPANSIONS = {
  // b1 company + b2 product (same labels, examples pooled from both)
  nameStyles: {
    'Real words': 'real dictionary words put to work as names, like Nest, Amazon, Kindle, or Tide.', // [eg]
    'Coined / made-up words': 'invented words built for the name, like Pixar, Verizon, Swiffer, or Prius.', // [eg]
    'Combined words': 'two words fused into one, like YouTube, MasterCard, PowerPoint, or AirPods.', // [eg]
  },

  // b1 / b2 / b5 radio (label variants per segment)
  descriptiveEvocative: {
    'Descriptive': 'points straight at what’s on offer, like PayPal or QuickBooks.', // [sublabel]
    'Suggestive': 'hints at an idea, feeling, or benefit without spelling it out, like Amazon or Kindle.', // [sublabel]
    'Direct and clear': 'says plainly what it is.', // [sublabel]
    'Evocative and suggestive': 'hints at an idea or feeling without spelling it out.', // [sublabel]
  },

  // b3 project
  projNameType: {
    'Functional': 'plain and factual, like Migration 2025 or Customer Portal Rebuild.', // [sublabel]
    'Inspirational': 'a rallying banner, like Project Phoenix or Operation Clarity.', // [sublabel]
    'Codename / Abstract': 'a standalone word with no literal tie, like Everest, Sequoia, or Saturn.', // [sublabel]
  },

  // b4 rebrand
  namingStyle: {
    'Descriptive': 'says what the business does, like QuickBooks.', // [sublabel]
    'Suggestive': 'hints at the promise, like Salesforce.', // [sublabel]
    'Abstract': 'a name that means nothing until the brand fills it, like Kodak.', // [sublabel]
  },

  // t1 sports — grounded in the personality hint ("An intimidating name like
  // Predators or Raptors projects power and aggression; a name rooted in
  // place, community, or identity can create a different kind of pride and
  // belonging. Playful names can be perfect for youth or rec teams...")
  personality: {
    'Intimidating': 'names that project power and aggression, like Predators or Raptors.', // [hint]
    'Pride-Based': 'names rooted in place, community, or identity that create pride and belonging.', // [hint]
    'Fun / Playful': 'playful names, a natural fit for youth and rec teams.', // [hint]
    'Underdog / Gritty': 'names that make gritty a badge of honor, in the Mighty Ducks tradition.', // [lore]
  },

  // t1 sports territories (grounded in the OKC Thunder / Seattle Kraken
  // hint) + t3 podcast territories (same question id, distinct labels; the
  // real-show examples come from the option egs)
  namingDirection: {
    'Animal / Mascot': 'a creature to rally behind, like Lions, Hawks, or Seattle’s Kraken.', // [eg + hint]
    'Force of Nature': 'names that evoke a powerful force of nature, like Thunder or Blaze.', // [hint + eg]
    'Place / Geographic': 'names that connect to the team’s region or home turf, like Riverside or Northern.', // [hint + eg]
    'Elite / Best': 'names that plant a flag at the top, like Apex or Vanguard.', // [eg]
    'Tough / Fierce': 'hard-edged names, like Renegades or Predators.', // [eg]
    'Open to anything': 'no set territory: the door is open for an unexpected idea.', // [hint]
    'Says what it is': 'tells listeners exactly what they get, like The Daily or How I Built This.', // [eg]
    'Single evocative word': 'one word that carries the whole mood, like Serial or Heavyweight.', // [eg]
    'Host-forward': 'built on the host’s own name, like The Joe Rogan Experience.', // [eg]
    'A phrase with attitude': 'a spoken phrase with personality, like Stuff You Should Know.', // [eg]
    'Wordplay / pun': 'runs on the pun, like Pod Save America.', // [eg]
  },

  // t2 band — the authored examples, each grounded in its documented origin
  // story (the same principle-then-story logic the hints use)
  nameStyle: {
    'Pop culture': 'lifted from a beloved reference, the way Radiohead came from a Talking Heads track.', // [eg + lore]
    'Inside jokes': 'an in-joke made public, the way Green Day grew out of the band’s own slang.', // [eg + lore]
    'Places': 'named for a real or imagined place, the way Cypress Hill took theirs from an LA street.', // [eg + lore]
    'Food': 'edible and memorable, like The Cranberries, who began as a pun on cranberry sauce.', // [eg + lore]
    'Names': 'built from people’s names, the way Fleetwood Mac fused Fleetwood and McVie.', // [eg + lore]
    'Interesting words': 'a single striking word, like Outkast or Ride.', // [eg]
    'Meaningful phrases': 'a phrase with a charge in it, like AC/DC, famously spotted on a sewing machine.', // [eg + lore]
    'Random combinations': 'two words that have no business together, like Arctic Monkeys.', // [eg]
  },

  // Shared vibe map (t4 civic, t5 gaming, t6/p4 groups; p3 overrides below).
  // t4's first two lines come from the authored hint's "welcoming book club
  // vs spirited advocacy group" contrast.
  vibe: {
    'Welcoming / Inclusive': 'names with the warmth of a welcoming book club, open to everyone.', // [hint]
    'Spirited / Passionate': 'names with the energy of a spirited advocacy group behind a cause.', // [hint]
    'Fun / Social': 'names that make the meetup sound like the best part of the week.', // [proposed]
    'Serious / Civic': 'names with letterhead weight, the kind a city council takes seriously.', // [proposed]
    'Local / Grassroots': 'names that wear the neighborhood on the badge, like every Friends of the Park group.', // [lore]
    'Intimidating / Feared': 'names that read like a threat in the lobby, the way Evil Geniuses does.', // [lore]
    'Meme-worthy / Ironic': 'names that play the joke on purpose, like a squad called 404: Skill Not Found.', // [lore]
    'Clean / Professional': 'jersey-ready names with no baggage, in the mold of Liquid or Sentinels.', // [lore]
    'Fun / Casual': 'easygoing names that don’t take themselves too seriously.', // [proposed]
    'Serious / Professional': 'polished names that hold up in any room.', // [proposed]
    'Aspirational': 'names that point at what this could become, not just what it is.', // [proposed]
    'Irreverent / Playful': 'cheeky names that bend the rules, the way Between the Wines does for a book club.', // [lore]
    'Cozy / Warm': 'warm, familiar names that feel like home.', // [proposed]
    'Elegant / Sophisticated': 'polished names with a bit of occasion to them.', // [proposed]
    'Funny / Playful': 'names that get a laugh on the first read.', // [proposed]
  },

  // p2 pet — grounded in the pet hints ("'Professor' works for a dignified
  // cat", "'Chaos' works for a hyperactive dog", call names "Bella, Benny,
  // Luna")
  nameTone: {
    'Dignified / Regal': 'stately names for a pet with presence, the way “Professor” suits a dignified cat.', // [hint]
    'Tough / Strong': 'big-energy names, the way “Chaos” fits a hyperactive dog.', // [hint]
    'Cute / Sweet': 'soft, sweet names like Bella or Luna.', // [hint examples]
    'Playful / Funny': 'names with a little mischief in them.', // [proposed]
  },

  // t5 gaming tag structure
  tagStyle: {
    'Prefix style': 'the tag rides in front, like FaZe X or Cloud9 X.', // [sublabel]
    'Single word / No tag': 'one clean word that stands alone, like Liquid or Sentinels.', // [sublabel]
    'Clan suffix': 'crew-style suffix, like X Gaming or X Esports.', // [sublabel]
  },
};

// Per-segment overrides: same label, different naming tradition in context.
// p3 covers houses, cabins, boats, and WiFi networks, each with real,
// documented naming customs of its own.
export const BRIEF_EXPANSIONS_BY_SUB = {
  p3: {
    vibe: {
      'Cozy / Warm': 'names in the cottage-sign tradition, like Rose Cottage or The Nook.', // [lore]
      'Adventurous / Outdoorsy': 'names that belong on a trailhead or a transom, like Basecamp or North Star.', // [lore]
      'Elegant / Sophisticated': 'estate-style names that would suit a brass plaque, like The Willows.', // [lore]
      'Funny / Playful': 'the pun tradition: Seas the Day on a hull, The LAN Before Time on a router.', // [lore]
      'Intellectual / Scientific': 'references with a book or an equation behind them, in the spirit of Walden.', // [lore]
    },
  },
};

// ── Brief notes ─────────────────────────────────────────────────────────
// The brief CHAT shows an explanation beside every question; the brief CARD
// (creator review + participant side) used to show only the bare answer, so it
// read thin. These are the short, audience-neutral captions that carry that
// context onto the card — one muted line under each row saying what the section
// is FOR. Condensed from the client's authored hints where they exist ("took
// from Maria"), written fresh where a question had none. Keyed by question id
// (ids repeat across segments), with per-segment overrides where the meaning
// shifts. Return null → the row renders answer-only, exactly as before.
// Notes appear ONLY where they add a naming implication the answer doesn't
// already carry — what the answer MEANS for the name, in Maria's own vivid
// example lines wherever she wrote one. Since the brief now shows the full
// authored question as the row label, anything self-evident (question +
// answer say it all) gets NO note; coaching lines about how to answer
// ("Tell us…", "the clearer the picture…") never appear on the brief at
// all. Picks carry their expansions instead and never take a note.
export const BRIEF_NOTES = {
  // Cross-segment, shared free-text questions
  admiredNames:      'The pattern in these is the thing to aim for.', // [hint]
  avoidNames:        'Already ruled out, including anything that sounds too close.', // [hint]
  namesConsidered:   'The shortlist so far, plus the near-misses that show what fits.', // [hint]
  keepOrLeave:       'What to carry over from the current name, and what to drop.', // [hint]

  // Group free-text (t2 band + shared)
  genre:             'Metal goes powerful (Slayer, Pantera); indie goes literary (Fleet Foxes, Bon Iver); pop stays easy to say.', // [hint]
  originStory:       'Lynyrd Skynyrd came from a gym teacher, Radiohead from a Talking Heads song. A good origin can hand you the name.', // [hint]

  // Personal · baby (p1) free-text
  lastName:          'First and last name have to flow together; long surnames often pair best with short first names.', // [hint]
  heritage:          'Names that honor these roots, or work across them.', // [hint]
  exploreDirections: 'A letter, a sibling link, or a family tradition.', // [prompt]
  avoidDirections:   'Whole directions that are off the table.', // [prompt]

  // Personal · pet (p2) free-text
  breed:             'A Chihuahua named “Bruno” is funny; “Chaos” fits a hyperactive dog.', // [hint]
};

// Per-segment overrides where the same id means something different in context.
export const BRIEF_NOTES_BY_SUB = {
  // p4 something else (personal)
  p4: {
    history: 'A good story can hand you the name.', // [proposed]
  },
  // p3 home / property
  p3: {
    location: 'The setting a name could draw on.', // [proposed]
  },
  // t6 something else (group)
  t6: {
    history: 'A good story can hand you the name.', // [proposed]
  },
  // t4 club / civic group
  t4: {
    localConnection: 'Local roots give a name something to belong to.', // [proposed]
    story:           'A good origin can hand you the name.', // [proposed]
  },
  // t3 podcast
  t3: {
    compShows: 'It’s the name style you’re after, not the subject.', // [hint]
  },
  // t2 band
  t2: {
    projectSummary: 'The band, its scene, and where it plays.', // [proposed]
  },
  // t1 sports
  t1: {
    projectSummary: 'The team, its level, and what it’s about.', // [proposed]
    sportLeague:    'The sport, league, and level of play.', // [prompt]
    geography:      'A city, region, landmark, or colors the name could draw on.', // [prompt]
    admiredNames:   'Team names you like, at any level, and what makes them work.', // [prompt]
    avoidNames:     'Rivals, existing clubs, or names already taken in the league.', // [prompt]
  },
  // b5 business, something else
  b5: {
    projectSummary: 'An initiative, program, event, tool, or space, and what it’s for.', // [hint]
    nameUsage:      'Where people will see or say it: a site, a sign, a logo, in conversation.', // [hint]
    audience:       'Who the name is for, so the tone lands right.', // [hint]
    nameCommunicate:'The ideas, feelings, or themes the name should carry.', // [hint]
    nameConnection: 'Whether it should echo the company name, sit alongside others, or stand alone.', // [hint]
    practicalReqs:  'A maximum length, easy to spell, or words to avoid.', // [hint]
  },
  // b3 project
  b3: {
    projectSummary: 'A quick line on what this project is.', // [proposed]
    projDesc:       'Its goal, scope, and who it affects. A good name captures the spirit, like Project Heartbeat for a retention push.', // [hint]
    admiredNames:   'Past project names that stuck, and what made them stick.', // [hint]
    includeAvoid:   'Loaded words, old project names, or acronyms already taken.', // [hint]
  },
  // b4 rebrand
  b4: {
    projectSummary: 'The company being rebranded, and who it serves.', // [prompt]
    rebrandReason:  'What’s prompting the change, and what’s shifting about the business.', // [prompt]
    companyDesc:    'What it does today, in a plain sentence or two.', // [hint]
    targetAudience: 'Who has to love the new name: role, age, what they care about.', // [placeholder]
    competitors:    'Direct competitors, so the new name stands apart from them.', // [proposed]
    keepOrLeave:    'A kept sound or initial carries trust over; a word left behind says what the rebrand is escaping.', // [hint]
  },
  // b1 company
  b1: {
    namingTarget:     'A brand-new name, or a rebrand of an existing company.', // [hint]
    projectSummary:   'What it does, who it’s for, and what sets it apart.', // [hint]
    nameCommunicate:  'Qualities like speed, trust, or craft, or a territory such as nature, navigation, or transformation.', // [hint]
    brandPersonality: 'Bold or understated, playful or serious, modern or timeless.', // [hint]
    includeAvoid:     'Words to lean toward, and words that feel overused or off-limits.', // [hint]
    practicalReqs:    'A letter or syllable limit, easy to spell, the exact dot-com, works internationally.', // [hint]
  },

  // b2 product — each line sits UNDER its question on the brief's left rail
  // and adds what the question itself doesn't say: scope, or a real example.
  // RULE: never restate the question's own words (a note under "What exactly
  // is the product?" may not open "What it is…"). Adapted from the client's
  // hints, with the "Tell us…" instruction dropped.
  b2: {
    projectSummary:   'A physical product, an app, a service, or a feature, and who it’s for.', // [hint]
    brandFamily:      'The parent brand, and any siblings the new name will sit alongside.', // [hint]
    productLine:      'If more are coming, the name may need to work as a pattern, like Kindle, Kindle Paperwhite, Kindle Oasis.', // [hint]
    namingConventions:'A shared theme, a structure, a length, a starting letter.', // [hint]
    pairedWithCompany:'Google Maps almost always appears with Google in front; Tide never mentions P&G.', // [hint]
    featuresBenefits: 'Calm names the app’s exact benefit; Post-it describes the product in two syllables.', // [hint]
    nameUsage:        'A label on a shelf, an app-store listing, a URL, a menu, a sales call.', // [hint]
    nameStyles:       'Real words, invented words, or two words fused together.', // [eg]
    descriptiveEvocative: 'QuickBooks tells you what it’s for; Kindle doesn’t describe an e-reader, but it kindles the right idea.', // [hint]
    otherLanguages:   'Words drawn or adapted from Latin, Greek, Italian, or anywhere else.', // [hint]
    includeAvoid:     'Words loved, words overused in the category, anything off-limits.', // [hint]
    admiredNames:     'Reference names from any industry, and what appeals about them: sound, style, meaning, originality.', // [hint]
    practicalReqs:    'A letter or syllable limit, easy to spell, the exact dot-com, trademark friendly, works internationally.', // [hint]
  },
};

// ── Participant labels ──────────────────────────────────────────────────
// The brief shows the client's full authored QUESTION as each row's label.
// On the creator's review that's right (they're answering). But a handful of
// questions address the creator as "you" ("What existing names are YOU drawn
// to?"), which reads wrong on the participant brief, where the row shows the
// host's answer. For those rare cases only, a participant sees a neutral
// noun-phrase instead. Everything not listed here keeps the full question.
export const PARTICIPANT_LABELS = {
  otherLanguages:     'Is the host open to names from other languages?',
  includeAvoid:       'Any words or ideas to explore or avoid?',
  admiredNames:       'What existing names is the host drawn to?',
  namesConsidered:    'Any names the host has already considered?',
  customRequirements: 'Anything else from the host?',
  exploreDirections:  'Anything to specifically explore?',
  avoidDirections:    'Anything to specifically avoid?',
};
export const PARTICIPANT_LABELS_BY_SUB = {
  t4: {
    admiredNames:   'Which organization or group names does the host admire?',
  },
  t3: {
    compShows:      'Any show or project names the host admires?',
  },
  t2: {
    genre:        'What’s the band’s genre and sound?',
    nameStyle:    'Naming territory',
    admiredNames: 'Which band names does the host admire?',
  },
  t1: {
    admiredNames: 'Which team names does the host like?',
    teamColors:   'Team colors',
  },
  b5: {
    nameConnection: 'Should the name connect to the company or other names?',
    admiredNames:   'Any names the host has in mind, or admires?',
  },
  b4: {
    currentName: 'Current name',
    companyDesc: 'What the company does',
    competitors: 'Competitor names',
  },
  b3: {
    admiredNames: 'Project names that landed well',
    includeAvoid: 'Words and acronyms to avoid',
  },
};

// Row label for the PARTICIPANT brief: a neutral rewrite where the question
// addresses the creator, otherwise the same full question the creator sees.
export function getParticipantLabel(question, subId) {
  if (!question) return '';
  return (
    PARTICIPANT_LABELS_BY_SUB[subId]?.[question.id] ||
    PARTICIPANT_LABELS[question.id] ||
    getBriefLabel(question)
  );
}

// ── Participant notes ───────────────────────────────────────────────────
// The two brief surfaces need different halves of the same authored hint.
// The creator is filling a form and can see EMPTY rows, so their note gives
// scope ("what goes here"). The participant only ever sees ANSWERED rows, so
// scope is redundant; what helps them is the naming implication ("what this
// means for the names you suggest") — which is the half of Maria's hints
// carrying her real examples. Same source sentence, split by audience.
//
// Rows deliberately absent: ones whose answer explains itself (a plain
// yes/no, "Prefer English") and ones where the answer IS the context (the
// opening summary). Rich picks get their expansion instead, never a note.
export const BRIEF_PARTICIPANT_NOTES = {
  admiredNames:   'The pattern in these is the thing to aim for.', // [hint]
  includeAvoid:   'Lean toward what’s listed here, and clear of the rest.', // [hint]
  practicalReqs:  'A name that fails these is out, however good it sounds.', // [hint]
  avoidNames:     'Anything close to these is out, however good it sounds.', // [hint]
  namesConsidered:'The near-misses show what the right name feels like.', // [hint]
  originStory:    'Lynyrd Skynyrd came from a gym teacher, Radiohead from a Talking Heads song. A good origin can hand you the name.', // [hint]
  genre:          'Metal goes powerful (Slayer, Pantera); indie goes literary (Fleet Foxes, Bon Iver); pop stays easy to say.', // [hint]
  breed:          'A Chihuahua named “Bruno” is funny; “Chaos” fits a hyperactive dog.', // [hint]
  lastName:       'First and last name have to flow together; long surnames often pair best with short first names.', // [hint]
  heritage:       'Names that honor these roots, or work across them.', // [hint]
  exploreDirections: 'Lean toward these.', // [proposed]
  avoidDirections:   'Steer clear of these.', // [proposed]
};

export const BRIEF_PARTICIPANT_NOTES_BY_SUB = {
  p4: {
    history: 'A good story can hand you the name.', // [proposed]
  },
  p3: {
    location: 'The setting a name can nod to.', // [proposed]
  },
  t6: {
    history: 'A good story can hand you the name.', // [proposed]
  },
  t4: {
    localConnection: 'Place gives a name roots and something to rally behind.', // [proposed]
    story:           'A good origin can hand you the name.', // [proposed]
  },
  t3: {
    compShows: 'The style of these is the thing to aim for.', // [proposed]
  },
  t1: {
    geography: 'Place and colors give a name roots and something to rally behind.', // [proposed]
  },
  b5: {
    nameUsage:       'Where it shows up shapes what works: a sign reads differently than a URL.', // [hint]
    audience:        'Pitch the tone to these people.', // [proposed]
    nameCommunicate: 'The ideas or feelings the name should carry.', // [hint]
    nameConnection:  'Whether it stands alone or sits alongside other names.', // [hint]
  },
  b4: {
    rebrandReason:  'What’s changing tells you what the name has to signal.', // [proposed]
    targetAudience: 'The name has to land with these people first.', // [proposed]
    competitors:    'The new name should not blend in with these.', // [proposed]
    keepOrLeave:    'A kept sound carries trust over; a dropped word says what’s being escaped.', // [hint]
  },
  b3: {
    projDesc:     'A good internal name captures the spirit, like Project Heartbeat for a retention push.', // [hint]
    admiredNames: 'The ones that stuck are the pattern to aim for.', // [hint]
    includeAvoid: 'Ruled out, whatever the idea.', // [proposed]
  },
  b1: {
    nameCommunicate:  'Speed, trust, craft, or a territory like nature, navigation, or a distinctive animal.', // [hint]
    brandPersonality: 'Bold or understated, playful or serious, modern or timeless.', // [hint]
    practicalReqs:    'A name that fails these is out, however good it sounds.', // [hint]
  },
  b2: {
    brandFamily:      'A name that has to live in a family plays differently than one standing alone.', // [hint]
    productLine:      'If more are coming, the name may need to work as a pattern, like Kindle, Kindle Paperwhite, Kindle Oasis.', // [hint]
    namingConventions:'A new name that has to fit an established system plays by its rules.', // [hint]
    pairedWithCompany:'Google Maps almost always appears with Google in front; Tide never mentions P&G.', // [hint]
    featuresBenefits: 'Calm names the app’s exact benefit; Post-it describes the product in two syllables.', // [hint]
    nameUsage:        'Where the name shows up shapes what works: a shelf label reads differently than an app-store listing.', // [hint]
    includeAvoid:     'Lean toward what’s listed here, and clear of the rest.', // [hint]
    practicalReqs:    'A name that fails these is out, however good it sounds.', // [hint]
  },
};

// The participant-facing note for a question, or null. No fallback to the
// creator note on purpose: those are scope lines written for someone filling
// a blank row, and they read as noise next to a finished answer.
export function getParticipantNote(questionId, subId) {
  return (
    BRIEF_PARTICIPANT_NOTES_BY_SUB[subId]?.[questionId] ||
    BRIEF_PARTICIPANT_NOTES[questionId] ||
    null
  );
}

// ── Brief sections ─────────────────────────────────────────────
// The client describes a brief as a document with parts (what it is, what the
// name should do, explore/avoid, practical), not a flat run of questions in
// whatever order they were asked. These maps group a segment's question ids
// under those parts, so the brief reads as sections instead of one long run.
// Guides are NOT hung per section: the finished brief collects them in one
// standardized block (uneven counts per segment make scattering look patchy).
//
// Any question missing from the map falls into a trailing group, so adding a
// question to a segment can never silently drop it from the brief.
export const BRIEF_SECTIONS = {
  p4: [
    { title: 'About it', icon: 'Sparkle',
      sub: 'The basics, and the story behind it',
      ids: ['projectSummary', 'history'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The vibe, names already floated, and what to steer clear of',
      ids: ['vibe', 'namesConsidered', 'avoidNames', 'customRequirements'] },
  ],
  p3: [
    { title: 'About it', icon: 'House',
      sub: 'What it is, what makes it special, and where',
      ids: ['namingTarget', 'propDesc', 'location'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The tone to strike, the shortlist so far, and what to steer clear of',
      ids: ['vibe', 'namesConsidered', 'avoidNames'] },
    { title: 'Practical requirements', icon: 'ListChecks',
      sub: 'Where the name shows up, language, and anything else',
      ids: ['signDisplay', 'languagePref', 'customRequirements'] },
  ],
  p2: [
    { title: 'About the pet', icon: 'PawPrint',
      sub: 'What kind of pet, and what they’re like',
      ids: ['petType', 'breed'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The tone, the shortlist so far, and what to steer clear of',
      ids: ['nameTone', 'namesConsidered', 'avoidNames', 'customRequirements'] },
  ],
  p1: [
    { title: 'About the baby', icon: 'Baby',
      sub: 'The basics, and the surname the name sits beside',
      ids: ['dueDate', 'gender', 'lastName'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'Roots to honor, and the shape of the name',
      ids: ['heritage', 'lengthPref'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'Where to aim, the shortlist so far, and what to steer clear of',
      ids: ['exploreDirections', 'avoidDirections', 'namesConsidered', 'customRequirements'] },
  ],
  t6: [
    { title: 'About the group', icon: 'UsersThree',
      sub: 'What the group is, and the story behind it',
      ids: ['projectSummary', 'history'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The vibe the name should carry',
      ids: ['vibe'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'Names already floated, and what to steer clear of',
      ids: ['namesConsidered', 'avoidNames', 'customRequirements'] },
  ],
  t4: [
    { title: 'About the group', icon: 'UsersThree',
      sub: 'What the group is, where it’s rooted, and its story',
      ids: ['projectSummary', 'orgType', 'localConnection', 'story'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The vibe, the names to match, and what to steer clear of',
      ids: ['vibe', 'admiredNames', 'avoidNames', 'customRequirements'] },
  ],
  t3: [
    { title: 'About the show', icon: 'Microphone',
      sub: 'The show, in short',
      ids: ['projectSummary'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The naming territory, the shows to match, and what to steer clear of',
      ids: ['namingDirection', 'compShows', 'avoidNames', 'customRequirements'] },
  ],
  t2: [
    { title: 'About the band', icon: 'MusicNote',
      sub: 'The band, its sound, and how it formed',
      ids: ['projectSummary', 'genre', 'originStory'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The naming territory, the names to match, and what to steer clear of',
      ids: ['nameStyle', 'admiredNames', 'avoidNames', 'customRequirements'] },
  ],
  t1: [
    { title: 'About the team', icon: 'SoccerBall',
      sub: 'The team, its home turf, and who plays',
      ids: ['projectSummary', 'sportLeague', 'ageGroup', 'geography'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The personality and the territories to explore',
      ids: ['personality', 'namingDirection'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The names to match, and what to steer clear of',
      ids: ['admiredNames', 'avoidNames', 'customRequirements'] },
  ],
  b5: [
    { title: 'About it', icon: 'Sparkle',
      sub: 'What it is, where it shows up, and who it’s for',
      ids: ['projectSummary', 'nameUsage', 'audience'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The message, the style, and how it relates to other names',
      ids: ['nameCommunicate', 'descriptiveEvocative', 'nameConnection'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The taste to match, and what to steer clear of',
      ids: ['admiredNames', 'avoidNames'] },
    { title: 'Practical requirements', icon: 'ListChecks',
      sub: 'Length, spelling, and anything non-negotiable',
      ids: ['practicalReqs', 'customRequirements'] },
  ],
  b1: [
    { title: 'About the company', icon: 'Buildings',
      sub: 'What it is, who it’s for, and what sets it apart',
      ids: ['namingTarget', 'projectSummary'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The message and personality it should carry',
      ids: ['nameCommunicate', 'brandPersonality', 'nameStyles', 'descriptiveEvocative', 'otherLanguages'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The taste to match, and what’s off the table',
      ids: ['includeAvoid', 'admiredNames'] },
    { title: 'Practical requirements', icon: 'ListChecks',
      sub: 'Length, spelling, domains, and anything non-negotiable',
      ids: ['practicalReqs', 'customRequirements'] },
  ],
  b3: [
    { title: 'About the project', icon: 'Flag',
      sub: 'The goal, who it affects, and how long it runs',
      ids: ['projectSummary', 'projDesc', 'projDuration'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'How functional or evocative the name should feel',
      ids: ['projNameType'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The names that landed, and what to steer clear of',
      ids: ['admiredNames', 'includeAvoid', 'customRequirements'] },
  ],
  b4: [
    { title: 'About the rebrand', icon: 'ArrowsClockwise',
      sub: 'The company today, and why it’s changing',
      ids: ['projectSummary', 'currentName', 'rebrandReason', 'companyDesc'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The style, and who it has to win over',
      ids: ['namingStyle', 'targetAudience'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'Who to stand apart from, and what to keep or drop',
      ids: ['competitors', 'keepOrLeave', 'customRequirements'] },
  ],
  b2: [
    { title: 'About the product', icon: 'Package',
      sub: 'What it is, who it’s for, and the family it joins',
      ids: ['projectSummary', 'brandFamily', 'productLine', 'namingConventions', 'pairedWithCompany'] },
    { title: 'What the name should do', icon: 'Target',
      sub: 'The message it should carry, and the places it has to work',
      ids: ['featuresBenefits', 'nameUsage', 'nameStyles', 'descriptiveEvocative', 'otherLanguages'] },
    { title: 'Directions to explore and avoid', icon: 'Compass',
      sub: 'The taste to match, and what’s off the table',
      ids: ['includeAvoid', 'admiredNames'] },
    { title: 'Practical requirements', icon: 'ListChecks',
      sub: 'Length, spelling, domains, and anything non-negotiable',
      ids: ['practicalReqs', 'customRequirements'] },
  ],
};

// Group a segment's questions into the authored sections. Returns null when a
// segment has no map yet, so callers fall back to the flat list unchanged.
export function getBriefSections(subId, questions) {
  const map = BRIEF_SECTIONS[subId];
  if (!map || !questions || !questions.length) return null;
  const byId = new Map(questions.map((q) => [q.id, q]));
  const used = new Set();
  const groups = map
    .map((sec) => {
      const items = sec.ids.map((id) => byId.get(id)).filter(Boolean);
      items.forEach((q) => used.add(q.id));
      return { title: sec.title, sub: sec.sub, icon: sec.icon, items };
    })
    .filter((sec) => sec.items.length);
  const rest = questions.filter((q) => !used.has(q.id));
  if (rest.length) groups.push({ title: 'Anything else', sub: null, icon: 'Sparkle', items: rest });
  return groups;
}

// Brief-card heading for a question. The chat ASKS ("Will there be other
// products in this line?") while the brief used to reuse a truncated label
// ("Other products in this line?"), which read as an interrogation transcript
// and lost the question's own clarity. The brief now shows the client's full
// authored prompt — her exact words, nothing invented — falling back to the
// short label for prompts that are instructions rather than questions
// ("Tell us about the band."). `briefLabel` on a question overrides both,
// for the handful of prompts whose second person would confuse a reader.
export function getBriefLabel(question) {
  if (!question) return '';
  if (question.briefLabel) return question.briefLabel;
  const p = typeof question.prompt === 'string' ? question.prompt.trim() : '';
  if (p.endsWith('?')) return p;
  return question.label;
}

// One-line brief-card note for a question, or null. subId lets a segment
// override the shared note where context changes the meaning.
export function getBriefNote(questionId, subId) {
  return (
    BRIEF_NOTES_BY_SUB[subId]?.[questionId] ||
    BRIEF_NOTES[questionId] ||
    null
  );
}

// One-line expansion for a question's picked option, or null. subId lets a
// segment override the shared map where context changes the meaning.
export function getExpansion(questionId, label, subId) {
  return (
    BRIEF_EXPANSIONS_BY_SUB[subId]?.[questionId]?.[label] ||
    BRIEF_EXPANSIONS[questionId]?.[label] ||
    null
  );
}

// True when at least one of the values (string or array) has an expansion,
// so renderers know to use the expanded list layout.
export function hasExpansions(questionId, value, subId) {
  const list = Array.isArray(value) ? value : [value];
  return list.some((v) => typeof v === 'string' && getExpansion(questionId, v, subId));
}
