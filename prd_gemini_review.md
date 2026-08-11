# Executive Review & Architectural Validation: Astro-Cal PRD

**Target Document:** `D:\astro-cal\PRD.md`  
**Reviewer:** Gemini Flash 3.6 (System & Architectural Reviewer)  
**Date:** August 11, 2026  
**Status:** Completed  

---

## 1. Executive Summary & Core Verdict

The **Astro-Cal PRD (`PRD.md`)** provides a well-structured, pragmatically scoped, and mathematically grounded blueprint for a local-first Vedic astrology calendar and electional (*Muhurta*) engine. The transition from an earlier server/microservice architecture (VMRE) to a client-side WASM-powered calculator engine (`swisseph-wasm`) represents a major simplification in deployment, privacy, and infrastructure complexity without sacrificing astronomical precision.

### Core Verdict: **APPROVED WITH STRATEGIC REFINEMENTS**
The overall architecture, data-flow model, and multi-tiered scoring methodology are sound. However, several critical operational edge-cases, mathematical boundary conditions, and schema maintenance risks must be addressed before proceeding to full implementation of Phase 2.

---

## 2. Architectural Strengths

1. **Local-First, Zero-Backend Design:**
   - Leveraging `swisseph-wasm` (v2.10.03 C ephemeris compiled to WebAssembly) entirely in-browser ensures zero external network dependencies, instantaneous computation after initial WASM load, and absolute user privacy (natal data remains in `localStorage`).
2. **Deterministic Single Source of Truth:**
   - Establishing `PRD.md` as the authoritative specification while archiving historical/exploratory proposals in `reference/` eliminates design drift.
3. **Flexible Constraint Satisfaction (Tiered Scoring vs. Binary Blocks):**
   - The adoption of a 3-tier severity classification ($T_1$ Hard Blockers, $T_2$ Primary Alignment, $T_3$ Secondary Preferences) alongside an explicit **Cancellation/Override Stack** ($Parihara$) solves the classical "Zero-Window Problem" inherent in strict binary rule evaluation.
4. **Astronomical Rigor over Heuristics:**
   - Using true sidereal longitudes via Swiss Ephemeris (`Lahiri Ayanamsha`) for Tithi, Nitya Yoga, Karana, and Chandrashtama rather than simplified mean-motion approximations guarantees accuracy against authoritative almanacs (*Drik Panchang*).

---

## 3. High-Priority Issues & Flaws Flagged Upfront

### 3.1 Astronomical & Calculation Edge Cases

#### A. Intra-Day Transition vs. Day-Granular Verdict Mismatch (Crucial)
* **Issue:** Classical Panchang elements (Tithi, Nakshatra, Yoga, Karana) shift at arbitrary times during civil day/daylight hours. The PRD anchors daily verdicts on sunrise states while flagging "valid till HH:MM" intra-day transitions.
* **Risk:** A sunrise state may be highly auspicious ($T_1/T_2$ pass), but the active Nakshatra or Karana may transition into an inauspicious state (e.g., *Vishti/Bhadra* or *Gandanta*) 30 minutes after sunrise. Recommending the "day" as *Shubh* creates severe misguidance if the user conducts the activity during the afternoon.
* **Fix:** The engine MUST compute micro-slots or multi-interval segments per day (at minimum: Sunrise to Star-Exit, Star-Exit to Sunset, and Night) rather than assigning a single static daily score. The UI must explicitly present the valid time window bounds (e.g., `Shubh: 06:14 AM – 12:27 PM`).

#### B. Bhadra (Vishti Karana) Loka & Ghati Calculation Complexity
* **Issue:** Section 2.6.5 outlines a sophisticated Bhadra matrix (*Loka* by Moon Rashi, first 5 Ghatis = *Mukha/Mouth*, last 3 Ghatis = *Puchha/Tail*).
* **Risk:** A Ghati is $\frac{1}{60}\text{th}$ of a sidereal day ($\approx 24$ minutes), but the exact duration of a Karana varies because lunar speed fluctuates between $\approx 11.8^\circ/\text{day}$ and $15.2^\circ/\text{day}$. Dividing a Karana into "Ghatis" assuming constant 24-minute blocks leads to cumulative timing errors.
* **Fix:** Define Bhadra *Mukha* and *Puchha* proportionally based on the exact start time $t_{\text{start}}$ and end time $t_{\text{end}}$ of the active *Vishti Karana*:
  $$\text{Mukha Duration} = \frac{5}{30} \times (t_{\text{end}} - t_{\text{start}}) = \frac{1}{6} \Delta t_{\text{Vishti}}$$
  $$\text{Puchha Duration} = \text{Final } \frac{3}{30} \times (t_{\text{end}} - t_{\text{start}}) = \frac{1}{10} \Delta t_{\text{Vishti}}$$

#### C. Calendar-Field Pushdown: Adhik Maas & Kharmas Mechanics
* **Issue:** Section 2.6.3 lists *Adhik Maas* (Intercalary Month) and *Kharmas* (Sun in Sagittarius/Pisces) as $T_1$ hard blockers for major events.
* **Risk:** Determining *Adhik Maas* client-side without an external lookup table requires detecting a lunar month (Amavasya to Amavasya) in which no solar transit (*Sankranti*) occurs. If swisseph longitude polling misses the exact transit instant, the intercalary state could be misflagged.
* **Fix:** Implement explicit *Sankranti* solar longitude checks ($0^\circ, 30^\circ, \dots, 330^\circ$). A lunar month bounded by two consecutive Amavasyas $A_1$ and $A_2$ is an **Adhik Maas** if and only if:
  $$\lfloor \frac{\lambda_{\text{Sun}}(A_1)}{30^\circ} \rfloor = \lfloor \frac{\lambda_{\text{Sun}}(A_2)}{30^\circ} \rfloor$$

---

### 3.2 Performance & WASM Memory Pipeline

#### A. Client-Side Compute Bottlenecks on Custom Date Ranges
* **Issue:** Polling Swiss Ephemeris WASM for Sun/Moon longitudes, planetary transits, house ascendants (*Lagna*), sunrise/sunset, and 250+ JSON rules over a multi-month or full-year custom range will cause UI main-thread blocking / freeze on mobile devices.
* **Fix:**
  1. **Coarse-to-Fine Evaluation:** Run Pass 1 (Calendar-Field & Day-Level Panchang at Sunrise) across the entire date array first. Only execute high-resolution intra-day transition checks (`nakshatraEnd`, `tithiEnd`, Rahu Kalam, Bhadra Ghati) on days that pass initial coarse thresholds.
  2. **Web Worker Offloading:** Move the `swisseph-wasm` calculation engine into a dedicated Web Worker (`ephemeris.worker.js`) to keep the UI main thread 60fps responsive during calendar range scans.

---

### 3.3 Rule Corpus Schema & Data Integrity (`rules/muhurta_rules.json`)

#### A. Declarative Overrides vs. Hardcoded Logic
* **Issue:** Section 2.6.8 introduces `tiers`, `overrides`, `calendar_field`, and `yoga_ghati_ban` as schema deltas for `muhurta_rules.json`.
* **Risk:** Classical cancellation rules (e.g., "*Sarvartha Siddhi Yoga* destroys co-existing *Dagdha Yoga*") require evaluating complex cross-limb conditional logic ($Vara \times Nakshatra$). If `overrides` in JSON is merely an array of string flags like `["SARVARTTHA_SIDDHI"]`, the engine must hardcode the actual evaluation function for every string token.
* **Fix:** Clearly specify the contract: `overrides` in JSON lists **supported rule-evaluator IDs**. The JavaScript engine maintains a deterministic registry of built-in override functions:
  ```javascript
  const OVERRIDE_EVALUATORS = {
    SARVARTTHA_SIDDHI: (ctx) => isSarvarthaSiddhi(ctx.vara, ctx.nakshatra),
    SIDDHA_YOGA: (ctx) => isSiddhaYoga(ctx.tithiGroup, ctx.vara),
    ABHIJIT_WINDOW: (ctx) => ctx.isInsideAbhijit,
    BHADRA_PUCHHA: (ctx) => ctx.isBhadraTail
  };
  ```

---

## 4. Section-by-Section Architectural Evaluation

| PRD Section | Evaluation | Critical Findings & Recommendations |
| :--- | :--- | :--- |
| **§Source Docs & Provenance** | **Excellent** | Correctly isolates AI-generated prompts (`vedic_panchang.pdf`) from classical ground truth (`muhurtha-chinthamani.pdf`). Prevents hallucinated data ingestion. |
| **§Concepts Covered** | **Solid** | Covers essential limbs. Two-tone Chandrashtama (coarse Rashi + peak Nakshatra) matches Drik & Iyengar conventions perfectly. |
| **§Requirements & Tech** | **Pass** | Local-first, `localStorage`, static Node server (`serve.js`), WASM ephemeris. Well-bounded for V1. |
| **§Open Items (1–5)** | **Resolved** | Corrected Ashtama Chandra (by Rashi) and Rahu/Yama/Gulika 8-part daytime split tables. |
| **§Phase 2: Nava Tāra** | **Mathematically Sound** | Tara Bala arithmetic $((\text{MoonNak} - \text{JanmaNak} + 27) \bmod 27) + 1 \pmod 9$ is accurate. |
| **§2.6 Rule-Engine Model** | **Architecturally Strong** | Introduces 3-tier severity ($T_1, T_2, T_3$), scoring verbs (0–100), and $Parihara$ cancellation stack. |
| **§2.7 UI / Product Shape** | **Good** | Focuses on cumulative day rows, score chips, reason lines, and explicit transition timestamps. |
| **§2.8 Validation Plan** | **Actionable** | Regression testing against `vedpanchang.com` and *Drik Panchang* guarantees verification. |

---

## 5. Mathematical & Formula Verification Checklist

To ensure absolute precision in the JavaScript engine, the formulas implemented MUST strictly follow these definitions:

1. **Tithi Index ($0 \dots 29$):**
   $$T = \lfloor \frac{(\lambda_{\text{Moon}} - \lambda_{\text{Sun}}) \bmod 360^\circ}{12^\circ} \rfloor$$
   * $0 \dots 14$: Shukla Paksha ($1 = \text{Pratipada} \dots 14 = \text{Chaturdashi}, 14 = \text{Purnima}$)
   * $15 \dots 29$: Krishna Paksha ($15 = \text{Pratipada} \dots 29 = \text{Amavasya}$)

2. **Nitya Yoga Index ($0 \dots 26$):**
   $$Y = \lfloor \frac{(\lambda_{\text{Sun}} + \lambda_{\text{Moon}}) \bmod 360^\circ}{13.333333^\circ} \rfloor$$

3. **Karana Index ($0 \dots 59$):**
   $$K = \lfloor \frac{(\lambda_{\text{Moon}} - \lambda_{\text{Sun}}) \bmod 360^\circ}{6^\circ} \rfloor$$
   * $K = 0$: Kimstughna (Fixed)
   * $K = 1 \dots 56$: Cyclic Movable Karanas ($1 = \text{Bava}, 2 = \text{Balava}, \dots, 7 = \text{Vishti/Bhadra}$)
   * $K = 57$: Shakuni (Fixed), $K = 58$: Chatushpada (Fixed), $K = 59$: Naga (Fixed)

4. **Nava Tāra (Tara Bala) ($1 \dots 9$):**
   $$N = ((\text{TransitNakshatra} - \text{JanmaNakshatra} + 27) \bmod 27) + 1$$
   $$\text{Tara} = ((N - 1) \bmod 9) + 1$$
   * Favorable: $\{2, 4, 6, 8, 9\}$ | Unfavorable: $\{3, 5, 7\}$ | Neutral: $\{1\}$

5. **Chandrashtama Rashi (Coarse Window):**
   $$\text{Chandrashtama Rashi} = (\text{JanmaRashi} + 7) \bmod 12$$

---

## 6. Actionable Recommendations for Implementation

1. **Adopt Proportional Bhadra Calculations:** Implement the $\frac{1}{6}$ Mukha and $\frac{1}{10}$ Puchha relative time formulas rather than assuming static 24-minute Ghatis.
2. **Implement Worker-Based Offloading:** Move swisseph computation loops to `ephemeris.worker.js` to ensure fluid UI scrolling during multi-month range evaluations.
3. **Formalize Override Contract in JS Engine:** Bind rule JSON `overrides` tokens directly to functional evaluator handlers in `engine.js`.
4. **Enforce Multi-Segment Day Output:** Surface valid time windows (`valid_from` to `valid_until`) in the UI when a Nakshatra/Tithi transitions mid-day, avoiding false "all-day Shubh" indications.

---

*Analysis authored and verified by Gemini Flash 3.6. Written to `D:\astro-cal\prd_gemini_review.md`.*
