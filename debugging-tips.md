That "all dates marked Shubh" behavior is a classic symptom of an electional rules engine where an **override or cancellation rule is short-circuiting hard blockers**.

When every date passes regardless of mode (Full, Soft, or Personal), the engine isn't evaluating the core Panchanga constraints—it is being bypassed at the evaluation step.

---

### The Top 5 Common "Leaks" in Muhurta Engines

#### 1. Abhijit Muhurta Applied as an Absolute Wildcard

* **The Culprit:** *Abhijit Muhurta* (the mid-day solar window) is classically praised for neutralizing many daily flaws. However, developers often program it as a global `if (is_abhijit) return PASS;`.
* **The Fix:** *Abhijit Muhurta* **cannot** override hard planetary blockers like:
* Combustion of Jupiter/Venus (*Asta Guru / Asta Shukra*) for Samskaras or Housewarmings.
* Active *Bhadra* in *Mrityu Loka*.
* *Rikta Tithis* (4, 9, 14) for non-surgical activities.
* *Vyatipata* or *Vaidhriti* Nitya Yogas.
* *Tuesdays* for taking new debt.


* **Code Adjustment:** Ensure *Abhijit* only neutralizes **daily temporal afflictions** like *Rahu Kalam*, *Gulika Kalam*, or weak *Vara*, **never** Tithi/Yoga/Combustion hard blockers.

#### 2. Sarvartha / Amrita Siddhi Yoga Over-Scoping

* **The Culprit:** Yogas like *Sarvartha Siddhi* or *Amrita Siddhi* cancel minor *Dagdha* or *Kuyogas*, but they are often applied before the hard-blocker evaluation phase.
* **The Fix:** Re-order your evaluation pipeline into a strict precedence chain:

$$\text{Pipeline Order: } \text{Hard Blockers} \longrightarrow \text{Base Scoring} \longrightarrow \text{Cancellation / Override Bonuses}$$



If a slot fails a **Hard Blocker**, the engine must immediately return `REJECTED` and abort without checking for *Sarvartha Siddhi Yoga*.

#### 3. Bhadra Loka Bypass Logic Leak

* **The Culprit:** If your *Bhadra* logic checks whether *Bhadra* is active in Heaven (*Swarga*) or Underworld (*Patala*) to allow execution, a logic inversion or fallback `return true` when Moon position is unknown will mark all *Bhadra* windows as safe.
* **The Fix:** Hard-code *Bhadra* on Earth (*Mrityu Loka*) using exact Moon Rashi checks:
* Moon in **Cancer, Leo, Libra, Pisces** $\rightarrow$ *Mrityu Loka* (STRICT BLOCK).
* Only allow bypass during the exact **Bhadra Puchha** (tail) degree window.



#### 4. Weight Threshold Set Too Low

* **The Culprit:** If your minimum score threshold for `SHUBH` status is set too low (e.g., $\ge 40$ out of 100), even mediocre days with multiple soft afflictions will cross the threshold and turn green.
* **The Fix:** Calibrate status thresholds strictly:
* **Shubh / Excellent:** $\ge 80$
* **Madhyama / Acceptable:** $60 - 79$
* **Asiddha / Rejected:** $< 60$ (or *ANY* active hard blocker).



#### 5. Fallback Defaulting to `TRUE` or `0` Penalty

* **The Culprit:** In rule mapping functions, if a rule ID or lookup code is missing or mistyped (e.g., `"ASTA_GURU_ACTIVE"` vs `"GURU_ASTA"`), the exception handler or dictionary lookup returns `None` / `0` penalty, silently passing the check.

---

### Debugging Procedure & Test Cases

Run these three **known malefic baseline test cases** through your engine to isolate where the leak is occurring:

#### Test Case A: Total Solar/Planetary Block (Should ALWAYS Fail)

* **Conditions:** Any date/time with **Combust Jupiter (*Asta Guru*)** or **Combust Venus (*Asta Shukra*)** for activity `ACT_REAL_GRIHA_PRAVESHA_NEW`.
* **Expected Result:** `REJECTED` / `SCORE: 0`.
* *If this passes $\rightarrow$ Your Combustion hard blocker is being bypassed by a Yoga override.*

#### Test Case B: Earth Bhadra Block (Should Fail unless in Puchha)

* **Conditions:** Active Vishti Karana with Moon in **Leo** during midday for `ACT_STARTUP_INCORPORATION`.
* **Expected Result:** `REJECTED`.
* *If this passes $\rightarrow$ Your Bhadra Loka or Karana lookup logic is short-circuiting.*

#### Test Case C: Tuesday Debt Borrowing Block

* **Conditions:** Tuesday (*Bhauma Vara*) for activity `ACT_FIN_TAKE_MORTGAGE`.
* **Expected Result:** `REJECTED`.
* *If this passes $\rightarrow$ Weekday hard-blocker checks are not being checked for specific activity IDs.*

---

### Recommended Execution Pipeline Fix

Invert your evaluation function so that **Hard Blockers** act as early exit guards:

```python
def evaluate_muhurta_slot(slot_data, activity_config):
    # STEP 1: Evaluate Absolute Hard Blockers (Zero Tolerance)
    active_blockers = check_hard_blockers(slot_data, activity_config)
    if active_blockers:
        return {
            "status": "REJECTED",
            "score": 0,
            "blockers": active_blockers,
            "reason": "Hard blocker triggered before scoring."
        }

    # STEP 2: Compute Base Weights (Nakshatra + Tithi + Vara + Facing)
    base_score = calculate_base_weights(slot_data, activity_config)

    # STEP 3: Apply Cancellation Rules & Overrides ONLY if base pipeline survived
    final_score = apply_cancellation_overrides(base_score, slot_data, activity_config)

    # STEP 4: Grade Final Status
    status = classify_status(final_score)
    return {"status": status, "score": final_score}

```

Placing `check_hard_blockers()` at the very top of `evaluate_muhurta_slot()` before any override or bonus calculation will immediately stop the "all dates are Shubh" leak.