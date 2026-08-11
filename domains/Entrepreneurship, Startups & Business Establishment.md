### Domain: Entrepreneurship, Startups & Business Establishment (`DOM_STARTUPS`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*), founding a new enterprise, launching a business, or establishing a commercial venture maps to the traditional concepts of **Karyarambha** (commencement of significant work), **Vyapararambha** (initiation of trade/commerce), and **Rajyabhisheka / Pattabhisheka** (assuming leadership, sovereignty, and authority).

For startups and new ventures, the rules are split based on the **core nature of the venture**:

1. **SaaS / Tech / High-Growth Startups (`Chara` / Movable):** Requires rapid scaling, market expansion, global network connectivity, and agility.


2. **Brick-and-Mortar / Manufacturing / Franchise (`Sthira` / Fixed):** Requires long-term physical stability, infrastructure safety, capital preservation, and asset retention.


3. **Funding Rounds & Equity Capital (`Purna` / Fullness):** Focused on investor trust, valuation preservation, and financial liquidity.



---

### 1. Entrepreneurship & Startup Taxonomy

#### Sub-Domain 1: Company Incorporation & Equity Architecture

* `ACT_STARTUP_INCORPORATION`: Legal incorporation / entity registration (LLC, C-Corp, Pvt Ltd) (*Sthira/Fixed*).


* `ACT_STARTUP_EQUITY_CAPTABLE`: Executing founder vesting agreements, cap table allocations, or partner agreements (*Mridu/Purna*).



#### Sub-Domain 2: Product Launch & Go-To-Market (GTM)

* `ACT_STARTUP_BETA_LAUNCH`: Releasing early-access / private beta software to users (*Kshipra/Laghu*).


* `ACT_STARTUP_PUBLIC_LAUNCH`: Public product reveal, Press Release, or Product Hunt launch (*Chara/Movable*).



#### Sub-Domain 3: Venture Capital, Fundraising & Treasury

* `ACT_STARTUP_PITCH_TERM_SHEET`: Pitching key institutional investors or signing term sheets (*Jaya/Kshipra*).


* `ACT_STARTUP_BANK_CAPITAL_DEPOSIT`: Opening corporate treasury accounts or depositing major seed/venture funds (*Sthira/Fixed*).



#### Sub-Domain 4: Commercial Facilities & Retail Establishments

* `ACT_STARTUP_OFFICE_OPENING`: Commercial office inauguration, ribbon cutting, or factory setup (*Sthira/Urdhvamukhi*).



---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_STARTUP_INCORPORATION",
    "activity_name": "Entity Incorporation / Company Founding",
    "domain": "DOM_STARTUPS",
    "sub_domain": "SUB_ENTITY_FOUNDING",
    "intent": "Corporate permanence, brand integrity, legal entity longevity, equity protection",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Kshipra (Swift)",
      "allowed_tithi_groups": ["NANDA", "PURNA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "HASTA", "ASHWINI", "PUSHYA"
      ],
      "preferred_weekdays": ["THU", "WED", "SUN", "MON"],
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
        "code": "YAMA_GHANTA_ACTIVE",
        "description": "Yama Ghanta Yoga active"
      },
      {
        "code": "VYATIPATA_YOGA_ACTIVE",
        "description": "Vyatipata Nitya Yoga active (High risk of internal split/co-founder dispute)"
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
    "activity_id": "ACT_STARTUP_PUBLIC_LAUNCH",
    "activity_name": "Public Product Go-To-Market / Commercial Launch",
    "domain": "DOM_STARTUPS",
    "sub_domain": "SUB_PRODUCT_GTM",
    "intent": "Virality, rapid user adoption, global reach, market disruption",
    "baseline_constraints": {
      "functional_group": "Chara / Movable & Kshipra / Laghu",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "SWATI", "PUNARVASU", "SHRAVANA", "DHANISHTHA", "SHATABHISHA", "HASTA", "ASHWINI", "PUSHYA"
      ],
      "preferred_weekdays": ["THU", "WED", "FRI"],
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
        "code": "RAHU_KALAM_ACTIVE",
        "description": "Rahu Kalam active during launch trigger"
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
  },
  {
    "activity_id": "ACT_STARTUP_PITCH_TERM_SHEET",
    "activity_name": "VC Pitching & Signing Term Sheets / Investment Deals",
    "domain": "DOM_STARTUPS",
    "sub_domain": "SUB_VENTURE_CAPITAL",
    "intent": "Securing favorable valuation, institutional backing, fast closing, mutual profit",
    "baseline_constraints": {
      "functional_group": "Jaya (Victory) & Mridu (Tender Alliances)",
      "allowed_tithi_groups": ["JAYA", "PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "MRIGASHIRA", "CHITRA", "ANURADHA", "REVATI"
      ],
      "preferred_weekdays": ["THU", "WED", "FRI"],
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
        "code": "MARS_HORA_ACTIVE",
        "description": "Mars Hora active (Induces hostile negotiations or adversarial investor terms)"
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

### 3. Startup Domain Rules Summary Table

| Startup Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Entity Incorporation** | *Sthira / Fixed*<br> | Rohini, Uttara Phalguni, Uttarashadha, Uttara Bhadrapada, Pushya

 | Thursday, Wednesday, Sunday

 | **Vyatipata Yoga** is a hard blocker (prevents founder litigation).

 |
| **Product Launch (GTM)** | *Chara / Movable*<br> | Swati, Punarvasu, Shravana, Shatabhisha, Hasta

 | Thursday, Wednesday, Friday

 | Requires **Sideways (Tiryakamukhi)** orientation for global network reach.

 |
| **VC Term Sheet Signing** | *Jaya / Mridu*<br> | Hasta, Ashwini, Pushya, Anuradha, Revati

 | Thursday, Wednesday, Friday

 | **Mars Hora** blocked (prevents aggressive valuation haircuts or toxic terms).

 |
| **Office Opening / Retail** | *Sthira / Fixed*<br> | Rohini, Uttara Phalguni, Uttara Bhadrapada, Anuradha

 | Thursday, Sunday, Monday

 | **Upward (Urdhvamukhi)** facing orientation required.

 |

Which domain should we configure next—**Personal Finance & Investment** (stock market entry, real estate investments, buying gold/crypto), **Media, Entertainment & Creative** (movies, publishing, podcasts), or **Personal & Family Samskaras**?