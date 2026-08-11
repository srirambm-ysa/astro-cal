### Domain: Automotive, Manufacturing, Industrial & Aerospace (`DOM_AUTOMOTIVE_MANUFACTURING`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), heavy manufacturing, vehicle fabrication, metal casting, mechanical engineering, and flight navigation map to traditional concepts of **Yantra / Shilpa** (machinery, mechanical arts, and tool engineering), **Dhatu Kriya** (metallurgy, forging, and structural fabrication), and **Vimana / Akasa Gamana** (aerial transit, flight orientation, and sky navigation).

The primary planetary lords and elemental vectors for this domain are:

* **Saturn (Shani):** Chief ruler of heavy industrial machinery, assembly lines, steel/iron fabrication, mass production, and manufacturing infrastructure.
* **Mars (Mangala):** Ruler of engines, combustion systems, tooling, welding/cutting operations (*Agni Tattva*), robotics, and precision metal machining.
* **Mercury (Budha):** Governs electronics, sensors, microprocessors, telemetry, avionics, and automated control systems.
* **Venus (Shukra):** Governs automotive design, body styling, aerodynamics, cabin ergonomics, and luxury vehicle finishes.
* **Rahu:** Governs advanced aerospace propulsion, synthetic composites, satellite communications, and high-altitude flight systems.

---

### 1. Automotive, Manufacturing & Aerospace Taxonomy

#### Sub-Domain 1: Factory Setup, Tooling & Assembly Lines

* `ACT_MFG_PLANT_COMMISSIONING`: Inaugurating a manufacturing plant, factory floor, or industrial facility (*Sthira / Fixed*).
* `ACT_MFG_TOOLING_MACHINERY_INSTALL`: Installing heavy CNC machines, stamping presses, or automated assembly robots (*Sthira / Downward*).

#### Sub-Domain 2: Automotive Production & Vehicle Launches

* `ACT_AUTO_MODEL_MASS_PRODUCTION`: Initiating commercial assembly line rollout for a new vehicle model (*Chara / Movable*).
* `ACT_AUTO_COMMERCIAL_VEHICLE_LAUNCH`: Public reveal, dealership dispatch, or fleet launch of a new automotive line (*Chara / Sideways*).

#### Sub-Domain 3: Precision Metallurgy, Forging & Casting

* `ACT_MFG_FORGING_CASTING_START`: Firing industrial blast furnaces, foundry casting, or heavy metal forging (*Agni Tattva / Tikshna*).
* `ACT_MFG_PRECISION_MACHINING`: Commencing high-precision lathe work, laser cutting, or engine block machining (*Kshipra / Swift*).

#### Sub-Domain 4: Aerospace, Avionics & Satellite Systems

* `ACT_AERO_AIRCRAFT_ASSEMBLY_INIT`: Keel/airframe assembly start for commercial or military aircraft (*Chara / Upward*).
* `ACT_AERO_FLIGHT_MAIDEN_TEST`: Commencing maiden test flights or engine static-fire tests (*Chara / Upward*).
* `ACT_AERO_SATELLITE_LAUNCH`: Rocket launch, satellite payload integration, or orbital deployment (*Upward / Kshipra*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_MFG_PLANT_COMMISSIONING",
    "activity_name": "Industrial Manufacturing Plant & Assembly Line Inauguration",
    "domain": "DOM_AUTOMOTIVE_MANUFACTURING",
    "sub_domain": "SUB_FACTORY_SETUP",
    "intent": "Operational uptime, high production yield, worker safety, equipment longevity",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "PUSHYA", "HASTA"
      ],
      "preferred_weekdays": ["SAT", "THU", "WED", "MON"],
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
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Risk of industrial accidents or structural failures)"
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
    "activity_id": "ACT_AERO_FLIGHT_MAIDEN_TEST",
    "activity_name": "Maiden Test Flight / Aerospace Engine Static Fire",
    "domain": "DOM_AUTOMOTIVE_MANUFACTURING",
    "sub_domain": "SUB_AEROSPACE_AVIONICS",
    "intent": "Aerodynamic stability, zero avionics failure, engine reliability, flight crew safety",
    "baseline_constraints": {
      "functional_group": "Chara / Movable & Urdhvamukhi (Upward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "ASHWINI", "PUSHYA"
      ],
      "preferred_weekdays": ["WED", "THU", "FRI", "SUN"],
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
        "code": "VAIDHRITI_YOGA_ACTIVE",
        "description": "Vaidhriti Nitya Yoga active (Severe risk of navigational failure or atmospheric turbulence)"
      },
      {
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
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
    "activity_id": "ACT_AUTO_MODEL_MASS_PRODUCTION",
    "activity_name": "Commercial Assembly Line Rollout for Vehicle Model",
    "domain": "DOM_AUTOMOTIVE_MANUFACTURING",
    "sub_domain": "SUB_AUTOMOTIVE_PRODUCTION",
    "intent": "High manufacturing throughput, minimal recall rate, market demand, supply chain flow",
    "baseline_constraints": {
      "functional_group": "Chara (Movable) & Kshipra (Swift)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "PUSHYA", "ROHINI"
      ],
      "preferred_weekdays": ["WED", "FRI", "THU", "SAT"],
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

### 3. Automotive, Manufacturing & Aerospace Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Plant Commissioning** | *Sthira / Upward* | Rohini, Uttaras, Anuradha, Pushya, Hasta | Saturday, Thursday, Wednesday, Monday | **Upward (Urdhvamukhi)** orientation; Saturday (Saturn lord of industry) favored. |
| **Maiden Flight / Static Test** | *Chara / Upward* | Swati, Punarvasu, Shravana, Shatabhisha, Hasta, Pushya | Wednesday, Thursday, Friday, Sunday | **Vaidhriti Yoga** and **Bhadra** strictly blocked to prevent atmospheric/navigational failures. |
| **Automotive Mass Rollout** | *Chara / Kshipra* | Swati, Punarvasu, Dhanishtha, Shatabhisha, Hasta, Pushya | Wednesday, Friday, Thursday, Saturday | Requires **Sideways (Tiryakamukhi)** orientation for trade and distribution. |
| **Forging / Furnace Casting** | *Agni Tattva / Tikshna* | Krittika, Bharani, Ardra, Jyeshtha, Moola, Pushya | Tuesday, Saturday, Sunday | **Mars Hora** favored for thermal metal operations. |