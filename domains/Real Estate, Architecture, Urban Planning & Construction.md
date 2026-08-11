### Domain: Real Estate, Architecture, Urban Planning & Construction (`DOM_REAL_ESTATE_CONSTRUCTION`)

In classical electional astrology (*Muhurta Chintamani*, *Vastu Rajavallabha*, *Brihat Samhita*, *Kalaprakashika*), real estate, architectural design, ground preparation, structural construction, and residential occupancy form one of the most thoroughly documented domains. They map to the core classical principles of **Vastu Purusha Mandala**, **Bhoomi Pujan / Khanana** (earth consecration and excavation), **Griha Arambha / Stambha Ropana** (foundation laying and pillar erection), **Dwara Sthapana** (doorframe placement), **Shila / Chhat Sthapana** (roof casting), and **Griha Pravesha** (housewarming/occupancy).

The primary planetary lords and directional vectors for this domain are:

* **Saturn (Shani):** Chief significator of land, foundation depth, structural stability, building materials (concrete, iron, stone), and long-term durability.
* **Mars (Mangala):** Ruler of real estate transactions, land ownership (*Bhoomi Karaka*), excavation, masonry, structural engineering, and construction machinery.
* **Sun (Surya) & Venus (Shukra):** Govern architectural aesthetics, interior design, lighting, structural facing orientations, and domestic comfort.
* **Jupiter (Brihaspati):** Governs sanctification, legal titles, Vastu alignment, and auspicious family occupancy (*Griha Pravesha*).

---

### 1. Real Estate & Construction Taxonomy

#### Sub-Domain 1: Site Acquisition, Surveying & Vastu Planning

* `ACT_REAL_LAND_PURCHASE`: Buying land, plots, or commercial real estate titles (*Sthira / Fixed*).
* `ACT_REAL_VASTU_SURVEY`: Site orientation mapping, soil testing, Vastu layout finalizing, and boundary marking (*Kshipra / Sideways*).

#### Sub-Domain 2: Earth Consecration, Groundbreaking & Foundation

* `ACT_REAL_BHOOMI_PUJAN`: Groundbreaking ceremony and earth sanctification (*Sthira / Adhomukhi*).
* `ACT_REAL_FOUNDATION_PILLAR`: Excavation, laying foundation stones, or driving structural piles (*Sthira / Downward*).
* `ACT_REAL_WELL_BOREWELL_DIG`: Digging borewells, underground water tanks, or basements (*Jala Signs / Downward*).

#### Sub-Domain 3: Structural Superstructure & Renovation

* `ACT_REAL_DOORFRAME_PLACEMENT`: Setting main doorframes (*Dwara Sthapana*) and structural archways (*Sthira / Upward*).
* `ACT_REAL_ROOF_SLAB_CASTING`: Casting concrete roof slabs, structural beams, or upper-floor framing (*Sthira / Upward*).
* `ACT_REAL_DEMOLITION_REMOVAL`: Tearing down old structures, clearing debris, or site clearance (*Tikshna / Ugra*).

#### Sub-Domain 4: Occupancy, Interior & Commercial Leasing

* `ACT_REAL_GRIHA_PRAVESHA_NEW`: Entering a newly constructed residential house or villa (*Sthira / Purna*).
* `ACT_REAL_GRIHA_PRAVESHA_OLD`: Re-entering a renovated or rented home after travel or repair (*Chara / Movable*).
* `ACT_REAL_LEASE_AGREEMENT_SIGN`: Signing commercial leases, tenant agreements, or rental deeds (*Kshipra / Laghu*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_REAL_BHOOMI_PUJAN",
    "activity_name": "Groundbreaking & Earth Sanctification (Bhoomi Pujan)",
    "domain": "DOM_REAL_ESTATE_CONSTRUCTION",
    "sub_domain": "SUB_GROUNDBREAKING_FOUNDATION",
    "intent": "Vastu harmony, structural safety, worker protection, completion without cost overruns",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Adhomukhi (Downward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "MRIGASHIRA", "HASTA", "CHITRA"
      ],
      "preferred_weekdays": ["MON", "WED", "THU", "FRI"],
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
        "code": "SANKRANTI_DAY_ACTIVE",
        "description": "Solar Transit / Sankranti day active (Prohibited for groundbreaking)"
      },
      {
        "code": "VASTU_SUAPTA_PERIOD",
        "description": "Vastu Purusha sleeping state / inactive directional quadrant"
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
    "activity_id": "ACT_REAL_GRIHA_PRAVESHA_NEW",
    "activity_name": "New Housewarming & First Residential Occupancy (Griha Pravesha)",
    "domain": "DOM_REAL_ESTATE_CONSTRUCTION",
    "sub_domain": "SUB_OCCUPANCY_LEASING",
    "intent": "Family harmony, physical health, prosperity, permanent residency peace",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "MRIGASHIRA", "REVATI", "PUSHYA", "SHRAVANA"
      ],
      "preferred_weekdays": ["THU", "MON", "WED", "FRI"],
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
        "code": "ASTA_GURU_ACTIVE",
        "description": "Jupiter Combust (Asta Guru) - Absolute hard blocker for new Griha Pravesha"
      },
      {
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra) - Absolute hard blocker for new Griha Pravesha"
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
    "activity_id": "ACT_REAL_ROOF_SLAB_CASTING",
    "activity_name": "Casting Roof Slabs / Structural Beam Placement",
    "domain": "DOM_REAL_ESTATE_CONSTRUCTION",
    "sub_domain": "SUB_STRUCTURAL_SUPERSTRUCTURE",
    "intent": "Structural safety, leak prevention, resistance to seismic forces, long ceiling life",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Urdhvamukhi (Upward-facing)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "ANURADHA", "HASTA", "PUSHYA", "DHANISHTHA"
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
        "description": "Bhadra active in Mrityu Loka (Earth)"
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
  }
]

```

---

### 3. Real Estate & Construction Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Bhoomi Pujan (Groundbreaking)** | *Sthira / Downward* | Rohini, Uttaras, Anuradha, Mrigashira, Hasta, Chitra | Monday, Wednesday, Thursday, Friday | **Downward (Adhomukhi)** orientation required; **Sankranti days** strictly blocked. |
| **Griha Pravesha (New House)** | *Sthira / Purna* | Rohini, Uttaras, Anuradha, Mrigashira, Revati, Pushya | Thursday, Monday, Wednesday, Friday | **Combust Jupiter (Asta Guru)** or **Combust Venus** are absolute hard blockers. |
| **Roof Slab Casting** | *Sthira / Upward* | Rohini, Uttaras, Anuradha, Hasta, Pushya, Dhanishtha | Wednesday, Thursday, Friday, Monday | **Upward (Urdhvamukhi)** facing orientation required. |
| **Well / Borewell Digging** | *Jala / Downward* | Revati, Rohini, Uttaras, Pushya, Anuradha, Hasta | Monday, Wednesday, Thursday, Friday | Must align with **Jala Tattva (Water Signs)** for high water table. |