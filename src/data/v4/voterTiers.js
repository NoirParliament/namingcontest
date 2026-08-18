// Voter tiers — the ONLY thing that sets a contest's price. Same three
// options for every category (Personal / Group / Business); the category
// just shapes the brief questions + theme. The tier (how many people can
// vote) is chosen during setup in BriefChat and flows to the checkout.
//
// One source of truth — every price/cap shown in the app derives from here.

export const VOTER_TIERS = [
  { voters: 10, price: 9 },
  { voters: 30, price: 19 },
  { voters: 90, price: 39 },
];

// Middle tier preselected as a sensible default (used if a contest somehow
// reaches checkout without an explicit choice).
export const DEFAULT_VOTER_TIER = 30;

// Lowest price — for the "from $X" cue on the homepage category cards.
export const FROM_PRICE = VOTER_TIERS[0].price; // 9

// Price for a given voter count (falls back to the cheapest tier).
export function priceForVoters(voters) {
  const t = VOTER_TIERS.find((x) => x.voters === voters);
  return t ? t.price : VOTER_TIERS[0].price;
}

// "Up to 30 participants" — the canonical capacity label.
export function voterCapLabel(voters) {
  return `Up to ${voters} participants`;
}

// The voter-package question shape — shared so BriefChat (asks it) and
// ReviewLaunch (lets you change it before launch) render the same step.
export const VOTER_TIER_QUESTION = {
  id: 'voterTier',
  section: 'voter',
  type: 'voterTier',
  label: 'Participants',
  prompt: 'How many people will take part in the contest?',
  required: true,
  hint: `This is the only thing that sets the price: one payment per contest, no subscription, and nothing extra per name or vote. Every tier works exactly the same. Invitations are unlimited — share your link with as many people as you like; a spot is only used when someone takes part by submitting names or voting.`,
};
