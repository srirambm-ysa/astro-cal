# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-09-06 (Key Days + Help split + Nitya tradition + deploy — READY)

## Goal Accomplished (this session — 2026-09-05/06)

- **Muhurta extraction fixed** `muhurta-scoring.mjs:356` missing `chapterDisplay()` → 0 Shubh → restored `FULL 5/Soft 12/Personal 2` for Sep 2026 Griha Pravesha (diagonostic `tests-suite:2-4` expected). Rewrote `muhurta-scoring.mjs:1` pure, bumped `?v=20260904e`. `muhurta.js:172` detail accordion + `data-iso` row select + `chapterDisplay/provItemHTML/classicalBlock/muhurtaDetailHTML` ported, `view.selected` persisted, preset chips `DEFAULT_PRESETS` restored, night CSS `classical-foundation/prov-item` added. Build `public/ 70`.
- **Month on-demand tap fix** `app.js:938` row click called `render()` → same `monthKey` no re-render → `mdetail` never opened. Fixed `mrow` click → `if(dayMap) renderMonthEvents()+renderKeyDays() else render()`, and `render:713` re-sync when cached. `app.js?v=20260904h`.
- **Key Lunar Days strip** `index.html:468` new card before Avoid Days: `Amavasya · Purnima · Janma Nakshatra` grid `3→1` mobile, `keyday highlight`, tap scrolls to `mrow` and selects. `app.js:1442 renderKeyDays()` scans `dayMap` for `tithi.amavasya/purnima` + `moonNakshatra===birth.nakshatra` (e.g. Sep 11/26/06). Night `chip.moon` dark-on-dark fixed `index.html:326` → `#34365E/#E0E0FF`; restores `Compute now` CTA for top-of-page instant load. `app.js?v=20260904k`.
- **Calendar cleanup** removed `index.html:576 muhrCardLink` promo `Muhurta` block (now dedicated `muhurta.html`). Dashboard order now `Key Days → Avoid → Panchang → Nitya → Verse → 7-day → Gochara Pulse → Gochara → Month` (no muhurta card).
- **Help split** created `help-calendar.html:1` (dashboard: Key Days, Avoid, Panchang, Nitya, Verse, Pulses, Gochara, Month table, City) → `index.html:436` now links there. Cleaned `help-muhurta.html:1` to muhurta-only (Domain/Activity/Mode/Table/Row details/Source/Presets, back to `muhurta.html`). Added `scripts/build-public.mjs:23` allowlist `help-calendar.html` → `public/ 70`.
- **Nitya tradition swap** `nityas/nitya-mantras.txt:1` (16 blocks, without diacritics, Om prefix) applied verbatim to `rules/nitya_devis.json:20` in order — e.g. Nilapataka `Phrem Strum…` etc. `source` → `user tradition nityas/nitya-mantras.txt — 2026-09-06`; provenance registry deliberately not extended. Detail shows behind dīkṣā notice with Copy.
- **Deploy** `wrangler deploy` → `1788206d-b44f-4831-b559-f8bc24e9acfd` https://astro-cal.srirambm.workers.dev — 27 assets uploaded.
- Previous Nitya images + micro-icons still live (`nityas-webp` 4-8KB, header `icon-btn` 38px).

## Architectural Decisions
- Muhurta stays standalone `muhurta.html/muhurta.js/muhurta-scoring.mjs` sharing `LS.birth/view` — no taxonomy fetch in `index` (`hasMuhurta` guard `app.js:1925`).
- Month table deferred via `IntersectionObserver 200px` + `monthPlaceholder` Compute button; `dayMap` cached `monthLoadState` — selection re-renders from cache, not full `render()`.
- Key Days requires `dayMap`; shows `Compute now` → `loadMonthBtn.click()` to avoid scroll lag (user-requested).
- Night `chip.moon/chandra` colors fixed for contrast; `keyday` highlight `rgba(197,154,78,.06)`.
- Nitya mantras are informational, diacritic-free per lineage, shown only expanded.

## Immediate Next Steps

1. Manual QA pending your nitya mantra check — confirm 16 strings as printed `nitya_devis.json:20` before final tag.
2. Optional: tag release `git tag v1.x` + changelog if manual check passes; no code blockers.
3. PWA/ICS/Print audit for new Key Days card deferred.

## Watch Outs

- `wrangler.toml:4` `public/` allowlist closed — `npm run build` before `wrangler dev`; `help-calendar.html` now in allowlist.
- `nitya_devis.json` mantras intentionally no `Namah` for Bhagamalini/Vahnivasini per your file — keep as written.
- `app.js`/`muhurta.js` cache `?v=20260904k/g` + `serve.cjs:46 no-store` + `public/_headers` — bump together on next change.

## Pointer

- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- PRD: `D:\astro-cal\PRD.md` · `what-is-personal-mode.md` · `docs/sodashi-tithi-nitya.md`
- Live: `https://astro-cal.srirambm.workers.dev` · `public/ 70 files` · `serve.cjs http://127.0.0.1:8124/`
