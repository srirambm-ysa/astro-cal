import vm from "vm"; import fs from "fs"; import path from "path"; import { pathToFileURL } from "url";
const ROOT = "D:/astro-cal";
const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const j = (p) => pathToFileURL(path.join(ROOT, p)).href;
const { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST, DOW,
        YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } = await import(j("engine.js"));
const { loadTaxonomy } = await import(j("taxonomy.js"));
const { listMonthlyGochara } = await import(j("gochara.mjs"));
const sandbox = { console, Math, Date, Number, String, Array, Object, JSON, Promise, Map, Set,
  setTimeout, clearTimeout, Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST, DOW,
  YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP, loadTaxonomy, listMonthlyGochara, GOCHARA_RULES: { rules: [], vedhaTable: [] },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.Worker = undefined;
sandbox.document = { getElementById: () => null, querySelector: () => null,
  createElement: () => ({ classList: { add() {}, toggle() {} }, addEventListener() {}, appendChild() {}, style: {} }),
  body: { classList: { add() {}, toggle() {} } } };
vm.createContext(sandbox);
const stripped = appSrc
  .replace('import { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST,\n         YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } from "./engine.js";\n', "")
  .replace('import { loadTaxonomy } from "./taxonomy.js";\n', "")
  .replace('import { listMonthlyGochara, gocharaForBirth } from "./gochara.mjs";\n', "")
  .replace('import { listMonthlyGochara } from "./gochara.mjs";\n', "")
  .replace('import { getVerseOfDay, dayOfYear } from "./tirumandiram.mjs";\n', "")
  .replace('  try{ GOCHARA_RULES = await fetch("./rules/gochara_rules.json").then(r=>r.json()); }catch(e){ console.warn("gochara rules failed",e); }', '  GOCHARA_RULES = { rules: [], vedhaTable: [] };')
  .replace('  try{ TN_HOLIDAYS = await fetch("./rules/tn_holidays.json").then(r=>r.json()); }catch(e){ console.warn("tn holidays failed",e); }', '  TN_HOLIDAYS = { holidays: [] };')
  .replace('  try{ TN_BBOX = await fetch("./rules/tn_bbox.json").then(r=>r.json()); }catch(e){ console.warn("tn bbox failed",e); }', '  TN_BBOX = { bbox: {minLat:8.0,maxLat:13.6,minLon:76.1,maxLon:80.9} };')
  .replace('  try{ TIRUMANDIRAM = await fetch("./rules/tirumandiram_daily.json").then(r=>r.json()); }catch(e){ console.warn("tirumandiram daily failed",e); }', '  TIRUMANDIRAM = { entries: [] };')
  .replace('  try{ IN_CITIES = await fetch("./rules/in_cities.json").then(r=>r.json()); }catch(e){ console.warn("in_cities failed",e); }', '  IN_CITIES = { entries: [] };')
  .replace("\ninit();\n", "");
vm.runInContext(stripped, sandbox, { filename: "app.js" });
const e = await new Engine().init(); const TAX = await loadTaxonomy(); const geo = [80.27, 13.08, 0];

let pass = 0, fail = 0;
function t(name, cond, extra="") { if (cond) { pass++; } else { fail++; console.log(`  FAIL: ${name} ${extra}`); } }
function sum(tag) { console.log(`[${tag}] ${pass} pass / ${fail} fail`); pass=0; fail=0; }

const MATRIX = [{Y:2026,M:8},{Y:2026,M:9},{Y:2027,M:1}];
async function monthDays(Y, M, birthNak) {
  const dim = new Date(Y, M, 0).getDate(); const days = [];
  for (let d = 1; d <= dim; d++) days.push(e.computeDay(Y, M, d, geo, birthNak, 5.5));
  return days;
}
const cfOf = (d) => ({ adhikMaas: d.adhikMaas, kharmas: d.kharmas, pitruPaksha: d.pitruPaksha });
const birthNak = 0;      // Ashwini
const birthRashi = 0;    // Mesha (Ashwini padas span Mesha-1, Taurus-3; pada-1 → Mesha for the test profile)
const ev = (d, act, mode) => sandbox.scoreMuhurta(d, birthNak, act, { mode, calendarField: cfOf(d), birthRashi });

const GRIHA = TAX.toMuhurta(TAX.getActivity("ACT_REAL_GRIHA_PRAVESHA_NEW"));
const STARTUP = TAX.toMuhurta(TAX.getActivity("ACT_STARTUP_INCORPORATION"));
const MORTGAGE = TAX.toMuhurta(TAX.getActivity("ACT_FIN_TAKE_MORTGAGE"));

// ===================================================================
// INV-01 / INV-02 / INV-03  (a-simple-test-suite.md §1 + what-is-personal-mode.md)
// ===================================================================
console.log("\n=== INV pipeline invariants (3 months x 3 activities) ===");
for (const {Y,M} of MATRIX) {
  const days = await monthDays(Y, M, birthNak);
  for (const act of [GRIHA, STARTUP, MORTGAGE]) {
    const shubh = { full: new Set(), soft: new Set(), personal: new Set() };
    const base = {};
    for (const day of days) {
      for (const mode of ["full","soft","personal"]) if (ev(day,act,mode).chip === "Shubh") shubh[mode].add(day.iso);
      base[day.iso] = { f: ev(day,act,"full").score, s: ev(day,act,"soft").score };
    }
    // INV-01: Soft ⊇ Full ⊇ Personal (Option A — Personal must first qualify at Full)
    t(`INV-01 count ${act.id}`, shubh.full.size <= shubh.soft.size, `(${shubh.full.size}<=${shubh.soft.size})`);
    t(`INV-01 full⊆soft ${act.id}`, [...shubh.full].every(d=>shubh.soft.has(d)));
    t(`INV-01 personal⊆soft ${act.id}`, [...shubh.personal].every(d=>shubh.soft.has(d)));
    t(`INV-01 personal⊆full ${act.id}`, [...shubh.personal].every(d=>shubh.full.has(d)));
    // INV-03 : base score identical full vs soft (single impersonal universal base)
    const inv03 = Object.values(base).every(b => b.f === b.s);
    t(`INV-03 F==S base-score ${act.id}`, inv03);
    // INV-02: every day whose activity hardBlocker fires must REJECT in all 3 modes
    for (const day of days) {
      const v = ev(day,act,"full");
      if (v.tierHits.t1.length > 0) {
        const r = ["full","soft","personal"].map(m => ev(day,act,m).verdict);
        t(`INV-02 ${day.iso} t1-fired ${act.id}`, r.every(x=>x==="REJECTED"), `(${r.join(",")})`);
      }
    }
  }
}
sum("INV-0x");

// ===================================================================
// BND boundary / indexing  (a-simple-test-suite.md §2)
// ===================================================================
console.log("\n=== BND boundary & indexing ===");
const MRITYU_LOKA = [3,4,6,11]; // Cancer=3 Leo=4 Libra=6 Pisces=11 (0-indexed)

// BND-01: Rashi 0-index. Moon-in-Pisces (rashi 11) -> Bhadra Mrityu Loka.
{
  let ok = false;
  for (let Y=2026; Y<=2028 && !ok; Y++) for (let M=0; M<12 && !ok; M++) for (let d=1; d<=28; d++) {
    const jd = e.julday(Y, M+1, d, 12 - 5.5);
    const moonRashi = e.rashiOf(e.siderealLon(jd, e.swe.SE_MOON));
    if (moonRashi === 11) { // Pisces
      const loka = e.bhadraLoka(jd);
      ok = (loka === "mrityu");
      t("BND-01 Pisces(11)->Mrityu via bhadraLoka", ok, `(rashi=${moonRashi} loka=${loka})`);
      t("BND-01 rashiOf 0-indexed (Pisces=11)", moonRashi === 11);
      if (!ok) console.log("   (Pisces day", Y,M+1,d,"loka:", loka, ")");
      break;
    }
  }
  if (!ok) console.log("  (no Pisces-Moon day found to verify — rashiOf logic still 0-indexed checked)");
  const piscesLon = 11*30; // start of Pisces
  t("BND-01 rashiOf(Pisces start)=11", e.rashiOf(piscesLon) === 11, `got ${e.rashiOf(piscesLon)}`);
}

// BND-02: Nakshatra #1 (Ashwini) / #27 (Revati) wrap-around for tara modulo.
{
  let idxErr = 0;
  for (let janma=0; janma<27; janma++) for (let day=0; day<27; day++) {
    const count = ((day - janma) % 27 + 27) % 27 + 1; // 1..27
    const num = ((count - 1) % 9) + 1;                 // engine formula
    const nat = TARA_NATURE[num - 1];
    if (nat === undefined) idxErr++;
  }
  t("BND-02 tara modulo 27*27 no undefined", idxErr === 0, `(errs=${idxErr})`);
  const revToAsh = e.taraBala(26, 0);
  const ashToRev = e.taraBala(0, 26);
  t("BND-02 Revati->Ashwini wrap (tara=2, no IndexError)", revToAsh.number === 2 && TARA_NATURE[revToAsh.number-1] === "good", `(${revToAsh.number})`);
  t("BND-02 Ashwini->Revati wrap (tara=9)", ashToRev.number === 9 && TARA_NATURE[ashToRev.number-1] === "good", `(${ashToRev.number})`);
  t("BND-02 Janma tara==1 when same star", e.taraBala(5,5).number === 1, `(${e.taraBala(5,5).number})`);
}

// BND-03: civil-vara = calendar-date vara (no sub-day vara shift modeled at day granularity).
{
  const day = e.computeDay(2026, 8, 18, geo, birthNak, 5.5);
  t("BND-03 vara tied to civil date", day.vara === new Date(2026, 7, 18).getDay(), `(vara=${day.vara})`);
}

// BND-04: Kshaya tithi handling. Scan ~3 years of sunrise-ish tithis for any
// tithi-index jump > 1 without erroring.
{
  let kshayaFound = 0, errored = 0;
  let lastIdx = null;
  for (let Y=2026; Y<=2029; Y++) for (let M=0; M<12; M++) for (let d=1; d<=28; d++) {
    const jd = e.julday(Y, M+1, d, 6 - 5.5); // sunrise-ish (6am local)
    try {
      const tt = e.tithi(jd);
      if (lastIdx !== null) {
        const diff = (tt.index - lastIdx + 30) % 30;
        if (diff > 1) kshayaFound++; // skipped tithi
      }
      lastIdx = tt.index;
    } catch (err) { errored++; }
  }
  t("BND-04 kshaya handled no IndexError (3yr sweep)", errored === 0, `(errored=${errored})`);
  console.log("  (kshaya-like index jumps detected across 3yr:", kshayaFound, ")");
}
sum("BND");

// ===================================================================
// OVR override precedence matrix (a-simple-test-suite.md §3)
// ===================================================================
console.log("\n=== OVR override precedence ===");
const ovrTargetsT1 = Object.values(sandbox.OVERRIDE_TARGETS || {}).some(o => o.tiers && o.tiers.includes("t1"));
t("OVR-STRUCT: OVERRIDE_TARGETS never degrade T1 hard blockers", !ovrTargetsT1);

// OVR-01 Abhijit cannot override Bhadra Mrityu (T1 hard blocker).
{
  const days = await monthDays(2026, 8, birthNak);
  let hit = 0, overlap = 0;
  for (const day of days) {
    if (day.bhadra && day.bhadra.loka === "mrityu" && !day.bhadra.inPuchha) {
      hit++;
      if (day.isInsideAbhijit) overlap++;
      const v = ev(day, STARTUP, "full");
      t(`OVR-01 Bhadra-Mrityu rejects ${day.iso} (abhijit=${!!day.isInsideAbhijit})`,
        v.verdict === "REJECTED", `(${v.verdict}: ${v.reasons.join(",")})`);
    }
  }
  console.log(`  (checked ${hit} Bhadra-Mrityu days, ${overlap} also inside Abhijit)`);
}

// OVR-02 Asta Guru (combustion) cannot be rescued by override yogas for Samskara (Griha).
{
  const days = await monthDays(2026, 8, birthNak);
  let combust = 0, rescued = 0;
  const SYN = { ...GRIHA, overrides: [ ...(GRIHA.overrides||[]), "SARVARTTHA_SIDDHI" ] };
  for (const day of days) {
    if (day.combustion.guru || day.combustion.shukra) {
      combust++;
      for (const act of [GRIHA, SYN]) {
        const v = ev(day, act, "full");
        const hasHardT1 = v.tierHits.t1.length > 0;
        if (!hasHardT1) { t(`OVR-02 ${day.iso} t1 hard-blocker present (${act.id===SYN?"SYN":"griha"})`, false); continue; }
        const sarvFired = v.overrides.includes("SARVARTTHA_SIDDHI");
        t(`OVR-02 ${day.iso} combusted->REJECTED (${act.id===SYN?"override-token present":"griha"})`,
          v.verdict === "REJECTED", `(verdict=${v.verdict} overrides=${v.overrides.join(",")||"-"})`);
        if (sarvFired) console.log(`    (Sarvartha fired here yet verdict=${v.verdict})`);
        if (v.verdict !== "REJECTED") rescued++;
      }
    }
  }
  t("OVR-02 no hard-blocked day rescued by an override", rescued === 0, `(${rescued} rescued)`);
  console.log(`  (checked ${combust} combusted days for Griha + synthetic override)`);
}

// OVR-03 Dagdha Yoga neutralized by Sarvartha Siddhi (Startup has this override).
{
  let sarvDays = 0, sarvOnHard = 0;
  for (const {Y,M} of [...MATRIX, {Y:2026,M:10}, {Y:2027,M:3}]) {
    const days = await monthDays(Y, M, birthNak);
    for (const day of days) {
      const v = ev(day, STARTUP, "full");
      if (!v.overrides.includes("SARVARTTHA_SIDDHI")) continue;
      sarvDays++;
      if (v.tierHits.t1.length > 0) sarvOnHard++;
      if (v.tierHits.t1.length === 0) {
        t(`OVR-03 Sarvartha keeps dagdha-day alive ${day.iso}`, v.verdict !== "REJECTED",
          `(verdict=${v.verdict})`);
      }
    }
  }
  t("OVR-03 Sarvartha Siddhi engaged at least once (>=1 mo)", sarvDays >= 1, `(${sarvDays} days)`);
  console.log(`  (Sarvartha Siddhi active days: ${sarvDays}, also hard-blocked: ${sarvOnHard})`);
}

// OVR-04 Abhijit window neutralises daily temporal afflictions (Mortgage ABHIJIT_WINDOW).
{
  let abhijitDays = 0;
  for (const {Y,M} of MATRIX) {
    const days = await monthDays(Y, M, birthNak);
    for (const day of days) {
      if (day.isInsideAbhijit) {
        abhijitDays++;
        const v = ev(day, MORTGAGE, "full");
        const hasAbhijitOverride = v.overrides.includes("ABHIJIT_WINDOW");
        t(`OVR-04 Abhijit engages override ${day.iso}`, hasAbhijitOverride,
          `(overrides=${v.overrides.join(",")||"no-match"})`);
      }
    }
  }
  console.log(`  (${abhijitDays} Abhijit-window days, checked via Mortgage override)`);
}

// OVR-05 Tuesday vara (hard for Mortgage) overrides general yogas -> reject regardless of override.
{
  const days = await monthDays(2026, 8, birthNak);
  let tue = 0;
  for (const day of days) {
    if (day.vara === 2) {
      tue++; const v = ev(day, MORTGAGE, "full");
      t(`OVR-05 Tuesday mortgage REJECTED ${day.iso}`, v.verdict === "REJECTED",
        `(verdict=${v.verdict} overrides=${v.overrides.join(",")||"-"})`);
    }
  }
  console.log(`  (${tue} Tuesday days)`);
}
sum("OVR");

// ===================================================================
// PRS personal isolation (a-simple-test-suite.md §4 + what-is-personal-mode.md Option A)
// ===================================================================
console.log("\n=== PRS personal isolation ===");
// PRS-01 bad tara (Vipat/Pratyari/Vadha = 3rd/5th/7th) — personal NEVER Shubh, and REJECTED
//       even on a Full-qualified day ("even if slot passed FULL mode").
// PRS-02 Ashtama Chandra (Moon in 8th house from birth rashi) — REJECTED in personal.
// PRS-03 good tara (Sadhaka/Mitra/Parama Mitra/Sampat/Kshema) + Full-qualified -> Shubh.
{
  let badShubh = 0, badFullQualBlocked = 0, badFullQualDays = 0;
  let ashtamaShubh = 0, ashFullQualBlocked = 0, ashFullQualDays = 0;
  let goodFullQualShubh = 0, goodFullQualDays = 0;
  for (const {Y,M} of MATRIX) {
    const days = await monthDays(Y, M, birthNak);
    for (const day of days) {
      const n = day.tara ? day.tara.number : 0;
      const nat = n ? TARA_NATURE[n-1] : "neutral";
      const vp = ev(day, GRIHA, "personal");
      const vf = ev(day, GRIHA, "full");
      const fullQual = vf.chip === "Shubh";
      const house = ((day.moonRashi - birthRashi) % 12 + 12) % 12 + 1; // doc formula
      if (nat === "bad") {
        if (vp.chip === "Shubh") badShubh++;
        if (fullQual) { badFullQualDays++; if (vp.verdict === "REJECTED" || vp.chip === "Ashubh") badFullQualBlocked++; }
      }
      if (house === 8) {
        if (vp.chip === "Shubh") ashtamaShubh++;
        if (fullQual) { ashFullQualDays++; if (vp.chip === "Ashubh") ashFullQualBlocked++; }
        // personalMetrics consistency check on non-blocked days
        if (vp.personalMetrics) t(`PRS-02 ${day.iso} chandraHouse matches`, vp.personalMetrics.chandraHouse === 8);
      }
      if (nat === "good" && fullQual) {
        goodFullQualDays++;
        if (vp.chip === "Shubh") goodFullQualShubh++;
      }
    }
  }
  t("PRS-01 bad-tara personal never Shubh", badShubh === 0, `(${badShubh})`);
  t("PRS-01 bad tara rejects Full-qualified days", badFullQualBlocked === badFullQualDays, `(${badFullQualBlocked}/${badFullQualDays})`);
  t("PRS-02 Ashtama Chandra never Shubh", ashtamaShubh === 0, `(${ashtamaShubh})`);
  if (ashFullQualDays > 0) t("PRS-02 Ashtama rejects Full-qualified days", ashFullQualBlocked === ashFullQualDays, `(${ashFullQualBlocked}/${ashFullQualDays})`);
  else console.log("  (no Full-qualified Ashtama-Chandra day in matrix — unit check below)");
  t("PRS-03 good tara Full-qualified -> personal Shubh", goodFullQualDays === 0 || goodFullQualShubh >= 1, `(shubh=${goodFullQualShubh}/${goodFullQualDays})`);
  console.log(`  (badShubh=${badShubh} · badFullQualBlocked=${badFullQualBlocked}/${badFullQualDays} · ashFullQualBlocked=${ashFullQualBlocked}/${ashFullQualDays} · goodShubh=${goodFullQualShubh}/${goodFullQualDays})`);
}

// PRS-02 unit: chandraBala house math + Ashtama blocking on a crafted Full-qualified day.
{
  // house = ((moonRashi - birthRashi) % 12 + 12) % 12 + 1 ; birthRashi=0, moonRashi=7 -> house 8
  const mk = (moonRashi) => ({ iso: "u", y: 2026, m: 8, d: 1, moonRashi, tara: { number: 8, count: 9 },
    moonNakshatra: 0, tithiIndex: 0, tithi: { index: 0, paksha: "Shukla", name: TITHI_NAMES[0], amavasya: false, purnima: false },
    vara: 0, karana: { index: 0 }, yoga: { index: 0 },
    sankranti: false, adhikMaas: false, kharmas: false, pitruPaksha: false, eclipse: false,
    combustion: { guru: false, shukra: false }, bhadra: null, yogaBan: null, isInsideAbhijit: false,
    starEnd: null, moonLon: 0, rise: 2450000, set: 2450001 });
  const ACT = { name: "unit", id: "UNIT", nakshatras: [0], vara: [0], paksha: "both", badTithis: [], badKaranas: [6], hardBlockers: [], overrides: [] };
  const evU = (day) => sandbox.scoreMuhurta(day, birthNak, ACT, { mode: "personal", calendarField: {}, birthRashi });
  const v = evU(mk(7)); // 8th house moon, tara = Mitra (good)
  t("PRS-02 unit Ashtama Chandra rejects", v.verdict === "REJECTED", `(chip=${v.chip} reasons=${v.reasons.join(",")})`);
  const v9 = evU(mk(8)); // 9th house (favourable) — personal metrics must carry the house
  t("PRS-02 unit chandraHouse surfaced", v9.personalMetrics && v9.personalMetrics.chandraHouse === 9);
}
sum("PRS");

// === Diagnostic: soft-vs-full-vs-personal for Griha Aug (understand counts) ===
console.log("\n### DIAG soft-vs-full-vs-personal (Griha 2026-08)");
{
  const days = await monthDays(2026, 8, birthNak);
  let softN=0, fullN=0, persN=0;
  for (const day of days) {
    const f = ev(day, GRIHA, "full");
    const s = ev(day, GRIHA, "soft");
    const p = ev(day, GRIHA, "personal");
    if (s.chip === "Shubh") softN++;
    if (f.chip === "Shubh") fullN++;
    if (p.chip === "Shubh") persN++;
    console.log(`  ${day.iso} tara=${day.tara?TARA_NAMES[day.tara.number-1]: "?"} rashi=${day.moonRashi} scr=${f.score} full=${f.chip} soft=${s.chip} pers=${p.chip}${p.verdict==="REJECTED"?" [REJ]":""}`);
  }
  console.log(`  full=${fullN} soft=${softN} personal=${persN}`);
}

e.close();