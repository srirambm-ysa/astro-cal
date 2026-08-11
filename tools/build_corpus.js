#!/usr/bin/env node
/* tools/build_corpus.js — build the canonical activity corpus (rules/activity_corpus.json)
   from the 17 domain files in domains/. Three data tiers are merged:
     1. Embedded JSON registries      -> source: "json"
     2. Prose taxonomy + hints        -> source: "prose_synthesized"
     3. Summary-table rows            -> enrichment overlay on prose-synthesized entries
   modern_finance.md has no JSON/table -> prose-only synthesis (source: "prose_synthesized").
   Names are canonicalized to engine.js vocab (NAKSHATRA, TITHI_GROUPS, WEEKDAYS, FACING).
   Run: node tools/build_corpus.js   (writes rules/activity_corpus.json) */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DOMAINS_DIR = path.join(ROOT, "domains");
const OUT_FILE = path.join(ROOT, "rules", "activity_corpus.json");

/* ------------------------------------------------------------------ */
/* Canonical vocabulary (mirrors engine.js)                            */
/* ------------------------------------------------------------------ */
const CANON_NAKSHATRA = [
  "ASHWINI","BHARANI","KRITTIKA","ROHINI","MRIGASHIRA","ARDRA","PUNARVASU",
  "PUSHYA","ASHLESHA","MAGHA","PURVA_PHALGUNI","UTTARA_PHALGUNI","HASTA",
  "CHITRA","SWATI","VISHAKHA","ANURADHA","JYESHTHA","MULA","PURVA_ASHADHA",
  "UTTARA_ASHADHA","SHRAVANA","DHANISHTA","SHATABHISHA","PURVA_BHADRAPADA",
  "UTTARA_BHADRAPADA","REVATI",
];
const NAK_CANON = {
  ARDRAL: "ARDRA", JYESTHA: "JYESHTHA", MOOLA: "MULA", DHANISHTHA: "DHANISHTA",
  UTTARASHADHA: "UTTARA_ASHADHA", PUSYA: "PUSHYA",
};
const TITHI_GROUPS = ["NANDA", "BHADRA", "JAYA", "RIKTA", "PURNA"];
const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const FACINGS = ["UPWARD", "DOWNWARD", "SIDEWAYS", "ANY"];
const CANON_SET = new Set(CANON_NAKSHATRA);

const DEFAULT_WEIGHTS = {
  nakshatra_match: 35, tithi_match: 25, weekday_match: 15,
  facing_match: 10, cancellation_bonus: 15,
};
const DEFAULT_HARD_BLOCKER = {
  code: "BHADRA_EARTH_ACTIVE",
  description: "Bhadra active in Mrityu Loka (Earth)",
  bypass_rule: "BHADRA_PUCHHA_PHASE",
};

/* Functional group -> nakshatras / preferred weekdays (classical mapping). */
const GROUPS = {
  sthira: { name: "Sthira / Dhruva (Fixed)", nakshatras: ["ROHINI","UTTARA_PHALGUNI","UTTARA_ASHADHA","UTTARA_BHADRAPADA"], weekdays: ["SUN","THU"] },
  chara:  { name: "Chara / Chala (Movable)", nakshatras: ["SWATI","PUNARVASU","SHRAVANA","DHANISHTA","SHATABHISHA"], weekdays: ["MON","WED","FRI"] },
  mridu:  { name: "Mridu / Maitra (Tender)", nakshatras: ["MRIGASHIRA","CHITRA","ANURADHA","REVATI"], weekdays: ["FRI","WED"] },
  kshipra:{ name: "Kshipra / Laghu (Swift)", nakshatras: ["HASTA","ASHWINI","PUSHYA"], weekdays: ["THU","WED"] },
  tikshna:{ name: "Tikshna / Ugra (Sharp)", nakshatras: ["ARDRA","JYESHTHA","MULA","ASHLESHA","BHARANI"], weekdays: ["SAT","TUE"] },
};
const GROUP_ALIAS = {
  "sthira": "sthira", "dhruva": "sthira", "fixed": "sthira", "urdhvamukhi": "sthira",
  "chara": "chara", "chala": "chara", "movable": "chara",
  "mridu": "mridu", "maitra": "mridu", "gentle": "mridu", "tender": "mridu",
  "kshipra": "kshipra", "laghu": "kshipra", "swift": "kshipra",
  "tikshna": "tikshna", "ugra": "tikshna", "sharp": "tikshna", "cruel": "tikshna",
};
const GROUP_ORDER = ["sthira", "chara", "mridu", "kshipra", "tikshna"];

/* Sanskrit-name / keyword -> functional group (for hints with no group keyword). */
const KEYWORD_GROUPS = [
  [/vidyarambh|aksharambh|school|study|exam|learn|educat|initiat/i, ["kshipra","mridu"]],
  [/arangetram|debut|perform|recital|concert|fine.art|music|danc|sing/i, ["mridu"]],
  [/shilpa|craft|vocat|technic|architect|mechan/i, ["kshipra","sthira"]],
  [/garbhadhan|pumsavan|seeman|namakaran|annaprashan|karnavedh|chudakar|tonsure/i, ["mridu","sthira"]],
  [/upanayan|sacred thread/i, ["kshipra","mridu"]],
  [/vivaha|marriage|wedding|valayapatti|betrothal|engage/i, ["mridu","sthira","kshipra"]],
  [/havan|agnihotra|puja|vrata|vow|fast|pilgrim/i, ["sthira","mridu"]],
  [/filing|file |register|submission|compliance|gazette|scheme|claim/i, ["kshipra","jaya"]],
  [/settle|arbitrat|mediat|accord|compromise|reconcil/i, ["mridu"]],
  [/decree|execut|evict|attach|deploy|defense|military|criminal|complaint/i, ["tikshna"]],
  [/bail|release|stay|injunct|appeal|defen|counter/i, ["chara","kshipra"]],
  [/keel|hull|ship.build|foundation|groundbreak|bhoomi|incorporat|entity/i, ["sthira"]],
  [/launching|launch|release|introduct|rollout|maiden|first|inaugur|open|commission/i, ["chara","kshipra"]],
  [/drill|shaft|dig|well|borewell|mine|excavat|tunnel|sink|blast|demolish/i, ["tikshna","sthira"]],
  [/smelt|furnace|cast|forge|fire|ignit|crack|burn/i, ["tikshna"]],
  [/dispatch|fleet|shipping|cargo|transit|commut|travel|trip|voyage|logistic/i, ["chara"]],
  [/purchase|buy|acquire|trade|sale|auction|invest|stock|equity|fund|deposit|gold|asset|treasury/i, ["sthira","kshipra"]],
  [/till|plow|seed|sow|plant|graft|germinat|irrigat|crop|harvest|thresh|grain|silo/i, ["mridu","kshipra"]],
  [/restaurant|cafe|kitchen|food|beverag|brew|hotel|lodg|banquet|event|venue/i, ["chara","mridu"]],
  [/film|theatr|movie|stream|ott|publish|book|journal|podcast|youtube|album|fashion|show|script/i, ["chara","mridu"]],
  [/oath|sworn|office|diplomat|summit|policy|legislat|tender|infra|public/i, ["sthira","kshipra"]],
  [/drilling|exploration|spud|concession|reserve|petro|pipeline|tank|lng|lpg|refin|polymer|fuel/i, ["chara","sthira"]],
  [/surg|operation|incision|therapy|medic|treat|pharma|compound|heal/i, ["tikshna","mridu"]],
];
function groupsFromHint(hint) {
  const h = (hint || "").toLowerCase();
  const found = new Set();
  for (const g of GROUP_ORDER) {
    for (const a of Object.keys(GROUP_ALIAS)) {
      if (a === g) continue;
      if (h.includes(a)) found.add(GROUP_ALIAS[a]);
    }
  }
  for (const g of GROUP_ORDER) if (h.includes(g)) found.add(g);
  if (found.size === 0) {
    for (const [re, grps] of KEYWORD_GROUPS) {
      if (re.test(h)) { grps.forEach((g) => found.add(g)); break; }
    }
  }
  if (found.size === 0) found.add("sthira");
  return GROUP_ORDER.filter((g) => found.has(g));
}
function facingFromHint(hint) {
  const h = (hint || "").toLowerCase();
  if (/(urdhva|upward)/.test(h)) return "UPWARD";
  if (/(adho|downward)/.test(h)) return "DOWNWARD";
  if (/(tiryak|sideways)/.test(h)) return "SIDEWAYS";
  return "ANY";
}

/* ------------------------------------------------------------------ */
/* Parsers                                                             */
/* ------------------------------------------------------------------ */
function parseDomainHeader(line) {
  const m = line.match(/\(`?(DOM_[A-Z0-9_]+)`?\)/);
  return m ? m[1] : null;
}

function extractJsonBlocks(text) {
  const blocks = [];
  const re = /```json\s*([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    try { blocks.push(JSON.parse(m[1])); } catch (e) { console.warn("  ! unparsable JSON block: " + e.message); }
  }
  return blocks;
}

function canonicalizeNakshatra(n) {
  const c = NAK_CANON[n] || n;
  return CANON_SET.has(c) ? c : null;
}

function canonicalizeNakshatraList(arr) {
  const out = [];
  for (const n of arr || []) {
    const c = canonicalizeNakshatra(n);
    if (c) { if (!out.includes(c)) out.push(c); }
    else console.warn("  ! unknown nakshatra token: " + n);
  }
  return out;
}
function cleanStrList(arr, valid) {
  const out = [];
  for (const x of arr || []) {
    const c = String(x).toUpperCase();
    if (valid.has(c) && !out.includes(c)) out.push(c);
    else if (!valid.has(c)) console.warn("  ! invalid enum token: " + x);
  }
  return out;
}

function canonicalizeJsonEntry(e) {
  const bc = e.baseline_constraints || {};
  return {
    activity_id: e.activity_id,
    activity_name: e.activity_name || e.activity_id,
    domain: e.domain,
    sub_domain: e.sub_domain,
    intent: e.intent || "",
    baseline_constraints: {
      functional_group: bc.functional_group || "",
      allowed_tithi_groups: cleanStrList(bc.allowed_tithi_groups, new Set(TITHI_GROUPS)),
      forbidden_tithi_groups: cleanStrList(bc.forbidden_tithi_groups, new Set(TITHI_GROUPS.concat(["AMAVASYA", "PURNIMA"]))),
      allowed_nakshatras: canonicalizeNakshatraList(bc.allowed_nakshatras),
      preferred_weekdays: cleanStrList(bc.preferred_weekdays, new Set(WEEKDAYS)),
      required_facing_orientation: FACINGS.includes(bc.required_facing_orientation) ? bc.required_facing_orientation : "ANY",
    },
    weights: { ...DEFAULT_WEIGHTS, ...(e.weights || {}) },
    hard_blockers: Array.isArray(e.hard_blockers) ? e.hard_blockers : [],
    cancellation_overrides: Array.isArray(e.cancellation_overrides) ? e.cancellation_overrides : [],
    source: "json",
    provenance: "embedded_json",
  };
}

function synthesizeProseEntry(id, name, subDomain, hint) {
  const groups = groupsFromHint(hint);
  const nakshatras = [];
  const weekdays = [];
  for (const g of groups) {
    GROUPS[g].nakshatras.forEach((n) => { if (!nakshatras.includes(n)) nakshatras.push(n); });
    GROUPS[g].weekdays.forEach((d) => { if (!weekdays.includes(d)) weekdays.push(d); });
  }
  const isTikshna = groups.includes("tikshna");
  const entry = {
    activity_id: id,
    activity_name: name,
    domain: "",
    sub_domain: subDomain,
    intent: "",
    baseline_constraints: {
      functional_group: groups.map((g) => GROUPS[g].name).join(" & ") || "Sthira / Dhruva (Fixed)",
      allowed_tithi_groups: isTikshna ? ["NANDA", "JAYA", "RIKTA"] : ["NANDA", "JAYA", "PURNA"],
      forbidden_tithi_groups: ["AMAVASYA"],
      allowed_nakshatras: nakshatras,
      preferred_weekdays: weekdays,
      required_facing_orientation: facingFromHint(hint),
    },
    weights: { ...DEFAULT_WEIGHTS },
    hard_blockers: [DEFAULT_HARD_BLOCKER],
    cancellation_overrides: [],
    source: "prose_synthesized",
    provenance: "prose_taxonomy" + (groupsFromHint(hint).length ? "" : "+keyword_default"),
  };
  return entry;
}

/* Nakshatra alias map for summary-table enrichment (free-text names). */
const NAK_ALIAS = {
  "ashwini": "ASHWINI", "ashwinee": "ASHWINI", "bharani": "BHARANI",
  "krittika": "KRITTIKA", "krithika": "KRITTIKA", "rohini": "ROHINI",
  "mrigashira": "MRIGASHIRA", "mrigasira": "MRIGASHIRA", "mrigashirsha": "MRIGASHIRA",
  "ardra": "ARDRA", "punarvasu": "PUNARVASU", "pushya": "PUSHYA", "pushyam": "PUSHYA",
  "ashlesha": "ASHLESHA", "magha": "MAGHA", "purva phalguni": "PURVA_PHALGUNI",
  "uttara phalguni": "UTTARA_PHALGUNI", "hasta": "HASTA", "chitra": "CHITRA",
  "swati": "SWATI", "swathi": "SWATI", "vishakha": "VISHAKHA", "anuradha": "ANURADHA",
  "jyeshtha": "JYESHTHA", "jyeshta": "JYESHTHA", "moola": "MULA", "mula": "MULA",
  "purva ashadha": "PURVA_ASHADHA", "purvashadha": "PURVA_ASHADHA",
  "uttara ashadha": "UTTARA_ASHADHA", "uttarashadha": "UTTARA_ASHADHA",
  "shravana": "SHRAVANA", "dhanishtha": "DHANISHTA", "dhanishta": "DHANISHTA",
  "shatabhisha": "SHATABHISHA", "shatataraka": "SHATABHISHA",
  "purva bhadrapada": "PURVA_BHADRAPADA", "uttara bhadrapada": "UTTARA_BHADRAPADA",
  "revati": "REVATI",
};
const DAY_ALIAS = {
  "monday": "MON", "tuesday": "TUE", "wednesday": "WED", "thursday": "THU",
  "friday": "FRI", "saturday": "SAT", "sunday": "SUN",
};
const GROUP_ALIAS_SUMMARY = {
  "sthira": "sthira", "fixed": "sthira", "dhruva": "sthira", "upward": "sthira",
  "chara": "chara", "chala": "chara", "movable": "chara", "sideways": "chara",
  "mridu": "mridu", "tender": "mridu", "gentle": "mridu", "kshipra": "kshipra",
  "swift": "kshipra", "laghu": "kshipra", "tikshna": "tikshna", "ugra": "tikshna",
  "sharp": "tikshna", "cruel": "tikshna", "jaya": "kshipra", "purna": "sthira",
  "agni": "tikshna", "jala": "mridu", "mars": "tikshna", "venus": "mridu",
  "water": "mridu",
};
function parseSummaryRow(cells) {
  // cells: [activity, group, nakshatras, days, blockers]
  const activity = cells[0] || "";
  const naks = [];
  for (const name of Object.keys(NAK_ALIAS)) {
    if (new RegExp("\\b" + name.replace(" ", "\\s+") + "\\b", "i").test((cells[2] || "") + " " + activity)) {
      const c = NAK_ALIAS[name];
      if (!naks.includes(c)) naks.push(c);
    }
  }
  const days = [];
  for (const name of Object.keys(DAY_ALIAS)) {
    if (new RegExp("\\b" + name + "\\b", "i").test(cells[3] || "")) days.push(DAY_ALIAS[name]);
  }
  const groupStr = (cells[1] || "").toLowerCase();
  const groups = [];
  for (const g of GROUP_ORDER) if (groupStr.includes(g)) groups.push(g);
  if (!groups.length) {
    for (const a of Object.keys(GROUP_ALIAS_SUMMARY)) {
      if (groupStr.includes(a)) { const g = GROUP_ALIAS_SUMMARY[a]; if (!groups.includes(g)) groups.push(g); }
    }
  }
  return { activity: activity.replace(/[*`]/g, "").trim(), naks, days, groups };
}

function slugSubDomain(title, knownMap) {
  const t = (title || "").toLowerCase();
  for (const k of Object.keys(knownMap)) {
    if (t.includes(k)) return knownMap[k];
  }
  const code = t.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").toUpperCase();
  return "SUB_" + code;
}
const SUB_KNOWN = {
  "land preparation": "SUB_LAND_PREPARATION", "soil health": "SUB_LAND_PREPARATION",
  "sowing": "SUB_SOWING_PLANTATION", "plantation": "SUB_SOWING_PLANTATION",
  "harvesting": "SUB_HARVESTING_PROCESSING", "threshing": "SUB_HARVESTING_PROCESSING",
  "storage": "SUB_STORAGE_LOGISTICS", "silos": "SUB_STORAGE_LOGISTICS",
  "factory": "SUB_FACTORY_SETUP", "tooling": "SUB_FACTORY_SETUP",
  "assembly": "SUB_FACTORY_SETUP", "automotive production": "SUB_AUTOMOTIVE_PRODUCTION",
  "metallurgy": "SUB_METALLURGY_FORGING", "forging": "SUB_METALLURGY_FORGING",
  "casting": "SUB_METALLURGY_FORGING", "precision machining": "SUB_METALLURGY_FORGING",
  "aerospace": "SUB_AEROSPACE_AVIONICS", "avionics": "SUB_AEROSPACE_AVIONICS",
  "satellite": "SUB_AEROSPACE_AVIONICS",
  "foundational": "SUB_FOUNDATIONAL_LEARNING", "early learning": "SUB_FOUNDATIONAL_LEARNING",
  "higher studies": "SUB_HIGHER_STUDIES", "advanced research": "SUB_HIGHER_STUDIES",
  "technical": "SUB_TECHNICAL_STEM", "vocational": "SUB_TECHNICAL_STEM",
  "fine arts": "SUB_ARTS_AND_CULTURE", "music": "SUB_ARTS_AND_CULTURE",
  "performing arts": "SUB_ARTS_AND_CULTURE",
  "incorporation": "SUB_ENTITY_FOUNDING", "equity architecture": "SUB_ENTITY_FOUNDING",
  "product launch": "SUB_PRODUCT_GTM", "go-to-market": "SUB_PRODUCT_GTM",
  "venture capital": "SUB_VENTURE_CAPITAL", "fundraising": "SUB_VENTURE_CAPITAL",
  "commercial facilities": "SUB_COMMERCIAL_FACILITIES", "retail": "SUB_COMMERCIAL_FACILITIES",
  "restaurant": "SUB_RESTAURANT_AND_DINING", "fine dining": "SUB_RESTAURANT_AND_DINING",
  "cloud kitchen": "SUB_RESTAURANT_AND_DINING", "hotel": "SUB_HOTEL_LODGING",
  "lodging": "SUB_HOTEL_LODGING", "food manufacturing": "SUB_FOOD_BEVERAGE_MFG",
  "beverages": "SUB_FOOD_BEVERAGE_MFG", "brewery": "SUB_FOOD_BEVERAGE_MFG",
  "vessel construction": "SUB_SHIPBUILDING", "hull": "SUB_SHIPBUILDING",
  "launching": "SUB_LAUNCH_AND_TRIALS", "sea trials": "SUB_LAUNCH_AND_TRIALS",
  "ports": "SUB_PORTS_AND_INFRASTRUCTURE", "docks": "SUB_PORTS_AND_INFRASTRUCTURE",
  "offshore": "SUB_PORTS_AND_INFRASTRUCTURE", "cargo": "SUB_CARGO_FLEET",
  "fleet operations": "SUB_CARGO_FLEET",
  "film": "SUB_FILM_AND_TV", "video": "SUB_FILM_AND_TV", "television": "SUB_FILM_AND_TV",
  "digital content": "SUB_DIGITAL_BROADCAST", "streaming": "SUB_DIGITAL_BROADCAST",
  "broadcasting": "SUB_DIGITAL_BROADCAST", "publishing": "SUB_PUBLISHING_WRITING",
  "writing": "SUB_PUBLISHING_WRITING", "journalism": "SUB_PUBLISHING_WRITING",
  "music": "SUB_ARTS_AND_CULTURE", "performance": "SUB_ARTS_AND_CULTURE",
  "fashion": "SUB_ARTS_AND_CULTURE",
  "exploration": "SUB_EXPLORATION_DRILLING", "geological": "SUB_EXPLORATION_DRILLING",
  "drilling": "SUB_EXPLORATION_DRILLING", "mine shaft": "SUB_UNDERGROUND_MINING",
  "underground": "SUB_UNDERGROUND_MINING", "smelting": "SUB_SMELTING_REFINING",
  "refining": "SUB_SMELTING_REFINING", "rare earth": "SUB_SMELTING_REFINING",
  "precious metals": "SUB_PRECIOUS_METAL_TRADE", "mineral trade": "SUB_PRECIOUS_METAL_TRADE",
  "prenatal": "SUB_PRENATAL_CHILDCARE", "childcare": "SUB_PRENATAL_CHILDCARE",
  "educational": "SUB_EDUCATIONAL_INITIATION", "spiritual initiation": "SUB_EDUCATIONAL_INITIATION",
  "nuptial": "SUB_NUPTIAL_UNION", "family union": "SUB_NUPTIAL_UNION",
  "householder": "SUB_HOUSEHOLDER_RITES", "vows": "SUB_HOUSEHOLDER_RITES",
  "capital markets": "SUB_CAPITAL_MARKETS", "equity": "SUB_CAPITAL_MARKETS",
  "crypto": "SUB_CAPITAL_MARKETS", "wealth assets": "SUB_WEALTH_ASSETS",
  "bullion": "SUB_WEALTH_ASSETS", "banking": "SUB_FIXED_INCOME_TREASURY",
  "fixed income": "SUB_FIXED_INCOME_TREASURY", "treasury": "SUB_FIXED_INCOME_TREASURY",
  "debt": "SUB_DEBT_MANAGEMENT", "liability": "SUB_DEBT_MANAGEMENT",
  "executive office": "SUB_EXECUTIVE_OFFICE", "appointments": "SUB_EXECUTIVE_OFFICE",
  "oaths": "SUB_EXECUTIVE_OFFICE", "public policy": "SUB_PUBLIC_POLICY",
  "legislation": "SUB_PUBLIC_POLICY", "executive orders": "SUB_PUBLIC_POLICY",
  "civil services": "SUB_CIVIL_SERVICES", "public sector": "SUB_CIVIL_SERVICES",
  "defense": "SUB_DEFENSE_SECURITY", "security": "SUB_DEFENSE_SECURITY",
  "law enforcement": "SUB_DEFENSE_SECURITY",
  "site acquisition": "SUB_SITE_ACQUISITION", "surveying": "SUB_SITE_ACQUISITION",
  "vastu planning": "SUB_SITE_ACQUISITION", "earth consecration": "SUB_GROUNDBREAKING_FOUNDATION",
  "groundbreaking": "SUB_GROUNDBREAKING_FOUNDATION", "foundation": "SUB_GROUNDBREAKING_FOUNDATION",
  "structural": "SUB_STRUCTURAL_SUPERSTRUCTURE", "superstructure": "SUB_STRUCTURAL_SUPERSTRUCTURE",
  "renovation": "SUB_STRUCTURAL_SUPERSTRUCTURE", "occupancy": "SUB_OCCUPANCY_LEASING",
  "interior": "SUB_OCCUPANCY_LEASING", "commercial leasing": "SUB_OCCUPANCY_LEASING",
  "business": "SUB_BUSINESS_TRAVEL", "short-haul": "SUB_BUSINESS_TRAVEL",
  "long-distance": "SUB_LONG_DISTANCE_RELOCATION", "international": "SUB_LONG_DISTANCE_RELOCATION",
  "relocation": "SUB_LONG_DISTANCE_RELOCATION", "pilgrimage": "SUB_PILGRIMAGE_LEISURE",
  "leisure": "SUB_PILGRIMAGE_LEISURE", "vehicle purchase": "SUB_VEHICLE_OPERATIONS",
  "first driving": "SUB_VEHICLE_OPERATIONS",
};

/* ------------------------------------------------------------------ */
/* Modern finance (prose-only) — DOM_CORPORATE_FINANCE                 */
/* ------------------------------------------------------------------ */
function parseModernFinance() {
  const text = fs.readFileSync(path.join(DOMAINS_DIR, "modern_finance.md"), "utf8");
  const entries = [];
  const sections = [];
  const lines = text.split(/\r?\n/);
  let currentSub = "SUB_CORPORATE_FINANCE";
  for (const line of lines) {
    const sec = line.match(/^###\s+\d+\.\s+(.+)$/);
    if (sec) {
      const t = sec[1].toLowerCase();
      currentSub =
        /mergers|m&a|corporate finance/i.test(t) ? "SUB_CORPORATE_MA" :
        /legal|deal|contract/i.test(t) ? "SUB_CORPORATE_CONTRACTS" :
        /trading|algorithm|quant/i.test(t) ? "SUB_QUANT_TRADING" :
        /leadership|restructur/i.test(t) ? "SUB_CORPORATE_LEADERSHIP" : "SUB_CORPORATE_FINANCE";
      sections.push({ title: sec[1], sub: currentSub });
    }
    const act = line.match(/^\*\s*\*\*(.+?)\s*\(\s*`?([A-Z][A-Z0-9_]+)`?\s*\)\s*\*\*/);
    if (act) {
      entries.push({ id: act[2], name: act[1].replace(/\*\*/g, "").trim(), sub: currentSub, hint: "" });
    } else {
      const map = line.match(/^\*\s*\*\*Classical Mapping:\*\*\s*\*\*([^*]+)\*\*/);
      if (map && entries.length) entries[entries.length - 1].hint += " " + map[1];
    }
  }
  return entries.map((e) => {
    const entry = synthesizeProseEntry(e.id, e.name, e.sub, e.hint);
    entry.domain = "DOM_CORPORATE_FINANCE";
    entry.provenance = "prose_mapping";
    return entry;
  });
}

/* ------------------------------------------------------------------ */
/* Main build                                                          */
/* ------------------------------------------------------------------ */
function build() {
  const files = fs.readdirSync(DOMAINS_DIR).filter((f) => f.endsWith(".md") && f !== "why_this_works.md");
  const activities = [];
  const domainMeta = {};
  const warnings = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(DOMAINS_DIR, file), "utf8");
    const lines = text.split(/\r?\n/);

    if (file === "modern_finance.md") {
      activities.push(...parseModernFinance());
      continue;
    }

    let domain = null;
    const jsonEntries = [];
    const summaryRows = [];

    for (const line of lines) {
      const d = parseDomainHeader(line);
      if (d && !domain) domain = d;
      if (/^###\s+Domain/.test(line) && !d) domain = domain || "DOM_UNKNOWN";
    }
    jsonEntries.push(...extractJsonBlocks(text));
    if (!domain && jsonEntries.length && jsonEntries[0].length) domain = jsonEntries[0][0].domain || null;

    for (const block of jsonEntries) {
      for (const e of block) {
        const c = canonicalizeJsonEntry(e);
        if (!c.domain) c.domain = domain;
        activities.push(c);
      }
    }

    /* prose taxonomy */
    let currentSub = "";
    let currentSubTitle = "";
    for (const line of lines) {
      const sub = line.match(/^####\s+Sub-Domain\s+\d+:\s*(.+)$/);
      if (sub) {
        currentSubTitle = sub[1].replace(/\(\*.*\*\)/g, "").trim();
        currentSub = slugSubDomain(currentSubTitle, SUB_KNOWN);
        continue;
      }
      const bullet = line.match(/^\*\s*`([A-Z][A-Z0-9_]*)(?:\s+([A-Z][A-Z0-9_]+))?`\s*:\s*(.+?)(?:\s*\(\*([^*]+)\*\))?\s*$/);
      if (bullet) {
        const id = bullet[1] + (bullet[2] || "");
        const name = bullet[3].replace(/[*`]/g, "").trim();
        const hint = bullet[4] || "";
        const existing = activities.find((a) => a.activity_id === id);
        if (existing) {
          if (existing.source === "json" && hint) existing._hint = hint;
          continue;
        }
        const entry = synthesizeProseEntry(id, name, currentSub || "SUB_" + (domain || "").replace(/^DOM_/, ""), hint);
        entry.domain = domain;
        activities.push(entry);
      }
      if (/^###\s+\d+\.\s+.+Rules Summary Table/.test(line)) {
        // summary table follows
      }
    }

    /* summary tables -> enrichment overlay (scoped to current file's domain) */
    const tableLines = lines.filter((l) => l.trim().startsWith("|") && !/^\|.*(-+)\s*\|/.test(l) && !/^\| Activity \|/.test(l));
    const jsonIds = new Set(jsonEntries.flat().map((e) => e.activity_id));
    for (const tl of tableLines) {
      const cells = tl.split("|").slice(1, -1).map((c) => c.trim());
      if (cells.length < 4) continue;
      const row = parseSummaryRow(cells);
      if (!row.naks.length && !row.days.length && !row.groups.length) continue;
      const titleTokens = row.activity.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const scored = [];
      for (const a of activities) {
        if (a.source === "json" || jsonIds.has(a.activity_id)) continue;
        if (a.domain !== domain) continue;  // <-- scope to current file
        const id = a.activity_id.toLowerCase();
        const name = a.activity_name.toLowerCase();
        const hits = titleTokens.filter((w) => id.includes(w) || name.includes(w)).length;
        if (hits > 0) scored.push({ a, hits, len: titleTokens.length });
      }
      if (!scored.length) continue;
      scored.sort((x, y) => y.hits - x.hits || x.len - y.len);
      const match = scored[0].a;
      if (process.env.DBG_ENRICH) console.log("  enrich row:", row.activity, "->", match.activity_id, "hits", scored[0].hits, "/", titleTokens.length);
      if (row.naks.length) match.baseline_constraints.allowed_nakshatras = row.naks;
      if (row.days.length) match.baseline_constraints.preferred_weekdays = row.days;
      if (row.groups.length) {
        match.baseline_constraints.functional_group = row.groups.map((g) => GROUPS[g].name).join(" & ");
        match._summaryGroups = row.groups;
      }
      match.source = "summary_synthesized";
    }
  }

  /* domain metadata */
  const domainSet = [...new Set(activities.map((a) => a.domain))].sort();
  for (const d of domainSet) {
    const acts = activities.filter((a) => a.domain === d);
    domainMeta[d] = {
      domain: d,
      activity_count: acts.length,
      sub_domains: [...new Set(acts.map((a) => a.sub_domain).filter(Boolean))].sort(),
      activity_ids: acts.map((a) => a.activity_id).sort(),
    };
  }

  /* validation */
  const ids = new Set();
  for (const a of activities) {
    if (ids.has(a.activity_id)) warnings.push("duplicate activity_id: " + a.activity_id);
    ids.add(a.activity_id);
    for (const n of a.baseline_constraints.allowed_nakshatras) {
      if (!CANON_SET.has(n)) warnings.push(a.activity_id + ": non-canonical nakshatra " + n);
    }
  }

  const corpus = {
    version: "1.0.0",
    generated: new Date().toISOString().slice(0, 10),
    schema: "activity-registry-v1",
    source: "domains/*.md (17 domain files) + domains/why_this_works.md",
    canonical_vocab: {
      nakshatras: CANON_NAKSHATRA,
      tithi_groups: TITHI_GROUPS,
      weekdays: WEEKDAYS,
      facings: FACINGS,
    },
    counts: {
      activities: activities.length,
      by_source: {
        json: activities.filter((a) => a.source === "json").length,
        prose_synthesized: activities.filter((a) => a.source === "prose_synthesized").length,
        summary_synthesized: activities.filter((a) => a.source === "summary_synthesized").length,
      },
      by_domain: Object.fromEntries(domainSet.map((d) => [d, domainMeta[d].activity_count])),
    },
    domains: Object.values(domainMeta),
    activities,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(corpus, null, 2) + "\n");

  console.log("Wrote " + OUT_FILE);
  console.log("  activities: " + activities.length);
  console.log("  by_source: " + JSON.stringify(corpus.counts.by_source));
  console.log("  warnings: " + warnings.length);
  if (warnings.length) warnings.forEach((w) => console.log("    - " + w));
}

build();
