import { Mood } from './types';

export interface MoodOption { key: Mood; label: string; glyph: string }

/** Always-visible emotions, shown before "+ More". */
export const PRIMARY_MOODS: MoodOption[] = [
  { key: 'peaceful', label: 'Peaceful', glyph: '🌙' },
  { key: 'joyful', label: 'Joyful', glyph: '✨' },
  { key: 'curious', label: 'Curious', glyph: '🔮' },
  { key: 'anxious', label: 'Anxious', glyph: '🌊' },
  { key: 'scared', label: 'Scared', glyph: '🌑' },
];

/** Emotions shown under "+ More". */
export const MORE_MOODS: MoodOption[] = [
  { key: 'eerie', label: 'Eerie', glyph: '🕯️' },
  { key: 'sad', label: 'Sad', glyph: '🌧️' },
  { key: 'excited', label: 'Excited', glyph: '⚡' },
  { key: 'confused', label: 'Confused', glyph: '🌀' },
  { key: 'angry', label: 'Angry', glyph: '🔥' },
  { key: 'nostalgic', label: 'Nostalgic', glyph: '🍂' },
  { key: 'relieved', label: 'Relieved', glyph: '🌿' },
  { key: 'lonely', label: 'Lonely', glyph: '🕸️' },
  { key: 'helpless', label: 'Helpless', glyph: '🪶' },
  { key: 'embarrassed', label: 'Embarrassed', glyph: '🌺' },
  { key: 'loved', label: 'Loved', glyph: '🌷' },
  { key: 'overwhelmed', label: 'Overwhelmed', glyph: '🌪️' },
  { key: 'guilty', label: 'Guilty', glyph: '🥀' },
];

/** All 18 supported emotions. Stored keys are never renamed or removed. */
export const MOODS: MoodOption[] = [...PRIMARY_MOODS, ...MORE_MOODS];
export const MAX_MOODS = 3;
/** A new dream starts with no feelings selected; the user must choose at least one to save. */
export const DEFAULT_MOODS: readonly Mood[] = [];
