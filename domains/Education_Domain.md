### Domain: Education, Skill Acquisition & Academics (`DOM_EDUCATION`)

In classical electional astrology (*Muhurta Chintamani*, *Vidyamadhaveeyam*), educational endeavors are categorized under the umbrella of **Vidyarambha** (initiation of learning), **Aksharambha** (learning letters/script), and **Shilpa/Kala** (technical skills, crafts, and fine arts).

The primary planetary governor for education is **Jupiter (Brihaspati)** for higher knowledge, philosophy, and law, **Mercury (Budha)** for mathematics, coding, analytics, and writing, and **Venus (Shukra)** for fine arts, design, and practical crafts.

---

### 1. Education Domain Taxonomy

#### Sub-Domain 1: Foundational & Early Learning

* `ACT_EDU_VIDYARAMBHA`: Formal initiation of education / first schooling (*Vidyarambha*).


* `ACT_EDU_AKSHARAMBHA`: Teaching letters, reading, and writing (*Aksharambha*).



#### Sub-Domain 2: Higher Studies & Advanced Research

* `ACT_EDU_HIGHER_STUDIES`: Enrolling in universities, master's/doctoral programs, or research degrees.
* `ACT_EDU_COMPETITIVE_EXAM`: Appearing for competitive entrance exams, board certifications, or bar exams (*Kshipra/Jaya*).



#### Sub-Domain 3: Technical, Vocational & STEM Training

* `ACT_EDU_STEM_TECHNICAL`: Commencing software engineering, data science, mechanics, or medical studies (*Kshipra/Chara*).


* `ACT_EDU_VOCATIONAL_CRAFTS`: Learning technical crafts, architecture, sculpting, or manufacturing (*Shilpa*).



#### Sub-Domain 4: Fine Arts, Music & Performing Arts

* `ACT_EDU_FINE_ARTS_MUSIC`: Starting formal training in vocal/instrumental music, dance, or fine arts (*Mridu/Gentle*).


* `ACT_EDU_DEBUT_PERFORMANCE`: First public performance, recital, or art exhibition (*Arangetram*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_EDU_VIDYARAMBHA",
    "activity_name": "Initiation of Learning / First Schooling (Vidyarambha)",
    "domain": "DOM_EDUCATION",
    "sub_domain": "SUB_FOUNDATIONAL_LEARNING",
    "intent": "Cognitive development, retention, academic success, Saraswati grace",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle) & Kshipra / Laghu (Swift)",
      "allowed_tithi_groups": ["NANDA", "BHADRA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI", "PUNARVASU", "SWATI"
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
        "description": "Bhadra active in Mrityu Loka (Earth)",
        "bypass_rule": "BHADRA_PUCHHA_PHASE"
      },
      {
        "code": "ASTA_GURU_ACTIVE",
        "description": "Jupiter Combust (Asta Guru) - Highly detrimental for education initiation"
      },
      {
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra)"
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
    "activity_id": "ACT_EDU_STEM_TECHNICAL",
    "activity_name": "STEM, Software Coding & Engineering Skill Acquisition",
    "domain": "DOM_EDUCATION",
    "sub_domain": "SUB_TECHNICAL_STEM",
    "intent": "Analytical logic, technical proficiency, problem-solving, system mastery",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift) & Chara / Movable (Dynamic)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "SWATI"
      ],
      "preferred_weekdays": ["WED", "SAT", "THU"],
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
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active"
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
    "activity_id": "ACT_EDU_FINE_ARTS_MUSIC",
    "activity_name": "Initiation in Fine Arts, Vocal/Instrumental Music & Dance",
    "domain": "DOM_EDUCATION",
    "sub_domain": "SUB_ARTS_AND_CULTURE",
    "intent": "Aesthetic mastery, creative expression, vocal/rhythmic fluency",
    "baseline_constraints": {
      "functional_group": "Mridu / Maitra (Gentle / Soft)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "BHADRA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "HASTA", "ROHINI"
      ],
      "preferred_weekdays": ["FRI", "WED", "THU"],
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
        "code": "ASTA_SHUKRA_ACTIVE",
        "description": "Venus Combust (Asta Shukra) - Severe blocker for fine arts/music"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_AMRITA_SIDDHI_CANCEL",
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

### 3. Education Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Vidyarambha / Primary Schooling** | *Mridu / Kshipra*<br> | Hasta, Ashwini, Pushya, Mrigashira, Revati

 | Wednesday, Thursday, Friday

 | **Combust Jupiter (Asta Guru) or Venus** strictly prohibited.

 |
| **STEM & Coding Education** | *Kshipra / Chara*<br> | Hasta, Pushya, Shravana, Shatabhisha, Swati

 | Wednesday, Saturday, Thursday

 | Wednesday (Mercury) and Saturday (Saturn logic) favored.

 |
| **Fine Arts & Music Training** | *Mridu / Soft*<br> | Mrigashira, Chitra, Anuradha, Revati, Rohini

 | Friday, Wednesday, Thursday

 | **Combust Venus (Asta Shukra)** is a hard blocker.

 |
| **Competitive Exam Sitting** | *Jaya / Kshipra*<br> | Ashwini, Hasta, Pushya, Abhijit

 | Sunday, Tuesday, Thursday

 | *Abhijit Muhurta* overrides minor daily flaws.

 |