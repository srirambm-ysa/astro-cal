# Muhurta Mode / Scoring Debug Log — astro-cal (2026-08-12)

Session objective (per `browser-testing-behavior.md` + `a-simple-test-suite.md`): test the
selection-mode pipeline thoroughly and fix the structural inversion where **Soft yields 0
dates**, **Personal is a wildcard (9–14)**, and the mode subset hierarchy is broken.

## Engine under test
- `app.js` — `scoreMuhurta()` (Phase-2 scoring engine, PRD §2.6), mode gating, hard-blocker
  evaluators (`HARD_BLOCKER_EVALUATORS`), override registry (`OVERRIDE_EVALUATORS`,
  `OVERRIDE_TARGETS`), provenance wiring.
- `engine.js` — ephemeris: `rashiOf` (0-indexed), `nakshatraOf`, `tithi`, `yoga`, `karana`,
  `taraBala`, `bhadraLoka` (Mrityu = rashi indices `[3,4,6,11]`), `combustion`,
  `computeDay` (Bhadra probed at sunrise + solar noon; `isInsideAbhijit` = daylight overlap),
  calendar-field pushdown (`adhikMaas`, `kharmas`, `pitruPakhsa`, `sankranti=tDay===1`).
- `taxonomy.js` — `loadTaxonomy`, `toMuhurta` (activity `hardBlockers`/`overrides`/class).

## Root-cause analysis (confirmed empirically)

Symptom from `browser-testing-behavior.md`:
```
full=2  soft=0  personal=11   (Aug-2026, Griha)   <- inverted + wildcard
```

Two structural defects in the **mode-gating** block of `scoreMuhurta` (the score itself was
already leak-fixed in commit 7635e58):

1. **Soft mode always yielded 0 Shubh.** `mode === "soft"` wiped `hits.t2` and `hits.t3`,
   leaving `score = BASE(60) + t1*penalty`. With no hard blocker the max was 60
   (`ACCEPTABLE -> Neutral`), which never crosses the `Shubh` (>=70) chip -- so Soft always
   reported 0 Shubh, *inverting* the hierarchy (Full > Soft).
2. **Personal mode was a wildcard.** `mode === "personal"` kept *only* the tara hit in
   `hits.t2` and dropped every impersonal fit hit. Score collapsed to `60 + tara`, so any
   day with a favourable tara (e.g. Sadhaka +12 -> 72) became `Shubh` regardless of the
   nakshatra/tithi/vara/karana fit -- producing 9-14 dates and letting Personal float free
   of Soft/Full (Personal subsetnot Soft).

Both are exactly the "mode branches differ which tiers are scored" leak that
`browser-testing-behavior.md` prescribes fixing with the **three-tier filter pipeline**.

## Fix applied -- unified base score + thresholds (owner-approved design)

All modes now compute the **same universal base score** from the full panchanga fit
(T1/T2/T3 + tara; `INV-03`); a day with any **T1 hard blocker** is `REJECTED` in **every**
mode (`INV-02`); modes differ only in the **Shubh cut threshold** plus Personal's tara
post-filter:

- `FULL_SHUBH = 70`  (matches prior `scoreToVerdict` GOOD/EXCELLENT -> Shubh; behaviour and
  the validated Aug-2026 counts 2/5/1 unchanged -> no regression vs. leak-harness A/B/C).
- `SOFT_SHUBH = 60`  (relaxed => `Full subset Soft`, `count(Full) <= count(Soft)`, `INV-01`).
- `PERSONAL`: must first qualify at the Soft level (`score >= 60`, so `Personal subset Soft`),
  then **bad tara** (Vipat/Prahari/Naidhana, `TARA_NATURE` "bad") rejects the day
  (`PRS-01/02`); good tara already contributes `+12` via the universal T2 score.

A latent 2nd bug surfaced **during testing** of the fix: the function's return object hard-
coded `chip: verdictToChip(verdict)`, which silently overwrote the per-mode `chip` just
computed -> Soft/Personal returned `Neutral` on score-60s. Changed the return to
propagate the computed `chip` (for `full` it is identical: `verdictToChip(verdict)`).

### Resulting distribution (Aug/Sep-2026 + Jan-2027)
```
               full  soft  personal
2026-08 Griha    2     4      3
2026-08 Startup  5    10      9
2026-08 Mortgage 1     7      7
2026-09 Griha    7     9      7
2026-09 Startup  4    10      8
2026-09 Mortgage 0     7      7
2027-01 Griha    6     8      6
2027-01 Startup  4     7      6
2027-01 Mortgage 4     5      5
```
Hierarchy holds everywhere: `full subset soft`, `personal subset soft`. (Soft >= Full by
design; the owner's "3-5 days/month" band was validated only for Aug full-mode Griha/
Startup/Mortgage = 2/5/1 and is a product calibration concern, not an invariant.)

## Test scripts (run from `C:\Users\Sony\AppData\Local\Temp\opencode`)
- **`tests-suite.mjs`** -- translation of the two `.md` specs to this JS engine. Sections:
  - INV (INV-01 subset, INV-02 hard-blocker-immunity, INV-03 base-score-equality) across
    3 months x 3 activities -- activity-accurate (uses each activity's own `hardBlockers`).
  - BND-01 (Rashi 0-index: Pisces=11 -> Mrityu) . BND-02 (27x27 tara modulo, Revati<->Ashwini wrap) .
    BND-03 (civil-date vara tie) . BND-04 (kshaya tithi detection, 3-yr sweep, no IndexError).
  - OVR-STRUCT (OVERRIDE_TARGETS never touches T1) + OVR-01 (Abhijit != Bhadra) + OVR-02
    (combustion rejects for Griha even with a synthetic SARVARTTHA token injected) +
    OVR-03 (Sarvartha fires / never rescues a hard-blocked day) + OVR-04 (Abhijit engages on
    Abhijit-window days via Mortgage) + OVR-05 (Tuesday hard-rejects Mortgage).
  - PRS-01/02 (bad tara never Shubh in personal) . PRS-03 (good tara soft-qualified -> Shubh).
- **`mode-summary.mjs`** -- quick mode-distribution printout.
- Stashed harnesses kept (not committed): `verify-tests.mjs` (leak A/B/C),
  `verify-provenance.mjs`, `verify-modes.mjs`, `leak-harness.mjs`.

**Final results:** INV 142/142 . BND 9/9 . OVR 140/140 . PRS 3/3 . leak A/B/C 13/2/4 .
provenance green . `node --check app.js/engine.js/taxonomy.js` clean.

## Known design tension — RESOLVED 2026-08-13
- PRD §2.6.7 defines **Personal** as an *independent* janma-nakshatra tara **rhythm**
  ("Moon returns to janma nakshatra ... independent of activity rules"), whereas
  `browser-testing-behavior.md` / `a-simple-test-suite.md` require Personal to be a
  **post-filter subset** on the same activity score. **`what-is-personal-mode.md` now
  supersedes both** and resolves it: Personal = compatibility layer
  `(Base Universal) AND (Tara Bala) AND (Chandra Bala)`, Option A (⊆ Full). See the
  2026-08-13 addendum below. The raw tara-return rhythm is NOT exposed as its own surface.

## Next steps
1. Re-confirm Personal semantics with owner (above tension) before productising.
2. Calibrate `SOFT_SHUBH`/`PERSONAL` thresholds and/or the impersonal T2 weights to bring
   Soft and Personal closer to the "3-5 / 6-8" band per product, **without** breaking
   the invariants (construction-guaranteed once the single universal score is shared).
   Current `SOFT_SHUBH=60` is deliberately conservative.
3. Move one harness into the repo (`tests/`) + add a tiny `package.json` `test` script so
   this stays runnable across sessions (currently harness files live only in Temp).
4. `BND-03` (pre-sunrise activity at 05:30 before 06:15 sunrise should evaluate under the
   prior vara) and `BND-04` (kshaya tithi at exact Muhurta hour) are day-granular stubs
   here; full validation needs a sub-day (`starEnd`/`tithiEnd`) slot resolver. Defer.
5. Drive backup `ocmem-sync.ps1` rclone token re-auth (HANDOFF notes it failed with
   `invalid_grant`).
6. `COMMIT` this session's fixes (working tree changes are uncommitted -- not committed per
   policy; do only on owner request).

---

# 2026-08-13 SUPERSESSION ADDENDUM — personal mode per `what-is-personal-mode.md`

**`what-is-personal-mode.md` is now authoritative for Personal-mode data generation**
and supersedes any conflicting wording in `PRD.md §2.6.7.3`, `browser-testing-behavior.md`
(its 85/65 thresholds are obsolete), and this log's "Known design tension" note. The tension
is resolved: Personal is **not** an independent janma-nakshatra tara *rhythm*; it is a
**compatibility layer built on top of a universal slot** — `(Base) AND (Tara Bala) AND (Chandra Bala)`.

### Owner decisions (2026-08-13)
1. **Option A (Strict Personal)** — a day must first qualify as a **Full slot** (`base ≥ 80`)
   => `Personal ⊆ Full`. (doc's recommended option; keeps Personal inside the 3-5/month band.)
2. **Full/Soft become 0% personal** — tara removed from the universal base; the universal score
   is now a pure panchanga fit. Adopted doc thresholds: `FULL_SHUBH = 80`, `FULL_MADHYAMA = 65`,
   `SOFT_SHUBH = 60`, `PERSONAL_SHUBH = 75` (final = base + tara + chandra bonuses).
3. **Reject all bad tara** (Vipat/Pratyari/Vadha = 3rd/5th/7th), not just Vadha.

### Changes applied
- `engine.js` `computeDay` now returns `moonRashi` (needed for Chandra Bala).
- `app.js` `scoreMuhurta`:
  - tara hit removed from `t2` (informational only) — the universal base is impersonal;
  - `chandraBala()` added — house counted from birth rashi inclusive; favourable
    `{1,3,6,7,10,11} = +15`, unfavourable `{4,12} = −10`, **8th = Ashtama Chandra → REJECT**;
  - Personal (Option A): guard `score ≥ 80` (else Neutral/Ashubh), reject bad tara and
    Ashtama Chandra (PRS-01/02), then `final = base + tara(+15 good) + chandra`, `Shubh ≥ 75`
    else Neutral (MADHYAMA); returns `personalMetrics { tara*, chandraHouse, chandraScoreBonus, isAshtamaChandra }`;
  - **latent leak fixed**: scores 70-79 previously went `verdictToChip(GOOD)→"Shubh"`,
    so sub-Full personal days and bad-tara 70-79 days slipped into the Shubh table — now
    `chip = score ≥ 65 ? "Neutral" : "Ashubh"` below the Full cutoff;
  - **existing showDetail bug fixed**: template read `v.tara.number` though the return
    never carried `tara` -> now `day.tara.number`; Chandra line added to the day card.
- Harness moved into repo: `tests/tests-suite.mjs` + `tests/mode-summary.mjs`, with
  `package.json` `test`/`modes` scripts. PRS-02 (Ashtama Chandra) now implemented and tested.

### Resulting distribution (Full ⊆ band; Personal ⊆ Full)
```
               full  soft  personal
2026-08 Griha    2     4      1
2026-08 Startup  2     8      1
2026-08 Mortgage 1     1      1
2026-09 Griha    4    11      1
2026-09 Startup  3    10      1
2026-09 Mortgage 0     0      0
2027-01 Griha    4     8      1
2027-01 Startup  4     7      3
2027-01 Mortgage 4     4      4
```
`Personal ⊆ Full ⊆ Soft` holds on every (month, activity). All counts are within the
"at most 3-5 Shubh/month" band for Full/Personal (soft is intentionally looser; that band
is a calibration lever, not an invariant — HANDOFF). E.g. Aug-15 2026 Greer base 82 (Full
Shubh) is rejected in Personal because tara = Vipat; Aug-26 2026 (Kshema + favourable
chandra) is Personal Shubh.

**Remaining calibration lever (owner):** Personal is a strict subset of Full so it lands at
1-4/month. If more Personal days are wanted, adjust the impersonal T2 weights / score bands
or drop `PERSONAL_SHUBH` — never relax the Personal ⊆ Full construction.

**Tests:** INV 151/151 · BND 9/9 · OVR 143/143 · PRS 7/7 · `node --check` clean.
