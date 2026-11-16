/**
 * Dream Oasis — Midnight Blue & Moonlight Silver (approved Phase 1.5 palette).
 * Screens and components must use these semantic tokens, never raw hex values.
 */
const palette = {
  night: '#071521', // deep night background
  navy: '#10283F', // primary background
  navyHorizon: '#173B50', // gradient end
  surface: '#19374C', // elevated surface
  surfaceAlt: '#24485D', // secondary surface
  moonBlue: '#85B7CE', // primary accent
  silver: '#EDF2F2', // primary text / moonlight silver
  silverSoft: '#B1C6D3', // secondary text
  silverBorder: '#345266', // borders
  moonGlow: '#D9E9F0', // soft moonlight highlight
  slate: '#6E899A', // disabled / muted
} as const;

export const colors = {
  // Backgrounds & surfaces
  bg: palette.navy,
  bgDeep: palette.night,
  surface: palette.surface,
  surfaceAlt: palette.surfaceAlt,
  surfaceGlass: 'rgba(25,55,76,0.72)',
  tabBar: 'rgba(7,21,33,0.97)',

  // Text
  text: palette.silver,
  textSecondary: palette.silverSoft,
  textMuted: palette.slate,
  /** Placeholder tone between slate and silverSoft — ≥4.5:1 on surface. */
  placeholder: '#8EA6B5',

  // Accent
  accent: palette.moonBlue,
  onAccent: palette.navy,
  accentSoft: 'rgba(133,183,206,0.16)',
  accentBorder: 'rgba(133,183,206,0.55)',
  highlight: palette.moonGlow,

  // Lines & states
  border: palette.silverBorder,
  disabledBg: palette.surfaceAlt,
  disabledText: palette.silverSoft,

  // Celestial decoration
  star: palette.silver,
  starBright: palette.moonGlow,

  // Dream card rarity (cool tones only)
  rarity: {
    common: '#A9BEC9',
    rare: '#85B7CE',
    epic: '#6DD2DF',
    legendary: '#EDF2F2',
  },
} as const;

export const gradients = {
  background: [palette.night, palette.navy, palette.navyHorizon] as const,
  card: [palette.surface, palette.navy, palette.night] as const,
  cardBack: [palette.surfaceAlt, palette.navy, palette.night] as const,
  /** Faint moonlight sheen laid over cards. */
  sheen: ['rgba(217,233,240,0.10)', 'rgba(217,233,240,0)'] as const,
};
