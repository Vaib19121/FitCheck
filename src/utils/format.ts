/** "Jan 5, 2026" style date for display. */
export function formatDate(date: Date | string | number) {
  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
