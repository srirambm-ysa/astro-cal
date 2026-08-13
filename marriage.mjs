/* marriage.mjs — Vivaha Muhurta + Ashtakoota matchmaking module for astro-cal.
 *
 * Two-stage pipeline per docs/match-making-workflow.md:
 *   Stage 1: Ashtakoota (36-guna) couple eligibility — pure function, no engine.
 *   Stage 2: Vivaha Muhurta date scan — universal + personal dosha evaluation.
 *
 * Self-contained: reads rules/marriage_rules.json (verified against Muhurta
 * Chintamani Ch.6, muhurtha-chinthamani.pdf pages 149-227). Does NOT read
 * activity_corpus.json or taxonomy.js. Engine.js is used read-only for
 * astronomy (computeDay + ascendant + planet positions).
 *
 * Browser + Node ESM.
 */
import { Engine } from "./engine.js";

/* Load rules/marriage_rules.json (browser fetch; caller may pass rules directly). */
export async function loadRules() {
  const res = await fetch("./rules/marriage_rules.json");
  if (!res.ok) throw new Error(`marriage_rules.json HTTP ${res.status}`);
  return res.json();
}

/* ============================================================================
   STAGE 1 — ASHTAKOOTA MATCHMAKING (pure; inputs are 1-based indices)
   groom/bride: { nakshatra:1-27, rashi:1-12, pada:1-4 }
   ============================================================================ */

function rashiLord(rules, rashi) { return rules.ashtakoota.kootas.maitri.rashiLords[String(rashi)]; }

function planetRelation(rules, p1, p2) {
  if (p1 === p2) return "same";
  const m = rules.ashtakoota.kootas.maitri.naturalFriendship[p1];
  if (m.friends.includes(p2)) return "friend";
  if (m.enemies.includes(p2)) return "enemy";
  return "neutral";
}
function maitriPoints(rules, a, b) {
  const rel = `${planetRelation(rules, a, b)}-${planetRelation(rules, b, a)}`;
  const both = (x) => rel === `${x}-${x}`;
  if (both("same") || (rel === "friend-friend")) return 5;
  if (rel === "friend-neutral" || rel === "neutral-friend") return 4;
  if (both("neutral")) return 3;
  if (rel === "friend-enemy" || rel === "enemy-friend") return 2;
  return 0;
}

function calcVarna(rules, g, b) {
  const gv = rules.ashtakoota.kootas.varna.rashiVarna[String(g.rashi)];
  const bv = rules.ashtakoota.kootas.varna.rashiVarna[String(b.rashi)];
  const score = gv >= bv ? 1 : 0;
  return { score, maxScore: 1, details: `Groom Varna ${rules.ashtakoota.kootas.varna.varnaNames[gv]} vs Bride ${rules.ashtakoota.kootas.varna.varnaNames[bv]}` };
}

function calcVashya(rules, g, b) {
  if (g.rashi === b.rashi) return { score: 2, maxScore: 2, details: "Identical Moon Signs" };
  const lg = rashiLord(rules, g.rashi), lb = rashiLord(rules, b.rashi);
  if (lg === lb) return { score: 2, maxScore: 2, details: `Same Rashi Lord (${lg})` };
  const rel = `${planetRelation(rules, lg, lb)}-${planetRelation(rules, lb, lg)}`;
  if (rel === "friend-friend") return { score: 1, maxScore: 2, details: `Friendly Rashi Lords (${lg} & ${lb})` };
  return { score: 0.5, maxScore: 2, details: `Vashya affinity (${lg} & ${lb})` };
}

function taraRemainder(fromStar, toStar) {
  // count inclusive from `fromStar` to `toStar`, fold on 9, return 1-based position
  const count = ((toStar - fromStar) % 27 + 27) % 27 + 1;
  return { position: ((count - 1) % 9) + 1, count };
}
function calcTara(rules, g, b) {
  const k = rules.ashtakoota.kootas.tara;
  const a = k.auspiciousRemainders;
  const r1 = taraRemainder(b.nakshatra, g.nakshatra); // bride -> groom
  const r2 = taraRemainder(g.nakshatra, b.nakshatra); // groom -> bride
  const gAusp = a.includes(r1.position % 9), bAusp = a.includes(r2.position % 9);
  let score = 0;
  if (gAusp && bAusp) score = 3;
  else if (gAusp || bAusp) score = 1.5;
  return { score, maxScore: 3, details: `Groom Tara #${r1.position} / Bride Tara #${r2.position}` };
}

function calcYoni(rules, g, b) {
  const yg = rules.ashtakoota.kootas.yoni.nakshatraYoni[String(g.nakshatra)];
  const yb = rules.ashtakoota.kootas.yoni.nakshatraYoni[String(b.nakshatra)];
  if (yg === yb) return { score: 4, maxScore: 4, details: `Same Yoni (${yg})` };
  const hostile = rules.ashtakoota.kootas.yoni.mahabairPairs.some(
    ([x, y]) => (x === yg && y === yb) || (x === yb && y === yg),
  );
  return hostile
    ? { score: 0, maxScore: 4, details: `Mahabair (extreme enmity): ${yg} vs ${yb}` }
    : { score: 2, maxScore: 4, details: `Yoni ${yg} vs ${yb} (neutral)` };
}

function calcGana(rules, g, b) {
  const gg = rules.ashtakoota.kootas.gana.nakshatraGana[String(g.nakshatra)];
  const bg = rules.ashtakoota.kootas.gana.nakshatraGana[String(b.nakshatra)];
  if (gg === bg) return { score: 6, maxScore: 6, details: `Identical Gana (${gg})` };
  if (gg === "DEVA" && bg === "MANUSHYA") return { score: 5, maxScore: 6, details: "Deva (Groom) & Manushya (Bride)" };
  if (gg === "MANUSHYA" && bg === "DEVA") return { score: 6, maxScore: 6, details: "Manushya (Groom) & Deva (Bride)" };
  if ((gg === "DEVA" && bg === "RAKSHASA") || (gg === "RAKSHASA" && bg === "DEVA")) return { score: 1, maxScore: 6, details: "Deva & Rakshasa combination" };
  return { score: 0, maxScore: 6, details: `${gg} (Groom) & ${bg} (Bride)` };
}

function calcMaitri(rules, g, b) {
  const lg = rashiLord(rules, g.rashi), lb = rashiLord(rules, b.rashi);
  const score = maitriPoints(rules, lg, lb);
  return { score, maxScore: 5, details: `Rashi Lords: ${lg} & ${lb}` };
}

/* Source-correct Bhakoota: steps = (bride - groom) mod 12.
   Dosha when the signs are 1 (2-12), 4 (5-9) or 5 (6-8) steps apart. */
function calcBhakoot(rules, g, b) {
  const steps = ((b.rashi - g.rashi) % 12 + 12) % 12;
  const bad = rules.ashtakoota.kootas.bhakoot.badStepDistances;
  if (!bad.includes(steps)) {
    return { score: 7, maxScore: 7, details: `Favorable Rashi distance (${steps})`, isCanceled: false };
  }
  const lg = rashiLord(rules, g.rashi), lb = rashiLord(rules, b.rashi);
  const rel = `${planetRelation(rules, lg, lb)}-${planetRelation(rules, lb, lg)}`;
  if (rel === "same-same" || rel === "friend-friend") {
    return {
      score: 7, maxScore: 7, details: `Bhakoot offset (${steps}) present, but CANCELED by Parihara.`,
      isCanceled: true,
      pariharaDetails: `Rashi Lords (${lg} & ${lb}) are identical or mutual friends (Muhurta Chintamani Ch.6 p.175).`,
    };
  }
  return { score: 0, maxScore: 7, details: `Active Bhakoot Dosha: ${steps} Rashi offset.`, isCanceled: false };
}

function calcNadi(rules, g, b) {
  const ng = rules.ashtakoota.kootas.nadi.nakshatraNadi[String(g.nakshatra)];
  const nb = rules.ashtakoota.kootas.nadi.nakshatraNadi[String(b.nakshatra)];
  if (ng !== nb) return { score: 8, maxScore: 8, details: `Different Nadis (Groom: ${ng}, Bride: ${nb})`, isCanceled: false };

  const sameRashi = g.rashi === b.rashi;
  const sameStar = g.nakshatra === b.nakshatra;
  // Source pariharas (Ch.6 p.179)
  if (sameRashi && !sameStar) {
    return { score: 8, maxScore: 8, details: "Same Nadi present, but CANCELED by Parihara.", isCanceled: true,
      pariharaDetails: "Rashi Abheda: Same Moon Sign, different Nakshatras (Muhurta Chintamani Ch.6 p.179)." };
  }
  if (sameStar && !sameRashi) {
    return { score: 8, maxScore: 8, details: "Same Nadi present, but CANCELED by Parihara.", isCanceled: true,
      pariharaDetails: "Nakshatra Abheda: Same Nakshatra spanning Rashi boundary; also removes Gana dosha (Ch.6 p.179)." };
  }
  if (sameStar && g.pada !== b.pada) {
    return { score: 8, maxScore: 8, details: "Same Nadi present, but CANCELED by Parihara.", isCanceled: true,
      pariharaDetails: `Pada Bheda: Same Nakshatra, different quarters (Groom P${g.pada} vs Bride P${b.pada}) (Ch.6 p.179).` };
  }
  return { score: 0, maxScore: 8, details: `Active Nadi Dosha: both share Nadi ${ng}.`, isCanceled: false };
}

export function calculateAshtakoota(groom, bride, rules) {
  const k = rules.ashtakoota;
  const varna = calcVarna(rules, groom, bride);
  const vashya = calcVashya(rules, groom, bride);
  const tara = calcTara(rules, groom, bride);
  const yoni = calcYoni(rules, groom, bride);
  const maitri = calcMaitri(rules, groom, bride);
  const gana = calcGana(rules, groom, bride);
  const bhakoot = calcBhakoot(rules, groom, bride);
  const nadi = calcNadi(rules, groom, bride);
  const totalScore = varna.score + vashya.score + tara.score + yoni.score + maitri.score + gana.score + bhakoot.score + nadi.score;

  const hasNadiDosha = nadi.score === 0;
  const hasBhakootDosha = bhakoot.score === 0;
  const isCompatible = totalScore >= k.eligibility.minScore && !hasNadiDosha && !hasBhakootDosha;

  const tier = isCompatible
    ? (k.thresholdTiers.find((t) => totalScore >= t.min && totalScore <= t.max) || k.thresholdTiers[k.thresholdTiers.length - 1])
    : null;

  const appliedPariharas = [];
  if (nadi.isCanceled) appliedPariharas.push({ dosha: "NADI_DOSHA", code: "NADI_PARIHARA", details: nadi.pariharaDetails });
  if (bhakoot.isCanceled) appliedPariharas.push({ dosha: "BHAKOOT_DOSHA", code: "BHAKOOT_PARIHARA", details: bhakoot.pariharaDetails });

  return {
    totalScore, maxScore: k.maxScore,
    isCompatible, tierLabel: tier ? tier.label : null,
    scorePercentage: Number(((totalScore / k.maxScore) * 100).toFixed(2)),
    hasNadiDosha, isNadiCanceled: nadi.isCanceled,
    hasBhakootDosha, isBhakootCanceled: bhakoot.isCanceled,
    breakdown: { varna, vashya, tara, yoni, maitri, gana, bhakoot, nadi },
    appliedPariharas,
    provenance: {
      source: "Muhurta Chintamani - Vivaha Prakarana (Chapter 6)",
      verseKeys: ["VIVAHA_MELAPAKA_36_GUNA", "VIVAHA_THRESHOLD_18"],
      summary: isCompatible
        ? `Compatible Match (${totalScore}/36 Gunas). All major doshas cleared or neutralized by Parihara.`
        : `Incompatible Match (${totalScore}/36 Gunas). ${hasNadiDosha ? "Uncanceled Nadi Dosha active. " : ""}${hasBhakootDosha ? "Uncanceled Bhakoot Dosha active." : ""}`,
    },
  };
}

/* ============================================================================
   STAGE 2 — VIVAHA MUHURTA DOSHAS (evaluates one day snapshot)
   day: object with { iso, y, m, d, vara, tithiIndex, moonNakshatra, moonRashi,
     yoga, sankranti, combustion:{guru,shukra}, bhadra:{loka} }
     plus marriage extras: { lagnaRashi, sunNakshatra, planets:{...} }.
   ============================================================================ */

const YOGA_IDX = { // 0-based nitya yoga indices used by the rules
  Harshana: 13, Vaidhriti: 26, Sadhya: 21, Vyatipata: 16, Ganda: 9, Shoola: 8,
  Vyaghata: 12, Vishkambha: 0, Vajra: 14, Parigha: 18, Atiganda: 5,
};

function pataYogas(rules) {
  return (rules.vivahaDoshas.implemented.pata.pataYogaIndices || []);
}
function ekargalaYogas(rules) {
  return (rules.vivahaDoshas.implemented.ekargala.badYogaIndices || []);
}

export function evaluateVivahaDoshas(day, couple, rules) {
  const active = [];
  const removals = [];
  const g = couple.groom, b = couple.bride;
  const marrStar = day.moonNakshatra; // 0-based marriage nakshatra of the day
  const m = rules.vivahaDoshas.implemented;

  // --- LATTA DOSHA ---
  const kicks = m.latta.kickOffsets; // { Sun:12, Saturn:8, Jupiter:6, Mars:3, Moon:5, Mercury:20, Venus:22, Rahu:9, Ketu:9 }
  const kickers = [];
  for (const [planet, off] of Object.entries(kicks)) {
    if (!day.planets[planet]) continue;
    const kicked = ((day.planets[planet].nakshatra + off) % 27);
    if (kicked === marrStar) kickers.push(planet);
  }
  if (kickers.length) {
    active.push({ code: "LATTA_DOSHA", name: "Latta Dosha", severity: "CRITICAL_BLOCK",
      details: `Planetary kick on Marriage Nakshatra by: ${kickers.join(", ")} (Ch.6 p.199).` });
  }

  // --- JAMITRA DOSHA ---
  const seventhLagna = (day.lagnaRashi + 6) % 12;
  const seventhMoon = (day.moonRashi + 6) % 12;
  const jamitraPlanets = Object.entries(day.planets || {})
    .filter(([, p]) => p.rashi === seventhLagna || p.rashi === seventhMoon)
    .map(([n]) => n);
  if (jamitraPlanets.length) {
    // Removals: (a) planet is a natural benefic (Sheeghrabodha), (b) Moon exalted/own, (c) Sun in 3/6/11 from lagna
    const benefics = ["Moon", "Mercury", "Jupiter", "Venus"];
    const allBenefic = jamitraPlanets.every((n) => benefics.includes(n));
    const moonRashi = day.moonRashi;
    const moonExaltOwn = moonRashi === 1 || moonRashi === 3; // Taurus(exalted) / Cancer(own)
    const sunRashi = day.planets.Sun ? day.planets.Sun.rashi : -1;
    const sunHouses = [3, 6, 11];
    const sun3_6_11 = sunHouses.some((h) => ((sunRashi - day.lagnaRashi + 12) % 12) + 1 === h);
    const removed = allBenefic || moonExaltOwn || sun3_6_11;
    if (removed) {
      removals.push({ code: "JAMITRA_DOSHA", details: `Jamitra canceled: ${allBenefic ? "7th-sign planets are benefics" : moonExaltOwn ? "Moon exalted/own-sign" : "Sun in 3/6/11 from lagna"} (Ch.6 p.205).` });
    } else {
      active.push({ code: "JAMITRA_DOSHA", name: "Jamitra Dosha", severity: "CRITICAL_BLOCK",
        details: `Planet(s) in 7th sign from Lagna/Moon: ${jamitraPlanets.join(", ")} (Ch.6 p.204).` });
    }
  }

  // --- PATA DOSHA ---
  if (pataYogas(rules).includes(day.yoga.index)) {
    active.push({ code: "PATA_DOSHA", name: "Paata Dosha", severity: "CRITICAL_BLOCK",
      details: `Nakshatra at the end of severe Nitya Yoga ${day.yoga.name} (Ch.6 p.200).` });
  }

  // --- EKARGALA (KHAIJOOR) DOSHA ---
  const badYogaDay = ekargalaYogas(rules).includes(day.yoga.index);
  if (badYogaDay) {
    const sunStar = day.sunNakshatra;
    const moonStar = day.moonNakshatra;
    const count = ((moonStar - sunStar) % 27 + 27) % 27 + 1; // inclusive 1-based from Sun's star
    if (count % 2 === 1) {
      active.push({ code: "EKARGALA_DOSHA", name: "Ekargala (Khaijoor) Dosha", severity: "CRITICAL_BLOCK",
        details: `Moon in ${count}th (odd) nakshatra from Sun's star during ${day.yoga.name} yoga (Ch.6 p.202).` });
    }
  }

  // --- REMOVAL RULE: strong Sun + Moon in the muhurta Lagna ---
  const rr = rules.vivahaDoshas.removalRule;
  if (rr && rr.isImplemented && day.planets.Sun && day.planets.Moon) {
    const sunInLagna = day.planets.Sun.rashi === day.lagnaRashi;
    const moonInLagna = day.planets.Moon.rashi === day.lagnaRashi;
    if (sunInLagna && moonInLagna && active.length) {
      const codes = active.map((a) => a.code).join(", ");
      removals.push({ code: "DOSHA_REMOVAL_SUN_MOON_LAGNA",
        details: `Sun + Moon strong in Lagna destroy: ${codes} (Muhurta Chintamani Ch.6 p.206).` });
      active.length = 0;
    }
  }

  const isMarriageBlocked = active.some((a) => a.severity === "CRITICAL_BLOCK");
  return { isMarriageBlocked, activeDoshas: active, appliedRemovals: removals };
}

/* ============================================================================
   STAGE 2 — DAY FILTERS (panchanga + personal) 
   ============================================================================ */

function tithiGroupOf(tithiIndex) {
  const tn = tithiIndex + 1;              // 1-based tithi number (1..30)
  if (tn === 30) return "AMAVASYA";
  const cycle = ((tn - 1) % 15) + 1;      // 1..15 within the paksha
  const map = { 1: "NANDA", 2: "BHADRA", 3: "JAYA", 4: "RIKTA", 0: "PURNA" };
  return map[cycle % 5];
}

/* Personal filters: reject if either partner has Naidhana (7th) Tara or Ashtama (8th-house) Chandra. */
export function personalFilters(day, couple) {
  const issues = [];
  for (const [who, p] of Object.entries(couple)) {
    const count = ((day.moonNakshatra - (p.nakshatra - 1)) % 27 + 27) % 27 + 1;
    const taraNum = ((count - 1) % 9) + 1;
    if (taraNum === 7) issues.push({ partner: who, type: "NAIDHANA_TARA", detail: `${who} has Naidhana (7th) Tara` });
    const chandraSteps = ((day.moonRashi - (p.rashi - 1)) % 12 + 12) % 12;
    if (chandraSteps === 7) issues.push({ partner: who, type: "ASHTAMA_CHANDRA", detail: `${who} has Ashtama Chandra (Moon in 8th rashi from birth)` });
  }
  return issues;
}

/* Universal hard blockers carried over from the corpus day scan (day object). */
function universalBlockers(day) {
  const blocks = [];
  if (day.bhadra && day.bhadra.loka === "mrityu") blocks.push("BHADRA_EARTH_ACTIVE: Bhadra in Mrityu Loka");
  if (day.sankranti) blocks.push("SANKRANTI_DAY_ACTIVE: Sankranti day");
  if (day.combustion && day.combustion.guru) blocks.push("ASTA_GURU_ACTIVE: Jupiter combust");
  if (day.combustion && day.combustion.shukra) blocks.push("ASTA_SHUKRA_ACTIVE: Venus combust");
  return blocks;
}

/* Evaluate one day for the couple. Returns a scored slot (SHUBH / MADHYAMA / REJECTED). */
export function scoreWeddingDay(day, couple, matchResult, rules) {
  const d = rules.dayFilters;
  const nakshatraOk = d.allowedNakshatraIndices.includes(day.moonNakshatra + 1);
  const tithiOk = !d.forbiddenTithiGroups.includes(tithiGroupOf(day.tithiIndex));
  const varaOk = d.allowedVaraIndices.includes(day.vara);

  const blockers = [];
  if (!nakshatraOk) blockers.push(`Nakshatra ${day.moonNakshatra + 1} not in marriage list`);
  if (!tithiOk) blockers.push(`Tithi group ${tithiGroupOf(day.tithiIndex)} forbidden`);
  if (!varaOk) blockers.push(`Vara ${day.vara} not an auspicious marriage day`);
  blockers.push(...universalBlockers(day));

  const doshas = evaluateVivahaDoshas(day, couple, rules);
  if (doshas.isMarriageBlocked) blockers.push(...doshas.activeDoshas.map((a) => `${a.code}: ${a.details}`));
  if (blockers.length) {
    return { iso: day.iso, status: "REJECTED", score: 0, stage: "HARD_BLOCK", blockers, doshas, removals: doshas.appliedRemovals };
  }

  const personal = personalFilters(day, couple);
  if (personal.length) {
    return { iso: day.iso, status: "REJECTED", score: 0, stage: "PERSONAL_BLOCK", blockers: personal.map((p) => p.detail), personal, doshas, removals: doshas.appliedRemovals };
  }

  const sc = rules.scoring;
  let score = sc.baseValidSlot;
  score += (matchResult.totalScore / matchResult.maxScore) * sc.matchmakingBonusScale;
  const shubh = score >= sc.shubhThreshold;
  return {
    iso: day.iso, status: shubh ? "SHUBH" : "MADHYAMA", score: Math.min(100, Math.round(score)),
    stage: "PASSED", nakshatra: day.moonNakshatra, moonRashi: day.moonRashi, lagnaRashi: day.lagnaRashi,
    doshas, removals: doshas.appliedRemovals, strengths: shubh ? ["No Vivaha hard blockers", "No personal Tara/Chandra affliction"] : [],
  };
}

/* ============================================================================
   SCAN ORCHESTRATOR — walks a calendar window, builds day snapshots via Engine,
   returns ranked shubh dates (STAGE 2 runs only after Stage 1 passes).
   ============================================================================ */

function dayExtras(engine, day) {
  const t = day.rise || day.jdNoon;
  const lagnaRashi = engine.ascendant(t, day.geo);
  const sunNakshatra = engine.sunNakshatra(t);
  const planets = engine.planetPositions(t);
  return { lagnaRashi, sunNakshatra, planets };
}

export async function scanWeddingWindow({ couple, startISO, endISO, geo, onProgress }, engine, rules) {
  const matchResult = calculateAshtakoota(couple.groom, couple.bride, rules);
  if (!matchResult.isCompatible) {
    return { matchResult, shubh: [], madhyama: [], rejected: 0, total: 0, skippedStage2: true };
  }
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const results = [];
  const dStart = new Date(sy, sm - 1, sd);
  const dEnd = new Date(ey, em - 1, ed);
  let cursor = new Date(dStart);
  let processed = 0;
  while (cursor <= dEnd) {
    const y = cursor.getFullYear(), m = cursor.getMonth() + 1, d = cursor.getDate();
    const day = engine.computeDay(y, m, d, geo, null, 5.5);
    day.geo = geo;
    Object.assign(day, dayExtras(engine, day));
    const verdict = scoreWeddingDay(day, couple, matchResult, rules);
    results.push(verdict);
    processed++;
    if (onProgress) onProgress(processed, day.iso);
    cursor.setDate(cursor.getDate() + 1);
  }
  const shubh = results.filter((r) => r.status === "SHUBH").sort((a, b) => b.score - a.score);
  const madhyama = results.filter((r) => r.status === "MADHYAMA");
  const rejected = results.length - shubh.length - madhyama.length;
  return { matchResult, shubh, madhyama, rejected, total: results.length };
}