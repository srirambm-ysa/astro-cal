# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-09

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

## Immediate Next Steps
- **AC-TSK-0001 (high, planned):** build astro-cal v1 from `PRD.md` using 04 Sacred Ornament (day+night)
  as the UI source. Self-host fonts; ship with `serve.js`. Ganesha/kolam assets parked (ISSUE-0009).
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
