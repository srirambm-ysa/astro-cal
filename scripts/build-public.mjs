#!/usr/bin/env node
// Build public/ allowlist — only files needed in production are copied.
// Nothing else (docs/, tools/, reference/ extras, tests/, etc.) is deployed.
// Run: node scripts/build-public.mjs  (or npm run build)

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

// --- allowlist: exact files/dirs that ARE public ---
// Keep this minimal; every fetch/import/href/src in the HTML/JS must be covered.
const FILES = [
  // html
  "index.html",
  "muhurta.html",
  "marriage.html",
  "guna-milap.html",
  "catalog.html",
  "help-calendar.html",
  "help-muhurta.html",
  "help-marriage.html",
  "help-guna-milap.html",
  // js/css/svg at root
  "app.js",
  "muhurta.js",
  "muhurta-scoring.mjs",
  "engine.js",
  "ephemeris.worker.js",
  "marriage.worker.js",
  "worker-client.mjs",
  "marriage.mjs",
  "guna-milap.mjs",
  "gochara.mjs",
  "nitya.mjs",
  "tirumandiram.mjs",
  "taxonomy.js",
  "fonts.css",
  "vectors.css",
  "favicon-calendar.svg",
  "favicon-marriage.svg",
  "favicon-guna-milap.svg",
  "tirumoolar.webp",
];

const DIRS = [
  // vendor — only inner files needed (not whole vendor/)
  { src: "vendor/swisseph", dest: "vendor/swisseph" },
  { src: "vendor/fonts", dest: "vendor/fonts" },
  { src: "assets", dest: "assets" },
  { src: "rules", dest: "rules" },
  { src: "nityas-webp", dest: "nityas" },
  // reference — only provenance_registry.json (fetched by taxonomy.js), not PDFs
  // handled as single file below
];

const SINGLE_FILES = [
  { src: "reference/provenance_registry.json", dest: "reference/provenance_registry.json" },
];

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function copyFile(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(PUBLIC, destRel);
  ensureDir(path.dirname(dest));
  if (!fs.existsSync(src)) {
    console.error(`MISSING: ${srcRel} (skipping)`);
    process.exitCode = 1;
    return;
  }
  fs.copyFileSync(src, dest);
}
function copyDir(srcRel, destRel) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(PUBLIC, destRel);
  if (!fs.existsSync(src)) {
    console.error(`MISSING DIR: ${srcRel}`);
    process.exitCode = 1;
    return;
  }
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      // recurse
      copyDir(path.join(srcRel, entry.name), path.join(destRel, entry.name));
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function clean() {
  if (fs.existsSync(PUBLIC)) {
    fs.rmSync(PUBLIC, { recursive: true, force: true });
  }
  ensureDir(PUBLIC);
}

clean();
for (const f of FILES) copyFile(f, f);
for (const {src,dest} of DIRS) copyDir(src, dest);
for (const {src,dest} of SINGLE_FILES) copyFile(src, dest);
// cache-bust: force no-store for html/js/mjs/css on Cloudflare Pages / Workers Sites
fs.writeFileSync(path.join(PUBLIC, "_headers"), `/*.html\n  Cache-Control: no-store, no-cache, must-revalidate\n/*.js\n  Cache-Control: no-store, no-cache, must-revalidate\n/*.mjs\n  Cache-Control: no-store, no-cache, must-revalidate\n/*.css\n  Cache-Control: no-store, no-cache, must-revalidate\n`);

// summary
function walk(dir, base=PUBLIC) {
  let c=0, bytes=0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { const r=walk(p, base); c+=r.c; bytes+=r.bytes; }
    else { c++; bytes+=fs.statSync(p).size; }
  }
  return { c, bytes };
}
const { c, bytes } = walk(PUBLIC);
console.log(`public/ built: ${c} files, ${(bytes/1024).toFixed(1)} KB`);
console.log("Allowlist: html+js/css + vendor/swisseph + vendor/fonts + assets + rules/*.json + reference/provenance_registry.json");
console.log("NOT deployed: docs/, tools/, tests/, experiments/, reference/*.pdf, *.md, etc.");
