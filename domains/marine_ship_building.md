### Domain: Marine, Shipbuilding & Maritime Operations (`DOM_MARINE_MARITIME`)

In classical electional astrology (*Muhurta Chintamani*, *Vidyamadhaveeyam*, *Kalaprakashika*), maritime navigation, vessel construction, and water-based commerce fall under specialized rules governing **Jala Tattva** (the water element) and **Jalashaya / Naukarambha** (construction and launching of watercraft, docks, and harbors).

The primary planetary governors for this domain are:

* **Moon (Chandra):** Chief lord of the water element (*Jala Tattva*), tides, maritime journeys, and ocean voyages.


* **Varuna / Neptune:** Presiding deity of oceans, deep waters, and maritime weather.
* **Saturn (Shani):** Governs heavy industrial structures, iron/steel hulls, ports, docks, and long-term maritime logistics.


* **Mercury (Budha):** Governs trade navigation, maritime communication, and cargo logistics.



---

### 1. Marine & Shipbuilding Taxonomy

#### Sub-Domain 1: Vessel Construction & Hull Laying

* `ACT_MAR_KEEL_LAYING`: Laying the keel or first structural hull block of a ship or boat (*Sthira / Downward*).


* `ACT_MAR_SHIP_BUILDING_COMPLETE`: Completing structural assembly, fitting machinery, or retrofitting.



#### Sub-Domain 2: Vessel Launching & Sea Trials

* `ACT_MAR_SHIP_LAUNCHING`: Christening and initial water launch of a newly constructed ship (*Jala Signs / Movable*).


* `ACT_MAR_SEA_TRIALS`: Commencing inaugural sea trials or engine tests (*Kshipra / Movable*).



#### Sub-Domain 3: Ports, Docks & Offshore Infrastructure

* `ACT_MAR_DOCK_PORT_INAUGURATION`: Opening dry docks, container terminals, or port facilities (*Sthira / Fixed*).


* `ACT_MAR_OFFSHORE_RIG_DEPLOYMENT`: Towing and positioning offshore drilling rigs or wind turbines (*Sthira / Water*).



#### Sub-Domain 4: Cargo Fleet Operations & Maritime Trade

* `ACT_MAR_CARGO_FLEET_DISPATCH`: Inaugurating commercial shipping lines or oceanic cargo dispatches (*Chara / Movable*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_MAR_KEEL_LAYING",
    "activity_name": "Keel Laying / Structural Hull Fabrication",
    "domain": "DOM_MARINE_MARITIME",
    "sub_domain": "SUB_SHIPBUILDING",
    "intent": "Structural integrity, prevention of hull breach, vessel stability, long operational life",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Adhomukhi (Downward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "HASTA", "PUSHYA"
      ],
      "preferred_weekdays": ["MON", "THU", "WED", "FRI"],
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
        "code": "BHADRA_EARTH_ACTIVE",
        "description": "Bhadra active in Mrityu Loka (Earth)",
        "bypass_rule": "BHADRA_PUCHHA_PHASE"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Risk of structural flaws or maritime accidents)"
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
    "activity_id": "ACT_MAR_SHIP_LAUNCHING",
    "activity_name": "Vessel Launching / Entering Water (Naukarambha)",
    "domain": "DOM_MARINE_MARITIME",
    "sub_domain": "SUB_LAUNCH_AND_TRIALS",
    "intent": "Safe buoyancy, protection from storms/reefs, smooth voyages, commercial profitability",
    "baseline_constraints": {
      "functional_group": "Chara / Movable & Jala Tattva (Water Signs: Cancer, Scorpio, Pisces)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "REVATI", "HASTA", "PUSHYA", "ROHINI"
      ],
      "preferred_weekdays": ["MON", "FRI", "WED", "THU"],
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
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
      },
      {
        "code": "AFFLICTED_MOON_WATER_SIGN",
        "description": "Moon severely afflicted by Mars or Rahu in Water Signs (Risk of shipwreck or engine failure)"
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
    "activity_id": "ACT_MAR_DOCK_PORT_INAUGURATION",
    "activity_name": "Port Terminal, Dry Dock or Marina Inauguration",
    "domain": "DOM_MARINE_MARITIME",
    "sub_domain": "SUB_PORTS_AND_INFRASTRUCTURE",
    "intent": "High cargo volume, harbor safety, asset longevity, trade connectivity",
    "baseline_constraints": {
      "functional_group": "Sthira / Fixed & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "SHRAVANA"
      ],
      "preferred_weekdays": ["THU", "MON", "FRI", "WED"],
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

### 3. Marine & Shipbuilding Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Keel Laying** | *Sthira / Downward*<br> | Rohini, Uttaras, Anuradha, Hasta, Pushya

 | Monday, Thursday, Wednesday, Friday

 | **Downward (Adhomukhi)** facing orientation required.

 |
| **Vessel Launching** | *Chara / Water Signs*<br> | Swati, Punarvasu, Shravana, Shatabhisha, Revati, Rohini

 | Monday, Friday, Wednesday, Thursday

 | **Monday (Moon)** and **Water Rashis** (Cancer, Scorpio, Pisces) favored.

 |
| **Port / Dock Opening** | *Sthira / Purna*<br> | Rohini, Uttaras, Anuradha, Shravana

 | Thursday, Monday, Friday, Wednesday

 | **Upward (Urdhvamukhi)** facing orientation required.

 |
| **Sea Trials** | *Kshipra / Movable*<br> | Hasta, Ashwini, Pushya, Swati, Shatabhisha

 | Monday, Wednesday, Thursday

 | *Abhijit Muhurta* overrides minor daily flaws.

 |