While the basic test cases successfully caught the initial pipeline leakage, **a complete test suite requires validating boundary transitions, override hierarchies, and personal filter isolation.** In Panchanga calculations, silent bugs frequently hide in compound conditions (e.g., a Tithi changing mid-day, zero-indexing errors on Nakshatras, or Sunrise-to-Sunrise day boundary shifts).

Here is a structured test suite designed to catch edge cases before moving out of the debugging phase.

---

## 1. Pipeline Invariant Tests (Property-Based)

These tests run across any random $30$-day window to enforce mathematical hierarchy across execution modes.

| Test ID | Scenario | Input Condition | Expected Assertion |
| --- | --- | --- | --- |
| **INV-01** | **Subset Hierarchy** | Run engine on 30 consecutive days across `FULL`, `SOFT`, and `PERSONAL` modes. | $\text{Count}(\text{FULL}) \le \text{Count}(\text{SOFT})$ AND $\text{Candidates}(\text{PERSONAL}) \subseteq \text{Candidates}(\text{SOFT})$ |
| **INV-02** | **Universal Hard Blocker Immunity** | Any slot with an active Universal Hard Blocker (*Bhadra in Earth*, *Asta Guru*, *Rikta Tithi*). | Must return `REJECTED` in **all 3 modes** regardless of birth star or Abhijit Muhurta. |
| **INV-03** | **Score Monotonicity** | Compare identical slots evaluated in `FULL` vs `SOFT` mode. | `Base_Score(FULL)` == `Base_Score(SOFT)`. Only the status threshold changes, not the underlying raw score. |

---

## 2. Boundary & Indexing Edge Cases

| Test ID | Scenario | Input Condition | Expected Behavior |
| --- | --- | --- | --- |
| **BND-01** | **Rashi Zero-Indexing** | Moon in **Pisces** ($12\text{th}$ Rashi / 0-indexed index `11`) during active *Vishti Karana*. | Engine correctly identifies Pisces as *Mrityu Loka* and flags `BHADRA_EARTH_ACTIVE`. Prevents off-by-one errors. |
| **BND-02** | **Nakshatra #1 & #27 Wrap-around** | Transition from *Revati* ($27$) to *Ashwini* ($1$). | `calculate_tara_bala()` correctly handles modulo math without `IndexError` or negative counts. |
| **BND-03** | **Sunrise Boundary Shift** | Activity requested at 05:30 AM before 06:15 AM Sunrise on Wednesday. | Engine evaluates the slot under **Tuesday's Vara** (*Bhauma Vara*), not Wednesday's calendar date. |
| **BND-04** | **Kshaya Tithi (Skipped Tithi)** | A Tithi that begins after sunrise and ends before the next sunrise. | Engine correctly identifies the active Tithi during the exact Muhurta hour, not just sunrise. |

---

## 3. Override Precedence Matrix (The "Can X Override Y?" Battery)

This matrix verifies that cancellation rules (*Pariharas*) only neutralize minor flaws and never bypass absolute hard blockers.

| Test ID | Negative Condition Active | Positive Condition Active | Expected Result | Why? |
| --- | --- | --- | --- | --- |
| **OVR-01** | *Bhadra in Mrityu Loka* | *Abhijit Muhurta* | `REJECTED` | *Abhijit* cannot override *Bhadra* on Earth. |
| **OVR-02** | *Asta Guru* (Combust Jupiter) | *Sarvartha Siddhi Yoga* | `REJECTED` | *Siddhi Yogas* cannot override combustion for Samskaras/Griha Pravesha. |
| **OVR-03** | *Dagdha Yoga* | *Sarvartha Siddhi Yoga* | `PASSED` (+Bonus) | Classical rule: *Siddhi Yoga* neutralizes *Dagdha Yoga*. |
| **OVR-04** | *Rahu Kalam* | *Abhijit Muhurta* | `PASSED` (+Bonus) | Classical rule: *Abhijit* neutralizes daily *Rahu Kalam* temporal penalty. |
| **OVR-05** | Tuesday Borrowing (`ACT_FIN_TAKE_MORTGAGE`) | *Amrita Siddhi Yoga* | `REJECTED` | Day-specific liability rule overrides general Yogas. |

---

## 4. Personal Mode Isolation Tests (Tara & Chandra Bala)

Personal parameters (*Janma Nakshatra* & *Janma Rashi*) must only filter or score **universally valid** dates.

```
                  ┌──────────────────────────────────────────┐
                  │ Slot Fails Universal Hard Blocker?       │
                  └────────────────────┬─────────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                      [ YES ]                     [ NO ]
                         │                           │
                         ▼                           ▼
                MUST RETURN REJECTED         Evaluate Tara Bala /
                 (Ignore Birth Star)         Chandra Bala Modifiers

```

| Test ID | Scenario | Input Condition | Expected Behavior |
| --- | --- | --- | --- |
| **PRS-01** | **Naidhana (7th) Tara** | Transit Nakshatra is the 7th star (*Naidhana / Vadha*) from birth star. | `REJECTED` or heavy penalty (-30) in `PERSONAL` mode, even if slot passed `FULL` mode. |
| **PRS-02** | **Ashtama Chandra (8th Moon)** | Transit Moon is in the 8th house from user's *Janma Rashi*. | `REJECTED` in `PERSONAL` mode (Severe mental/physical affliction risk). |
| **PRS-03** | **Sadhana (6th) / Mitra (8th) Tara** | Transit Nakshatra is 6th or 8th star from birth star + Universal slot passed `SOFT`. | `PASSED` with high score bonus in `PERSONAL` mode. |

---

## Example Pytest Implementation

You can drop these assertions directly into your test suite:

```python
import pytest

def test_subset_hierarchy_invariant(engine, sample_month_slots):
    """Ensures FULL is always a strict subset of SOFT, and PERSONAL never resurrects bad dates."""
    full_results = engine.evaluate_month(sample_month_slots, mode="FULL")
    soft_results = engine.evaluate_month(sample_month_slots, mode="SOFT")
    personal_results = engine.evaluate_month(sample_month_slots, mode="PERSONAL", birth_star="ROHINI")

    full_shubh_dates = {r["date"] for r in full_results if r["status"] == "SHUBH"}
    soft_shubh_dates = {r["date"] for r in soft_results if r["status"] == "SHUBH"}
    personal_shubh_dates = {r["date"] for r in personal_results if r["status"] == "SHUBH"}

    # Assertion 1: Full mode must be equal to or fewer dates than Soft mode
    assert len(full_shubh_dates) <= len(soft_shubh_dates)
    assert full_shubh_dates.issubset(soft_shubh_dates)

    # Assertion 2: Personal mode dates MUST be a subset of Soft mode dates
    assert personal_shubh_dates.issubset(soft_shubh_dates)

def test_bhadra_abhijit_override_failure(engine, bhadra_earth_slot):
    """Abhijit Muhurta must NEVER override Bhadra on Earth."""
    # Force slot to fall in Abhijit Muhurta window
    bhadra_earth_slot["is_abhijit"] = True
    
    result = engine.evaluate_slot(bhadra_earth_slot, activity="ACT_STARTUP_INCORPORATION", mode="FULL")
    assert result["status"] == "REJECTED"
    assert "BHADRA_EARTH_ACTIVE" in result["blockers"]

```