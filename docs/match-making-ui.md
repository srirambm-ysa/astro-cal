### match maching UI

a clean modal form with the Bride and Groom's **Nakshatra**, **Rashi (Moon Sign)**, and **Pada (Quarter)** is the ideal input baseline for the user interface!

However, because the engine operates in two distinct phases—**Matchmaking Eligibility** followed by **Wedding Date Search**—the form and response UI benefit from a two-step experience.

---

### 1. Minimal Input Form Schema

To calculate the 8 Kootas (*Ashtakoota*), test for *Pariharas* (cancellations), and evaluate personal transit filters (*Tara & Chandra Bala*) across wedding dates, the modal form needs **5 core inputs**:

```
┌──────────────────────────────────────────────────────────────┐
│                  💍 Vivaha Muhurta Finder                    │
├──────────────────────────────────────────────────────────────┤
│ Groom Details                                                │
│ ┌──────────────────────┐ ┌──────────────────┐ ┌────────────┐ │
│ │ Nakshatra            │ │ Rashi (Moon Sign)│ │ Pada (1-4) │ │
│ └──────────────────────┘ └──────────────────┘ └────────────┘ │
│                                                              │
│ Bride Details                                                │
│ ┌──────────────────────┐ ┌──────────────────┐ ┌────────────┐ │
│ │ Nakshatra            │ │ Rashi (Moon Sign)│ │ Pada (1-4) │ │
│ └──────────────────────┘ └──────────────────┘ └────────────┘ │
│                                                              │
│ Target Wedding Window                                        │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Date Range (e.g., Oct 2026 – Mar 2027)                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [ Calculate Compatibility & Find Shubh Dates ]               │
└──────────────────────────────────────────────────────────────┘

```

> **UI Tip on Pada:** If a user doesn't know their *Pada* (quarter 1 to 4), provide a simple *"I don't know my Pada"* toggle that defaults to quarter 1. (Pada is primarily used as an edge-case tie-breaker for *Nadi Pada Bheda Parihara*).

---

### 2. Recommended UX / Result View (Two-Stage Feedback)

Instead of dumping raw numbers, the result view should display a **Two-Tier Card Layout**:

#### Tier 1: Matchmaking Summary Card (*The Gatekeeper*)

* **Status Badge:** `ELIGIBLE (28 / 36 Gunas)` or `INCOMPATIBLE`.
* **Visual Meter:** A progress bar showing the Guna score out of 36.
* **Dosha & Parihara Pills:**
* `Nadi: 8/8 (Parihara: Same Rashi, Different Star)` $\rightarrow$ *Shows full transparency on why a potential blocker was cleared.*



#### Tier 2: Recommended Wedding Dates Carousel / Table (*The Deliverable*)

If Tier 1 passes, automatically display the top-ranked wedding windows:

* **Date & Time Window:** e.g., *Nov 18, 2026 | 09:15 AM – 11:30 AM (Vrishabha Lagna)*
* **Quality Badge:** `SHUBH (Score: 88/100)`
* **Key Planetary Strengths:** *Uttarayana Sun • Rohini Nakshatra • Zero Combust Blockers*
* **Classical Provenance Dropdown:** An expandable accordian showing the exact Sanskrit verse from *Muhurta Chintamani (Chapter 3)*.

---

### 3. What if the Match Fails (< 18 Points or Active Nadi Dosha)?

If the couple fails Step 1, the UI should **fail fast** and politely stop before searching for dates:

> **Matchmaking Alert:**
> *"This pair scores 14/36 Gunas with an active, uncanceled Nadi Dosha. In accordance with classical guidelines (Muhurta Chintamani Ch. 3), wedding dates cannot be generated for this combination without prior remedial consultation."*

This approach keeps the interface simple for the user while maintaining complete astrological integrity behind the scenes.