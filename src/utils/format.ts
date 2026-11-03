export type WeightUnit = 'kg' | 'lb';

const KG_PER_LB = 0.45359237;

/** "Jan 5, 2026" style date for display. */
export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** "Today", "Yesterday", "3 days ago", else a short date. */
export function formatRelativeDay(date: Date | string | number, now = Date.now()) {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(
    (startOfDay(new Date(now)) - startOfDay(new Date(date))) / 86_400_000,
  );
  if (days === 0) {
    return 'Today';
  }
  if (days === 1) {
    return 'Yesterday';
  }
  if (days > 1 && days < 7) {
    return `${days} days ago`;
  }
  return formatDate(date);
}

/** 75 → "1:15", 3725 → "1:02:05". */
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** 3725 → "1h 2m", 300 → "5m". */
export function formatDuration(totalSeconds: number) {
  const mins = Math.round(totalSeconds / 60);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Weights are stored in kg; convert for display. */
export function toDisplayWeight(kg: number, unit: WeightUnit) {
  const value = unit === 'kg' ? kg : kg / KG_PER_LB;
  return Math.round(value * 10) / 10;
}

/** Convert a user-entered weight back to kg for storage. */
export function fromDisplayWeight(value: number, unit: WeightUnit) {
  return unit === 'kg' ? value : value * KG_PER_LB;
}

export function formatWeight(kg: number, unit: WeightUnit) {
  return `${toDisplayWeight(kg, unit)} ${unit}`;
}

/** Large volumes shortened: 12500 kg → "12.5k kg". */
export function formatVolume(kg: number, unit: WeightUnit) {
  const v = toDisplayWeight(kg, unit);
  const text = v >= 10_000 ? `${Math.round(v / 100) / 10}k` : `${Math.round(v)}`;
  return `${text} ${unit}`;
}

/** "upper arms" → "Upper Arms". */
export function titleCase(s: string) {
  return s.replace(/(^|\s)([a-z])/g, (_, p, c) => p + c.toUpperCase());
}
