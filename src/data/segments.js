/**
 * Segment Configuration — NamingContest.com
 * UNIFIED COLOR: all segments use supernova #d2e823
 * 3 main groups, 15 sub-segments total
 */

export const SEGMENT_GROUPS = {
  BUSINESS: 'business',
  TEAM: 'team',
  PERSONAL: 'personal',
};

export const segments = {
  business: {
    id: 'business',
    name: 'Business or Product',
    icon: '🏢',
    color: '#254f1a',
    colorName: 'business',
    description: 'Name your company, product, project, or rebrand',
    tagline: 'Name something that means business',
    subTagline: 'Your team has ideas. Structure the conversation.',
    subSegments: [
      {
        id: 'company-name',
        code: 'B1',
        name: 'Company or Startup Name',
        description: 'Naming a new business entity or startup',
        briefSteps: 4,
        briefFields: 12,
        tone: 'professional',
      },
      {
        id: 'product-name',
        code: 'B2',
        name: 'Product or Service Name',
        description: 'Naming a product, service, or offering',
        briefSteps: 4,
        briefFields: 12,
        tone: 'professional',
      },
      {
        id: 'project-name',
        code: 'B3',
        name: 'Project or Initiative Name',
        description: 'Naming an internal project or initiative',
        briefSteps: 4,
        briefFields: 10,
        tone: 'professional',
      },
      {
        id: 'rebrand',
        code: 'B4',
        name: 'Rebrand',
        description: 'Renaming an existing brand or entity',
        briefSteps: 4,
        briefFields: 14,
        tone: 'professional',
      },
      {
        id: 'other-business',
        code: 'B5',
        name: 'Other Business Naming',
        description: 'Any other business naming need',
        briefSteps: 3,
        briefFields: 8,
        tone: 'professional',
      },
    ],
  },

  team: {
    id: 'team',
    name: 'Team or Group',
    icon: '👥',
    color: '#780016',
    colorName: 'team',
    description: 'Name your sports team, band, podcast, club, or group',
    tagline: 'Give your whole group a voice',
    subTagline: 'Give everyone a voice. Pick a name you\'ll all own.',
    subSegments: [
      {
        id: 'sports-team',
        code: 'T1',
        name: 'Sports Team',
        description: 'Naming a recreational or competitive sports team',
        briefSteps: 2,
        briefFields: 7,
        tone: 'energetic',
      },
      {
        id: 'band-music',
        code: 'T2',
        name: 'Band or Music Group',
        description: 'Naming a musical act or band',
        briefSteps: 2,
        briefFields: 7,
        tone: 'creative',
      },
      {
        id: 'podcast-channel',
        code: 'T3',
        name: 'Podcast, Channel, or Creative Project',
        description: 'Naming a media project or creative work',
        briefSteps: 2,
        briefFields: 8,
        tone: 'creative',
      },
      {
        id: 'civic-school-nonprofit',
        code: 'T4',
        name: 'School, Club, Nonprofit, or Civic Org',
        description: 'Naming an organization or formal group',
        briefSteps: 3,
        briefFields: 9,
        tone: 'collaborative',
      },
      {
        id: 'gaming-group',
        code: 'T5',
        name: 'Gaming Group',
        description: 'Naming a gaming team, guild, or clan',
        briefSteps: 2,
        briefFields: 6,
        tone: 'fun',
      },
      {
        id: 'other-team',
        code: 'T6',
        name: 'Other Team or Group',
        description: 'Any other group naming need',
        briefSteps: 2,
        briefFields: 5,
        tone: 'friendly',
      },
    ],
  },

  personal: {
    id: 'personal',
    name: 'Something Personal',
    icon: '✨',
    color: '#2665d6',
    colorName: 'personal',
    description: 'Name your baby, pet, home, or something fun',
    tagline: 'Let everyone weigh in. Make it official.',
    subTagline: 'Let everyone vote. Pick the name you\'ll love.',
    subSegments: [
      {
        id: 'baby-name',
        code: 'P1',
        name: 'Baby Name',
        description: 'Choosing a name for your new baby',
        briefSteps: 1,
        briefFields: 3,
        tone: 'warm',
      },
      {
        id: 'pet-name',
        code: 'P2',
        name: 'Pet Name',
        description: 'Naming your new pet or animal companion',
        briefSteps: 1,
        briefFields: 3,
        tone: 'playful',
      },
      {
        id: 'home-property-fun',
        code: 'P3',
        name: 'Home, Property, or Something Fun',
        description: 'Naming a house, boat, vacation home, or fun project',
        briefSteps: 1,
        briefFields: 4,
        tone: 'lighthearted',
      },
      {
        id: 'other-personal',
        code: 'P4',
        name: 'Other Personal Naming',
        description: 'Any other personal naming decision',
        briefSteps: 1,
        briefFields: 3,
        tone: 'casual',
      },
    ],
  },
};

/**
 * Get segment by ID
 */
export const getSegment = (groupId) => {
  return segments[groupId] || null;
};

/**
 * Get sub-segment by parent group and sub-segment ID
 */
export const getSubSegment = (groupId, subSegmentId) => {
  const segment = getSegment(groupId);
  if (!segment) return null;
  return segment.subSegments.find(sub => sub.id === subSegmentId) || null;
};

/**
 * Get all segments as array
 */
export const getAllSegments = () => {
  return Object.values(segments);
};

/**
 * Get tier color for a group
 * Unified supernova gold for all segments
 */
export const getSegmentColor = (groupId) => {
  const colorMap = {
    business: '#254f1a',
    team: '#780016',
    personal: '#2665d6',
  };
  return colorMap[groupId] || '#ffffff';
};

/**
 * Get tier CSS class name
 */
export const getSegmentClass = (groupId) => {
  return `tier-${groupId}`;
};
