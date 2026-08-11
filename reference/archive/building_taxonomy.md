To build a production-grade **Activity Taxonomy**, the list must be structured hierarchically so that the rules engine can apply **inheritance**. Instead of writing separate astrological rules for hundreds of individual activities, high-level rules can be assigned to a **Category / Functional Group** (like *Sthira / Fixed* or *Kshipra / Swift*), while specific activities inherit those base constraints and apply their own micro-exceptions.

Below is a comprehensive, production-ready taxonomy designed for your JSON registry.

---

### 1. Unified Activity Taxonomy Schema

```
Level 1: Domain          (e.g., Real Estate, Career, Samskaras)
   └── Level 2: Sub-Domain   (e.g., Residential Construction, Financial Onboarding)
        └── Level 3: Activity Entity (e.g., ACT_GRIHA_PRAVESHA)
             └── Level 4: Specific Task / Execution (e.g., Signing Sale Deed, Moving Furniture)

```

---

### 2. Comprehensive Activity Registry

#### Domain 1: Property, Real Estate & Construction

* **1.1 Site Acquisition & Planning**
* `ACT_PROP_PURCHASE_LAND`: Buying raw land or plots (*Sthira / Fixed*).


* `ACT_PROP_SALE_LAND`: Selling real estate / transferring property title (*Kshipra / Swift*).


* `ACT_PROP_BOUNDING`: Fencing, boundary wall setup, earth leveling.


* **1.2 Groundbreaking & Construction**
* `ACT_BHOOMI_PUJAN`: Groundbreaking ritual (*Sthira / Fixed*).


* `ACT_FOUNDATION_LAYING`: Laying the first pillar / basement excavation (*Urdhvamukhi*).


* `ACT_ROOF_CASTING`: Casting roofs / building upper stories.


* `ACT_WELL_DIGGING`: Digging wells, borewells, basements, or water tanks (*Adhomukhi*).




* **1.3 Occupancy & Renovation**
* `ACT_GRIHA_PRAVESHA_NEW`: Entering a newly constructed house (*Purna Tithis*, *Sthira Nakshatras*).


* `ACT_GRIHA_PRAVESHA_OLD`: Re-entering an old / renovated home after travel or repair.
* `ACT_HOUSE_DEMOLITION`: Tearing down structures (*Ugra / Cruel*).





---

#### Domain 2: Business, Commerce & Finance

* **2.1 Enterprise & Onboarding**
* `ACT_BIZ_INCORPORATION`: Registering a new business / entity.
* `ACT_BIZ_OFFICE_OPENING`: Opening a shop, commercial office, or retail outlet.


* `ACT_BIZ_LAUNCH_PRODUCT`: Launching a new service, product, or software app.


* **2.2 Contracts & Financial Transactions**
* `ACT_FIN_CONTRACT_SIGNING`: Signing agreements, leases, or deeds (*Kshipra / Laghu*).


* `ACT_FIN_TAKING_LOAN`: Borrowing money / applying for mortgages (*Avoid Tuesdays*).


* `ACT_FIN_LENDING_MONEY`: Disbursement of funds / peer lending.
* `ACT_FIN_SAVINGS_DEPOSIT`: Opening long-term deposits or buying bullion (*Sthira / Fixed* or *Gulika Kalam*).


* `ACT_FIN_ASSET_PURCHASE`: Buying vehicles, heavy machinery, or tools (*Chara / Movable*).





---

#### Domain 3: Career, Governance & Public Roles

* **3.1 Service & Employment**
* `ACT_JOB_JOINING`: Joining a new corporate or private job (*Kshipra / Laghu*).


* `ACT_JOB_ASSUMING_OFFICE`: Taking over a high-authority / leadership / government role (*Sthira / Fixed*).


* `ACT_JOB_TENDER_SUBMISSION`: Submitting competitive bids or proposals.


* **3.2 Legal & Dispute Resolution**
* `ACT_LEGAL_FILING_SUIT`: Filing a lawsuit or initiating arbitration.
* `ACT_LEGAL_PEACE_SETTLEMENT`: Signing peace accords, out-of-court settlements, or mediation.





---

#### Domain 4: Education, Arts & Skill Acquisition

* **4.1 Academic & Technical Learning**
* `ACT_EDU_VIDYARAMBHA`: Formal start of education / learning letters (*Aksharambha*).


* `ACT_EDU_HIGHER_STUDIES`: Enrolling in universities, advanced degrees, or research.
* `ACT_EDU_TECHNICAL_SKILL`: Starting software, engineering, or mechanics courses.


* **4.2 Performing & Fine Arts**
* `ACT_ART_MUSIC_LEARNING`: Beginning vocal or instrumental music training.


* `ACT_ART_DANCE_STAGE`: First public performance / *Arangetram*.
* `ACT_ART_CRAFTSMANSHIP`: Learning jewelry making, painting, or sculpting (*Shilpa*).





---

#### Domain 5: Travel, Transportation & Logistics

* **5.1 Travel & Journeys**
* `ACT_TRV_SHORT_JOURNEY`: Inter-city / short business trips (*Chara / Movable*).


* `ACT_TRV_FOREIGN_PILGRIMAGE`: Long-distance international travel or pilgrimage.
* `ACT_TRV_VEHICLE_DRIVING`: First driving session of a new vehicle (*Tiryakamukhi*).




* **5.2 Relocation & Moving**
* `ACT_LOG_GOODS_RELOCATION`: Transporting household goods / shifting base.



---

#### Domain 6: Healthcare, Medicine & Wellness

* **6.1 Medical Interventions**
* `ACT_MED_SURGERY_ELECTIVE`: Scheduling planned surgeries (*Avoid Rikta Tithis & High Mars Affliction*).


* `ACT_MED_START_TREATMENT`: Starting a long-term medical treatment or therapy (*Kshipra / Laghu*).


* `ACT_MED_COMPOUNDING`: Preparing/mixing medicines or Ayurvedic formulations.





---

#### Domain 7: Life Rites & Family (*Samskaras*)

* **7.1 Child Rites**
* `ACT_SAM_GARBHADHANA`: Conception rite (*Garbhadhana*).


* `ACT_SAM_NAMAKARANA`: Naming ceremony (*Namakarana*).


* `ACT_SAM_ANNAPRASHANA`: First solid food feeding (*Annaprashana*).


* `ACT_SAM_KARNAVEDHA`: Ear piercing ceremony (*Karnavedha*).


* `ACT_SAM_CHUDAKARANA`: First haircut / Tonsure (*Chudakarana*).


* `ACT_SAM_UPANAYANA`: Sacred thread ceremony (*Upanayana*).




* **7.2 Religious Rites**
* `ACT_REL_AGNIHOTRA`: Consecrating sacred fires / *Agnihotra*.


* `ACT_REL_YAJNA_PUJA`: Performing major *Havan*, *Yajna*, or *Devalaya Pravesha*.


* `ACT_REL_FASTING_START`: Initiating long-term religious vows or fasts (*Vrata*).





---

### 3. Engine Inheritance Matrix Example

By organizing your JSON taxonomy with a `parent_group`, the rules engine can automatically resolve constraints for unconfigured sub-activities:

```json
{
  "activity_groups": [
    {
      "group_id": "GRP_STHIRA_FIXED",
      "default_constraints": {
        "allowed_nakshatras": ["ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA"],
        "required_facing": "UPWARD",
        "forbidden_tithis": ["RIKTA"]
      }
    }
  ],
  "activities": [
    {
      "activity_id": "ACT_PROP_PURCHASE_LAND",
      "parent_group": "GRP_STHIRA_FIXED",
      "override_constraints": {
        "preferred_weekdays": ["SUN", "THU"]
      }
    },
    {
      "activity_id": "ACT_GRIHA_PRAVESHA_NEW",
      "parent_group": "GRP_STHIRA_FIXED",
      "override_constraints": {
        "allowed_tithi_groups": ["PURNA", "NANDA"],
        "hard_blockers": ["ASTA_SHUKRA", "ASTA_GURU"]
      }
    }
  ]
}

```


Here is an exhaustive, categorized list of all activities specified across the extracted sections of Muhurta Chintamani, excluding marriage (Vivaha):

Samskaras & Life Rites (Non-Marriage)
Conception (Garbhadhana)
Christening / Naming (Namakarana)
First Eating of Grains (Annaprashana)
Ear Piercing (Karnavedha)
Agnihotra / Fire Offerings
Releasing Bulls (Vrishotsarga)
Keeping Fast (Vrata)
Yajna / Sacred Fire Rituals
Education & Skill Development
Beginning of Education (Vidyarambha)
Teaching Letters (Aksharambha)
Learning Music
Physical Arts / Craftsmanship (Shilpa)
Construction, Real Estate & Agriculture
House Construction / Laying Foundation
Building Upper Stories
Flag Hoisting / Canopy Setup
Multi-story Entry
Digging Wells, Water Tanks, and Basements
Mining / Unearthing Treasures
Tree Planting & Sowing Seeds
Ploughing
Cutting Crops / Harvesting
Gardening
Commerce, Finance & Daily Trade
Trading, Buying, and Selling
General Commerce
Taking Loans / Financial Borrowing
Making Jewels / Crafting Jewelry
Wearing Jewelry / Wearing New Clothes
Tailoring
Travel, Movement & Transportation
General Travel / Starting Journeys
Vehicle Purchase
Riding Animals or Cars
Road Transportation & Driving
Navigation
Movement-based Tasks
Warfare, Governance & Aggressive Actions
Demolition
Deceit & Ambush
Poison Preparation
Warfare & Weapon Usage
Fireworks / Fire-based Operations
Coronation / Royal Rites
Peace Rituals
Esoteric, Animal Care & Specialized Rites
Tantric Rituals (Abhichara)
Exorcism
Causing Division / Discord
Animal Taming, Training, Purchasing, or Binding
Mixing Chemical/Medical Compounds
Harvesting/Digging Root Crops
Personal Leisure & Social Activities
Playing Games / Sports
Making Friends / Social Alliances
Sexual Intimacy
Fine Arts Practice

Common Muhurta Categories

Beyond the major life events, classical muhurta preserves a surprisingly practical taxonomy. It assumes that initiation, education, property, healing, travel, and finance each ask time for a different kind of blessing. The lists below are not meant as random labels. They show how specifically the tradition names a beginning before selecting its hour.

Spiritual and Religious Muhurta

Spiritual muhurtas are used when the beginning itself is sacred practice. The emphasis is on receptivity, purity, and alignment with the deity, mantra, vow, or ritual being undertaken.

Diksha Muhurta - for spiritual initiation by a guru.
Mantra Diksha Muhurta - for receiving a specific mantra.
Vrata Muhurta - for beginning a religious vow.
Yagna Muhurta - for performing fire rituals.
Abhishek Muhurta - for ritual bathing of deities.
Educational and Career Muhurta

Educational and career muhurtas support beginnings connected with learning, formal responsibility, and professional movement. Here the act may look practical, but it still marks a new direction in the person's life.

Vidyarambha Muhurta - for beginning a child's formal education.
Aksharabhyasa Muhurta - for the first writing of letters.
Upanayana Muhurta - for the sacred thread ceremony.
Karya-arambha Muhurta - for starting a major work project.
Naukari Muhurta - for joining a new job.
Property and Real Estate Muhurta

Property muhurtas deal with land, buildings, and the act of making a place ready for human use. They remind the reader that a house or site is not only a financial asset. It is a field of residence and daily activity.

Bhumi Pujan Muhurta - for the foundation-laying of a building.
Vastu Shanti Muhurta - for energetic purification of a property.
Shilanyas Muhurta - for the first stone of a construction.
Kuwa Khanan Muhurta - for digging a well.
Health and Body Muhurta

Health and body muhurtas are more delicate because they involve embodiment directly. Some are family rites, while surgery muhurta remains secondary to medical judgment and safety.

Mundan Muhurta - for the first head shaving of a child, typically around age 1-3.
Karna-vedha Muhurta - for ear piercing.
Annaprashana Muhurta - for the first solid feeding of an infant.
Surgery Muhurta - for elective surgical procedures.
Travel and Journey Muhurta

Travel muhurtas treat departure as the birth of the journey. Ordinary movement does not need this care, but a pilgrimage or foreign journey may be given a formal starting moment.

Yatra Muhurta - for general travel.
Videsha Yatra Muhurta - for foreign journeys.
Tirtha Yatra Muhurta - for pilgrimage.
Financial Muhurta

Financial muhurtas are used when livelihood, wealth, or agricultural work is being formally opened. The focus is right timing for activity that must sustain people over time.

Vyapar Arambha Muhurta - for starting commercial activities.
Lakshmi Pujan Muhurta - for wealth-related rituals.
Krishi Karya Muhurta - for agricultural activities such as sowing and harvest.

To manage specific rule weights and overrides reliably in production, you need a clear separation between **Data (the JSON configuration)** and **Logic (the Python evaluation engine)**.

The best way to handle this is using a **Weighted Pipeline with Short-Circuit Evaluators**.

---

### 1. The Core Evaluation Pipeline Architecture

Every time a time slot is evaluated against an activity, it should pass through 4 distinct stages in sequence:

```
[ Incoming Time Slot Data ]
           │
           ▼
Stage 1: Hard Blocker Evaluator ──────> If triggered, REJECT slot immediately (Score = 0)
           │
           ▼
Stage 2: Base Constraint Scoring ─────> Sum base points for Nakshatra, Tithi, Weekday, etc.
           │
           ▼
Stage 3: Override & Parihara Engine ──> Apply cancellation bonuses or clear specific penalties
           │
           ▼
Stage 4: Score Normalizer & Status ───> Clamp score to 0–100 range & assign final status

```

---

### 2. JSON Configuration for Weights & Overrides

Store the weights and overrides inside the JSON definition for each activity so that you can tweak parameters without touching Python code:

```json
{
  "activity_id": "ACT_PROP_PURCHASE_LAND",
  "activity_name": "Buying Real Estate / Land",
  "weights": {
    "nakshatra_match": 35,
    "tithi_match": 25,
    "weekday_match": 15,
    "facing_match": 10,
    "cancellation_bonus": 15
  },
  "hard_blockers": [
    {
      "code": "BHADRA_EARTH_ACTIVE",
      "description": "Bhadra active in Mrityu Loka (Earth)",
      "bypass_rule": "BHADRA_PUCHHA_PHASE"
    },
    {
      "code": "YAMA_GHANTA_ACTIVE",
      "description": "Yama Ghanta Yoga active"
    }
  ],
  "cancellation_overrides": [
    {
      "rule_id": "OVR_DAGDHA_CANCEL",
      "if_afflicted_by": "DAGDHA_YOGA",
      "neutralized_by": ["SARVARTHA_SIDDHI_YOGA", "AMRITA_SIDDHI_YOGA"],
      "action": "CANCEL_PENALTY_AND_ADD_BONUS",
      "bonus_points": 15
    },
    {
      "rule_id": "OVR_MASA_SHUNYA_CANCEL",
      "if_afflicted_by": "MASA_SHUNYA_TITHI",
      "neutralized_by": ["RAVI_YOGA"],
      "action": "IGNORE_PENALTY",
      "bonus_points": 0
    }
  ]
}

```

---

### 3. Practical Python Management Strategy

Here is a clean Python class demonstrating how to execute this 4-stage evaluation loop cleanly:

```python
from typing import Dict, List, Any

class MuhurtaRuleManager:
    """
    Evaluates astrological time slots by applying hard blockers, 
    base weights, and classical cancellation overrides.
    """

    def evaluate_slot(self, slot: Dict[str, Any], rule_config: Dict[str, Any]) -> Dict[str, Any]:
        weights = rule_config.get("weights", {})
        current_score = 0
        rejections = []
        applied_overrides = []
        warnings = []

        # -------------------------------------------------------------
        # STAGE 1: HARD BLOCKERS (Short-circuit on absolute failures)
        # -------------------------------------------------------------
        for blocker in rule_config.get("hard_blockers", []):
            code = blocker["code"]
            
            # Check if condition is present in the slot
            if slot.get(code, False):
                # Check for bypass exception (e.g., Bhadra Puchha)
                bypass_code = blocker.get("bypass_rule")
                if bypass_code and slot.get(bypass_code, False):
                    applied_overrides.append(f"Hard blocker {code} bypassed by {bypass_code}")
                else:
                    return {
                        "status": "REJECTED",
                        "final_score": 0,
                        "rejections": [blocker["description"]],
                        "applied_overrides": applied_overrides,
                        "warnings": warnings
                    }

        # -------------------------------------------------------------
        # STAGE 2: BASE WEIGHT SCORING
        # -------------------------------------------------------------
        constraints = rule_config.get("baseline_constraints", {})

        # Nakshatra Check
        if slot.get("nakshatra") in constraints.get("allowed_nakshatras", []):
            current_score += weights.get("nakshatra_match", 0)

        # Tithi Check
        if slot.get("tithi_group") not in constraints.get("forbidden_tithi_groups", []):
            current_score += weights.get("tithi_match", 0)
        else:
            warnings.append(f"Forbidden Tithi Group: {slot.get('tithi_group')}")

        # Weekday Check
        if slot.get("weekday") in constraints.get("preferred_weekdays", []):
            current_score += weights.get("weekday_match", 0)

        # Facing Direction Check
        if slot.get("facing") == constraints.get("required_facing_orientation", "ANY"):
            current_score += weights.get("facing_match", 0)

        # -------------------------------------------------------------
        # STAGE 3: CANCELLATION OVERRIDES (Parihara Engine)
        # -------------------------------------------------------------
        for override in rule_config.get("cancellation_overrides", []):
            affliction = override["if_afflicted_by"]
            
            # If the slot has this affliction present
            if slot.get(affliction, False):
                neutralizers = override.get("neutralized_by", [])
                
                # Check if any neutralizing Yoga is active in the slot
                is_cancelled = any(slot.get(yoga, False) for yoga in neutralizers)
                
                if is_cancelled:
                    bonus = override.get("bonus_points", 0)
                    current_score += bonus
                    applied_overrides.append(
                        f"Affliction '{affliction}' was neutralized by active Yoga. Applied +{bonus} bonus."
                    )
                else:
                    warnings.append(f"Un-cancelled affliction present: {affliction}")

        # -------------------------------------------------------------
        # STAGE 4: SCORE NORMALIZATION & STATUS ASSIGNMENT
        # -------------------------------------------------------------
        final_score = max(0, min(current_score, 100))

        if final_score >= 80:
            status = "EXCELLENT"
        elif final_score >= 60:
            status = "GOOD"
        elif final_score >= 40:
            status = "ACCEPTABLE"
        else:
            status = "POOR"

        return {
            "status": status,
            "final_score": final_score,
            "rejections": [],
            "applied_overrides": applied_overrides,
            "warnings": warnings
        }

```

---

### 4. Key Management Rules to Follow

1. **Keep Hard Blockers Separate from Penalties:**
Hard blockers (like active *Yama Ghanta* or *Bhadra* in *Mrityu Loka*) should return `0` immediately rather than reducing points. A slot should never score 70% if an un-bypassed hard blocker is present.
2. **Always Store Override Logs:**
Whenever an override fires (e.g., *Sarvartha Siddhi Yoga* neutralizing *Dagdha Yoga*), log it in an `applied_overrides` array inside the response JSON. This allows your UI/API to explain *why* a slot was saved.
3. **Scale Weights to a Total of 100:**
Set standard base weights so their sum equals 100 before applying bonuses:
* **Nakshatra Match:** 35 points
* **Tithi Match:** 25 points
* **Weekday Match:** 15 points
* **Facing Direction / Secondary Match:** 10 points
* **Base Pass Threshold:** 15 points
* **Bonus Overrides:** +10 to +15 extra points for strong neutralizing Yogas.

When taking a *Muhurta* rules engine into a production environment, there are several critical technical and domain "gotchas" that frequently trip up development teams.

---

### 1. Astronomical Calculation Gotchas

* **The Sunrise Definition Flaw (Center vs. Upper Limb):**
* **Gotcha:** Standard astronomical libraries (like `ephem` or basic `pytz` scripts) calculate sunrise based on the *center* of the solar disc reaching $0^\circ$ altitude.
* **Fix:** Vedic *Panchanga* strictly defines sunrise (*Suryodaya*) when the **upper limb** of the Sun becomes visible, accounting for atmospheric refraction (typically when the Sun's true geometric center is at $-0.833^\circ$ or $-50'$ altitude). A 2-minute error in sunrise calculation shifts all *Ghati* divisions, *Hora* boundaries, and *Rahu Kalam* windows across the entire day.


* **Midnight Tithi & Nakshatra Transitions:**
* **Gotcha:** In Western calendars, a day changes at midnight (12:00 AM). In Vedic astrology, the day (*Vara*) begins strictly at **Local Sunrise** and ends at the following Local Sunrise.
* **Fix:** Ensure all database queries for a given date look up time slots from `Sunrise(Day T)` to `Sunrise(Day T+1)`, rather than `00:00:00` to `23:59:59`. A slot occurring at 3:00 AM on Tuesday belongs to Monday's *Vara*.


* **Ayanamsa Mismatching:**
* **Gotcha:** If your engine uses *Lahiri* Ayanamsa (Chitrapaksha) while a third-party ephemeris API feeds planetary longitudes using *Raman* or *KP* Ayanamsa, planetary degrees will drift by $1^\circ$ to $2^\circ$.
* **Fix:** Standardize and explicitly validate the Ayanamsa constant across all calculation microservices before computing Moon/Sun longitudes.



---

### 2. Rule Hierarchy & Over-Filtering Gotchas

* **The "Zero Slot" Search Trap:**
* **Gotcha:** Users inputting tight constraints (e.g., *"Find a 2-hour window next week between 2 PM and 5 PM on a Thursday with no Rahu Kalam, perfect Nakshatra, and no minor afflictions"*) will receive zero results $99\%$ of the time.
* **Fix:** Implement **Soft Constraint Relaxation**. If a strict query yields no slots above 80%, automatically re-run the evaluation with relaxed secondary weights (e.g., ignoring facing direction or weekday preference) and present the best relative options flagged with clear warning labels (e.g., *"Best available slot: 68% score due to neutral weekday"*).


* **The "Bhadra Loka" Fallacy:**
* **Gotcha:** Simply checking `if Bhadra == Active: Reject` is overly simplistic.
* **Fix:** *Bhadra* (Vishti Karana) resides in different realms depending on the Moon's zodiac sign:
* **Swarga Loka (Heaven):** Moon in Aries, Taurus, Gemini, Scorpio. (Harmless to Earth)
* **Patala Loka (Underworld):** Moon in Virgo, Sagittarius, Capricorn, Aquarius. (Harmless to Earth)
* **Mrityu Loka (Earth):** Moon in Cancer, Leo, Libra, Pisces. (**Malefic to Earth**)
* *Rule:* Only reject or heavily penalize *Bhadra* when it resides in **Mrityu Loka**, or during its initial *Mukha* (mouth) phase.





---

### 3. API & Data Management Gotchas

* **Timezone Offset Changes (DST / Day Boundary):**
* **Gotcha:** Daylight Saving Time (DST) shifts sunrise and solar noon by an hour. Hardcoding fixed UTC offsets instead of using IANA timezone strings (e.g., `Asia/Kolkata`, `America/New_York`) breaks calculations for overseas queries.
* **Fix:** Always calculate *Abhijit Muhurta*, *Rahu Kalam*, and *Lagna* times dynamically using geographic coordinates (Latitude, Longitude) and the IANA timezone database.


* **Floating-Point Precision Errors:**
* **Gotcha:** Floating-point rounding errors when subtracting Sun and Moon longitudes can cause boundary glitches at exact $12^\circ$ Tithi boundaries or $13^\circ20'$ Nakshatra boundaries.
* **Fix:** Use explicit numerical tolerances (e.g., `epsilon = 1e-6`) or high-precision decimal types when checking boundary transitions to prevent a slot from flickering between two Tithis.


* **Explainability Deficit:**
* **Gotcha:** Returning a raw score like `72/100` without detailed breakdown context frustrates users and makes debugging impossible.
* **Fix:** Ensure the API response payload always includes a structural breakdown:
```json
{
  "final_score": 75,
  "breakdown": {
    "nakshatra_points": 35,
    "tithi_points": 25,
    "weekday_penalty": -10,
    "overrides_applied": ["Sarvartha Siddhi Yoga neutralized Dagdha Yoga"]
  }
}

```





---

### Recommended Testing Guardrails

Before going live, test your engine against these 3 edge cases:

1. **Polar / High-Latitude Locations:** Test locations like Oslo or London in mid-summer/winter where daytime durations vary drastically from 12 hours.
2. **Kshaya & Vriddhi Tithis:** Test days where a Tithi is skipped between sunrises (*Kshaya*) or spans across two sunrises (*Vriddhi*).
3. **Boundary Transits:** Test events occurring exactly at the minute a Nakshatra or Tithi transitions to ensure smooth interval splitting.


To ensure your *Muhurta* engine is completely bulletproof, perform additional testing in three core areas: **Mathematical/Astronomical Calculation Tests**, **Astrological Edge-Case Validation**, and **API/Engine Logic Guardrails**.

Here is a structured testing checklist to run before deploying to production:

---

### 1. Mathematical & Astronomical Edge-Case Tests

* **High-Latitude / Polar Extremes:**
* **Test Scenario:** Run sunrise/sunset calculations for cities at high latitudes (e.g., Tromsø, Norway or Reykjavik, Iceland) during winter and summer solstices.
* **Expected Behavior:** Prevent division-by-zero or `NaN` errors when daylight duration approaches 24 hours or 0 hours. Ensure *Abhijit Muhurta* and *Rahu Kalam* algorithms fall back gracefully when standard 8-part daylight divisions cannot be computed.


* **Tithi Boundaries (*Kshaya* & *Vriddhi* Tithis):**
* **Test Scenario:** Locate historical dates with a *Kshaya Tithi* (a Tithi that starts after sunrise and ends before the next sunrise) and a *Vriddhi Tithi* (a Tithi that spans across two consecutive sunrises).


* **Expected Behavior:** Verify that *Udayavyapini* logic (the Tithi active at sunrise) correctly assigns the primary Tithi for the day while flagging the mid-day Tithi transition accurately for intra-day time slots.




* **Sun/Moon Elongation & $360^\circ$ Wrap-Around:**
* **Test Scenario:** Test time intervals where the Sun or Moon crosses $0^\circ$ Aries ($360^\circ \rightarrow 0^\circ$).
* **Expected Behavior:** Ensure angular difference calculations `(Moon - Sun)` do not yield negative numbers or $360^\circ+$ overflow errors when calculating Tithis or Nitya Yogas `(Sun + Moon)`.




* **Exact Minute/Second Boundary Transits:**
* **Test Scenario:** Evaluate a 2-hour time window during which a Nakshatra or Tithi changes mid-way (e.g., Nakshatra shifts from *Rohini* to *Mrigashira* at 10:14 AM).
* **Expected Behavior:** The engine should split the time window into two distinct sub-intervals, scoring each segment independently rather than applying a single uniform score to the entire window.



---

### 2. Astrological Rules & Exception Validation

* **Bhadra Realm (*Loka*) & Phase Logic:**
* **Test Scenario:** Pass a time slot where *Vishti Karana* (Bhadra) is active, but the Moon is in Gemini (*Swarga Loka*) vs. Cancer (*Mrityu Loka*).


* **Expected Behavior:** Verify that the hard blocker triggers **only** when Bhadra is in *Mrityu Loka* (Earth). Verify that if *Bhadra Puchha* (tail phase) is active during Mrityu Loka, the hard blocker is bypassed with a logged override.




* **Micro-Cancellation (*Parihara*) Precedence:**
* **Test Scenario:** Feed a slot containing *Dagdha Yoga* simultaneously with *Sarvartha Siddhi Yoga*.


* **Expected Behavior:** The engine must NOT reject the slot. It should penalize for *Dagdha Yoga*, apply the *Sarvartha Siddhi* override, add the bonus points, and record the exact cancellation in `applied_overrides`.




* **Regional & Planetary Combustion (*Asta*) Toggles:**
* **Test Scenario:** Test major long-term events like *Griha Pravesha* or *Marriage* during periods when Jupiter (*Brihaspati*) or Venus (*Shukra*) is combust (*Asta*).


* **Expected Behavior:** Ensure high-impact life rites flag hard rejections or severe penalties during planetary combustion, while routine short-term activities (like local travel or daily trade) remain unaffected.





---

### 3. API, Performance & Security Tests

* **Interval Search Scaling (Load Testing):**
* **Test Scenario:** Request a search for the best 30-minute window for an activity across a 90-day time range with 1-minute step resolution ($\approx 129,600$ evaluation points).
* **Expected Behavior:** Verify response time remains under 500ms. Ensure the evaluation engine uses vectorized operations or interval-tree indexing rather than naively looping through 130,000 individual JSON objects.


* **Timezone & Daylight Saving Time (DST) Transitions:**
* **Test Scenario:** Query time slots for locations undergoing DST shifts (e.g., London switching between GMT and BST in March/October).
* **Expected Behavior:** Confirm that local times display accurately without 1-hour offsets, while underlying planetary longitudes remain strictly aligned to UTC/Ephemeris Time.


* **Malformed Input & Fallback Safety:**
* **Test Scenario:** Submit an invalid activity ID, missing geographic coordinates, or an end-date earlier than the start-date.
* **Expected Behavior:** Return clean, structured HTTP 400 validation error payloads instead of unhandled exceptions or internal server errors.