#!/usr/bin/env node
/* build_provenance.js — generates + validates reference/provenance_registry.json.
 *
 * Reads rules/activity_corpus.json and the hand-authored verses in the registry,
 * generates the per-activity `activities` section from a domain->chapter table,
 * and FAILS on any gap:
 *   - activity_id missing from the registry
 *   - hard-blocker / neutralizer code with no verses entry
 *   - dangling verse_keys
 *
 * Basis tiers (integrity rule — no fabricated citations):
 *   classical         activity is governed by at least one CONFIRMED sloka (proof==="confirmed")
 *   functional_group  mapped via the sevenfold nakshatra classification (Ch.2)
 *   formula           pure panchanga arithmetic (vedic_panchang.pdf)
 *
 * Run: node tools/build_provenance.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS = path.join(ROOT, "rules", "activity_corpus.json");
const REGISTRY = path.join(ROOT, "reference", "provenance_registry.json");

/* Domain -> primary governing chapter (activity-level capstone).
   Domain default basis: classical only where the chapter genuinely governs the
   whole domain class; otherwise functional_group (modern corpus activities). */
const DOMAIN_CHAPTERS = {
  DOM_AGRICULTURE_AGROTECH: { chapter: "ch1", defaultBasis: "functional_group" },
  DOM_AUTOMOTIVE_MANUFACTURING: { chapter: "ch1", defaultBasis: "functional_group" },
  DOM_CORPORATE_FINANCE: { chapter: "ch11", defaultBasis: "classical" },
  DOM_EDUCATION: { chapter: "ch2", defaultBasis: "functional_group" },
  DOM_GOVERNMENT_PUBLIC: { chapter: "ch10", defaultBasis: "functional_group" },
  DOM_HEALTHCARE: { chapter: "ch13", defaultBasis: "classical" },
  DOM_HOSPITALITY: { chapter: "ch6", defaultBasis: "functional_group" },
  DOM_IP_COMPLIANCE: { chapter: "ch10", defaultBasis: "functional_group" },
  DOM_LEGAL: { chapter: "ch10", defaultBasis: "classical" },
  DOM_MARINE_MARITIME: { chapter: "ch8", defaultBasis: "functional_group" },
  DOM_MEDIA_CREATIVE: { chapter: "ch2", defaultBasis: "functional_group" },
  DOM_MINING_METALS: { chapter: "ch1", defaultBasis: "functional_group" },
  DOM_PERSONAL_FINANCE: { chapter: "ch11", defaultBasis: "classical" },
  DOM_PETROLEUM_GAS: { chapter: "ch1", defaultBasis: "functional_group" },
  DOM_REAL_ESTATE_CONSTRUCTION: { chapter: "ch6", defaultBasis: "classical" },
  DOM_SAMSKARAS: { chapter: "ch_samskara", defaultBasis: "classical" },
  DOM_STARTUPS: { chapter: "ch10", defaultBasis: "functional_group" },
  DOM_TRAVEL_TOURISM: { chapter: "ch8", defaultBasis: "classical" },
};

const FALLBACK_CHAPTER = { chapter: "ch1", defaultBasis: "functional_group" };

function load(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function main() {
  const corpus = load(CORPUS);
  const registry = load(REGISTRY);
  const verses = registry.verses || {};
  const errors = [];

  const activities = {};
  const byBasis = { classical: 0, functional_group: 0, formula: 0 };

  for (const act of corpus.activities || []) {
    const id = act.activity_id;
    const dm = DOMAIN_CHAPTERS[act.domain] || FALLBACK_CHAPTER;

    const blockerCodes = (act.hard_blockers || []).map((b) => b.code);
    const neutralizerCodes = ((act.cancellation_overrides || [])
      .flatMap((o) => o.neutralized_by || [])).filter((n, i, a) => a.indexOf(n) === i);

    const allCodes = [...new Set([...blockerCodes, ...neutralizerCodes])];
    const codeVerses = allCodes.map((c) => verses[c] || null);
    for (const c of allCodes) {
      if (!verses[c]) errors.push(`missing verses entry for code ${c} (used by ${id})`);
    }

    // verse_keys: the rule verses that govern this activity + structural bases
    const verseKeys = [...allCodes];
    const fg = (act.baseline_constraints && act.baseline_constraints.functional_group) || "";
    if (fg) verseKeys.push("NAKSHATRA_GROUP");
    const forb = (act.baseline_constraints && act.baseline_constraints.forbidden_tithi_groups) || [];
    if (forb.includes("RIKTA")) verseKeys.push("TITHI_GROUP");
    if ((act.badKaranas || []).includes(6)) verseKeys.push("VISHTI_KARANA");
    verseKeys.push("FORMULA_PANCHANGA");

    // Determine the *governing* confirmed categorical verse (if any). The universal
    // BHADRA_EARTH_ACTIVE hard blocker is excluded: it applies to nearly every activity
    // and must not promote a modern activity to "classical" basis on its own.
    const CATEGORICAL_CONFIRMED = new Set([
      "ASTA_GURU_ACTIVE", "ASTA_SHUKRA_ACTIVE", "TUESDAY_ACTIVE",
      "DISHA_SHOOLA_ACTIVE", "SARVARTHA_SIDDHI_YOGA", "TITHI_GROUP",
    ]);
    const hasCategoricalConfirmed = verseKeys.some(
      (k) => verses[k] && verses[k].proof === "confirmed" && CATEGORICAL_CONFIRMED.has(k),
    );

    // basis: a categorical confirmed sloka => classical; else domain default but never
    // promoted by the universal Bhadra rule.
    let basis = hasCategoricalConfirmed ? "classical" : dm.defaultBasis;
    if (basis !== "classical" && !fg) basis = "formula";
    // classical default but only universal-Bhadra confirmed => drop honestly
    if (basis === "classical" && !hasCategoricalConfirmed) {
      basis = fg ? "functional_group" : "formula";
    }
    byBasis[basis]++;

    const chapterKey = basis === "classical" ? dm.chapter : (basis === "functional_group" ? "ch2" : "panchanga");

    activities[id] = {
      domain: act.domain,
      chapter_key: chapterKey,
      basis,
      verse_keys: [...new Set(verseKeys)],
      rationale: [act.activity_name, fg ? `Group: ${fg}` : null, act.intent]
        .filter(Boolean).join(" · ").slice(0, 300),
    };
  }

  // ---- validation ----
  const corpusIds = new Set((corpus.activities || []).map((a) => a.activity_id));
  for (const id of corpusIds) {
    if (!activities[id]) errors.push(`missing activity entry: ${id}`);
  }
  for (const [id, entry] of Object.entries(activities)) {
    if (!corpusIds.has(id)) errors.push(`activity not in corpus: ${id}`);
    for (const k of entry.verse_keys) {
      if (!verses[k]) errors.push(`dangling verse_key ${k} on ${id}`);
    }
    if (!registry.chapters[entry.chapter_key]) errors.push(`bad chapter_key ${entry.chapter_key} on ${id}`);
  }

  if (errors.length) {
    console.error("PROVENANCE VALIDATION FAILED:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }

  registry.activities = activities;
  registry._counts = {
    activities: Object.keys(activities).length,
    by_basis: byBasis,
    verse_entries: Object.keys(verses).length,
  };
  fs.writeFileSync(REGISTRY, JSON.stringify(registry, null, 2) + "\n");

  console.log("Provenance registry generated OK");
  console.log("  activities:", Object.keys(activities).length, JSON.stringify(byBasis));
  console.log("  verse entries:", Object.keys(verses).length);
}

main();
