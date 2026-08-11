### Domain: Petroleum, Oil, Natural Gas & Derivatives (`DOM_PETROLEUM_GAS`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), the exploration, extraction, refining, and commercial movement of hydrocarbon reserves fall under the combined governance of **Bhoomi Tattva / Adhomukhi** (subterranean extraction), **Agni Tattva** (combustion, refining, and gas processing), and **Jala Tattva** (viscous liquids and fluid dynamics).

The primary planetary lords for this domain are:

* **Saturn (Shani):** Chief significator of crude oil, unrefined petroleum, coal tar, bitumen, underground fossil reserves, and heavy mineral oils.
* **Mars (Mangala):** Governs refineries, high-pressure pipelines, thermal cracking units, LPG/LNG processing, and natural gas combustion (*Agni Tattva*).
* **Rahu:** Governs synthetic derivatives, petrochemical polymers, plastics, complex chemical cracking, and offshore drilling.
* **Venus (Shukra) & Moon (Chandra):** Govern fluid transport, fuel retail distribution, and liquid lubricants.

---

### 1. Petroleum & Oil Industry Taxonomy

#### Sub-Domain 1: Exploration & Well Drilling

* `ACT_PETRO_EXPLORATION_RIG_SPUD`: Commencing wildcat drilling, offshore platform spudding, or onshore oil/gas well drilling (*Adhomukhi / Fixed*).
* `ACT_PETRO_RESERVE_CONCESSION`: Signing exploration block concessions, production sharing contracts (PSCs), or drilling rights (*Sthira / Fixed*).

#### Sub-Domain 2: Refining, Cracking & Petrochemicals

* `ACT_PETRO_REFINERY_CRACKING_START`: Commissioning fluid catalytic crackers (FCC), delayed coking units, or hydrocrackers (*Agni Tattva / Tikshna*).
* `ACT_PETRO_DERIVATIVE_POLYMER_PLANT`: Initiating petrochemical synthesis, plastic resin manufacturing, or synthetic polymer production (*Rahu / Kshipra*).

#### Sub-Domain 3: Midstream Pipelines & Storage Depots

* `ACT_PETRO_PIPELINE_FIRST_PUMP`: Inaugurating cross-country oil/gas pipelines or tank farm storage depots (*Chara / Movable*).
* `ACT_PETRO_LNG_TERMINAL_COMMISSION`: Commissioning LNG regasification terminals, cryogenic storage, or LPG bottling facilities (*Jala Tattva / Fixed*).

#### Sub-Domain 4: Downstream Fuel Retail & Distribution

* `ACT_PETRO_FUEL_STATION_OPENING`: Grand opening of commercial gas stations, EV charging hubs, or bulk fuel depots (*Chara / Sideways*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_PETRO_EXPLORATION_RIG_SPUD",
    "activity_name": "Oil & Gas Well Drilling / Rig Spudding",
    "domain": "DOM_PETROLEUM_GAS",
    "sub_domain": "SUB_EXPLORATION_DRILLING",
    "intent": "High hydrocarbon strike rate, blow-out prevention, drilling rig safety, high reservoir pressure",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Adhomukhi (Downward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "BHARANI", "SHATABHISHA", "MOOLA"
      ],
      "preferred_weekdays": ["SAT", "TUE", "SUN", "THU"],
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
        "description": "Vyatipata Nitya Yoga active (Severe risk of well blowout, pipe collapse, or rig damage)"
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
    "activity_id": "ACT_PETRO_REFINERY_CRACKING_START",
    "activity_name": "Refinery Catalytic Cracking & High-Pressure Unit Commissioning",
    "domain": "DOM_PETROLEUM_GAS",
    "sub_domain": "SUB_REFINING_PETROCHEMICALS",
    "intent": "Optimal distillate yield, thermal safety, zero explosion risk, equipment longevity",
    "baseline_constraints": {
      "functional_group": "Agni Tattva (Fire Element) & Tikshna / Ugra",
      "allowed_tithi_groups": ["NANDA", "JAYA"],
      "forbidden_tithi_groups": ["AMAVASYA"],
      "allowed_nakshatras": [
        "KRITTIKA", "BHARANI", "ARDRA", "JYESTHA", "MOOLA", "PUSHYA", "SHATABHISHA"
      ],
      "preferred_weekdays": ["TUE", "SAT", "SUN"],
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
        "code": "VAIDHRITI_YOGA_ACTIVE",
        "description": "Vaidhriti Nitya Yoga active (High risk of refinery fire, leak, or explosive hazard)"
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
  },
  {
    "activity_id": "ACT_PETRO_PIPELINE_FIRST_PUMP",
    "activity_name": "Oil & Gas Pipeline Commissioning / Tank Farm Operation",
    "domain": "DOM_PETROLEUM_GAS",
    "sub_domain": "SUB_MIDSTREAM_STORAGE",
    "intent": "Uninterrupted throughput flow, zero pressure drop, corrosion resistance, leak prevention",
    "baseline_constraints": {
      "functional_group": "Chara / Movable (Continuous flow) & Sthira",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "ROHINI"
      ],
      "preferred_weekdays": ["SAT", "WED", "THU", "MON"],
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
  }
]

```

---

### 3. Petroleum & Gas Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Rig Spudding / Well Drilling** | *Sthira / Downward* | Rohini, Uttaras, Anuradha, Bharani, Shatabhisha, Moola | Saturday, Tuesday, Sunday, Thursday | **Downward (Adhomukhi)** orientation required; Saturday (Saturn oil lord) favored. |
| **Refinery Unit Cracking** | *Agni Tattva / Tikshna* | Krittika, Bharani, Ardra, Jyeshtha, Moola, Pushya, Shatabhisha | Tuesday, Saturday, Sunday | **Vaidhriti Yoga** blocked (prevents refinery fires and explosive hazards). |
| **Pipeline Flow Commissioning** | *Chara / Movable* | Swati, Punarvasu, Shravana, Dhanishtha, Shatabhisha, Hasta | Saturday, Wednesday, Thursday, Monday | **Sideways (Tiryakamukhi)** orientation for pipeline network distribution. |
| **Fuel Station Opening** | *Chara / Kshipra* | Hasta, Ashwini, Pushya, Swati, Punarvasu, Shravana | Wednesday, Thursday, Friday | Requires high customer turnover alignment (*Waxing Moon* preferred). |