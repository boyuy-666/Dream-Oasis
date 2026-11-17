import { Mood } from './types';

export interface MoodOption { key: Mood; label: string; glyph: string }

/** The original five emotions, always visible. */
export const PRIMARY_MOODS: MoodOption[] = [
  { key: 'peaceful', label: 'Peaceful', glyph: '🌙' },
  { key: 'joyful', label: 'Joyful', glyph: '✨' },
  { key: 'curious', label: 'Curious', glyph: '🔮' },
  { key: 'anxious', label: 'Anxious', glyph: '🌊' },
  { key: 'eerie', label: 'Eerie', glyph: '🕯️' },
];

/** Additional emotions shown under "+ More". */
export const MORE_MOODS: MoodOption[] = [
  { key: 'sad', label: 'Sad', glyph: '🌧️' },
  { key: 'excited', label: 'Excited', glyph: '⚡' },
  { key: 'confused', label: 'Confused', glyph: '🌀' },
  { key: 'angry', label: 'Angry', glyph: '🔥' },
  { key: 'nostalgic', label: 'Nostalgic', glyph: '🍂' },
  { key: 'scared', label: 'Scared', glyph: '🌑' },
  { key: 'relieved', label: 'Relieved', glyph: '🌿' },
  { key: 'lonely', label: 'Lonely', glyph: '🕸️' },
];

export const MOODS: MoodOption[] = [...PRIMARY_MOODS, ...MORE_MOODS];
export const MAX_MOODS = 3;
export const DEFAULT_MOODS: readonly Mood[] = ['peaceful'];
