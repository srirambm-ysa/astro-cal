# Enhancements Pipeline — astro-cal

> **Source:** `docs/weather-and-city-research.md` Q1–Q4 locks + owner directive 2026-09-03  
> **Status:** 6 shipped / 1 deferred (F cancelled 2026-09-06). Single source for return-driver roadmap.  
> **Ordering invariant:** Avoid Days stays #1 (`docs/gochara_addition.md:0`) — every new card slots after it. Order now: **Avoid → Panchang (A) → Nitya (B) → Verse (E) → 7-day Pulse (C) → Gochara Pulse (D) → Gochara → Muhurta → Month**.

---

## Decisions Locked (from weather-and-city research)

| Q | Topic | Lock |
|---|---|---|
| Q1 | City quick-selector | **GO** SimpleMaps 354 MIT primary + GeoNames fallback → `rules/in_cities.json` (382 rows, 354+28), searchable combobox + 5 chips, autofills `bPlace/bLat/bLon/bTz` |
| Q2 | Weather 3-day strip | **DROPPED** — silent-hide if fetched, else no card |
| Q3 | Attribution | Cities in footer (`SimpleMaps MIT · GeoNames CC-BY 4.0`) + per-file provenance; weather attribution N/A |
| Q4 | Panchang vs science forecast | Researched (Garbha 195d Ch.21, Pravasaṇa droṇa Ch.23, Sadyovarṣaṇa Ch.28, Ārdrā Praveśa Jun 22 + Nāḍī, IMD 1991-2020 normals) — **no honest offline 3-day numeric forecast**; seasonal badge deferred |

Full research: `docs/weather-and-city-research.md`.

---

## Return Drivers Pipeline (authentic, daily/periodic)

| # | Driver | Freq | What it is | Authentic source | Effort | Status | Target |
|---|---|---|---|---|---|---|---|
| **E** | **Tirumandiram — Verse of the Day** | Daily | Card `Tantra · #n · Tamil verse (pre-wrap) · transliteration · English · Read on tirumandiram.in ↗` + Copy/Prev/Next. Rotation `dayOfYear % 365` (IST). | Thirumoolar 3047 verses `D:\tirumandiram\output\verse-*.json` → `rules/tirumandiram_daily.json` 365 curated `tirumandiram-daily-v1` | S | ✅ **Shipped 2026-09-03** `index.html:389` `tirumandiram.mjs:1` `app.js:1028` `tests/tirumandiram-tests.mjs:1` | — |
| **CITY** | **City Quick-Selector** | Per-use | Searchable combobox (`#bCitySearch` + `#bCityDropdown`) + 5 chips Chennai/Coimbatore/Madurai/Tiruchirappalli/Salem above `Current place` (`index.html:367`). Autofills `bPlace/bLat/bLon/bTz` (manual stays editable). | SimpleMaps 354 + GeoNames fallback `rules/in_cities.json` `in-cities-v1` (382, 67KB) | S | ✅ **Shipped 2026-09-03** `app.js:1085` `tests/city-tests.mjs:1` | — |
| **A** | **Daily Panchang Digest** | Daily | Hero card `Date · Tithi · Nakshatra · Yoga · Karana · Sunrise/Sunset · Rahu/Yama/Gulika · Abhijit · Chandrashtama?` — capsule of `engine.js:622 computeDay` | `engine.js` + `Muhurta Chintamani` | S | ✅ **Shipped 2026-09-03** `index.html:389` `app.js:625` `engine.js:622` | Avoid → Panchang → Nitya → Verse |
| **B** | **Daily Nitya Sadhana** | Daily | Large card `Today — Nitya {Citrā} · kāla/bīja · dhyana + copyable mantra` behind dīkṣā note. Lifts hidden `nitya.mjs` (16 kalās `nitya-devi-v1` `rules/nitya_devis.json`) from table cell `app.js:812`. | `Tantrarāja / nitya_devis.json` | S | ✅ **Shipped 2026-09-03** `index.html:396` `app.js:680` `nitya.mjs:1` | Avoid → (A+B) → Verse → Gochara |
| **C** | **Upcoming 7-day Pulse** | Weekly | Banner `Next 7 days: Pradosham Dec 6, Ekadashi Dec 8, Seshadri Jayanthi Thai Hastham, Amavasya…` — weekly planning. | `engine.js:tithi`, `tamilDate`, `siddhar_pujas.json`, `shaiva_guru_pujas.json` | S | ✅ **Shipped 2026-09-03** `index.html:410` `app.js:730` | Scan `dayMap+7` — 7 rows, Nitya tag + chip set |
| **D** | **Today’s Gochara Pulse** | Daily | Tighten monthly `gochara.mjs:1` (5 ingresses/mo) → daily line `Transit Moon in 8th → Chandrabala · Tara Vadha ⚠️` (`moonRashi`+`taraBala `engine.js:140``). | `BPHS Gochara` | S | ✅ **Shipped 2026-09-03** `index.html:460` `app.js:1255` `gochara.mjs:1` | Daily relevance — Moon house + Tara today, Vedha-aware |
| **F** | **Pradosha/Ekadashi/Amavasya Reminders** | Fortnightly | Ekadashi fast + Pradosha puja + Amavasya/Purnima push via `D:\notif` hub + ICS `app.js:1180`. | `tithi 10/11/14` | M | ❌ **Cancelled / Deferred** (per owner 2026-09-06 — release first, notify later) | Notif + calendar chips already emit, push deferred indefinitely |

**Build order (return per LOC):** A+B as “Today” hero (pure offline, zero deps) → C → D. City + Verse + A+B+C+D now live. **F deferred** until post-release.

---

## Backlog / Deferred

- IMD `rules/climate_normals.json` + Ārdrā helper `panchang/monsoon.js` (offline normals strip + seasonal badge) — deferred with weather drop.
- Holiday capitals quick-select subsumed by City selector (no separate capitals dropdown needed).
- PWA/ICS/Print audit for new cards (Gochara/Avoid/Nitya/Holiday/Verse/City) — deferred.

---

## Verification

- City: `tests/city-tests.mjs` 21 pass (382 rows, 28 fallback Palani/Kanchipuram etc., search `mad→Madurai`).
- Verse: `tests/tirumandiram-tests.mjs` 10 pass (Jan1→1, Dec31→365, Sep3→2046).
- Panchang/Nitya/Pulse: IST `2026-09-03` smoke — Saptami · Krittika (nak 2), Vyaghata + Vishti, Nitya Śivadūtī, Pulse 7 rows with Pradosham/Ekadashi + Siddhar chips; mobile 360×800 no overflow (`scrollWidth-clientWidth==0`).
- Gochara Pulse (D): IST `2026-09-03` smoke — Mesha 1st Śubha + Tara Vipat ⚠️ (Ashwini birth) via `gocharaForBirth` + Vedha; impersonal fallback when no birth. Fix `2026-09-03` Kanya 8th Aśubha: rashi `Mesha→Vrishabha` at `07:26 IST` via `crossingForward` — now dual chips `8th Aśubha till 07:26 → 9th Aśubha from 07:26` (no false “then OK”; `GOCHARA_MOON_H9` still aśubha) + Tara `till/from` before next sunrise `app.js:1298`.
- `npm test` green: INV 151 + BND 9 + OVR 143 + PRS 7 + marriage 51 + guna-milap 45 + gochara 51 + nitya 15 + tirumandiram 10 + city 21.
- `wrangler.toml:4` assets `./` leak (1053 files) — cap `in_cities.json` 67KB + `tirumandiram_daily.json` 340KB, consider allowlist.

---

*Keep this file + `docs/weather-and-city-research.md` together. HANDOFF.md points here for the live queue.*
