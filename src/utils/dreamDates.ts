/**
 * Calendar-date helpers for dream dates.
 *
 * A dream date is a plain calendar day stored as `YYYY-MM-DD` (a "date key") — NOT a timestamp.
 * Keys are built from local year/month/day components; day/month arithmetic is done on UTC
 * calendar values (Date.UTC) so daylight-saving transitions can never shift a day.
 * Never parse a key with `new Date('YYYY-MM-DD')` (that is UTC midnight) and never derive a
 * local date with `toISOString().slice(0, 10)` (that is the UTC date).
 */

export type DateKey = string;
export interface MonthRef { year: number; month: number } // month: 1–12

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/** Monday-first weekday labels for calendar headers. */
export const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
export const WEEKDAY_NAMES = WEEKDAYS_LONG;

const pad = (n: number, width = 2) => String(n).padStart(width, '0');
const KEY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export function daysInMonth(year: number, month: number): number {
  return [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** Builds a key from calendar components (no validation beyond formatting). */
export const makeKey = (year: number, month: number, day: number): DateKey => `${pad(year, 4)}-${pad(month)}-${pad(day)}`;

/** Strictly parses a key: exact YYYY-MM-DD shape and a real calendar day (rejects 2026-02-30). */
export function parseKey(key: unknown): { year: number; month: number; day: number } | null {
  if (typeof key !== 'string') return null;
  const m = KEY_RE.exec(key);
  if (!m) return null;
  const year = Number(m[1]), month = Number(m[2]), day = Number(m[3]);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day };
}
export const isValidDateKey = (key: unknown): key is DateKey => parseKey(key) !== null;

/** The device-local calendar day of a Date. */
export const toDateKey = (d: Date): DateKey => makeKey(d.getFullYear(), d.getMonth() + 1, d.getDate());
export const todayKey = (now: Date = new Date()): DateKey => toDateKey(now);

/** Adds whole calendar days to a key (DST-safe: arithmetic on UTC calendar values). */
export function addDays(key: DateKey, days: number): DateKey {
  const p = parseKey(key);
  if (!p) throw new Error(`Invalid date key: ${key}`);
  const t = new Date(Date.UTC(p.year, p.month - 1, p.day + days));
  return makeKey(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}
export const yesterdayKey = (now: Date = new Date()): DateKey => addDays(todayKey(now), -1);

/** Keys are zero-padded, so string order is calendar order. */
export const compareKeys = (a: DateKey, b: DateKey) => (a < b ? -1 : a > b ? 1 : 0);
export const isFutureKey = (key: DateKey, now: Date = new Date()) => compareKeys(key, todayKey(now)) > 0;

/** Local calendar day of an ISO timestamp (e.g. a dream's createdAt). */
export function localDateKeyFromISO(iso: string): DateKey | null {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : toDateKey(d);
}

/** The day a dream happened: its stored dreamDate, else the local day it was recorded. */
export function effectiveDreamDate(d: { dreamDate?: string; createdAt: string }): DateKey {
  if (isValidDateKey(d.dreamDate)) return d.dreamDate;
  return localDateKeyFromISO(d.createdAt) ?? todayKey();
}

/** Day of week, Monday = 0 … Sunday = 6. */
export function weekdayIndex(key: DateKey): number {
  const p = parseKey(key);
  if (!p) throw new Error(`Invalid date key: ${key}`);
  return (new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7;
}

// ---------- formatting ----------
/** "Oct 20, 2026" */
export function formatKeyMedium(key: DateKey): string {
  const p = parseKey(key);
  return p ? `${MONTHS_SHORT[p.month - 1]} ${p.day}, ${p.year}` : '';
}
/** "October 20, 2026" */
export function formatKeyLong(key: DateKey): string {
  const p = parseKey(key);
  return p ? `${MONTHS_LONG[p.month - 1]} ${p.day}, ${p.year}` : '';
}
/** "Tuesday, November 17" */
export function formatKeyWeekday(key: DateKey): string {
  const p = parseKey(key);
  return p ? `${WEEKDAYS_LONG[weekdayIndex(key)]}, ${MONTHS_LONG[p.month - 1]} ${p.day}` : '';
}
/** Card-face formats, matching the existing card style: "16 Nov" / "16 Nov 2026". */
export function formatKeyCardShort(key: DateKey): string {
  const p = parseKey(key);
  return p ? `${p.day} ${MONTHS_SHORT[p.month - 1]}` : '';
}
export function formatKeyCardLong(key: DateKey): string {
  const p = parseKey(key);
  return p ? `${p.day} ${MONTHS_SHORT[p.month - 1]} ${p.year}` : '';
}
/** Date chip: "Today · Nov 17", "Yesterday · Nov 16", otherwise "Oct 20, 2026". */
export function formatDreamDateChip(key: DateKey, now: Date = new Date()): string {
  const p = parseKey(key);
  if (!p) return '';
  const short = `${MONTHS_SHORT[p.month - 1]} ${p.day}`;
  if (key === todayKey(now)) return `Today · ${short}`;
  if (key === yesterdayKey(now)) return `Yesterday · ${short}`;
  return formatKeyMedium(key);
}

// ---------- months ----------
export const monthOf = (key: DateKey): MonthRef => {
  const p = parseKey(key);
  if (!p) throw new Error(`Invalid date key: ${key}`);
  return { year: p.year, month: p.month };
};
export const currentMonth = (now: Date = new Date()): MonthRef => ({ year: now.getFullYear(), month: now.getMonth() + 1 });
export function addMonths(ref: MonthRef, n: number): MonthRef {
  const index = ref.year * 12 + (ref.month - 1) + n;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}
export const compareMonths = (a: MonthRef, b: MonthRef) => (a.year - b.year) || (a.month - b.month);
export const formatMonth = (ref: MonthRef) => `${MONTHS_LONG[ref.month - 1]} ${ref.year}`;

/**
 * Monday-first month grid. Each row has 7 cells; days outside the month are `null`.
 * Row count is dynamic (4–6) depending on where the 1st falls and the month length.
 */
export function monthGrid(ref: MonthRef): (DateKey | null)[][] {
  const lead = weekdayIndex(makeKey(ref.year, ref.month, 1));
  const total = daysInMonth(ref.year, ref.month);
  const cells: (DateKey | null)[] = [
    ...Array<null>(lead).fill(null),
    ...Array.from({ length: total }, (_, i) => makeKey(ref.year, ref.month, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);
  const rows: (DateKey | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/** Groups records by effective dream date; each day's list is newest createdAt first. */
export function groupByDreamDate<T extends { dreamDate?: string; createdAt: string }>(dreams: T[]): Map<DateKey, T[]> {
  const map = new Map<DateKey, T[]>();
  for (const d of dreams) {
    const key = effectiveDreamDate(d);
    const list = map.get(key);
    if (list) list.push(d); else map.set(key, [d]);
  }
  for (const list of map.values()) list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return map;
}
