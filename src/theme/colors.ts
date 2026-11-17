/**
 * Dream Oasis — Night Garden design tokens (approved direction B).
 * Screens and components must use these semantic tokens, never raw hex values.
 */
const palette = {
  // Approved palette
  mossNight: '#0F1613',
  greenhouse: '#18221E',
  mothPaper: '#ECE7DA',
  glow: '#C9E86B',
  nightBloom: '#E8A0AE',
  lichen: '#A9B3A7',
  fern: '#2F3E36',
  // Derived tones (same hue family)
  mossDeep: '#0A0F0D',
  greenhouseSunk: '#131B17',
  greenhouseRaised: '#1D2924',
  fernStrong: '#3C5045',
  muted: '#7E8A80',
  glowInk: '#14200F',
  glowPale: '#E6F3B8',
  bloomLight: '#F4C9D1',
  rareSilver: '#C9D3C4',
  danger: '#F2A7A0',
} as const;

export const colors = {
  ...palette,

  // Backgrounds & surfaces
  bg: palette.mossNight,
  bgDeep: palette.mossDeep,
  surface: palette.greenhouse,
  surfaceRaised: palette.greenhouseRaised,
  surfaceSunk: palette.greenhouseSunk,
  surfaceAlt: palette.greenhouseRaised,
  surfaceGlass: palette.greenhouse,
  tabBar: palette.mossNight,

  // Text
  text: palette.mothPaper,
  textSecondary: palette.lichen,
  textMuted: palette.muted, // 5.1:1 on moss night
  placeholder: palette.muted,

  // Accent — glow is reserved for the primary action, focus and legendary cards
  accent: palette.glow,
  onAccent: palette.glowInk,
  accentSoft: 'rgba(201,232,107,0.16)',
  accentBorder: 'rgba(201,232,107,0.45)',
  highlight: palette.mothPaper,

  // Lines & states
  border: palette.fern,
  borderStrong: palette.fernStrong,
  disabledBg: palette.greenhouseRaised,
  disabledText: palette.lichen,
  star: palette.mothPaper,
  starBright: palette.glowPale,

  // Translucent helpers
  paperA06: 'rgba(236,231,218,0.06)',
  paperA12: 'rgba(236,231,218,0.12)',
  glowA08: 'rgba(201,232,107,0.08)',
  glowA16: 'rgba(201,232,107,0.16)',
  glowA32: 'rgba(201,232,107,0.32)',
  bloomA16: 'rgba(232,160,174,0.16)',
  bloomA45: 'rgba(232,160,174,0.45)',
  scrim: 'rgba(7,11,9,0.72)',
  badgeBg: 'rgba(15,22,19,0.72)',

  // Dream card rarity
  rarity: {
    common: palette.lichen,
    rare: palette.rareSilver,
    epic: palette.nightBloom,
    legendary: palette.glow,
  },
} as const;

export const gradients = {
  background: [palette.mossNight, palette.mossNight, '#111A16'] as const,
  card: [palette.greenhouse, palette.greenhouse, palette.greenhouse] as const,
  cardBack: [palette.mossNight, palette.mossNight, palette.mossNight] as const,
  sheen: ['rgba(255,220,228,0)', 'rgba(255,220,228,0.10)', 'rgba(255,220,228,0)'] as const,
  artFade: ['rgba(24,34,30,0)', 'rgba(24,34,30,0.92)'] as const,
  saveBar: ['rgba(15,22,19,0)', palette.mossNight] as const,
  legendaryFrame: [palette.glow, palette.nightBloom, palette.fernStrong, palette.glow, palette.mothPaper, palette.fernStrong, palette.glow] as const,
  legendaryBadge: [palette.glow, palette.glowPale, palette.glow] as const,
  foil: ['rgba(230,243,184,0)', 'rgba(230,243,184,0.16)', 'rgba(255,220,228,0.12)', 'rgba(230,243,184,0)'] as const,
};
