### Domain: Personal Finance, Wealth & Investments (`DOM_PERSONAL_FINANCE`)

In classical electional astrology (*Muhurta Chintamani*, *Brihat Samhita*, *Kalaprakashika*), personal financial management and wealth creation map to the concepts of **Dhana Yoga** (wealth-generating combinations), **Sanchaya** (accumulation/savings), and **Rina** (debt management and borrowing).

For modern personal finance, activities are categorized based on whether the objective is **long-term asset retention**, **liquidity and swift yield**, or **debt elimination**:

1. **Wealth Accumulation & Real Estate (`Sthira` / Fixed):** Buying bullion, long-term stocks, fixed deposits, and land. Focused on capital growth and protection against loss.
2. **Trading & Liquid Investments (`Kshipra` / Swift & `Chara` / Movable):** Mutual funds, equity market trading, crypto investments, and currency trading. Focused on liquidity and rapid execution.
3. **Debt Discharge & Loan Procurement (`Rina Mukti`):** Repaying loans vs. taking mortgages. (e.g., Repaying debt on Tuesdays is encouraged classically, while taking new loans on Tuesdays is forbidden).

---

### 1. Personal Finance Domain Taxonomy

#### Sub-Domain 1: Equity, Crypto & Capital Markets

* `ACT_FIN_STOCK_LONG_TERM`: Buying equity/stocks for long-term hold (*Sthira/Fixed*).
* `ACT_FIN_TRADING_ACCOUNT`: Opening brokerage accounts or deploying liquid capital (*Kshipra/Swift*).
* `ACT_FIN_SIP_MUTUAL_FUND`: Starting recurring investments (SIPs) or index funds (*Chara/Movable*).

#### Sub-Domain 2: Wealth Assets & Bullion

* `ACT_FIN_BUY_GOLD_SILVER`: Purchasing physical gold, silver, or precious metals (*Sthira/Gulika*).
* `ACT_FIN_SAFE_DEPOSIT`: Opening bank lockers or physical safe vaults (*Sthira/Upward*).

#### Sub-Domain 3: Banking, Fixed Income & Treasury

* `ACT_FIN_FIXED_DEPOSIT`: Opening long-term fixed deposits or government bonds (*Sthira/Fixed*).
* `ACT_FIN_RECURRING_SAVINGS`: Setting up automated high-yield savings plans (*Sthira/Purna*).

#### Sub-Domain 4: Debt & Liability Management

* `ACT_FIN_TAKE_MORTGAGE`: Taking home loans, personal loans, or mortgages (*Avoid Tuesdays*).
* `ACT_FIN_REPAY_LOAN`: Discharging old debt / final loan payoff (*Kshipra/Mars*).

---

### 2. Activity JSON Registry with Rule Configurations

```json
[
  {
    "activity_id": "ACT_FIN_STOCK_LONG_TERM",
    "activity_name": "Long-Term Equity Investment / Portfolio Buying",
    "domain": "DOM_PERSONAL_FINANCE",
    "sub_domain": "SUB_CAPITAL_MARKETS",
    "intent": "Capital appreciation, portfolio stability, long-term wealth compounding",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Kshipra (Swift)",
      "allowed_tithi_groups": ["PURNA", "NANDA", "JAYA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "HASTA", "PUSHYA", "ANURADHA"
      ],
      "preferred_weekdays": ["THU", "WED", "FRI"],
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
        "description": "Vyatipata Nitya Yoga active (Severe market volatility / capital loss risk)"
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
    "activity_id": "ACT_FIN_BUY_GOLD_SILVER",
    "activity_name": "Purchasing Physical Gold, Bullion & Precious Assets",
    "domain": "DOM_PERSONAL_FINANCE",
    "sub_domain": "SUB_WEALTH_ASSETS",
    "intent": "Asset retention, inflation hedge, generational wealth, physical security",
    "baseline_constraints": {
      "functional_group": "Sthira (Fixed) & Mridu (Tender)",
      "allowed_tithi_groups": ["PURNA", "NANDA"],
      "forbidden_tithi_groups": ["RIKTA"],
      "allowed_nakshatras": [
        "PUSHYA", "ROHINI", "UTTARA_PHALGUNI", "UTTARASHADHA", "UTTARA_BHADRAPADA", "REVATI", "SWATI"
      ],
      "preferred_weekdays": ["THU", "SUN", "FRI"],
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
      }
    ],
    "cancellation_overrides": [
      {
        "rule_id": "OVR_GULIKA_ACCUMULATION",
        "if_afflicted_by": "RAHU_KALAM",
        "neutralized_by": ["GULIKA_KALAM_ACTIVE"],
        "action": "CANCEL_PENALTY_AND_ADD_BONUS",
        "bonus_points": 10
      }
    ]
  },
  {
    "activity_id": "ACT_FIN_TAKE_MORTGAGE",
    "activity_name": "Applying for Loan / Executing Debt Mortgage",
    "domain": "DOM_PERSONAL_FINANCE",
    "sub_domain": "SUB_DEBT_MANAGEMENT",
    "intent": "Accessing capital without falling into perpetual debt trap",
    "baseline_constraints": {
      "functional_group": "Chara (Movable) & Kshipra (Swift)",
      "allowed_tithi_groups": ["NANDA", "JAYA", "PURNA"],
      "forbidden_tithi_groups": ["RIKTA", "AMAVASYA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "SWATI", "PUNARVASU", "SHRAVANA"
      ],
      "preferred_weekdays": ["THU", "WED", "MON"],
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
        "code": "TUESDAY_ACTIVE",
        "description": "Tuesday active (Classically forbidden for taking new debt; causes compounding liabilities)"
      },
      {
        "code": "SANKRANTI_DAY_ACTIVE",
        "description": "Solar Transit / Sankranti active"
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
    "activity_id": "ACT_FIN_REPAY_LOAN",
    "activity_name": "Repaying Debt / Final Loan Discharge",
    "domain": "DOM_PERSONAL_FINANCE",
    "sub_domain": "SUB_DEBT_MANAGEMENT",
    "intent": "Permanent freedom from liability, clearing financial encumbrances",
    "baseline_constraints": {
      "functional_group": "Kshipra / Laghu (Swift) & Tikshna (Sharp)",
      "allowed_tithi_groups": ["JAYA", "NANDA"],
      "forbidden_tithi_groups": ["PURNA"],
      "allowed_nakshatras": [
        "HASTA", "ASHWINI", "PUSHYA", "ARDRA", "JYESTHA"
      ],
      "preferred_weekdays": ["TUE", "SUN", "SAT"],
      "required_facing_orientation": "ANY"
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
    "cancellation_overrides": []
  }
]

```

---

### 3. Personal Finance Rules Summary Table

| Activity | Functional Group | Key Nakshatras | Preferred Days | Hard Blockers / Special Rules |
| --- | --- | --- | --- | --- |
| **Long-Term Stock Buying** | *Sthira / Fixed* | Rohini, Uttaras, Hasta, Pushya, Anuradha | Thursday, Wednesday, Friday | **Vyatipata Yoga** is a hard blocker (prevents portfolio loss). |
| **Buying Gold / Bullion** | *Sthira / Mridu* | Pushya, Rohini, Uttaras, Revati, Swati | Thursday, Sunday, Friday | **Pushya Nakshatra** on Thursday (*Guru Pushya*) is ideal. |
| **Taking Loan / Mortgage** | *Chara / Kshipra* | Hasta, Ashwini, Pushya, Swati, Shravana | Thursday, Wednesday, Monday | **Tuesdays strictly forbidden** (leads to debt traps). |
| **Repaying Debt / Loan** | *Kshipra / Tikshna* | Hasta, Ashwini, Pushya, Ardra, Jyeshtha | Tuesday, Sunday, Saturday | **Tuesdays favored** for debt repayment (*Rina Mukti*). |