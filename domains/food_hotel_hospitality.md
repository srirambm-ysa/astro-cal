### Domain: Food, Beverage, Hospitality & Restaurant Industry (`DOM_HOSPITALITY`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), the hospitality, food service, and hotel sectors map to traditional concepts of **Annaprashana / Bhojana** (sustenance, food preparation, and dining), **Paniyasala / Jalashaya** (beverage, liquid assets, and water storage), **Sabhagriha / Grihapravesha** (commercial lodging, halls, and hosting guests), and **Vyapararambha / Chara** (daily commercial trade and service distribution).

The primary planetary governors for this domain are:

* **Moon (Chandra):** Governs taste, food, beverages, liquids, public hospitality, and daily customer turnover.


* **Venus (Shukra):** Governs fine dining, luxury hotels, culinary aesthetics, ambiance, and entertainment.


* **Jupiter (Brihaspati):** Governs large-scale banquets, institutional catering, nutrition, and hospitality governance.


* **Mars (Mangala):** Governs kitchens, ovens, fire-based cooking operations (*Agni Tattva*), and culinary hardware.



---

### 1. Hospitality & Food Industry Taxonomy

#### Sub-Domain 1: Restaurants, Fine Dining & Cloud Kitchens

* `ACT_HOSP_RESTAURANT_OPENING`: Commercial grand opening of a restaurant, cafe, or bar (*Chara / Movable*).


* `ACT_HOSP_KITCHEN_IGNITION`: First firing of commercial kitchen stoves, ovens, or hearths (*Agni Tattva / Fire elements*).



#### Sub-Domain 2: Hotels, Lodging & Real Estate Operations

* `ACT_HOSP_HOTEL_INAUGURATION`: Opening a hotel, resort, or commercial lodging facility (*Sthira / Fixed*).


* `ACT_HOSP_BANQUET_EVENT_LAUNCH`: Launching a dedicated event hall, convention center, or wedding venue (*Purna / Fullness*).



#### Sub-Domain 3: Food Manufacturing, Beverages & Breweries

* `ACT_HOSP_BEVERAGE_BREWERY_START`: Bottling, brewing, or commercial production of beverages (*Jala Tattva / Water Signs*).


* `ACT_HOSP_FOOD_PACKAGED_LAUNCH`: Launching packaged consumer food products (FMCG) or food delivery brands (*Kshipra / Swift*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_HOSP_RESTAURANT_OPENING",
    "activity_name": "Restaurant, Cafe or Bar Grand Opening",
    "domain": "DOM_HOSPITALITY",
    "sub_domain": "SUB_RESTAURANT_AND_DINING",
    "intent": "High customer footfall, popular acclaim, repeat patronage, financial profitability",
    "baseline_constraints": {
      "functional_group": "Chara / Movable (Customer circulation) & Mridu (Hospitality & Taste)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI"
      ],
      "preferred_weekdays": ["FRI", "MON", "THU", "WED"],
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
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra) - Severe blocker for fine dining and luxury hospitality"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_SARVARTHA_CANCEL",
        "if_afflicted_by": "DAGDHA_YOGA",
        "neutralized_by": ["SARVARTHA_SIDDHI_YOGA", "AMRITA_SIDDHI_YOGA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_HOSP_HOTEL_INAUGURATION",
    "activity_name": "Hotel, Resort or Lodging Facility Inauguration",
    "domain": "DOM_HOSPITALITY",
    "sub_domain": "SUB_HOTEL_LODGING",
    "intent": "Asset longevity, high occupancy rates, guest safety, commercial reputation",
    "baseline_constraints": {
      "functional_group": "Sthira / Fixed (Infrastructure stability) & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "MRIGASHIRA", "REVATI"
      ],
      "preferred_weekdays": ["THU", "FRI", "MON", "SUN"],
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
        "description": "Bhadra active in Mrityu Loka (Earth)"
      },
      {
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_AMRITA_CANCEL",
        "if_afflicted_by": "MASA_SHUNYA_TITHI",
        "neutralized_by": ["AMRITA_SIDDHI_YOGA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_HOSP_KITCHEN_IGNITION",
    "activity_name": "First Commercial Kitchen Stoves / Hearth Lighting",
    "domain": "DOM_HOSPITALITY",
    "sub_domain": "SUB_RESTAURANT_AND_DINING",
    "intent": "Fire safety, food quality, efficient kitchen operations, team harmony",
    "baseline_constraints": {
      "functional_group": "Agni Tattva (Fire Element) & Kshipra / Laghu",
      "allowed_tithi_groups": ["NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "KRITTIKA", "PUSHYA", "HASTA", "ASHWINI", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA"
      ],
      "preferred_weekdays": ["SUN", "TUE", "THU"],
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
        "description": "Bhadra active in Mrityu Loka (Earth)"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (High risk of kitchen fires / equipment failure)"
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

### 3. Hospitality Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Restaurant Opening** | *Chara / Mridu*<br> | Swati, Punarvasu, Shravana, Anuradha, Revati, Rohini

 | Friday, Monday, Thursday, Wednesday

 | **Combust Venus (Asta Shukra)** is a hard blocker.

 |
| **Hotel / Resort Opening** | *Sthira / Fixed*<br> | Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Anuradha

 | Thursday, Friday, Monday, Sunday

 | **Upward (Urdhvamukhi)** facing orientation required.

 |
| **Kitchen Stove Lighting** | *Agni Tattva / Kshipra*<br> | Krittika, Pushya, Hasta, Ashwini, Rohini

 | Sunday, Tuesday, Thursday

 | **Vyatipata Yoga** blocked (prevents fire hazards).

 |
| **Packaged Food Launch** | *Kshipra / Swift*<br> | Hasta, Ashwini, Pushya, Shravana

 | Wednesday, Thursday, Friday

 | **Waxing Moon (Shukla Paksha)** preferred for product turnover.

 |