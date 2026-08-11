### Domain: Government, Public Sector & Civil Services (`DOM_GOVERNMENT_PUBLIC`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Vidyamadhaveeyam*), statecraft, civic governance, public administration, and sovereign affairs map directly to the traditional concepts of **Rajyabhisheka / Pattabhisheka** (coronation, assuming public office, and taking oaths), **Niyama / Sasana** (promulgating laws, issuing executive decrees, and policy enforcement), and **Raja Seva** (entering state service, public appointments, and diplomatic missions).

The primary planetary governors for this domain are:

* **Sun (Surya):** Governs sovereign power, executive authority, government institutions, state leadership, and official decrees.


* **Jupiter (Brihaspati):** Governs judiciary, constitutional law, public policy, ethics, and legislative governance.


* **Mars (Mangala):** Governs defense, law enforcement, military affairs, public security, and infrastructure execution.


* **Saturn (Shani):** Governs civil services, public administration, labor relations, civic infrastructure, and municipal governance.



---

### 1. Government & Public Services Taxonomy

#### Sub-Domain 1: Executive Office, Appointments & Oaths

* `ACT_GOV_TAKING_OATH`: Assuming public office, taking oath of office, or sworn-in ceremonies (*Sthira / Urdhvamukhi*).


* `ACT_GOV_DIPLOMATIC_MISSION`: Appointing ambassadors, diplomatic envoys, or international bilateral summits (*Mridu / Chara*).



#### Sub-Domain 2: Public Policy, Legislation & Executive Orders

* `ACT_GOV_POLICY_GAZETTE_RELEASE`: Promulgating new legislation, issuing executive gazette notifications, or regulatory policies (*Sthira / Fixed*).


* `ACT_GOV_TENDER_INFRA_LAUNCH`: Floating major government tenders, public infrastructure projects, or civic works (*Sthira / Downward*).



#### Sub-Domain 3: Civil Services & Public Sector Onboarding

* `ACT_GOV_CIVIL_SERVICE_JOINING`: Onboarding into civil services, public administration, or government departments (*Kshipra / Sthira*).


* `ACT_GOV_TAX_REGULATORY_SCHEME`: Launching national tax schemes, public welfare programs, or amnesty drives (*Purna / Fullness*).



#### Sub-Domain 4: Defense, Security & Law Enforcement

* `ACT_GOV_DEFENSE_DEPLOYMENT`: Commissioning defense hardware, military deployments, or law enforcement drives (*Tikshna / Ugra*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_GOV_TAKING_OATH",
    "activity_name": "Assuming Public Office / Swearing-in Ceremony (Rajyabhisheka)",
    "domain": "DOM_GOVERNMENT_PUBLIC",
    "sub_domain": "SUB_EXECUTIVE_OFFICE",
    "intent": "Political stability, executive authority, public trust, long tenure, state protection",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Purna (Fullness)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "PUSHYA", "HASTA", "ANURADHA", "ABHIJIT"
      ],
      "preferred_weekdays": ["SUN", "THU", "MON"],
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
        "code": "EIGHTH_HOUSE_OCCUPIED",
        "description": "Eighth house of Muhurta Lagna occupied by malefic planets (Induces political scandal or sudden fall)"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (Risk of constitutional crisis or rebellion)"
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
    "activity_id": "ACT_GOV_POLICY_GAZETTE_RELEASE",
    "activity_name": "Promulgating Laws / Gazette Notifications / Executive Orders",
    "domain": "DOM_GOVERNMENT_PUBLIC",
    "sub_domain": "SUB_PUBLIC_POLICY",
    "intent": "Legal permanence, public compliance, smooth implementation, policy longevity",
    "baseline_constraints": {
      "functional_group": "Sthira / Fixed & Kshipra / Swift",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "HASTA", "PUSHYA", "SHRAVANA"
      ],
      "preferred_weekdays": ["SUN", "THU", "WED"],
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
        "code": "ASTA_GURU_ACTIVE",
        "description": "Jupiter Combust (Asta Guru) - Detrimental for statutory law & constitutional policy"
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
    "activity_id": "ACT_GOV_CIVIL_SERVICE_JOINING",
    "activity_name": "Onboarding into Civil Services / Public Sector Duty (Raja Seva)",
    "domain": "DOM_GOVERNMENT_PUBLIC",
    "sub_domain": "SUB_CIVIL_SERVICES",
    "intent": "Career longevity, administrative efficiency, promotion prospects, public welfare",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift execution) & Sthira (Stability)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "SHRAVANA"
      ],
      "preferred_weekdays": ["SUN", "THU", "MON", "WED"],
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
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
      },
      {
        "code": "RAHU_KALAM_ACTIVE",
        "description": "Rahu Kalam active during official joining"
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_ABHIJIT_CANCEL",
        "if_afflicted_by": "RAHU_KALAM_ACTIVE",
        "neutralized_by": ["ABHIJIT_MUHURTA"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 15
      }
    ]
  }
]

```

---

### 3. Government & Public Services Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Swearing-in / Taking Oath** | *Sthira / Purna*<br> | Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada, Pushya

 | Sunday, Thursday, Monday

 | **8th House malefic occupation** is a hard blocker (prevents sudden scandal/fall).

 |
| **Gazette / Policy Release** | *Sthira / Kshipra*<br> | Rohini, Uttaras, Hasta, Pushya, Shravana

 | Sunday, Thursday, Wednesday

 | **Combust Jupiter (Asta Guru)** is a hard blocker for constitutional policies.

 |
| **Civil Service Onboarding** | *Kshipra / Sthira*<br> | Hasta, Ashwini, Pushya, Rohini, Uttaras, Shravana

 | Sunday, Thursday, Monday, Wednesday

 | **Sunday (Sun)** strongly favored for government appointment (*Raja Seva*).

 |
| **Defense Deployment** | *Tikshna / Ugra*<br> | Bharani, Krittika, Ardra, Jyeshtha, Moola

 | Tuesday, Sunday

 | **Mars Hora** favored for security, military hardware commissioning, and enforcement.

 |