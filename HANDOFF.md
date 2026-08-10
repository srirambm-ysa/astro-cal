# HANDOFF — astro-cal (project-local digest)

> Thin digest + pointer. The **master** session log lives at
> [`D:\knowledge-base\HANDOFF.md`](file:///D:/knowledge-base/HANDOFF.md); this file is a convenience copy
> so the folder is self-describing when opened directly. Refreshed by `close-work astro-cal`.

Last updated: 2026-08-10

**Session token count (2026-08-10 · this session):** REAL billed 2,984,271 (RAW 18,511,618 · 83.9% cache efficiency)

## Goal Accomplished (this session)
- **Muhurta Chintamani rules extraction — PILOT + FULL scan done, committed `54d1beb`.**
  - Engine-facing `rules/muhurta_rules.json`: **250 rules** (Ch1 general muhurtas 73, Ch2 nakshatras
    106, Ch5 samskaras 71), all nakshatra names canonical, per-rule id/source/type/verdict/conditions.
  - Pipeline in `tools/`: `extract_pages.py` → `gemini_extract.py` (OpenRouter Flash Lite, concurrent)
    → `validate_rules.py` → `merge_rules.py`. Run: 122 pages, 6 workers, **$0.25**, 0 failures.
  - Key finding: source PDF has **no Devanagari in its OCR text layer** (scan + `InvisibleOCR` text),
    so extraction is **English-text-only** (image path cost ~35% more, no quality gain → dropped).
  - One prompt guard added after a real bug: model silently dropped a nakshatra (p66) and a whole
    medium tier (p125). "Do NOT drop any listed nakshatra; set uncertain=true; extract every tier."
- **Earlier-session nakshatra-dropdown birth input change is now COMMITTED** (was UNCOMMITTED in the
  prior digest — folded into `54d1beb`; still pending the visual/localStorage review below).

## Architectural Decisions
- Engine = Swiss Ephemeris WASM (`swisseph-wasm`, Lahiri ayanamsa); calculator model, no auth,
  localStorage personal layer, static server.
- **Rules corpus = local JSON** (`rules/muhurta_rules.json`), NOT a DB — matches local-first; DB per
  `Technical_Approach.md` only if/when a microservice is adopted.
- Extraction: **English-text-only** via OpenRouter `google/gemini-3.5-flash-lite`; schema = per-rule
  {heading, type, verdict, activities, conditions{nakshatras,weekdays,tithis,tithi_groups,paksha,
  yogas,planetary}, exclusions, notes, uncertain} + source provenance.
- Reference tables for validation transcribed from `classical_rule_architecture_mc.md` §1–§3.

## Immediate Next Steps
- **WIRE the corpus into the engine:** derive the app's ACTIVITIES/muhurta tables from
  `rules/muhurta_rules.json` (or load it dynamically) — the personalization layer depends on this.
  This was the stated reason for building the rules corpus.
- **Review the 3 new docs** (owner): `muhurtha_PRD.md`, `classical_rule_architecture_mc.md`,
  `Technical_Approach.md` — decide scope/architecture before the engine wiring.
- **Optional extra validation:** cross-check a few high-value activities (e.g. griha pravesh, travel)
  in the corpus against Drik Panchang for extra confidence (accuracy bar = match Drik).
- **REVIEW the committed nakshatra-dropdown change** (app.js + index.html): grouped dropdown UX +
  rashi derivation + old-localStorage fallback.
- **AC-TSK-0001 (high, in_progress):** build astro-cal v1 from `PRD.md` using 04 Sacred Ornament
  (day+night) UI. Includes phase-2 muhurta table + Tamil calendar layer + festivals. Self-host fonts.
  Board: `node D:\knowledge-base\tools\task.js list` (project=astro-cal).

## Watch Outs
- Page-level recall validation over-reports prose mentions (Hindu month names Jyeshtha/Magha/Shravana
  collide with nakshatra names; weekday tables). Screening signal — trust reference-diff +
  canonicalization, review recall flags manually.
- "Abhijit" is a 28th nakshatra in the book; engine has 27 — handle in matching.
- Accuracy bar = match Drik Panchang exactly.
- Ganesha/kolam assets still PARKED (ISSUE-0009) — owner supplies manually.

## Pointer
- Master session log: `D:\knowledge-base\HANDOFF.md`
- Project card: `D:\knowledge-base\projects\apps\astro-cal.md`
- Task board: `node D:\knowledge-base\tools\task.js list` · PRD: [`D:\astro-cal\PRD.md`](file:///D:/astro-cal/PRD.md)
- Rules corpus: `rules/muhurta_rules.json` · Tools: `tools/`