### Domain: Mining, Metals, Minerals & Rare Earths (`DOM_MINING_METALS`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), mining operations, mineral extraction, metallurgy, and subsurface exploration fall under the specialized rules of **Bhoomi Khanana / Dhatu Kriya** (earth excavation and metallic processing) and **Adhomukhi** (downward-facing) Nakshatra orientations.

The primary planetary lords for this domain are:

* **Saturn (Shani):** Chief ruler of subterranean reserves, iron ore, coal, heavy minerals, crude oil, and deep-earth mining.
* **Mars (Mangala):** Ruler of copper, gold, smelting furnaces, refining metallurgy, and heavy excavation machinery (*Agni Tattva*).
* **Mercury (Budha):** Ruler of rare earths, emeralds, silicon, lithium, and strategic technological minerals.
* **Sun (Surya):** Ruler of gold reserves, noble metals, and sovereign mineral rights.

---

### 1. Mining, Metals & Minerals Taxonomy

#### Sub-Domain 1: Exploration, Geological Survey & Drilling

* `ACT_MINE_GEOLOGICAL_DRILLING`: Commencing test drilling, seismic surveys, or exploratory core sampling (*Adhomukhi / Downward*).
* `ACT_MINE_LEASE_CLAIM_FILING`: Filing mineral rights claims, government mining leases, or concession rights (*Sthira / Fixed*).

#### Sub-Domain 2: Mine Shaft Sinking & Underground Operations

* `ACT_MINE_SHAFT_OPENING`: Sinking mine shafts, opening open-cast pits, or tunneling (*Adhomukhi / Fixed*).
* `ACT_MINE_HEAVY_MACHINERY_DEPLOY`: Deploying excavators, tunneling machines, or heavy mining equipment (*Tikshna / Sharp*).

#### Sub-Domain 3: Smelting, Refining & Rare Earth Processing

* `ACT_MINE_SMELTER_FURNACE_IGNITION`: Firing commercial smelting furnaces, refineries, or metal processing units (*Agni Tattva / Mars*).
* `ACT_MINE_RARE_EARTH_REFINING`: Commencing chemical extraction, lithium/silicon purification, or rare earth processing (*Kshipra / Swift*).

#### Sub-Domain 4: Precious Metals & Mineral Trade

* `ACT_MINE_BULLION_MINERAL_AUCTION`: Executing bulk mineral sales, raw ore auctions, or precious metal dispatches (*Purna / Fullness*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_MINE_SHAFT_OPENING",
    "activity_name": "Mine Shaft Sinking / Open-Cast Excavation",
    "domain": "DOM_MINING_METALS",
    "sub_domain": "SUB_UNDERGROUND_MINING",
    "intent": "Mine safety, structural stability, rich mineral yield, disaster prevention",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Adhomukhi (Downward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "BHARANI", "KRITTIKA", "MOOLA"
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
        "description": "Vyatipata Nitya Yoga active (Severe risk of mine collapse or cave-ins)"
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
    "activity_id": "ACT_MINE_SMELTER_FURNACE_IGNITION",
    "activity_name": "Smelter Furnace Lighting & Metallurgical Refining",
    "domain": "DOM_MINING_METALS",
    "sub_domain": "SUB_SMELTING_REFINING",
    "intent": "High metal purity, fire safety, energy efficiency, furnace lining longevity",
    "baseline_constraints": {
      "functional_group": "Agni Tattva (Fire Element) & Tikshna / Ugra",
      "allowed_tithi_groups": ["NANDA", "JAYA"],
      "forbidden_tithi_groups": ["AMAVASYA"],
      "allowed_nakshatras": [
        "KRITTIKA", "BHARANI", "ARDRA", "JYESTHA", "MOOLA", "PUSHYA", "ROHINI"
      ],
      "preferred_weekdays": ["TUE", "SUN", "SAT"],
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
        "description": "Vaidhriti Nitya Yoga active (High risk of industrial fire or toxic leakage)"
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
    "activity_id": "ACT_MINE_RARE_EARTH_REFINING",
    "activity_name": "Rare Earth & Strategic Mineral Processing (Lithium, Silicon, Cobalt)",
    "domain": "DOM_MINING_METALS",
    "sub_domain": "SUB_SMELTING_REFINING",
    "intent": "High technical precision, yield optimization, chemical safety, commercial supply stability",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu & Sthira",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "SHRAVANA"
      ],
      "preferred_weekdays": ["WED", "SAT", "THU"],
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

### 3. Mining & Metals Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Mine Shaft Sinking** | *Sthira / Downward* | Rohini, Uttaras, Anuradha, Bharani, Krittika, Moola | Saturday, Tuesday, Sunday, Thursday | **Downward (Adhomukhi)** facing orientation required; Saturday (Saturn) favored. |
| **Smelter Ignition** | *Agni Tattva / Tikshna* | Krittika, Bharani, Ardra, Jyeshtha, Moola, Pushya | Tuesday, Sunday, Saturday | **Vaidhriti Yoga** blocked (prevents furnace explosions/hazards). |
| **Rare Earth Processing** | *Kshipra / Sthira* | Hasta, Ashwini, Pushya, Rohini, Uttaras, Shravana | Wednesday, Saturday, Thursday | **Wednesday (Mercury)** favored for precision technological minerals. |
| **Mineral Lease Claim** | *Sthira / Fixed* | Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada | Thursday, Sunday, Saturday | **Upward or Sideways** orientation for sovereign registration. |