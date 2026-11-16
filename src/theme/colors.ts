/** Dream Oasis palette: midnight purple, cosmic blue, lavender, soft gold. */
export const colors = {
  midnight: '#0B0720',
  midnightDeep: '#060313',
  purple: '#1B1040',
  purpleMid: '#2A1766',
  cosmicBlue: '#1E3A8A',
  cosmicBlueSoft: '#3B5BDB',
  lavender: '#B9A7FF',
  lavenderSoft: '#D9D0FF',
  gold: '#F5D78E',
  goldDeep: '#D9B25A',
  white: '#FFFFFF',
  text: '#F3EFFF',
  textMuted: '#A99FD0',
  textDim: '#6F6598',
  glass: 'rgba(255,255,255,0.06)',
  glassStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(185,167,255,0.22)',
  borderGold: 'rgba(245,215,142,0.45)',
  danger: '#FF8FA3',
} as const;

export const gradients = {
  background: ['#0B0720', '#1B1040', '#14275E'] as const,
  card: ['#2A1766', '#1E3A8A'] as const,
  gold: ['#F5D78E', '#D9B25A'] as const,
};
