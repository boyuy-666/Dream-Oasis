import { MAX_MOODS, MOODS } from '@/data/moods';
import { Mood } from '@/data/types';

const SUPPORTED = new Set<string>(MOODS.map((m) => m.key));

export const isMood = (v: unknown): v is Mood => typeof v === 'string' && SUPPORTED.has(v);

/** Display label for a mood; unknown keys are title-cased, never mislabelled as another mood. */
export function moodLabel(m: string): string {
  return MOODS.find((x) => x.key === m)?.label ?? (m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Unknown');
}

export const EMPTY_MOODS_ERROR = 'Choose at least one feeling before saving your dream.';

/**
 * Form-interaction check: what an unsaved form may hold while the user is choosing.
 * 0–3 supported, unique emotions. An empty selection is fine here, but not for saving.
 */
export function formMoodError(moods: unknown): string | null {
  if (!Array.isArray(moods)) return 'Feelings could not be read.';
  if (moods.length > MAX_MOODS) return `Choose up to ${MAX_MOODS} feelings.`;
  if (!moods.every(isMood)) return 'One of the selected feelings is not supported.';
  if (new Set(moods).size !== moods.length) return 'A feeling was selected twice.';
  return null;
}

/**
 * Persistence check: what a saved dream must hold. 1–3 supported, unique emotions
 * (the first is the primary). Returns an error message, or null when it can be saved.
 */
export function moodSelectionError(moods: unknown): string | null {
  if (Array.isArray(moods) && moods.length === 0) return EMPTY_MOODS_ERROR;
  return formMoodError(moods);
}

/** Throws if the selection would break the stored invariants (used by the store before writing). */
export function assertValidMoods(moods: unknown): asserts moods is Mood[] {
  const error = moodSelectionError(moods);
  if (error) throw new Error(error);
}

export type ToggleOutcome = 'added' | 'removed' | 'limit';

/**
 * Toggles one mood in an ordered form selection (first = primary). Works on 0–3 items:
 * - Adds to the end when fewer than MAX_MOODS are selected; at the limit nothing is replaced.
 * - Removes a selected mood, including the last one (the form may be temporarily empty);
 *   removing the primary promotes the next.
 */
export function toggleMood(selected: readonly Mood[], mood: Mood): { moods: Mood[]; outcome: ToggleOutcome } {
  if (selected.includes(mood)) return { moods: selected.filter((m) => m !== mood), outcome: 'removed' };
  if (selected.length >= MAX_MOODS) return { moods: [...selected], outcome: 'limit' };
  return { moods: [...selected, mood], outcome: 'added' };
}

/**
 * The emotions a stored dream effectively has. New-format records use `moods`; older records
 * (only `mood`) become `[mood]`. Malformed data is cleaned (unsupported/duplicate values dropped,
 * capped at MAX_MOODS). Only genuinely invalid data (no supported mood at all) yields `[]`.
 */
export function effectiveMoods(d: { mood?: unknown; moods?: unknown }): Mood[] {
  const list = Array.isArray(d.moods) ? d.moods : [];
  const clean = [...new Set(list.filter(isMood))].slice(0, MAX_MOODS);
  if (clean.length) return clean;
  return isMood(d.mood) ? [d.mood] : [];
}

export const sameMoods = (a: readonly Mood[], b: readonly Mood[]) => a.length === b.length && a.every((m, i) => m === b[i]);
