# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-09-03 (A+B+C+D daily drivers + dual-chip Gochara fix)

## Goal Accomplished (this session — 2026-09-03)

- **Weather & City Research — locked `docs/weather-and-city-research.md:1`:** SimpleMaps 354 MIT primary + GeoNames 28 fallback (382 rows `in-cities-v1`), weather DROPPED — no honest offline 3-day forecast.
- **Tirumandiram + City shipped (prior):** `rules/tirumandiram_daily.json` 365 `tirumandiram-daily-v1` + `tirumandiram.mjs:1` + `rules/in_cities.json` 382 rows + `docs/enhancements-pipeline.md` pipeline (see `D:\knowledge-base\HANDOFF.md` prior entry).
- **A — Daily Panchang Digest `index.html:389` `app.js:625` `engine.js:622`:** hero `Date·Tithi·Nakshatra·Yoga·Karana·Sunrise/Sunset·Rahu/Yama/Gulika·Abhijit·Chandrashtama` capsule of `computeDay`. IST `2026-09-03` Saptami·Krittika·Vyaghata.
- **B — Daily Nitya Sadhana `index.html:396` `app.js:680` `nitya.mjs:1`:** lifts `nitya-devi-v1` 16 kalās from table cell to large card `Today — Nitya Śivadūtī · Manadā? kalā/bīja · copyable mantra` behind dikṣā note. Pedagogic Krishna-forward `Tvarita` invariant.
- **C — Upcoming 7-day Pulse `index.html:410` `app.js:730`:** banner next 7 days `Pradosham/Ekadashi/Amavasya + Tamil festivals + Siddhar pujas` via `dayMap+7`, 7 rows with Nitya tag + chip set.
- **D — Today’s Gochara Pulse `index.html:460` `app.js:1255` `gochara.mjs:1`:** daily `Transit Moon Chandrabala (house from janma) + Tara` via `gocharaForBirth` + `BPHS H1..12` + Vedha. Fix Kanya 8th: `Mesha→Vrishabha 07:26 IST` now **dual chips** `8th Aśubha till 07:26 → 9th Aśubha from 07:26` (no false “then OK”; `GOCHARA_MOON_H9` still aśubha) + Tara `till/from` before next sunrise `app.js:1298`. Impersonal fallback preserved.
- **UI Review `docs/ui-review-1.md:1` discussed:** SVG chevrons, iconify copies, frameless ghost, left-border, hierarchy — classified micro vs structural. Deferred to next session per owner; F (`D:\notif` hub) stays deferred.
- **Verification:** `npm test` green INV 151 + BND 9 + OVR 143 + PRS 7 + marriage 51 + guna-milap 45 + gochara 51 + nitya 15 + tirumandiram 10 + city 21; `node --check app.js` clean; serve `127.0.0.1:8124` order `Avoid→Panchang→Nitya→Verse→Pulse→GocharaPulse→Gochara`.

## Immediate Next Steps

1. **Deploy** `npx wrangler deploy` — verify live `Avoid→Panchang→Nitya→Verse→Pulse→GocharaPulse→Gochara` + Kanya 8th dual-chip `07:26` till/from.
2. **Next session — UI polish pass** `docs/ui-review-1.md` — micro (SVG nav, clipboard icons, ghost→frameless, left-border) + structural (no bottom bar yet) as single pass after D.
3. **F deferred** — Pradosha/Ekadashi push via `D:\notif` hub + ICS remains queued (cross-project).
4. **wrangler.toml allowlist** — `assets: ./` leaks 1053 files; cap with allowlist after `in_cities.json` 67KB + `tirumandiram_daily.json` 340KB.
5. **PWA/ICS/Print audit** for new cards (Panchang/Nitya/Pulse/GocharaPulse) — deferred to UI pass.

## Watch Outs

- `wrangler.toml:4` assets `./` leak + 340KB tirumandiram — allowlist before next big asset.
- `app.js:1298` GocharaPulse uses `swe.crossingForward` + `nakshatraEnd` to compute `till 07:26` before next sunrise; `GOCHARA_MOON_H9` is still aśubha — don’t claim “then OK” when house stays aśubha.
- City `city_ascii` search key, `city` display; `dayOfYear %365` IST rotation; `mapping.convention: pedagogic-krishna-forward`.
- Keep `docs/weather-and-city-research.md` + `docs/enhancements-pipeline.md` together; pipeline is live queue.

## Pointer

- Master session log: `D:\knowledge-base\HANDOFF.md`
- Research: `D:\astro-cal\docs\weather-and-city-research.md` · Pipeline: `D:\astro-cal\docs\enhancements-pipeline.md` · UI review: `D:\astro-cal\docs\ui-review-1.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: `D:\astro-cal\PRD.md`
- Live: `https://astro-cal.srirambm.workers.dev` · Worker: `src/worker.mjs` · Wrangler: `wrangler.toml`
