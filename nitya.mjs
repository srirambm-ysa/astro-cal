// nitya.mjs — pure helpers for Śoḍaśī Tithi Nitya Devis (pedagogic Kṛṣṇa-forward)
// No DOM, no Engine dependency. Reuses engine.js TITHI_NAMES indexing 0..29.
export function nityaForTithiIndex(tithiIndex, nityaDevis) {
  if (!nityaDevis || !nityaDevis.entries || nityaDevis.entries.length < 16) return null;
  const entries = nityaDevis.entries;
  const maha = entries[15] || entries.find(e => e.key === 'maha_tripura_sundari');
  // Amāvāsyā (29) and Pūrṇimā (14) → Mahā Tripura Sundarī (16th Amṛtā kalā)
  if (tithiIndex === 14 || tithiIndex === 29) return maha;
  const k = ((tithiIndex % 15) + 15) % 15; // 0..14 inside pakṣa
  const isKrishna = tithiIndex >= 15;
  if (isKrishna) {
    // Kṛṣṇa-forward: 0→Kāmeśvarī … 14→Citrā
    return entries[k];
  } else {
    // Śukla-reverse: 0→Citrā … 14→Kāmeśvarī  (14 - k)
    return entries[14 - k];
  }
}

export function nityaForDay(day, nityaDevis) {
  if (!day || !day.tithi) return null;
  // Prefer explicit index if present (engine computeDay sets day.tithi.index)
  const idx = day.tithi.index != null ? day.tithi.index : (day.tithiIndex != null ? day.tithiIndex : null);
  if (idx == null) return null;
  return nityaForTithiIndex(idx, nityaDevis);
}

export function isMahaNitya(day, nityaDevis) {
  const e = nityaForDay(day, nityaDevis);
  return !!(e && e.key === 'maha_tripura_sundari');
}

// Optional: mirror-convention helper if a lineage prefers Śukla-forward
export function nityaForTithiIndexWithConvention(tithiIndex, nityaDevis, convention) {
  if (convention === 'shukla-forward') {
    if (!nityaDevis || !nityaDevis.entries) return null;
    const entries = nityaDevis.entries;
    const maha = entries[15] || entries.find(e => e.key === 'maha_tripura_sundari');
    if (tithiIndex === 14 || tithiIndex === 29) return maha;
    const k = ((tithiIndex % 15) + 15) % 15;
    const isShukla = tithiIndex < 15;
    if (isShukla) return entries[k]; // Śukla-forward
    return entries[14 - k]; // Kṛṣṇa-reverse
  }
  return nityaForTithiIndex(tithiIndex, nityaDevis);
}
