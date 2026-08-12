/* taxonomy.js — resolver + adapter for rules/activity_corpus.json.
   Loads the corpus (browser: fetch · Node: fs), indexes it, and exposes:
     - domain / sub-domain / activity listing for the 3-level cascade UI
     - query by id, domain, sub-domain, keyword
     - functional-group inheritance (classical GROUPS table)
     - toMuhurta(activity)  →  scoreMuhurta config shape (data-source swap for app.js)
   Pure ESM — works in the browser and in Node. */
const CORPUS_URL = "rules/activity_corpus.json";
const PROVENANCE_URL = "reference/provenance_registry.json";

/* Classical functional groups -> nakshatras / weekdays (source of truth for
   functional-group inheritance). Mirrors tools/build_corpus.js GROUPS. */
export const GROUPS = {
  sthira:   { key: "sthira",   name: "Sthira / Dhruva (Fixed)", nakshatras: ["ROHINI", "UTTARA_PHALGUNI", "UTTARA_ASHADHA", "UTTARA_BHADRAPADA"], weekdays: ["SUN", "THU"] },
  chara:    { key: "chara",    name: "Chara / Chala (Movable)", nakshatras: ["SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTA", "SHATABHISHA"], weekdays: ["MON", "WED", "FRI"] },
  mridu:    { key: "mridu",    name: "Mridu / Maitra (Tender)", nakshatras: ["MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI"], weekdays: ["FRI", "WED"] },
  kshipra:  { key: "kshipra",  name: "Kshipra / Laghu (Swift)", nakshatras: ["HASTA", "ASHWINI", "PUSHYA"], weekdays: ["THU", "WED"] },
  tikshna:  { key: "tikshna",  name: "Tikshna / Ugra (Sharp)", nakshatras: ["ARDRA", "JYESHTHA", "MULA", "ASHLESHA", "BHARANI"], weekdays: ["SAT", "TUE"] },
};
const GROUP_ALIAS = [
  ["sthira",   ["sthira", "dhruva", "fixed", "urdhvamukhi", "upward", "purna", "fullness", "sankalp"]],
  ["chara",    ["chara", "chala", "movable", "sideways", "circulation", "dynamic", "continuous"]],
  ["mridu",    ["mridu", "maitra", "tender", "gentle", "soft", "jala", "water", "aesthetics", "hospitality"]],
  ["kshipra",  ["kshipra", "laghu", "swift", "quick", "precise", "jaya", "victory"]],
  ["tikshna",  ["tikshna", "ugra", "sharp", "cruel", "agni", "fire"]],
];

/* Canonical tithi-group -> engine tithi indices (0-29). The 5 groups cycle
   over the 15 tithis of each paksha: tithi 1,6,11=Nanda; 2,7,12=Bhadra;
   3,8,13=Jaya; 4,9,14=Rikta; 5,10,15=Purna (both pakshas). AMAVASYA=29, PURNIMA=14. */
const TITHI_GROUP_TO_INDICES = {
  NANDA: [0, 5, 10, 15, 20, 25],
  BHADRA: [1, 6, 11, 16, 21, 26],
  JAYA: [2, 7, 12, 17, 22, 27],
  RIKTA: [3, 8, 13, 18, 23, 28],
  PURNA: [4, 9, 14, 19, 24, 29],
  AMAVASYA: [29],
  PURNIMA: [14],
};

/* Corpus override neutralizer -> engine OVERRIDE_EVALUATORS token.
   Unknown neutralizers are dropped (no matching engine evaluator yet). */
const NEUTRAL_TO_EVAL = {
  "SARVARTHA_SIDDHI_YOGA": "SARVARTTHA_SIDDHI",
  "ABHIJIT_MUHURTA": "ABHIJIT_WINDOW",
};

/* Readable-name overrides for codes that title-casing mangles. */
const NAME_OVERRIDES = {
  DOM_IP_COMPLIANCE: "IP & Compliance",
  DOM_CORPORATE_FINANCE: "Corporate Finance",
  SUB_MA: "Mergers & Acquisitions",
  SUB_GTM: "Go-To-Market",
};
function friendlyName(code) {
  if (NAME_OVERRIDES[code]) return NAME_OVERRIDES[code];
  const clean = String(code).replace(/^(DOM|SUB|ACT)_/, "");
  return clean.split("_").map((w) => w[0] + w.slice(1).toLowerCase()).join(" ");
}

/* ------------------------------------------------------------------ */
/* Corpus loading (browser fetch / Node fs)                            */
/* ------------------------------------------------------------------ */
let corpusPromise = null;
let provenancePromise = null;
export function loadProvenance() {
  if (provenancePromise) return provenancePromise;
  provenancePromise = (async () => {
    if (typeof window !== "undefined" && typeof fetch === "function") {
      const res = await fetch(PROVENANCE_URL);
      if (!res.ok) throw new Error("Failed to load " + PROVENANCE_URL + " (" + res.status + ")");
      return res.json();
    }
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const here = path.dirname(fileURLToPath(import.meta.url));
    return JSON.parse(fs.readFileSync(path.join(here, PROVENANCE_URL), "utf8"));
  })();
  return provenancePromise;
}
export function loadCorpus() {
  if (corpusPromise) return corpusPromise;
  corpusPromise = (async () => {
    if (typeof window !== "undefined" && typeof fetch === "function") {
      const res = await fetch(CORPUS_URL);
      if (!res.ok) throw new Error("Failed to load " + CORPUS_URL + " (" + res.status + ")");
      return res.json();
    }
    const fs = await import("fs");
    const path = await import("path");
    const { fileURLToPath } = await import("url");
    const here = path.dirname(fileURLToPath(import.meta.url));
    return JSON.parse(fs.readFileSync(path.join(here, CORPUS_URL), "utf8"));
  })();
  return corpusPromise;
}

/* ------------------------------------------------------------------ */
/* Taxonomy (index + queries + adapter)                                */
/* ------------------------------------------------------------------ */
export class Taxonomy {
  constructor(corpus, provenance) {
    this.corpus = corpus;
    this.provenance = provenance || null;
    this.byId = new Map();
    for (const a of corpus.activities) this.byId.set(a.activity_id, a);
    this.weekdayIndex = new Map(corpus.canonical_vocab.weekdays.map((w, i) => [w, i]));
    this.nakIndex = new Map(corpus.canonical_vocab.nakshatras.map((n, i) => [n, i]));
  }

  domains() {
    return this.corpus.domains.map((d) => ({
      code: d.domain,
      name: friendlyName(d.domain),
      sub_domains: d.sub_domains,
      count: d.activity_count,
    }));
  }

  subDomains(domainCode) {
    const d = this.corpus.domains.find((x) => x.domain === domainCode);
    if (!d) return [];
    return d.sub_domains.map((s) => ({ code: s, name: friendlyName(s) }));
  }

  activities(domainCode, subDomainCode) {
    return this.corpus.activities.filter((a) =>
      a.domain === domainCode && (!subDomainCode || a.sub_domain === subDomainCode)
    );
  }

  getActivity(id) {
    return this.byId.get(id) || null;
  }

  /* Keyword search across activity name/id/intent + domain/sub-domain codes. */
  search(q) {
    const needle = String(q || "").toLowerCase().trim();
    if (!needle) return [];
    const out = [];
    for (const a of this.corpus.activities) {
      const hay = [a.activity_name, a.activity_id, a.intent, a.domain, a.sub_domain].join(" ").toLowerCase();
      if (hay.includes(needle)) out.push(a);
    }
    return out;
  }

  /* Parse the functional_group prose into canonical group keys. */
  groupKeys(activity) {
    const fg = (activity.baseline_constraints.functional_group || "").toLowerCase();
    const found = [];
    for (const [key, aliases] of GROUP_ALIAS) {
      if (aliases.some((a) => fg.includes(a)) && !found.includes(key)) found.push(key);
    }
    return found;
  }

  /* Functional-group inheritance: group -> { nakshatras, weekdays } canonical names. */
  inheritGroup(keys) {
    const naks = [];
    const weekdays = [];
    for (const k of keys || []) {
      const g = GROUPS[k];
      if (!g) continue;
      for (const n of g.nakshatras) if (!naks.includes(n)) naks.push(n);
      for (const w of g.weekdays) if (!weekdays.includes(w)) weekdays.push(w);
    }
    return { nakshatras: naks, weekdays };
  }

  /* Adapter: corpus activity -> scoreMuhurta config shape. */
  toMuhurta(activity) {
    const bc = activity.baseline_constraints || {};
    const groups = this.groupKeys(activity);
    const inherited = this.inheritGroup(groups);

    const nakNames = bc.allowed_nakshatras && bc.allowed_nakshatras.length
      ? bc.allowed_nakshatras : inherited.nakshatras;
    const dayNames = bc.preferred_weekdays && bc.preferred_weekdays.length
      ? bc.preferred_weekdays : inherited.weekdays;

    const nakshatras = nakNames.map((n) => this.nakIndex.get(n)).filter((i) => i !== undefined);
    const vara = dayNames.length ? dayNames.map((d) => this.weekdayIndex.get(d)).filter((i) => i !== undefined) : null;

    const overrides = [];
    for (const o of activity.cancellation_overrides || []) {
      for (const n of o.neutralized_by || []) {
        const t = NEUTRAL_TO_EVAL[n];
        if (t && !overrides.includes(t)) overrides.push(t);
      }
    }

    // Corpus hard-blocker codes → engine evaluator tokens (app.js HARD_BLOCKER_EVALUATORS).
    // Codes with no day-granularity evaluator are dropped here so they never silently
    // short-circuit a Reject — unlike a missing rule lookup that would default to PASS.
    const HARD_TO_TOKEN = {
      ASTA_GURU_ACTIVE: "ASTA_GURU",
      ASTA_SHUKRA_ACTIVE: "ASTA_SHUKRA",
      TUESDAY_ACTIVE: "TUESDAY",
      SANKRANTI_DAY_ACTIVE: "SANKRANTI",
      VYATIPATA_YOGA_ACTIVE: "VYATIPATA",
      VAIDHRITI_YOGA_ACTIVE: "VAIDHRITI",
    };
    // Codes intentionally without a day-level token (never warn):
    //   BHADRA_EARTH_ACTIVE — enforced universally by engine's Bhadra matrix
    //     (Mrityu Loka → strict T1 unless Puchha), so it needs no per-activity wiring.
    //   YAMA_GHANTA_ACTIVE — sub-day inauspicious window, not day-granular.
    const INTENTIONALLY_UNMAPPED = ["BHADRA_EARTH_ACTIVE", "YAMA_GHANTA_ACTIVE"];
    const hardBlockers = [];
    for (const hb of activity.hard_blockers || []) {
      const t = HARD_TO_TOKEN[hb.code];
      if (t && !hardBlockers.includes(t)) hardBlockers.push(t);
    }
    if (activity.hard_blockers && activity.hard_blockers.some((hb) => !HARD_TO_TOKEN[hb.code] && !INTENTIONALLY_UNMAPPED.includes(hb.code))) {
      const dropped = activity.hard_blockers.map((hb) => hb.code).filter((c) => !HARD_TO_TOKEN[c] && !INTENTIONALLY_UNMAPPED.includes(c)).join(", ");
      console.warn(`toMuhurta: hard_blocker codes dropped (no day evaluator): ${dropped} on ${activity.activity_id}`);
    }

    return {
      id: activity.activity_id,
      name: activity.activity_name,
      nakshatras,
      vara,                                  // null = not filtered
      paksha: "both",                        // corpus tithi-group model spans both pakshas
      badTithis: this.badTithis(bc),
      badYogas: [],
      badKaranas: [6],                       // classical Vishti avoidance (corpus has no karana data)
      hardBlockers,
      overrides,
      note: this.activityNote(activity, groups),
      source: activity.source,
      domain: activity.domain,
      sub_domain: activity.sub_domain,
      intent: activity.intent,
      classical: this.classicalProvenance(activity),
      _activity: activity,
    };
  }

  /* Classical provenance for an activity, resolved from provenance_registry.json.
     Returns null when the registry is absent (graceful degradation). */
  classicalProvenance(activity) {
    if (!this.provenance || !this.provenance.activities) return null;
    const meta = this.provenance.activities[activity.activity_id];
    if (!meta) return null;
    const chapter = this.provenance.chapters[meta.chapter_key];
    const verses = [];
    for (const key of meta.verse_keys || []) {
      const v = this.provenance.verses[key];
      if (v && v.basis === "classical" && v.proof === "confirmed") {
        verses.push({ key, ...v });
      }
    }
    return {
      source: this.provenance.meta.source,
      author: this.provenance.meta.author,
      basis: meta.basis,
      chapter: chapter ? chapter.name : meta.chapter_key,
      chapter_key: meta.chapter_key,
      verse_keys: meta.verse_keys || [],
      verses, // confirmed classical citations only — no fabricated slokas
      rationale: meta.rationale || null,
    };
  }

  /* Whitelist(→complement) + blacklist translation to engine tithi indices. */
  badTithis(bc) {
    const allowed = bc.allowed_tithi_groups || [];
    const forbidden = bc.forbidden_tithi_groups || [];
    const allowedSet = new Set();
    for (const g of allowed) for (const i of TITHI_GROUP_TO_INDICES[g] || []) allowedSet.add(i);
    const bad = new Set();
    for (const g of forbidden) for (const i of TITHI_GROUP_TO_INDICES[g] || []) bad.add(i);
    if (allowed.length) {
      for (let i = 0; i < 30; i++) if (!allowedSet.has(i)) bad.add(i);
    }
    return [...bad].sort((a, b) => a - b);
  }

  activityNote(activity, groups) {
    const fg = activity.baseline_constraints.functional_group || "";
    const parts = [fg, activity.intent].filter(Boolean);
    const groupLabels = groups.map((g) => GROUPS[g].name).filter((n, i, arr) => arr.indexOf(n) === i);
    return [parts.join(" · "), groupLabels.length ? "Groups: " + groupLabels.join(", ") : ""].filter(Boolean).join(" | ");
  }
}

export async function loadTaxonomy() {
  const [corpus, provenance] = await Promise.all([loadCorpus(), loadProvenance()]);
  return new Taxonomy(corpus, provenance);
}
