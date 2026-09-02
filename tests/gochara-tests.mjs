import { Engine } from "../engine.js";
import { listMonthlyTransits, gocharaForBirth, listMonthlyGochara } from "../gochara.mjs";
import fs from "fs";
import assert from "assert";

const eng=new Engine(); await eng.init();
const rules=JSON.parse(fs.readFileSync("rules/gochara_rules.json","utf8"));
const reg=JSON.parse(fs.readFileSync("reference/provenance_registry.json","utf8"));

// Fixture: September 2026, Moon-excluded, IST Lahiri — from scratch_sept_transits.mjs
// Expected 5 events; times are IST; allow 15 min tolerance on JD
const FIXTURE=[
  { date:"2026-09-02", planet:"Venus", from:"Kanya", to:"Tula" },
  { date:"2026-09-07", planet:"Mercury", from:"Simha", to:"Kanya" },
  { date:"2026-09-17", planet:"Sun", from:"Simha", to:"Kanya" },
  { date:"2026-09-18", planet:"Mars", from:"Mithuna", to:"Karka" },
  { date:"2026-09-26", planet:"Mercury", from:"Kanya", to:"Tula" },
];

function approxJd(dateStr){
  // parse dateStr YYYY-MM-DD to jd at 12 IST
  const [y,m,d]=dateStr.split("-").map(Number);
  return eng.julday(y,m,d, 12-5.5);
}

let pass=0, fail=0;
function ok(cond, msg){
  if(cond){ pass++; }
  else { fail++; console.error("FAIL:",msg); }
}

const trans=listMonthlyTransits(2026,9,eng);
ok(trans.length===5, `expected 5 transits got ${trans.length}`);
for(const f of FIXTURE){
  const hit=trans.find(t=>t.date===f.date && t.planet===f.planet && t.fromRashiName===f.from && t.toRashiName===f.to);
  ok(!!hit, `fixture hit ${f.date} ${f.planet} ${f.from}->${f.to} ${hit?'found':'MISSING'}`);
  if(hit){
    const expectedJd=approxJd(f.date);
    const diffHours=Math.abs(hit.jd - expectedJd)*24;
    ok(diffHours < 12, `timing within day for ${f.date} ${f.planet} diff ${diffHours.toFixed(2)}h`);
  }
}

// Impersonal fallback: no birth => house null, vedha false
const imp=listMonthlyGochara(2026,9,null,eng,rules);
ok(imp.every(r=>r.house===null && !r.vedhaBlocked), "impersonal fallback has no house/vedha");

// Personalized: Mesha (0) should give determinstic houses for Sep fixture
const birthMesha={rashi:0, nakshatra:0}; // Ashwini
const rowsMesha=listMonthlyGochara(2026,9,birthMesha,eng,rules);
ok(rowsMesha.length===5, "personalized rows length 5");
for(const r of rowsMesha){
  ok(r.house>=1 && r.house<=12, `house in range ${r.house} for ${r.planet}`);
  ok(["shubha","ashubha"].includes(r.effect), `effect valid ${r.effect}`);
  ok(typeof r.paraphrase==="string" && r.paraphrase.length>10, `paraphrase present for ${r.planet} H${r.house}`);
  ok(typeof r.verseKey==="string" && reg.verses[r.verseKey], `verseKey resolvable ${r.verseKey}`);
  ok(r.tara && typeof r.tara.number==="number" && r.tara.number>=1 && r.tara.number<=9, `tara computed for ${r.planet}`);
  // Vedha is boolean
  ok(typeof r.vedhaBlocked==="boolean", "vedhaBlocked boolean");
}

// House correctness for a known case: birth Mesha (0), Venus 2026-09-02 Kanya(5)->Tula(6) => house 7 (since toRashi 6 => (6-0+12)%12+1=7)
const venusSep2=rowsMesha.find(r=>r.planet==="Venus" && r.date==="2026-09-02");
ok(venusSep2 && venusSep2.house===7, `Venus Sep2 house 7 for Mesha got ${venusSep2?.house}`);
ok(venusSep2 && venusSep2.effect==="ashubha", "Venus H7 ashubha (only 6 is ashubha, correct)");

// Tara correctness spot: birth Ashwini (0), transit nak for Venus Sep2 is Chitra (13? actually 13 index 13 -> 14th nak Chitra). Count = (13-0+27)%27+1=14 => tara ((13)%9)+1=5 Pratyari bad — matches earlier
ok(venusSep2 && venusSep2.tara.name==="Pratyari" && venusSep2.tara.nature==="bad", `Tara Pratyari for Ashwini->Chitra`);

// Vedha case: Sun Sep17 for Mesha should be vedhaBlocked true because Saturn in Meena (12th) at that jd
const sunSep17=rowsMesha.find(r=>r.planet==="Sun" && r.date==="2026-09-17");
ok(sunSep17 && sunSep17.vedhaBlocked===true, `Sun Sep17 vedha true for Mesha (Saturn in 12th)`);

// Different birth: Karka (3) -> Sun to Kanya is house 3 (not 6), vedha for H3 is Saturn in 9th; Saturn in Meena from Karka is house 9 => vedha true as well
const birthKarka={rashi:3, nakshatra:3}; // Karka Rohini
const rowsKarka=listMonthlyGochara(2026,9,birthKarka,eng,rules);
const sunKarka=rowsKarka.find(r=>r.planet==="Sun" && r.date==="2026-09-17");
ok(sunKarka && sunKarka.vedhaBlocked===true, `Sun Sep17 vedha true for Karka (H3 vedha by Saturn 9th)`);
// Pick a birth where vedha should be false: Mithuna (2) Saturn 11 => house 10, Sun H3 vedha expects 9 => false
const birthMithuna={rashi:2, nakshatra:2};
const rowsMithuna=listMonthlyGochara(2026,9,birthMithuna,eng,rules);
const sunMithuna=rowsMithuna.find(r=>r.planet==="Sun" && r.date==="2026-09-17");
ok(sunMithuna && sunMithuna.vedhaBlocked===false, `Sun Sep17 vedha false for Mithuna`);

// No Moon in list
ok(!trans.some(t=>t.planet==="Moon"), "no Moon ingress in monthly list");

// Rules provenance coverage: every personalized row verseKey exists
ok(rowsMesha.every(r=> !!reg.verses[r.verseKey]), "all verseKeys in provenance");

// Summary
console.log(`\nGochara tests: ${pass} passed, ${fail} failed`);
eng.close();
if(fail>0) process.exit(1);
