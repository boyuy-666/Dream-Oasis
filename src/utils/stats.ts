import { Dream } from '@/data/types';
import { dayKey } from '@/utils/dates';

export function dreamStats(dreams: Dream[], now = new Date()) {
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const days = new Set(dreams.map((d) => dayKey(new Date(d.createdAt))));
  const dayAt = (offset: number) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset));
  // A streak counts consecutive nights ending today (or yesterday, if today is not recorded yet).
  const start = days.has(dayAt(0)) ? 0 : 1;
  let streak = 0;
  while (days.has(dayAt(start + streak))) streak++;
  return {
    total: dreams.length,
    rarePlus: dreams.filter((d) => d.card.rarity !== 'common').length,
    legendary: dreams.filter((d) => d.card.rarity === 'legendary').length,
    epic: dreams.filter((d) => d.card.rarity === 'epic').length,
    thisWeek: dreams.filter((d) => new Date(d.createdAt).getTime() >= weekAgo).length,
    streak,
    /** Last 7 nights, oldest first: true if a dream was recorded that day. */
    week: [6, 5, 4, 3, 2, 1, 0].map((o) => days.has(dayAt(o))),
  };
}
