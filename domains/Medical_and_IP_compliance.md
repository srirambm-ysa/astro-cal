### Domain 1: Intellectual Property & Corporate Compliance (`DOM_IP_COMPLIANCE`)

Intellectual Property (IP) and Regulatory Compliance activities represent **asset fortification, state grants, legal claims, and corporate governance**.

In classical *Muhurta*, these map to a combination of **Sthira / Fixed** (for long-term asset lock and protection), **Kshipra / Swift** (for fast filing/registration before competitors), and **Tiryakamukhi** (sideways facing, associated with network and commercial operations).

---

#### Activity Taxonomy Schema & Registry

```json
[
  {
    "activity_id": "ACT_IP_PATENT_FILING",
    "activity_name": "Patent Application Filing / Priority Claim",
    "domain": "DOM_IP_COMPLIANCE",
    "sub_domain": "SUB_INTELLECTUAL_PROPERTY",
    "intent": "Establishing immediate legal priority, claim defense, long-term technological monopoly",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift execution) & Sthira (Asset locking)",
      "allowed_tithi_groups": ["JAYA", "NANDA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA"
      ],
      "preferred_weekdays": ["WED", "THU", "SUN"],
      "required_facing_orientation": "SIDEWAYS"
    },
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
        "code": "RAHU_KALAM_ACTIVE",
        "description": "Rahu Kalam active during exact filing window"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_ABHIJIT_RAHU_CANCEL",
        "if_afflicted_by": "RAHU_KALAM_ACTIVE",
        "neutralized_by": ["ABHIJIT_MUHURTA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_IP_TRADEMARK_REGISTRATION",
    "activity_name": "Trademark / Brand Registration & Publishing",
    "domain": "DOM_IP_COMPLIANCE",
    "sub_domain": "SUB_INTELLECTUAL_PROPERTY",
    "intent": "Commercial identity, public notice, trade goodwill, brand longevity",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle) & Chara (Public Reach)",
      "allowed_tithi_groups": ["PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "SWATI", "PUNARVASU"
      ],
      "preferred_weekdays": ["WED", "FRI", "THU"],
      "required_facing_orientation": "SIDEWAYS"
    },
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
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_SARVARTHA_CANCEL",
        "if_afflicted_by": "DAGDHA_YOGA",
        "neutralized_by": ["SARVARTHA_SIDDHI_YOGA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_COMP_REGULATORY_SUBMISSION",
    "activity_name": "Regulatory Compliance Filing (SEC, ROC, Tax, Audit)",
    "domain": "DOM_IP_COMPLIANCE",
    "sub_domain": "SUB_CORPORATE_COMPLIANCE",
    "intent": "Avoiding state penalty, smooth legal scrutiny, error-free validation",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift & Precise)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "SHRAVANA", "DHANISHTHA"
      ],
      "preferred_weekdays": ["WED", "THU", "MON"],
      "required_facing_orientation": "ANY"
    },
    "weights": {
      "nakshatra_match": 35,
      "tithi_match": 25,
      "weekday_match": 15,
      "facing_match": 10,
      "cancellation_bonus": 15
    },
    "hard_blockers": [
      {
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Severe risk of rejection/audit)"
      }
    ],
    "cancellation_overrides": []
  }
]

```

---

### Domain 2: Healthcare, Medicine & Wellness (`DOM_HEALTHCARE`)

Healthcare and medical activities follow a **dual astrological paradigm** in classical electional systems (*Kalaprakashika*, *Muhurta Chintamani*):

1. **Invasive Interventions / Surgery (*Shalya Kriya*):** Governed by **Tikshna / Ugra (Sharp/Cruel)** Nakshatras and **Mars/Saturn** influences (*Tuesday/Saturday*). Counterintuitively, **Rikta Tithis (4th, 9th, 14th)** are classically permitted for surgical incisions and tumor removals because they signify *cutting, emptying, and destruction of disease*.
2. **Medication, Therapy & Healing (*Aushadha Sevana*):** Governed by **Mridu (Gentle)** and **Kshipra (Swift)** Nakshatras, **Waxing Moon (Shukla Paksha)**, and benefic weekdays (Monday, Wednesday, Thursday, Friday). **Rikta Tithis must be strictly avoided**.

---

#### Activity Taxonomy Schema & Registry

```json
[
  {
    "activity_id": "ACT_MED_ELECTIVE_SURGERY",
    "activity_name": "Elective Surgical Operation (Shalya Kriya)",
    "domain": "DOM_HEALTHCARE",
    "sub_domain": "SUB_SURGICAL_INTERVENTION",
    "intent": "Excision of diseased tissue, incision, overcoming bodily affliction",
    "baseline_constraints": {
      "functional_group": "Tikshna / Ugra (Sharp/Cruel)",
      "allowed_tithi_groups": ["RIKTA", "JAYA"],
      "forbidden_tithi_groups": ["AMAVASYA", "PURNIMA"],
      "allowed_nakshatras": [
        "ARDRA", "JYESTHA", "ASHLESHA", "MOOLA", "HASTA", "ASHWINI"
      ],
      "preferred_weekdays": ["TUE", "SAT"],
      "required_facing_orientation": "ANY"
    },
    "weights": {
      "nakshatra_match": 40,
      "tithi_match": 20,
      "weekday_match": 20,
      "facing_match": 0,
      "cancellation_bonus": 20
    },
    "hard_blockers": [
      {
        "code": "MOON_TRANSIT_BODY_PART_SIGN",
        "description": "Transiting Moon occupying the zodiac sign governing the operated organ"
      },
      {
        "code": "EIGHTH_HOUSE_OCCUPIED",
        "description": "Eighth house of Muhurta Lagna occupied by malefic planets"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_MARS_STRENGTH_CANCEL",
        "if_afflicted_by": "SATURN_ASPECT_ON_LAGNA",
        "neutralized_by": ["MARS_EXALTED_OR_IN_OWN_SIGN"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 20
      }
    ]
  },
  {
    "activity_id": "ACT_MED_START_TREATMENT",
    "activity_name": "Commencing Long-term Therapy / Chronic Medication (Aushadha)",
    "domain": "DOM_HEALTHCARE",
    "sub_domain": "SUB_THERAPEUTIC_CARE",
    "intent": "Nourishment, systemic healing, vitality recovery, drug absorption",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu & Mridu / Maitra",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI"
      ],
      "preferred_weekdays": ["SUN", "THU", "WED", "MON"],
      "required_facing_orientation": "UPWARD"
    },
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
        "code": "KSHAYA_TITHI_ACTIVE",
        "description": "Kshaya Tithi active"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_AMRITA_SIDDHI_CANCEL",
        "if_afflicted_by": "DAGDHA_YOGA",
        "neutralized_by": ["AMRITA_SIDDHI_YOGA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_MED_PHARMA_COMPOUNDING",
    "activity_name": "Pharmaceutical Formulations / Ayurvedic Alchemy",
    "domain": "DOM_HEALTHCARE",
    "sub_domain": "SUB_PHARMA_MANUFACTURING",
    "intent": "Potency creation, stability of compounds, long shelf-life",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Chara (Dynamic mixing)",
      "allowed_tithi_groups": ["PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "SHRAVANA", "DHANISHTHA"
      ],
      "preferred_weekdays": ["WED", "THU", "FRI"],
      "required_facing_orientation": "DOWNWARD"
    },
    "weights": {
      "nakshatra_match": 35,
      "tithi_match": 25,
      "weekday_match": 15,
      "facing_match": 10,
      "cancellation_bonus": 15
    },
    "hard_blockers": [
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Risk of toxicity/instability)"
      }
    ],
    "cancellation_overrides": []
  }
]

```

---

### Comparison Matrix: IP/Compliance vs. Medical Domains

| Domain Activity | Functional Group | Key Nakshatras | Preferred Days | Special Astrological Rules |
| --- | --- | --- | --- | --- |
| **Patent Application** | *Kshipra / Sthira* | Hasta, Ashwini, Pushya, Rohini | Wednesday, Thursday, Sunday | Sideways facing orientation required. |
| **Regulatory Filing** | *Kshipra / Laghu* | Hasta, Ashwini, Pushya, Shravana | Wednesday, Thursday, Monday | Must avoid *Vyatipata Yoga* to prevent compliance rejection. |
| **Elective Surgery** | *Tikshna / Ugra* | Ardra, Jyeshtha, Ashlesha, Moola | Tuesday, Saturday | **Rikta Tithis (4, 9, 14) allowed**; 8th house must be empty. |
| **Start Treatment** | *Mridu / Kshipra* | Hasta, Ashwini, Pushya, Revati | Sunday, Thursday, Wednesday | **Rikta Tithis strictly forbidden**; Waxing Moon preferred. |