### Domain: Media, Entertainment, Publishing & Creative Arts (`DOM_MEDIA_CREATIVE`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), media production, public artistic releases, literature, and broadcast communications map to traditional concepts of **Kala / Shilpa** (fine arts, craftsmanship, performance), **Aksharambha / Kavya** (literary creation and publishing), and **Vyapararambha / Chara** (distribution, broadcasting, and public circulation).

The primary planetary influences for this domain are:

* **Venus (Shukra):** Governs aesthetics, cinema, music, design, visual beauty, and mass entertainment.


* **Mercury (Budha):** Governs scripts, journalism, podcasts, publishing, digital media, and broadcasting.


* **Jupiter (Brihaspati) & Moon (Chandra):** Govern public reach, intellectual content, and widespread audience appeal.



---

### 1. Media & Creative Domain Taxonomy

#### Sub-Domain 1: Film, Video & Television Production

* `ACT_MEDIA_FILM_SHOOT_START`: Principal photography / film shoot commencement (*Sthira/Chara*).


* `ACT_MEDIA_FILM_THEATRICAL_RELEASE`: Movie premiere or theatrical release (*Chara/Public Reach*).



#### Sub-Domain 2: Digital Content, Streaming & Broadcasting

* `ACT_MEDIA_STREAMING_RELEASE`: OTT platform release, web series launch, or digital premiere (*Kshipra/Chara*).


* `ACT_MEDIA_PODCAST_YOUTUBE_LAUNCH`: Launching a podcast channel, YouTube show, or digital series (*Kshipra/Laghu*).



#### Sub-Domain 3: Publishing, Writing & Journalism

* `ACT_MEDIA_BOOK_PUBLISHING`: Book release, e-book publication, or major journalistic publication (*Mridu/Purna*).


* `ACT_MEDIA_SCRIPT_SUBMISSION`: Submitting screenplays, manuscripts, or creative pitches to agencies (*Kshipra/Swift*).



#### Sub-Domain 4: Music, Performance & Fashion

* `ACT_MEDIA_ALBUM_RELEASE`: Music album / single drop (*Mridu/Tender*).


* `ACT_MEDIA_FASHION_SHOW`: Fashion show, design launch, or brand exhibition (*Mridu/Venus*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_MEDIA_FILM_THEATRICAL_RELEASE",
    "activity_name": "Theatrical Movie Premiere / Major OTT Release",
    "domain": "DOM_MEDIA_CREATIVE",
    "sub_domain": "SUB_FILM_AND_TV",
    "intent": "Box office success, widespread public adoption, critical acclaim, media virality",
    "baseline_constraints": {
      "functional_group": "Chara / Movable (Broad reach) & Mridu / Maitra (Aesthetics)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI"
      ],
      "preferred_weekdays": ["FRI", "THU", "WED"],
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
        "description": "Venus Combust (Asta Shukra) - Severe blocker for major entertainment/film releases"
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
    "activity_id": "ACT_MEDIA_PODCAST_YOUTUBE_LAUNCH",
    "activity_name": "Digital Series / Podcast / YouTube Channel Launch",
    "domain": "DOM_MEDIA_CREATIVE",
    "sub_domain": "SUB_DIGITAL_BROADCAST",
    "intent": "Audience engagement, high subscriber conversion, viral reach, clear communication",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift execution) & Chara (Network expansion)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "SWATI", "SHRAVANA", "SHATABHISHA", "PUNARVASU"
      ],
      "preferred_weekdays": ["WED", "FRI", "THU"],
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
        "description": "Vyatipata Nitya Yoga active (Risk of copyright disputes / channel strike)"
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
    "activity_id": "ACT_MEDIA_BOOK_PUBLISHING",
    "activity_name": "Book Publication / Manuscript Release",
    "domain": "DOM_MEDIA_CREATIVE",
    "sub_domain": "SUB_PUBLISHING_WRITING",
    "intent": "Literary impact, critical acclaim, commercial success, long-term readership",
    "baseline_constraints": {
      "functional_group": "Mridu (Tender) & Sthira (Longevity)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI", "ROHINI", "UTTARA_PHALGUNI", "HASTA"
      ],
      "preferred_weekdays": ["WED", "THU", "FRI"],
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
        "description": "Jupiter Combust (Asta Guru) - Detrimental for literary / scholarly publishing"
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

### 3. Media & Creative Domain Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Film Theatrical Release** | *Chara / Mridu*<br> | Swati, Punarvasu, Shravana, Anuradha, Revati, Rohini

 | Friday, Thursday, Wednesday

 | **Combust Venus (Asta Shukra)** is a hard blocker.

 |
| **Podcast / YouTube Launch** | *Kshipra / Chara*<br> | Hasta, Ashwini, Pushya, Shatabhisha, Swati

 | Wednesday, Friday, Thursday

 | **Vyatipata Yoga** blocked (prevents channel strikes/takedowns).

 |
| **Book / Manuscript Release** | *Mridu / Sthira*<br> | Mrigashira, Chitra, Anuradha, Revati, Rohini

 | Wednesday, Thursday, Friday

 | **Combust Jupiter (Asta Guru)** is a hard blocker.

 |
| **Album / Music Single Drop** | *Mridu / Soft*<br> | Mrigashira, Chitra, Anuradha, Revati, Rohini

 | Friday, Wednesday

 | Friday (Venus) strongly favored for audio success.

 |