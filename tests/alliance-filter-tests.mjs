/* alliance-filter-tests.mjs — unit tests for the Alliance Filter module.
 * Self-contained: imports marriage.mjs (for calculateAshtakoota) + rules directly.
 * Validates generateValidProfiles, computeAllianceWhitelist, toCSV, toJSON.
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  generateValidProfiles,
  computeAllianceWhitelist,
  toCSV,
  toJSON,
} from "../alliance-filter.mjs";
import { calculateAshtakoota } from "../marriage.mjs";

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

console.log("\n=== ALLIANCE FILTER TESTS ===");

/* ---------- generateValidProfiles ---------- */
console.log("\n--- generateValidProfiles ---");
const profiles = generateValidProfiles();
t("returns 108 profiles", profiles.length === 108, `got ${profiles.length}`);
t("all nakshatras 1..27 present", new Set(profiles.map(p => p.nakshatra)).size === 27);
t("all rashis 1..12 present", new Set(profiles.map(p => p.rashi)).size === 12);
t("all padas 1..4 present", new Set(profiles.map(p => p.pada)).size === 4);
t("each profile has valid nak/rashi/pada ranges", profiles.every(p => p.nakshatra >= 1 && p.nakshatra <= 27 && p.rashi >= 1 && p.rashi <= 12 && p.pada >= 1 && p.pada <= 4));
t("exactly 4 padas per nakshatra", Array.from({length:27},(_,i)=>i+1).every(nak => profiles.filter(p=>p.nakshatra===nak).length === 4));
t("no duplicate (nak,rashi,pada) triples", new Set(profiles.map(p => `${p.nakshatra},${p.rashi},${p.pada}`)).size === 108);

// Spot-check known astronomical mappings
// Ashwini (nak=1) starts at 0°, spans 0-13.333°. All 4 padas in Mesha (rashi=1)
const ashwini = profiles.filter(p => p.nakshatra === 1);
t("Ashwini all 4 padas in Mesha (rashi=1)", ashwini.every(p => p.rashi === 1), `got rashis: ${ashwini.map(p=>p.rashi).join(",")}`);

// Bharani (nak=2) 13.333-26.666°, all in Mesha
const bharani = profiles.filter(p => p.nakshatra === 2);
t("Bharani all 4 padas in Mesha (rashi=1)", bharani.every(p => p.rashi === 1));

// Krittika (nak=3) 26.666-40° — spans Mesha (26.666-30) and Vrishabha (30-40)
// Pada 1 ends exactly at 30°, so only pada 1 is in Mesha; padas 2-4 in Vrishabha
const krittika = profiles.filter(p => p.nakshatra === 3).sort((a,b)=>a.pada-b.pada);
t("Krittika pada 1 in Mesha, padas 2-4 in Vrishabha", krittika[0].rashi===1 && krittika[1].rashi===2 && krittika[2].rashi===2 && krittika[3].rashi===2, `got: ${krittika.map(p=>p.rashi).join(",")}`);

// Rohini (nak=4) 40-53.333°, all in Vrishabha
const rohini = profiles.filter(p => p.nakshatra === 4);
t("Rohini all 4 padas in Vrishabha (rashi=2)", rohini.every(p => p.rashi === 2));

sum("GENERATE_VALID_PROFILES");

/* ---------- computeAllianceWhitelist ---------- */
console.log("\n--- computeAllianceWhitelist ---");

// Fixed person: Groom, Ashwini (1), Mesha (1), Pada 1
const fixedGroom = { role: "groom", nakshatra: 1, rashi: 1, pada: 1 };
const wl = computeAllianceWhitelist(fixedGroom, rules, { topN: 18, minScore: 18 });

t("returns whitelist object with schema", wl.schema === "alliance-whitelist-v1");
t("fixedPerson echoed correctly", wl.fixedPerson.nakshatra === 1 && wl.fixedPerson.rashi === 1 && wl.fixedPerson.pada === 1 && wl.fixedPerson.role === "groom");
t("ranking contains only compatible profiles", wl.ranking.every(r => r.isCompatible));
t("ranking length <= topN and <= compatibleCount", wl.ranking.length <= 18 && wl.ranking.length <= wl.summary.compatibleCount);
t("ranking is sorted: marriage nakshatra rows precede non-marriage nakshatra rows", (() => {
  let sawNonMarriage = false;
  for (const r of wl.ranking) {
    if (!r.birthNakInMarriageList) sawNonMarriage = true;
    if (sawNonMarriage && r.birthNakInMarriageList) return false;
  }
  return true;
})());
t("ranking is sorted: score non-increasing within marriage-nakshatra group", (() => {
  return wl.ranking.every((r, i) => {
    if (i === 0) return true;
    const prev = wl.ranking[i - 1];
    // Only require score non-increasing when both are in the same marriage-nakshatra group
    if (prev.birthNakInMarriageList === r.birthNakInMarriageList) return r.totalScore <= prev.totalScore;
    return true;
  });
})());
t("summary counts valid", wl.summary.validProfiles === 108 && wl.summary.candidatePairs === 36);
t("summary compatibleCount matches compatible.length", wl.summary.compatibleCount === wl.compatible.length);
t("summary maxScore >= 0", wl.summary.maxScore >= 0);
t("all ranking rows have required fields", wl.ranking.every(r => typeof r.rank==="number" && typeof r.totalScore==="number" && typeof r.isCompatible==="boolean" && typeof r.nakshatra==="number" && typeof r.rashi==="number" && typeof r.bestPada==="number"));
t("ranks are sequential 1-based", wl.ranking.every((r, i) => r.rank === i + 1));
t("tierLabel present on all rows", wl.ranking.every(r => r.tierLabel !== undefined));
t("birthNakInMarriageList boolean", wl.ranking.every(r => typeof r.birthNakInMarriageList === "boolean"));
t("provenance string present", typeof wl.provenance === "string" && wl.provenance.includes("Chapter 6"));

// Check marriage nakshatra flag for known marriage nakshatras
const mrigaRow = wl.ranking.find(r => r.nakshatra === 5); // Mrigashira
t("Mrigashira flagged as marriage nakshatra", mrigaRow && mrigaRow.birthNakInMarriageList === true);
const ashwiniRow = wl.ranking.find(r => r.nakshatra === 1); // Ashwini
t("Ashwini NOT flagged as marriage nakshatra", ashwiniRow && ashwiniRow.birthNakInMarriageList === false);

// Verify pada-agnostic best: for a given (nak, rashi), bestPada should be the one with highest score
// We can't easily verify without re-running calculateAshtakoota, but we trust the logic

sum("COMPUTE_ALLIANCE_WHITELIST");

/* ---------- Bride as fixed person ---------- */
console.log("\n--- computeAllianceWhitelist (Bride fixed) ---");
const fixedBride = { role: "bride", nakshatra: 4, rashi: 2, pada: 1 }; // Rohini, Vrishabha
const wlBride = computeAllianceWhitelist(fixedBride, rules, { topN: 18, minScore: 18 });
t("Bride role works", wlBride.fixedPerson.role === "bride" && wlBride.fixedPerson.nakshatra === 4 && wlBride.fixedPerson.rashi === 2);
t("Bride ranking populated", wlBride.ranking.length === 18);
sum("BRIDE_FIXED");

/* ---------- Input validation ---------- */
console.log("\n--- Input validation ---");
try {
  computeAllianceWhitelist({ role: "groom", nakshatra: 1, rashi: 2, pada: 1 }, rules); // Ashwini in Vrishabha = invalid
  t("Invalid nak/rashi/pada throws", false);
} catch (e) {
  t("Invalid nak/rashi/pada throws", e.message.includes("inconsistent"));
}
sum("INPUT_VALIDATION");

/* ---------- toCSV ---------- */
console.log("\n--- toCSV ---");
const csv = toCSV(wl);
t("CSV has header", csv.startsWith("rank,nakshatra,rashi,bestPada,totalScore,scorePercentage,tierLabel,isCompatible,nadiDosha,bhakootDosha,pariharas,birthNakInMarriageList"));
const csvLines = csv.trim().split("\n");
t("CSV line count = 1 header + topN rows", csvLines.length === 1 + wl.ranking.length);
t("CSV first data row has 12 columns", csvLines[1].split(",").length === 12);
sum("TO_CSV");

/* ---------- toJSON ---------- */
console.log("\n--- toJSON ---");
const jsonStr = toJSON(wl);
t("JSON parses back", (() => { try { JSON.parse(jsonStr); return true; } catch { return false; } })());
t("JSON contains whitelist structure", jsonStr.includes("alliance-whitelist-v1") && jsonStr.includes("fixedPerson") && jsonStr.includes("ranking"));
sum("TO_JSON");

/* ---------- Integration: verify scores match calculateAshtakoota ---------- */
console.log("\n--- Score integration check ---");
// Pick a few rows from whitelist and verify the score matches calculateAshtakoota
for (const row of wl.ranking.slice(0, 5)) {
  const candidate = { nakshatra: row.nakshatra, rashi: row.rashi, pada: row.bestPada };
  const [groom, bride] = fixedGroom.role === "groom" ? [fixedGroom, candidate] : [candidate, fixedGroom];
  const match = calculateAshtakoota(groom, bride, rules);
  t(`Row rank ${row.rank} score matches calculateAshtakoota`, match.totalScore === row.totalScore, `whitelist=${row.totalScore} vs engine=${match.totalScore}`);
}
sum("SCORE_INTEGRATION");

/* ---------- Edge case: minScore filter ---------- */
console.log("\n--- minScore filter ---");
const wlHigh = computeAllianceWhitelist(fixedGroom, rules, { topN: 18, minScore: 31 });
t("Higher minScore reduces compatible count", wlHigh.summary.compatibleCount <= wl.summary.compatibleCount);
t("All compatible rows meet minScore", wlHigh.compatible.every(r => r.totalScore >= 31));
sum("MIN_SCORE_FILTER");

/* ---------- Marriage nakshatra preference ---------- */
console.log("\n--- Marriage nakshatra preference ---");
const wlAll = computeAllianceWhitelist(fixedGroom, rules, { topN: 999, minScore: 18 });
t("Top row is a marriage nakshatra (when any compatible marriage-nak exists)", (() => {
  const hasMarriageNak = wlAll.compatible.some(r => r.birthNakInMarriageList);
  if (!hasMarriageNak) return true; // vacuously true
  return wlAll.ranking[0].birthNakInMarriageList === true;
})());
t("Marriage-nakshatra compatible rows precede non-marriage rows", (() => {
  let sawNonMarriage = false;
  for (const r of wlAll.ranking) {
    if (!r.birthNakInMarriageList) sawNonMarriage = true;
    if (sawNonMarriage && r.birthNakInMarriageList) return false;
  }
  return true;
})());
t("topN=999 returns all compatible rows", wlAll.ranking.length === wlAll.compatible.length);
sum("MARRIAGE_NAKSHATRA_PREFERENCE");

console.log(`\nAlliance Filter suite: ${total} pass / ${totalF} fail`);
process.exitCode = totalF ? 1 : 0;