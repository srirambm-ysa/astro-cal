# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-13 (Alliance Filter session)

**Session token count (current · Alliance Filter build + UI refinements):** REAL billed 1,058,529
(RAW 5,651,193 · 81.3% cache efficiency, 90.8% cache-hit share; 59 requests).

## Goal Accomplished (2026-08-13 · Vivaha marriage module — Ashtakoota matchmaking + muhurta engine · committed `ac11e22`)
- **Phase A — OCR verify** Ch.6 of *Muhurta Chintamani* (`reference/archive/vivaha/ch6_text.txt`, PDF pp.149–227); confirmed docs' "Chapter 3, Slokas 38–52" citations are fabricated — real source is Chapter 6.
- **Phase B — Rules:** `rules/marriage_rules.json` (schema `marriage-rules-v1`), fully self-contained (no reads of `activity_corpus.json`/`taxonomy.js`; day filters copied+source-corrected). 16 verseKeys resolve; source-corrected 7 docs bugs (Bhakoot bad offsets [1,4,5]; Tara auspicious remainders [1,2,4,6,8,0]; verified Graha Maitri matrix; only 3 source-attested Nadi pariharas; 11 marriage nakshatras incl. MOOLA; 6 Paata yogas; Ekargala Moon-star-odd-count rule). ~21 non-core doshas documented-but-not-implemented.
- **Phase C — Additive engine.js helpers ONLY:** `ascendant()`, `planetPosition(s)()`, `sunNakshatra()` inserted before the DAY COMPUTATION section. No other engine changes.
- **Phase D — Engine + UI:** `marriage.mjs` (pure Stage-1 `calculateAshtakoota` w/ 8-koota breakdown + pariharas → Stage-2 Vivaha doshas Latta/Jamitra/Paata/Ekargala + Sun+Moon-Lagna removal + day filters + dual personal filters (Naidhana Tara / Ashtama Chandra) + scoring + scan, fail-fast `skippedStage2` gating) and `marriage.html` two-tier UI (guna meter, parihara pills, provenance, ranked SHUBH dates w/ dosha audit). Browser-validated via Playwright (ELIGIBLE 29/36, SHUBH 2026-11-25 @87 w/ Jamitra removal).
- **Phase E — Tests:** `tests/marriage-tests.mjs` (37 assertions, 0 fail) + `tests/marriage-browser.mjs` (8 browser checks). `npm test` runs both suites.
- **Provenance:** registry extended with `ch6_vivaha` chapter + 17 confirmed verse entries; `LATTA_DOSHA_ACTIVE` upgraded unverified→confirmed. `tools/build_provenance.js` green (140 activities, 46 verse entries).
- **Alliance filter work is scoped but NOT built yet**: PRD drafted (`docs/alliance-filter-prd.md`); engine/UI/tests deferred to next session. Fixed-person ranked best-match calculator reusing `calculateAshtakoota` over 108 valid birth profiles.

## Goal Accomplished (this session — 2026-08-13 · calendar/UI polish + lay "why rejected" · committed `61b336d`)
- **Calendar cells** enlarged to square (60→84px min-height, `aspect-ratio:1/1`, print `auto`), full
  Devanagari tithi names (`.slice(0,6)` removed), weekend shading `.cell.weekend` (day saffron / night gold tint).
- **Dual-color scheme**: CSS vars `--panel-a/--panel-b` (day `#FFFFFF`/`#F1EEE5`, night `#2C3365`/`#232A55`);
  `applyCardShades()` alternates panels in page order starting light at `#app`; cream literals → `var(--paper)`/`var(--panel-a)`.
- **Header**: month/year now in cal-head (`#calTitle` Rozha One vermilion) above Tamil year; persona chip
  `#persona` (`★ Ashwini · Mesha`); edit moved into Birth profile (`#editBirthBtn`).
- **Muhurta dropdowns**: `Please select` placeholder + compute validation + clear reset.
- **Classical Foundation**: governing verses in `<details open>` (chapter·verse, `.prov-sans` Devanagari via
  **Eczar** — "Noto Sans Devanagari" was never loaded — English, applied logic, caveat). 139/140 activities have verses.
- **Source modal** (`#srcBtn`, disabled till all 3 selects set): provenance body (basis badge, chapter +
  rationale, all confirmed verses, integrity note) + copyable citation; close ×/Esc/backdrop; hidden in print.
- **Lay "why rejected"**: `rejectedReasons()` + `REJ_LABEL`/`REJ_ORDER` bucket every non-Shubh day
  (nakshatra/tithi/krishna/karana/bhadra/hard/vara/tara/chandra/score) into a `rejCounts` Map; ONE `.muhwhy`
  footer row after the table (or after the "No Shubh days" note). Verified via real `scoreMuhurta` in node
  (Higher Studies / Krittika / Aug 2026 → clean lay sentence). `node --check` + `npm test` (151/9/143/7) green.
- **Committed everything accumulated** (15 files, +1794/−180): includes prior sessions' engine tweak,
  `serve.js→serve.cjs`, `tests/` + docs, `package.json`.

## Goal Accomplished (2026-08-13 · personal-mode supersession per `what-is-personal-mode.md`)
- **`what-is-personal-mode.md` is the authoritative spec** for Personal-mode data generation;
  it supersedes the conflicting `PRD §2.6.7.3` "independent rhythm" wording, the
  `browser-testing-behavior.md` 85/65 thresholds, and the "design tension" left open in
  `muhurtha_debug.md`. Personal = compatibility layer `(Base) AND (Tara Bala) AND (Chandra Bala)`.
- **Owner decisions:** Option A (Personal ⊆ **Full**, base ≥ 80) · Full/Soft become **0% personal**
  (tara removed from the universal base) with doc thresholds `FULL=80/MADHYAMA=65/SOFT=60/PERSONAL=75`
  · reject ALL bad tara (Vipat/Pratyari/Vadha = 3rd/5th/7th).
- **Implemented:** `engine.js` day object gains `moonRashi`; `app.js` `scoreMuhurta` now computes
  Chandra Bala (favourable {1,3,6,7,10,11}+15, unfavourable {4,12}−10, **8th house = Ashtama
  Chandra → REJECT**), Option-A personal pipeline (`personalMetrics` returned, `Shubh ≥ 75`),
  non-personal sections carry zero personal weight.
- **Caught by the harness:** scores 70-79 leaked "Shubh" via `verdictToChip(GOOD)` in both the
  sub-Full personal branch and bad-tara 70-79 days → personal now enforces `chip` explicitly
  (`≥65 → Neutral` else `Ashubh` below the Full cutoff). Also fixed a latent showDetail bug
  (`v.tara.number` never existed on the return → `day.tara.number`).
- **Harness moved into repo** (`tests/tests-suite.mjs`, `tests/mode-summary.mjs`, `package.json`
  `test`/`modes`). **INV 151/151 · BND 9/9 · OVR 143/143 · PRS 7/7** (PRS-02 Ashtama now real).

## ACCEPTANCE CRITERION (owner) — mem_1786465597914_18jf1
- Muhurta table shows **only Shubh days** — still true.
- Per activity: **at most 3-5 Shubh days per month** for Full/Personal — holds (2026-08 full/soft/
  personal: Griha 2/4/1 · Startup 2/8/1 · Mortgage 1/1/1; Sep Griha 4/11/1; Jan Griha 4/8/1).
  `Personal ⊆ Full ⊆ Soft` holds on every month×activity. Soft (≥60) remains intentionally looser
  than the band — calibration lever, not a defect (see `muhurtha_debug.md` addendum).

## Goal Accomplished (this session — 2026-08-12 · mode-pipeline testing fix + mode invariant tests)
- **Validated the structural "mode inversion" bug** from `browser-testing-behavior.md` empirically:
  Soft always returned 0 Shubh (it wiped t2/t3 → max score 60 → never a Shubh chip), and
  Personal was a wildcard 9–14 days (it kept only tara → any good-tara day Shubh regardless
  of nakshatra/tithi/vara fit). Both broke `Count(Full) <= Count(Soft)` and `Personal ⊆ Soft`.
- **Fixed `scoreMuhurta`** to the owner-approved "unified base score + thresholds" design:
  - one universal base score computed from ALL tiers for every mode (INV-03);
  - universal hard blockers (T1) REJECT in all three modes (INV-02) — overrides never touch T1
    (structural guard `OVERRIDE_TARGETS` never lists tier `t1`, verified OVR-STRUCT);
  - mode selects the Shubh cut on that same score: `FULL_SHUBH=70` (unchanged full output),
    `SOFT_SHUBH=60` so `Full ⊆ Soft` (INV-01), `PERSONAL` must first pass Soft then rejects
    on bad tara (Naidhana/Vipat/Prahari) → `Personal ⊆ Soft` (PRS-01/02/03).
  - **Latent bug caught by the test**: the return hardcoded `chip: verdictToChip(verdict)`,
    silently overwriting the per-mode chip → reverted to propagate the computed `chip`.
- **Hard-blocker-first phase unchanged** → leak-harness Tests A/B/C (13/13, 2/2, 4/4) still green;
  no regression to full-mode verdicts (Aug Griha/Startup/Mortgage = 2/5/1, as before).
- Added `muhurtha_debug.md` (artifacts + next steps) and test harnesses in Temp/opencan
  (`tests-suite.mjs`: INV/BND/OVR/PRS).

## ACCEPTANCE CRITERION (owner) — mem_1786465597914_18jf1
- Muhurta table shows **only Shubh days** — done this session.
- Per activity: **at most 3-5 Shubh days per month**, across every mode (full/soft/personal). Aug-2026
  full-mode: Griha 2 Shubh, Startup 5 Shubh, Mortgage 1 Shubh — **within the 3-5 band**.
  NOTE (2026-08-12 testing session): full mode was left unchanged and still validates 2/5/1
  for Aug; Soft and Personal now correctly form a superset/subset of full (see
  `muhurtha_debug.md`). The strict "3-5 across every mode" band is only met for Aug full-mode;
  Soft (>=60) and Personal are intentionally looser (Soft ⊇ Full, Personal ⊂ Soft) and exceed 5
  for e.g. Startup (soft=10). That band is now a *calibration* task (next steps), not a
  structural defect — all mode invariants pass.

## Goal Accomplished (2026-08-13 · Alliance Filter — best-match calculator per `docs/alliance-filter-prd.md`)
- **`alliance-filter.mjs`**: pure module with `generateValidProfiles()` (108 canonical Moon-pada positions from 360/27° nakshatra spans), `computeAllianceWhitelist(input, rules, opts)` (pada-agnostic best per 36 valid nak×rashi pairs; ranking by isCompatible → marriageNakshatraFirst → totalScore → tier → parihara count → dosha severity), `toCSV()` and `toJSON()` exporters. Reuses `marriage.mjs#calculateAshtakoota`; validates fixed-person input for nakshatra/rashi/pada consistency.
- **`alliance-filter.html`**: fixed-person form (role, nakshatra, rashi, pada + "Show Up To" / min-score options), Tier 1 compatible-whitelist summary, Tier 2 ranked table showing **only compatible** profiles with marriage-nakshatra matches first, per-row 8-koota breakdown shown as a full-width row below, dosha/parihara pills, marriage-nakshatra flag, JSON/CSV export + browser print-to-PDF.
- **Navigation**: added "🔍 Alliance Filter" link in `marriage.html` header.
- **Tests**: `tests/alliance-filter-tests.mjs` (45 assertions, 0 fail) covering valid-profile generation, whitelist ranking, bride/groom roles, input validation, CSV/JSON export, score integration against `calculateAshtakoota`, min-score filter, and marriage-nakshatra preference sort. Wired into `npm test` via `package.json` (`test:alliance` also available).

## Goal Accomplished (this session — 2026-08-14 · Alliance Filter UI polish · committed `34e167b`)
- **Fixed tier badge class mismatch**: `tierBadge()` emitted `most-excellent`/`not-suitable`
  classes but CSS defined `.badge.most`/`.badge.poor` → MOST_EXCELLENT/NOT_SUITABLE rows
  rendered unstyled. Renamed CSS classes to match.
- **Added `@media print` block** (mirrors `index.html`): clean print-to-PDF — hides form,
  header, actions, progress, notes + `<details>`; exact print colors for badges/pills/koota.
- **Recommended Match banner** atop Tier 2: best compatible row (pair / score / tier /
  marriage-nak flag / dosha pills).
- **Fixed "Top Tier" stat** in Tier 1: was picking most-frequent tier, now highest present.
- **Merged redundant columns**: table's "Doshas" + "Pariharas" were duplicates (compatible
  rows always have `hasNadiDosha=false`, so the dosha column showed only "OK"); one column
  now reports canceled-parihara state directly. Removed dead `pariharaPills()`.
- **Calc button guarded** until rules load; added Muhurta Calendar (`index.html`) nav link.
- **Verified**: `npm test` 45/45 alliance (full suite green) + 14/14 Playwright browser
  checks on `alliance-filter.html` (load, compute, render, expand koota, badge styling).

## Immediate Next Steps
1. **NEXT PHASE (owner, deferred — do not start without owner)**: (a) **Audit print-to-PDF end-to-end and
   likely SIMPLIFY** — this session added many constructs (aspect-ratio override, muhwhy footer, modal hidden,
   cal-head title, panel vars) that must be re-verified against the printed output; (b) **ICS export discussion**
   needed: export **only Shubh muhurta days**, format/scope decision required before implementing.
2. Optional: verify remaining `proof:"unverified"` verses against `muhurtha-chinthamani.pdf` (unchanged).
3. **Calibrate Soft/Personal band (open):** Personal lands 1-4/month (strict subset of Full).
   If the owner wants more Personal days, tune impersonal T2 weights / `PERSONAL_SHUBH` — must
   preserve the Personal ⊆ Full ⊆ Soft construction (see `muhurtha_debug.md` addendum, lever #2).

## Architectural Decisions
- **Hard blockers first, overrides after, overrides can NEVER touch T1** (debugging-tips §1/§2).
- **Provenance = registry joined at runtime**, NOT embedded in corpus (avoids 140× verse duplication and
  `build_corpus.js` whitelist stripping). `provenance` corpus key stays as tier label; new data is
  `classical`/`verse_refs`.
- **Basis tiers**: `classical` (categorical confirmed verse) | `functional_group` (Ch.2 nakshatra class) |
  `formula` (panchanga math → vedic_panchang.pdf). `BHADRA_EARTH_ACTIVE` excluded from categorical
  promotion (it is universal). No `synthesized_analogy` tier — owner can't pundit-review, so modern
  activities are marked functional_group/formula honestly.
- **Authority for Bhadra Loka**: Sanskrit Sloka 46 > OCR English edition (variant documented in registry
  `meta.variants`).

## Watch Outs
- **Loka variant documented, not silently rewritten**: engine + PRD + classical_rule_architecture_mc.md
  now all say `[3,4,6,11]`; OCR archive (`reference/archive/250_rule_muhurta_engine/`) still says
  Aquarius — leave untouched, provenance registry records the dispute.
- **YAMA_GHANTA_ACTIVE + BHADRA_EARTH_ACTIVE are intentionally unmapped** in `toMuhurta` (Yama Ghanta is
  sub-day, can't score day-granular; Bhadra handled by the universal engine matrix) — `INTENTIONALLY_UNMAPPED`
  list silences the warning.
- **Soft mode still rejects hard-blocker days** (T1 → score 0) — intended per debugging-tips; soft only
  relaxes T2/T3. Personal also rejects hard-blocker days (T1 inherited) plus bad tara / Ashtama Chandra.
- Harness scripts now live in **repo** `tests/` (`tests-suite.mjs`, `mode-summary.mjs`; `package.json`
  `npm test` / `npm run modes`). Older leaked harness copies remain in `C:\Users\Sony\AppData\Local\Temp\opencode\`
  (`leak-harness.mjs`, `verify-tests.mjs`, `verify-provenance.mjs`, `verify-modes.mjs`) — not committed.
- **Drive backup**: OK 2026-08-13 (the 2026-08-12 `invalid_grant` was resolved by reconnecting rclone; `ocmem-sync.ps1` now completes). NEXT-PHASE topics (print-to-PDF audit + ICS export) are owner-deferred — see Immediate Next Steps #0.
- **Marriage module**: `marriage.html`/`marriage.mjs` import swisseph via `engine.js` — the browser smoke used a real engine init, so swisseph-wasm must keep loading under `node serve.cjs`. The ~21 documented-but-not-implemented doshas are logged in `rules/marriage_rules.json` (`documentedButNotImplemented`) with `isImplemented:false` so a future dosha pass can claim them; they do not affect current scoring. `docs/` remains untracked (pre-existing match-making spec `.md`s, not authored this session — leave for owner to stage).

## Pointer
- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: [`D:\astro-cal\PRD.md`](file:///D:/astro-cal/PRD.md)
- Corpus: `rules/activity_corpus.json` · Resolver: `taxonomy.js` · Build tool: `tools/build_corpus.js`
- Provenance registry: `reference/provenance_registry.json` · Build tool: `tools/build_provenance.js`
- Debug guide: `debugging-tips.md` · Provenance proposal: `need_for_provenance_adding.md`
- Old corpus archive: `reference/archive/250_rule_muhurta_engine/`
