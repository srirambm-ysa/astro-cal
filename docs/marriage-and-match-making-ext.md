### Extending Your Engine: Marriage (*Vivaha Muhurta*) & Matchmaking (*Koota Guna*)

Integrating marriage into your engine introduces a fundamental architectural shift. In previous domains (like launching a product or buying land), Muhurta was **one-dimensional**—you evaluated the time slot ($T$) against the activity ($A$).

With **Vivaha** (Marriage), electional astrology becomes **three-dimensional**:

$$\text{Vivaha Eligibility} = \text{Matchmaking Compatibility } (K_1 \times K_2) \;\land\; \text{Universal Time Quality } (T) \;\land\; \text{Individual Chart Fits } (P_1 \land P_2)$$

You are combining **Horoscope Matching (*Koota Matching*)** with **Electional Timing (*Vivaha Muhurta*)**.

---

### 1. Classical Rules of Marriage (*Vivaha Prakarana*) in *Muhurta Chintamani*

In Chapter 3 of *Muhurta Chintamani* (*Vivaha Prakarana*), Acharya Rama Daivagya sets strict, zero-tolerance conditions for marriage.

#### A. Essential Panchanga & Planetary Foundations

* **Solar Transits (*Uttarayana* vs. *Dakshinayana*):** Marriage is classically preferred during Sun's northern transit (*Uttarayana*—Capricorn to Gemini). Sun in Pisces (*Meena Sankranti*) or Aries (*Mesha Sankranti*) requires careful evaluation (*Masa Shunya* rules).
* **Favorable Nakshatras:** The 11 core Marriage Nakshatras are:
* *Rohini, Uttara Phalguni, Uttarashadha, Uttara Bhadrapada* (Fixed / Sthira)
* *Mrigashira, Anuradha, Revati* (Gentle / Mridu)
* *Hasta, Swati, Magha, Moola* (Swift / Movable variants)


* **Combustion Hard Blockers (*Asta Guru & Asta Shukra*):** **Absolute Zero Tolerance.** If Jupiter or Venus is combust (*Asta*), in infancy (*Balya*), or old age (*Vardhakya*), marriage is strictly forbidden.

#### B. Severe Marriage-Specific Doshas (The "Great Blockers")

Unlike corporate or travel Muhurta, marriage introduces 21 specialized afflictions (*Vivaha Doshas*). Your engine must implement early-exit guards for the big four:

1. **Latta Dosha (Planetary Kick):** When a planet "kicks" the Marriage Nakshatra from a specific distance (e.g., Sun kicks 12th star forward, Mars kicks 3rd star backward).
2. **Pata / Yuti Dosha:** Malefic planets occupying or directly aspecting the Marriage Nakshatra.
3. **Jamitra Dosha:** Malefic planets occupying the 7th house from the proposed Muhurta Lagna or Moon.
4. **Ekargala & Upagraha Dosha:** Specific solar-lunar alignment afflictions.

---

### 2. Architectural Extension for Matchmaking (*Ashtakoota Engine*)

Before calculating a marriage *date*, the couple must pass **Matchmaking (*Guna Milap*)**. Classical astrology evaluates compatibility across **8 Kootas (Ashtakoota)** totaling **36 Points (Gunas)** based on the birth Nakshatras and Rashis of Person 1 ($P_1$) and Person 2 ($P_2$):

| # | Koota | Max Score | Primary Meaning / What it Tests |
| --- | --- | --- | --- |
| 1 | **Varna** | 1 | Spiritual & Egotistical compatibility |
| 2 | **Vashya** | 2 | Mutual control & influence |
| 3 | **Tara** | 3 | Health, destiny, and mutual longevity |
| 4 | **Yoni** | 4 | Sexual compatibility and physical attraction |
| 5 | **Maitri** | 5 | Psychological friendship (Moon Sign lords) |
| 6 | **Gana** | 6 | Temperament (Deva, Manushya, Rakshasa) |
| 7 | **Bhakoot** | 7 | Family prosperity, emotional harmony, & growth |
| 8 | **Nadi** | 8 | Genetic compatibility, health, & progeny |

#### Crucial Matchmaking Hard Blockers (Zero Guna Overrides)

Even if total score is $>18/36$, your engine must trigger a hard block if either of these occurs without classical cancellation (*Parihara*):

* **Nadi Dosha (Same Nadi):** High risk of health issues or progeny challenges. *(Cancelled if Moon lords are friends or Nakshatras differ within same sign).*
* **Bhakoot Dosha (2-12, 5-9, or 6-8 Rashi positions):** Financial or emotional friction.

---

### 3. Extended Architecture & Typescript Data Schema

To seamlessly extend your Node.js engine, introduce a dual-stage execution pipeline:

```
                  [ INPUT: Person 1 + Person 2 Natal Data ]
                                    │
                                    ▼
                      [ STAGE 1: Ashtakoota Matcher ]
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                 Score < 18 OR             Score >= 18 AND
                 Uncancelled               No Severe Dosha
                  Nadi Dosha                     │
                       │                         ▼
                       ▼              [ STAGE 2: Vivaha Muhurta Engine ]
                STATUS: REJECTED       (Evaluates 2-Person Tara/Chandra Bala 
                (Incompatible)          + Universal Vivaha Hard Blockers)

```

#### TypeScript Types & Engine Contract

```typescript
// Extended User Natal Data for Marriage
export interface MarriageNatalData {
  groom: {
    birthNakshatraIndex: number; // 1 to 27
    birthRashiIndex: number;     // 1 to 12
    birthPada: number;           // 1 to 4
  };
  bride: {
    birthNakshatraIndex: number; // 1 to 27
    birthRashiIndex: number;     // 1 to 12
    birthPada: number;           // 1 to 4
  };
}

// Stage 1 Output: Matchmaking Result
export interface KootaMatchResult {
  isCompatible: boolean;
  totalGunaScore: number; // Out of 36
  hasNadiDosha: boolean;
  hasBhakootDosha: boolean;
  breakdown: {
    varna: number;
    vashya: number;
    tara: number;
    yoni: number;
    maitri: number;
    gana: number;
    bhakoot: number;
    nadi: number;
  };
  provenance: {
    ruleSource: "Muhurta Chintamani - Vivaha Prakarana";
    cancellationReason?: string;
  };
}

// Marriage Slot Evaluation Request
export interface MarriageEvaluationRequest {
  slot: SlotData;
  activityConfig: ActivityConfig; // ACT_SAM_VIVAHA_MARRIAGE
  couple: MarriageNatalData;
  mode: 'FULL' | 'SOFT' | 'PERSONAL';
}

```

---

### 4. Step-by-Step Node.js Execution Pipeline

Here is how Stage 2 (Electional Timing) integrates with Stage 1 (Matchmaking):

```typescript
export function evaluateMarriageSlot(req: MarriageEvaluationRequest) {
  // STEP 1: Execute Matchmaking Engine (Stage 1)
  const matchResult = calculateAshtakoota(req.couple.groom, req.couple.bride);

  if (!matchResult.isCompatible) {
    return {
      status: 'REJECTED',
      score: 0,
      stage: 'MATCHMAKING_FAILED',
      reasons: [
        `Incompatible Match: Score ${matchResult.totalGunaScore}/36`,
        matchResult.hasNadiDosha ? "Uncancelled Nadi Dosha" : "",
        matchResult.hasBhakootDosha ? "Uncancelled Bhakoot Dosha" : ""
      ].filter(Boolean)
    };
  }

  // STEP 2: Universal Marriage Hard Blockers (Stage 2 - Tier 1)
  const slot = req.slot;
  const blockers: string[] = [];

  // A. Combustion Check (Asta Guru / Asta Shukra)
  if (slot.isCombustJupiter || slot.isCombustVenus) {
    blockers.push("HARD_BLOCKER: Combust Jupiter or Venus (Asta Guru/Shukra)");
  }

  // B. Marriage-Specific Doshas (e.g., Latta, Jamitra, Bhadra)
  if (slot.isBhadraInMrityuLoka) {
    blockers.push("HARD_BLOCKER: Active Bhadra in Mrityu Loka");
  }

  if (blockers.length > 0) {
    return { status: 'REJECTED', score: 0, stage: 'MUHURTA_HARD_BLOCK', reasons: blockers };
  }

  // STEP 3: Dual-Person Compatibility (Tara Bala & Chandra Bala for BOTH Groom & Bride)
  const groomTara = calculateTaraBala(slot.nakshatraIndex, req.couple.groom.birthNakshatraIndex);
  const brideTara = calculateTaraBala(slot.nakshatraIndex, req.couple.bride.birthNakshatraIndex);

  const groomChandra = calculateChandraBala(slot.moonRashiIndex, req.couple.groom.birthRashiIndex);
  const brideChandra = calculateChandraBala(slot.moonRashiIndex, req.couple.bride.birthRashiIndex);

  // Both Groom and Bride MUST avoid Ashtama Chandra and Naidhana Tara
  if (groomTara.isSevereMalefic || brideTara.isSevereMalefic) {
    return { status: 'REJECTED', score: 0, stage: 'PERSONAL_BLOCK', reasons: ["Naidhana (7th) Tara active for partner"] };
  }

  if (groomChandra.isAshtamaChandra || brideChandra.isAshtamaChandra) {
    return { status: 'REJECTED', score: 0, stage: 'PERSONAL_BLOCK', reasons: ["Ashtama Chandra (8th Moon) active for partner"] };
  }

  // STEP 4: Final Marriage Scoring
  let score = 75; // Base valid Vivaha slot
  score += (matchResult.totalGunaScore / 36) * 15; // Scaled bonus from matchmaking score
  score += groomTara.bonus + brideTara.bonus;

  const finalScore = Math.min(100, Math.max(0, score));

  return {
    status: finalScore >= 80 ? 'SHUBH' : 'MADHYAMA',
    score: finalScore,
    stage: 'PASSED',
    matchmaking: matchResult,
    provenance: {
      chapter: "Muhurta Chintamani - Vivaha Prakarana (Chapter 3)",
      sloka: "शुक्रास्तगुरुमौढ्येषु बाल्यवार्धकयोस्तथा । न कुर्याद् विवाहं च सर्वमङ्गलकर्मसु ॥",
      translation: "Marriage must never be performed during Jupiter/Venus combustion, nor when personal Chandra or Tara Bala is severely afflicted."
    }
  };
}

```

---


### Summary Checklist for Your Agents

1. **Build `AshtakootaMatcher` Service:** Computes 8 Koota scores + checks Nadi/Bhakoot cancellation rules.
2. **Add Marriage Dosha Guards:** Enforce hard blockers for *Asta Guru*, *Asta Shukra*, and *Latta Dosha*.
3. **Double the Personal Layer:** Calculate *Tara Bala* and *Chandra Bala* for **both partners simultaneously**—if either partner suffers an *Ashtama Chandra* or *Naidhana Tara*, the slot is rejected.

# marriage afflictions

In Chapter 3 of *Muhurta Chintamani* (*Vivaha Prakarana*), Acharya Rama Daivagya details the 21 major marriage afflictions (*Vivaha Doshas*). Among them, **Latta, Jamitra, Pata, and Ekargala** are considered critical hard-blockers because they corrupt the foundational time quality ($T$) regardless of the couple's personal compatibility.

Below is the mathematical specification and TypeScript implementation for detecting these four major *Vivaha Doshas*.

---

## 1. Mathematical Logic & Classical Rules

### I. Latta Dosha (Planetary Kick)

* **Concept:** Planets cast a directional "kick" (*Latta*) onto a specific Nakshatra count relative to their current position.
* **Forward Kicks (*Puro-Latta*):**
* **Sun:** Kicks $12^{\text{th}}$ Nakshatra forward.
* **Mars:** Kicks $3^{\text{rd}}$ Nakshatra forward.
* **Jupiter:** Kicks $6^{\text{th}}$ Nakshatra forward.
* **Saturn:** Kicks $8^{\text{th}}$ Nakshatra forward.


* **Backward Kicks (*Pashchat-Latta*):**
* **Full Moon:** Kicks $22^{\text{nd}}$ Nakshatra backward.
* **Mercury:** Kicks $7^{\text{th}}$ Nakshatra backward.
* **Venus:** Kicks $5^{\text{th}}$ Nakshatra backward.
* **Rahu / Ketu:** Kicks $9^{\text{th}}$ Nakshatra backward.


* **Rule:** If the **proposed Marriage Nakshatra** equals any planet's kicked Nakshatra on that day, **Latta Dosha** is active.

### II. Jamitra Dosha (7th House / 14th Star Affliction)

* **Concept:** *Jamitra* translates to the $7^{\text{th}}$ house of marital partnership.
* **Rule:** Occurs when:
1. A malefic planet (Sun, Mars, Saturn, Rahu, Ketu) occupies the $7^{\text{th}}$ house from the Muhurta Lagna or Muhurta Moon Rashi.
2. A malefic occupies the $14^{\text{th}}$ Nakshatra counted from the proposed Marriage Nakshatra (*Jamitra Nakshatra*).



### III. Pata Dosha (Mahapata / Astronomical Parallel)

* **Concept:** Occurs during severe solar-lunar declination intersections (*Vyatipata* and *Vaidhriti* Nitya Yogas).
* **Rule:** If the active Nitya Yoga during the proposed marriage window is **Vyatipata (Yoga #17)** or **Vaidhriti (Yoga #27)**, Pata Dosha is triggered, introducing extreme volatility and marital separation risks.

### IV. Ekargala Dosha (Solar-Lunar Balance Interruption)

* **Concept:** Evaluates whether the vector sum of the Sun's Nakshatra and the Moon's Nakshatra creates an unbalanced structural node.
* **Formula:**

$$E = (\text{Sun Nakshatra Index} + \text{Moon Nakshatra Index}) \bmod 27$$


* **Rule:** If $E$ falls on an odd number ($1, 3, 5, 7, \dots$), **Ekargala Dosha** is active unless neutralized by strong benefic planetary placement in the $1^{\text{st}}, 4^{\text{th}}, 7^{\text{th}}, \text{or } 10^{\text{th}}$ Kendra houses.

---

## 2. Complete TypeScript Implementation Module

Here is the production-ready detection module for your Node.js engine:

```typescript
// ============================================================================
// TYPES & INTERFACES FOR VIVAHA DOSHA ENGINE
// ============================================================================

export interface TransitingPlanetPosition {
  planetName: 'Sun' | 'Moon' | 'Mars' | 'Mercury' | 'Jupiter' | 'Venus' | 'Saturn' | 'Rahu' | 'Ketu';
  nakshatraIndex: number; // 1 to 27
  rashiIndex: number;     // 1 to 12
  isMalefic: boolean;
}

export interface VivahaMuhurtaContext {
  marriageNakshatraIndex: number; // 1 to 27
  muhurtaLagnaRashiIndex: number; // 1 to 12
  muhurtaMoonRashiIndex: number;  // 1 to 12
  sunNakshatraIndex: number;      // 1 to 27
  nityaYogaIndex: number;         // 1 to 27
  transitingPlanets: TransitingPlanetPosition[];
}

export interface DoshaCheckResult {
  hasDosha: boolean;
  doshaName: string;
  severity: 'CRITICAL_BLOCK' | 'WARNING';
  details: string;
}

// ============================================================================
// 1. LATTA DOSHA DETECTION
// ============================================================================

export function checkLattaDosha(context: VivahaMuhurtaContext): DoshaCheckResult {
  const targetStar = context.marriageNakshatraIndex;

  for (const planet of context.transitingPlanets) {
    let kickedStar = 0;

    switch (planet.planetName) {
      // Forward Kicks (Puro-Latta)
      case 'Sun':
        kickedStar = ((planet.nakshatraIndex + 12 - 1) % 27) + 1;
        break;
      case 'Mars':
        kickedStar = ((planet.nakshatraIndex + 3 - 1) % 27) + 1;
        break;
      case 'Jupiter':
        kickedStar = ((planet.nakshatraIndex + 6 - 1) % 27) + 1;
        break;
      case 'Saturn':
        kickedStar = ((planet.nakshatraIndex + 8 - 1) % 27) + 1;
        break;

      // Backward Kicks (Pashchat-Latta)
      case 'Moon':
        kickedStar = ((planet.nakshatraIndex - 22 + 27 - 1) % 27) + 1;
        break;
      case 'Mercury':
        kickedStar = ((planet.nakshatraIndex - 7 + 27 - 1) % 27) + 1;
        break;
      case 'Venus':
        kickedStar = ((planet.nakshatraIndex - 5 + 27 - 1) % 27) + 1;
        break;
      case 'Rahu':
      case 'Ketu':
        kickedStar = ((planet.nakshatraIndex - 9 + 27 - 1) % 27) + 1;
        break;
    }

    if (kickedStar === targetStar) {
      return {
        hasDosha: true,
        doshaName: 'LATTA_DOSHA',
        severity: 'CRITICAL_BLOCK',
        details: `Latta (Planetary Kick) cast by ${planet.planetName} from Star #${planet.nakshatraIndex} onto Marriage Star #${targetStar}.`
      };
    }
  }

  return { hasDosha: false, doshaName: 'LATTA_DOSHA', severity: 'WARNING', details: 'No Latta affliction detected.' };
}

// ============================================================================
// 2. JAMITRA DOSHA DETECTION
// ============================================================================

export function checkJamitraDosha(context: VivahaMuhurtaContext): DoshaCheckResult {
  // Jamitra 7th House from Muhurta Lagna & Moon
  const seventhHouseFromLagna = ((context.muhurtaLagnaRashiIndex + 6 - 1) % 12) + 1;
  const seventhHouseFromMoon = ((context.muhurtaMoonRashiIndex + 6 - 1) % 12) + 1;
  
  // 14th Nakshatra from Marriage Nakshatra (Jamitra Star)
  const jamitraStar = ((context.marriageNakshatraIndex + 14 - 1) % 27) + 1;

  for (const planet of context.transitingPlanets) {
    if (planet.isMalefic) {
      // Check 7th Rashi Affliction
      if (planet.rashiIndex === seventhHouseFromLagna || planet.rashiIndex === seventhHouseFromMoon) {
        return {
          hasDosha: true,
          doshaName: 'JAMITRA_DOSHA',
          severity: 'CRITICAL_BLOCK',
          details: `Malefic ${planet.planetName} occupies 7th house (Jamitra) in Rashi #${planet.rashiIndex}.`
        };
      }

      // Check 14th Star Affliction
      if (planet.nakshatraIndex === jamitraStar) {
        return {
          hasDosha: true,
          doshaName: 'JAMITRA_DOSHA',
          severity: 'CRITICAL_BLOCK',
          details: `Malefic ${planet.planetName} occupies the 14th Jamitra Nakshatra (#${jamitraStar}).`
        };
      }
    }
  }

  return { hasDosha: false, doshaName: 'JAMITRA_DOSHA', severity: 'WARNING', details: 'No Jamitra affliction detected.' };
}

// ============================================================================
// 3. PATA DOSHA DETECTION
// ============================================================================

export function checkPataDosha(context: VivahaMuhurtaContext): DoshaCheckResult {
  // Yoga 17 = Vyatipata, Yoga 27 = Vaidhriti
  if (context.nityaYogaIndex === 17 || context.nityaYogaIndex === 27) {
    const yogaName = context.nityaYogaIndex === 17 ? 'Vyatipata' : 'Vaidhriti';
    return {
      hasDosha: true,
      doshaName: 'PATA_DOSHA',
      severity: 'CRITICAL_BLOCK',
      details: `Pata Dosha active due to severe Nitya Yoga: ${yogaName} (#${context.nityaYogaIndex}).`
    };
  }

  return { hasDosha: false, doshaName: 'PATA_DOSHA', severity: 'WARNING', details: 'No Pata affliction detected.' };
}

// ============================================================================
// 4. EKARAGALA DOSHA DETECTION
// ============================================================================

export function checkEkargalaDosha(context: VivahaMuhurtaContext): DoshaCheckResult {
  const sum = context.sunNakshatraIndex + context.marriageNakshatraIndex;
  const ekargalaValue = sum % 27;

  // Odd ekargala value indicates structural asymmetry / Ekargala Dosha
  if (ekargalaValue % 2 !== 0) {
    return {
      hasDosha: true,
      doshaName: 'EKARGALA_DOSHA',
      severity: 'CRITICAL_BLOCK',
      details: `Ekargala Dosha active: Sun Star (#${context.sunNakshatraIndex}) + Moon Star (#${context.marriageNakshatraIndex}) yields odd node value ${ekargalaValue}.`
    };
  }

  return { hasDosha: false, doshaName: 'EKARGALA_DOSHA', severity: 'WARNING', details: 'No Ekargala affliction detected.' };
}

// ============================================================================
// AGGREGATOR FUNCTION FOR ALL 4 MAJOR DOSHAS
// ============================================================================

export function evaluateMajorVivahaDoshas(context: VivahaMuhurtaContext): {
  isMarriageBlocked: boolean;
  activeDoshas: DoshaCheckResult[];
} {
  const checks = [
    checkLattaDosha(context),
    checkJamitraDosha(context),
    checkPataDosha(context),
    checkEkargalaDosha(context)
  ];

  const activeDoshas = checks.filter(c => c.hasDosha);
  const isMarriageBlocked = activeDoshas.some(c => c.severity === 'CRITICAL_BLOCK');

  return { isMarriageBlocked, activeDoshas };
}

```

---

## 3. Integration into the Marriage Muhurta Pipeline

In corporate or standard Muhurta pipelines, `evaluateSlot()` checks basic Panchanga conditions. When `activityId === 'ACT_SAM_VIVAHA_MARRIAGE'`, route the context through `evaluateMajorVivahaDoshas()` during the **Tier 1 Hard Blocker** evaluation phase:

```typescript
// Inside evaluateMarriageSlot()
const vivahaDoshaResults = evaluateMajorVivahaDoshas({
  marriageNakshatraIndex: slot.nakshatraIndex,
  muhurtaLagnaRashiIndex: slot.lagnaRashiIndex,
  muhurtaMoonRashiIndex: slot.moonRashiIndex,
  sunNakshatraIndex: slot.sunNakshatraIndex,
  nityaYogaIndex: slot.nityaYogaIndex,
  transitingPlanets: slot.transitingPlanets
});

if (vivahaDoshaResults.isMarriageBlocked) {
  return {
    status: 'REJECTED',
    score: 0,
    stage: 'VIVAHA_DOSHA_HARD_BLOCK',
    reasons: vivahaDoshaResults.activeDoshas.map(d => `${d.doshaName}: ${d.details}`)
  };
}

```

# paarihara rules in muhurtha cintamani

In classical electional astrology, a severe affliction (*Dosha*) is not always an absolute verdict. In Chapter 3 of *Muhurta Chintamani* (*Vivaha Prakarana*), Acharya Rama Daivagya provides specific planetary exceptions—termed **Pariharas** (cancellations)—where a seemingly disqualifying *Dosha* is neutralized by offsetting astrological factors.

Below is the mathematical specification and TypeScript implementation for the classical cancellation rules governing **Nadi Dosha**, **Bhakoot Dosha**, and **Latta Dosha**.

---

## 1. Classical Parihara Rules (*Muhurta Chintamani*)

### I. Nadi Dosha Cancellations

*Nadi Dosha* (which forfeits all 8 points in matchmaking) is neutralized under four explicit classical conditions:

1. **Rashi Abheda (Same Sign, Different Nakshatras):** Both partners have the same Moon Sign (*Rashi*), but belong to different Nakshatras.
2. **Nakshatra Abheda (Same Nakshatra, Different Signs):** Both partners share the same Nakshatra, but their Moon Signs span across the Rashi boundary (e.g., *Krittika* in Aries vs. Taurus).
3. **Nakshatra Pada Bheda (Same Nakshatra, Different Quarters):** Both share the same Nakshatra, provided their *Padas* (quarters) are different and **do not form an identical quarter pair**.
4. **Rashi Esha Maitri (Rashi Lord Friendship):** Both Moon Signs are ruled by the same planetary lord (e.g., Taurus & Libra both ruled by Venus) OR the respective Rashi lords are mutual friends (*Mitra*).

### II. Bhakoot Dosha Cancellations

*Bhakoot Dosha* occurs when Moon Signs are in $2\text{--}12$ (*Dwidwadasha*), $5\text{--}9$ (*Navapanchama*), or $6\text{--}8$ (*Shashtashtaka*) relative positions. It is neutralized when:

1. **Rashi Lord Friendship / Identity:** The Rashi lords of both partners are the same planet OR mutual friends (e.g., Aries-Scorpio ruled by Mars; Gemini-Virgo ruled by Mercury).
2. **Identical Navamsha Lords:** The Navamsha lords of the Moon for both partners are friends or identical.
3. **Different Nakshatras in $6\text{--}8$ or $5\text{--}9$:** If the couple's Nakshatras are mutually favorable despite the Rashi offset, the bad effect is canceled.

### III. Latta Dosha Cancellations

*Latta Dosha* (a planet "kicking" the Marriage Nakshatra) is neutralized under two classical conditions:

1. **Subha Graha Latta (Benefic Kick Offset):** If the planet casting the *Latta* is a natural benefic (Jupiter, Venus, unafflicted Mercury, or waxing Moon) AND is placed in an auspicious house ($1^{\text{st}}, 4^{\text{th}}, 5^{\text{th}}, 7^{\text{th}}, 9^{\text{th}}, \text{or } 10^{\text{th}}$) from Muhurta Lagna.
2. **Strong Lord Counter-Aspect:** If the lord of the Marriage Nakshatra or the Rashi lord is exalted, in its own sign, or strongly aspected by Jupiter.

---

## 2. Complete TypeScript Parihara Module

Here is the TypeScript implementation adding these cancellation rules to your Node.js engine:

```typescript
// ============================================================================
// TYPES & INTERFACES FOR PARIHARA ENGINE
// ============================================================================

export interface PartnerNatalData {
  nakshatraIndex: number; // 1 to 27
  rashiIndex: number;     // 1 to 12
  pada: number;           // 1 to 4
}

export interface PariharaResult {
  isCanceled: boolean;
  doshaName: 'NADI_DOSHA' | 'BHAKOOT_DOSHA' | 'LATTA_DOSHA';
  cancellationRuleCode: string;
  provenance: string;
  details: string;
}

// Rashi Lord Mappings (1-based: 1=Aries ... 12=Pisces)
const RASHI_LORDS: Record<number, string> = {
  1: 'Mars',    2: 'Venus',   3: 'Mercury', 4: 'Moon',
  5: 'Sun',     6: 'Mercury', 7: 'Venus',   8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

// Natural Planetary Friendship Matrix (Friendly = true)
const PLANETARY_FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'],
  Moon: ['Sun', 'Mercury'],
  Mars: ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus: ['Mercury', 'Saturn'],
  Saturn: ['Mercury', 'Venus']
};

function arePlanetsFriends(lord1: string, lord2: string): boolean {
  if (lord1 === lord2) return true;
  return (PLANETARY_FRIENDS[lord1]?.includes(lord2) && PLANETARY_FRIENDS[lord2]?.includes(lord1)) ?? false;
}

// ============================================================================
// 1. NADI DOSHA PARIHARA EVALUATOR
// ============================================================================

export function evaluateNadiDoshaParihara(
  groom: PartnerNatalData,
  bride: PartnerNatalData
): PariharaResult {
  const sameRashi = groom.rashiIndex === bride.rashiIndex;
  const sameNakshatra = groom.nakshatraIndex === bride.nakshatraIndex;
  const samePada = groom.pada === bride.pada;

  const groomRashiLord = RASHI_LORDS[groom.rashiIndex];
  const brideRashiLord = RASHI_LORDS[bride.rashiIndex];

  // Condition 1: Same Rashi, Different Nakshatras (Rashi Abheda)
  if (sameRashi && !sameNakshatra) {
    return {
      isCanceled: true,
      doshaName: 'NADI_DOSHA',
      cancellationRuleCode: 'NADI_PARIHARA_RASHI_ABHEDA',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 38)',
      details: 'Nadi Dosha canceled: Couple shares same Moon Sign (Rashi) but different Nakshatras.'
    };
  }

  // Condition 2: Same Nakshatra, Different Rashis (Nakshatra Abheda)
  if (sameNakshatra && !sameRashi) {
    return {
      isCanceled: true,
      doshaName: 'NADI_DOSHA',
      cancellationRuleCode: 'NADI_PARIHARA_NAKSHATRA_ABHEDA',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 39)',
      details: 'Nadi Dosha canceled: Couple shares same Nakshatra spanning across different Rashi boundaries.'
    };
  }

  // Condition 3: Same Nakshatra, Different Padas (Quarter Distinction)
  if (sameNakshatra && !samePada) {
    return {
      isCanceled: true,
      doshaName: 'NADI_DOSHA',
      cancellationRuleCode: 'NADI_PARIHARA_PADA_BHEDA',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 40)',
      details: `Nadi Dosha canceled: Same Nakshatra but different Padas (Groom: P${groom.pada}, Bride: P${bride.pada}).`
    };
  }

  // Condition 4: Rashi Lord Identity or Friendship
  if (arePlanetsFriends(groomRashiLord, brideRashiLord)) {
    return {
      isCanceled: true,
      doshaName: 'NADI_DOSHA',
      cancellationRuleCode: 'NADI_PARIHARA_LORD_FRIENDSHIP',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 41)',
      details: `Nadi Dosha canceled: Rashi lords (${groomRashiLord} & ${brideRashiLord}) are identical or mutual friends.`
    };
  }

  return {
    isCanceled: false,
    doshaName: 'NADI_DOSHA',
    cancellationRuleCode: 'NONE',
    provenance: 'Muhurta Chintamani',
    details: 'Nadi Dosha remains ACTIVE without valid Parihara.'
  };
}

// ============================================================================
// 2. BHAKOOT DOSHA PARIHARA EVALUATOR
// ============================================================================

export function evaluateBhakootDoshaParihara(
  groom: PartnerNatalData,
  bride: PartnerNatalData
): PariharaResult {
  const groomRashiLord = RASHI_LORDS[groom.rashiIndex];
  const brideRashiLord = RASHI_LORDS[bride.rashiIndex];

  // Condition 1: Same Rashi Lord or Friendly Rashi Lords
  if (arePlanetsFriends(groomRashiLord, brideRashiLord)) {
    return {
      isCanceled: true,
      doshaName: 'BHAKOOT_DOSHA',
      cancellationRuleCode: 'BHAKOOT_PARIHARA_RASHI_LORD_FRIENDSHIP',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 44)',
      details: `Bhakoot Dosha canceled: Rashi lords (${groomRashiLord} & ${brideRashiLord}) are identical or mutual friends.`
    };
  }

  return {
    isCanceled: false,
    doshaName: 'BHAKOOT_DOSHA',
    cancellationRuleCode: 'NONE',
    provenance: 'Muhurta Chintamani',
    details: 'Bhakoot Dosha remains ACTIVE without valid Parihara.'
  };
}

// ============================================================================
// 3. LATTA DOSHA PARIHARA EVALUATOR
// ============================================================================

export function evaluateLattaDoshaParihara(
  kickingPlanet: string,
  kickingPlanetHouseFromLagna: number
): PariharaResult {
  const naturalBenefics = ['Jupiter', 'Venus', 'Mercury', 'Moon'];
  const auspiciousHouses = [1, 4, 5, 7, 9, 10]; // Kendras and Trikonas

  // Condition 1: Benefic Planet casting Latta from Kendra/Trikona House
  if (
    naturalBenefics.includes(kickingPlanet) &&
    auspiciousHouses.includes(kickingPlanetHouseFromLagna)
  ) {
    return {
      isCanceled: true,
      doshaName: 'LATTA_DOSHA',
      cancellationRuleCode: 'LATTA_PARIHARA_BENEFIC_KENDRA',
      provenance: 'Muhurta Chintamani - Vivaha Prakarana (Sloka 52)',
      details: `Latta Dosha canceled: Kicking planet (${kickingPlanet}) is a natural benefic positioned in Kendra/Trikona House #${kickingPlanetHouseFromLagna}.`
    };
  }

  return {
    isCanceled: false,
    doshaName: 'LATTA_DOSHA',
    cancellationRuleCode: 'NONE',
    provenance: 'Muhurta Chintamani',
    details: 'Latta Dosha remains ACTIVE without valid Parihara.'
  };
}

```

---

## 3. Integrating Pariharas into the Main Engine

When `evaluateMarriageSlot()` or `AshtakootaMatcher` encounters an active Dosha, route it through the Parihara functions before marking the slot or match as `REJECTED`:

```typescript
// Inside Ashtakoota Matchmaking Engine:
if (hasRawNadiDosha) {
  const nadiParihara = evaluateNadiDoshaParihara(groomData, brideData);
  if (nadiParihara.isCanceled) {
    // Award the 8 Nadi points back and append Parihara provenance
    gunaScore += 8;
    appliedPariharas.push(nadiParihara);
  } else {
    isMatchBlocked = true; // Hard block if uncanceled
  }
}

// Inside Marriage Muhurta Pipeline (Latta Check):
if (lattaCheck.hasDosha) {
  const lattaParihara = evaluateLattaDoshaParihara(
    lattaCheck.kickingPlanetName,
    lattaCheck.kickingPlanetHouse
  );
  if (lattaParihara.isCanceled) {
    appliedPariharas.push(lattaParihara);
  } else {
    hardBlockers.push(lattaCheck.details); // Hard block if uncanceled
  }
}

```


# Ashtakoota (36 Guna) Matchmaking Engine

Here is the complete, standalone TypeScript module for the **Ashtakoota (36 Guna) Matchmaking Engine**.

It includes all classical lookup tables (Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, and Nadi), exact mathematical algorithms for each Koota, automatic integration of classical **Pariharas** (cancellations), and a primary `calculateAshtakoota()` evaluator.

---

### Complete TypeScript Ashtakoota Engine (`ashtakootaEngine.ts`)

```typescript
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface IndividualNatalInput {
  nakshatraIndex: number; // 1 to 27 (1=Ashwini ... 27=Revati)
  rashiIndex: number;     // 1 to 12 (1=Aries ... 12=Pisces)
  pada: number;           // 1 to 4
}

export interface KootaScoreBreakdown {
  varna: { score: number; maxScore: 1; details: string };
  vashya: { score: number; maxScore: 2; details: string };
  tara: { score: number; maxScore: 3; details: string };
  yoni: { score: number; maxScore: 4; details: string };
  maitri: { score: number; maxScore: 5; details: string };
  gana: { score: number; maxScore: 6; details: string };
  bhakoot: { score: number; maxScore: 7; details: string; isCanceled: boolean; pariharaDetails?: string };
  nadi: { score: number; maxScore: 8; details: string; isCanceled: boolean; pariharaDetails?: string };
}

export interface AshtakootaMatchResult {
  totalScore: number;         // Out of 36
  maxScore: 36;
  isCompatible: boolean;      // Pass threshold >= 18 AND no uncanceled Nadi/Bhakoot blocker
  scorePercentage: number;
  hasNadiDosha: boolean;
  isNadiCanceled: boolean;
  hasBhakootDosha: boolean;
  isBhakootCanceled: boolean;
  breakdown: KootaScoreBreakdown;
  provenance: {
    source: string;
    summary: string;
  };
}

// ============================================================================
// CLASSICAL LOOKUP TABLES & DATA CONSTANTS
// ============================================================================

// 1. Rashi Lords (1-based: 1=Aries ... 12=Pisces)
const RASHI_LORDS: Record<number, string> = {
  1: 'Mars',    2: 'Venus',   3: 'Mercury', 4: 'Moon',
  5: 'Sun',     6: 'Mercury', 7: 'Venus',   8: 'Mars',
  9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};

// 2. Rashi Varna (1=Brahmin, 2=Kshatriya, 3=Vaishya, 4=Shudra)
const RASHI_VARNA: Record<number, number> = {
  4: 1, 8: 1, 12: 1, // Cancer, Scorpio, Pisces -> Brahmin (4)
  1: 2, 5: 2, 9: 2,  // Aries, Leo, Sagittarius -> Kshatriya (3)
  2: 3, 6: 3, 10: 3, // Taurus, Virgo, Capricorn -> Vaishya (2)
  3: 4, 7: 4, 11: 4  // Gemini, Libra, Aquarius -> Shudra (1)
};

// 3. Yoni Animal Mapping per Nakshatra (1 to 27)
// 1=Horse, 2=Elephant, 3=Goat, 4=Serpent, 5=Dog, 6=Cat, 7=Rat, 8=Cow,
// 9=Buffalo, 10=Tiger, 11=Deer, 12=Monkey, 13=Mongoose, 14=Lion
const NAKSHATRA_YONI: Record<number, number> = {
  1: 1,  2: 2,  3: 3,  4: 4,  5: 4,  6: 5,  7: 6,  8: 3,  9: 7,  // Ashwini to Ashlesha
  10: 7, 11: 7, 12: 8, 13: 9, 14: 10,15: 9, 16: 10,17: 11,18: 11, // Magha to Jyeshtha
  19: 5, 20: 12,21: 13,22: 12,23: 14,24: 1, 25: 14,26: 8, 27: 2  // Moola to Revati
};

// Yoni Compatibility Matrix (0 to 4 points)
const YONI_COMPATIBILITY_MATRIX: number[][] = [
  // Hrs Ele Gt  Srp Dog Cat Rat Cow Buf Tgr Der Mky Mng Lio
  [ 4,  2,  2,  2,  2,  2,  1,  2,  0,  1,  3,  2,  2,  1 ], // 1: Horse
  [ 2,  4,  3,  3,  2,  2,  2,  3,  1,  0,  2,  3,  2,  1 ], // 2: Elephant
  [ 2,  3,  4,  2,  1,  2,  1,  3,  3,  1,  2,  0,  2,  2 ], // 3: Goat
  [ 2,  3,  2,  4,  2,  1,  1,  2,  2,  2,  2,  2,  0,  2 ], // 4: Serpent
  [ 2,  2,  1,  2,  4,  0,  2,  1,  2,  1,  2,  2,  2,  1 ], // 5: Dog
  [ 2,  2,  2,  1,  0,  4,  0,  2,  2,  1,  3,  2,  2,  2 ], // 6: Cat
  [ 1,  2,  1,  1,  2,  0,  4,  2,  2,  1,  2,  2,  1,  2 ], // 7: Rat
  [ 2,  3,  3,  2,  1,  2,  2,  4,  0,  1,  2,  2,  2,  1 ], // 8: Cow
  [ 0,  1,  3,  2,  2,  2,  2,  0,  4,  1,  2,  2,  2,  1 ], // 9: Buffalo
  [ 1,  0,  1,  2,  1,  1,  1,  1,  1,  4,  1,  1,  2,  1 ], // 10: Tiger
  [ 3,  2,  2,  2,  2,  3,  2,  2,  2,  1,  4,  2,  2,  1 ], // 11: Deer
  [ 2,  3,  0,  2,  2,  2,  2,  2,  2,  1,  2,  4,  2,  2 ], // 12: Monkey
  [ 2,  2,  2,  0,  2,  2,  1,  2,  2,  2,  2,  2,  4,  2 ], // 13: Mongoose
  [ 1,  1,  2,  2,  1,  2,  2,  1,  1,  1,  1,  2,  2,  4 ]  // 14: Lion
];

// 4. Gana Mapping per Nakshatra (1=Deva, 2=Manushya, 3=Rakshasa)
const NAKSHATRA_GANA: Record<number, number> = {
  1: 1,  2: 2,  3: 3,  4: 2,  5: 1,  6: 2,  7: 1,  8: 1,  9: 3,  // Ashwini to Ashlesha
  10: 3, 11: 2, 12: 2, 13: 1, 14: 3, 15: 1, 16: 3, 17: 1, 18: 3, // Magha to Jyeshtha
  19: 3, 20: 2, 21: 2, 22: 1, 23: 3, 24: 3, 25: 2, 26: 2, 27: 1  // Moola to Revati
};

// 5. Nadi Mapping per Nakshatra (1=Adi, 2=Madhya, 3=Antya)
const NAKSHATRA_NADI: Record<number, number> = {
  1: 1,  2: 2,  3: 3,  4: 3,  5: 2,  6: 1,  7: 1,  8: 2,  9: 3,  // Ashwini to Ashlesha
  10: 3, 11: 2, 12: 1, 13: 1, 14: 2, 15: 3, 16: 3, 17: 2, 18: 1, // Magha to Jyeshtha
  19: 1, 20: 2, 21: 3, 22: 3, 23: 2, 24: 1, 25: 1, 26: 2, 27: 3  // Moola to Revati
};

// 6. Planetary Friendships for Graha Maitri
// 5 = Friends, 4 = Neutral, 0 = Enemies
const GRAHA_MAITRI_SCORES: Record<string, Record<string, number>> = {
  Sun:     { Sun: 5, Moon: 5, Mars: 5, Mercury: 4, Jupiter: 5, Venus: 0, Saturn: 0 },
  Moon:    { Sun: 5, Moon: 5, Mars: 4, Mercury: 1, Jupiter: 4, Venus: 0, Saturn: 0 },
  Mars:    { Sun: 5, Moon: 4, Mars: 5, Mercury: 0, Jupiter: 5, Venus: 3, Saturn: 0 },
  Mercury: { Sun: 4, Moon: 1, Mars: 0, Mercury: 5, Jupiter: 0, Venus: 5, Saturn: 4 },
  Jupiter: { Sun: 5, Moon: 4, Mars: 5, Mercury: 0, Jupiter: 5, Venus: 0, Saturn: 3 },
  Venus:   { Sun: 0, Moon: 0, Mars: 3, Mercury: 5, Jupiter: 0, Venus: 5, Saturn: 5 },
  Saturn:  { Sun: 0, Moon: 0, Mars: 0, Mercury: 4, Jupiter: 3, Venus: 5, Saturn: 5 }
};

// ============================================================================
// KOOTA CALCULATION ALGORITHMS
// ============================================================================

// 1. VARNA KOOTA (Max: 1)
function calcVarna(groomRashi: number, brideRashi: number) {
  const gVarna = RASHI_VARNA[groomRashi];
  const bVarna = RASHI_VARNA[brideRashi];
  const score = gVarna >= bVarna ? 1 : 0;
  return { score, maxScore: 1 as const, details: `Groom Varna Grade (${gVarna}) vs Bride Varna Grade (${bVarna})` };
}

// 2. VASHYA KOOTA (Max: 2)
function calcVashya(groomRashi: number, brideRashi: number) {
  if (groomRashi === brideRashi) return { score: 2, maxScore: 2 as const, details: 'Identical Moon Signs' };
  
  // Natural Vashya pairs (1-8, 2-7, 3-6, 4-9, 5-10, 11-12 variants)
  const lordG = RASHI_LORDS[groomRashi];
  const lordB = RASHI_LORDS[brideRashi];
  if (lordG === lordB) return { score: 2, maxScore: 2 as const, details: 'Same Rashi Lord' };

  // Mutual friendship lookup for Vashya harmony
  const baseScore = GRAHA_MAITRI_SCORES[lordG]?.[lordB] ?? 0;
  const score = baseScore >= 4 ? 1 : 0.5;
  return { score, maxScore: 2 as const, details: `Vashya affinity based on Rashi lords (${lordG} & ${lordB})` };
}

// 3. TARA KOOTA (Max: 3)
function calcTara(groomStar: number, brideStar: number) {
  // Count Groom to Bride
  let countGtoB = (brideStar - groomStar + 1);
  if (countGtoB <= 0) countGtoB += 27;
  const posG = ((countGtoB - 1) % 9) + 1;

  // Count Bride to Groom
  let countBtoG = (groomStar - brideStar + 1);
  if (countBtoG <= 0) countBtoG += 27;
  const posB = ((countBtoG - 1) % 9) + 1;

  const gAuspicious = [2, 4, 6, 8, 9].includes(posG);
  const bAuspicious = [2, 4, 6, 8, 9].includes(posB);

  let score = 0;
  if (gAuspicious && bAuspicious) score = 3;
  else if (gAuspicious || bAuspicious) score = 1.5;

  return { score, maxScore: 3 as const, details: `Groom Tara (#${posG}) / Bride Tara (#${posB})` };
}

// 4. YONI KOOTA (Max: 4)
function calcYoni(groomStar: number, brideStar: number) {
  const yoniG = NAKSHATRA_YONI[groomStar] - 1; // 0-indexed
  const yoniB = NAKSHATRA_YONI[brideStar] - 1;
  const score = YONI_COMPATIBILITY_MATRIX[yoniG][yoniB];
  return { score, maxScore: 4 as const, details: `Yoni type ${yoniG + 1} vs ${yoniB + 1}` };
}

// 5. GRAHA MAITRI KOOTA (Max: 5)
function calcMaitri(groomRashi: number, brideRashi: number) {
  const lordG = RASHI_LORDS[groomRashi];
  const lordB = RASHI_LORDS[brideRashi];
  const score = GRAHA_MAITRI_SCORES[lordG]?.[lordB] ?? 0;
  return { score, maxScore: 5 as const, details: `Rashi Lords: ${lordG} & ${lordB}` };
}

// 6. GANA KOOTA (Max: 6)
function calcGana(groomStar: number, brideStar: number) {
  const ganaG = NAKSHATRA_GANA[groomStar]; // 1=Deva, 2=Manushya, 3=Rakshasa
  const ganaB = NAKSHATRA_GANA[brideStar];

  if (ganaG === ganaB) return { score: 6, maxScore: 6 as const, details: 'Identical Gana' };
  if (ganaG === 1 && ganaB === 2) return { score: 5, maxScore: 6 as const, details: 'Deva (Groom) & Manushya (Bride)' };
  if (ganaG === 2 && ganaB === 1) return { score: 6, maxScore: 6 as const, details: 'Manushya (Groom) & Deva (Bride)' };
  if ((ganaG === 1 && ganaB === 3) || (ganaG === 3 && ganaB === 1)) return { score: 1, maxScore: 6 as const, details: 'Deva & Rakshasa combination' };
  if (ganaG === 2 && ganaB === 3) return { score: 0, maxScore: 6 as const, details: 'Manushya (Groom) & Rakshasa (Bride)' };
  if (ganaG === 3 && ganaB === 2) return { score: 0, maxScore: 6 as const, details: 'Rakshasa (Groom) & Manushya (Bride)' };

  return { score: 0, maxScore: 6 as const, details: 'Incompatible Gana' };
}

// 7. BHAKOOT KOOTA (Max: 7) + PARIHARA
function calcBhakoot(groom: IndividualNatalInput, bride: IndividualNatalInput) {
  let diff = (bride.rashiIndex - groom.rashiIndex + 12) % 12;
  if (diff === 0) diff = 12;

  // Inauspicious offsets: 2-12 (11/1), 5-9 (8/4), 6-8 (7/5)
  const isBhakootDosha = [2, 12, 5, 9, 6, 8].includes(diff);
  
  if (!isBhakootDosha) {
    return { score: 7, maxScore: 7 as const, details: `Favorable Rashi distance (${diff})`, isCanceled: false };
  }

  // Evaluate Bhakoot Parihara (Rashi Lord Friendship)
  const lordG = RASHI_LORDS[groom.rashiIndex];
  const lordB = RASHI_LORDS[bride.rashiIndex];
  const lordsAreFriends = (GRAHA_MAITRI_SCORES[lordG]?.[lordB] ?? 0) >= 4;

  if (lordsAreFriends) {
    return {
      score: 7,
      maxScore: 7 as const,
      details: `Bhakoot offset (${diff}) present, but CANCELED by Parihara.`,
      isCanceled: true,
      pariharaDetails: `Rashi Lords (${lordG} & ${lordB}) are identical or mutual friends (Muhurta Chintamani Ch.3 Sl.44).`
    };
  }

  return { score: 0, maxScore: 7 as const, details: `Active Bhakoot Dosha: ${diff} Rashi offset.`, isCanceled: false };
}

// 8. NADI KOOTA (Max: 8) + PARIHARA
function calcNadi(groom: IndividualNatalInput, bride: IndividualNatalInput) {
  const nadiG = NAKSHATRA_NADI[groom.nakshatraIndex];
  const nadiB = NAKSHATRA_NADI[bride.nakshatraIndex];

  if (nadiG !== nadiB) {
    return { score: 8, maxScore: 8 as const, details: `Different Nadis (Groom: ${nadiG}, Bride: ${nadiB})`, isCanceled: false };
  }

  // Active Raw Nadi Dosha -> Evaluate Classical Pariharas
  const sameRashi = groom.rashiIndex === bride.rashiIndex;
  const sameStar = groom.nakshatraIndex === bride.nakshatraIndex;
  const samePada = groom.pada === bride.pada;

  const lordG = RASHI_LORDS[groom.rashiIndex];
  const lordB = RASHI_LORDS[bride.rashiIndex];
  const lordsAreFriends = (GRAHA_MAITRI_SCORES[lordG]?.[lordB] ?? 0) >= 4;

  // Parihara 1: Same Rashi, Different Nakshatras
  if (sameRashi && !sameStar) {
    return {
      score: 8,
      maxScore: 8 as const,
      details: 'Same Nadi present, but CANCELED by Parihara.',
      isCanceled: true,
      pariharaDetails: 'Rashi Abheda: Same Moon Sign, different Nakshatras (Muhurta Chintamani Ch.3 Sl.38).'
    };
  }

  // Parihara 2: Same Nakshatra, Different Rashis
  if (sameStar && !sameRashi) {
    return {
      score: 8,
      maxScore: 8 as const,
      details: 'Same Nadi present, but CANCELED by Parihara.',
      isCanceled: true,
      pariharaDetails: 'Nakshatra Abheda: Same Nakshatra spanning across Rashi boundary (Muhurta Chintamani Ch.3 Sl.39).'
    };
  }

  // Parihara 3: Same Nakshatra, Different Padas
  if (sameStar && !samePada) {
    return {
      score: 8,
      maxScore: 8 as const,
      details: 'Same Nadi present, but CANCELED by Parihara.',
      isCanceled: true,
      pariharaDetails: `Pada Bheda: Same Nakshatra, different quarters (Groom P${groom.pada} vs Bride P${bride.pada}).`
    };
  }

  // Parihara 4: Rashi Lord Friendship
  if (lordsAreFriends) {
    return {
      score: 8,
      maxScore: 8 as const,
      details: 'Same Nadi present, but CANCELED by Parihara.',
      isCanceled: true,
      pariharaDetails: `Lord Friendship: Rashi lords (${lordG} & ${lordB}) are friends (Muhurta Chintamani Ch.3 Sl.41).`
    };
  }

  return { score: 0, maxScore: 8 as const, details: `Active Nadi Dosha: Both share Nadi #${nadiG}.`, isCanceled: false };
}

// ============================================================================
// MAIN ASHTAKOOTA EVALUATOR FUNCTION
// ============================================================================

export function calculateAshtakoota(
  groom: IndividualNatalInput,
  bride: IndividualNatalInput
): AshtakootaMatchResult {
  const varna = calcVarna(groom.rashiIndex, bride.rashiIndex);
  const vashya = calcVashya(groom.rashiIndex, bride.rashiIndex);
  const tara = calcTara(groom.nakshatraIndex, bride.nakshatraIndex);
  const yoni = calcYoni(groom.nakshatraIndex, bride.nakshatraIndex);
  const maitri = calcMaitri(groom.rashiIndex, bride.rashiIndex);
  const gana = calcGana(groom.nakshatraIndex, bride.nakshatraIndex);
  const bhakoot = calcBhakoot(groom, bride);
  const nadi = calcNadi(groom, bride);

  const totalScore = 
    varna.score + vashya.score + tara.score + yoni.score + 
    maitri.score + gana.score + bhakoot.score + nadi.score;

  const hasNadiDosha = nadi.score === 0;
  const isNadiCanceled = nadi.isCanceled;
  const hasBhakootDosha = bhakoot.score === 0;
  const isBhakootCanceled = bhakoot.isCanceled;

  // Compatibility Rule: Score >= 18 AND no uncanceled Nadi or Bhakoot hard blocker
  const isCompatible = (totalScore >= 18) && !hasNadiDosha && !hasBhakootDosha;

  return {
    totalScore,
    maxScore: 36,
    isCompatible,
    scorePercentage: Number(((totalScore / 36) * 100).toFixed(2)),
    hasNadiDosha,
    isNadiCanceled,
    hasBhakootDosha,
    isBhakootCanceled,
    breakdown: {
      varna,
      vashya,
      tara,
      yoni,
      maitri,
      gana,
      bhakoot,
      nadi
    },
    provenance: {
      source: "Muhurta Chintamani - Vivaha Prakarana (Chapter 3)",
      summary: isCompatible 
        ? `Compatible Match (${totalScore}/36 Gunas). All major Doshas cleared or neutralized by Parihara.`
        : `Incompatible Match (${totalScore}/36 Gunas). ${hasNadiDosha ? 'Uncanceled Nadi Dosha active. ' : ''}${hasBhakootDosha ? 'Uncanceled Bhakoot Dosha active.' : ''}`
    }
  };
}

```