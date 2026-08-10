---
title: Astro-Cal — Vedic Muhurta Calendar
type: plan
status: draft
last_updated: 2026-08-10
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
- **Tithi + moon phase** — the lunar day (Shukla/Krishna paksha + ordinal, e.g. "Shukla
  Dashami") shown per day cell; Amavasya (new moon) / Purnima (full moon) flagged with the
  phase-disc icons from the approved UI. Day-detail panel lists tithi + paksha.
- **Tamil solar calendar** — Tamil month + day rendered beside the English date in every cell
  (e.g. "Thai 05"), a Tamil year label at the top, and the **sankranti** day (Tamil month start
  = Sun's ingress into a rashi) highlighted. Tamil festivals are always scheduled in Tamil
  months, so the Tamil date must be visible to make sense of them.
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
- **Tamil festivals** — a curated built-in list of festivals that are *always* computed on the
  **Tamil solar calendar** (not the Gregorian/lunar month), e.g. **Thai Poosam** = Poosam
  (Pushya) nakshatra in the month of Thai; **Karthigai Deepam** = Karthigai month (Krittika
  nakshatra / full-moon rule); **Panguni Uthiram** = Uthiram (Uttara Phalguni) nakshatra in
  Panguni; **Aadi Perukku** = 18th Tamil day of Aadi; **Aavani Avittam** = Avittam (Dhanishta)
  nakshatra in Aavani. Rule = **Tamil month + nakshatra/tithi/day-number**, computed from the
  Tamil date of each day. Plus **custom Tamil-month events**: the user adds an event keyed to a
  Tamil month + nakshatra (or tithi / Tamil day-number) and it recurs yearly on the computed
  Tamil date (e.g. a family festival that follows the Tamil calendar).

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
- **Tithi per day** — paksha + ordinal (e.g. "Shukla Dashami"), shown as a text label under
  each day cell (and in the day-detail panel).
- **Tamil solar date per day** — Tamil month + day (e.g. "Thai 05") rendered beside the
  English date in every cell; **sankranti day** (Sun's ingress into a rashi = Tamil month
  start) highlighted. Tamil year label at the top of the calendar header.

### UI / UX
- **Calculator flow:** land on a birth-details form → compute → preview calendar. No auth; any
  visitor can use it.
- **Range model:** default = **current month** preview; **Month / Year / Custom(start–end)**
  selectors switch the view and drive the ICS export. Today anchored.
- **Month-view grid** color-flagged by period type; click a day → detail panel with that day's
  periods + timings; two-tone chandrashtama bar (coarse light + peak dark). **Each cell shows
  the English date, the Tamil solar month + day (e.g. "Thai 05"), and the tithi label**; the
  Tamil month-start (sankranti) day is highlighted and the header carries the Tamil year name.
- **Legend:** inline **SVG** symbols + color chips for every period type (deterministic, no image
  files), including the two-tone bar convention.
- Personal events: add-event form + settings view; edits persist to localStorage. The add-event
  form also supports **Tamil-calendar events** (Tamil month + nakshatra/tithi/Tamil day-number,
  yearly recurrence).

### Export
- **ICS file** importable into Google / other calendars (all-day + timed events) covering the
  **selected range** — includes Tamil festivals, personal events, amavasya/purnima, eclipses,
  and chandrashtama windows. Tithi labels and Tamil dates ride along as the event summary text.

### Persistence
- Personal data: **browser localStorage** only — private per browser, no server state, no external
  services. Swisseph WASM + app static files are served over HTTP (file:// blocked by CORS) by a
  tiny static server (`serve.bat` pattern, like the wiki's `serve.js`). No backend logic.

## Accuracy bar

- **Match Drik Panchang exactly.** Validated by batch comparison against Drik Panchang **and a
  second independent source** (e.g. AstroSage) across sample dates.
- **Tithi & Tamil dates:** tithi names + Tamil month/day verified against a Tamil panchangam
  (e.g. Drik's Tamil calendar view) across the sample set.
- **Tamil festivals:** the built-in list's rule → date matches Drik's festival calendar for the
  same sample years (Thai Poosam, Karthigai Deepam, Panguni Uthiram, Aadi Perukku, Aavani
  Avittam, etc.).

## Engine

- **Swiss Ephemeris WASM** (offline, browser-capable; VSOP87-grade hand-rolling is insufficient).
- Lahiri ayanamsa; native solar/lunar eclipse computation; sunrise/sunset at location.
- **Tithi:** `floor((moon_longitude − sun_longitude) / 12°)` → paksha + ordinal
  (0–14 Shukla, 15–29 Krishna; Amavasya = 29/0, Purnima = 14).
- **Tamil solar calendar:** the Tamil month is the rashi the Sun occupies; the month starts at
  the **sankranti** (Sun's ingress into that rashi). Tamil day = days since the current
  month's sankranti. Tamil year name = cycle position (60-year cycle) counted from the Chithirai
  (Mesha) sankranti. All derived from Sun longitude via swisseph — no external calendar data.

## Deferred — phase 2 (research complete 2026-08-10 — see below)

- Good-muhurta activity rules (per-activity nakshatra / vara / tithi suitability tables).
- Per-activity "Shubh Muhurat" matching Drik's pages.
- **Birth-star personalization of the muhurta table via Nava Tāra (tara bala)** — the layer that
  keeps the table from being a "straight dump from Drik": the same day is auspicious for one birth
  star and not another. Model + design in the phase-2 research section below.

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
  Iyengar's per-birth-star table, DailyPanchangam.in, and Hindupad.
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

## Phase 2 research — muhurta table + birth-star customization (2026-08-10)

> The muhurta table is the phase-2 "good muhurta" layer. Without personalization it is a **straight
> dump of Drik's general per-activity shubh dates** — useful but not personal. This section is the
> research answer to *"how does customization to the birth star need to be done?"* It defines the
> one truly personal filter (**Nava Tāra / tara bala**) plus the general panchanga filters, how they
> combine, and what the engine must add to compute it. Sources verified live 2026-08-10.

### 2.1 The customization problem

A muhurta (electional moment) is judged by **panchanga shuddhi** — the five limbs Tithi, Vara
(weekday), Nakshatra, Yoga, Karana — each having good/bad values **per activity**. Most of that is
*impersonal*: Rohini is good for marriage for everyone. But Vedic muhurta adds a **personal** filter
that makes the same date good for one person and bad for another: the relation of the muhurta's
nakshatra to the person's **janma nakshatra**. That is the customization the table needs. Everything
else is a general table.

### 2.2 Nava Tāra (tara bala) — the birth-star personalization (CONFIRMED) ✅

**Rule:** count the nakshatra cycle from the janma nakshatra (janma = count 1, inclusive) to the
muhurta's nakshatra; fold the count on a cycle of 9. Each position is a tara with a fixed
nature:

| Count mod 9 | Tara | Meaning | Nature |
|---|---|---|---|
| 1 | Janma | birth star | **neutral** (sensitive; fine for rest/spiritual) |
| 2 | Sampat | wealth | favorable |
| 3 | Vipat | danger | **unfavorable** |
| 4 | Kshema | well-being | favorable |
| 5 | Pratyari | obstacles | **unfavorable** |
| 6 | Sadhaka | achievement | favorable |
| 7 | Vadha (Naidhana) | destruction | **unfavorable** |
| 8 | Mitra | friend | favorable |
| 9 | Parama Mitra | best friend | favorable |

**Computation:** for the day's nakshatra `n` and janma nakshatra `j`
`count = ((n - j + 27) mod 27) + 1`, then `tara = ((count - 1) mod 9) + 1`.
Favorable = {2 Sampat, 4 Kshema, 6 Sadhaka, 8 Mitra, 9 Parama Mitra}; unfavorable = {3 Vipat,
5 Pratyari, 7 Vadha}; neutral = {1 Janma}. This is the **only** muhurta filter that depends on the
person — it is exactly what makes the table personal rather than a Drik dump.

**Note — relationship to v1's chandrashtama peak:** the peak nakshatra `(janma + 16) mod 27`
(= position 17 counting janma as 1, verified DailyPanchangam.in) is tara **8 (Mitra)** under the
standard convention — the peak is bad because the Moon is in the 8th *rashi* (chandrashtama), not
because of its tara. Phase 2 generalizes the same wheel to every tara; tara is an *independent*
axis from chandrashtama.

**Cycle strength (optional refinement, not required for v1):** tara repeats 3× per 27-star cycle;
positions 1–9 (first cycle) are strongest, 10–18 moderate, 19–27 subtlest. v1 can ignore cycle
depth and treat tara identity only.

### 2.3 General (impersonal) filters — what Drik's muhurta pages actually apply

Drik's "Shubh Muhurat" pages (vivah, griha pravesh, vehicle, property) are built from panchanga
shuddhi — the same for everyone. Verified example, **marriage (Drik "Auspicious Nakshatra for
Marriage", live 2026-08-10):** 11 Shubh nakshatras — Rohini(4), Mrigashira(5), Magha(10),
Uttara Phalguni(12), Hasta(13), Swati(15), Anuradha(17), Mula(19), Uttara Ashadha(21), Uttara
Bhadrapada(26), Revati(27) — with pada exceptions (1st quarter of Magha/Moola and last quarter of
Revati rejected). Drik also lists **Ashubh marriage yogas** (Vishkambha, Atiganda, Shula, Ganda,
Vyaghata…).

Per-activity building blocks the table needs (all static lookup tables, one per activity):
- **Nakshatra list:** favourable nakshatras for the activity (Drik's pages + classical tables).
- **Vara (weekday) fit:** e.g. travel favours Sun/Thu east, Tue/Sat south, Wed/Fri west, Mon north;
  marriage favours Mon/Wed/Thu/Fri; business Wed/Thu.
- **Tithi / paksha fit:** Shukla paksha generally; avoid Rikta tithis (Chathurthi, Navami,
  Chaturdashi); specific tithi rules per activity (e.g. griha pravesh avoids 4th/8th/14th).
- **Yoga & Karana fit:** favorable yogas (Siddhi, Amrita…) / avoided karanas (Vishti/Bhadra).
  NOTE: engine currently has **no yoga or karana** computation — see 2.5.
- **Time-of-day exclusions:** Rahu/Yama/Gulika (already computed). **Abhijit / Durmuhurta are
  DEFERRED** — not in the phase-2 v1 table (day-granularity verdicts don't need them; they'd only
  refine a time-of-day pick, and Drik's activity pages are day-based).

### 2.4 How the pieces combine → per-activity verdict

For a chosen activity on a given day, compute:
1. **Personal (birth-star) filter — tara bala** from `moonNakshatra` vs `birth.nakshatra`
   (2.2). This is the customization.
2. **Impersonal panchanga fit** — is the day's nakshatra in the activity's Shubh list, is the vara
   fit, tithi/paksha fit, yoga/karana fit (2.3).
3. **Day-star window** — the sunrise nakshatra is the day's "anchor" nakshatra, but nakshatras
   change mid-day. If the sunrise nakshatra ends **before sunset**, the day is only valid for star-
   based verdicts **until that time** (e.g. "star valid till 12:27, then Ardra"). This is surfaced
   in the verdict reason line and in the day-detail panel — the user can read "valid only until the
   star transitions" so they never book past the change.
4. **Exclusions** — Rahu/Yama/Gulika windows (already shown) and chandrashtama (already shown).

Verdict = score/mark per activity, e.g. **Shubh / Neutral / Ashubh**, with the *reason line*
naming which factor(s) drive it ("Tara Sampat ✓ · Rohini ✓ · Shukla Dwitiya ✓ — but Rahu 10:30–
12:00 ✗"). The tara column is what makes it *this person's* verdict.

**Scope note on marriage (Vivah):** marriage is **deferred** to a later phase. Its tithi/paksha
rules vary by tradition (Krishna paksha is permitted) and Drik's muhurats are window-precision
(hour-level muhurat timings) that this day-granular table cannot reproduce faithfully. The phase-2
starter set is the three simpler activities: **Griha Pravesh / Vehicle / Travel** — each uses the
consistent rule set below.


### 2.5 Engine delta for phase 2

| Needed | Engine today | Work |
|---|---|---|
| Day nakshatra at muhurta/sunrise | ✅ `moonNakshatra` (computed) | — |
| Janma nakshatra | ✅ `birth.nakshatra` (input) | — |
| Tara bala | — | **pure arithmetic** on the two (2.2), no new astronomy; ✅ implemented |
| Day-star end (intra-day nakshatra transition) | — | new `nakshatraEnd(jd)` → surfaces the "valid till HH:MM" window |
| Vara (weekday) | ✅ derivable from civil date | tiny helper |
| Tithi index/paksha | ✅ `tithi()` | — |
| Yoga (27 nitya) | ❌ | `(sun_lon + moon_lon) mod (360/27)` → ✅ implemented `yoga(jd)` |
| Karana (11) | ❌ | from tithi fractional part → ✅ implemented `karana(jd)` |
| Nakshatra group (fixed/movable/etc.) | ❌ | ✅ static 27-row table `NAKSHATRA_GROUP` |
| Per-activity Shubh lists (nakshatra/vara/tithi/yoga) | ❌ | ✅ static per-activity tables (see app.js `ACTIVITIES`) |
| Abhijit / Durmuhurta | ❌ | **deferred — not in phase-2 v1** |

Only **yoga + karana** are new astronomy; tara is arithmetic and the rest are lookup tables.

### 2.6 UI / product shape (proposal for owner review)

- **Activity selector** on the calendar (phase 2): pick a *focus* activity from the starter set
   (**Griha Pravesh / Vehicle / Travel**; Marriage deferred). The table itself is **cumulative**:
   one row per day listed if it is Shubh or Neutral for *any* activity, with a **per-activity
   verdict** column (Shubh/Neutral per activity; Ashubh activities omitted from each row, and
   days that are Ashubh across all activities hidden entirely). The dropdown sets which activity's
   tara + day-star-window drives the day-detail panel.
- Right-panel **muhurta table** (replaces/extents the "Key events" table for the chosen activity):
  columns date · tara (personal) · nakshatra · vara · tithi · yoga/karana · verdict (Shubh/Neutral/
   Ashubh) + reason line. Colour-coded chips consistent with the approved ledger theme. Days whose
   sunrise star ends before sunset carry a "valid till HH:MM → next-nakshatra" note.
- Day-detail panel gains a tara + per-activity verdict section, with the day-star window note.
- **ICS:** optionally export only Shubh days for the chosen activity (unchanged).

### 2.7 Validation (accuracy bar, phase 2)

- **Panchang parity (regression):** Aug-10-2026 sunrise IST 05:55 → Krishna Dwadashi · Ardra · Vajra ·
  Taitila — verifies exact against vedpanchang.com (unchanged by phase-2 additions).
- **Tara bala:** hand-check a sample of dates against a tara-bala calculator (modernastro / steer /
  panchangbodh) for 2–3 janma nakshatras. (Live-verified 2026-08-10: Ashwini→Sadhaka good,
  Punarvasu→Parama Mitra good, Hasta→Vipat bad.)
- **Day-star window:** confirmed `nakshatraEnd` fires on Aug 10 (Ardra transitions 12:27 IST, before
  sunset) and surfaces the "valid till HH:MM" note.
- **Per-activity parity vs Drik:** the sunrise-star day verdict matches Drik's *impersonal* Shubh
  days only where the muhurat window coincides with the sunrise nakshatra. Drik itself reports
  window-precision muhurats (e.g. Feb 9 Anuradha at 8:25 PM while sunrise nakshatra is Vishakha),
  which a day-granular table cannot reproduce — this is accepted, not pursued as scope creep.
- Marriage (Vivah) validation is deferred with the activity (see 2.4).

## Build order (proposed)

1. **Research** — DONE (2026-08-08). Findings + corrections in Open items section; all five
   items resolved. Added (2026-08-10): Tamil solar calendar (tithi label, Tamil month/day per
   cell, Tamil year) + Tamil festivals (built-in + custom Tamil-month events) — all derivable
   from swisseph, no new research dependency beyond validating festival rules against Drik.
2. **Scaffold** — static server + settings/events forms (localStorage) + birth-details form.
3. **Engine** — swisseph integration → nakshatra / tithi / phases / eclipses / sunrise →
   chandrashtama → **Tamil solar date + year**.
4. **Periods** — Rahu/Yama/Gulika + shraddha + birthdays + **Tamil festivals + custom
   Tamil-month events**.
5. **UI** — calculator flow, month/year/custom range, month-view grid (English + Tamil date +
   tithi per cell, sankranti highlight, Tamil year in header), day detail, **inline SVG
   legend**, two-tone chandrashtama bar, ICS export.
6. **Validate** — batch compare vs Drik + second source; iterate to "exactly".

### Build order — phase 2 (muhurta table; after v1 ships)

1. **Engine** — ✅ `yoga(jd)` + `karana(kd)` added; ✅ static `NAKSHATRA_GROUP` table; ✅
   `nakshatraEnd(jd)` for the day-star window.
2. **Personalization** — ✅ tara bala (arithmetic on `birth.nakshatra` + day nakshatra); verified
   against a tara-bala calculator.
3. **Activity tables** — starter set (**griha pravesh / vehicle / travel**; Marriage deferred);
  per-activity nakshatra/vara/tithi/yoga/karana lookup tables.
4. **Verdict + UI** — ✅ per-activity score (`Shubh/Neutral/Ashubh`), ✅ muhurta table in the right
   panel, ✅ tara + day-star-window section in day detail, ✅ activity selector.
5. **Validate** — ✅ Aug-10 panchang regression vs vedpanchang.com; ✅ tara spot-checks; day-star
   window fires correctly. Drik day-list parity is intentionally approximate (day-granularity).
