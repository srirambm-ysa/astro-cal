import { RASHI, NAKSHATRA, TARA_NAMES, TARA_NATURE, TITHI_NAMES, KARANA_NAMES, NAKSHATRA_GROUP } from "./engine.js";
const DOW=["Su","Mo","Tu","We","Th","Fr","Sa"];
const SELECTION_MODES = {
  full: { label: "Full muhurta", desc: "Strict universal window (impersonal, score ≥ 80)" },
  soft: { label: "Soft", desc: "Relaxed universal window (impersonal, score ≥ 60)" },
  personal: { label: "Personal days", desc: "Compatibility layer on a Full slot — Tara + Chandra Bala" },
};

/* ===== PHASE-2 MUHURTA SCORING ENGINE (PRD §2.6 v1.0) ===== */

// Scoring weights — T1 hard blockers reject; T2 primary; T3 secondary.
const SCORE_W = {
  BASE: 60,
  T1_HARD: -100,   // → reject (0)
  T1_SOFT: -35,    // overridden T1 → heavy penalty
  T2_HIT: -20,     // primary misalignment
  T2_PASS: 12,     // primary alignment
  T3_HIT: -6,      // secondary misalignment
  T3_PASS: 4,      // secondary preference
};

// Shubh score cutoffs per selection mode (PRD §2.6.7 + what-is-personal-mode.md, superseding).
// A single universal base score is computed for every mode (INV-03); Full/Soft carry
// ZERO personal weight (tara/chandra never touch the impersonal score). Mode thresholds
// (doc): FULL ≥ 80 (MADHYAMA 65-79), SOFT ≥ 60, Personal final ≥ 75. Personal must first
// qualify at the FULL level (Option A) => Personal ⊆ Full ⊆ Soft (INV-01).
const FULL_SHUBH = 80;
const FULL_MADHYAMA = 65;
const SOFT_SHUBH = 60;
const PERSONAL_SHUBH = 75;

// Chandra Bala (Lunar transit strength vs birth rashi) — what-is-personal-mode.md.
// Favorable houses {1,3,6,7,10,11} +15; unfavorable {4,12} −10; 8th = Ashtama Chandra
// (severe personal hard blocker → reject). House is counted from birth rashi inclusive.
const CHANDRA_FAVOURABLE = [1, 3, 6, 7, 10, 11];
const CHANDRA_UNFAVOURABLE = [4, 12];
function chandraBala(birthRashi, moonRashi) {
  const house = (((moonRashi - birthRashi) % 12) + 12) % 12 + 1;
  let bonus = 0;
  if (CHANDRA_FAVOURABLE.includes(house)) bonus = 15;
  else if (CHANDRA_UNFAVOURABLE.includes(house)) bonus = -10;
  return { house, bonus, isAshtamaChandra: house === 8 };
}

// Tara Bala bonus (personal layer only, per what-is-personal-mode.md): auspicious tara
// (2nd,4th,6th,8th,9th) +15; bad tara (3rd,5th,7th) reject outright (see scoreMuhurta).
function taraBonus(taraNature) { return taraNature === "good" ? 15 : 0; }

// Verdict buckets (PRD §2.6.2).
function scoreToVerdict(score) {
  if (score <= 0) return "REJECTED";
  if (score < 35) return "UNFAVORABLE";
  if (score < 55) return "NEUTRAL";
  if (score < 70) return "ACCEPTABLE";
  if (score < 85) return "GOOD";
  return "EXCELLENT";
}

// Map score verdict → UI chip.
function verdictToChip(v) {
  return (v === "EXCELLENT" || v === "GOOD") ? "Shubh"
    : (v === "ACCEPTABLE" || v === "NEUTRAL") ? "Neutral"
    : "Ashubh";
}

/* Override evaluator registry (PRD §2.6.4 evaluator-registry contract).
   Each token maps to a deterministic predicate over the evaluation context.
   Tokens without a registry entry are inert (validated at corpus load). */
const OVERRIDE_EVALUATORS = {
  SARVARTTHA_SIDDHI: (ctx) => {
    // var↔nakshatra sidereal combos — classical_rule_architecture_mc.md §2
    const combos = {
      0: [12, 18, 11, 20, 25, 7, 0],
      1: [21, 3, 4, 7, 16],
      2: [0, 25, 2, 8],
      3: [3, 16, 12, 2, 4],
      4: [26, 16, 0, 6, 7],
      5: [26, 16, 0, 6, 21],
      6: [21, 3, 14],
    };
    return (combos[ctx.vara] || []).includes(ctx.nakshatra);
  },
  SIDDHA_YOGA: (ctx) => {
    // tithi group ↔ vara: Nanda/Fri, Bhadra/Wed, Jaya/Tue, Rikta/Sat, Poorna/Thu
    const g = Math.floor((ctx.tithiIndex % 15) / 3); // 0..4
    const combos = { 0: [5], 1: [3], 2: [2], 3: [6], 4: [4] };
    return (combos[g] || []).includes(ctx.vara);
  },
  ABHIJIT_WINDOW: (ctx) => ctx.isInsideAbhijit === true,
  BHADRA_TAIL: (ctx) => ctx.bhadraTail === true,
  BENEFIC_RESCUE: (ctx) => ctx.beneficsInAngles === true,
};

/* Corpus hard-blocker tokens → day-level evaluator predicates.
   These run in the T1 phase (early-exit) BEFORE any override/bonus — a matching
   hard blocker returns REJECTED regardless of Sarvartha/Abhijit/Amrita overrides. */
const HARD_BLOCKER_EVALUATORS = {
  ASTA_GURU: (day) => !!(day.combustion && day.combustion.guru),
  ASTA_SHUKRA: (day) => !!(day.combustion && day.combustion.shukra),
  TUESDAY: (day) => day.vara === 2,
  SANKRANTI: (day) => day.sankranti === true,
  VYATIPATA: (day) => day.yoga.index === 16,
  VAIDHRITI: (day) => day.yoga.index === 26,
};
const HARD_BLOCKER_LABEL = {
  ASTA_GURU: "Jupiter combust (Asta Guru)",
  ASTA_SHUKRA: "Venus combust (Asta Shukra)",
  TUESDAY: "Tuesday (Bhauma Vara) hard-blocked",
  SANKRANTI: "Sankranti day hard-blocked",
  VYATIPATA: "Vyatipata Yoga active",
  VAIDHRITI: "Vaidhriti Yoga active",
};

/* Engine token -> provenance_registry.json verse key (for fired-verse tracing). */
const HARD_BLOCKER_TO_VERSE = {
  ASTA_GURU: "ASTA_GURU_ACTIVE",
  ASTA_SHUKRA: "ASTA_SHUKRA_ACTIVE",
  TUESDAY: "TUESDAY_ACTIVE",
  SANKRANTI: "SANKRANTI_DAY_ACTIVE",
  VYATIPATA: "VYATIPATA_YOGA_ACTIVE",
  VAIDHRITI: "VAIDHRITI_YOGA_ACTIVE",
  BHADRA_MRITYU: "BHADRA_EARTH_ACTIVE",
};
const OVERRIDE_TO_VERSE = {
  SARVARTTHA_SIDDHI: "SARVARTHA_SIDDHI_YOGA",
  ABHIJIT_WINDOW: "ABHIJIT_MUHURTA",
};

/* Build the evaluation context for override evaluators + scoring.
   Stubs beneficsInAngles (needs full chart) — returns false for v1. */
function buildMuhurtaContext(day, janmaNakshatra, act, swe) {
  const tara = day.tara;
  const bhadra = day.bhadra; // set by computeDay
  return {
    vara: day.vara,
    nakshatra: day.moonNakshatra,
    tithiIndex: day.tithiIndex,
    yogaIndex: day.yoga.index,
    karanaIndex: day.karana.index,
    isInsideAbhijit: day.isInsideAbhijit || false,
    bhadraTail: bhadra ? bhadra.inPuchha : false,
    beneficsInAngles: false, // v1 stub — requires full chart computation
    taraNumber: tara ? tara.number : null,
  };
}

/* Override-target spec: which hits an override may downgrade.
   Per debugging-tips §1/§2 overrides can only soften T2/T3 scoring hits —
   they can NEVER downgrade a T1 hard blocker. ABHIJIT is scoped to weak
   Vara only (daily temporal affliction), not nakshatra/tithi/yoga/combustion. */
const OVERRIDE_TARGETS = {
  ABHIJIT_WINDOW: { tiers: ["t3"], match: (h) => h.startsWith("Vara") },
  BHADRA_TAIL: { tiers: ["t3"], match: (h) => h.startsWith("Bhadra") },
  SARVARTTHA_SIDDHI: { tiers: ["t2", "t3"] },
  SIDDHA_YOGA: { tiers: ["t2", "t3"] },
  BENEFIC_RESCUE: { tiers: ["t2", "t3"] },
};

/* Apply overrides: each matched override downgrades one eligible hit by one
   tier (T2→T3, T3→cleared). T1 hard blockers are never eligible — the hard
   blockers phase already short-circuited to REJECTED before this runs. */
function applyOverrides(hits, ctx, overrideTokens) {
  const matched = [];
  for (const token of overrideTokens || []) {
    const fn = OVERRIDE_EVALUATORS[token];
    if (!fn || !fn(ctx)) continue;
    const target = OVERRIDE_TARGETS[token] || { tiers: ["t3"] };
    matched.push(token);
    // find the worst eligible hit across target tiers (t2 preferred)
    let done = false;
    for (const tier of target.tiers) {
      if (done) break;
      const bucket = hits[tier];
      for (let i = 0; i < bucket.length; i++) {
        const hit = bucket[i];
        if (target.match && !target.match(hit)) continue;
        if (tier === "t2") { hits.t3.push(bucket.splice(i, 1)[0]); }
        else { bucket.splice(i, 1); }
        done = true;
        break;
      }
    }
  }
  return matched;
}

/* Chapter key -> display name (provenance_registry.json `chapters`). */
function chapterDisplay(ch, fallback = null) {
  const map = {
    ch1: "Chapter 1 (Subhashubha Prakarana)",
    ch2: "Chapter 2 (Nakshatra Prakarana)",
    ch4: "Chapter 4 (Gochara Prakarana)",
    ch6: "Chapter 6 (Griha Prakarana)",
    ch8: "Chapter 8 (Yatra Prakarana)",
    ch10: "Chapter 10 (Rajyabhisheka Prakarana)",
    ch11: "Chapter 11 (Rina / Vyapara Prakarana)",
    ch13: "Chapter 13 (Misra / Chikitsha Prakarana)",
    ch_samskara: "Samskara Prakarana",
    panchanga: "Panchanga tables",
  };
  return map[ch] || fallback || ch;
}

/* Core scoring function — PRD §2.6.1/2.6.2.
   mode: "full" | "soft" | "personal" (§2.6.7).
   calendarField: { adhikMaas, kharmas, pitruPaksha } precomputed per day.
   Returns { score, verdict, chip, reasons, tierHits, overrides, timeBounded, ctx }. */
function scoreMuhurta(day, janmaNakshatra, act, opts = {}) {
  const mode = opts.mode || "full";
  const cf = opts.calendarField || {};
  const hits = { t1: [], t2: [], t3: [] };
  const ctx = buildMuhurtaContext(day, janmaNakshatra, act, opts._swe);
  const firedVerses = new Set();

  // --- Hard-blocker phase (T1 early-exit, debugging-tips §1/§2) ---
  // Corpus hard blockers run FIRST, before any scoring/override, so Abhijit/
  // Sarvartha/Siddha can never rescue a hard-blocked day. Soft mode keeps the
  // T1 but penalises instead of zeroing (handled by hasHardT1 below).
  for (const token of act.hardBlockers || []) {
    const fn = HARD_BLOCKER_EVALUATORS[token];
    if (fn && fn(day)) {
      hits.t1.push(HARD_BLOCKER_LABEL[token] || token);
      if (HARD_BLOCKER_TO_VERSE[token]) firedVerses.add(HARD_BLOCKER_TO_VERSE[token]);
    }
  }

  // --- Calendar-field pushdown (T1) ---
  if (cf.adhikMaas) hits.t1.push("Adhik Maas");
  if (cf.kharmas) hits.t1.push("Kharmas");
  if (cf.pitruPaksha) hits.t1.push("Pitru Paksha");
  if (cf.eclipse) hits.t1.push("Eclipse hours");

  // --- Bhadra matrix (T1/T2/T3) ---
  // Bhadra in Mrityu Loka is a strict T1 block unless the day falls in its
  // Puchha (tail) — classical_rule_architecture_mc.md §5 + debugging-tips §1.
  if (day.bhadra) {
    const b = day.bhadra;
    if (b.loka === "mrityu" && !b.inPuchha) {
      hits.t1.push("Bhadra · Mrityu Loka");
      firedVerses.add("BHADRA_EARTH_ACTIVE");
    } else if (b.inPuchha) hits.t3.push("Bhadra Puchha (usable)");
    else hits.t3.push("Bhadra · harmless Loka");
  }

  // --- Nitya Yoga partial ghati ban ---
  if (day.yogaBan && day.yogaBan.banned) {
    if (day.yogaBan.fullBan) hits.t1.push(day.yogaBan.reason);
    else hits.t2.push(day.yogaBan.reason);
  }

  // --- Personal: tara (T2, informational only — NOT part of the impersonal base) ---
  // what-is-personal-mode.md: Full/Soft carry 0% personal weight. Tara participates in
  // the score only inside the Personal layer (bonus/reject) below.
  const taraNature = day.tara ? TARA_NATURE[day.tara.number - 1] : "neutral";

  // --- Impersonal panchanga fit ---
  const nakOK = !act.nakshatras.length || act.nakshatras.includes(day.moonNakshatra);
  const varaOK = !act.vara || act.vara.includes(day.vara);
  const tithiBaseOK = !act.badTithis.includes(day.tithiIndex);
  const krishnaAllowed = opts.allowKrishnaFallback && day.tithi.paksha === "Krishna";
  const pakshaOK = act.paksha === "both" || day.tithi.paksha === "Shukla" || krishnaAllowed;
  const tithiOK = tithiBaseOK && pakshaOK;
  const karanaOK = !act.badKaranas.includes(day.karana.index);

  if (!nakOK) hits.t2.push(`${NAKSHATRA[day.moonNakshatra]} ✗`);
  else hits.t2.push(`${NAKSHATRA[day.moonNakshatra]} ✓`);
  if (!varaOK) hits.t3.push(`Vara ${DOW[day.vara]}`);
  else hits.t3.push(`Vara ${DOW[day.vara]} ✓`);
  if (!tithiOK) hits.t2.push(`${day.tithi.paksha} ${TITHI_NAMES[day.tithiIndex]} ✗`);
  else hits.t2.push(`${day.tithi.paksha} ${TITHI_NAMES[day.tithiIndex]} ✓`);
  if (!karanaOK) hits.t2.push(`Karana ${KARANA_NAMES[day.karana.index]} ✗`);
  else hits.t3.push(`Karana ${KARANA_NAMES[day.karana.index]} ✓`);

  // --- Apply overrides (downgrade worst hits) ---
  const overrides = applyOverrides(hits, ctx, act.overrides);
  for (const token of overrides) {
    if (OVERRIDE_TO_VERSE[token]) firedVerses.add(OVERRIDE_TO_VERSE[token]);
  }

  // --- Universal base score (INV-03): identical for every mode ---
  // A single raw PANCHANGA-FIT score (impersonal; tara/chandra excluded per the
  // superseding what-is-personal-mode.md) is computed from all tiers regardless
  // of mode. Only the Shubh threshold varies, and Personal adds its compatibility
  // layer on top. This guarantees the subset hierarchy Personal ⊆ Full ⊆ Soft.
  let score = SCORE_W.BASE;
  score += hits.t1.length * SCORE_W.T1_SOFT;   // heavy penalty per hard blocker
  score += hits.t2.filter(h => h.includes("✓")).length * SCORE_W.T2_PASS;
  score += hits.t2.filter(h => !h.includes("✓")).length * SCORE_W.T2_HIT;
  score += hits.t3.filter(h => h.includes("✓")).length * SCORE_W.T3_PASS;
  score += hits.t3.filter(h => !h.includes("✓")).length * SCORE_W.T3_HIT;

  // Universal hard blockers (T1) reject in EVERY mode (INV-02) — Abhijit /
  // Sarvartha / Amrita overrides can never rescue a hard-blocked day.
  const hasHardT1 = hits.t1.length > 0;
  if (hasHardT1) score = 0;

  score = Math.max(0, Math.min(100, Math.round(score)));

  // --- Reasons line (accumulated across tiers + mode-specific personal reasons) ---
  const reasons = [
    ...hits.t1.map(h => `${h} [T1]`),
    ...hits.t2.filter(h => !h.includes("✓")),
    ...hits.t3.filter(h => !h.includes("✓")),
  ];

  // --- Mode Shubh classification (what-is-personal-mode.md thresholds) ---
  // Full ≥ 80 (MADHYAMA 65-79) · Soft ≥ 60 => Soft ⊇ Full.
  // Personal (Option A) must FIRST qualify as a valid Full slot (score ≥ 80),
  // then applies the Tara + Chandra Bala compatibility layer: bad tara
  // (Vipat/Pratyari/Vadha = 3rd/5th/7th) or Ashtama Chandra (8th house Moon)
  // rejects even a Full-qualified day; final = base + tara bonus (+15 good) +
  // chandra bonus (+15 favourable / −10 unfavourable), Shubh ≥ 75 (PRS-01..03).
  let verdict, chip;
  let personalMetrics = null;
  if (hasHardT1) {
    verdict = "REJECTED"; chip = "Ashubh";
  } else if (mode === "soft") {
    verdict = scoreToVerdict(score);
    chip = score >= SOFT_SHUBH ? "Shubh" : verdictToChip(verdict);
  } else if (mode === "personal") {
    if (!day.tara || opts.birthRashi == null) {
      verdict = "REJECTED"; chip = "Ashubh";
      reasons.push("PERSONAL: birth star + birth rashi required");
    } else if (score < FULL_SHUBH) {
      // Option A: must first qualify at the FULL level (Personal ⊆ Full). Scores
      // below 80 can never be Shubh in personal (70-79 would otherwise leak via
      // verdictToChip's GOOD→Shubh mapping).
      verdict = scoreToVerdict(score);
      chip = score >= FULL_MADHYAMA ? "Neutral" : "Ashubh";
      reasons.push("Fails Full (≥ 80) universal qualification — Personal requires a Full slot");
    } else if (taraNature === "bad") {
      verdict = "REJECTED"; chip = "Ashubh"; // PRS-01 Vipat/Pratyari/Vadha (3rd/5th/7th tara)
      reasons.push(`Personal blocker: ${TARA_NAMES[day.tara.number - 1]} (${day.tara.number}th) tara — incompatible`);
    } else {
      const ch = chandraBala(opts.birthRashi, day.moonRashi);
      if (ch.isAshtamaChandra) {
        verdict = "REJECTED"; chip = "Ashubh"; // PRS-02 Ashtama Chandra (Moon 8th from birth rashi)
        reasons.push("Personal blocker: Ashtama Chandra — Moon in 8th house from birth rashi");
      } else {
        const tBonus = taraBonus(taraNature);
        const finalScore = Math.max(0, Math.min(100, Math.round(score + tBonus + ch.bonus)));
        verdict = scoreToVerdict(finalScore);
        chip = finalScore >= PERSONAL_SHUBH ? "Shubh" : "Neutral"; // < 75 → MADHYAMA
        reasons.push(`Tara ${TARA_NAMES[day.tara.number - 1]} ${tBonus ? "+" + tBonus : "±0"} · Chandra house ${ch.house} ${ch.bonus ? (ch.bonus > 0 ? "+" + ch.bonus : ch.bonus) : "±0"}`);
        personalMetrics = { taraName: TARA_NAMES[day.tara.number - 1], taraNumber: day.tara.number, taraNature, taraScoreBonus: tBonus, chandraHouse: ch.house, chandraScoreBonus: ch.bonus, isAshtamaChandra: false };
      }
    }
  } else { // full
    // Strict: ≥ 80 Shubh, 65-79 MADHYAMA (Neutral), < 65 Ashubh — do NOT use
    // verdictToChip (GOOD 70-84 would leak "Shubh" past the 80 threshold).
    verdict = scoreToVerdict(score);
    chip = score >= FULL_SHUBH ? "Shubh" : score >= FULL_MADHYAMA ? "Neutral" : "Ashubh";
  }

  // --- Time-bounded window (§2.7) ---
  const timeBounded = day.starEnd ? { validTill: day.starEnd.ist, nextStar: day.starEnd.endNakshatraName } : null;

  if (overrides.length) reasons.push(`Override: ${overrides.join(", ")}`);
  if (timeBounded) reasons.push(`Valid till ${timeBounded.validTill} → ${timeBounded.nextStar}`);

  // --- Classical provenance for the rules that FIRED on this day ---
  // Only confirmed classical verses (registry proof==="confirmed") are cited;
  // functional/formula bases carry no fabricated sloka. Resolved per hit.
  const classical = act.classical || null;
  const provenance = [];
  if (classical && firedVerses.size) {
    for (const v of classical.verses || []) {
      if (!firedVerses.has(v.key)) continue;
      provenance.push({
        primary_source: classical.source,
        author: classical.author,
        chapter: chapterDisplay(v.chapter, classical.chapter),
        verse_number: v.verse,
        sanskrit_sloka: v.sanskrit_sloka || null,
        english_translation: v.english_translation || null,
        applied_rule_logic: v.applied_rule_logic || null,
      });
    }
  }

  return {
    score, verdict, chip,
    reasons, tierHits: hits, overrides, timeBounded, ctx,
    provenance,
    personalMetrics, // null unless mode === "personal" with a Full-qualified, unblocked slot
    // legacy compat
    nakOK, varaOK, tithiOK, karanaOK,
    impersonalPass: nakOK && varaOK && tithiBaseOK && karanaOK,
    krishnaAllowed,
  };
}

/* Legacy wrapper — keeps old call sites working while UI migrates to scoreMuhurta. */
function muhurtaVerdict(day, janmaNakshatra, act, opts = {}) {
  return scoreMuhurta(day, janmaNakshatra, act, opts);
}

const REJ_LABEL = {
  bhadra: "Bhadra — the Vishti karana with the Moon in a harmful sign (Karka/Simha/Tula/Meena)",
  nakshatra: "the Moon was in a nakshatra not ideal for this activity",
  tithi: "an inauspicious tithi (Rikta, Dwitiya, etc.)",
  krishna: "a Krishna-paksha (waning) day",
  karana: "the Vishti (Bhadra) karana",
  hard: "a hard blocker (Adhik Maas / Kharmas / Eclipse / Pitru Paksha)",
  vara: "the weekday didn't suit this activity",
  tara: "an unfavourable personal Tara (star count)",
  chandra: "Ashtama Chandra — Moon in the 8th house from your rashi",
  score: "it scored below the Shubh threshold",
};
const REJ_ORDER = ["nakshatra", "tithi", "krishna", "karana", "bhadra", "hard", "vara", "tara", "chandra", "score"];

function rejectedReasons(v, day, act, mode) {
  const out = new Set();
  if (v.tierHits.t1.some((h) => h.startsWith("Bhadra"))) out.add("bhadra");
  else if (v.tierHits.t1.length) out.add("hard");
  if (v.nakOK === false) out.add("nakshatra");
  if (v.tithiOK === false) out.add(act.badTithis.includes(day.tithiIndex) ? "tithi" : "krishna");
  if (v.karanaOK === false) out.add("karana");
  if (v.varaOK === false) out.add("vara");
  if (mode === "personal") {
    if (day.tara && TARA_NATURE[day.tara.number - 1] === "bad") out.add("tara");
    if (v.personalMetrics && v.personalMetrics.isAshtamaChandra) out.add("chandra");
  }
  if (!out.size) out.add("score");
  return out;
}


export { SELECTION_MODES, SCORE_W, FULL_SHUBH, FULL_MADHYAMA, SOFT_SHUBH, PERSONAL_SHUBH, SELECTION_MODES as MODES, scoreMuhurta, muhurtaVerdict, rejectedReasons, REJ_LABEL, REJ_ORDER, chandraBala, taraBonus, chapterDisplay };
