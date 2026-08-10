# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-10

**Session token count (2026-08-10 session):** REAL billed 3,080,942 (RAW 23,447,150 · 86.9% cache efficiency)

## Goal Accomplished (2026-08-10 · this session)
- **Birth input reworked to nakshatra dropdown (UNCOMMITTED):** birth date/time/coords-arithmetic
  replaced with a single **Janma Nakshatra** dropdown (27 nakshatras × 4 padas, grouped with
  `<optgroup>`, each option showing the derived rashi). `janma.rashi` now derived from
  `nakshatra*4 + (pada-1)` (9 padas/rashi) — `swe.birthChart()` no longer used by app.js. Location
  fields (place/lat/lon/tz) kept for sunrise/sunset/kalam only. Old saved birth without `nakshatra`
  falls back to the form. **Changes in `app.js` + `index.html`, `node --check` passes, NOT committed.**
- **Review note for owner:** per user, "will review everything in next session" — the dropdown change
  needs a visual review + localStorage migration check (old saved birth shows the form again).

## Goal Accomplished (through 2026-08-08)
- **PRD + research COMPLETE** — `D:\astro-cal\PRD.md` exists; all 5 PRD open items resolved
  (chandrashtama two-tier correction: Drik computes by sign, not nakshatra; Rahu/Yama/Gulika tables;
  shraddha tithi practice; `swisseph-wasm` package confirmed; ICS spec).
- **UI/UX COMPLETE — winner APPROVED:** **04 Sacred Ornament (day + night)** from the uiskills experiment
  (`D:\uiskills\experiments\astro-cal\muhurta-calendar\04-sacred-ornament.html`). Warm ledger + gold rekha
  frame + researched SVG icon set; night = deep indigo via `body.night` toggle (localStorage-persisted).
  Ganesha watermark + kolam dot border PARKED — owner to drop in assets manually (ISSUE-0009).

## Architectural Decisions
- Engine = Swiss Ephemeris WASM (`swisseph-wasm` v0.1.0, Lahiri ayanamsa) — not hand-rolled astronomy.
- Avoidance-first v1: chandrashtama (rashi coarse + nakshatra peak) + moon phases + eclipses +
  Rahu/Yama/Gulika + personal days. Good-muhurta rules deferred to phase 2.
- Calculator model, no auth: birth details in → calendar out; personal layer in browser localStorage;
  static server (no backend). Default range = current month.
- UI source = 04 Sacred Ornament (day+night), per above.
- **Tamil calendar layer (added 2026-08-10):** tithi label + Tamil month/day per cell + Tamil year in
  header, sankranti day highlighted; built-in Tamil festivals (Thai Poosam, Karthigai Deepam, Panguni
  Uthiram, Aadi Perukku, Aavani Avittam …) + custom Tamil-month events. All derivable from Sun/Moon
  longitude via swisseph — no external calendar data. Festivals validated against Drik's festival
  calendar.

## Immediate Next Steps
- **REVIEW the uncommitted nakshatra-dropdown change** (app.js + index.html): confirm the grouped
  dropdown UX, verify rashi derivation on the calendar, and test the old-localStorage fallback. Then
  commit. This was the "birth input" simplification requested this session.
- **AC-TSK-0001 (high, in_progress):** build astro-cal v1 from `PRD.md` using 04 Sacred Ornament
  (day+night) as the UI source. Includes the **Tamil calendar layer** (tithi label, Tamil month/day +
  year, sankranti highlight) and **Tamil festivals** (built-in + custom Tamil-month events).
  Self-host fonts; ship with `serve.js`. Ganesha/kolam assets parked (ISSUE-0009).
  See the wiki task board: `node D:\knowledge-base\tools\task.js list` (project=astro-cal).

## Watch Outs
- PENDING — only the PRD exists; scaffold + engine research not started (that is now the v1 build work).
- Accuracy bar = match Drik Panchang exactly (validated against Drik + a second source).
- Ganesha/kolam: own-drawn SVG failed (dot-matrix bleed); scraping returned wrong/bot-blocked files —
  owner supplies assets manually.

## Pointer
- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: [`D:\astro-cal\PRD.md`](file:///D:/astro-cal/PRD.md)
