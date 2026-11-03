/** Rounds up to a clean axis maximum: 1, 2, 2.5, 5 × 10ⁿ. */
export function niceMax(value: number) {
  if (value <= 0) {
    return 1;
  }
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * pow >= value) {
      return m * pow;
    }
  }
  return 10 * pow;
}

/** Axis tick text: full under 10,000, compact above (12K). */
export function formatTick(value: number) {
  if (value >= 10_000) {
    return `${Math.round(value / 100) / 10}K`.replace('.0K', 'K');
  }
  return Math.round(value).toLocaleString();
}

/** Column path with a 4px rounded data-end and a square baseline. */
export function columnPath(x: number, y: number, w: number, h: number, r = 4) {
  const rr = Math.min(r, w / 2, h);
  if (h <= 0) {
    return '';
  }
  return [
    `M${x},${y + h}`,
    `V${y + rr}`,
    `Q${x},${y} ${x + rr},${y}`,
    `H${x + w - rr}`,
    `Q${x + w},${y} ${x + w},${y + rr}`,
    `V${y + h}`,
    'Z',
  ].join(' ');
}
