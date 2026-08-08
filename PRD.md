---
title: Astro-Cal — Vedic Muhurta Calendar
type: plan
status: draft
last_updated: 2026-08-08
related: [D:\knowledge-base\projects\apps\astro-cal.md, D:\knowledge-base\INDEX.md]
---

# Astro-Cal — PRD (first cut)

> Personal Vedic-astrology calendar that surfaces **inauspicious and important periods** so
> appointments are never booked on a bad day or an important family day. Avoidance-focused for v1;
> good-muhurta rules deferred to phase 2. Standalone, local-first, offline. Single user.

## Concepts covered (Vedic)

- **Janma nakshatra** (birth star) — computed from birth date/time/place (not picked manually).
- **Chandrashtama** — transit moon in the 8th nakshatra counted from janma nakshatra; obstruction
  period, recurs ~every 27.3 days.
- **Tithi** (lunar day) → **Amavasya** (new moon), **Purnima** (full moon) with exact times.
- **Solar & lunar eclipses** — start / max / end times.
- **Rahu Kalam / Yama Kalam / Gulika** — daily inauspicious daytime windows (sunrise→sunset split).
- **Shraddha tithis** — per-ancestor lunar death-anniversary days.
- **Personal days** — family birthdays, custom important/blocked days.

## Requirements

### Inputs
- Birth date/time/place → janma nakshatra + pada (swisseph).
- Settings: location (lat/lon/tz) for sunrise-based day boundaries; **Lahiri ayanamsa**.
- Personal events captured via a form → stored in `data.json`.

### Derived periods (computed, flagged on calendar)
- Chandrashtama days + times
- Amavasya / Purnima dates + times
- Eclipse start/max/end (native swisseph)
- Rahu / Yama / Gulika daily windows

### UI
- **Month-view grid** color-flagged by period type; click a day → detail panel with that day's
  periods + timings; legend of period types.
- Add-event form; settings view.

### Export
- **ICS file** importable into Google / other calendars (all-day + timed events).

### Persistence
- `data.json` on disk via a **tiny local server** (`serve.bat` pattern, like the wiki's `serve.js`).
  No external services.

## Accuracy bar

- **Match Drik Panchang exactly.** Validated by batch comparison against Drik Panchang **and a
  second independent source** (e.g. AstroSage) across sample dates.

## Engine

- **Swiss Ephemeris WASM** (offline, browser-capable; VSOP87-grade hand-rolling is insufficient).
- Lahiri ayanamsa; native solar/lunar eclipse computation; sunrise/sunset at location.

## Deferred — phase 2

- Good-muhurta activity rules (per-activity nakshatra / vara / tithi suitability tables).
- Per-activity "Shubh Muhurat" matching Drik's pages.

## Non-goals

- No SaaS / external API / server beyond the local static+json server.
- Single user; no auth; no multi-user.
- Not a full panchanga reference tool — personal scheduling focus.

## Tech

- HTML / JS / CSS standalone; vendored swisseph WASM; Node one-file server (`serve.js` + `serve.bat`).

## Open items (research to confirm before build)

1. Chandrashtama convention — exact counting + whether to flag a before/after margin (verify vs Drik).
2. Rahu / Yama / Gulika weekday segment tables (verify each against Drik).
3. Shraddha tithi practice — annual tithi of death vs Pitru Paksha / Mahalaya window.
4. Exact swisseph WASM package (browser-compatible, offline, vendorable).
5. ICS details — all-day vs timed events, VTIMEZONE, recurrence for annual events.

## Build order (proposed)

1. **Research** — conventions + engine + validation harness (open items 1–5).
2. **Scaffold** — server + `data.json` schema + settings/events forms.
3. **Engine** — swisseph integration → nakshatra / tithi / phases / eclipses / sunrise → chandrashtama.
4. **Periods** — Rahu/Yama/Gulika + shraddha + birthdays.
5. **UI** — month view, day detail, legend, ICS export.
6. **Validate** — batch compare vs Drik + second source; iterate to "exactly".
