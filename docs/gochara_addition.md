# Gochara Addition — Monthly Transit (Gochara Phala) Spec

> **Status:** draft · **Version:** 0.2 · **Date:** 2026-09-02
> **Owner decision:** serious Muhurta calendar — monthly return driver must be classically grounded, not “fun software”.
> **Companion docs:** `PRD.md` (single source of truth), `engine.js`, `scratch_sept_transits.mjs` / `scratch_gochara.mjs` PoCs (2026-09-02).

---

## 0. INVARIANT — Chandrashtama / “Avoid Days” remains primary (owner caveat 2026-09-02)

> **This addition must not in any way disturb the existing Chandrashtama calculation.**
> Chandrashtama is the calendar’s core avoidance signal and stays highlighted **at the very top** as **“Avoid Days”** — the first thing a user sees, for anything important other than routine. Gochara is strictly **additive, below the fold**, never a replacement or dilution.
> - `engine.js:298 chandrashtama()` + `engine.js:140 taraBala` + daily Candrabala remain the daily hard-avoid layer (Chandrashtama = transit Moon in 8th rashi + peak nakshatra `(janma+16)%27`). No code path in `gochara.mjs` touches `chandrashtama()`, `computeDay()`, or the calendar cell rendering.
> - UI order is locked: **(1) Avoid Days (Chandrashtama)** → **(2) Monthly Gochara card** → **(3) Muhurta table**. Gochara never re-ranks or hides an Avoid Day.
> - Copy: `Avoid Days — Ashtama Chandra (Chandrashtama) — avoid important initiations other than routine` with the existing two-tone bar + legend. Gochara rows carry a distinct header `Gochara — monthly transits` so the two layers are never confused.

---

## 1. Goal

Add a **monthly Gochara (transit) view** that makes users return at least once a month, without compromising the calendar’s classical integrity.

- PoC proved: `swisseph-wasm` + `SE_SIDM_LAHIRI` can list sidereal rashi ingresses exactly (scratch run for Sep 2026 → 5 Moon-excluded ingresses, §5). No new astronomy dep.
- This spec locks the **foundational rules** for predictions (not cute placeholders) and the dual personal filter **Candrabala (house) + Tārābala** that panchang-literate users expect.

Non-goal of this addition: replace the daily Muhurta table or the Chandrashtama “Avoid Days” strip. Gochara is a **monthly, personal, read-only** layer on top of the existing calendar, strictly after Avoid Days.

## 2. Classical foundations

| Layer | Authority | What it governs |
|---|---|---|
| **Gochara house favourability** | *Bṛhat Parāśara Horā Śāstra* Ch.30–32 (Gochara), corroborated by *Sārāvalī*, *Phaladīpikā* Ch.26, *Jātaka Pārijāta* | Per-planet śubha houses **counted from janma rāśi** (natal Moon sign), with Vedha (obstruction) |
| **Tārābala** | *Muhūrta Chintāmaṇi* §1 + standard Nava-Tārā (already in `engine.js:140`) | Janma nakshatra → transit nakshatra (or transit planet’s nakshatra) folded on 9 |
| **Provenance pattern** | Same as `rules/muhurta_rules.json` + `reference/provenance_registry.json` | Every row carries `verseKey`, Sanskrit, translation, and paraphrase — no uncited phala |

**Canonical śubha houses from janma rāśi (BPHS, to be encoded in `gochara_rules.json`):**

- Sūrya: `3, 6, 10, 11`
- Candra: `1, 3, 6, 7, 10, 11` (not used for monthly rashi ingress because Moon is excluded; kept for daily Candrabala already in engine)
- Maṅgala: `3, 6, 11`
- Budha: `2, 4, 6, 8, 10, 11`
- Guru: `2, 5, 7, 9, 11`
- Śukra: `1, 2, 3, 4, 5, 8, 9, 11, 12`
- Śani: `3, 6, 11`
- Rāhu/Ketu: as Śani (with own Vedha rows if Sārāvalī diverges — flagged)

**Vedha (cancellation)** — classical obstruction that nullifies a śubha house, e.g.:

- Sūrya 3rd vedha by Śani 9th, Sūrya 6th vedha by Śani 12th, etc. (full table in `classical_rule_architecture_mc.md` § to be transcribed; encoded as `vedha: [{ house, byPlanet, vedhaHouse }]`).
- Vedha is **evaluated at the transit instant**: if the vedha planet is simultaneously in its vedha house, the śubha downgrades to `vedha-blocked` (shown as `⚑ vedha`).

**Tārābala:** `engine.js:140 taraBala(janmaNak, transitNak)` — `count = ((transitNak - janmaNak +27)%27)+1`, `tārā = ((count-1)%9)+1`. Nature: `2 Sampat, 4 Kṣema, 6 Sādhaka, 8 Mitra, 9 Parama-Mitra` = favourable (`✨`), `3 Vipat, 5 Pratyari, 7 Vadha(Naidhāna)` = unfavourable (`⚠️`), `1 Janma` = neutral. This is the **second badge** on every transit line, familiar to panchang users.

**Candrabala** for Gochara is the house itself (same 1..12). No separate moon-rāśi check needed for monthly ingress; daily Candrabala remains in the muhurta table (`engine.js:298 chandrashtama` / `engine.js:140`).

## 3. Scope — what is / is not built

**In scope (v1):**

- Monthly rāśi ingress list for **7 planets + Rāhu/Ketu** (Moon **excluded** — 2.5-day cadence, not monthly value; owner decision 2026-09-02). Retro stations are detected but expected to be sparse (PoC Sep 2026 has none except Śani already retrograde; reported as state, not event).
- Sidereal (Lahiri) only — `engine.js:79 set_sid_mode(SE_SIDM_LAHIRI)` + `engine.js:87 siderealLon` with `SEFLG_SIDEREAL|SEFLG_SPEED`. No tropical/western dates.
- Personalization requires **birth rāśi + birth nakshatra** (already from `birthChart()` at `engine.js:282`). If birth not entered, show impersonal ingress list only (no house/tārā).
- One row per ingress: `date (IST) | weekday | planet | from→to | house (from janma rāśi) | śubha/aśubha badge | tārā badge | classical paraphrase + verse cite`.

**Out of scope (deferred):**

- Nakshatra-pada ingresses, Aṣṭakavarga bindus, Sāḍhe-Sātī / Kāṇṭaka-Śani full analysis, Dasha-based phala. These are documented in `gochara_rules.json:documentedButNotImplemented` for later.
- Daily Gochara push notifications — month view is the surface; hub not involved.
- Any predictive text without a `verseKey` — prohibited.

## 4. Computation (reuse PoC)

PoC files: `scratch_sept_transits.mjs:1` (detection) + `scratch_gochara.mjs:1` (personalization).

- **Scan window:** `jdStart = julday(year, month, 1, -5.5)` (00:00 IST → UT-5.5) to `jdEnd = julday(nextMonth, 1, -5.5)`. Exclusive of next month.
- **Detection:** step `0.1d` (2.4h) for all planets; at each step compare `rashiOf(siderealLon(jd, planet))` (`engine.js:98`). On change, bisection 18 iterations between `jd-0.1` and `jd` to refine `crossJd`. For retrograde planets (Rāhu) the sign change is still caught because `rashiOf` flips.
- **Ketu:** derived as `(RāhuLon+180)%360` (`scratch_sept_transits.mjs` Ketu companion event).
- **House:** `houseFrom(birthRashi, toRashi) = ((toRashi - birthRashi +12)%12)+1`.
- **Transit nakshatra:** `nakshatraOf(siderealLon(crossJd, planet))` (`engine.js:99`) for tārā.
- **Tārā:** `taraBala(janmaNak, transitNak)`.
- **Speed / retro state:** `calc_ut(jd, planet, SEFLG_SWIEPH|SEFLG_SIDEREAL|SEFLG_SPEED)[3]` (needs `SEFLG_SPEED=256`; PoC `scratch_sept_retro.mjs:1` proved omission returns 0). Used to label “already retrograde / direct” and to detect station zero-crossings in future months.
- **Vedha:** after house lookup, check `gochara_rules.json:vedha` — if vedha planet’s current rāśi at `crossJd` equals `vedhaHouse`, mark `vedhaBlocked: true`.

**PoC result (September 2026, Moon-excluded, IST, Lahiri):**

```
2026-09-02 Wed 13:44  Śukra  Kanyā→Tulā   | 2026-09-07 Mon 13:32  Budha  Siṃha→Kanyā
2026-09-17 Thu 07:52  Sūrya  Siṃha→Kanyā  | 2026-09-18 Fri 16:35  Maṅgala Mithuna→Karka
2026-09-26 Sat 12:38  Budha  Kanyā→Tulā
No ingress: Guru (Karka), Śani (Mīna, retro), Rāhu (Kumbha)/Ketu (Siṃha)
No station in September (all direct except Śani retro) — scratch_gochara/retro PoCs
```

This is the regression fixture for tests.

## 5. Data schema

`rules/gochara_rules.json` — schema `gochara-rules-v1`, local-first, no DB:

```json
{
  "schema": "gochara-rules-v1",
  "ayaNamsa": "Lahiri",
  "source": "Bṛhat Parāśara Horā Śāstra Ch.30-32 + Sārāvalī/Phaladīpikā (to be cited per row)",
  "rules": [
    {
      "planet": "Venus",
      "house": 7,
      "effect": "madhyama",
      "classical_text": "…",
      "translation": "…",
      "paraphrase": "Relations in focus — keep agreements fair; avoid over-spending.",
      "verseKey": "bphs_31_12",
      "vedha": null
    }
  ],
  "vedhaTable": [
    { "planet": "Sun", "house": 3, "vedhaBy": "Saturn", "vedhaHouse": 9 }
  ],
  "provenance": "Muhūrta Chintāmaṇi style — registry in reference/provenance_registry.json",
  "documentedButNotImplemented": ["ashtakavarga", "sade_sati", "nakshatra_pada_ingress"]
}
```

`provenance_registry.json` gains `chapter: gochara_bphs` with verse entries; `verseKey` resolves there (same pattern as `ch6_vivaha`).

## 6. Engine contract

New module `gochara.mjs` (pure, no DOM, reuses `Engine`):

```ts
export function listMonthlyTransits(year: number, month: number, engine: Engine): Transit[]
// Transit { jd, date, weekday, planet, fromRashi, toRashi, fromRashiName, toRashiName, transitNak, transitNakName }

export function gocharaForBirth(transit: Transit, birth: { rashi: number, nakshatra: number }, rules: GocharaRules): GocharaRow
// GocharaRow { ...transit, house, effect, vedhaBlocked, tara: { number, name, nature }, paraphrase, verseKey }

export function listMonthlyGochara(year, month, birth, engine, rules): GocharaRow[]
```

- Deterministic, no network, `Engine` already initialized.
- If `birth` is null, returns impersonal `Transit[]`.

## 7. Personalization — why two badges

Panchang-literate users validate a day by **Tārā + Candrabala**. Monthly Gochara mirrors that:

- **House badge** (Candrabala): `house` → colour `śubha green / madhyama amber / aśubha rose / vedha hatched`.
- **Tārā badge** (`engine.js:140`): `Sampat/Kṣema/Sādhaka/Mitra/Parama-Mitra ✨` vs `Vipat/Pratyari/Vadha ⚠️` vs `Janma —`. Tooltip shows `count` and `tārā name`.

No cute invented lines — badges + one-line classical paraphrase + verse cite keep it serious yet scannable.

## 8. UI — monthly Gochara card

- **Placement:** below the month calendar / above the muhurta table, **always below the Avoid Days (Chandrashtama) strip** (§0). Collapsed by default if birth not entered (“Enter birth details to see your Gochara”).
- **Header:** `Gochara — September 2026 · for [janma rāśi]` + `i` provenance button.
- **Rows (max 5–7/month):** `Date · Weekday · IST time · Planet · Rāśi from→to · House (n)th · effect chip · tārā chip · paraphrase`. Vedha rows show `⚑ vedha` and downgrade chip.
- **Impersonal fallback:** same rows without house/tārā/paraphrase (just ingress list).
- **Print:** card prints with chips (like alliance-filter).
- **Disclaimer footer:** “Classical indication per Parāśara/Sārāvalī; not financial/medical advice. Consult a paṇḍita for personal decisions.” (matches `guna-milap.html` footer style).
- **A11y / i18n:** planet/rāśi names use `RASHI:6` + `NAKSHATRA:14`; no new strings.

## 9. Provenance & honesty

- Every `paraphrase` must have a `verseKey` in `provenance_registry.json`; build step `validate_gochara.js` fails otherwise (same as `validate_rules.py` for muhurta corpus).
- `vedic_panchang.pdf` not authoritative for gochara houses — use only for structure, cross-check against BPHS text.
- If Sārāvalī diverges from BPHS on a house, encode `variant` and cite both (registry `meta.variants`).

## 10. Non-goals

- No tropical/western zodiac, no Sun-sign horoscope.
- No natal chart / daśā / aṣṭakavarga scoring in v1.
- No Moon ingress spam.
- No LLM-generated phala.

## 11. Validation

- **Astronomy:** `scratch_sept_transits` 5-event fixture is the regression; any engine change must reproduce those JDs within 15 min (IST). Cross-check one month against Drik Panchang “Planet ingress” dates (sidereal) for Sun/Venus/Mercury.
- **Tārā:** hand-check `taraBala` for 2–3 janma nakshatras against `modernastro`/`panchangbodh` (same as PRD §2.8).
- **Gochara phala:** unit test every `planet×house` row has `verseKey` resolvable; vedha cases tested with synthetic birth rāśi that triggers vedha.
- **UI:** Playwright at 360×800 — card renders, no horizontal overflow (`scrollWidth - clientWidth == 0`), birth-gated personalization toggles.

## 12. Build order

1. **Spec** — this doc (done, awaiting owner review).
2. **Rules corpus** — author `rules/gochara_rules.json` (84 rows + vedha) + `reference/provenance_registry.json` gochara chapter; run validation.
3. **Engine** — `gochara.mjs` + tests `tests/gochara-tests.mjs` (fixture: Sep 2026 5 ingresses, house/tārā correctness).
4. **UI** — monthly Gochara card wired to `index.html` calendar + birth form; uses `Engine` instance already in `app.js`.
5. **Polish** — print, night mode, mobile cards, provenance modal.

---

### Appendix — PoC excerpts to keep

- Detection: `scratch_sept_transits.mjs:1` (Moon excluded, Ketu companion, IST conversion).
- Retro check: `scratch_sept_retro.mjs:1` (needs `SEFLG_SPEED`).
- Personalization demo: `scratch_gochara.mjs:1` (house + GOCHARA placeholder → to be replaced by classical rows).

