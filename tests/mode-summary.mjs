import vm from "vm"; import fs from "fs"; import path from "path"; import { pathToFileURL } from "url";
const ROOT = "D:/astro-cal";
const appSrc = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
const j = (p) => pathToFileURL(path.join(ROOT, p)).href;
const { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST, DOW,
        YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } = await import(j("engine.js"));
const { loadTaxonomy } = await import(j("taxonomy.js"));
const sandbox = { console, Math, Date, Number, String, Array, Object, JSON, Promise, Map, Set,
  setTimeout, clearTimeout, Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST, DOW,
  YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP, loadTaxonomy,
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } };
sandbox.window = sandbox; sandbox.globalThis = sandbox; sandbox.Worker = undefined;
sandbox.document = { getElementById: () => null, querySelector: () => null,
  createElement: () => ({ classList: { add() {}, toggle() {} }, addEventListener() {}, appendChild() {}, style: {} }),
  body: { classList: { add() {}, toggle() {} } } };
vm.createContext(sandbox);
const stripped = appSrc
  .replace('import { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST,\n         YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } from "./engine.js";\n', "")
  .replace('import { loadTaxonomy } from "./taxonomy.js";\n', "").replace("\ninit();\n", "");
vm.runInContext(stripped, sandbox, { filename: "app.js" });
const e = await new Engine().init(); const TAX = await loadTaxonomy(); const geo = [80.27, 13.08, 0];
const birthNak = 0;      // Ashwini
const birthRashi = 0;    // Mesha
async function monthDays(Y, M, birthNak) { const dim = new Date(Y, M, 0).getDate(); const a=[]; for(let d=1;d<=dim;d++) a.push(e.computeDay(Y,M,d,geo,birthNak,5.5)); return a; }
const cfOf = d => ({ adhikMaas: d.adhikMaas, kharmas: d.kharmas, pitruPaksha: d.pitruPaksha });
const ev = (d, act, mode) => sandbox.scoreMuhurta(d, birthNak, act, { mode, calendarField: cfOf(d), birthRashi });

const GRIHA = TAX.toMuhurta(TAX.getActivity("ACT_REAL_GRIHA_PRAVESHA_NEW"));
const STARTUP = TAX.toMuhurta(TAX.getActivity("ACT_STARTUP_INCORPORATION"));
const MORTGAGE = TAX.toMuhurta(TAX.getActivity("ACT_FIN_TAKE_MORTGAGE"));
const ACTS = [["Griha",GRIHA],["Startup",STARTUP],["Mortgage",MORTGAGE]];
let allOk = true;
for (const {Y,M} of [{Y:2026,M:8},{Y:2026,M:9},{Y:2027,M:1}]) {
  const days = await monthDays(Y, M, birthNak);
  for (const [id,act] of ACTS) {
    const n = {full:0,soft:0,personal:0};
    const sets = {full:new Set(),soft:new Set(),personal:new Set()};
    for (const day of days) for (const m of ["full","soft","personal"]) if (ev(day,act,m).chip==="Shubh") { n[m]++; sets[m].add(day.iso); }
    const hier_ok = n.full <= n.soft
      && [...sets.full].every(d=>sets.soft.has(d))
      && [...sets.personal].every(d=>sets.soft.has(d))
      && [...sets.personal].every(d=>sets.full.has(d)); // Option A: Personal ⊆ Full
    if (!hier_ok) allOk = false;
    const softFixed = n.soft > 0;
    console.log(`${Y}-${String(M).padStart(2,"0")} ${id}: full=${n.full} soft=${n.soft} personal=${n.personal} | hier=${hier_ok} soft>0=${softFixed}`);
  }
}
console.log("\nOverall hierarchy (Personal ⊆ Full ⊆ Soft) OK:", allOk);
e.close();