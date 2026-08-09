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
> good-muhurta rules deferred to phase 2. **Calculator-first:** anyone opens the page, enters birth
> details, sees a month/year/custom-range calendar of transit flags, and downloads ICS. Personal
> layer (birthdays, blocked days, shraddha tithis) is **browser-local (localStorage)** — no auth,
> no server state, private per browser. Local-first, offline-capable.

## Concepts covered (Vedic)

- **Janma nakshatra + rashi** (birth star + moon sign) — computed from birth date/time/place
  (not picked manually). Janma rashi is required for chandrashtama.
- **Chandrashtama (Ashtama Chandra)** — two-tier period (coarse + peak):
  - **Coarse (Drik parity):** transit moon in the 8th **rashi** counted inclusively from janma
    rashi (`(janma_rashi+7) mod 12`); ≈2.25 days, no margin, sunrise→sunrise day.
  - **Peak (narrow):** transit moon through the chandrashtama **nakshatra**
    `(janma nakshatra + 16) mod 27` (= 16th star past birth star / 17th inclusive); ≈24h
    transit, always inside the 8th rashi; no padding (Iyengar/DailyPanchangam/Hindupad
    convention). UI renders coarse window light + peak overlaid dark in one bar.
- **Tithi** (lunar day) → **Amavasya** (new moon), **Purnima** (full moon) with exact times.
- **Solar & lunar eclipses** — start / max / end times.
- **Rahu Kalam / Yama Kalam / Gulika** — daily inauspicious daytime windows (sunrise→sunset split).
- **Shraddha tithis** — per-ancestor lunar death-anniversary days.
- **Personal days** — family birthdays, custom important/blocked days.

## Requirements

### Inputs
- Birth date/time/place → janma nakshatra + rashi + pada (swisseph).
- Settings: location (lat/lon/tz) for sunrise-based day boundaries; **Lahiri ayanamsa**.
- Personal events captured via a form → stored in **browser localStorage** (per-browser, no auth,
  no server state). Universal transit flags need only birth details; personal layer is additive.

### Derived periods (computed, flagged on calendar)
- Chandrashtama days + times (coarse rashi window + nakshatra peak)
- Amavasya / Purnima dates + times
- Eclipse start/max/end (native swisseph)
- Rahu / Yama / Gulika daily windows

### UI / UX
- **Calculator flow:** land on a birth-details form → compute → preview calendar. No auth; any
  visitor can use it.
- **Range model:** default = **current month** preview; **Month / Year / Custom(start–end)**
  selectors switch the view and drive the ICS export. Today anchored.
- **Month-view grid** color-flagged by period type; click a day → detail panel with that day's
  periods + timings; two-tone chandrashtama bar (coarse light + peak dark).
- **Legend:** inline **SVG** symbols + color chips for every period type (deterministic, no image
  files), including the two-tone bar convention.
- Personal events: add-event form + settings view; edits persist to localStorage.

### Export
- **ICS file** importable into Google / other calendars (all-day + timed events) covering the
  **selected range**.

### Persistence
- Personal data: **browser localStorage** only — private per browser, no server state, no external
  services. Swisseph WASM + app static files are served over HTTP (file:// blocked by CORS) by a
  tiny static server (`serve.bat` pattern, like the wiki's `serve.js`). No backend logic.

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

- No SaaS / external API / backend server — static file server only.
- **No auth, no accounts, no multi-user server state** — personal data is browser-local.
- Not a full panchanga reference tool — personal scheduling focus.

## Tech

- HTML / JS / CSS standalone; vendored swisseph WASM; Node one-file **static** server
  (`serve.js` + `serve.bat`). Personal data in browser localStorage.

## Open items — RESEARCH COMPLETE (2026-08-08)

All five items resolved. Findings below; they include **two corrections** to this PRD's
assumptions (chandrashtama unit, Rahu/Yama/Gulika tables) verified live against Drik Panchang.

### 1. Chandrashtama — **CORRECTION + PEAK-TIER refinement** ✅

Drik Panchang's "Ashtama Chandra" is computed by **Rashi (moon sign)**, not by nakshatra.
- **Coarse rule (Drik parity):** flag the entire ~2.25-day transit of the Moon through the 8th
  sign counted inclusively from janma rashi: `8th = (janma_rashi + 7) mod 12`. (Live-checked
  2026-08-08: moon in Vrishabha → Drik flags "Ashtama Chandra for Tula borns".)
- **No margin:** flag starts at rashi-entry, ends at rashi-exit. No ±6/12h padding.
- **Day boundary:** sunrise → sunrise (Panchang day). A window spanning midnight renders as
  two segments.
- **Ayanamsa:** Lahiri (Chitrapaksha), true positions.
- **Peak tier (narrower, owner-decided 2026-08-08):** compute the chandrashtama **nakshatra**
  `(janma nakshatra + 16) mod 27` (= "16th star from birth star" / "17th counting birth star as
  1"). The Moon's transit through that one nakshatra is the peak-intensity window ≈24h
  (13°20' ÷ ~13.2°/day), always inside the 8th rashi (8 signs = 18 stars). Verified against TRS
  Iyengar's per-birth-star table, DailyPanchangam.in, and Hindupad. The +16 star is also the 7th
  tara (Naidhan/Vadha) — the inauspicious-for-tasks tara, consistent with the app's purpose.
  **No padding** (no ±6/12h buffer). Intersect the peak with the coarse rashi window as a guard
  for boundary birth stars.
- **UI:** single two-tone bar per day — coarse rashi window light, nakshatra peak overlaid dark;
  legend documents both.
- **Validation source:** no AstroSage chandrashtama page (natal-only article). Use a transit
  calculator (prokerala / astroved) as the second source instead.

### 2. Rahu / Yama / Gulika tables — **CORRECTION applied** ✅

8 equal segments from sunrise to sunset; segment 1 starts at sunrise. Use **Hindu sunrise/sunset**
(Drik's panchang definition, geometric — not civil twilight) so segment boundaries match. Round
displayed boundaries to nearest minute.

| Weekday | Rahu | Yama | Gulika |
|---|---|---|---|
| Sun | 8 | 5 | 7 |
| Mon | 2 | 4 | 6 |
| Tue | 7 | 3 | 5 |
| Wed | 5 | 2 | 4 |
| Thu | 6 | 1 | 3 |
| Fri | 4 | 7 | 2 |
| Sat | 3 | 6 | 1 |

(Verified against Drik day-panchang output for Delhi 2026-08-08..13 + mPanchang/Darshya/
astroshastra/hindutva. Rahu matched the prior assumption; Yama and Gulika were wrong.)

### 3. Shraddha tithi practice — **annual death-tithi primary, Pitru Paksha fallback** ✅

- **Primary rule:** annual shraddha = same **lunar tithi + paksha** as the death date, in the same
  lunar month each year (Drik Shraddha Tithi Calculator). Gregorian date drifts ~10-11 days/yr.
- If a month has the tithi twice, use the **second** occurrence.
- **Fallbacks:** tithi known but month lost → that tithi in **Pitru Paksha**; death on
  Amavasya/Purnima/Chaturdashi or unknown → **Sarva Pitru Amavasya** (closing day of Pitru Paksha).
- Pitru Paksha 2026: Sep 26 (Purnima) → Oct 10 (Mahalaya Amavasya), the Krishna Paksha of
  Bhadrapada/Ashwina immediately before Sharad Navratri.
- v1: store death date → derive death tithi+paksha → compute annual date; mirror Drik by showing
  both annual date and Pitru Paksha tithi, with a "confirm with a priest" caveat.

### 4. swisseph WASM package — **`swisseph-wasm` v0.1.0** ✅

**Winner: `swisseph-wasm`** (github prolaxu/swisseph-wasm, npm `swisseph-wasm`, GPL-3.0-or-later).
- Prebuilt WASM + `.data` (SwissEph C v2.10.03, ephemeris 1800–2400 AD) preloaded into a WASM
  virtual FS `/sweph` — **zero network at runtime**, isomorphic (browser + Node).
- Exposes: `calc_ut` (Moon longitude), `set_sid_mode(SE_SIDM_LAHIRI)` + `get_ayanamsa`,
  `rise_trans` (sunrise/sunset — required), `sol_eclipse_when_glob` / `lun_eclipse_when` (native
  eclipses), `julday`.
- Vendoring: copy `src/swisseph.js` + `wasm/swisseph.{js,wasm,data}` as static assets; no build
  step; serves over HTTP only (file:// CORS).
- **Runner-up:** `@swisseph/browser` (AGPL-3.0, cleaner TS API) — but has **no sunrise/sunset
  function** (hard miss). `@fusionstrings/swisseph-wasm` is MIT but legally questionable (embeds
  AGPL SwissEph C). `astronomy-engine` lacks Lahiri ayanamsa. No official astro.com npm build.

### 5. ICS export — **spec locked** ✅

- **All-day events:** `DTSTART;VALUE=DATE:YYYYMMDD` + `DTEND;VALUE=DATE:YYYYMMDD+1` (exclusive;
  omit DTEND and duration defaults to one day).
- **Timed events:** `DTSTART;TZID=Asia/Kolkata:YYYYMMDDTHHMMSS` + matching DTEND, backed by a
  **VTIMEZONE** block (Asia/Kolkata needs one `STANDARD` entry, fixed +0530, no DST).
- **Recurring annual:** all-day shape + `RRULE:FREQ=YEARLY`; handle Feb-29 manually.
- **Formatting:** CRLF line endings, fold lines >75 octets with a leading space, escape
  `\ ; , \n` in TEXT, stable per-event UID + `DTSTAMP`, mandatory `VERSION`/`PRODID`.
- **Avoid:** floating times, offset-form DATE-TIME (`+0530` in DTSTART), reused UIDs,
  LF-only endings, TZID without VTIMEZONE.

## Build order (proposed)

1. **Research** — DONE (2026-08-08). Findings + corrections in Open items section; all five
   items resolved.
2. **Scaffold** — static server + settings/events forms (localStorage) + birth-details form.
3. **Engine** — swisseph integration → nakshatra / tithi / phases / eclipses / sunrise → chandrashtama.
4. **Periods** — Rahu/Yama/Gulika + shraddha + birthdays.
5. **UI** — calculator flow, month/year/custom range, month-view grid, day detail, **inline SVG
   legend**, two-tone chandrashtama bar, ICS export.
6. **Validate** — batch compare vs Drik + second source; iterate to "exactly".
