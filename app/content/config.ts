import type { Status } from '@/lib/db/interface';

export type { Status };
export { STATUSES } from '@/lib/db/interface';

export const STATUS_CONFIG: Record<Status, { label: string; dot: string }> = {
  idea:      { label: 'Idea',      dot: 'bg-zinc-400' },
  draft:     { label: 'Draft',     dot: 'bg-amber-400' },
  scheduled: { label: 'Scheduled', dot: 'bg-blue-500' },
  published: { label: 'Published', dot: 'bg-green-500' },
};

export const BANNER_COLORS = [
  { id: 'tomato',    label: 'Tomato',    bg: 'bg-red-500' },
  { id: 'flamingo',  label: 'Flamingo',  bg: 'bg-rose-400' },
  { id: 'tangerine', label: 'Tangerine', bg: 'bg-orange-400' },
  { id: 'banana',    label: 'Banana',    bg: 'bg-yellow-400' },
  { id: 'sage',      label: 'Sage',      bg: 'bg-lime-500' },
  { id: 'basil',     label: 'Basil',     bg: 'bg-green-700' },
  { id: 'peacock',   label: 'Peacock',   bg: 'bg-cyan-500' },
  { id: 'blueberry', label: 'Blueberry', bg: 'bg-blue-700' },
  { id: 'lavender',  label: 'Lavender',  bg: 'bg-violet-400' },
  { id: 'grape',     label: 'Grape',     bg: 'bg-purple-600' },
] as const;

export type BannerColorId = typeof BANNER_COLORS[number]['id'];

export const BANNER_COLOR_MAP = Object.fromEntries(
  BANNER_COLORS.map((c) => [c.id, c])
) as Record<BannerColorId, typeof BANNER_COLORS[number]>;
