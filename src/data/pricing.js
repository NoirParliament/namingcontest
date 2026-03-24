/**
 * Pricing Tiers Configuration
 * Based on NamingContest_Pricing_Model_v3.md
 */

export const PRICING_TIERS = {
  FREE: 'free',
  PAID: 'paid',
};

export const pricing = {
  business: {
    free: {
      tier: 'free',
      price: 0,
      name: 'Free',
      description: 'Try the platform',
      maxParticipants: 5,
      features: {
        briefBuilder: true,
        education: true,
        votingMethods: ['simple-poll'],
        submissions: false, // Voting Mode only
        reminders: false,
        analytics: 'basic',
        exports: ['shareable-url'],
        anonymity: true,
        liveSession: false,
        multiRound: false,
        branding: 'platform', // "Powered by Namico.com"
      },
    },
    paid: {
      tier: 'paid',
      price: 89,
      name: 'Business',
      description: 'Full platform access',
      maxParticipants: 240,
      features: {
        briefBuilder: true,
        education: true,
        votingMethods: ['simple-poll', 'ranked-choice', 'pairwise', 'multi-criteria', 'weighted'],
        submissions: true, // Full Mode: submission → curation → voting
        reminders: true,
        analytics: 'full',
        exports: ['shareable-url', 'pdf', 'csv', 'certificate'],
        anonymity: true,
        liveSession: true,
        multiRound: true,
        branding: 'platform',
        pinProtection: true,
        uniqueLinks: true,
        successMeter: true,
        catchwordCTA: true,
      },
    },
  },

  team: {
    free: {
      tier: 'free',
      price: 0,
      name: 'Free',
      description: 'Try the platform',
      maxParticipants: 5,
      features: {
        briefBuilder: true,
        education: true,
        votingMethods: ['simple-poll', 'ranked-choice'],
        submissions: false, // Voting Mode only
        reminders: false,
        analytics: 'basic',
        exports: ['shareable-url', 'winner-card'],
        anonymity: true,
        liveSession: false,
        multiRound: false,
        branding: 'platform',
      },
    },
    paid: {
      tier: 'paid',
      price: 29,
      name: 'Team/Group',
      description: 'Full team features',
      maxParticipants: 60,
      features: {
        briefBuilder: true,
        education: true,
        votingMethods: ['simple-poll', 'ranked-choice', 'pairwise', 'multi-criteria'],
        submissions: true, // Full Mode
        reminders: true,
        analytics: 'full',
        exports: ['shareable-url', 'winner-card', 'certificate', 'pdf'],
        anonymity: true,
        liveSession: true,
        multiRound: false,
        branding: 'platform',
        successMeter: true,
        nameStoryGenerator: true,
      },
    },
  },

  personal: {
    free: {
      tier: 'free',
      price: 0,
      name: 'Free',
      description: 'Small household decision',
      maxParticipants: 5,
      features: {
        briefBuilder: true,
        education: 'light', // "Did You Know?" tips
        votingMethods: ['simple-poll'],
        submissions: false, // Voting Mode only
        reminders: false,
        analytics: 'basic',
        exports: ['shareable-url', 'winner-card'],
        anonymity: true,
        liveSession: false,
        multiRound: false,
        branding: 'platform',
        nameRevealCountdown: true,
        certificate: 'fun',
      },
    },
    paid: {
      tier: 'paid',
      price: 9,
      name: 'Personal',
      description: 'Extended family & friends',
      maxParticipants: 15,
      features: {
        briefBuilder: true,
        education: 'light',
        votingMethods: ['simple-poll', 'ranked-choice', 'pairwise', 'multi-criteria', 'weighted'],
        submissions: true, // Full Mode
        reminders: true,
        analytics: 'full',
        exports: ['shareable-url', 'winner-card', 'certificate'],
        anonymity: true,
        liveSession: false,
        multiRound: false,
        branding: 'platform',
        nameRevealCountdown: true,
        nameStoryGenerator: true,
        liveResults: true,
        certificate: 'both', // fun + formal
      },
    },
  },
};

/**
 * Get pricing for a specific segment and tier
 */
export const getPricing = (segmentGroup, tier = 'free') => {
  return pricing[segmentGroup]?.[tier] || null;
};

/**
 * Check if a feature is available for a given segment/tier combination
 */
export const hasFeature = (segmentGroup, tier, featureName) => {
  const plan = getPricing(segmentGroup, tier);
  if (!plan) return false;
  
  const feature = plan.features[featureName];
  if (typeof feature === 'boolean') return feature;
  if (Array.isArray(feature)) return feature.length > 0;
  return !!feature;
};

/**
 * Get upgrade prompt message based on segment
 */
export const getUpgradeMessage = (segmentGroup, currentParticipants) => {
  const freePlan = getPricing(segmentGroup, 'free');
  const paidPlan = getPricing(segmentGroup, 'paid');
  
  if (currentParticipants <= freePlan.maxParticipants) return null;
  
  const messages = {
    business: `You've reached the free limit of ${freePlan.maxParticipants} participants. Upgrade to Business for $${paidPlan.price} to invite up to ${paidPlan.maxParticipants} people and unlock all voting methods, live sessions, and professional reports.`,
    team: `You've reached the free limit of ${freePlan.maxParticipants} participants. Upgrade this contest for $${paidPlan.price} to invite up to ${paidPlan.maxParticipants} people and unlock full voting options.`,
    personal: `You've reached the free limit of ${freePlan.maxParticipants} participants. Upgrade this contest for $${paidPlan.price} to invite up to ${paidPlan.maxParticipants} people and unlock full voting options.`,
  };
  
  return messages[segmentGroup] || messages.personal;
};

