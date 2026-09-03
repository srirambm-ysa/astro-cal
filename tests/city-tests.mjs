import fs from "fs";
let pass=0,fail=0;
function t(name,cond,extra=""){ if(cond) pass++; else {fail++; console.log(`  FAIL: ${name} ${extra}`)}}
const j=JSON.parse(fs.readFileSync("rules/in_cities.json","utf8"));
console.log("\n=== City tests (in_cities.json) ===");
t("schema in-cities-v1", j.schema==="in-cities-v1");
t("provenance present", !!j.provenance && j.provenance.license.includes("MIT"));
t("count 382", j.entries.length===382, `got ${j.entries.length}`);
t("Chennai present", j.entries.some(e=>e.city==="Chennai"));
t("Madurai present", j.entries.some(e=>e.city==="Madurai"));
t("Coimbatore present", j.entries.some(e=>e.city==="Coimbatore"));
t("Tiruchirappalli present", j.entries.some(e=>e.city==="Tiruchirappalli"));
t("Salem present", j.entries.some(e=>e.city==="Salem"));
t("Palani fallback", j.entries.some(e=>e.city==="Palani"));
t("Kanchipuram fallback", j.entries.some(e=>e.city==="Kanchipuram"));
t("Tiruvannamalai fallback", j.entries.some(e=>e.city==="Tiruvannamalai"));
t("Rameswaram fallback", j.entries.some(e=>e.city==="Rameswaram"));
t("all have lat/lng numbers", j.entries.every(e=> typeof e.lat==="number" && typeof e.lng==="number"));
t("all have city_ascii", j.entries.every(e=> typeof e.city_ascii==="string" && e.city_ascii.length>0));
t("no diacritic leftover in city", j.entries.every(e=> !/[\u0300-\u036f]/.test(e.city)));
t("quick chips exist", ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem"].every(n=> j.entries.some(e=>e.city_ascii===n)));
// search logic (mirrors app.js cityMatches)
function cityMatches(q){
  const s=q.trim().toLowerCase();
  if(!s) return j.entries.slice(0,8);
  return j.entries.filter(e=> e.city_ascii.toLowerCase().includes(s) || e.city.toLowerCase().includes(s) || e.admin_name.toLowerCase().includes(s)).slice(0,12);
}
t("search mad => Madurai", cityMatches("mad").some(e=>e.city==="Madurai"));
t("search palani => Palani", cityMatches("palani").some(e=>e.city==="Palani"));
t("search tiru => Tiruchirappalli+Tirunelveli", cityMatches("tiru").length>=2);
t("search empty => 8", cityMatches("").length===8);
t("search kanchi => Kanchipuram", cityMatches("kanchi").some(e=>e.city==="Kanchipuram"));
console.log(`[CITY] ${pass} pass / ${fail} fail`);
if(fail) process.exit(1);
