import { Dream, DreamDetails, DreamEdit } from '@/data/types';
import { motifFor } from '@/utils/dreamView';

const EDITABLE_DETAILS: (keyof DreamDetails)[] = ['people', 'place', 'tags', 'vividness', 'lucid'];

const isEmpty = (v: unknown) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

/**
 * Applies an edit to an existing dream without touching its identity or generated card.
 * Pure: returns a new record and never calls generateCard / rollRarity.
 */
export function applyDreamEdit(prev: Dream, edit: DreamEdit): Dream {
  const next: Dream = { ...prev, text: edit.text.trim(), mood: edit.mood };
  // Identity and the generated card are immutable.
  next.id = prev.id;
  next.createdAt = prev.createdAt;
  next.card = prev.card;
  // Freeze the artwork the card shows *before* this edit (first edit only).
  if (!prev.motif) next.motif = motifFor(prev);

  if (edit.title !== undefined) {
    const t = edit.title?.trim();
    if (t) next.title = t;
    else delete next.title;
  }

  if (edit.details !== undefined) {
    const merged: DreamDetails = { ...(prev.details ?? {}) };
    for (const key of EDITABLE_DETAILS) {
      const raw = edit.details[key];
      const value = typeof raw === 'string' ? raw.trim() : raw;
      if (isEmpty(value)) delete merged[key];
      else (merged as Record<string, unknown>)[key] = value;
    }
    if (Object.keys(merged).length) next.details = merged;
    else delete next.details;
  }
  return next;
}
