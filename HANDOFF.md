# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-12

**Session token count (2026-08-12 · leak-fix + provenance session):** REAL billed 3,612,093 (RAW 16,877,603 · 78.6% cache efficiency, 88.3% cache-hit share). Continuation close-work session: REAL billed ~9.9k (RAW 45.8k).

## Goal Accomplished (this session — 2026-08-12 · scoring leak fix + classical provenance)
- **Fixed the "all dates Shubh" semantic-scoring leak** (mem_1786464631841, now resolved → see mem_1786518614665):
  sign-flip in `scoreMuhurta` (T2/T3 weights added instead of subtracted); overrides could downgrade
  T1 before the hard-reject check; `isInsideAbhijit` always-true flag; Vyatipata misindex (22→16);
  corpus `hard_blockers` never wired; Bhadra checked only at sunrise; personal mode wiped T1.
- **Hard-blocker pipeline** (`app.js`): `HARD_BLOCKER_EVALUATORS` (ASTA_GURU/ASTA_SHUKRA combustion via
  `engine.combustion(jd)` ≤11°/≤8°, TUESDAY vara 2, SANKRANTI tDay===1, VYATIPATA idx 16, VAIDHRITI idx 26)
  run FIRST into `hits.t1`; `OVERRIDE_TARGETS` restrict `applyOverrides` to T2/T3 (ABHIJIT_WINDOW = t3 +
  weak Vara only) so overrides can never rescue a hard-blocked day.
- **Engine**: `YOGA_GHATI_BAN` Vyatipata 16:60; `fullBanYogas=[16,26]`; `combustion(jd)`; `computeDay`
  returns `combustion` + `sankranti`; Bhadra probes sunrise + solar noon (prefers Mrityu).
- **Bhadra Mrityu Loka corrected** to `[3,4,6,11]` (Cancer/Leo/Libra/Pisces) per MC Ch.1 Sloka 46
  (mem_1786518632880); PRD.md §2.6.5 + `classical_rule_architecture_mc.md` §5 annotated as variant
  readings (old `[10,11,2,4]` = Aquarius↔Libra translation swap).
- **Classical provenance system** (mem_1786518624198): `reference/provenance_registry.json`
  (meta/chapters/29 verses/140 activities) generated + validated by `tools/build_provenance.js`
  (48 classical / 92 functional_group / 0 formula; no fabricated slokas — proof∈confirmed|unverified|formula);
  runtime join in `taxonomy.js` (`loadProvenance`, `toMuhurta.classical`) and `app.js` `scoreMuhurta`
  returns `provenance[]` per fired verse; `showDetail` renders a collapsible **Classical Foundation** card.
- **UI**: muhurta card now shows **only Shubh** days (`renderMuhurta`: `if (v.chip !== "Shubh") continue;`).
- **Verified**: Tests A 13/13 · B 2/2 · C 4/4 (leak-harness + verify-tests), registry regeneration green,
  `node --check` clean on app.js/engine.js/taxonomy.js/build_provenance.js.

## ACCEPTANCE CRITERION (owner) — mem_1786465597914_18jf1
- Muhurta table shows **only Shubh days** — done this session.
- Per activity: **at most 3-5 Shubh days per month**, across every mode (full/soft/personal). Aug-2026
  full-mode: Griha 2 Shubh, Startup 5 Shubh, Mortgage 1 Shubh — **within the 3-5 band**. Still to
  browser-verify across modes + more months.

## Immediate Next Steps
1. **Browser-verify the UI** (`serve.bat` → Drik-aligned): muhurta card Shubh-only across full/soft/
   personal modes + more activities/months; confirm 3-5/day band; Classical Foundation card renders.
2. **Broaden verification**: run the leak-harness over other months/activities/modes (not just Aug 2026,
   full mode) to confirm the 3-5 Shubh band holds broadly.
3. Optional: verify remaining `proof:"unverified"` verses against `muhurtha-chinthamani.pdf`; Sanskrit
   text for `NAKSHATRA_GROUP`, `VYATIPATA`/`VAIDHRITI` (Ch.1 Sl.28-29), `MARS_HORA`, `EIGHTH_HOUSE`,
   `AMRITA_SIDDHI`, `RAVI_YOGA`, `MARS_EXALTED`, `LATTA_DOSHA`, `VASTU_SUAPTA`.
4. **COMMIT this session's work** (still uncommitted — see git section below).

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
  relaxes T2/T3.
- Harness scripts live in `C:\Users\Sony\AppData\Local\Temp\opencode\` (`leak-harness.mjs`,
  `verify-tests.mjs`, `verify-provenance.mjs`, `verify-modes.mjs`) — not committed.
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
