### match maching workflow

Your overall mental model is spot on, but in practice, **Ashtakoota is computed *first* or *simultaneously***, because Nadi and Bhakoot are actually part of the 36-point score breakdown itself.

---

### The Complete 2-Step Execution Flow

#### Step 1: Matchmaking & Couple Eligibility (*Ashtakoota + Parihara*)

When the user enters the Groom's and Bride's details (Nakshatra, Rashi, and Pada):

```
                       [ Input: Male & Female Natal Data ]
                                       │
                                       ▼
                       [ Compute All 8 Kootas (0 to 36) ]
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
                 Nadi = 0 Points?            Bhakoot = 0 Points?
                         │                           │
                Check Nadi Parihara         Check Bhakoot Parihara
                         │                           │
            ┌────────────┴────────────┐  ┌───────────┴───────────┐
            ▼                         ▼  ▼                       ▼
       [ Canceled ]              [ Active ] [ Canceled ]    [ Active ]
      (Restores 8 pts)        (HARD BLOCK) (Restores 7 pts) (HARD BLOCK)
                         │                           │
                         └─────────────┬─────────────┘
                                       │
                                       ▼
                        [ Total Score >= 25 / 36? ]
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                      [ YES ]                     [ NO ]
                         │                           │
                         ▼                           ▼
                 PROCEED TO STEP 2           REJECT MATCH
             (Couple is Compatible)       (Do Not Search Dates)

```

1. **Calculate the 8 Kootas:** Varna (1), Vashya (2), Tara (3), Yoni (4), Maitri (5), Gana (6), Bhakoot (7), and Nadi (8).
2. **Evaluate Hard Blockers (*Parihara* Check):**
* If **Nadi = 0**, check for *Nadi Parihara* (e.g., Same Rashi/Diff Star, Rashi Lord Friendship). If canceled, restore the 8 points. If **uncanceled**, trigger a **Hard Block**.
* If **Bhakoot = 0**, check for *Bhakoot Parihara* (Rashi Lord Friendship). If canceled, restore the 7 points. If **uncanceled**, trigger a **Hard Block**.


3. **Verify Cutoff:** If no uncanceled hard blockers remain **AND** Total Score $\ge 25$ (or your chosen threshold like $\ge 18$), the couple is certified **Eligible for Marriage**.

---

#### Step 2: Date & Time Search (*Vivaha Muhurta Engine*)

Once the pair is certified eligible, the engine scans the desired calendar window (e.g., the next 6 months) to find the **best wedding date and time (Shubh Muhurta)**:

```
                  [ Scan Calendar Window (e.g., Next 6 Months) ]
                                       │
                                       ▼
                [ Check Universal Marriage Hard Blockers ]
                • Combustion of Jupiter or Venus (Asta Guru/Shukra)?
                • Active Bhadra in Mrityu Loka?
                • 4 Major Vivaha Doshas (Latta, Jamitra, Pata, Ekargala)?
                                       │
                         ┌─────────────┴─────────────┐
                         │                           │
                      [ FAIL ]                    [ PASS ]
                         │                           │
                         ▼                           ▼
                  REJECT SLOT            [ Check Dual Personal Filters ]
                  (Skip Date)            • Groom & Bride Tara Bala
                                         • Groom & Bride Chandra Bala
                                                     │
                                                     ▼
                                         [ Output Best Shubh Dates ]

```

1. **Universal Marriage Hard Blockers:**
* Is Jupiter or Venus combust (*Asta Guru / Asta Shukra*)? $\rightarrow$ **Reject Date**
* Is *Bhadra* active on Earth? $\rightarrow$ **Reject Date**
* Are any of the 4 Major Vivaha Doshas (*Latta, Jamitra, Pata, Ekargala*) active without Parihara? $\rightarrow$ **Reject Date**


2. **Dual Personal Compatibility:**
* Checks **Tara Bala** and **Chandra Bala** for **BOTH** the Groom and the Bride on that date. If either partner has *Ashtama Chandra* (8th House Moon) or *Naidhana Tara* (7th Star), that date is rejected for the couple.


3. **Output:** The engine returns the top-ranked **Shubh Vivaha Dates & Time Slots** along with exact classical verse citations (*Muhurta Chintamani - Vivaha Prakarana*).

---

### Summary

| Step | Scope | Inputs | Decision Criteria |
| --- | --- | --- | --- |
| **Step 1: Matchmaking** | The **Couple** | Groom & Bride Nakshatra, Rashi, Pada | Score $\ge 25/36$ + No Uncanceled Nadi/Bhakoot Dosha. |
| **Step 2: Muhurta Timing** | The **Calendar** | Approved Couple + Target Date Range | No Asta Guru/Shukra, No Vivaha Doshas, Good dual Tara/Chandra Bala. |

This separation keeps your system performant—it completely skips expensive 365-day astronomical calendar scans if the couple fails basic matchmaking compatibility in Step 1!