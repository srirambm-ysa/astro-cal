In classical *Muhurta* literature (including *Muhurta Chintamani*), legal matters, litigation, dispute resolution, and contractual enforcement fall under specialized classifications based on the **intent of the legal action**—whether the goal is **swift settlement, aggressive litigation, defense, or asset protection**.

Below is the complete **Legal Domain Activity Taxonomy**, structured into hierarchical JSON objects with baseline constraints, rule weights, and classical cancellation overrides.

---

### 1. Legal Domain Activity Taxonomy & Schema

#### Domain: `DOM_LEGAL`

##### Sub-Domain 1: Dispute Initiation & Criminal/Civil Filing

* `ACT_LEGAL_FILE_PLAINT`: Filing a civil lawsuit, writ petition, or commercial suit.
* `ACT_LEGAL_CRIMINAL_COMPLAINT`: Filing criminal charges, FIR, or regulatory complaints (*Ugra/Tikshna*).


* `ACT_LEGAL_INJUNCTION_STAY`: Applying for urgent stay orders, interim relief, or injunctions (*Kshipra/Swift*).



##### Sub-Domain 2: Defense, Bail & Asset Protection

* `ACT_LEGAL_BAIL_APPLICATION`: Applying for bail, anticipatory bail, or release (*Chara/Movable*).


* `ACT_LEGAL_WRITTEN_STATEMENT`: Filing defense statements, counter-affidavits, or appeals.

##### Sub-Domain 3: Alternate Dispute Resolution (ADR) & Settlements

* `ACT_LEGAL_ARBITRATION_START`: Initiating arbitration or mediation proceedings (*Mridu/Gentle*).


* `ACT_LEGAL_SETTLEMENT_SIGNING`: Signing out-of-court settlements, consent terms, or peace accords (*Mridu/Purna*).



##### Sub-Domain 4: Execution & Enforcement

* `ACT_LEGAL_EXECUTION_DECREE`: Executing court decrees, asset attachments, or eviction orders (*Ugra/Cruel*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_LEGAL_FILE_PLAINT",
    "activity_name": "Filing Civil / Commercial Lawsuit",
    "domain": "DOM_LEGAL",
    "sub_domain": "SUB_LEGAL_INITIATION",
    "intent": "Overcoming opposition, securing legal victory, establishing claim",
    "baseline_constraints": {
      "functional_group": "Jaya (Victory) & Kshipra (Swift)",
      "allowed_tithi_groups": ["JAYA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ARDRAL", "JYESTHA", "MOOLA", "ABHIJIT"
      ],
      "preferred_weekdays": ["TUE", "SUN", "THU"],
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
      }
    ]
  },
  {
    "activity_id": "ACT_LEGAL_SETTLEMENT_SIGNING",
    "activity_name": "Signing Out-of-Court Settlement / Peace Accord",
    "domain": "DOM_LEGAL",
    "sub_domain": "SUB_LEGAL_ADR",
    "intent": "Harmonization, pacification, ending hostility, long-term peace",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle/Tender)",
      "allowed_tithi_groups": ["PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI"
      ],
      "preferred_weekdays": ["FRI", "WED", "THU"],
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
        "code": "BHADRA_EARTH_ACTIVE",
        "description": "Bhadra active in Mrityu Loka (Earth)",
        "bypass_rule": "BHADRA_PUCHHA_PHASE"
      },
      {
        "code": "MARS_HORA_ACTIVE",
        "description": "Mars Hora active (Promotes hostility/aggression during peace talks)"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_RAVI_YOGA_CANCEL",
        "if_afflicted_by": "MASA_SHUNYA_TITHI",
        "neutralized_by": ["RAVI_YOGA"],
        "action": "IGNORE_PENALTY",
        "bonus_points": 10
      }
    ]
  },
  {
    "activity_id": "ACT_LEGAL_BAIL_APPLICATION",
    "activity_name": "Applying for Bail / Release from Custody",
    "domain": "DOM_LEGAL",
    "sub_domain": "SUB_LEGAL_DEFENSE",
    "intent": "Movement, swift liberation, escaping confinement",
    "baseline_constraints": {
      "functional_group": "Chara / Chala (Movable)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA"
      ],
      "preferred_weekdays": ["MON", "WED", "THU", "FRI"],
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
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_ABHIJIT_CANCEL",
        "if_afflicted_by": "RAHU_KALAM",
        "neutralized_by": ["ABHIJIT_MUHURTA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  }
]

```

---

### 3. Legal Domain Rules Summary Table

| Legal Activity | Functional Group | Key Nakshatras | Preferred Days | Key Exceptions / Avoidances |
| --- | --- | --- | --- | --- |
| **Filing Lawsuit / Plaint** | *Jaya / Kshipra*<br> | Hasta, Ashwini, Pushya, Ardra, Jyeshtha

 | Tuesday, Sunday, Thursday

 | Avoid *Rikta Tithis* (4, 9, 14) and *Bhadra* in Earth.

 |
| **Out-of-Court Settlement** | *Mridu / Gentle*<br> | Mrigashira, Chitra, Anuradha, Revati

 | Friday, Wednesday, Thursday

 | Avoid *Mars Hora* and *Kshaya Tithis*.

 |
| **Bail Application** | *Chara / Movable*<br> | Swati, Punarvasu, Shravana, Shatabhisha

 | Monday, Wednesday, Thursday

 | *Abhijit Muhurta* overrides minor *Rahu Kalam* afflictions.

 |
| **Executing Court Decree** | *Ugra / Sharp*<br> | Bharani, Magha, Purva Phalguni, Purva Ashadha

 | Saturday, Tuesday

 | Usable during *Vishti Karana* (Bhadra) for aggressive enforcement.

 |

Would you like to move to the **Healthcare & Medical Domain** next (surgeries, starting long-term treatments, compound mixing), or expand further into **Intellectual Property & Corporate Compliance**?