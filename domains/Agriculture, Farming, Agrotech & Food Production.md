### Domain: Agriculture, Farming, Agrotech & Food Production (`DOM_AGRICULTURE_AGROTECH`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Krishi Parashara*, *Kalaprakashika*), agriculture is one of the most foundational domains. Classical systems categorize agricultural activities based on seasonal solar positions, lunar phases, and soil-water interactions: **Beeja Vapa** (seed sowing), **Halapravaha** (plowing/tilling), **Dhanya Chhedana / Sangrahana** (harvesting and grain storage), and **Vriksharopana** (plantation/orchards).

In the modern agrotech age, these classical rules map cleanly to precision farming, automated irrigation, biotechnology, hydroponics, and agricultural supply chain deployments:

* **Moon (Chandra):** Chief lord of vegetation, sap flow, moisture absorption, crop growth, and liquid irrigation (*Jala Tattva*).
* **Sun (Surya):** Governs germination, photosynthesis, solar radiation, and grain ripening.
* **Saturn (Shani):** Governs soil health, organic matter, deep tillage, storage silos, and cold chain logistics.
* **Mercury (Budha):** Governs agrotech software, sensor deployment, precision drone mapping, and grain trading.
* **Venus (Shukra) & Jupiter (Brihaspati):** Govern fruit orchards, flowering, seed potency, and bountiful harvest yield.

---

### 1. Agriculture & Agrotech Taxonomy

#### Sub-Domain 1: Land Preparation, Soil Health & Irrigation

* `ACT_AGRI_TILLAGE_PLOWING`: First seasonal plowing, soil turning, or mechanized tilling (*Sthira / Downward*).
* `ACT_AGRI_IRRIGATION_DRONE_SETUP`: Commissioning drip irrigation systems, automated pumps, or agrotech sensor grids (*Jala Signs / Kshipra*).

#### Sub-Domain 2: Sowing, Plantation & Biotechnology

* `ACT_AGRI_SEED_SOWING`: Sowing field crops, grain seeds, or greenhouse nursery germination (*Mridu / Upward*).
* `ACT_AGRI_TREE_PLANTATION`: Planting fruit orchards, timber trees, or perennial cash crops (*Sthira / Upward*).
* `ACT_AGRI_BIOTECH_GRAFTING`: Plant tissue culture, grafting, or bio-fertilizer application (*Mridu / Kshipra*).

#### Sub-Domain 3: Harvesting, Threshing & Processing

* `ACT_AGRI_CROP_HARVESTING`: Harvesting field crops, fruit picking, or automated combine harvesting (*Kshipra / Movable*).
* `ACT_AGRI_THRESHING_PROCESSING`: Grain threshing, milling, or agro-processing plant operation (*Tikshna / Sharp*).

#### Sub-Domain 4: Storage, Silos & Agrotech Logistics

* `ACT_AGRI_GRAIN_SILO_STORAGE`: Storing harvested grains in granaries, cold storage, or elevator silos (*Sthira / Downward*).
* `ACT_AGRI_COMMODITY_DISPATCH`: Bulk dispatch of produce to agricultural markets (Mandi) or export terminals (*Chara / Movable*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_AGRI_SEED_SOWING",
    "activity_name": "Seed Sowing & Nursery Germination (Beeja Vapa)",
    "domain": "DOM_AGRICULTURE_AGROTECH",
    "sub_domain": "SUB_SOWING_PLANTATION",
    "intent": "High germination rate, strong root establishment, pest resistance, bountiful crop yield",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle) & Urdhvamukhi (Upward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "HASTA", "PUSHYA"
      ],
      "preferred_weekdays": ["WED", "THU", "FRI", "MON"],
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
        "code": "WANING_MOON_EXTREME",
        "description": "Krishna Paksha 13th to Amavasya (Low sap movement and poor germination vitality)"
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
    "activity_id": "ACT_AGRI_GRAIN_SILO_STORAGE",
    "activity_name": "Granary Ingestion & Cold Storage Inflow (Dhanya Sangrahana)",
    "domain": "DOM_AGRICULTURE_AGROTECH",
    "sub_domain": "SUB_STORAGE_LOGISTICS",
    "intent": "Protection against pests/fungus, weight retention, long shelf-life, market price stability",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Adhomukhi (Downward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "SHRAVANA", "DHANISHTHA", "HASTA"
      ],
      "preferred_weekdays": ["SAT", "THU", "MON", "WED"],
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
        "description": "Bhadra active in Mrityu Loka (Earth)"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Risk of spoilage or pest infestation)"
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
    "activity_id": "ACT_AGRI_CROP_HARVESTING",
    "activity_name": "Field Crop Harvesting & Fruit Picking (Dhanya Chhedana)",
    "domain": "DOM_AGRICULTURE_AGROTECH",
    "sub_domain": "SUB_HARVESTING_PROCESSING",
    "intent": "Efficient crop gathering, low harvesting losses, optimal grain moisture, fast transit",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu & Chara / Movable",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "SWATI", "PUNARVASU", "SHRAVANA", "SHATABHISHA"
      ],
      "preferred_weekdays": ["SUN", "THU", "TUE", "WED"],
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

### 3. Agriculture & Agrotech Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Seed Sowing / Germination** | *Mridu / Upward* | Mrigashira, Chitra, Anuradha, Revati, Rohini, Uttaras | Wednesday, Thursday, Friday, Monday | **Waxing Moon (Shukla Paksha)** strongly preferred for moisture/sap flow. |
| **Granary / Silo Storage** | *Sthira / Downward* | Rohini, Uttaras, Anuradha, Shravana, Dhanishtha, Hasta | Saturday, Thursday, Monday, Wednesday | **Downward (Adhomukhi)** facing orientation required. |
| **Crop Harvesting** | *Kshipra / Movable* | Hasta, Ashwini, Pushya, Swati, Punarvasu, Shravana | Sunday, Thursday, Tuesday, Wednesday | **Sideways (Tiryakamukhi)** orientation for rapid field gathering. |
| **Irrigation / Agrotech Setup** | *Jala / Kshipra* | Shatabhisha, Revati, Pushya, Hasta, Rohini, Shravana | Monday, Wednesday, Friday | Alignment with **Water Signs (Cancer, Scorpio, Pisces)** favored. |