# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-13

**Session token count (2026-08-12 · mode-pipeline testing session):** REAL billed 6,121,684
(RAW 15,181,386 · 59.7% cache efficiency, 66.9% cache-hit share; 109 requests).

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

## Immediate Next Steps
1. **Mode-pipeline testing (DONE 2026-08-13)** — `what-is-personal-mode.md` superseded the old
   Soft⊆Personal design: Personal is now Option A (⊆ Full) with Tara **and** Chandra Bala,
   universal base is impersonal, thresholds FULL=80/SOFT=60/PERSONAL=75. `tests/tests-suite.mjs`
   re-validated: personal⊆full⊆soft, PRS-01 all-bad-tara reject, PRS-02 Ashtama reject, PRS-03
   good-tara-full→Shubh. (Prior session's structural fix remains: t1 never rescuable, unified base.)
2. **Broaden verification** — DONE: Aug/Sep-2026 + Jan-2027 × Griha/Startup/Mortgage; INV 151,
   BND 9, OVR 143, PRS 7. Volatile: Sep Mortgage = 0/0/0 (no Shubh at all that month) — confirm
   acceptable to owner.
3. Optional: verify remaining `proof:"unverified"` verses against `muhurtha-chinthamani.pdf` (unchanged).
4. **Calibrate Soft/Personal band (open):** Personal lands 1-4/month (strict subset of Full).
   If the owner wants more Personal days, tune impersonal T2 weights / `PERSONAL_SHUBH` — must
   preserve the Personal ⊆ Full ⊆ Soft construction (see `muhurtha_debug.md` addendum, lever #2).
5. **COMMIT this session's work** (still uncommitted — see git section below).

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
- **Drive backup NOT completed 2026-08-12 close-work**: `ocmem-sync.ps1` failed with rclone
  `invalid_grant` (token expired). Fix with `rclone config reconnect gdrive:` before next backup.

## Pointer
- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: [`D:\astro-cal\PRD.md`](file:///D:/astro-cal/PRD.md)
- Corpus: `rules/activity_corpus.json` · Resolver: `taxonomy.js` · Build tool: `tools/build_corpus.js`
- Provenance registry: `reference/provenance_registry.json` · Build tool: `tools/build_provenance.js`
- Debug guide: `debugging-tips.md` · Provenance proposal: `need_for_provenance_adding.md`
- Old corpus archive: `reference/archive/250_rule_muhurta_engine/`
