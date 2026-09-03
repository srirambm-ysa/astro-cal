// tests/nitya-tests.mjs — Sodashi Tithi Nitya mirror + mantra shape
import fs from 'fs';
import { nityaForTithiIndex } from '../nitya.mjs';

const j = JSON.parse(fs.readFileSync('./rules/nitya_devis.json', 'utf8'));

function assert(cond, msg) {
  if (!cond) { console.error(`FAIL: ${msg}`); process.exitCode = 1; }
  else { console.log(`PASS: ${msg}`); }
}

console.log("=== Nitya tests (pedagogic Kṛṣṇa-forward) ===");

const key = (idx) => nityaForTithiIndex(idx, j)?.key;
const entry = (idx) => nityaForTithiIndex(idx, j);

// corpus length
assert(j.entries.length === 16, `corpus has 16 entries (got ${j.entries.length})`);
assert(j.mapping.convention === 'pedagogic-krishna-forward', 'mapping.convention is pedagogic-krishna-forward');
assert(j.entries[15].key === 'maha_tripura_sundari', 'last entry is maha_tripura_sundari');

// Tvarita crown invariant
assert(key(7) === 'tvarita', 'Shukla Ashtami (7) == tvarita');
assert(key(22) === 'tvarita', 'Krishna Ashtami (22) == tvarita');
assert(key(7) === key(22), 'Tvarita invariant both pakshas');

// Maha on Purnima/Amavasya
assert(key(14) === 'maha_tripura_sundari', 'Purnima (14) == maha');
assert(key(29) === 'maha_tripura_sundari', 'Amavasya (29) == maha');

// Spot checks per spec §3 table
assert(key(0) === 'chitra', 'Shukla Pratipad (0) == chitra');
assert(key(1) === 'jvalamalini', 'Shukla Dvitiya (1) == jvalamalini');
assert(key(2) === 'sarvamangala', 'Shukla Tritiya (2) == sarvamangala');
assert(key(3) === 'vijaya', 'Shukla Chaturthi (3) == vijaya');
assert(key(13) === 'bhagamalini', 'Shukla Chaturdashi (13) == bhagamalini');
assert(key(15) === 'kameshwari', 'Krishna Pratipad (15) == kameshwari');
assert(key(16) === 'bhagamalini', 'Krishna Dvitiya (16) == bhagamalini');
assert(key(28) === 'jvalamalini', 'Krishna Chaturdashi (28) == jvalamalini');

// For k != 7 and k < 14, Shukla vs same-k Krishna differ (reverse)
let diffOk = true;
for (let k = 0; k < 14; k++) {
  if (k === 7) continue;
  if (key(k) === key(15 + k)) { diffOk = false; console.error(`FAIL: same k ${k} same nitya ${key(k)}`); }
}
assert(diffOk, 'For k!=7, k<14: nitya(k) != nitya(15+k)');

// kala+bija present on all entries
let kalaOk = true;
for (const e of j.entries) {
  if (!e.kalaName || !e.bija) { kalaOk = false; console.error(`FAIL: missing kala/bija ${e.key}`); }
}
assert(kalaOk, 'All entries have kalaName + bija');

// mantra shape: non-maha/tvarita must contain Pūjayāmi Tarpayāmi, exceptions for Tvarita/Jvala/Maha
let mantraOk = true;
for (const e of j.entries) {
  const m = e.mantraTarpana || '';
  const isException = ['tvarita','jvalamalini','maha_tripura_sundari'].includes(e.key);
  const hasPhrase = m.includes('Pūjayāmi') || m.includes('Pujayami') || m.includes('Pūjayāmi') || m.includes('Pujayami') || m.includes('Pūjayāmi') || m.toLowerCase().includes('pujayami') || m.includes('Phaṭ') || m.includes('Phat');
  // normalize: check for Pujayami case-insensitive
  const hasPujayami = m.toLowerCase().includes('pujayami') || m.includes('Pūjayāmi');
  if (!isException && !hasPujayami) { mantraOk = false; console.error(`FAIL: mantra missing Pujayami ${e.key}: ${m.slice(0,60)}`); }
  if (!mantraOk) break;
}
assert(mantraOk, 'Mantras contain Pujayami or canonical exception (Tvarita/Jvala/Maha)');

// display non-empty
let displayOk = j.entries.every(e => e.display && e.display.length > 2);
assert(displayOk, 'All entries have display name');

if (process.exitCode) {
  console.error("\nNitya tests: FAILED");
} else {
  console.log("\nNitya tests: all passed");
}
