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
    'Descriptive': 'gives a sense of what you do or offer, like PayPal or QuickBooks.', // [sublabel]
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

  // t1 territories — grounded in the OKC Thunder / Seattle Kraken hint
  namingDirection: {
    'Animal / Mascot': 'a creature to rally behind, like Lions, Hawks, or Seattle’s Kraken.', // [eg + hint]
    'Force of Nature': 'names that evoke a powerful force of nature, like Thunder or Blaze.', // [hint + eg]
    'Place / Geographic': 'names that connect to your region or home turf, like Riverside or Northern.', // [hint + eg]
    'Elite / Best': 'names that plant a flag at the top, like Apex or Vanguard.', // [eg]
    'Tough / Fierce': 'hard-edged names, like Renegades or Predators.', // [eg]
    'Open to anything': 'no set territory: the door is open for an unexpected idea.', // [hint]
  },

  // t2 band — the authored examples, each grounded in its documented origin
  // story (the same principle-then-story logic the hints use)
  nameStyle: {
    'Pop culture': 'lifted from a reference you love, the way Radiohead came from a Talking Heads track.', // [eg + lore]
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
