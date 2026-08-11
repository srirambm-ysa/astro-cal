### Domain: Personal, Family & Sacramental Life Rites (`DOM_SAMSKARAS`)

In classical electional astrology (*Muhurta Chintamani*, *Samskara Ganapati*, *Nirnaya Sindhu*, *Kalaprakashika*), personal and family rites—known as **Samskaras**—form the foundational bedrock of classical *Muhurta*. These 16 essential life sacraments encompass every developmental stage of human life, from prenatal rites to spiritual initiation, marriage, and household establishment.

The primary planetary lords and constitutional factors for Samskaras are:

* **Jupiter (Brihaspati):** Chief significator of spiritual grace, wisdom, marriage longevity, children, and ritual purity (*Guru*).
* **Venus (Shukra):** Governs conjugal harmony, marital happiness, reproductive vitality, aesthetic ceremonies, and fine arts (*Shukra*).
* **Moon (Chandra):** Governs psychological stability, emotional bonding, maternal health, and early childhood nutrition.
* **Sun (Surya):** Governs life vitality, spiritual lineage, paternal blessings, and authority (*Pitru Karaka*).

---

### 1. Personal & Family Samskaras Taxonomy

#### Sub-Domain 1: Prenatal & Childcare Sacraments (*Purva Samskaras*)

* `ACT_SAM_GARBHADHANA`: Conception / Sacramental union for progeny (*Garbhadhana*).
* `ACT_SAM_PU MSAVANA_SEEMANTA`: Protection of the fetus and baby shower rites (*Pumsavana & Seemantonnayana*).
* `ACT_SAM_NAMAKARANA`: Naming ceremony for the newborn (*Namakarana*).
* `ACT_SAM_ANNAPRASHANA`: First solid food feeding rite (*Annaprashana*).
* `ACT_SAM_KARNAVEDHA`: Ear piercing sacrament for health and subtle energy channels (*Karnavedha*).
* `ACT_SAM_CHUDAKARANA`: First haircut / Tonsure ceremony (*Chudakarana / Chaula*).

#### Sub-Domain 2: Educational & Spiritual Initiation (*Vidyarambha & Upanayana*)

* `ACT_SAM_UPANAYANA`: Sacred thread ceremony / Formal spiritual initiation into study (*Upanayana*).
* `ACT_SAM_VEDARAMBHA`: Commencement of sacred study, scriptural learning, or mantle assumption.

#### Sub-Domain 3: Nuptial & Family Union (*Vivaha*)

* `ACT_SAM_VIVAHA_MARRIAGE`: Marriage ceremony / Sacramental wedding union (*Vivaha*).
* `ACT_SAM_ENGAGEMENT_VALAYAPATTI`: Formal betrothal, ring exchange, or alliance confirmation.

#### Sub-Domain 4: Householder Rites & Vows (*Grihastha*)

* `ACT_SAM_AGNIHOTRA_HAVAN`: Consecrating family sacred fires, major home Havans, or Pujas.
* `ACT_SAM_VRATA_INITIATION`: Initiating long-term spiritual vows, pilgrimages, or disciplined fasts.

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_SAM_VIVAHA_MARRIAGE",
    "activity_name": "Sacramental Marriage Ceremony (Vivaha)",
    "domain": "DOM_SAMSKARAS",
    "sub_domain": "SUB_NUPTIAL_UNION",
    "intent": "Conjugal harmony, marital longevity, mutual prosperity, health of offspring, lineage dignity",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle), Sthira (Fixed) & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA", "BHADRA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "MRIGASHIRA", "ANURADHA", "REVATI", "HASTA", "SWATI", "MAGHA"
      ],
      "preferred_weekdays": ["THU", "FRI", "WED", "MON"],
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
        "code": "ASTA_GURU_ACTIVE",
        "description": "Jupiter Combust (Asta Guru) - Absolute hard blocker for Vivaha"
      },
      {
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra) - Absolute hard blocker for Vivaha"
      },
      {
        "code": "LATTA_DOSHA_ACTIVE",
        "description": "Planetary kick / Latta affliction on the marriage Nakshatra"
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
    "activity_id": "ACT_SAM_UPANAYANA",
    "activity_name": "Sacred Thread Ceremony & Spiritual Initiation (Upanayana)",
    "domain": "DOM_SAMSKARAS",
    "sub_domain": "SUB_EDUCATIONAL_INITIATION",
    "intent": "Intellectual illumination, scriptural retention, moral discipline, spiritual protection",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift) & Mridu / Maitra (Gentle)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "MRIGASHIRA", "ANURADHA", "REVATI", "CHITRA"
      ],
      "preferred_weekdays": ["THU", "WED", "SUN", "FRI"],
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
        "description": "Jupiter Combust (Asta Guru) - Absolute hard blocker for Upanayana"
      },
      {
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra) - Absolute hard blocker for Upanayana"
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
    "activity_id": "ACT_SAM_ANNAPRASHANA",
    "activity_name": "First Solid Food Feeding Ceremony (Annaprashana)",
    "domain": "DOM_SAMSKARAS",
    "sub_domain": "SUB_PRENATAL_CHILDCARE",
    "intent": "Digestive health, physical immunity, longevity, graceful speech development",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra & Kshipra / Laghu",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA", "BHADRA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "HASTA", "ASHWINI", "PUSHYA", "ROHINI", "SHRAVANA", "SWATI"
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

### 3. Personal & Family Samskaras Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Vivaha (Marriage)** | *Mridu / Sthira / Purna* | Rohini, Uttaras, Mrigashira, Anuradha, Revati, Hasta, Swati, Magha | Thursday, Friday, Wednesday, Monday | **Combust Jupiter (Asta Guru)** or **Venus (Asta Shukra)** are absolute hard blockers. |
| **Upanayana (Sacred Thread)** | *Kshipra / Mridu* | Hasta, Ashwini, Pushya, Rohini, Uttaras, Mrigashira, Revati | Thursday, Wednesday, Sunday, Friday | Must occur in **Uttarayana** (Sun's northern transit); combust Guru/Shukra strictly blocked. |
| **Annaprashana (First Feeding)** | *Mridu / Kshipra* | Mrigashira, Chitra, Anuradha, Revati, Hasta, Ashwini, Pushya | Monday, Wednesday, Thursday, Friday | Performed in **even months for boys** (6th, 8th month) and **odd months for girls** (5th, 7th month). |
| **Namakarana (Naming Rites)** | *Mridu / Sthira* | Anuradha, Rohini, Uttaras, Revati, Hasta, Pushya | Monday, Wednesday, Thursday, Friday | Performed usually on the **11th or 12th day** after birth. |