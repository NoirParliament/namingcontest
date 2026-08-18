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

// The canonical pricing explanation — ONE text used verbatim everywhere the
// model is explained (tier question hint in chat + edit modal, landing FAQ,
// legacy mockData). Derived from VOTER_TIERS so the numbers can't drift.
const [T1, T2, T3] = VOTER_TIERS;
export const PRICING_EXPLANATION =
  `The price depends only on how many people take part: ` +
  `$${T1.price} for up to ${T1.voters} participants, $${T2.price} for up to ${T2.voters}, or $${T3.price} for up to ${T3.voters}. ` +
  `You pay once per contest — no subscription, and no per-name or per-participant charges on top. ` +
  `The tier is the only thing that changes: a $${T1.price} contest works exactly like a $${T3.price} one. ` +
  `Invitations are unlimited — share your link with as many people as you like. ` +
  `A spot is only used when someone signs in with their email to take part, whether to submit names or to vote; just opening the link doesn’t count. ` +
  `Fees aren’t refundable once a contest has launched.`;

// The voter-package question shape — shared so BriefChat (asks it) and
// ReviewLaunch (lets you change it before launch) render the same step.
export const VOTER_TIER_QUESTION = {
  id: 'voterTier',
  section: 'voter',
  type: 'voterTier',
  label: 'Participants',
  prompt: 'How many people will take part in the contest?',
  required: true,
  hint: PRICING_EXPLANATION,
};
