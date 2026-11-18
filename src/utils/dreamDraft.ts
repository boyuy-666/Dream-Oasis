import { SUGGESTED_TAGS } from '@/data/dreamForm';
import { DreamDetails, Mood, NewDreamInput } from '@/data/types';
import { fmtShort, fmtTime } from '@/utils/dates';
import { DateKey, isValidDateKey, yesterdayKey } from '@/utils/dreamDates';
import { formMoodError } from '@/utils/moodSelection';

/** Local-only storage for the one unfinished new dream. Separate from `dream-oasis:dreams:v1`. */
export const DRAFT_KEY = 'dream-oasis:new-dream-draft:v1';
/** Where an unreadable draft is copied before the slot is reused, so it is never silently lost. */
export const DRAFT_BACKUP_KEY = 'dream-oasis:new-dream-draft:unreadable';
export const DRAFT_VERSION = 1;
export const DEFAULT_VIVIDNESS = 3;

export type RecordMode = 'quick' | 'detailed';

/**
 * Every editable value of the Record form. Quick and Detailed are two views of this one form,
 * so switching views never drops the other view's values.
 */
export interface DraftFields {
  mode: RecordMode;
  text: string;
  title: string;
  /** Ordered (first = primary), 0–3 while drafting; saving requires 1–3. */
  moods: Mood[];
  dreamDate: DateKey;
  /** True once the user picked a date; an untouched date follows "yesterday". */
  dateTouched: boolean;
  people: string[];
  /** Typed but not yet confirmed person. */
  personDraft: string;
  place: string;
  tags: string[];
  customTags: string[];
  /** Typed but not yet confirmed custom tag. */
  tagDraft: string;
  vividness: number;
  lucid: boolean;
}

export interface DreamDraft extends DraftFields {
  version: typeof DRAFT_VERSION;
  draftId: string;
  updatedAt: string; // ISO
}

export type DraftLoad =
  | { kind: 'none' }
  | { kind: 'ok'; draft: DreamDraft }
  | { kind: 'invalid'; raw: string; reason: string };

export const newDraftId = (now: Date = new Date()) =>
  `draft-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function blankFields(mode: RecordMode = 'quick', now: Date = new Date()): DraftFields {
  return {
    mode, text: '', title: '', moods: [], dreamDate: yesterdayKey(now), dateTouched: false,
    people: [], personDraft: '', place: '', tags: [], customTags: [], tagDraft: '',
    vividness: DEFAULT_VIVIDNESS, lucid: false,
  };
}

/** Values the Detailed view adds beyond Quick (including unconfirmed input). */
export function hasDetailedInput(f: DraftFields): boolean {
  return f.people.length > 0 || !!f.personDraft.trim() || !!f.place.trim() || f.tags.length > 0
    || f.customTags.length > 0 || !!f.tagDraft.trim() || f.vividness !== DEFAULT_VIVIDNESS || f.lucid;
}

/**
 * Whether the form holds anything worth keeping. Default values alone (including the default
 * "yesterday" date and the current view) never count, so switching views does not create a draft.
 */
export function isMeaningful(f: DraftFields, now: Date = new Date()): boolean {
  return !!f.text.trim() || !!f.title.trim() || f.moods.length > 0
    || (f.dateTouched && f.dreamDate !== yesterdayKey(now)) || hasDetailedInput(f);
}

/** Comparable form state (excludes the save timestamp) used to skip redundant writes. */
export const fieldsKey = (f: DraftFields) => JSON.stringify([
  f.mode, f.text, f.title, f.moods, f.dreamDate, f.dateTouched, f.people, f.personDraft,
  f.place, f.tags, f.customTags, f.tagDraft, f.vividness, f.lucid,
]);

export const toDraft = (f: DraftFields, draftId: string, now: Date = new Date()): DreamDraft => ({
  version: DRAFT_VERSION, draftId, updatedAt: now.toISOString(), ...pickFields(f),
});

/** Copies exactly the form fields (no extra keys, fresh arrays). */
export function pickFields(f: DraftFields): DraftFields {
  return {
    mode: f.mode, text: f.text, title: f.title, moods: [...f.moods], dreamDate: f.dreamDate, dateTouched: f.dateTouched,
    people: [...f.people], personDraft: f.personDraft, place: f.place, tags: [...f.tags], customTags: [...f.customTags],
    tagDraft: f.tagDraft, vividness: f.vividness, lucid: f.lucid,
  };
}

export const serializeDraft = (d: DreamDraft) => JSON.stringify(d);

const isStr = (v: unknown): v is string => typeof v === 'string';
const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr);

/**
 * Safely reads a stored draft. Never throws. A missing key is `none`; anything malformed or from
 * an unsupported version is `invalid` (with the raw text, so it can be backed up rather than lost).
 * Optional detail fields may be absent and take their defaults.
 */
export function parseDraft(raw: string | null | undefined): DraftLoad {
  if (raw === null || raw === undefined) return { kind: 'none' };
  const bad = (reason: string): DraftLoad => ({ kind: 'invalid', raw, reason });
  let v: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return bad('not an object');
    v = parsed as Record<string, unknown>;
  } catch {
    return bad('not JSON');
  }
  if (v.version !== DRAFT_VERSION) return bad('unsupported version');
  if (!isStr(v.draftId) || !v.draftId) return bad('draftId');
  if (!isStr(v.updatedAt) || Number.isNaN(Date.parse(v.updatedAt))) return bad('updatedAt');
  if (v.mode !== 'quick' && v.mode !== 'detailed') return bad('mode');
  if (!isStr(v.text) || !isStr(v.title)) return bad('text');
  if (!Array.isArray(v.moods) || formMoodError(v.moods) !== null) return bad('moods');
  if (!isValidDateKey(v.dreamDate)) return bad('dreamDate');

  const opt = <T,>(key: string, check: (x: unknown) => x is T, fallback: T): T | null => {
    if (v[key] === undefined) return fallback;
    return check(v[key]) ? (v[key] as T) : null;
  };
  const isBool = (x: unknown): x is boolean => typeof x === 'boolean';
  const isVivid = (x: unknown): x is number => Number.isInteger(x) && (x as number) >= 1 && (x as number) <= 5;
  const people = opt('people', isStrList, []);
  const personDraft = opt('personDraft', isStr, '');
  const place = opt('place', isStr, '');
  const tags = opt('tags', isStrList, []);
  const customTags = opt('customTags', isStrList, []);
  const tagDraft = opt('tagDraft', isStr, '');
  const vividness = opt('vividness', isVivid, DEFAULT_VIVIDNESS);
  const lucid = opt('lucid', isBool, false);
  const dateTouched = opt('dateTouched', isBool, false);
  if (people === null || personDraft === null || place === null || tags === null || customTags === null
    || tagDraft === null || vividness === null || lucid === null || dateTouched === null) return bad('details');

  return {
    kind: 'ok',
    draft: {
      version: DRAFT_VERSION, draftId: v.draftId, updatedAt: v.updatedAt, mode: v.mode,
      text: v.text, title: v.title, moods: [...(v.moods as Mood[])], dreamDate: v.dreamDate, dateTouched,
      people: [...people], personDraft, place, tags: [...tags], customTags: [...customTags], tagDraft, vividness, lucid,
    },
  };
}

/** Short, display-only summary for the recovery dialog (never logged). */
export function draftPreview(d: DreamDraft, maxLength = 90): { heading: string; isTitle: boolean; savedAt: string; modeLabel: string } {
  const title = d.title.trim();
  const text = d.text.trim().replace(/\s+/g, ' ');
  const excerpt = text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
  return {
    heading: title || excerpt || 'Untitled dream',
    isTitle: !!title,
    savedAt: `${fmtShort(d.updatedAt)} · ${fmtTime(d.updatedAt)}`,
    modeLabel: d.mode === 'detailed' ? 'Detailed record' : 'Quick record',
  };
}

const splitEntries = (raw: string) => raw.split(',').map((x) => x.trim()).filter(Boolean);
/** Adds entries without duplicates (case-insensitive), reusing a known label's spelling. */
function addEntries(list: string[], raw: string, known: string[] = []): string[] {
  const next = [...list];
  for (const value of splitEntries(raw)) {
    const label = [...next, ...known].find((x) => x.toLowerCase() === value.toLowerCase()) ?? value;
    if (!next.some((x) => x.toLowerCase() === label.toLowerCase())) next.push(label);
  }
  return next;
}

/** The form with unconfirmed People / Tags input committed (used when saving the dream). */
export function commitPending(f: DraftFields): DraftFields {
  const people = addEntries(f.people, f.personDraft);
  const tags = addEntries(f.tags, f.tagDraft, [...SUGGESTED_TAGS, ...f.customTags]);
  const customTags = addEntries(f.customTags, tags.filter((t) => !SUGGESTED_TAGS.includes(t)).join(','));
  return { ...f, people, tags, customTags, personDraft: '', tagDraft: '' };
}

/**
 * The dream to create from a (pending-committed) form. Detailed values are kept even when the
 * Quick view is active, as long as the user entered any; a Quick-only entry stores no details.
 */
export function buildDreamInput(f: DraftFields, draftId: string): NewDreamInput {
  const includeDetails = f.mode === 'detailed' || hasDetailedInput(f);
  const details: DreamDetails | undefined = includeDetails ? {
    ...(f.people.length ? { people: [...f.people] } : {}),
    ...(f.place.trim() ? { place: f.place.trim() } : {}),
    ...(f.tags.length ? { tags: [...f.tags] } : {}),
    vividness: f.vividness,
    lucid: f.lucid,
  } : undefined;
  return { text: f.text, moods: [...f.moods], title: f.title, details, dreamDate: f.dreamDate, draftId };
}
