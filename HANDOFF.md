# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-09-03 (Weather/City Research + Tirumandiram Verse-of-Day + City Quick-Selector)

**Session token count (this session):** see master log.

## Goal Accomplished (this session — 2026-09-03)

- **Weather & City Research — locked `docs/weather-and-city-research.md:1`:** evaluated GeoNames IN.zip (19 cols, CC-BY 4.0, 15 MB raw, noisy) vs SimpleMaps in-cities 354 MIT (25 KB, clean `city/admin_name/lat/lng`). Locked **Q1 GO SimpleMaps primary + GeoNames fallback**, **Q2-Q4 weather DROPPED** — panchang gives seasonal only (Garbha 195d Ch.21, Pravasaṇa droṇa Ch.23, Sadyovarṣaṇa Ch.28, Ārdrā Praveśa Jun 22 + Nāḍī, IMD normals) — no honest 3-day offline forecast; no network dependency added; city attribution in footer.
- **Tirumandiram — Verse of the Day (daily return driver):** 3047 verses `D:\tirumandiram\output\verse-*.json:1` → curated `rules/tirumandiram_daily.json:1` 365 entries `tirumandiram-daily-v1` (evenly sampled, `dayOfYear % 365` IST). Helper `tirumandiram.mjs:1` `getVerseOfDay`. Card between Avoid → Gochara `index.html:389` (Tamil pre-wrap + transliteration + English + Copy/Prev/Next + tirumandiram.in ↗), wired `app.js:1028` fetch + render. Tests `tests/tirumandiram-tests.mjs:1` 10 pass (Jan1→1, Dec31→365, Sep3→2046).
- **City Quick-Selector:** `rules/in_cities.json:1` `in-cities-v1` 382 rows (354 SimpleMaps + 28 TN district/pilgrim fallback — Palani/Kanchipuram/Tiruvannamalai/Rameswaram etc., 67 KB). Searchable combobox + 5 chips Chennai/Coimbatore/Madurai/Tiruchirappalli/Salem `index.html:367` above Current place; autofills `bPlace/bLat/bLon/bTz` (`app.js:1085` `cityMatches/renderCityDropdown/applyCity/initCitySelector`), manual lat/lon stays editable. Footer credit `index.html:496` (SimpleMaps MIT + GeoNames CC-BY 4.0 · 382). Tests `tests/city-tests.mjs:1` 21 pass, `npm test` green (INV 151 + BND 9 + OVR 143 + PRS 7 + marriage 51 + guna-milap 45 + gochara 51 + nitya 15 + tirumandiram 10 + city 21).
- **Pipeline doc:** `docs/enhancements-pipeline.md:1` single source for return drivers (2 shipped / 4 queued). See table — next is Daily Panchang Digest + Daily Nitya hero.

## Immediate Next Steps

1. **Commit & deploy** — new assets: `rules/in_cities.json`, `rules/tirumandiram_daily.json`, `tirumandiram.mjs`, `docs/weather-and-city-research.md`, `docs/enhancements-pipeline.md` + edits `app.js`, `index.html`, `package.json`, `tests/*`. Run `precommit-review` → `commit-release` → `npx wrangler deploy`. Verify live verse card + city search `mad→Madurai` + chips.
2. **Next build (return per LOC): A+B as “Today” hero — Daily Panchang Digest + Daily Nitya Sadhana** (pure offline, zero deps). Place `Avoid → (A+B) → Verse → Gochara`. Then C (Upcoming 7-day Pulse) → D (Today’s Gochara Pulse) → F (Pradosha/Ekadashi push via D:\notif hub + ICS). Order per `docs/enhancements-pipeline.md`.
3. **PWA / ICS / Print audit** for new cards (Gochara/Avoid/Nitya/Holiday/Verse/City) — deferred.
4. **wrangler.toml allowlist** — `assets: ./` leaks 1053 files; cap with allowlist (`assets` + `rules` + `reference`) after cap `in_cities.json` 67KB + `tirumandiram_daily.json` 340KB.

## Watch Outs

- `rules/in_cities.json` diacritics normalized (Nādampālaiyam→Nadampalaiyam, Trichinopoly→Tiruchirappalli); keep `city_ascii` for search, `city` for display.
- City picker is autofill-only — user must still press `Compute calendar`; manual lat/lon override stays.
- Verse rotation `dayOfYear` IST (`Date.UTC+5:30`); leap Dec 31 wraps to verse 1 (`tirumandiram.mjs:5`).
- Keep `docs/weather-and-city-research.md` + `rules/in_cities.json` in sync; `docs/enhancements-pipeline.md` is the live queue — update together.
- `wrangler.toml:4` assets `./` leak + new 340KB tirumandiram — allowlist before next big asset.

## Pointer

- Master session log: `D:\knowledge-base\HANDOFF.md`
- Research: `D:\astro-cal\docs\weather-and-city-research.md` · Pipeline: `D:\astro-cal\docs\enhancements-pipeline.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: `D:\astro-cal\PRD.md`
- Live: `https://astro-cal.srirambm.workers.dev` · Worker: `src/worker.mjs` · Wrangler: `wrangler.toml`
