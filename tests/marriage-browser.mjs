import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
import { spawn } from "node:child_process";

const server = spawn("node", ["serve.cjs"], { cwd: process.cwd(), env: { ...process.env, PORT: 8125 } });
await new Promise((r) => setTimeout(r, 900));

let failures = 0;
function check(name, cond, extra = "") {
  if (cond) {
    console.log(`  PASS: ${name}`);
  } else {
    console.log(`  FAIL: ${name} ${extra}`);
    failures++;
  }
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push(String(err)));

  await page.goto("http://127.0.0.1:8125/marriage.html", { waitUntil: "networkidle" });

  await page.selectOption("#gNak", "1");   // Ashwini
  await page.selectOption("#gRashi", "1"); // Mesha
  await page.selectOption("#gPada", "1");
  await page.selectOption("#bNak", "4");   // Mrigashira
  await page.selectOption("#bRashi", "4"); // Karka
  await page.selectOption("#bPada", "1");
  await page.fill("#fromDate", "2026-11-01");
  await page.fill("#toDate", "2026-11-30");

  check("datesBtn starts disabled", await page.isDisabled("#datesBtn"), "expected disabled before compat");
  check("compatBtn enabled", await page.isEnabled("#compatBtn"), "expected enabled");

  // ---- Step 1: Calculate Compatibility (no date scan) ----
  await page.click("#compatBtn");
  await page.waitForTimeout(300);

  let tier1Html = await page.innerHTML("#result");
  check("no console/page errors", errors.length === 0, errors.join("; "));
  check("Tier 1 ELIGIBLE badge", tier1Html.includes("ELIGIBLE"), "got:\n" + tier1Html.slice(0, 600));
  check("Tier 1 score 29/36", tier1Html.includes("29"), "expected 29 total");
  check("no Tier 2 yet", !tier1Html.includes("Tier 2"), "Tier 2 rendered before date scan");
  check("Guna meter rendered", tier1Html.includes("meter"), "meter missing");
  check("Provenance details", tier1Html.includes("Classical Provenance"), "provenance missing");
  check("datesBtn enabled after eligible compat", await page.isEnabled("#datesBtn"), "expected enabled");

  // editing a natal field re-disables the date search
  await page.selectOption("#bPada", "2");
  await page.waitForTimeout(100);
  check("datesBtn disabled after input change", await page.isDisabled("#datesBtn"), "expected disabled");
  await page.selectOption("#bPada", "1");
  await page.click("#compatBtn");
  await page.waitForTimeout(200);
  check("datesBtn re-enabled after re-compat", await page.isEnabled("#datesBtn"), "expected enabled");

  // ---- Step 2: Find Shubh Dates (progress bar + label) ----
  const progressSnapshots = [];
  const probe = async () => {
    const w = await page.$eval("#progress > div", (el) => el.style.width);
    const label = await page.$eval("#progressLabel", (el) => el.textContent);
    progressSnapshots.push(`${w}|${label}`);
  };
  const probeTimer = setInterval(probe, 150);

  await page.click("#datesBtn");
  await page.waitForTimeout(200);
  check("datesBtn disabled during scan", await page.isDisabled("#datesBtn"), "expected disabled");
  await page.waitForFunction(
    () => document.getElementById("tier2wrap") && document.getElementById("tier2wrap").innerHTML.includes("Tier 2"),
    null,
    { timeout: 60000 },
  );
  clearInterval(probeTimer);

  const resultHtml = await page.innerHTML("#result");
  check("Tier 2 rendered", resultHtml.includes("Tier 2"), "tier2 missing");
  check("SHUBH date found", resultHtml.includes("SHUBH"), "no SHUBH date");
  check("2026-11-25 present", resultHtml.includes("2026-11-25"), "shubh date not found");

  const sawProgress = progressSnapshots.some((s) => {
    const [w, label] = s.split("|");
    return w !== "0%" && /please wait|computing|\d+%/.test(label);
  });
  check("progress % + 'computing dates' text shown", sawProgress, "no progress captured:\n" + progressSnapshots.slice(0, 6).join("\n"));

  await page.waitForTimeout(1100); // allow 800ms reset timeout
  const labelAfter = await page.$eval("#progressLabel", (el) => el.textContent);
  const barAfter = await page.$eval("#progress > div", (el) => el.style.width);
  check("progress reset after done", labelAfter === "" && (["0%", "0px", ""].includes(barAfter)), `label="${labelAfter}" bar="${barAfter}"`);
  check("datesBtn re-enabled after scan", await page.isEnabled("#datesBtn"), "expected enabled");
} finally {
  await browser.close();
  server.kill();
}

process.exitCode = failures ? 1 : 0;
console.log(failures === 0 ? "\nALL BROWSER CHECKS PASSED" : `\n${failures} BROWSER CHECK(S) FAILED`);
