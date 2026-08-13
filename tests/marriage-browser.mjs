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

  await page.click("#calcBtn");
  await page.waitForTimeout(3500); // wait for scan (~30 days)

  const resultHtml = await page.innerHTML("#result");

  check("no console/page errors", errors.length === 0, errors.join("; "));
  check("Tier 1 ELIGIBLE badge", resultHtml.includes("ELIGIBLE"), "got:\n" + resultHtml.slice(0, 600));
  check("Tier 1 score 29/36", resultHtml.includes("29"), "expected 29 total");
  check("Tier 2 rendered", resultHtml.includes("Tier 2"), "tier2 missing");
  check("SHUBH date found", resultHtml.includes("SHUBH"), "no SHUBH date");
  check("2026-11-25 present", resultHtml.includes("2026-11-25"), "shubh date not found");
  check("Guna meter rendered", resultHtml.includes("meter"), "meter missing");
  check("Provenance details", resultHtml.includes("Classical Provenance"), "provenance missing");
} finally {
  await browser.close();
  server.kill();
}

process.exitCode = failures ? 1 : 0;
console.log(failures === 0 ? "\nALL BROWSER CHECKS PASSED" : `\n${failures} BROWSER CHECK(S) FAILED`);
