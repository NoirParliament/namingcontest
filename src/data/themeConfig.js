/**
 * V2 Design System — Shared Theme Config
 * Single source of truth for all group colors and light theme constants.
 * Replaces per-page TIER / TIER_CONFIG / tierConfig objects.
 */

// ── Group-specific color palettes (derived from landing page) ──

export const GROUP_THEME = {
  personal: {
    primary: '#2665d6',
    primaryRgb: '38,101,214',
    accent: '#d2e823',
    label: 'Personal',
    btnBg: '#2665d6',
    btnText: '#ffffff',
    surfaceBg: '#eef3ff',
    tagBg: 'rgba(38,101,214,0.08)',
    tagBorder: 'rgba(38,101,214,0.2)',
    tagText: '#2665d6',
    // Legacy compat (some pages reference tc.color / tc.rgb / tc.textColor)
    color: '#2665d6',
    rgb: '38,101,214',
    textColor: '#ffffff',
    colorRgb: '38,101,214',
  },
  team: {
    primary: '#780016',
    primaryRgb: '120,0,22',
    accent: '#e9c0e9',
    label: 'Team',
    btnBg: '#780016',
    btnText: '#ffffff',
    surfaceBg: '#fdf2f4',
    tagBg: 'rgba(120,0,22,0.08)',
    tagBorder: 'rgba(120,0,22,0.2)',
    tagText: '#780016',
    color: '#780016',
    rgb: '120,0,22',
    textColor: '#ffffff',
    colorRgb: '120,0,22',
  },
  business: {
    primary: '#254f1a',
    primaryRgb: '37,79,26',
    accent: '#e8efd6',
    label: 'Business',
    btnBg: '#1e2330',
    btnText: '#ffffff',
    surfaceBg: '#f5f7ef',
    tagBg: 'rgba(37,79,26,0.08)',
    tagBorder: 'rgba(37,79,26,0.2)',
    tagText: '#254f1a',
    color: '#254f1a',
    rgb: '37,79,26',
    textColor: '#ffffff',
    colorRgb: '37,79,26',
  },
};

// ── Shared light theme constants ──

export const LIGHT_THEME = {
  // Backgrounds
  pageBg: '#fafaf5',
  cardBg: '#ffffff',
  cardBorder: 'rgba(30,35,48,0.1)',
  cardShadow: '0 1px 3px rgba(0,0,0,0.04)',
  navBg: '#ffffff',
  navBorder: 'rgba(30,35,48,0.08)',
  sidebarBg: '#f8f8f5',
  sidebarBorder: 'rgba(30,35,48,0.08)',
  inputBg: '#ffffff',
  inputBorder: 'rgba(30,35,48,0.15)',
  hoverBg: 'rgba(30,35,48,0.04)',

  // Text
  textPrimary: '#1e2330',
  textSecondary: '#676b5f',
  textMuted: '#8a8a82',
  inputText: '#1e2330',

  // Borders & dividers
  divider: 'rgba(30,35,48,0.08)',

  // Typography
  fontDisplay: "'Bricolage Grotesque', 'Inter', sans-serif",
  fontBody: "'Inter', sans-serif",
};

// ── Helper functions ──

export function getGroupTheme(groupId) {
  return GROUP_THEME[groupId] || GROUP_THEME.business;
}

export function getNeutralTheme() {
  return {
    primary: '#1e2330',
    primaryRgb: '30,35,48',
    accent: '#d2e823',
    label: '',
    btnBg: '#1e2330',
    btnText: '#ffffff',
    surfaceBg: '#f3f3f1',
    tagBg: 'rgba(30,35,48,0.06)',
    tagBorder: 'rgba(30,35,48,0.15)',
    tagText: '#1e2330',
    color: '#1e2330',
    rgb: '30,35,48',
    textColor: '#ffffff',
    colorRgb: '30,35,48',
  };
}
