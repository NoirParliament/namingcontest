// ─────────────────────────────────────────────────────────────────────────────
// paywallMoments.js  –  Paywall simulation data
// ─────────────────────────────────────────────────────────────────────────────

export const PLAN_PRICE = { personal: '$9', team: '$29', business: '$89' };
export const PLAN_LABEL = { personal: 'Personal', team: 'Team', business: 'Business' };
export const FREE_CAP   = { personal: 5, team: 5, business: 5 };

function buildMoments(group) {
  const price  = PLAN_PRICE[group];
  const cap    = FREE_CAP[group];
  const hasPdf = group !== 'personal';

  const capHeadline = {
    business: `You've reached the free limit. Business contests start at $89.`,
    team:     `You've reached the free limit. Upgrade for $29 to add your whole group.`,
    personal: `You've reached the free limit. Upgrade for $9 to invite up to 30 people.`,
  }[group];

  const capSubtext = {
    business: `Free tier is a demo — up to 5 participants. Business contests support up to 240 participants, open submissions, and advanced voting.`,
    team:     `Free tier supports 5 participants. Team contests at $29 support up to 60 members — enough for your full group.`,
    personal: `Free contests support 5 people. $9 lets you invite up to 15 family and friends to weigh in.`,
  }[group];

  return [
    {
      id: 'open-submissions',
      title: 'Open Submissions',
      where: 'Brief Builder',
      trigger: 'Toggling "Let participants suggest names"',
      headline: 'Letting your group suggest names requires a paid contest.',
      subtext: 'Free contests are voting-only — you pre-load the names and participants vote. Open submissions is the moment a naming contest becomes real.',
      price,
      type: 'toggle-gate',
    },
    {
      id: 'participant-cap',
      title: 'Participant Cap',
      where: 'Invite Participants',
      trigger: `${cap + 1}th participant invited`,
      headline: capHeadline,
      subtext: capSubtext,
      price,
      type: 'cap-gate',
      capNumber: cap,
    },
    {
      id: 'voting-method',
      title: 'Advanced Voting Method',
      where: 'Contest Type Selection',
      trigger: 'Selecting Ranked-Choice, Pairwise, or Multi-Criteria voting',
      headline: 'This voting method is available on paid contests.',
      subtext: 'Advanced methods are always visible so you can see what\'s possible. Ranked-choice, pairwise comparison, and multi-criteria scoring unlock on any paid plan.',
      price,
      type: 'method-gate',
    },
    {
      id: 'articles',
      title: 'Naming Methodology',
      where: 'Participant Education',
      trigger: 'Participants accessing naming articles',
      headline: 'Naming methodology is a paid feature.',
      subtext: 'Free contests skip the education phase entirely. Paid contests give participants Catchword\'s naming framework — articles and quizzes to sharpen every submission.',
      price,
      type: 'articles-gate',
    },
    ...(group !== 'personal' ? [{
      id: 'quality-score',
      title: 'Contest Quality Score',
      where: 'Brief Builder & ContestLive sidebar',
      trigger: 'Viewing the quality score bar on free tier',
      headline: 'Contest quality scoring is a paid feature.',
      subtext: 'The double-sided quality score (0–100) tracks creator prep and participant engagement live. Visible to both sides — and a strong signal for serious contests.',
      price,
      type: 'quality-gate',
    }] : []),
    {
      id: 'reminders',
      title: 'Automated Reminders',
      where: 'Brief Builder — Deadline Settings',
      trigger: 'Setting up participant email reminders',
      headline: 'Automated reminders are available on paid contests.',
      subtext: 'Paid contests send deadline nudges automatically — 3 days and 1 day before close — to every participant who hasn\'t submitted yet.',
      price,
      type: 'reminders-gate',
    },
    ...(hasPdf ? [
      {
        id: 'pdf-active',
        title: 'PDF Report',
        where: 'Results Page',
        trigger: '"Download PDF Report" clicked during active contest',
        headline: 'Upgrade this contest to unlock the full report.',
        subtext: 'The report is generated live as submissions come in. Upgrade any time before the contest closes — it\'s ready when you are.',
        price,
        type: 'pdf-gate',
        retroactive: false,
      },
    ] : []),
    {
      id: 'white-label',
      title: 'White-label Branding',
      where: 'PDF Report / Participant View',
      trigger: 'Previewing output with "Powered by Namico.com" footer',
      headline: 'Remove platform branding with any paid plan.',
      subtext: 'All paid plans include white-label output — no platform footer on your PDFs or participant-facing pages. Clean, professional deliverables from your first paid contest.',
      price,
      type: 'branding-gate',
    },
    {
      id: 'second-round',
      title: 'Second Round Discount',
      where: 'Results Page — Post-Vote Reflection',
      trigger: 'Selecting "We\'re still not sure" after results',
      headline: `Get 50% off your second round — just ${group === 'personal' ? '$4.50' : group === 'team' ? '$14.50' : '$44.50'}.`,
      subtext: 'Not confident in the winner? Run another round with a fresh brief, new candidates, or a different voting method. Half price because you already did the hard part.',
      price: `${group === 'personal' ? '$4.50' : group === 'team' ? '$14.50' : '$44.50'}`,
      type: 'discount-offer',
    },
  ];
}

export const PAYWALL_MOMENTS = {
  business: buildMoments('business'),
  team:     buildMoments('team'),
  personal: buildMoments('personal'),
};
