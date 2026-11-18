import { MIN_DREAM_LENGTH } from '@/data/dreamForm';
import { Dream, NewDreamInput } from '@/data/types';
import { isFutureKey, isValidDateKey, toDateKey } from '@/utils/dreamDates';
import { generateCard } from '@/utils/generateCard';
import { moodSelectionError } from '@/utils/moodSelection';

/** A new dream was refused before anything was written (the form can show the message as-is). */
export class DreamValidationError extends Error {}

/** Returns why `input` cannot become a dream, or null when it can be saved. */
export function newDreamError(input: NewDreamInput, now: Date = new Date()): string | null {
  if (typeof input.text !== 'string' || input.text.trim().length < MIN_DREAM_LENGTH) {
    return 'Write a few words so your card has something to grow from.';
  }
  const moodError = moodSelectionError(input.moods);
  if (moodError) return moodError;
  if (input.dreamDate !== undefined && (!isValidDateKey(input.dreamDate) || isFutureKey(input.dreamDate, now))) {
    return 'Choose a dream date that is today or earlier.';
  }
  return null;
}

/** The dream already committed from this draft, if any. */
export const findByDraftId = (list: Dream[], draftId?: string) =>
  (draftId ? list.find((d) => d.draftId === draftId) : undefined);

/**
 * Builds the next dream list for a new dream. Pure apart from the one-time rarity roll inside
 * `generateCard`, which happens only when a dream is actually created.
 * - Idempotent per draft: if a dream from `input.draftId` already exists, it is returned unchanged
 *   (`created: false`) and the list is untouched, so a retry never duplicates or re-rolls a card.
 * - Throws DreamValidationError for invalid text, moods or date.
 */
export function createDreamRecord(list: Dream[], input: NewDreamInput, now: Date = new Date()): { next: Dream[]; dream: Dream; created: boolean } {
  const existing = findByDraftId(list, input.draftId);
  if (existing) return { next: list, dream: existing, created: false };
  const error = newDreamError(input, now);
  if (error) throw new DreamValidationError(error);

  let stamp = now.getTime();
  while (list.some((d) => d.id === `${stamp}`)) stamp += 1; // never reuse an existing id
  const mood = input.moods[0];
  const dream: Dream = {
    id: `${stamp}`,
    text: input.text.trim(),
    mood,
    moods: [...input.moods],
    createdAt: now.toISOString(),
    card: generateCard(input.text, mood), // rarity is rolled here, once
    dreamDate: input.dreamDate ?? toDateKey(now),
  };
  const title = input.title?.trim();
  if (title) dream.title = title;
  if (input.details) dream.details = input.details;
  if (input.draftId) dream.draftId = input.draftId;
  return { next: [dream, ...list], dream, created: true };
}
