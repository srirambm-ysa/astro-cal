/* alliance-filter.mjs — Best-Match Calculator (Alliance Filter) for astro-cal.
 *
 * Given one fixed person's birth (nakshatra, rashi, pada), computes the ranked
 * set of partner birth combinations that score best on the 36-guna Ashtakoota.
 * Pure function over the 108 canonical Moon-pada positions; reuses
 * calculateAshtakoota from marriage.mjs. No engine/astronomy required.
 *
 * Source: Muhurta Chintamani, Ch.6 (Vivaha Prakarana), pp.149-227.
 */
import { calculateAshtakoota, loadRules } from "./marriage.mjs";

export { loadRules };

/* ============================================================================
   CONSTANTS & DATA from engine.js / marriage_rules.json
   ============================================================================ */

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];

const RASHI_NAMES = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena",
];

// Nakshatra span = 360/27 = 13°20' = 13.333...°
// Pada span = Nakshatra span / 4 = 3°20' = 3.333...°
const NAKSHA_DEG = 360 / 27;
const PADA_DEG = NAKSHA_DEG / 4;

// Rashi span = 30°
const RASHI_DEG = 30;

// Pre-computed: for each nakshatra (1-27), its starting longitude (0-based degrees)
const NAKSHATRA_START_LON = Array.from({ length: 27 }, (_, i) => i * NAKSHA_DEG);

// 11 Marriage Nakshatras from Ch.6 p.194 (1-based indices)
const MARRIAGE_NAKSHATRA_INDICES = new Set([5, 13, 19, 17, 10, 4, 27, 12, 21, 26, 15]);
// Mrigashira(5), Hasta(13), Moola(19), Anuradha(17), Magha(10), Rohini(4),
// Revati(27), Uttara Phalguni(12), Uttara Ashadha(21), Uttara Bhadrapada(26), Swati(15)

/* ============================================================================
   generateValidProfiles() — 108 canonical Moon-pada positions
   ============================================================================ */

/**
 * Generates all 108 astronomically valid (nakshatra, rashi, pada) triples.
 * Each nakshatra spans 13°20'; each pada = 3°20'. The Moon's position
 * determines the rashi (30° signs). A nakshatra can span at most 2 rashis.
 *
 * @returns {Array<{nakshatra: number, rashi: number, pada: number}>} 108 profiles
 */
export function generateValidProfiles() {
  const profiles = [];
  for (let nak = 1; nak <= 27; nak++) {
    const startLon = NAKSHATRA_START_LON[nak - 1]; // 0-based degrees
    for (let pada = 1; pada <= 4; pada++) {
      // Pada midpoint longitude (more robust than start/end for rashi determination)
      const padaMidLon = startLon + (pada - 0.5) * PADA_DEG;
      const rashi = Math.floor(padaMidLon / RASHI_DEG) + 1; // 1-based
      profiles.push({ nakshatra: nak, rashi, pada });
    }
  }
  // Should be exactly 108
  if (profiles.length !== 108) {
    throw new Error(`generateValidProfiles: expected 108, got ${profiles.length}`);
  }
  return profiles;
}

/* ============================================================================
   Helper: group profiles by (nakshatra, rashi) pair, collect valid padas
   ============================================================================ */

function groupByNakshatraRashi(profiles) {
  const map = new Map(); // key: "nak,rashi" -> { nak, rashi, padas: [] }
  for (const p of profiles) {
    const key = `${p.nakshatra},${p.rashi}`;
    if (!map.has(key)) {
      map.set(key, { nakshatra: p.nakshatra, rashi: p.rashi, padas: [] });
    }
    map.get(key).padas.push(p.pada);
  }
  return Array.from(map.values());
}

/* ============================================================================
   computeAllianceWhitelist() — main entry point
   ============================================================================ */

/**
 * Computes the ranked alliance whitelist for a fixed person.
 *
 * @param {Object} input - Fixed person data
 * @param {string} input.role - "groom" | "bride"
 * @param {number} input.nakshatra - 1..27
 * @param {number} input.rashi - 1..12
 * @param {number} input.pada - 1..4
 * @param {Object} rules - marriage_rules.json object
 * @param {Object} opts - Options
 * @param {number} opts.topN - Top N rows for ranking table (default 18)
 * @param {number} opts.minScore - Minimum score for compatibility (default 18)
 * @returns {AllianceWhitelist}
 */
export function computeAllianceWhitelist(input, rules, opts = {}) {
  const { topN = 18, minScore = 18 } = opts;

  // Validate fixed person input
  if (!isValidNatal(input.nakshatra, input.rashi, input.pada)) {
    throw new Error("Fixed person's birth data is internally inconsistent (nakshatra/rashi/pada mismatch).");
  }

  const fixedPerson = {
    role: input.role,
    nakshatra: input.nakshatra,
    rashi: input.rashi,
    pada: input.pada,
    nakshatraName: NAKSHATRA_NAMES[input.nakshatra - 1],
    rashiName: RASHI_NAMES[input.rashi - 1],
  };

  // Generate all valid partner profiles
  const allProfiles = generateValidProfiles();
  const grouped = groupByNakshatraRashi(allProfiles); // 36 unique (nak, rashi) pairs

  // For each (nak, rashi), find the best pada score against fixed person
  const rows = [];
  for (const group of grouped) {
    let bestScore = -1;
    let bestPada = group.padas[0];
    let bestBreakdown = null;
    let bestHasNadiDosha = false;
    let bestHasBhakootDosha = false;
    let bestNadiCanceled = false;
    let bestBhakootCanceled = false;

    for (const pada of group.padas) {
      const candidate = {
        nakshatra: group.nakshatra,
        rashi: group.rashi,
        pada,
      };

      // Arrange as groom/bride based on fixed person's role
      const [groom, bride] = input.role === "groom"
        ? [fixedPerson, candidate]
        : [candidate, fixedPerson];

      const result = calculateAshtakoota(groom, bride, rules);

      if (result.totalScore > bestScore) {
        bestScore = result.totalScore;
        bestPada = pada;
        bestBreakdown = result.breakdown;
        bestHasNadiDosha = result.hasNadiDosha;
        bestHasBhakootDosha = result.hasBhakootDosha;
        bestNadiCanceled = result.isNadiCanceled;
        bestBhakootCanceled = result.isBhakootCanceled;
      }
    }

    const isCompatible = bestScore >= minScore && !bestHasNadiDosha && !bestHasBhakootDosha;
    const tierLabel = getTierLabel(bestScore, rules);

    rows.push({
      nakshatra: group.nakshatra,
      nakshatraName: NAKSHATRA_NAMES[group.nakshatra - 1],
      rashi: group.rashi,
      rashiName: RASHI_NAMES[group.rashi - 1],
      bestPada,
      totalScore: bestScore,
      scorePercentage: Number(((bestScore / 36) * 100).toFixed(2)),
      tierLabel,
      isCompatible,
      hasNadiDosha: bestHasNadiDosha,
      hasBhakootDosha: bestHasBhakootDosha,
      nadiPariharaApplied: bestNadiCanceled,
      bhakootPariharaApplied: bestBhakootCanceled,
      birthNakInMarriageList: MARRIAGE_NAKSHATRA_INDICES.has(group.nakshatra),
      breakdown: bestBreakdown,
    });
  }

  // Sort by ranking criteria:
  // 1. isCompatible desc (true first)
  // 2. For compatible rows: birthNakInMarriageList desc (preferred first)
  // 3. totalScore desc
  // 4. tierLabel precedence
  // 5. parihara count desc (canceled doshas are better)
  // 6. lower dosha severity (no dosha > canceled > active)
  const tierOrder = { MOST_EXCELLENT: 4, EXCELLENT: 3, MEDIUM: 2, NOT_SUITABLE: 1, null: 0 };

  rows.sort((a, b) => {
    if (a.isCompatible !== b.isCompatible) return b.isCompatible - a.isCompatible;
    if (a.isCompatible && b.isCompatible && a.birthNakInMarriageList !== b.birthNakInMarriageList) {
      return b.birthNakInMarriageList - a.birthNakInMarriageList;
    }
    if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
    const ta = tierOrder[a.tierLabel] || 0;
    const tb = tierOrder[b.tierLabel] || 0;
    if (ta !== tb) return tb - ta;

    const aParihara = (a.nadiPariharaApplied ? 1 : 0) + (a.bhakootPariharaApplied ? 1 : 0);
    const bParihara = (b.nadiPariharaApplied ? 1 : 0) + (b.bhakootPariharaApplied ? 1 : 0);
    if (aParihara !== bParihara) return bParihara - aParihara;

    const aDoshaSeverity = (a.hasNadiDosha && !a.nadiPariharaApplied ? 3 : 0) + (a.hasBhakootDosha && !a.bhakootPariharaApplied ? 2 : 0);
    const bDoshaSeverity = (b.hasNadiDosha && !b.nadiPariharaApplied ? 3 : 0) + (b.hasBhakootDosha && !b.bhakootPariharaApplied ? 2 : 0);
    if (aDoshaSeverity !== bDoshaSeverity) return aDoshaSeverity - bDoshaSeverity;

    return 0;
  });

  // Build whitelist: only compatible profiles are shown in the ranking
  const compatible = rows.filter((r) => r.isCompatible);
  const ranking = compatible.slice(0, topN);

  // Assign ranks within the compatible subset
  ranking.forEach((row, i) => { row.rank = i + 1; });
  compatible.forEach((row, i) => { row.overallRank = i + 1; });

  const byTier = {};
  for (const r of rows) {
    byTier[r.tierLabel] = (byTier[r.tierLabel] || 0) + 1;
  }

  const maxScore = rows[0]?.totalScore ?? 0;
  const recommended = compatible[0] || rows[0] || null;

  return {
    schema: "alliance-whitelist-v1",
    generatedAt: new Date().toISOString(),
    fixedPerson: {
      role: fixedPerson.role,
      nakshatra: fixedPerson.nakshatra,
      nakshatraName: fixedPerson.nakshatraName,
      rashi: fixedPerson.rashi,
      rashiName: fixedPerson.rashiName,
      pada: fixedPerson.pada,
    },
    options: { topN, minScore },
    ranking,
    compatible,
    summary: {
      validProfiles: 108,
      candidatePairs: grouped.length, // 36
      compatibleCount: compatible.length,
      byTier,
      maxScore,
      recommended,
    },
    provenance: "Muhurta Chintamani - Vivaha Prakarana (Chapter 6)",
  };
}

/* ============================================================================
   Export helpers
   ============================================================================ */

function getTierLabel(score, rules) {
  const tiers = rules.ashtakoota.thresholdTiers;
  for (const t of tiers) {
    if (score >= t.min && score <= t.max) return t.label;
  }
  return null;
}

function isValidNatal(nak, rashi, pada) {
  if (nak < 1 || nak > 27 || rashi < 1 || rashi > 12 || pada < 1 || pada > 4) return false;
  const startLon = NAKSHATRA_START_LON[nak - 1];
  const padaMidLon = startLon + (pada - 0.5) * PADA_DEG;
  const expectedRashi = Math.floor(padaMidLon / RASHI_DEG) + 1;
  return expectedRashi === rashi;
}

/**
 * Converts AllianceWhitelist to CSV string.
 * @param {AllianceWhitelist} whitelist
 * @returns {string}
 */
export function toCSV(whitelist) {
  const cols = [
    "rank", "nakshatra", "rashi", "bestPada", "totalScore", "scorePercentage",
    "tierLabel", "isCompatible", "nadiDosha", "bhakootDosha", "pariharas",
    "birthNakInMarriageList"
  ];
  const header = cols.join(",");
  const rows = whitelist.ranking.map((r) => [
    r.rank,
    r.nakshatra,
    r.rashi,
    r.bestPada,
    r.totalScore,
    r.scorePercentage,
    r.tierLabel || "",
    r.isCompatible ? "YES" : "NO",
    r.hasNadiDosha ? "YES" : "NO",
    r.hasBhakootDosha ? "YES" : "NO",
    (r.nadiPariharaApplied ? "Nadi" : "") + (r.bhakootPariharaApplied ? (r.nadiPariharaApplied ? "+Bhakoot" : "Bhakoot") : ""),
    r.birthNakInMarriageList ? "YES" : "NO",
  ].join(","));
  return [header, ...rows].join("\n");
}

/**
 * Converts AllianceWhitelist to JSON string (pretty-printed).
 * @param {AllianceWhitelist} whitelist
 * @returns {string}
 */
export function toJSON(whitelist) {
  return JSON.stringify(whitelist, null, 2);
}