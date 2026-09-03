# Weather & City Research — Decision Lock 2026-09-03

> **Status:** RESEARCH → LOCKED  
> **Date:** 2026-09-03  
> **Participants:** owner + agent (plan-mode research)  
> **Outcome:** city quick-selector **GO** (SimpleMaps + GeoNames fallback); **weather DROPPED** (not authentic daily value).

---

## 0. Original Ask

Two parallel tracks:

1. **City quick-selector:** evaluate GeoNames India vs SimpleMaps India cities as static data for a city→coordinates picker (replaces error-prone manual lat/lon). Decision needed before build.
2. **Weather after Avoid Days:** if (1) is PASS, add simple weather for the selected location after the Avoid Days card. First research, then decide.

---

## 1. City Data Sources — Evaluation

### 1a. GeoNames India (`IN.zip`)

* **Format:** tab-delimited `geonameid name asciiname alternatenames lat lon fclass fcode country cc2 admin1 admin2 admin3 admin4 population elevation gtopo30 timezone moddate` — 19 columns, UTF-8, readme at `download.geonames.org/export/dump/readme.txt`.
* **Scale:** `IN.zip` 1.7 MB compressed / ~15 MB decompressed (2026-08-27 snapshot). ~120–140k rows (all feature classes `P/A/H/T…`); populated places alone ~10k. World subsets `cities1000.zip` (130k), `cities5000`, `cities15000` also available.
* **Coords:** WGS84 decimal 4–5 dp, `population`, `elevation`, `timezone=Asia/Kolkata`. Wide coverage but noisy (`PPLX` sections, stations, hamlets).
* **License:** **CC-BY 4.0** — free, commercial allowed, credit link to geonames.org. Daily dump, no API key.
* **Ops cost:** requires filtering (`country==IN && fclass==P && fcode in PPL/PPLA* && pop>~10k` + dedupe `PPLX`) and admin-code→name join via `admin1Codes.txt`. Non-trivial curation script, but one-off.
* **Freshness:** daily.

### 1b. SimpleMaps `in-cities` (`simplemaps.com/data/in-cities`)

* **Format:** Free **354-row** CSV/JSON/XLSX — fields `city, city_ascii, lat, lng, country, iso2, admin_name, capital, population (+id paid)`. Teaser of full 523k India / 4.4M world (`worldcities`, paid $199/$499; Basic 50.2k world is CC-BY 4.0 with ~2k India rows).
* **Scale:** 354 rows ≈ 25 KB JSON. No hamlets; “prominent cities” only. All 38 TN district HQs + top pilgrim towns covered; taluk-level towns may be missing.
* **Coords:** same decimal + `admin_name` already spelled (`Tamil Nadu`), `capital` flag, `population`. Clean spellings, negligible curation.
* **License:** Free 354 subset **MIT** (“attribution appreciated”); Basic world 50.2k CC-BY 4.0; paid tiers permissive no-redistribution.
* **Ops cost:** near-zero. Full India only if purchased.
* **Freshness:** 2026-08-30 refresh noted.

### 1c. Comparison

| Criterion | GeoNames `IN.zip` | SimpleMaps free 354 | Winner |
|---|---|---|---|
| Coverage for TN capitals use-case | >10k places → curate top 150 by pop to cover every district HQ + pilgrim town | 354 prominent — covers 38 TN HQs + top pilgrim towns, misses some taluk towns | GeoNames wins completeness; SimpleMaps wins zero-effort |
| Payload to ship | Filtered 150–300 rows ≈ 20–30 KB JSON after pruning | 354 rows ≈ 25 KB JSON | Tie |
| Cleanliness | Noisy; admin codes not names; needs dedupe | Clean `city, admin_name, population, lat, lng` | SimpleMaps |
| License / attribution | CC-BY 4.0 | MIT / CC-BY 4.0 Basic — both allow check-in | Tie |
| Build cost | `tools/build_cities.py` + admin decode | One download; optional Basic upgrade later | SimpleMaps |
| Local-first | Fully static | Fully static | Tie |
| Wrangler leak (`wrangler.toml:4 directory="./"`) | Same | Same | — |

### 1d. Decision — PASS (SimpleMaps primary + GeoNames fallback)

*SimpleMaps 354 (MIT) as v1; GeoNames as curated fallback for missing towns.*

Rationale: holiday capitals request (`HANDOFF.md:22`) was 3–5 chips (Chennai/Coimbatore/Madurai/Trichy). 354 is 10× that. `wrangler.toml` leak makes a 15 MB raw dump undesirable. If a pilgrim site (Palani, Kanchipuram, Srirangam) is missing, single-row fallback from GeoNames patches it without switching the whole dataset.

*Build artifact:* `rules/in_cities.json` schema `in-cities-v1` — `[{ city, city_ascii, admin_name, lat, lng, population?, capital? }]` + `provenance { source, date, license, rows }`. Build script `tools/build_cities.py --source simplemaps|geonames|merged` produces one file. Row budget 200–400, sorted by `population desc`, ascii alias for search, deduped by `city+admin_name`.

*Q1 locked:* **GO — SimpleMaps primary + GeoNames fallback.** Fixes “cannot trust user to enter coordinates” (Q1 owner note) — city picker autofills `bLat/bLon/bTz/bPlace`; manual fields stay visible as advanced override.

---

## 2. Weather After Avoid Days — Evaluation

### 2a. Live providers scouted

| Provider | Key | CORS | Cost / limit | Data | Fit |
|---|---|---|---|---|---|
| **Open-Meteo `api.open-meteo.com/v1/forecast`** | None | Yes | Free non-commercial, CC-BY 4.0, fair use | `daily: temperature_2m_max/min, precipitation_sum/probability_max, windspeed_10m_max, weathercode` | **Best fit: no credential, browser-direct** |
| `wttr.in` | None | Yes | Free, spotty | Similar | Fragile |
| OpenWeatherMap | Key | Yes | Free 1k/d | Rich | Key-management debt |
| IMD / DRIK private | — | No | — | — | Not usable |

Proposed fetch: `https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,windspeed_10m_max,weathercode&timezone=Asia/Kolkata&forecast_days=3` — one request per location per session, 2h `localStorage` cache.

### 2b. Panchang / science offline — can we forecast without internet?

| Panchang layer | Source | Timescale | 3-day numeric forecast? | Computable offline from `engine.js`? |
|---|---|---|---|---|
| **Garbha-lakṣaṇa** (cloud pregnancy 195 d) `Brihat Samhita Ch.21` | Varāhamihira | Conception in Mārgaśīrṣa (Moon in Pūrvāṣāḍha) → delivery 195 d later | No | Yes (Moon nakshatra 195 d earlier) but needs sky-observation of “healthy vs vitiated garbha” |
| **Pravasarṇa** (seasonal quantum) `Ch.23 Sl.6-9` | Varāha / Garga / Parāśara | First rainy day *after Jyeṣṭha Purnima* (June) → Chandra-nakshatra → 10 bins → total-season rainfall in `droṇa` (1 droṇa = 64 mm) | No — seasonal total | Yes — needs ground truth “first rain date” |
| **Sadyovarṣaṇa** (immediate rain) `Ch.28` | Varāha | Hours–1-2 days | Closest, but based on halo / cloud shape / wind dir | No — needs observation |
| **Ārdrā Praveśa** (Sun enters Ārdrā ≈ Jun 22) + **Kūrma Chakra** | Pañcāṅga praxis (2026 forecasts: Grover/ABP/Bhrigusadhu) | Whole-monsoon (Jun–Sep) outlook; King/Minister planets (Sun→moderate, Moon→very heavy, Mars→scanty…) + 7 nāḍī (Chanda→no rain … Jala/Amṛta→abundant) | No | Yes — Sun `66°40′` ingress chart can be cast, but India-wide not city 3-day temps |
| **IMD climatology** | `dsp.imdpune.gov.in` 1991-2020 normals (435 stations), `data.gov.in` city table | Monthly *normal* (long-period avg) per city | No — gives “September in Chennai 33/24°C, ~150 mm / 8 days” | Yes — fully static |

**Validation:** Vaidya 16-station Gujarat/Tirupati test (1969-2018): Varāha first-rain→droṇa was **−7.9% mean error at state level**, ~10% at good stations, 50% CV at arid stations — seasonal skill only. Pañcāṅga vs IMD seasonal totals reported **75–78% hit (1946-95)** in some compilations. Researchers warn: *use pañcāṅga for sowing window / onset within a safe met window; don’t replace short-range models.*

### 2c. Honest finding

> **Pañcāṅga can give a credible *offline seasonal* indication; it cannot give an honest 3-day numeric forecast (max/min, precip %).** Sadyovarṣaṇa needs eyes on the sky; Ārdrā Praveśa gives qualitative (“good beginning, scattered middle” — useful for farming) but fabricated as `31°/26° 10%` chips.

Hybrid that was scoped before the drop: live 3-day Open-Meteo (silent-hide on fail) + offline normals strip from IMD + one-line Ārdrā readout computable via `engine.js` (`siderealLon(Sun)=66°40′`). Kept for reference; not built.

### 2d. Decision — WEATHER DROPPED

*Owner 2026-09-03:*

> “I dont find the weather adding much value to the calendar as we want it to be an authentic traditional knowledge source. hence we drop the weather feature as it is not useful.”

**Lock:** No weather card. Ordering invariant remains **Avoid Days → Gochara → Muhurta → Month** (`docs/gochara_addition.md:0`). No network dependency introduced; card slot after Avoid stays empty until a traditional layer fills it. On fetch error there is nothing to hide. Attribution for cities still goes to footer (see §3).

---

## 3. Locked Decisions (all Qs)

| Q | Topic | Lock |
|---|---|---|
| **Q1** | City quick-selector source | **SimpleMaps 354 MIT primary + GeoNames IN.zip fallback** — `rules/in_cities.json` (one file, provenance block, attribution in footer). Fixes manual lat/lon risk. |
| **Q2** | Weather scope | **Dropped** — was 3-day strip + silent hide on error; now no feature. |
| **Q3** | Attribution | **Cities credited in page footer** (`SimpleMaps MIT · GeoNames CC-BY 4.0`) + per-file provenance. Weather attribution not needed (feature dropped); would have been `Open-Meteo CC-BY 4.0` if revived. |
| **Q4** | Panchang vs science weather | **Researched and archived here; outcome = drop.** Citable seasonal models exist (Ārdrā Praveśa, Garbha, Nāḍī, IMD normals) but no honest offline 3-day numeric forecast. Seasonal panchang badge deferred as an optional future layer, not built now. |

---

## 4. What stays on the roadmap

1. **City quick-selector — next build:** searchable combobox + 4–5 quick chips (Chennai · Coimbatore · Madurai · Trichy · Salem) above `Current place` in `index.html:344-350`; click → autofill `bPlace/bLat/bLon/bTz` → `computeBirth()`; mobile 44px hit, chips wrap; `wrangler.toml` allowlist to keep new JSON from inflating leaks.
2. **No weather work.** IMD normals (`rules/climate_normals.json`) and Ārdrā helper (`panchang/monsoon.js`) remain *deferred ideas* if an offline “normal vs live” strip is ever wanted.
3. **Authentic return drivers:** see companion proposal (owner-asked) for daily/periodic traditional layers that *do* add value — daily Nitya, Tithi-practice, Siddhar pulse, Gochara tightening, etc. — to be filed separately.

---

## 5. References (fetched this session)

* GeoNames dump readme + `IN.zip` (15 MB, 1.7 MB gz) — CC-BY 4.0.
* SimpleMaps `in-cities` 354 free + `worldcities` 50.2k/4.4M — MIT / CC-BY 4.0.
* Open-Meteo `/v1/forecast` docs — no key, CORS, CC-BY 4.0.
* Brihat Samhita Ch.21 Garbhalakṣaṇa, Ch.23 Pravasarṇa (wisdomlib, siva.sh), Ch.28 Sadyovarṣaṇa.
* `eagri.org/AGRO102/lec07` — Dwi/Tri/Sapta Nāḍī, 7-nāḍī table, Garbha 195 d.
* `myzodiaq.in/panchang-and-agriculture` — 5 limbs + King/Minister + nāḍī; 75–78% seasonal hit claims.
* Ravinder Grover / Bhrigusadhu / ABP 2026 Ārdrā Praveśa forecasts (Jun 22 12:26 IST charts).
* IMD `dsp.imdpune.gov.in/home_normals.php` 1991-2020 normals (435 stations); `data.gov.in` city climatology; `imdpune` *Climatological Tables 1961-90 / 1981-2010* PDFs.

---

*This file is the single later-reference for the “weather vs panchang” branch. Keep `rules/in_cities.json` as the machine truth for cities and this doc as the human truth — edit both together.*
