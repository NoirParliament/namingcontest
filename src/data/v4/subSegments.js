// V4 sub-segment options keyed by tier (group).
// Used by the unified BriefChat at /v4/setup/brief — the very first
// question is the sub-segment pick, rendered as card-style choices.

// Pastel tones drawn from homepage palette — each option gets its own warm color.
export const TONES = {
  blush:      { bg: '#fadecc', fg: '#9c4818' },
  butter:     { bg: '#fceebc', fg: '#8a6a14' },
  mint:       { bg: '#bce5c8', fg: '#1f5430' },
  periwinkle: { bg: '#c4cff5', fg: '#283b78' },
  sky:        { bg: '#c4dffb', fg: '#1d4f7a' },
  pink:       { bg: '#f4cce0', fg: '#8a2864' },
  lavender:   { bg: '#dccaf2', fg: '#4f1d80' },
};

// Per-tier labels + sub-segment options. Icons reference Phosphor names
// resolved at render-time so this data file is import-light.
export const SUB_SEGMENTS = {
  personal: {
    label: 'personal',
    options: [
      { id: 'p1', icon: 'Baby',          tone: TONES.pink,       title: 'New baby',                       body: "The most exciting naming you’ll ever do." },
      { id: 'p2', icon: 'PawPrint',      tone: TONES.butter,     title: 'Pet',                            body: 'Dogs, cats, horses, the lot.' },
      { id: 'p3', icon: 'House',         tone: TONES.mint,       title: 'Home, WiFi network, boat, and more', body: 'Holiday cottage, boat, or anything in between.' },
      { id: 'p4', icon: 'PencilSimple',  tone: TONES.periwinkle, title: 'Something else',                   body: 'A group chat, a girls’ weekend, a friend group, anything that needs a name.' },
    ],
  },
  group: {
    label: 'group',
    options: [
      { id: 't1', icon: 'SoccerBall',    tone: TONES.mint,       title: 'Sports team',                            body: 'Local league, school squad, recreational team.' },
      { id: 't2', icon: 'MusicNote',     tone: TONES.lavender,   title: 'Band or music group',                    body: 'Whatever the genre.' },
      { id: 't3', icon: 'Microphone',    tone: TONES.sky,        title: 'Podcast, channel, or creative project',  body: 'Audio, video, or anything in between.' },
      { id: 't4', icon: 'GraduationCap', tone: TONES.blush,      title: 'Club or civic group',                    body: 'A chess club, a neighborhood group, a civic cause.' },
      // 2026-08-17 client decision (Maria/Mark): drop the Gaming Group
      // category — "too many Groups; roll it into Sports Team or Club.
      // We can always add this later." Card commented out (reversible);
      // t5's question set + guides stay in the data files.
      // { id: 't5', icon: 'GameController',tone: TONES.butter,     title: 'A gaming group',                           body: 'Team, guild, or clan.' },
      { id: 't6', icon: 'PencilSimple',  tone: TONES.periwinkle, title: 'Something else',                           body: 'A group chat, a friend group, a shared tradition, anything that needs a name.' },
    ],
  },
  business: {
    label: 'business',
    // 2026-07-13 client decision (Maria/Mark): three business paths —
    // Company (no "startup" in the title), Product (same questionnaire as
    // Company for now), and Something else (with Maria's examples). b3/b4
    // kept below (commented) so they're restorable; their question
    // sets/themes stay in the data files.
    options: [
      { id: 'b1', icon: 'Buildings',        tone: TONES.periwinkle, title: 'Company',       body: 'Start-up, new venture, or company renaming.' },
      { id: 'b2', icon: 'Package',          tone: TONES.butter,     title: 'Product',       body: 'Anything your business offers, from food & beverage to software to an experience or service.' },
      // { id: 'b3', icon: 'Target',           tone: TONES.blush,      title: 'A project or initiative',  body: 'Internal initiative, campaign, or program.' },
      // { id: 'b4', icon: 'ArrowsClockwise',  tone: TONES.mint,       title: 'A rebrand',                body: 'Refresh of an existing name.' },
      { id: 'b5', icon: 'PencilSimple',     tone: TONES.sky,        title: 'Something else',  body: 'Initiatives, off-sites, meeting rooms, anything that needs a name.' },
    ],
  },
};
