# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-11

**Session token count (2026-08-11 · wrap-up session):** REAL billed 161,066 (RAW 1,144,183 · 85.9% cache efficiency)

## Goal Accomplished (this session — 2026-08-11 · scoring engine + restructure)
- **Corpus pivot: 250-rule engine → 17-domain file corpus** (prior session): old corpus archived to
  `reference/archive/250_rule_muhurta_engine/`; `tools/build_corpus.js` generates
  `rules/activity_corpus.json` (**140 activities, 18 domains**, 3 tiers: 52 JSON / 73 prose / 15 summary).
- **Built `taxonomy.js`** resolver + `toMuhurta(activity)` adapter (pure ESM, browser + Node);
  validated in Node (18 domains; `ACT_REAL_GRIHA_PRAVESHA_NEW` → DOM_REAL_ESTATE_CONSTRUCTION).
- **Built the §2.6 v1.0 scoring engine in `app.js`**: `scoreMuhurta()` (T1/T2/T3 tier hits, weights,
  verdict buckets REJECTED…EXCELLENT, chip mapping), `OVERRIDE_EVALUATORS` registry
  (SARVARTTHA_SIDDHI / SIDDHA_YOGA / ABHIJIT_WINDOW / BHADRA_TAIL / BENEFIC_RESCUE), `applyOverrides`
  (downgrade worst hit), **selection modes full/soft/personal** (`SELECTION_MODES`, `view.mode`),
  calendar-field pushdown (adhikMaas/kharmas/pitruPaksha/eclipse), time-bounded windows via
  `day.starEnd`. Old `muhurtaVerdict` kept as a thin wrapper.
- **Web Worker offload**: `ephemeris.worker.js` runs swisseph range scans off the UI thread
  (`computeRangeViaWorker`, main-thread fallback); `engine.js` grew `Engine.computeDay` (single
  source of truth incl. bhadra/yogaBan/tara/starEnd/calendar fields).
- **UI restructure**: muhurta card moved ABOVE the calendar; 3-level cascade **Domain → Sub-domain →
  Task** backed by the corpus; `view.activity` stores `ACT_*` ids with `LEGACY_ACTIVITY` migration;
  day-detail panel shows score/verdict + tier breakdown + overrides + window. `node --check` passes
  on app.js / taxonomy.js / engine.js / ephemeris.worker.js.

## OPEN BUG — semantic scoring, DEBUG NEXT SESSION (mem_1786464631841_uobbm)
- **Full mode:** all days show as **Shubh** (GOOD/EXCELLENT) — nothing surfaces as Ashubh/REJECTED.
- **Soft mode:** all days show **Neutral** with only 2 Shubh days.
- **Personal mode:** all days show **Neutral**.
- **CONFIRMED BUG (mem_1786465456203_369tw):** `engine.js:619` `isInsideAbhijit` is **always true** —
  the "window overlaps daylight" check is tautological (Abhijit centered on solar noon, always between
  rise/set). taxonomy.js:44 wires `ABHIJIT_MUHURTA → ABHIJIT_WINDOW`; if any corpus activity gains that
  override, `applyOverrides` downgrades the worst hit EVERY day → nothing rejects → all-Shubh. Owner
  hypothesis confirmed. Currently NO corpus entry carries `cancellation_overrides` (empty), so this is
  NOT today's cause — but fix the flag (should test a concrete time inside the window, or carry the
  per-day window and let the evaluator decide) before populating overrides.
- Likely current cause (unverified): scoring bands + ✓-accounting inflate — base 60 + T2_PASS/T3_PASS
  rarely drop below GOOD; only T1 hits hard-reject and calendar-field T1 hits rarely fire; shukla
  fallback (`allowKrishnaFallback`) may also loosen the tithi gate in sparse months.
- Debug plan: Node smoke test over `scoreMuhurta` for a full month → inspect score/verdict distribution
  per mode (use the now-working Playwright path too). The "infinite loop" was in a temp debug script
  (`C:\Users\Sony\AppData\Local\Temp\opencode\dbg_*.js`), NOT app.js.

## Architectural Decisions
- **Corpus source = 17 domain files** (`domains/*.md`) + `domains/why_this_works.md`, NOT the old
  250-rule PDF extraction.
- **Engine is data-source swap, not rewrite**: `scoreMuhurta` consumes corpus activities via
  `TAX.toMuhurta(act)`; `TAX` loaded in `init()` before first render.
- **3-level cascade selection**: Domain (DOM_*) → Sub-domain (SUB_*) → Task (ACT_*); `view.activity`
  = task id; saved to LS + restored on init with legacy migration.
- **Scoring modes (§2.6.7)**: full = T1/T2/T3 + calendar-field + personal; soft = T1-windows only,
  prefer vara; personal = tara + janma-nakshatra return rhythm only.
- **Summary enrichment scoped per-file** + **provenance tags** on every corpus entry.

## Immediate Next Steps
1. **Debug the semantic scoring bug** (mem_1786464631841_uobbm) — node smoke test score distribution
   per mode; fix the pass/hit accounting and mode gating so verdicts spread correctly.
2. **Browser-verify** (`serve.bat`): muhurta table above calendar, cascade re-population, saved
   selection restore, day-detail panel.
3. **Update `PRD.md`** to reflect corpus pivot + scoring engine (still references old 250-rule
   corpus / `ACTIVITIES`).
4. Commit was made this session — verify `git log`.

## Watch Outs
- **Abhijit (28th nakshatra)** not representable in engine's 27-list — dropped with a warning in
  `build_corpus.js` (ACT_LEGAL_FILE_PLAINT, ACT_GOV_TAKING_OATH).
- `modern_finance.md` has no `DOM_` header — folded into `DOM_CORPORATE_FINANCE`.
- `ACT_SAM_PU MSAVANA_SEEMANTA` has a space in the source ID — parser joins to
  `ACT_SAM_PUMSAVANA_SEEMANTA`.
- No headless browser available — UI verified via `node --check` + Node smoke tests only.
- Accuracy bar = match Drik Panchang exactly (still applies).

## Pointer
- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: [`D:\astro-cal\PRD.md`](file:///D:/astro-cal/PRD.md)
- New corpus: `rules/activity_corpus.json` · Resolver: `taxonomy.js` · Build tool: `tools/build_corpus.js`
- Domain source files: `domains/` (17 files + why_this_works.md)
- Old corpus archive: `reference/archive/250_rule_muhurta_engine/`
