import { DEFAULT_MOODS, MAX_MOODS, MOODS } from '@/data/moods';
import { Mood } from '@/data/types';

const SUPPORTED = new Set<string>(MOODS.map((m) => m.key));

export const isMood = (v: unknown): v is Mood => typeof v === 'string' && SUPPORTED.has(v);

/** Display label for a mood; unknown keys are title-cased, never mislabelled as another mood. */
export function moodLabel(m: string): string {
  return MOODS.find((x) => x.key === m)?.label ?? (m ? m.charAt(0).toUpperCase() + m.slice(1) : 'Unknown');
}

/** Returns an error message if the selection is invalid for saving, else null. */
export function moodSelectionError(moods: unknown): string | null {
  if (!Array.isArray(moods) || moods.length < 1) return 'Choose at least one feeling.';
  if (moods.length > MAX_MOODS) return `Choose up to ${MAX_MOODS} feelings.`;
  if (!moods.every(isMood)) return 'One of the selected feelings is not supported.';
  if (new Set(moods).size !== moods.length) return 'A feeling was selected twice.';
  return null;
}

/** Throws if the selection would break the stored invariants. */
export function assertValidMoods(moods: unknown): asserts moods is Mood[] {
  const error = moodSelectionError(moods);
  if (error) throw new Error(error);
}

export type ToggleOutcome = 'added' | 'removed' | 'limit' | 'last';

/**
 * Toggles one mood in an ordered selection (first = primary).
 * - Adds to the end when fewer than MAX_MOODS are selected; at the limit nothing is replaced.
 * - Removes a selected mood unless it is the last one; removing the primary promotes the next.
 */
export function toggleMood(selected: readonly Mood[], mood: Mood): { moods: Mood[]; outcome: ToggleOutcome } {
  if (selected.includes(mood)) {
    if (selected.length <= 1) return { moods: [...selected], outcome: 'last' };
    return { moods: selected.filter((m) => m !== mood), outcome: 'removed' };
  }
  if (selected.length >= MAX_MOODS) return { moods: [...selected], outcome: 'limit' };
  return { moods: [...selected, mood], outcome: 'added' };
}

/**
 * The emotions a stored dream effectively has. New-format records use `moods`; older records
 * (only `mood`) become `[mood]`. Malformed data is cleaned (unsupported/duplicate values dropped,
 * capped at MAX_MOODS) so reading never crashes.
 */
export function effectiveMoods(d: { mood?: unknown; moods?: unknown }): Mood[] {
  const list = Array.isArray(d.moods) ? d.moods : [];
  const clean = [...new Set(list.filter(isMood))].slice(0, MAX_MOODS);
  if (clean.length) return clean;
  return isMood(d.mood) ? [d.mood] : [...DEFAULT_MOODS];
}

export const sameMoods = (a: readonly Mood[], b: readonly Mood[]) => a.length === b.length && a.every((m, i) => m === b[i]);
