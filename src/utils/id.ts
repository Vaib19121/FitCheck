/** Short, locally unique id (not cryptographically random; fine for on-device records). */
export function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
