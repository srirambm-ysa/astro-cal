import { getVerseOfDay, dayOfYear } from "../tirumandiram.mjs";
import fs from "fs";
const corpus = JSON.parse(fs.readFileSync("rules/tirumandiram_daily.json","utf8"));
let pass=0,fail=0;
function t(name,cond,extra=""){ if(cond) pass++; else {fail++; console.log(`  FAIL: ${name} ${extra}`)}}

console.log("\n=== Tirumandiram daily tests ===");
t("corpus 365", corpus.entries.length===365, `got ${corpus.entries.length}`);
t("first is 1", corpus.entries[0].n===1);
t("schema", corpus.schema==="tirumandiram-daily-v1");
t("Jan1 => verse 1", getVerseOfDay(2026,1,1,corpus).n===1);
t("Dec31 => verse 365", getVerseOfDay(2026,12,31,corpus).n===corpus.entries[364].n);
t("dayOfYear Jan1=1", dayOfYear(2026,1,1)===1);
t("dayOfYear Dec31 2026=365", dayOfYear(2026,12,31)===365);
t("leap Dec31 2024=366 wraps to verse 1", getVerseOfDay(2024,12,31,corpus).n===1);
t("Sep3 2026 deterministic", getVerseOfDay(2026,9,3,corpus).n===2046);
t("all verses have ta+en", corpus.entries.every(v=>v.ta && v.en));
console.log(`[TIRUMANDIRAM] ${pass} pass / ${fail} fail`);
if(fail) process.exit(1);
