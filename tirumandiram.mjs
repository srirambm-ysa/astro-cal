/* Tirumandiram Verse of the Day — helper (pure, no DOM).
   Deterministic daily rotation over 365 curated verses.
   Uses day-of-year (IST civil date) so same calendar date → same verse every year.
   Export: getVerseOfDay(y,m,d, corpus)  and helpers.
*/

export function dayOfYear(y, m, d) {
  // m: 1..12
  const dt = new Date(Date.UTC(y, m - 1, d));
  const start = new Date(Date.UTC(y, 0, 1));
  const diff = dt - start;
  return Math.floor(diff / 86400000) + 1; // 1..366
}

export function getVerseOfDay(y, m, d, corpus) {
  if (!corpus || !corpus.entries || !corpus.entries.length) return null;
  const doy = dayOfYear(y, m, d);
  // map 1..366 → 0..364 (wrap leap day 366 → index 0 reuses verse 1)
  const idx = (doy - 1) % corpus.entries.length;
  return corpus.entries[idx];
}

export function getVerseByNumber(n, corpus) {
  if (!corpus || !corpus.entries) return null;
  return corpus.entries.find(v => v.n === n) || null;
}

// For testing: deterministic over year boundary
export function __test_dayOfYear(y, m, d) { return dayOfYear(y, m, d); }
