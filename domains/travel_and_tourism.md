### Domain: Travel, Tourism & Logistics (`DOM_TRAVEL_TOURISM`)

In classical electional astrology (*Muhurta Chintamani*, *Kalaprakashika*, *Yatra Prakash*), travel and movement map directly to the specialized branch of **Yatra Muhurta**.

Travel rules in classical texts are exceptionally detailed because movement through physical space involves specific planetary vectors, facing orientations, and directional prohibitions (*Disha Shoola*).

For modern travel and tourism applications, activities are split into four core functional categories:

1. **Short-Distance / Business Travel (`Chara` / Movable):** Inter-city flights, business trips, and daily commutes.
2. **Long-Distance / International Relocation (`Sthira` + `Chara` / Dual):** Overseas moves, immigration, long-term postings, and transoceanic flights.
3. **Pilgrimage & Spiritual Journeys (`Mridu` / Gentle & `Purna` / Fullness):** Religious yatras, spiritual retreats, and sacred visits.
4. **Vehicular Consecration & Fleet Operations (`Tiryakamukhi` / Sideways):** Purchasing vehicles, inaugural road trips, and logistics fleet deployment.

---

### 1. Travel & Tourism Domain Taxonomy

#### Sub-Domain 1: Business & Short-Haul Journeys

* `ACT_TRV_SHORT_BUSINESS`: Domestic flights, inter-city train travel, and corporate business trips (*Chara/Movable*).


* `ACT_TRV_COMMUTING_LOGISTICS`: Transporting commercial goods, courier dispatch, or logistics routing.

#### Sub-Domain 2: Long-Distance & International Relocation

* `ACT_TRV_INTERNATIONAL_RELOCATION`: Overseas travel, permanent immigration, or long-term international assignments (*Chara/Movable*).


* `ACT_TRV_CRUISE_OCEAN`: Maritime travel, cruises, and transoceanic voyages (*Jala Tattva / Water Signs*).

#### Sub-Domain 3: Pilgrimage & Leisure Tourism

* `ACT_TRV_PILGRIMAGE_YATRA`: Religious tours, temple visits, and spiritual retreats (*Mridu/Gentle*).


* `ACT_TRV_LEISURE_VACATION`: Family holidays, adventure tourism, and recreational travel (*Mridu/Chara*).



#### Sub-Domain 4: Vehicle Purchase & First Driving

* `ACT_TRV_VEHICLE_PURCHASE`: Buying cars, two-wheelers, or commercial vehicles (*Chara/Tiryakamukhi*).


* `ACT_TRV_INAUGURAL_DRIVE`: First driving session of a new vehicle or road trip deployment.



---

### 2. Directional Prohibitions (*Disha Shoola*) Matrix

In *Yatra Muhurta*, traveling in a specific cardinal direction on an incompatible weekday creates **Disha Shoola** (directional affliction) and must be avoided or mitigated:

| Direction of Travel | Incompatible Weekdays (*Disha Shoola*) | Classical Remedial Override (*Parihara*) |
| --- | --- | --- |
| **East** | Sunday, Monday | Consume ghee / dairy before departure |
| **West** | Sunday, Friday | Consume jaggery / sweets before departure |
| **North** | Tuesday, Wednesday | Consume milk / sesame seeds before departure |
| **South** | Thursday | Consume mustard / fenugreek before departure |

---

### 3. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_TRV_INTERNATIONAL_RELOCATION",
    "activity_name": "International Travel / Permanent Relocation",
    "domain": "DOM_TRAVEL_TOURISM",
    "sub_domain": "SUB_LONG_DISTANCE_RELOCATION",
    "intent": "Safe transit, hassle-free immigration, smooth settling, long-term prosperity abroad",
    "baseline_constraints": {
      "functional_group": "Chara / Chala (Movable)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "ASHWINI", "PUSHYA"
      ],
      "preferred_weekdays": ["FRI", "WED", "THU", "MON"],
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
        "code": "DISHA_SHOOLA_ACTIVE",
        "description": "Weekday directly conflicts with destination cardinal direction"
      },
      {
        "code": "RAHU_KALAM_ACTIVE",
        "description": "Rahu Kalam active during flight takeoff / departure time"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_ABHIJIT_DISHA_CANCEL",
        "if_afflicted_by": "RAHU_KALAM_ACTIVE",
        "neutralized_by": ["ABHIJIT_MUHURTA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  },
  {
    "activity_id": "ACT_TRV_VEHICLE_PURCHASE",
    "activity_name": "Purchasing Personal or Commercial Vehicle",
    "domain": "DOM_TRAVEL_TOURISM",
    "sub_domain": "SUB_VEHICLE_OPERATIONS",
    "intent": "Accident-free driving, mechanical longevity, smooth mobility, asset protection",
    "baseline_constraints": {
      "functional_group": "Chara (Movable) & Kshipra (Swift)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "ASHWINI", "PUSHYA", "ROHINI"
      ],
      "preferred_weekdays": ["THU", "FRI", "WED", "SUN"],
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
    "activity_id": "ACT_TRV_PILGRIMAGE_YATRA",
    "activity_name": "Pilgrimage / Sacred Temple Yatra",
    "domain": "DOM_TRAVEL_TOURISM",
    "sub_domain": "SUB_PILGRIMAGE_LEISURE",
    "intent": "Spiritual fulfillment, obstacle-free journey, divine grace, safe return",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle) & Sthira (Spiritual Foundation)",
      "allowed_tithi_groups": ["PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI", "PUSHYA", "SHRAVANA"
      ],
      "preferred_weekdays": ["THU", "MON", "WED", "SUN"],
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
        "description": "Jupiter Combust (Asta Guru) - Prohibited for major pilgrimages/yatras"
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

### 4. Travel Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Directional Rules |
| --- | --- | --- | --- | --- |
| **International Travel** | *Chara / Movable*<br> | Swati, Punarvasu, Shravana, Shatabhisha, Hasta

 | Friday, Wednesday, Thursday, Monday

 | Avoid departure during **Rahu Kalam** or active **Disha Shoola**.

 |
| **Vehicle Purchase** | *Chara / Kshipra*<br> | Swati, Punarvasu, Dhanishtha, Hasta, Pushya, Rohini

 | Thursday, Friday, Wednesday, Sunday

 | Requires **Tiryakamukhi (Sideways)** orientation.

 |
| **Pilgrimage / Yatra** | *Mridu / Gentle*<br> | Mrigashira, Chitra, Anuradha, Revati, Pushya

 | Thursday, Monday, Wednesday, Sunday

 | **Combust Jupiter (Asta Guru)** is a hard blocker.

 |
| **Domestic Business Trip** | *Kshipra / Swift*<br> | Hasta, Ashwini, Pushya, Swati

 | Wednesday, Thursday, Monday

 | *Abhijit Muhurta* overrides minor daily flaws.

 |