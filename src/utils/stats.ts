import { Dream } from '@/data/types';

export function dreamStats(dreams: Dream[]) {
  const weekAgo = Date.now() - 7 * 86_400_000;
  return {
    total: dreams.length,
    rarePlus: dreams.filter((d) => d.card.rarity !== 'common').length,
    thisWeek: dreams.filter((d) => new Date(d.createdAt).getTime() >= weekAgo).length,
  };
}
