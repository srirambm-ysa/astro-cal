/* astro-cal app — UI + orchestration. Vanilla ESM, stateless (localStorage holds only theme + birth + view prefs). */
import { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST,
         YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } from "./engine.js";
import { loadTaxonomy } from "./taxonomy.js";
import { listMonthlyGochara } from "./gochara.mjs";
import { getVerseOfDay, dayOfYear } from "./tirumandiram.mjs";

const LS = {
  birth: "astro-cal-birth",
  theme: "astro-cal-theme",
  view: "astro-cal-view",
};

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_MS = 86400000;
const TZ_IST = 5.5;

/* ---------- inline SVG icon set (research-approved; theme-swapped via CSS attr selectors) ---------- */
const I = {
  ama: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#262A4A"/><circle cx="9" cy="9" r="1" fill="#F8F0DE"/></svg>',
  pur: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill="#D3A94F"/><circle cx="12" cy="12" r="6" fill="#F8F0DE"/><circle cx="12" cy="12" r="3.5" fill="#262A4A"/></svg>',
  ecl: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#D97427" stroke-width="1.6" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="5.5" fill="#D3A94F"/><circle cx="10.5" cy="11" r="3.2" fill="#262A4A"/></svg>',
  rahu: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><path d="M4 20c3-8 8-13 16-16-1 9-5 14-13 17l-3-1z" fill="#B13B2B" opacity=".2"/><circle cx="9" cy="15" r="1.2" fill="#3D2412"/><circle cx="11" cy="12" r="1"/></svg>',
  yama: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><path d="M5 9l2-3 3 2 3-3 2 2 3-2 1 4-3 5-9-3z" fill="#B98A3E" opacity=".15"/><path d="M5 15h14M7 15v4M17 15v4" stroke="#B98A3E"/></svg>',
  gulika: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><circle cx="12" cy="12" r="8" fill="#262A4A" opacity=".22"/><path d="M12 4a8 8 0 0 1 0 16z" fill="#262A4A"/><circle cx="9" cy="9" r="1.1" fill="#F8F0DE"/></svg>',
  shr: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.6"><path d="M8 17c4-1 6-1 8 0M9 14c3-2 5-2 6-1M11 20c2-1 3-1 5-1M7 18l1 3M16 18l1 3" opacity=".7"/><path d="M12 8l2-1 2-3 2 1-1 2-1 2h-4z" fill="#D97427"/></svg>',
  fest: '<svg viewBox="0 0 24 24" fill="none" stroke="#D97427" stroke-width="1.6"><path d="M12 3l1.2 3 3 1.2-3 1.2L12 11.4l-1.2-3-3-1.2 3-1.2L12 3z" fill="#D97427" opacity=".35"/><circle cx="12" cy="12" r="8" stroke="#D97427" stroke-dasharray="3 2"/></svg>',
  san: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.7"><path d="M12 3v18M3 12h18" opacity=".5"/><circle cx="12" cy="12" r="6" fill="#B13B2B" opacity=".2"/><circle cx="12" cy="12" r="3.4" fill="#B13B2B"/></svg>',
  cha: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.7"><path d="M12 3a9 9 0 0 1 0 18z" fill="#B13B2B" opacity=".25"/><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></svg>',
  nitya: '<svg viewBox="0 0 24 24" fill="none" stroke="#A84B4B" stroke-width="1.6"><path d="M12 3l2.2 3.5 3.5.5-2.5 2.5.6 3.5-3.8-2-3.8 2 .6-3.5-2.5-2.5 3.5-.5L12 3z" fill="#A84B4B" opacity=".22"/><circle cx="12" cy="12" r="3.2" fill="#A84B4B"/></svg>',
};

/* ---------- built-in Tamil festivals (always computed on the Tamil solar calendar) ---------- */
// nakshatra indexes: Poosam=Pushya(7), Uthiram=Uttara Phalguni(11), Avittam=Dhanishta(22)
// tMonth indexes (sidereal sun rashi): Thai=Makara(9), Karthigai=Vrischika(7), Panguni=Meena(11), Aadi=Karka(3), Aavani=Simha(4)
const TAMIL_FESTIVALS = [
  { key: "thaipoosam", name: "Thai Poosam", tMonth: 9, kind: "nakshatra", val: 7 },
  { key: "karthigaideepam", name: "Karthigai Deepam", tMonth: 7, kind: "tithi", val: 14 }, // full moon in Karthigai
  { key: "panguniuthiram", name: "Panguni Uthiram", tMonth: 11, kind: "nakshatra", val: 11 },
  { key: "aadiperukku", name: "Aadi Perukku", tMonth: 3, kind: "tamday", val: 18 },
  { key: "aavaniavittam", name: "Aavani Avittam", tMonth: 4, kind: "nakshatra", val: 22 },
  // Shaiva Siddhanta — 9 core (Thiruvavaduthurai Adheenam, Skanda 2026 cross-check) — rules/shaiva_guru_pujas.json
  { key: "appar_guru_puja", name: "Appar (Tirunāvukkuaracar) Guru Pūjā", tMonth: 0, kind: "nakshatra", val: 23 },
  { key: "sambandar_guru_puja", name: "Sambandar Guru Pūjā", tMonth: 1, kind: "nakshatra", val: 18 },
  { key: "sundarar_guru_puja", name: "Sundarar Guru Pūjā", tMonth: 3, kind: "nakshatra", val: 14 },
  { key: "manickavasagar_guru_puja", name: "Māṇickavāsagar Guru Pūjā", tMonth: 2, kind: "nakshatra", val: 9 },
  { key: "tirumoolar_guru_puja", name: "Tirumoolar Guru Pūjā", tMonth: 6, kind: "nakshatra", val: 0 },
  { key: "sekkizhar_guru_puja", name: "Sekkizhar Guru Pūjā", tMonth: 1, kind: "nakshatra", val: 7 },
  { key: "vallalar_guru_puja", name: "Vallalār Guru Pūjā", tMonth: 5, kind: "nakshatra", val: 13 },
  { key: "thayumanavar_guru_puja", name: "Thāyumānavar Guru Pūjā", tMonth: 9, kind: "nakshatra", val: 15 },
];

/* ---------- phase 2: muhurta activity selection (rules/activity_corpus.json) ---------- */
// The 3-level cascade (Domain → Activity → Sub-activity/Task) is driven by the taxonomy
// resolver (taxonomy.js). `view.activity` stores a corpus activity_id (ACT_*). Pre-corpus
// selections ("grihapravesh", "vehicle", "travel") are migrated to their corpus equivalents.
const LEGACY_ACTIVITY = {
  grihapravesh: "ACT_REAL_GRIHA_PRAVESHA_NEW",
  vehicle: "ACT_TRV_VEHICLE_PURCHASE",
  travel: "ACT_TRV_PILGRIMAGE_YATRA",
};

/* ---------- Quick Selector Presets ---------- */
const LS_PRESETS = "astro-cal-presets";
const DEFAULT_PRESETS = [
  { label: "Griha Pravesha", domain: "DOM_REAL_ESTATE_CONSTRUCTION", sub: "SUB_OCCUPANCY_LEASING", task: "ACT_REAL_GRIHA_PRAVESHA_NEW" },
  { label: "Vehicle Purchase", domain: "DOM_TRAVEL_TOURISM", sub: "SUB_VEHICLE_OPERATIONS", task: "ACT_TRV_VEHICLE_PURCHASE" },
  { label: "Land Purchase", domain: "DOM_REAL_ESTATE_CONSTRUCTION", sub: "SUB_SITE_ACQUISITION", task: "ACT_REAL_LAND_PURCHASE" },
  { label: "New Venture", domain: "DOM_STARTUPS", sub: "SUB_ENTITY_FOUNDING", task: "ACT_STARTUP_INCORPORATION" },
  { label: "Pilgrimage", domain: "DOM_TRAVEL_TOURISM", sub: "SUB_PILGRIMAGE_LEISURE", task: "ACT_TRV_PILGRIMAGE_YATRA" },
];
let TAX = null;
let GOCHARA_RULES = null;
let TN_HOLIDAYS = null;
let TN_BBOX = null;
let SIDDHAR_PUJAS = null;
let NITYA_DEVIS = null;
let NITYA_BY_KEY = null;
let TIRUMANDIRAM = null;
let verseOffset = 0; // 0=today, +1=tomorrow verse, -1=yesterday
let IN_CITIES = null;
const QUICK_CITIES = ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"];

/* Focused activity for scoring: current selection (with legacy migration), else Griha Pravesha. */
function currentAct() {
  const id = LEGACY_ACTIVITY[view.activity] || view.activity;
  const act = id && TAX ? TAX.getActivity(id) : null;
  return act ? TAX.toMuhurta(act) : TAX.toMuhurta(TAX.getActivity("ACT_REAL_GRIHA_PRAVESHA_NEW"));
}

// Selection modes (PRD §2.6.7, redefined by what-is-personal-mode.md).
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

/* ---------- state ---------- */
let swe = null;
let birth = null;      // { nakshatra:0-26, pada:1-4, rashi:0-11, place, lat, lon, tz }
let view = { range: "month", anchor: todayISO(), activity: "ACT_REAL_GRIHA_PRAVESHA_NEW", mode: "full" }; // anchor = civil date (YYYY-MM-DD); mode = selection_mode (§2.6.7)
// The muhurta table is computed ONLY via the "Compute Muhurta" button (owner request
// 2026-08-13). render() skips renderMuhurta unless this is true, so browsing the
// activity/mode dropdowns (which clear + show the hint) never triggers a recalculation.
let muhComputed = false;

/* ---------- Web Worker client (PRD §2.5 v1.0) ---------- */
// Offloads swisseph computation to ephemeris.worker.js so multi-month scans
// never block the UI thread. Falls back to main-thread computeDay if workers
// are unavailable (e.g. file:// in some browsers).
let worker = null;
let workerReqId = 0;
const workerPending = new Map();

function ensureWorker() {
  if (worker || typeof Worker === "undefined") return worker;
  try { worker = new Worker("./ephemeris.worker.js", { type: "module" }); } catch (e) { worker = null; return null; }
  worker.onmessage = (e) => {
    const { type, reqId, ok, days, error } = e.data;
    if (type !== "computeRangeResult") return;
    const pending = workerPending.get(reqId);
    if (!pending) return;
    workerPending.delete(reqId);
    if (ok) pending.resolve(new Map(days));
    else pending.reject(new Error(error));
  };
  worker.onerror = (e) => {
    // reject all pending; future calls fall back to main thread
    for (const [, p] of workerPending) p.reject(new Error(e.message));
    workerPending.clear();
    worker = null;
  };
  return worker;
}

function computeRangeViaWorker(rangeStart, rangeEnd, geo, janmaNakshatra, tz) {
  const w = ensureWorker();
  if (!w) return null; // signal to fall back
  const reqId = ++workerReqId;
  return new Promise((resolve, reject) => {
    workerPending.set(reqId, { resolve, reject });
    w.postMessage({ type: "computeRange", reqId, payload: { rangeStart, rangeEnd, geo, janmaNakshatra, tz } });
  });
}

const $ = (id) => document.getElementById(id);

/* ---------- utils ---------- */
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function isoToYMD(iso) { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; }
function ymdToISO(y, m, d) { const p = (n) => String(n).padStart(2, "0"); return `${y}-${p(m)}-${p(d)}`; }
function dayLabel(iso) {
  const { y, m, d } = isoToYMD(iso);
  const dt = new Date(y, m - 1, d);
  return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()]} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${String(d).padStart(2, "0")} ${y}`;
}
function fmtHHMM(jd) { const t = timeIST(jd); return t.hhmm; }

/* ---------- persistence ---------- */
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

/* ---------- festival day matching ---------- */
function festivalMatches(f, tm, moonNakshatra, tithiIndex, tDay) {
  if (f.kind === "fixed") return false; // fixed Gregorian handled via dayMatchesFixed
  if (f.tMonth !== tm) return false;
  if (f.kind === "nakshatra") return moonNakshatra === f.val;
  if (f.kind === "tithi") return tithiIndex === f.val;
  if (f.kind === "tamday") return tDay === f.val;
  return false;
}
function dayMatchesFixed(f, m, d) {
  return f.kind === "fixed" && f.month === m && f.day === d;
}
function isSiddharMatch(f, day, y, m, d) {
  if (f.kind === "fixed") return dayMatchesFixed(f, m, d);
  return festivalMatches(f, day.tMonth, day.moonNakshatra, day.tithiIndex, day.tDay);
}
/* ---------- Sodashi Tithi Nitya helpers (pedagogic Kṛṣṇa-forward, Śukla-reverse) ---------- */
function nityaForTithiIndex(idx) {
  if (!NITYA_DEVIS || !NITYA_DEVIS.entries || NITYA_DEVIS.entries.length < 16) return null;
  const entries = NITYA_DEVIS.entries;
  const maha = entries[15] || entries.find(e => e.key === 'maha_tripura_sundari');
  if (idx === 14 || idx === 29) return maha; // Pūrṇimā / Amāvāsyā → Mahā
  const k = ((idx % 15) + 15) % 15;
  const isKrishna = idx >= 15;
  if (isKrishna) return entries[k]; // Kṛṣṇa-forward 0→Kāmeśvarī
  return entries[14 - k]; // Śukla-reverse 0→Citrā
}
function nityaForDay(day) {
  if (!day || day.tithi == null) return null;
  const idx = day.tithi.index != null ? day.tithi.index : (day.tithiIndex != null ? day.tithiIndex : null);
  if (idx == null) return null;
  return nityaForTithiIndex(idx);
}
function isMahaNitya(day) {
  const e = nityaForDay(day);
  return !!(e && e.key === 'maha_tripura_sundari');
}
function isInTN(lat, lon){
  const b = TN_BBOX?.bbox || {minLat:8.0,maxLat:13.6,minLon:76.1,maxLon:80.9};
  return lat>=b.minLat && lat<=b.maxLat && lon>=b.minLon && lon<=b.maxLon;
}
function getTNHoliday(iso){
  if(!TN_HOLIDAYS?.holidays) return null;
  return TN_HOLIDAYS.holidays.find(h=>h.date===iso) || null;
}
function isSecondOrFourthSaturday(y,m,d){
  const dt=new Date(y,m-1,d);
  if(dt.getDay()!==6) return false;
  const week=Math.ceil(d/7); // 1..5; 2nd=2, 4th=4 precisely for month start Sun-Sat variation? Use count of Saturdays
  // count Saturdays so far in month
  let sats=0;
  for(let i=1;i<=d;i++) if(new Date(y,m-1,i).getDay()===6) sats++;
  return sats===2 || sats===4;
}

/* ---------- day computation ---------- */
// Delegates to Engine.computeDay (single source of truth for astronomical +
// phase-2 fields). TZ offset is taken from birth.tz when available.
async function computeDay(y, m, d, geo, tz = TZ_IST) {
  return swe.computeDay(y, m, d, geo, birth ? birth.nakshatra : null, tz);
}

function dayLabelTamil(tMonth, tDay) { return `${TAMIL_MONTH[tMonth]} ${String(tDay).padStart(2, "0")}`; }

/* Build the day map for [rangeStart, rangeEnd] — uses the worker if available,
   falls back to main-thread computeDay. Returns a Map<iso, day>. */
async function buildDayMap(rangeStart, rangeEnd, geo, janmaNakshatra, tz) {
  // Try worker first
  const result = await computeRangeViaWorker(rangeStart, rangeEnd, geo, janmaNakshatra, tz).catch(() => null);
  if (result) return result;
  // Fallback: main thread
  const dayMap = new Map();
  for (let yy = rangeStart.y; yy <= rangeEnd.y; yy++) {
    const mStart = yy === rangeStart.y ? rangeStart.m : 1;
    const mEnd = yy === rangeEnd.y ? rangeEnd.m : 12;
    for (let mm = mStart; mm <= mEnd; mm++) {
      const dStart = yy === rangeStart.y && mm === rangeStart.m ? rangeStart.d : 1;
      const dEnd = yy === rangeEnd.y && mm === rangeEnd.m ? rangeEnd.d : new Date(yy, mm, 0).getDate();
      for (let dd = dStart; dd <= dEnd; dd++) {
        dayMap.set(ymdToISO(yy, mm, dd), await computeDay(yy, mm, dd, geo, tz));
      }
    }
  }
  return dayMap;
}

/* ---------- render ---------- */
async function render() {
  // Gochara impersonal fallback even without birth (docs/gochara_addition.md §3)
  if (!birth) {
    const { y: ay2, m: am2 } = isoToYMD(view.anchor);
    if(swe && GOCHARA_RULES) renderGochara(ay2, am2);
    else if($("gocharaBody")) $("gocharaBody").innerHTML=`<tr><td colspan="7" class="note">Enter birth details to see personalised house & tārā. Without birth, shows impersonal ingress list once calendar loads.</td></tr>`;
    const ac=$("avoidCard"); if(ac) ac.hidden=false;
    return;
  }
  const geo = [birth.lon, birth.lat, 0];
  const { y: ay, m: am, d: ad } = isoToYMD(view.anchor);
  const anchor = new Date(ay, am - 1, ad);
  $("app").hidden = false;
  renderProfile();
  renderPersona();

  const y0 = anchor.getFullYear(), m0 = anchor.getMonth() + 1;
  const rangeStart = { y: y0, m: m0, d: 1 };
  const rangeEnd = { y: y0, m: m0, d: new Date(y0, m0, 0).getDate() };
  const title = monthTitle(y0, m0);

  const tStart = swe.julday(rangeStart.y, rangeStart.m, rangeStart.d, 0);
  const tEnd = swe.julday(rangeEnd.y, rangeEnd.m, rangeEnd.d, 24 - TZ_IST) + 0.5;

  // precompute range-level items once
  const janma = { nakshatra: birth.nakshatra, rashi: birth.rashi };
  const chandraWindows = swe.chandrashtama(janma, tStart, tEnd, geo);
  const solarEcl = swe.solarEclipses(tStart, tEnd);
  const lunarEcl = swe.lunarEclipses(tStart, tEnd);

  $("curMonth").textContent = title;
  $("calTitle").textContent = title;
  const tamilYearName = swe.tamilYear(rangeStart.y, rangeStart.m, rangeStart.d);
  $("calTamilYear").textContent = `${TAMIL_MONTH[tmOf(swe, rangeStart.y, rangeStart.m, rangeStart.d, geo)]} · Tamil ${tamilYearName.name} (${tamilYearName.index})`;

  // build day cache (offloaded to worker when available — PRD §2.5 v1.0)
  const tz = birth.tz || TZ_IST;
  const dayMap = await buildDayMap(rangeStart, rangeEnd, geo, birth.nakshatra, tz);

  // overlay per-day flags (chandrashtama, eclipses, festivals)
  const flagMap = new Map();
  const windowsByDay = new Map();
  for (const w of chandraWindows) {
    // assign window to each civil day it overlaps (for the bar)
    let t = w.start;
    while (t < w.end) {
      const r = swe.revjul(t);
      const iso = ymdToISO(r.year, r.month, r.day);
      if (dayMap.has(iso)) {
        const dl = windowsByDay.get(iso) || [];
        dl.push({ kind: w.kind, start: w.start, end: w.end, nakshatra: w.nakshatra, rashi: w.rashi });
        windowsByDay.set(iso, dl);
      }
      t += 1; // advance ~1 day per iteration (coarse windows span ~2.25d)
    }
  }
  for (const ecl of solarEcl) flagMap.set(dateOfJD(swe, ecl.max), { key: "ecl", name: `Solar eclipse${ecl.total ? " (total)" : ecl.annular ? " (annular)" : " (partial)"}`, start: ecl.begin, end: ecl.end });
  for (const ecl of lunarEcl) flagMap.set(dateOfJD(swe, ecl.max), { key: "ecl", name: `Lunar eclipse${ecl.total ? " (total)" : " (partial)"}`, start: ecl.begin, end: ecl.end });

  // full-month table (one row per day; select a row to expand its detail)
  renderMonthEvents(dayMap, flagMap, windowsByDay);
  renderAvoidDays(chandraWindows);
  renderGochara(y0, m0);
  if (muhComputed) renderMuhurta(dayMap); // only via "Compute Muhurta" (owner request 2026-08-13)
  $("monthEvTitle").querySelector("span").textContent = title;
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

function renderMuhurta(dayMap) {
  const tbody = $("muhurtas");
  const detailByIso = new Map(); // iso -> { v, day } for Shubh rows (accordion detail)
  const days = [...dayMap.values()].sort((a, b) => (a.iso < b.iso ? -1 : 1));
  const focusAct = currentAct();
  const mode = view.mode || "full";
  // month-level fallback only for the focused activity's summary below
  const shuklaFallback = focusAct.paksha === "shukla" && !days.some((d) => scoreMuhurta(d, birth.nakshatra, focusAct, { mode, birthRashi: birth.rashi }).impersonalPass && d.tithi.paksha === "Shukla");
  let shubhTotal = 0;
  const rejCounts = new Map();
  const rowHtmls = [];
  for (const day of days) {
    if (!day.tara) continue; // without birth star, no personal verdict — skip from muhurta list
    const cf = { adhikMaas: day.adhikMaas, kharmas: day.kharmas, pitruPaksha: day.pitruPaksha };
    const opts = { mode, calendarField: cf, birthRashi: birth.rashi };
    if (shuklaFallback && day.tithi.paksha === "Krishna") opts.allowKrishnaFallback = true;
    const v = scoreMuhurta(day, birth.nakshatra, focusAct, opts);
    if (v.chip !== "Shubh") {
      for (const k of rejectedReasons(v, day, focusAct, mode)) rejCounts.set(k, (rejCounts.get(k) || 0) + 1);
      continue;
    }
    shubhTotal++;
    detailByIso.set(day.iso, { v, day });

    const dt = new Date(day.y, day.m - 1, day.d);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const mn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][day.m - 1];
    const dateStr = `${dayName} ${mn} ${String(day.d).padStart(2, "0")}`;
    const sel = day.iso === view.selected ? " selected" : "";
    const taraTxt = `${TARA_NAMES[day.tara.number - 1]} (${day.tara.number})`;
    const title = v.reasons.join(" · ");
    // time-bounded window tag (§2.7)
    const tb = v.timeBounded;
    const tbTag = tb ? ` <span class="tbwnd">(${tb.validTill}→${tb.nextStar})</span>` : "";
    rowHtmls.push(`<tr class="muhrow${sel}" data-iso="${day.iso}" title="${title}"><td class="dt">${dateStr}${tbTag}</td><td class="tara">${taraTxt}</td><td class="nak">${NAKSHATRA[day.moonNakshatra]}</td><td class="acts"><span class="chip verdict ${v.chip}">${v.chip} ${v.score}</span></td></tr>`);
  }
  // lay-language "why were the other days rejected" line (owner request 2026-08-13)
  let whyLine = "";
  if (rejCounts.size) {
    const parts = [];
    for (const k of REJ_ORDER) {
      const n = rejCounts.get(k);
      if (!n) continue;
      parts.push(`${REJ_LABEL[k]} — ${n} ${n === 1 ? "day" : "days"}`);
    }
    const rejectedCount = days.length - shubhTotal;
    if (parts.length) whyLine = `Why the other ${rejectedCount} ${rejectedCount === 1 ? "day was" : "days were"} set aside: ${parts.join(" · ")}. A day can be set aside for more than one reason.`;
  }
  const rows = rowHtmls.length ? [...rowHtmls] : [];
  if (rows.length && whyLine) rows.push(`<tr class="muhwhy"><td colspan="4">${whyLine}</td></tr>`);
  if (rows.length) {
    tbody.innerHTML = rows.join("");
    tbody.querySelectorAll(".muhrow").forEach((tr) => tr.addEventListener("click", () => { view.selected = tr.dataset.iso; save(LS.view, view); render(); }));
  } else {
    const whyBlock = whyLine ? `<tr class="muhwhy"><td colspan="4">${whyLine}</td></tr>` : "";
    tbody.innerHTML = `<tr><td colspan="4" class="note">No Shubh days this month for ${focusAct.name}. Try another activity or a softer mode.</td></tr>${whyBlock}`;
  }
  $("muhActName").textContent = `${focusAct.name} · ${SELECTION_MODES[mode].label}`;
  const fbNote = shuklaFallback ? " (Krishna-paksha days also shown — no Shukla days qualified this month)" : "";
  $("muhSummary").textContent = `${shubhTotal} Shubh days this month for ${focusAct.name}${fbNote}. ${focusAct.note}`;

  // Accordion detail (below the table): populate for the selected Shubh day, else reset.
  const acc = $("muhAcc");
  const head = $("muhAccHead");
  const body = $("muhAccBody");
  const sel = detailByIso.get(view.selected);
  if (sel) {
    const { v, day } = sel;
    body.innerHTML = muhurtaDetailHTML(v, day, focusAct);
    const dt = new Date(day.y, day.m - 1, day.d);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const dateStr = `${dayName} ${day.iso}`;
    head.innerHTML = `Muhurta details — <span class="star-label">${dateStr} · ${focusAct.name} · ${v.chip} ${v.score}</span>`;
    acc.open = true;
  } else {
    body.innerHTML = "";
    head.textContent = "Muhurta details — click a Shubh day row";
    acc.open = false;
  }
}

/* Full-month table: one row per day (tithi/nakshatra/kalam/events). Selecting a
   row expands an inline day-detail row (sunrise/sunset + full windows/periods),
   merging the former day-detail card into the calendar. */
function renderMonthEvents(dayMap, flagMap, windowsByDay) {
  const tbody = $("monthEvents");
  tbody.innerHTML = "";
  const days = [...dayMap.values()].sort((a, b) => (a.iso < b.iso ? -1 : 1));
  const chip = (cls, label, title = "") => `<span class="chip ${cls}"${title ? ` title="${title}"` : ""}>${label}</span>`;
  let rows = 0;
  for (const day of days) {
    const { y, m, d } = isoToYMD(day.iso);
    const dt = new Date(y, m - 1, d);
    const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const isToday = day.iso === todayISO();
    const isSel = day.iso === view.selected;
    const weekend = day.vara === 0 || day.vara === 6;

    const ws = windowsByDay.get(day.iso) || [];
    const coarse = ws.some((w) => w.kind === "coarse");
    const peak = ws.some((w) => w.kind === "peak");
    const chips = [];
    if (coarse) chips.push(chip("chandra", "Chandra", "Chandrashtama — coarse"));
    if (peak) chips.push(chip("chandra peak", "Chandra peak", "Chandrashtama — peak"));
    if (day.tithi.amavasya) chips.push(chip("moon", "Amavasya"));
    if (day.tithi.purnima) chips.push(chip("moon", "Purnima"));
    if (day.tDay === 1) chips.push(chip("sankranti", "Sankranti", `${TAMIL_MONTH[day.tMonth]} 1 — Tamil month begins`));
    if (flagMap.has(day.iso) && flagMap.get(day.iso).key === "ecl") chips.push(chip("eclipse", "Eclipse", flagMap.get(day.iso).name));
    const moonN = day.moonNakshatra;
    for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) chips.push(chip("festival", f.name, f.name));
    // Siddhar / Mahaan layer — true purpose (rules/siddhar_pujas.json + built-ins)
    if (SIDDHAR_PUJAS && SIDDHAR_PUJAS.entries) {
      for (const f of SIDDHAR_PUJAS.entries) if (isSiddharMatch(f, day, y, m, d)) chips.push(chip("siddhar", f.name, f.display ? `${f.name} · ${f.display}` : f.name));
    }
    // TN holidays — local, TN-only (bbox gate). No All-India DB, disclaimer via month header when outside TN.
    const inTN = birth ? isInTN(birth.lat, birth.lon) : false;
    if(inTN){
      const hol=getTNHoliday(day.iso);
      if(hol) chips.push(chip("holiday", hol.name, hol.name + (hol.kind==='bank_only'?' (banks only)':'')));
      else if(isSecondOrFourthSaturday(y,m,d)) chips.push(chip("holiday", "Bank holiday (2nd/4th Sat)", "RBI second/fourth Saturday — banks closed"));
    }
    const evs = chips.length ? chips.join("") : `<span class="chip none">—</span>`;

    const k = day.kalam;
    const kalamTxt = k ? `Rahu: ${fmtHHMM(k.rahu.start)} · Yama: ${fmtHHMM(k.yama.start)} · Gulika: ${fmtHHMM(k.gulika.start)}` : "—";

    const nitya = nityaForDay(day);
    const tithiCell = nitya
      ? `${day.tithi.name} <span class="nitya-inline" title="Nitya: ${nitya.display} · ${nitya.kalaName} kalā · bīja ${nitya.bija}">· ${nitya.display}</span>`
      : day.tithi.name;
    const tithiAria = nitya ? `Tithi ${day.tithi.name}, Nitya ${nitya.display}` : `Tithi ${day.tithi.name}`;
    const cls = `mrow${isSel ? " selected" : ""}${isToday ? " today" : ""}${weekend ? " weekend" : ""}`;
    tbody.insertAdjacentHTML("beforeend",
      `<tr class="${cls}" data-iso="${day.iso}">
        <td class="dt" data-label="Date">${weekday} <span class="d-num">${d}</span></td>
        <td data-label="Tithi" aria-label="${tithiAria}">${tithiCell}</td>
        <td data-label="Nakshatra">${NAKSHATRA[day.moonNakshatra]}</td>
        <td class="kal" data-label="Kalam">${kalamTxt}</td>
        <td class="evs" data-label="Events"><div class="evs-cell">${evs}</div></td>
      </tr>`);
    rows++;
    if (isSel) {
      tbody.insertAdjacentHTML("beforeend", `<tr class="mdetail" data-iso="${day.iso}"><td colspan="5">${dayDetailHTML(day, flagMap, windowsByDay)}</td></tr>`);
    }
  }
  if (!rows) tbody.insertAdjacentHTML("beforeend", '<tr><td colspan="5"><div class="note">No data for this range.</div></td></tr>');
  const tnNote=$("tnHolidayNote");
  if(tnNote){
    if(birth && !isInTN(birth.lat, birth.lon)) tnNote.style.display="block";
    else tnNote.style.display="none";
  }
  // row click = select / toggle the day (re-render to expand or close its detail)
  tbody.querySelectorAll(".mrow").forEach((tr) => tr.addEventListener("click", () => {
    view.selected = tr.dataset.iso === view.selected ? "" : tr.dataset.iso;
    save(LS.view, view);
    render();
  }));
  // copy mantra buttons inside expanded detail row
  tbody.querySelectorAll(".copy-btn").forEach((btn) => btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const raw = btn.getAttribute("data-mantra") || "";
    const txt = raw.replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
    try { await navigator.clipboard.writeText(txt); } catch(err) {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch(_e) {}
      ta.remove();
    }
    const prev = btn.textContent;
    btn.textContent = "Copied"; setTimeout(()=> btn.textContent = prev, 1200);
  }));
}

/* Inline day-detail (merged former day-detail card) rendered into the expanded
   month-table row: sunrise/sunset + kalam strip + windows and festival periods. */
function dayDetailHTML(day, flagMap, windowsByDay) {
  const iso = day.iso;
  const k = day.kalam;
  const dt = new Date(day.y, day.m - 1, day.d);
  const strip = `
    <div class="sunset">
      <div class="kv"><div class="k">Sunrise</div><div class="v">${day.rise ? fmtHHMM(day.rise) : "–"}</div></div>
      <div class="kv"><div class="k">Sunset</div><div class="v">${day.set ? fmtHHMM(day.set) : "–"}</div></div>
      <div class="kv"><div class="k">Tithi</div><div class="v">${day.tithi.name}</div></div>
      ${k ? `<div class="kv"><div class="k">Rahu Kalam</div><div class="v">${fmtHHMM(k.rahu.start)}–${fmtHHMM(k.rahu.end)}</div></div>
      <div class="kv"><div class="k">Yama Gandam</div><div class="v">${fmtHHMM(k.yama.start)}–${fmtHHMM(k.yama.end)}</div></div>
      <div class="kv"><div class="k">Gulikai</div><div class="v">${fmtHHMM(k.gulika.start)}–${fmtHHMM(k.gulika.end)}</div></div>` : `<div class="kv"><div class="k">Kalam</div><div class="v">–</div></div>`}
      <div class="kv"><div class="k">Tamil date</div><div class="v">${dayLabelTamil(day.tMonth, day.tDay)}</div></div>
      <div class="kv"><div class="k">Weekday</div><div class="v">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()]}</div></div>
    </div>`;
  const parts = [];
  const ws = windowsByDay.get(iso) || [];
  const coarse = ws.find((w) => w.kind === "coarse");
  const peak = ws.find((w) => w.kind === "peak");
  if (coarse) {
    const peakTxt = peak && peak.nakshatra != null ? ` · peak ${fmtHHMM(peak.start)}–${fmtHHMM(peak.end)} (${NAKSHATRA[peak.nakshatra]})` : "";
    parts.push(periodRow(I.cha, "Chandrashtama — coarse" + (peak ? " + peak" : ""), `${fmtHHMM(coarse.start)} → ${fmtHHMM(coarse.end)}${peakTxt}`, "bad", "AVOID"));
  }
  if (day.tithi.amavasya) parts.push(periodRow(I.ama, "Amavasya (new moon)", "All day", "per", "Moon"));
  if (day.tithi.purnima) parts.push(periodRow(I.pur, "Purnima (full moon)", "All day", "per", "Moon"));
  if (flagMap.has(iso)) {
    const f = flagMap.get(iso);
    if (f.key === "ecl") parts.push(periodRow(I.ecl, f.name, f.start ? `${fmtHHMM(f.start)} → ${fmtHHMM(f.end)}` : "All day", "per", "Eclipse"));
  }
  if (day.tDay === 1) parts.push(periodRow(I.san, `${TAMIL_MONTH[day.tMonth]} 1 — sankranti`, "Tamil month begins", "mut", "Sankranti"));
  const moonN = day.moonNakshatra;
  for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) parts.push(periodRow(I.fest, f.name, `${dayLabelTamil(day.tMonth, day.tDay)} · Tamil calendar`, "mut", "Festival"));
  if (SIDDHAR_PUJAS && SIDDHAR_PUJAS.entries) {
    const { y: yy, m: mm, d: dd } = isoToYMD(day.iso);
    for (const f of SIDDHAR_PUJAS.entries) if (isSiddharMatch(f, day, yy, mm, dd)) parts.push(periodRow(I.san, f.name, f.display ? `${f.display} · Siddhar` : `Siddhar · ${dayLabelTamil(day.tMonth, day.tDay)}`, "mut", "Siddhar"));
  }
  // Sodashi Tithi Nitya — always on (lunar, sunrise-anchored)
  const nitya = nityaForDay(day);
  if (nitya) {
    const paksha = day.tithi.paksha || (day.tithi.index >= 15 ? "Krishna" : "Shukla");
    const kalaBija = `${nitya.kalaName} kalā · bīja ${nitya.bija} · ${paksha}`;
    const mantraEsc = String(nitya.mantraTarpana).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    const dhyanaLink = nitya.dhyanaRef ? ` · <a href="https://stotranidhi.com/en/nitya-devi-dhyana-shloka-in-english/" target="_blank" rel="noopener" class="nitya-link">dhyāna</a>` : "";
    const nityaTitle = `${nitya.display} — ${nitya.deviName !== nitya.display ? nitya.deviName : nitya.tamilName}`;
    const mantraBlock = `<div class="nitya-mantra-wrap">`
      + `<div class="mantra" lang="sa">${mantraEsc}</div>`
      + `<button class="copy-btn" data-mantra="${mantraEsc.replace(/"/g,'&quot;')}" aria-label="Copy Nitya mantra">Copy</button>`
      + `</div>`;
    const footer = `<div class="diksa-footnote">ⓘ Śrī Vidyā Nitya vidyās are traditionally dīkṣā-bound. These mantras appear here as public-domain Tantrarāja transcriptions for study. Please chant or practise only as your own guru instructs.</div>`;
    parts.push(
      periodRow(I.nitya, nityaTitle, kalaBija + dhyanaLink, "mut", "Nitya")
      + mantraBlock + footer
    );
  }
  const body = parts.length ? parts.join("") : '<div class="note">No flagged periods today.</div>';
  return `<div class="detail">${strip}${body}</div>`;
}

/* ---------- Avoid Days (Chandrashtama) — invariant top strip (docs/gochara_addition.md §0) ---------- */
function renderAvoidDays(windows){
  const card=$("avoidCard"), body=$("avoidBody");
  if(!card || !body) return;
  if(!birth || !windows || !windows.length){
    card.hidden=false;
    body.innerHTML = birth ? '<span class="note">No Chandrashtama this month — clear for important initiations.</span>' : 'Enter birth details to see your Avoid Days.';
    return;
  }
  card.hidden=false;
  // Group by coarse windows (deduplicate overlapping peak inside coarse)
  const coarse=windows.filter(w=>w.kind==="coarse");
  if(!coarse.length){
    body.innerHTML='<span class="note">No Avoid Days this month.</span>'; return;
  }
  const rows=coarse.map(w=>{
    const s=timeIST(w.start), e=timeIST(w.end);
    const peak=windows.find(p=>p.kind==="peak" && p.start>=w.start && p.end<=w.end);
    const peakTxt=peak ? ` · peak ${timeIST(peak.start).hhmm}→${timeIST(peak.end).hhmm} (${NAKSHATRA[peak.nakshatra]})` : "";
    return `<div class="period" style="border-left-color:var(--chandra-peak)"><div class="l"><span class="chip chandra">Avoid</span><span class="t">${s.ymd} ${s.hhmm} → ${e.ymd} ${e.hhmm}</span><span class="tt">${RASHI[w.rashi]}${peakTxt}</span></div></div>`;
  }).join("");
  body.innerHTML = rows + `<div class="note" style="margin-top:6px">Chandrashtama = Moon in 8th rashi from janma rāśi (${RASHI[birth.rashi]}) + peak nakshatra ${(birth.nakshatra+16)%27+1} ${NAKSHATRA[(birth.nakshatra+16)%27]}. Avoid important initiations other than routine during these windows.</div>`;
}

/* ---------- Gochara — monthly transits (docs/gochara_addition.md) ---------- */
function renderGochara(year, month){
  const card=$("gocharaCard"), body=$("gocharaBody"), meta=$("gocharaMeta"), vedhaNote=$("gocharaVedhaNote"), title=$("gocharaTitle");
  if(!card || !body) return;
  const mName=["January","February","March","April","May","June","July","August","September","October","November","December"][month-1];
  if(title) title.querySelector("span").textContent = `Gochara — ${mName} ${year}${birth ? ` · for ${RASHI[birth.rashi]} (${birth.rashi+1})` : ""}`;
  if(!swe || !GOCHARA_RULES){
    body.innerHTML=`<tr><td colspan="7" class="note">Loading gochara…</td></tr>`; return;
  }
  const birthArg = birth ? { rashi: birth.rashi, nakshatra: birth.nakshatra } : null;
  const rows = listMonthlyGochara(year, month, birthArg, swe, GOCHARA_RULES);
  if(!rows.length){
    body.innerHTML=`<tr><td colspan="7" class="note">No rashi ingress this month (planets stay put).</td></tr>`;
    if(meta) meta.textContent = birthArg ? "No transits — steady month for your rāśi." : "No transits this month.";
    if(vedhaNote) vedhaNote.style.display="none";
    return;
  }
  const fmtHouse = (h)=> h ? `<span class="chip house">${h}th</span>` : `<span class="chip none">—</span>`;
  const fmtEffect = (eff, vedha)=> {
    if(!eff) return `<span class="chip none">—</span>`;
    const cls = eff==="shubha" ? "shubha" : eff==="ashubha" ? "ashubha" : "madhyama";
    const label = eff==="shubha" ? "Śubha" : eff==="ashubha" ? "Aśubha" : "Madhyama";
    const vedhaTag = vedha ? ` <span class="chip gochara vedha" title="Vedha — obstructed">⚑ vedha</span>` : "";
    return `<span class="chip gochara ${cls}">${label}</span>${vedhaTag}`;
  };
  const fmtTara = (tara)=>{
    if(!tara) return `<span class="chip none">—</span>`;
    const cls = tara.nature==="good" ? "good" : tara.nature==="bad" ? "bad" : "neutral";
    const icon = tara.nature==="good" ? "✨" : tara.nature==="bad" ? "⚠️" : "—";
    return `<span class="chip tara ${cls}" title="${tara.name} (${tara.number}) count ${tara.count}">${icon} ${tara.name}</span>`;
  };
  body.innerHTML = rows.map(r=>{
    const house = fmtHouse(r.house);
    const eff = fmtEffect(r.effect, r.vedhaBlocked);
    const tara = fmtTara(r.tara);
    const paraphrase = r.paraphrase ? `<span style="font-size:12px">${r.paraphrase}</span>${r.verseKey ? ` <a href="#" class="prov-link" data-verse="${r.verseKey}" style="font-size:10px;color:var(--gold)">[${r.verseKey}]</a>` : ""}` : `<span class="note">${r.fromRashiName}→${r.toRashiName}</span>`;
    return `<tr><td class="dt" data-label="Date">${r.date}<br><span style="font-size:11px;color:var(--ink-soft)">${r.weekday.slice(0,3)} ${r.timeIST}</span></td><td data-label="Planet"><strong>${r.planet}</strong><br><span style="font-size:11px;color:var(--ink-soft)">${r.planetSanskrit}</span></td><td data-label="From → To">${r.fromRashiName} → ${r.toRashiName}<br><span style="font-size:11px;color:var(--ink-soft)">${r.transitNakName}</span></td><td data-label="House">${house}</td><td data-label="Effect">${eff}</td><td data-label="Tārā">${tara}</td><td data-label="Paraphrase">${paraphrase}</td></tr>`;
  }).join("");
  if(meta) meta.textContent = birthArg ? `${rows.length} transit${rows.length>1?"s":""} this month for janma rāśi ${RASHI[birth.rashi]} — house = from janma rāśi, tārā = from janma nakshatra ${NAKSHATRA[birth.nakshatra]}.` : `${rows.length} ingress${rows.length>1?"es":""} this month (impersonal — enter birth for house & tārā).`;
  if(vedhaNote) vedhaNote.style.display = rows.some(r=>r.vedhaBlocked) ? "block" : "none";
  // verse link handler (opens provenance modal if available)
  body.querySelectorAll(".prov-link").forEach(a=> a.addEventListener("click", (e)=>{
    e.preventDefault();
    const vk=a.dataset.verse;
    if(window.showProvenanceForVerse) window.showProvenanceForVerse(vk);
  }));
}

/* Tirumandiram — Verse of the Day (daily return driver) */
function renderVerseCard(){
  const card=$("verseCard"), body=$("verseBody"), meta=$("verseMeta"), openLink=$("verseOpen");
  if(!card || !body) return;
  if(!TIRUMANDIRAM || !TIRUMANDIRAM.entries){
    body.innerHTML=`<div class="note">Loading Tirumandiram verses…</div>`;
    return;
  }
  // IST today + offset (for Prev/Next browsing)
  const now = new Date(Date.now() + 19800000); // UTC+5:30
  // apply offset in days
  now.setUTCDate(now.getUTCDate() + verseOffset);
  const y=now.getUTCFullYear(), m=now.getUTCMonth()+1, d=now.getUTCDate();
  const verse = getVerseOfDay(y,m,d, TIRUMANDIRAM);
  if(!verse){ body.innerHTML=`<div class="note">Verse not available.</div>`; return; }
  const tantraLabel = verse.t===0 ? "Payiram" : `Tantra ${verse.t}`;
  if(meta) meta.textContent = `${String(y).padStart(4,"0")}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")} · ${tantraLabel} · #${verse.n}`;
  if(openLink) openLink.href = `https://tirumandiram.in/#/read/${verse.n}`;
  body.innerHTML = `
    <div class="verse-tag">${verse.sec}</div>
    <div class="verse-tamil" lang="ta">${verse.ta}</div>
    ${verse.tr ? `<div class="verse-tr">${verse.tr}</div>` : ""}
    <div class="verse-en">${verse.en}</div>
    <div class="verse-cite">— Tirumandiram ${verse.n} · ${tantraLabel} · ${verse.sec} · <a href="https://tirumandiram.in/#/read/${verse.n}" target="_blank" rel="noopener" style="color:var(--vermilion)">Read commentary ↗</a></div>
  `;
}

/* City quick-selector — SimpleMaps 382 + GeoNames fallback */
function cityMatches(q){
  if(!IN_CITIES || !IN_CITIES.entries) return [];
  const s = q.trim().toLowerCase();
  if(!s) return IN_CITIES.entries.slice(0,8);
  return IN_CITIES.entries.filter(e=>{
    return e.city_ascii.toLowerCase().includes(s) || e.city.toLowerCase().includes(s) || e.admin_name.toLowerCase().includes(s);
  }).slice(0,12);
}
function renderCityChips(){
  const wrap=$("cityChips");
  if(!wrap || !IN_CITIES) return;
  const curPlace = $("bPlace") ? $("bPlace").value.trim().toLowerCase() : "";
  const curLat = $("bLat") ? parseFloat($("bLat").value) : NaN;
  wrap.innerHTML="";
  QUICK_CITIES.forEach(name=>{
    const entry = IN_CITIES.entries.find(e=> e.city_ascii.toLowerCase()===name.toLowerCase());
    if(!entry) return;
    const btn=document.createElement("button");
    btn.type="button";
    btn.className="city-chip" + (curPlace===entry.city.toLowerCase() || Math.abs(curLat-entry.lat)<0.01 ? " active" : "");
    btn.textContent=entry.city;
    btn.title=`${entry.city}, ${entry.admin_name}`;
    btn.addEventListener("click", ()=> applyCity(entry));
    wrap.appendChild(btn);
  });
}
function renderCityDropdown(q){
  const dd=$("bCityDropdown");
  if(!dd) return;
  const list = cityMatches(q);
  if(!list.length){ dd.hidden=true; dd.innerHTML=""; return; }
  dd.innerHTML = list.map(e=> `<div class="city-opt" role="option" data-city="${e.city_ascii}" data-lat="${e.lat}" data-lng="${e.lng}" data-admin="${e.admin_name}"><span><strong>${e.city}</strong> <span class="c-admin">· ${e.admin_name}</span></span><span class="c-pop">${e.population? (e.population>1000000? (e.population/1000000).toFixed(1)+'M' : e.population>1000? Math.round(e.population/1000)+'k' : e.population) : ''}</span></div>`).join("");
  dd.hidden=false;
  dd.querySelectorAll(".city-opt").forEach(el=>{
    el.addEventListener("click", ()=>{
      const cityAscii=el.dataset.city;
      const entry = IN_CITIES.entries.find(e=> e.city_ascii===cityAscii);
      if(entry) applyCity(entry);
    });
  });
}
function applyCity(entry){
  if(!entry) return;
  const place=$("bPlace"), lat=$("bLat"), lon=$("bLon"), tz=$("bTz"), search=$("bCitySearch"), dd=$("bCityDropdown");
  if(place) place.value = entry.city;
  if(lat) lat.value = entry.lat.toFixed(4);
  if(lon) lon.value = entry.lng.toFixed(4);
  if(tz) tz.value = "5.5";
  if(search) search.value = entry.city + " · " + entry.admin_name;
  if(dd) dd.hidden=true;
  renderCityChips();
  // hint: user still needs to press Compute calendar (we don't auto-compute to avoid surprising nav)
}

function initCitySelector(){
  const search=$("bCitySearch"), dd=$("bCityDropdown"), placeInput=$("bPlace");
  if(!search || !dd) return;
  renderCityChips();
  // sync search box from saved place if matches a city
  if(IN_CITIES && placeInput && placeInput.value){
    const m = IN_CITIES.entries.find(e=> e.city.toLowerCase()===placeInput.value.trim().toLowerCase() || e.city_ascii.toLowerCase()===placeInput.value.trim().toLowerCase());
    if(m) search.value = m.city + " · " + m.admin_name;
  }
  let t=null;
  search.addEventListener("input", ()=>{
    clearTimeout(t);
    t=setTimeout(()=> renderCityDropdown(search.value), 120);
  });
  search.addEventListener("focus", ()=> renderCityDropdown(search.value));
  search.addEventListener("keydown", (e)=>{
    if(e.key==="Escape"){ dd.hidden=true; }
    if(e.key==="Enter"){
      const first = dd.querySelector(".city-opt");
      if(first && !dd.hidden){ first.click(); e.preventDefault(); }
    }
  });
  document.addEventListener("click", (e)=>{
    if(!search.contains(e.target) && !dd.contains(e.target)) dd.hidden=true;
  });
  // keep chips in sync when manual fields change
  ["bPlace","bLat","bLon"].forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener("input", renderCityChips);
  });
}

/* Muhurta detail HTML for the accordion under the Muhurta table: score breakdown,
   tara/chandra (personal), activity chip, overrides, time-bounded window, and the
   Classical Foundation citations. Rendered ONLY from renderMuhurta (per-row, on the
   explicitly Compute button) — never inside the day-detail card. */
function muhurtaDetailHTML(v, day, act) {
  const tierLines = [];
  if (v.tierHits.t1.length) tierLines.push(`<div class="muh-line t1"><span class="k">T1 blockers</span><span class="v">${v.tierHits.t1.join(", ")}</span></div>`);
  const t2bad = v.tierHits.t2.filter(h => !h.includes("✓"));
  const t3bad = v.tierHits.t3.filter(h => !h.includes("✓"));
  if (t2bad.length) tierLines.push(`<div class="muh-line t2"><span class="k">T2 primary</span><span class="v">${t2bad.join(", ")}</span></div>`);
  if (t3bad.length) tierLines.push(`<div class="muh-line t3"><span class="k">T3 secondary</span><span class="v">${t3bad.join(", ")}</span></div>`);
  const t2good = v.tierHits.t2.filter(h => h.includes("✓"));
  const t3good = v.tierHits.t3.filter(h => h.includes("✓"));
  if (t2good.length || t3good.length) tierLines.push(`<div class="muh-line good"><span class="k">Passing</span><span class="v">${[...t2good, ...t3good].join(", ")}</span></div>`);
  return `
      <div class="muh-line"><span class="k">Score</span><span class="v"><strong>${v.score}/100</strong> · ${v.verdict}</span></div>
      <div class="muh-line"><span class="k">Tara</span><span class="v">${TARA_NAMES[day.tara.number - 1]} (${day.tara.number}) — ${TARA_NATURE[day.tara.number - 1] === "good" ? "favourable" : TARA_NATURE[day.tara.number - 1] === "bad" ? "unfavourable" : "neutral"}</span></div>
      ${v.personalMetrics ? `<div class="muh-line"><span class="k">Chandra</span><span class="v">Moon transit ${v.personalMetrics.chandraHouse}th house from birth rashi — ${v.personalMetrics.isAshtamaChandra ? "Ashtama Chandra (blocked)" : v.personalMetrics.chandraScoreBonus > 0 ? `favourable (+${v.personalMetrics.chandraScoreBonus})` : v.personalMetrics.chandraScoreBonus < 0 ? `unfavourable (${v.personalMetrics.chandraScoreBonus})` : "neutral"}</span></div>` : ""}
      <div class="muh-line"><span class="k">${act.name}</span><span class="chip ${v.chip}">${v.chip}</span></div>
      ${tierLines.join("")}
      ${v.overrides.length ? `<div class="muh-line ovr"><span class="k">Override</span><span class="v">${v.overrides.join(", ")}</span></div>` : ""}
      ${v.krishnaAllowed ? `<div class="muh-line note"><span class="k">Fallback</span><span class="v">No Shukla day qualified this month · Krishna paksha shown</span></div>` : ""}${v.timeBounded ? `
      <div class="muh-line"><span class="k">Window</span><span class="v">${v.timeBounded.validTill} → ${v.timeBounded.nextStar}</span></div>` : ""}
      ${classicalBlock(v, act)}`;
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

/* One provenance citation row: chapter·verse ref, optional rule label,
   Devanagari sloka, English translation, applied rule logic. */
function provItemHTML(ref, sanskrit, english, logic, label) {
  return `
    <div class="prov-item">
      <div class="prov-ref">${ref}</div>
      ${label ? `<div class="prov-label">${label}</div>` : ""}
      ${sanskrit ? `<div class="prov-sans" lang="sa">${sanskrit.split("\n").join("<br>")}</div>` : ""}
      ${english ? `<div class="prov-en">${english}</div>` : ""}
      ${logic ? `<div class="prov-logic">${logic}</div>` : ""}
    </div>`;
}

/* Classical Foundation block — cites the confirmed Muhurta Chintamani slokas that
   FIRED for this day's verdict (provenance_registry.json, proof==="confirmed").
   When none fired, surfaces the activity's governing verses instead of a bare
   disclaimer — the provenance USP (owner request 2026-08-13). */
function classicalBlock(v, act) {
  const cls = act.classical || null;
  const verses = v.provenance || [];
  const basisLabel = cls ? { classical: "direct classical rule", functional_group: "functional-group classification (Ch. 2)", formula: "panchanga formula" }[cls.basis] || cls.basis : null;
  const FIRED_CAPTION = "Classical Foundation — <em>Muhurta Chintamani</em>" + (cls ? ` (${cls.chapter})` : "");
  if (verses.length) {
    const items = verses.map((p) => provItemHTML(`${p.chapter} · ${p.verse_number}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic)).join("");
    return `
      <div class="classical-foundation">
        <details>
          <summary>${FIRED_CAPTION}</summary>
          <div class="cf-body">
            <div class="cf-basis">Governing basis: ${basisLabel || "muhurta rules"} · Source: ${cls ? cls.source : "Muhurta Chintamani"} · ${cls ? cls.author : "Acharya Rama Daivagya"}</div>
            ${items}
          </div>
        </details>
      </div>`;
  }
  // No verse-affirmed rule fired today → show the governing classical verses
  // (confirmed slokas only — never fabricated citations).
  const governing = (cls ? cls.verses : []).filter((p) => p.sanskrit_sloka);
  if (governing.length) {
    const items = governing.map((p) => provItemHTML(`${chapterDisplay(p.chapter, cls.chapter)} · ${p.verse}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic, p.label)).join("");
    return `
      <div class="classical-foundation">
        <details open>
          <summary>${FIRED_CAPTION}</summary>
          <div class="cf-body">
            <div class="cf-basis">Governing basis: ${basisLabel} · Source: ${cls.source} · ${cls.author}</div>
            ${items}
            ${cls.rationale ? `<div class="cf-logic">${cls.rationale}</div>` : ""}
            <div class="cf-note">No verse-affirmed rule fired today (no hard blocker or categorical overlay applied). The verses above govern this activity's classification; all temporal terms verified against Muhurta Chintamani (Rama Daivagya).</div>
          </div>
        </details>
      </div>`;
  }
  return `
    <div class="classical-foundation">
      <div class="cf-head">Classical Foundation</div>
      <div class="cf-note">${cls ? `This activity is classified via ${basisLabel} (panchanga formula); no direct sloka applies. All temporal terms verified against Muhurta Chintamani (Rama Daivagya).` : "Provenance registry not loaded."}</div>
    </div>`;
}

/* ---------- classical source modal ---------- */
function provenanceBodyHTML(act) {
  const cls = TAX.toMuhurta(act).classical;
  if (!cls) return `<div class="cf-note">Provenance registry not loaded for this activity.</div>`;
  const items = (cls.verses || []).filter((p) => p.sanskrit_sloka)
    .map((p) => provItemHTML(`${chapterDisplay(p.chapter, cls.chapter)} · ${p.verse}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic, p.label)).join("");
  const tier = { classical: "Direct classical rule", functional_group: "Functional-group (Ch. 2)", formula: "Panchanga formula" }[cls.basis] || cls.basis;
  return `
    <div class="pf-label">${act.activity_name}</div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0">
      <span class="badge ${cls.basis}">${tier}</span>
      <span class="prov-ref" style="text-transform:none;letter-spacing:.02em">${cls.source} — ${cls.author}</span>
    </div>
    <div class="cf-basis">Governing chapter: ${cls.chapter}${cls.rationale ? ` · ${cls.rationale}` : ""}</div>
    ${items}
    <div class="cf-note">All verses cited carry proof==="confirmed" — verified against the Muhurta Chintamani text. No fabricated citations.</div>`;
}

function citationText(cls) {
  const refs = (cls.verses || []).filter((v) => v.sanskrit_sloka)
    .map((v) => `${v.verse} (${chapterDisplay(v.chapter, cls.chapter)})`);
  return `${cls.source} — ${cls.author}${cls.chapter ? ", " + cls.chapter : ""}${refs.length ? ": " + refs.join("; ") : ""}`;
}

function periodRow(icon, title, sub, tagCls, tagTxt) {
  return `<div class="period"><div class="l">${icon}<div><span class="t">${title}</span><div class="tt">${sub}</div></div></div><span class="tag ${tagCls}">${tagTxt}</span></div>`;
}

/* ---------- helpers ---------- */
function monthTitle(y, m) { return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${y}`; }
function dateOfJD(swe, jd) { const r = swe.revjul(jd); return ymdToISO(r.year, r.month, r.day); }
function tmOf(swe, y, m, d, geo) { const jd = swe.julday(y, m, d, 12 - TZ_IST); return swe.tamilDate(jd, y, m, d).tMonth; }

/* ---------- profile ---------- */
function renderProfile() {
  $("profile").innerHTML = `
    <div class="kv"><div class="k">Janma Nakshatra</div><div class="v">${NAKSHATRA[birth.nakshatra]}</div></div>
    <div class="kv"><div class="k">Janma Rashi</div><div class="v">${RASHI[birth.rashi]}</div></div>
    <div class="kv"><div class="k">Panchang location</div><div class="v">${birth.place} · Lahiri</div></div>
    <div class="kv"><div class="k">Panchang day</div><div class="v">Sunrise → sunrise</div></div>`;
}

function renderPersona() {
  const text = $("personaText");
  if (birth) {
    $("persona").title = `Janma nakshatra ${NAKSHATRA[birth.nakshatra]} · rashi ${RASHI[birth.rashi]} · ${birth.place}`;
    text.textContent = `${NAKSHATRA[birth.nakshatra]} · ${RASHI[birth.rashi]}`;
  } else {
    $("persona").title = "Set your birth nakshatra & location";
    text.textContent = "Set birth star";
  }
}

/* ---------- ICS export ---------- */
async function buildICS(startISO, endISO) {
  const lines = [];
  const add = (l) => lines.push(l);
  add("BEGIN:VCALENDAR");
  add("VERSION:2.0");
  add("PRODID:-//astro-cal//Muhurta Calendar//EN");
  add("CALSCALE:GREGORIAN");
  add("BEGIN:VTIMEZONE");
  add("TZID:Asia/Kolkata");
  add("BEGIN:STANDARD");
  add("DTSTART:19700101T000000");
  add("TZOFFSETFROM:+0530");
  add("TZOFFSETTO:+0530");
  add("END:STANDARD");
  add("END:VTIMEZONE");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let uid = 0;
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const dayAdd = (iso) => { const { y, m, d } = isoToYMD(iso); const dt = new Date(Date.UTC(y, m - 1, d)); dt.setUTCDate(dt.getUTCDate() + 1); const p = (n) => String(n).padStart(2, "0"); return `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}`; };
  const event = (summary, dstart, opts = {}) => {
    add("BEGIN:VEVENT");
    add(`UID:astro-cal-${Date.now()}-${uid++}@muhurta`);
    add(`DTSTAMP:${stamp}`);
    add(`SUMMARY:${esc(summary)}`);
    if (opts.allday) { add(`DTSTART;VALUE=DATE:${dstart}`); add(`DTEND;VALUE=DATE:${dayAdd(dstart)}`); }
    else { add(`DTSTART;TZID=Asia/Kolkata:${dstart}`); add(`DTEND;TZID=Asia/Kolkata:${opts.dend}`); }
    if (opts.rrule) add(`RRULE:${opts.rrule}`);
    add("END:VEVENT");
  };
  const tzDT = (jd) => { const t = timeIST(jd); return t.ymd.replace(/-/g, "") + "T" + t.hhmm.replace(":", "") + "00"; };

  const { y: sy, m: sm, d: sd } = isoToYMD(startISO);
  const { y: ey, m: em, d: ed } = isoToYMD(endISO);
  const tStart = swe.julday(sy, sm, sd, 0);
  const tEnd = swe.julday(ey, em, ed, 24 - TZ_IST) + 0.5;
  const geo = [birth.lon, birth.lat, 0];
  const janma = { nakshatra: birth.nakshatra, rashi: birth.rashi };

  // chandrashtama windows (timed)
  for (const w of swe.chandrashtama(janma, tStart, tEnd, geo)) {
    event(`Chandrashtama ${w.kind === "coarse" ? "coarse" : "peak"}`, tzDT(w.start), { dend: tzDT(w.end) });
  }
  // eclipses
  for (const e of swe.solarEclipses(tStart, tEnd)) event(`Solar eclipse${e.total ? " (total)" : ""}`, tzDT(e.begin), { dend: tzDT(e.end) });
  for (const e of swe.lunarEclipses(tStart, tEnd)) event(`Lunar eclipse${e.total ? " (total)" : ""}`, tzDT(e.begin), { dend: tzDT(e.end) });

  // per-day all-day items (amavasya/purnima/festivals/personal)
  const icsTz = birth.tz || TZ_IST;
  const dayMap = await buildDayMap({ y: sy, m: sm, d: sd }, { y: ey, m: em, d: ed }, geo, birth.nakshatra, icsTz);
  for (const [iso, day] of dayMap) {
    const dateStr = iso.replace(/-/g, "");
    if (day.tithi.amavasya) event("Amavasya (new moon)", dateStr, { allday: true });
    if (day.tithi.purnima) event("Purnima (full moon)", dateStr, { allday: true });
    const moonN = day.moonNakshatra;
    for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) event(f.name, dateStr, { allday: true });
    if (SIDDHAR_PUJAS && SIDDHAR_PUJAS.entries) {
      const { y, m, d } = isoToYMD(iso);
      for (const f of SIDDHAR_PUJAS.entries) if (isSiddharMatch(f, day, y, m, d)) event(f.name, dateStr, { allday: true });
    }
    // Nitya Devi — one all-day trace per civil day
    if (NITYA_DEVIS && day.tithi && day.tithi.index != null) {
      const nitya = nityaForTithiIndex(day.tithi.index);
      if (nitya) event(`Tithi: ${day.tithi.name} — Nitya: ${nitya.display}`, dateStr, { allday: true });
    }
  }
  add("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/* ---------- theme ---------- */
const ICON_MOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
function setTheme(night) {
  document.body.classList.toggle("night", night);
  $("themeIcon").innerHTML = night ? ICON_SUN : ICON_MOON;
  $("themeLabel").textContent = night ? "Day mode" : "Night mode";
  save(LS.theme, night ? "night" : "day");
}
function toggleTheme() { setTheme(!document.body.classList.contains("night")); }

/* ---------- range nav ---------- */
function nav(delta) {
  const { y, m, d } = isoToYMD(view.anchor);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + delta);
  view.anchor = ymdToISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  save(LS.view, view);
  muhComputed = true; // intent unchanged — muhurta table follows the navigated month
  render();
}

/* ---------- print / copy ---------- */
function printView() { window.print(); }
function copyDayEvents() {
  const detail = document.querySelector(".monthtab tr.mdetail");
  if (!view.selected || !detail) { alert("Select a day first."); return; }
  const { y, m, d } = isoToYMD(view.selected);
  const dt = new Date(y, m - 1, d);
  const label = `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()]}, ${dayLabel(view.selected)}`;
  const copyText = `${label}\n${detail.innerText}`;
  navigator.clipboard.writeText(copyText).then(() => {
    const b = $("copyBtn");
    b.textContent = "Copied";
    setTimeout(() => (b.textContent = "Copy events"), 1200);
  }).catch(() => alert("Copy failed."));
}

/* ---------- birth form ---------- */
function openBirthForm() {
  $("landing").scrollIntoView({ behavior: "smooth" });
  $("birthForm").scrollIntoView({ behavior: "smooth" });
}
function computeBirth() {
  const nakshatra = Number($("bNakshatra").value);
  const rashi = Number($("bRashi").value);
  const place = $("bPlace").value.trim() || "Chennai";
  const lat = parseFloat($("bLat").value);
  const lon = parseFloat($("bLon").value);
  const tz = parseFloat($("bTz").value);
  if (isNaN(nakshatra) || isNaN(rashi) || isNaN(lat) || isNaN(lon) || isNaN(tz)) { alert("Pick your janma nakshatra and enter valid panchang coordinates."); return; }
  birth = { nakshatra, rashi, place, lat, lon, tz };
  save(LS.birth, birth);
  $("landing").hidden = true;
  render();
}

/* ---------- Quick Selector Presets (chip logic) ---------- */
function loadCustomPresets() {
  try { return JSON.parse(localStorage.getItem(LS_PRESETS)) || []; } catch { return []; }
}
function saveCustomPresets(arr) {
  localStorage.setItem(LS_PRESETS, JSON.stringify(arr));
}
function allPresets() {
  return [...DEFAULT_PRESETS, ...loadCustomPresets()];
}

/* Render chip buttons into #presetChips. Each chip carries data-domain/sub/task.
   Active state = matches current dropdown values. Custom chips get an × dismiss. */
function renderPresetChips() {
  const wrap = $("presetChips");
  if (!wrap) return;
  const muhDomain = $("muhDomain");
  const muhSub = $("muhSub");
  const muhTask = $("muhTask");
  const curDomain = muhDomain.value;
  const curSub = muhSub.value;
  const curTask = muhTask.value;

  const presets = allPresets();
  wrap.innerHTML = "";
  presets.forEach((p, i) => {
    const isActive = p.domain === curDomain && p.sub === curSub && p.task === curTask;
    const isCustom = i >= DEFAULT_PRESETS.length;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "preset-chip" + (isActive ? " active" : "");
    btn.dataset.domain = p.domain;
    btn.dataset.sub = p.sub;
    btn.dataset.task = p.task;
    const lbl = document.createTextNode(p.label);
    btn.appendChild(lbl);
    if (isCustom) {
      const x = document.createElement("span");
      x.className = "pc-x";
      x.dataset.idx = String(i - DEFAULT_PRESETS.length);
      x.innerHTML = "&times;";
      btn.appendChild(x);
    }
    btn.addEventListener("click", (e) => {
      /* If the × was clicked, remove the custom preset instead of applying */
      const x = e.target.closest(".pc-x");
      if (x) {
        e.stopPropagation();
        const idx = parseInt(x.dataset.idx, 10);
        const customs = loadCustomPresets();
        customs.splice(idx, 1);
        saveCustomPresets(customs);
        renderPresetChips();
        return;
      }
      applyPreset(p);
    });
    wrap.appendChild(btn);
  });
}

/* Apply a preset: set all 3 dropdowns through the cascade, sync state, refresh UI. */
function applyPreset(preset) {
  const muhDomain = $("muhDomain");
  const muhSub = $("muhSub");
  const muhTask = $("muhTask");

  muhDomain.value = preset.domain;
  /* Trigger cascade fill manually (same logic as the change listener) */
  const subs = TAX.subDomains(preset.domain);
  muhSub.innerHTML = '<option value="" disabled selected>Please select</option>';
  subs.forEach((s) => muhSub.insertAdjacentHTML("beforeend", `<option value="${s.code}">${s.name}</option>`));
  muhSub.value = preset.sub;

  const tasks = TAX.activities(preset.domain, preset.sub);
  muhTask.innerHTML = '<option value="" disabled selected>Please select</option>';
  tasks.forEach((t) => muhTask.insertAdjacentHTML("beforeend", `<option value="${t.activity_id}">${t.activity_name}</option>`));
  muhTask.value = preset.task;

  /* Sync intent + UI */
  view.activity = preset.task;
  save(LS.view, view);
  renderPresetChips();
  refreshSourceBtn();
  clearMuhurta();
}

/* Save the current dropdown state as a custom preset (prompt for label). */
function promptSavePreset() {
  const muhDomain = $("muhDomain");
  const muhSub = $("muhSub");
  const muhTask = $("muhTask");
  if (!muhDomain.value || !muhSub.value || !muhTask.value) return;

  const taskSel = $("muhTask");
  const defaultLabel = taskSel.options[taskSel.selectedIndex]?.text || "Custom";
  const label = prompt("Name this quick pick:", defaultLabel);
  if (!label || !label.trim()) return;

  const customs = loadCustomPresets();
  /* Deduplicate: remove any custom preset with the same task id */
  const filtered = customs.filter((c) => c.task !== muhTask.value);
  filtered.push({ label: label.trim(), domain: muhDomain.value, sub: muhSub.value, task: muhTask.value });
  saveCustomPresets(filtered);
  renderPresetChips();
}

function applyCardShades() {
  let light = true;
  const cards = document.querySelectorAll(".card");
  for (const el of cards) {
    if (el.id === "landing") { el.classList.add("panel-a"); continue; }
    el.classList.add(light ? "panel-a" : "panel-b");
    light = !light;
  }
}

async function init() {
  applyCardShades();
  const t = load(LS.theme, "day");
  setTheme(t === "night");
  view = { ...view, ...load(LS.view, {}) };

  // populate muhurta selection cascade: domain → activity (sub-domain) → sub-activity/task
  TAX = await loadTaxonomy();
  try{ GOCHARA_RULES = await fetch("./rules/gochara_rules.json").then(r=>r.json()); }catch(e){ console.warn("gochara rules failed",e); }
  try{ TN_HOLIDAYS = await fetch("./rules/tn_holidays.json").then(r=>r.json()); }catch(e){ console.warn("tn holidays failed",e); }
  try{ TN_BBOX = await fetch("./rules/tn_bbox.json").then(r=>r.json()); }catch(e){ console.warn("tn bbox failed",e); }
  try{ SIDDHAR_PUJAS = await fetch("./rules/siddhar_pujas.json").then(r=>r.json()); }catch(e){ console.warn("siddhar pujas failed",e); }
  try{
    NITYA_DEVIS = await fetch("./rules/nitya_devis.json").then(r=>r.json());
    if (NITYA_DEVIS && NITYA_DEVIS.entries) {
      NITYA_BY_KEY = Object.fromEntries(NITYA_DEVIS.entries.map(e => [e.key, e]));
    }
  }catch(e){ console.warn("nitya devis failed",e); }
  try{ TIRUMANDIRAM = await fetch("./rules/tirumandiram_daily.json").then(r=>r.json()); }catch(e){ console.warn("tirumandiram daily failed",e); }
  renderVerseCard();
  // verse card interactions
  const vCopy=$("verseCopy"), vPrev=$("versePrev"), vNext=$("verseNext");
  if(vCopy) vCopy.addEventListener("click", ()=>{
    const body=$("verseBody");
    const txt = body ? body.innerText : "";
    if(!txt) return;
    const done=()=>{ vCopy.textContent="Copied!"; setTimeout(()=>vCopy.textContent="Copy verse",1400); };
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
    else { const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); try{document.execCommand("copy");}catch(e){} ta.remove(); done(); }
  });
  if(vPrev) vPrev.addEventListener("click", ()=>{ verseOffset--; renderVerseCard(); });
  if(vNext) vNext.addEventListener("click", ()=>{ verseOffset++; renderVerseCard(); });
  try{ IN_CITIES = await fetch("./rules/in_cities.json").then(r=>r.json()); }catch(e){ console.warn("in_cities failed",e); }
  initCitySelector();
  const muhDomain = $("muhDomain");
  const muhSub = $("muhSub");
  const muhTask = $("muhTask");
  const PH = '<option value="" disabled selected>Please select</option>';
  const fillSubs = () => {
    const subs = TAX.subDomains(muhDomain.value);
    muhSub.innerHTML = "";
    muhSub.insertAdjacentHTML("beforeend", PH);
    subs.forEach((s) => muhSub.insertAdjacentHTML("beforeend", `<option value="${s.code}">${s.name}</option>`));
  };
  const fillTasks = () => {
    const tasks = muhSub.value ? TAX.activities(muhDomain.value, muhSub.value) : [];
    muhTask.innerHTML = "";
    muhTask.insertAdjacentHTML("beforeend", PH);
    tasks.forEach((t) => muhTask.insertAdjacentHTML("beforeend", `<option value="${t.activity_id}">${t.activity_name}</option>`));
  };
  muhDomain.insertAdjacentHTML("beforeend", PH);
  TAX.domains().forEach((d) => muhDomain.insertAdjacentHTML("beforeend", `<option value="${d.code}">${d.name}</option>`));
  // Dropdown changes only update the INTENT (view) — no computation runs. The muhurta
  // engine triggers ONLY via the Compute Muhurta button, so browsing the cascade to
  // decide an activity never recalculates (owner request 2026-08-13).
  const syncMuhFromDropdowns = () => {
    view.activity = muhTask.value;
    view.mode = muhModeSel.value;
    save(LS.view, view);
  };
  const refreshSourceBtn = () => {
    const on = !!(muhDomain.value && muhSub.value && muhTask.value);
    $("srcBtn").disabled = !on;
    $("srcBtn").title = on ? "Show classical source for this activity" : "Select a domain, activity and sub-activity first";
  };
  const clearMuhurta = () => {
    muhComputed = false;
    $("muhurtas").innerHTML = "";
    $("muhSummary").textContent = "";
    $("muhActName").textContent = "";
    $("muhHint").innerHTML = "Select activity + mode, then press <strong>Compute Muhurta</strong>.";
    $("muhHint").hidden = false;
    $("muhAccBody").innerHTML = "";
    $("muhAccHead").textContent = "Muhurta details — click a Shubh day row";
    $("muhAcc").open = false;
  };
  // Selecting an activity/mode never computes — it only updates the intent and wipes
  // any stale table. Computation happens exclusively via "Compute Muhurta".
  muhDomain.addEventListener("change", () => { fillSubs(); fillTasks(); syncMuhFromDropdowns(); clearMuhurta(); refreshSourceBtn(); });
  muhSub.addEventListener("change", () => { fillTasks(); syncMuhFromDropdowns(); clearMuhurta(); refreshSourceBtn(); });
  muhTask.addEventListener("change", () => { syncMuhFromDropdowns(); clearMuhurta(); refreshSourceBtn(); });
  $("muhCompute").addEventListener("click", () => {
    syncMuhFromDropdowns();
    if (!muhDomain.value || !muhSub.value || !muhTask.value) {
      clearMuhurta();
      $("muhHint").textContent = "Please select a domain, activity and sub-activity, then press Compute Muhurta.";
      return;
    }
    if (!birth) {
      clearMuhurta();
      $("landing").scrollIntoView({ behavior: "smooth" });
      return;
    }
    muhComputed = true;
    $("muhHint").hidden = true;
    render();
  });
  $("muhClear").addEventListener("click", () => {
    muhDomain.value = ""; muhSub.value = ""; muhTask.value = "";
    view.activity = ""; save(LS.view, view);
    clearMuhurta();
    refreshSourceBtn();
    renderPresetChips();
    $("muhCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* Quick Selector Presets — chip rendering + save button */
  renderPresetChips();
  /* Re-render chips whenever any dropdown changes so active state stays in sync */
  muhDomain.addEventListener("change", () => { renderPresetChips(); });
  muhSub.addEventListener("change", () => { renderPresetChips(); });
  muhTask.addEventListener("change", () => { renderPresetChips(); });
  $("presetAdd").addEventListener("click", promptSavePreset);

  /* Classical source modal (§ owner request 2026-08-13) — instant provenance for the
     selected activity, no compute required. */
  const closeSrcModal = () => { $("srcModal").hidden = true; document.body.style.overflow = ""; };
  $("srcBtn").addEventListener("click", () => {
    const act = TAX.getActivity(muhTask.value);
    if (!act) return;
    $("srcTitle").textContent = "Classical source — " + act.activity_name;
    $("srcBody").innerHTML = provenanceBodyHTML(act);
    $("srcModal").hidden = false;
    document.body.style.overflow = "hidden";
  });
  $("srcClose").addEventListener("click", closeSrcModal);
  $("srcModal").addEventListener("click", (e) => { if (e.target === $("srcModal")) closeSrcModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSrcModal(); });
  $("srcCopy").addEventListener("click", () => {
    const act = TAX.getActivity(muhTask.value);
    const cls = act ? TAX.toMuhurta(act).classical : null;
    if (!cls) return;
    const txt = citationText(cls);
    const done = () => { $("srcCopy").textContent = "Copied!"; setTimeout(() => { $("srcCopy").textContent = "Copy citation"; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
    else {
      const ta = document.createElement("textarea");
      ta.value = txt; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); } catch (e) { /* older browsers */ }
      ta.remove(); done();
    }
  });

  // restore saved selection (with legacy migration), else default to first task
  const savedAct = LEGACY_ACTIVITY[view.activity] || view.activity;
  const saved = savedAct && TAX.getActivity(savedAct);
  if (saved) {
    muhDomain.value = saved.domain;
    fillSubs();
    muhSub.value = saved.sub_domain;
    fillTasks();
    muhTask.value = saved.activity_id;
    view.activity = saved.activity_id;
  } else {
    fillSubs(); fillTasks();
    view.activity = muhTask.value;
  }
  save(LS.view, view);
  refreshSourceBtn();
  renderPresetChips();

  // populate selection mode selector (§2.6.7)
  const muhModeSel = $("muhMode");
  Object.entries(SELECTION_MODES).forEach(([key, m]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = m.label;
    if (key === view.mode) opt.selected = true;
    muhModeSel.appendChild(opt);
  });
  muhModeSel.addEventListener("change", () => { view.mode = muhModeSel.value; save(LS.view, view); clearMuhurta(); });

  // initial muhurta state: nothing computed yet, show the compute hint
  clearMuhurta();

  // populate janma nakshatra dropdown (flat 27 list) + rashi select (editable, auto-filled)
  const nakSel = $("bNakshatra");
  NAKSHATRA.forEach((name, n) => {
    const opt = document.createElement("option");
    opt.value = String(n);
    opt.textContent = `${name} (${RASHI[Math.floor((n * 4) / 9) % 12]})`;
    nakSel.appendChild(opt);
  });
  RASHI.forEach((name, i) => $("bRashi").insertAdjacentHTML("beforeend", `<option value="${i}">${name}</option>`));
  nakSel.addEventListener("change", () => {
    const n = Number(nakSel.value);
    $("bRashi").value = String(Math.floor((n * 4) / 9) % 12);
  });

  $("computeBtn").addEventListener("click", computeBirth);
  $("editBirthBtn").addEventListener("click", () => { $("landing").hidden = false; openBirthForm(); });
  const gInfo=$("gocharaInfoBtn"); if(gInfo) gInfo.addEventListener("click", ()=>{
    const body=$("srcBody"), title=$("srcTitle"), modal=$("srcModal");
    if(!body||!modal) return;
    title.textContent="Gochara — classical source";
    body.innerHTML=`<div class="prov-item"><div class="prov-ref">Bṛhat Parāśara Horā Śāstra Ch.30-32 · Sārāvalī / Phaladīpikā Ch.26</div><div class="prov-en">Gochara house favourability counted from janma rāśi (natal Moon). Each transit row shows the house (Candrabala) + Tārā (Sampat/Vipat…) — the two filters panchang users know. Vedha obstructs śubha when the vedha planet is in its vedha house at the same instant.</div><div class="prov-logic">Source files: rules/gochara_rules.json (84 rows) + reference/provenance_registry.json chapter gochara_bphs (131 verses). Moon excluded (2.5d cadence, owner 2026-09-02). No invented phala.</div></div>`;
    modal.hidden=false;
  });
  $("themeBtn").addEventListener("click", toggleTheme);
  $("navPrev").addEventListener("click", () => nav(-1));
  $("navNext").addEventListener("click", () => nav(1));
  $("printBtn").addEventListener("click", printView);
  $("copyBtn").addEventListener("click", copyDayEvents);
  $("icsBtn").addEventListener("click", () => {
    if (!birth) { alert("Compute a calendar first."); return; }
    const { y: yy, m: mm } = isoToYMD(view.anchor);
    const start = `${yy}-${String(mm).padStart(2, "0")}-01`;
    const end = `${yy}-${String(mm).padStart(2, "0")}-${new Date(yy, mm, 0).getDate()}`;
    buildICS(start, end).then((ics) => {
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `muhurta-${start}-to-${end}.ics`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  });

  swe = await new Engine().init();

  const savedBirth = load(LS.birth, null);
  if (savedBirth && Number.isInteger(savedBirth.nakshatra)) {
    if (!Number.isInteger(savedBirth.rashi)) {
      // migrate old birth records (had pada, no rashi field)
      const pada = Number.isInteger(savedBirth.pada) ? savedBirth.pada : 1;
      savedBirth.rashi = Math.floor((savedBirth.nakshatra * 4 + (pada - 1)) / 9) % 12;
    }
    birth = savedBirth;
    $("bNakshatra").value = String(birth.nakshatra);
    $("bRashi").value = String(birth.rashi);
    $("bPlace").value = birth.place || "";
    $("bLat").value = birth.lat;
    $("bLon").value = birth.lon;
    $("bTz").value = birth.tz;
    $("landing").hidden = true;
    render();
  }
}

init();
