# browser-testing-behavior.md

> ⚠️ **Superseded in part (2026-08-13).** `what-is-personal-mode.md` is now authoritative for
> Personal-mode data generation. Concretely: the "FULL ≥ 85 / SOFT ≥ 65" thresholds cited below
> are obsolete — adopted thresholds are **FULL ≥ 80 (MADHYAMA 65-79) · SOFT ≥ 60 · Personal final
> ≥ 75 (Option A: Personal must first qualify as a Full slot)**. The three-tier architecture and
> the "0-point-score / no-resurrect" hard-blocker guarantees below remain valid.

That behavior—where **Full Mode** (strictest) yields 2–3 valid dates, **Soft Mode** (looser) yields **0** dates, and **Personal Mode** yields an unnaturally high 10–15 dates—indicates a structural bug in how your evaluation pipeline branches, handles thresholds, and applies personal filters.

In a logically sound Muhurta engine, the output distribution across modes **must** follow a strict subset inclusion hierarchy:

$$\text{Count}(\text{Full Mode}) \le \text{Count}(\text{Soft Mode})$$

When **Soft Mode produces fewer options than Full Mode**, or **Personal Mode acts as a wildcard that bypasses universal hard blockers**, your rule execution pipeline is leaking state or applying inverted logic.

---

### Key Areas to Debug

#### 1. Inverted Score Threshold or Operator Bug in Soft Mode

* **The Symptom:** Soft mode returns 0 dates while Full mode returns 2–3 dates.
* **The Cause:** Soft mode usually relaxes the score cutoff (e.g., accepting scores $\ge 60$ instead of $\ge 80$). A zero output strongly suggests a logical operator inversion in the status classification logic.
* **What to Check:**
* Check for `<` vs `>` flips:
```python
# BUGGY: Soft mode checking for scores LESS than cutoff or using reversed logic
if mode == "SOFT" and score < soft_threshold: 
    return "SHUBH"  # Inverted logic!

```


* Check if Soft Mode enables a secondary penalty or secondary check that actually *adds* disqualifying rules instead of removing them.
* Check whether the minimum score threshold for Soft Mode was accidentally set **higher** than Full Mode (e.g., `FULL_THRESHOLD = 70`, `SOFT_THRESHOLD = 85`).



#### 2. Personal Mode Short-Circuiting Universal Hard Blockers

* **The Symptom:** Personal Mode yields 10–15 dates out of a month (roughly 30–50% of all days).
* **The Cause:** Calculating personal Compatibility (*Tara Bala*, *Chandra Bala*) is meant to **narrow down** universally valid dates—not rescue bad ones. If Personal Mode returns 10–15 dates, your code is likely treating a favorable *Tara Bala* (e.g., *Sadhana* or *Mitra Tara*) as a global override that bypasses universal hard blockers (*Bhadra*, *Rikta Tithis*, *Asta Guru/Shukra*).
* **The Fix:** Personal filtering **must strictly operate as a downstream post-filter** on top of universally valid dates.

---

### The Correct Architecture: Three-Tier Filter Pipeline

To ensure the modes behave deterministically, structure the pipeline so each mode builds strictly upon the previous tier:

```
[ All Calendar Slots (e.g., 30 Days) ]
                  │
                  ▼
   [ Tier 1: Universal Hard Blockers ]  <-- (Bhadra, Asta, Rikta, etc.)
                  │
                  ├── FAIL? --> REJECTED (All Modes)
                  ▼
   [ Tier 2: Universal Scoring ]
                  │
                  ├── Score >= 85 --> FULL MODE SHUBH (e.g., 2-3 Days)
                  ├── Score >= 65 --> SOFT MODE SHUBH (e.g., 6-8 Days)
                  ▼
   [ Tier 3: Personal Filter (Tara / Chandra Bala) ]
                  │
                  └── Applied ONLY to Soft or Full Valid Slots!

```

---

### Step-by-Step Code Fixes for Your Engine

#### A. Enforce Early Exit on Universal Blockers Before Personal Evaluation

Ensure `evaluate_personal_mode()` never touches a slot that fails Universal Hard Blockers:

```python
def evaluate_slot(slot, mode="FULL", birth_star=None):
    # 1. ALWAYS check Universal Hard Blockers first
    hard_blockers = check_universal_hard_blockers(slot)
    if hard_blockers:
        return {"status": "REJECTED", "score": 0, "reason": hard_blockers}

    # 2. Calculate Universal Base Score
    base_score = calculate_universal_score(slot)

    # 3. Handle Mode-Specific Status Classification
    if mode == "FULL":
        # Strict Cutoff (e.g., >= 80)
        is_shubh = base_score >= 80
    elif mode == "SOFT":
        # Relaxed Cutoff (e.g., >= 60)
        is_shubh = base_score >= 60
    elif mode == "PERSONAL":
        # MUST start with Soft or Full qualification
        if base_score < 60:  # Fail if it wouldn't even pass Soft Mode
            return {"status": "REJECTED", "score": base_score, "reason": ["Fails base universal criteria"]}
        
        # Calculate Personal Compatibility
        tara_bala_score = calculate_tara_bala(slot.nakshatra, birth_star)
        
        # Check for Severe Personal Blockers (e.g., Janma Tara / Naidhana Tara)
        if is_bad_tara(tara_bala_score):
            return {"status": "REJECTED", "score": 0, "reason": ["Incompatible Tara Bala"]}
            
        # Combine Base Score + Personal Score
        final_score = base_score + tara_bala_score
        is_shubh = final_score >= 75

    return {"status": "SHUBH" if is_shubh else "MADHYAMA", "score": base_score}

```

#### B. Audit Your Test Assumptions

Run these three diagnostic print statements in your evaluation loop to pinpoint the anomaly:

1. `print(f"Slot: {date} | HardBlockers: {hard_blockers}")`
*(Verify hard blockers trigger identically across all 3 modes).*
2. `print(f"Slot: {date} | Mode: SOFT | BaseScore: {score} | Threshold: {soft_threshold}")`
*(Expose why Soft Mode is rejecting scores that Full Mode accepts).*
3. `print(f"Slot: {date} | Mode: PERSONAL | BypassedHardBlockers?: {hard_blockers_bypassed}")`
*(Confirm Personal Mode is not ignoring Tier 1 hard blockers).*