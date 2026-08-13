/* marriage-tests.mjs — unit + integration tests for the Vivaha Muhurta engine.
 * Self-contained: imports engine.js (swisseph) + marriage.mjs + rules directly.
 * Synthetic day fixtures exercise dosha/day-filter logic deterministically;
 * the final [SCAN] block runs the real engine for a Nov-2026 window. */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Engine } from "../engine.js";
import {
  calculateAshtakoota,
  evaluateVivahaDoshas,
  personalFilters,
  scoreWeddingDay,
  scanWeddingWindow,
  loadRules,
} from "../marriage.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const rules = JSON.parse(fs.readFileSync(path.join(ROOT, "rules/marriage_rules.json"), "utf8"));
let pass = 0, fail = 0, total = 0, totalF = 0;
function t(name, cond, extra = "") {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL: ${name} ${extra}`); }
}
function sum(tag) {
  console.log(`[${tag}] ${pass} pass / ${fail} fail`);
  total += pass; totalF += fail; pass = 0; fail = 0;
}

// ---- Stage 1 fixtures (1-based indices) ----
const COMPAT29 = { groom: { nakshatra: 1, rashi: 1, pada: 1 }, bride: { nakshatra: 4, rashi: 4, pada: 1 } };
const NADI_PARIHARA = { groom: { nakshatra: 1, rashi: 1, pada: 1 }, bride: { nakshatra: 6, rashi: 1, pada: 2 } };
const NADI_ACTIVE = { groom: { nakshatra: 1, rashi: 1, pada: 1 }, bride: { nakshatra: 7, rashi: 3, pada: 1 } };
const BHAKOOT_ACTIVE = { groom: { nakshatra: 1, rashi: 1, pada: 1 }, bride: { nakshatra: 2, rashi: 2, pada: 1 } };
const BHAKOOT_PARIHARA = { groom: { nakshatra: 1, rashi: 1, pada: 1 }, bride: { nakshatra: 2, rashi: 5, pada: 1 } };

/* ======================= STAGE 1 — ASHTAKOOTA ======================= */
console.log("\n=== STAGE 1: Ashtakoota kootas & pariharas ===");

t("COMPAT29 compatible", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  return m.isCompatible && m.totalScore === 29 && m.maxScore === 36;
})());
t("COMPAT29 no hard-blocker doshas", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  return !m.hasNadiDosha && !m.hasBhakootDosha && !m.isNadiCanceled && !m.isBhakootCanceled;
})());
t("COMPAT29 exact koota breakdown", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  const b = m.breakdown;
  return b.varna.score === 1 && b.vashya.score === 0.5 && b.tara.score === 1.5 &&
         b.yoni.score === 2 && b.maitri.score === 4 && b.gana.score === 5 &&
         b.bhakoot.score === 7 && b.nadi.score === 8;
})());
t("COMPAT29 below-18 couple is incompatible", (() => {
  // Same-nadi, no parihara possible -> score 13.5, dosha active, rejected.
  const m = calculateAshtakoota(NADI_ACTIVE.groom, NADI_ACTIVE.bride, rules);
  return !m.isCompatible && m.hasNadiDosha && !m.isNadiCanceled && m.totalScore < 18;
})());
t("COMPAT29 bhakoot dosha present + uncanceled", (() => {
  const m = calculateAshtakoota(BHAKOOT_ACTIVE.groom, BHAKOOT_ACTIVE.bride, rules);
  // Mesha(1)->Vrishabha(2) = 1 step = 2-12 house; Mars/Venus neutral -> no parihara
  return m.hasBhakootDosha && !m.isBhakootCanceled && !m.isCompatible;
})());
t("COMPAT29 bhakoot parihara cancels (lord friendship)", (() => {
  const m = calculateAshtakoota(BHAKOOT_PARIHARA.groom, BHAKOOT_PARIHARA.bride, rules);
  // Mesha(1)->Simha(5) = 4 steps = 5-9 house; Mars+Sun are mutual friends -> cancelled
  return m.isBhakootCanceled && !m.hasBhakootDosha && m.isCompatible;
})());
t("COMPAT29 nadi parihara (same-rashi, diff-star) restores nadi", (() => {
  const m = calculateAshtakoota(NADI_PARIHARA.groom, NADI_PARIHARA.bride, rules);
  // nak1 & nak6 both ADI, same Mesha rashi, diff star -> Rashi Abheda parihara
  return m.isNadiCanceled && !m.hasNadiDosha && m.totalScore === 31.5 && m.isCompatible;
})());
t("COMPAT29 varna score 1 when groom grade >= bride", (() => {
  const m1 = calculateAshtakoota({ nakshatra: 1, rashi: 1, pada: 1 }, { nakshatra: 1, rashi: 1, pada: 1 }, rules);
  return m1.breakdown.varna.score === 1; // Mesha(2) >= Mesha(2) -> 1
})());
t("COMPAT29 gana DEVA-groom vs MANUSHYA-bride = 5", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  // groom nak1=DEVA, bride nak4=MANUSHYA (MANUSHYA:[2,4,6,...])
  return m.breakdown.gana.score === 5;
})());
t("COMPAT29 maitri score 4 (Mars vs Moon: friend/neutral)", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  // rashi1=Mars, rashi4=Moon. Mars friends Moon; Moon does NOT friend Mars -> friend-neutral
  return m.breakdown.maitri.score === 4;
})());
t("COMPAT29 yoni 2 (Horse vs Serpent neutral)", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  // nak1=yoni1 Horse; nak4=yoni4 Serpent -> matrix[0][3]=2
  return m.breakdown.yoni.score === 2;
})());
t("COMPAT29 tara score 1.5 (one auspicious incl remainder-1 rule)", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  return m.breakdown.tara.score === 1.5;
})());
t("COMPAT29 provenance cites 2 koota verse keys", (() => {
  const m = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);
  return m.provenance.source.includes("Chapter 6") &&
         m.provenance.verseKeys.length === 2 &&
         m.provenance.verseKeys.includes("VIVAHA_MELAPAKA_36_GUNA");
})());
sum("STAGE1");

/* ================= STAGE 2: VIVAHA DOSHAS (synthetic days) ================= */
function dayBase(extra = {}) {
  return {
    iso: "2026-11-25", y: 2026, mo: 11, d: 25,
    vara: 1, tithiIndex: 0, moonNakshatra: 4, moonRashi: 0,
    yoga: { index: 23, name: "Sobhana" }, sankranti: false,
    combustion: { guru: false, shukra: false }, bhadra: null,
    lagnaRashi: 0, sunNakshatra: 0,
    planets: { Sun: { nakshatra: 1, rashi: 1 }, Moon: { nakshatra: 2, rashi: 2 } },
    ...extra,
  };
}

console.log("\n=== STAGE 2: Vivaha doshas (synthetic) ===");

t("Latta: Sun kicks marriage nak to star 4", (() => {
  // marriage nak = day.moonNakshatra = 4; Sun at star 19 -> (19+12)%27 = 4 -> LATTA
  const day = dayBase({ planets: { Sun: { nakshatra: 19, rashi: 1 } } });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return res.isMarriageBlocked && res.activeDoshas.some((d) => d.code === "LATTA_DOSHA");
})());
t("Jamitra: malefic Mars in 7th from lagna (lagna=0 -> rashi 6)", (() => {
  const day = dayBase({ lagnaRashi: 0, planets: { Mars: { nakshatra: 0, rashi: 6 } } });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return res.isMarriageBlocked && res.activeDoshas.some((d) => d.code === "JAMITRA_DOSHA");
})());
t("Jamitra removal: only benefics in 7th (Moon+Jupiter at rashi 6)", (() => {
  const day = dayBase({ lagnaRashi: 0, planets: { Moon: { nakshatra: 0, rashi: 6 }, Jupiter: { nakshatra: 0, rashi: 6 } } });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return !res.isMarriageBlocked && res.appliedRemovals.some((r) => r.code === "JAMITRA_DOSHA");
})());
t("Paata: yoga index 16 (Vyatipata) is a paata yoga", (() => {
  const day = dayBase({ yoga: { index: 16, name: "Vyatipata" } });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return res.isMarriageBlocked && res.activeDoshas.some((d) => d.code === "PATA_DOSHA");
})());
t("Paata: clean yoga (index 23) -> no paata", (() => {
  const day = dayBase({ yoga: { index: 23, name: "Sobhana" } });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return !res.activeDoshas.some((d) => d.code === "PATA_DOSHA");
})());
t("Ekargala: bad yoga (index 0) + moon odd-count from sun", (() => {
  // sunNak=0, moonNak=2 -> count = ((2-0)%27)+1 = 3 (odd) -> EKARGALA
  const day = dayBase({ yoga: { index: 0, name: "Vishkambha" }, sunNakshatra: 0, moonNakshatra: 2 });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return res.isMarriageBlocked && res.activeDoshas.some((d) => d.code === "EKARGALA_DOSHA");
})());
t("Ekargala: bad yoga but moon even-count -> not active", (() => {
  // sunNak=0, moonNak=1 -> count=2 (even) -> no ekargala
  const day = dayBase({ yoga: { index: 0, name: "Vishkambha" }, sunNakshatra: 0, moonNakshatra: 1 });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return !res.activeDoshas.some((d) => d.code === "EKARGALA_DOSHA");
})());
t("Removal rule: Sun+Moon strong in Lagna destroy latta", (() => {
  // Sun kick lands on marriage nak (19+12=31%27=4); Sun & Moon both at rashi 0 = lagna -> removal clears it
  const day = dayBase({
    lagnaRashi: 0, moonNakshatra: 4, moonRashi: 0,
    planets: { Sun: { nakshatra: 19, rashi: 0 }, Moon: { nakshatra: 1, rashi: 0 } },
  });
  const res = evaluateVivahaDoshas(day, COMPAT29, rules);
  return !res.isMarriageBlocked && res.appliedRemovals.some((r) => r.code === "DOSHA_REMOVAL_SUN_MOON_LAGNA");
})());
sum("STAGE2-DOSHA");

/* ================= STAGE 2: DAY FILTERS (scoreWeddingDay) ================= */
console.log("\n=== STAGE 2: day filters + personal + scoring ===");

const cleanMatch = calculateAshtakoota(COMPAT29.groom, COMPAT29.bride, rules);

t("Clean synthetic day -> SHUBH 87", (() => {
  const day = dayBase();
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  // 75 + (29/36)*15 = 75 + 12.083 = 87.08 -> 87
  return res.status === "SHUBH" && res.score === 87 && res.stage === "PASSED";
})());
t("Forbidden tithi group RIKTA (tithiIndex 3 -> cycle 4) rejects", (() => {
  const day = dayBase({ tithiIndex: 3 });
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.blockers.some((b) => b.includes("Tithi"));
})());
t("Forbidden vara Sun (vara 0) rejects", (() => {
  const day = dayBase({ vara: 0 });
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.blockers.some((b) => b.includes("Vara"));
})());
t("Forbidden nakshatra (star 1, 0-based 0) rejects", (() => {
  const day = dayBase({ moonNakshatra: 0 }); // 0-based 0 -> nak 1, not in allowed [5,13,...]
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.blockers.some((b) => b.includes("Nakshatra"));
})());
t("Personal (direct): groom Ashtama Chandra (moonRashi 7 from rashi 1) detected", (() => {
  const issues = personalFilters({ moonNakshatra: 4, moonRashi: 7 }, COMPAT29);
  return issues.some((p) => p.partner === "groom" && p.type === "ASHTAMA_CHANDRA");
})());
t("Personal (direct): groom Naidhana Tara (moonNak 0-based 6, groom nak 1) detected", (() => {
  // count = ((6 - (1-1)) % 27) + 1 = 7 -> taraNum = ((7-1)%9)+1 = 7 -> Naidhana
  const issues = personalFilters({ moonNakshatra: 6, moonRashi: 0 }, COMPAT29);
  return issues.some((p) => p.partner === "groom" && p.type === "NAIDHANA_TARA");
})());
t("Personal (direct): clean day -> no issues", (() => {
  const issues = personalFilters({ moonNakshatra: 4, moonRashi: 0 }, COMPAT29);
  return issues.length === 0;
})());
t("Personal: groom Ashtama Chandra via scoreWeddingDay rejects", (() => {
  // moonNak=4 (allowed), moonRashi=7 -> ashtama; override planets so Sun (rashi0) is not in 7th-from-Moon (7th=1)
  const day = dayBase({ moonRashi: 7, planets: { Sun: { nakshatra: 1, rashi: 0 }, Moon: { nakshatra: 2, rashi: 2 } } });
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.personal.some((p) => p.type === "ASHTAMA_CHANDRA");
})());
t("Universal: Bhadra mrityu rejects", (() => {
  const day = dayBase({ bhadra: { loka: "mrityu" } });
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.blockers.some((b) => b.includes("Bhadra"));
})());
t("Universal: Jupiter combustion rejects", (() => {
  const day = dayBase({ combustion: { guru: true, shukra: false } });
  const res = scoreWeddingDay(day, COMPAT29, cleanMatch, rules);
  return res.status === "REJECTED" && res.blockers.some((b) => b.includes("Jupiter"));
})());
{
  const gateRes = await scanWeddingWindow(
    { couple: NADI_ACTIVE, startISO: "2026-11-01", endISO: "2026-11-10", geo: [80.27, 13.08, 0] },
    await new Engine().init(),
    rules,
  );
  t("Stage1 gate: incompatible couple skips Stage 2 (skippedStage2)",
    gateRes.skippedStage2 === true && Array.isArray(gateRes.shubh) && gateRes.shubh.length === 0);
}
sum("STAGE2-FILTERS");

/* ================= INTEGRATION: real engine Nov-2026 ======================= */
console.log("\n=== SCAN: real engine Nov 2026 window ===");
const eng = await new Engine().init();
const scanRes = await scanWeddingWindow(
  { couple: COMPAT29, startISO: "2026-11-01", endISO: "2026-11-30", geo: [80.27, 13.08, 0],
    onProgress: () => {} },
  eng, rules,
);
t("Nov scan total = 30", scanRes.total === 30, `got ${scanRes.total}`);
t("Nov scan not skipped (Stage 1 passed)", scanRes.skippedStage2 !== true, `skipped=${scanRes.skippedStage2}`);
t("Nov scan finds SHUBH 2026-11-25 (score >=80)", (() => {
  const s = scanRes.shubh.find((x) => x.iso === "2026-11-25");
  return !!s && s.status === "SHUBH" && s.score >= 80;
})());
t("Nov scan has some rejected", scanRes.rejected > 0, `rejected=${scanRes.rejected}`);
t("Nov 25 shubh day carries Jamitra removal", (() => {
  const s = scanRes.shubh.find((x) => x.iso === "2026-11-25");
  return s && s.doshas.appliedRemovals.some((r) => r.code === "JAMITRA_DOSHA");
})());
sum("SCAN");

console.log(`\nMarriage suite: ${total} pass / ${totalF} fail`);
process.exitCode = totalF ? 1 : 0;
