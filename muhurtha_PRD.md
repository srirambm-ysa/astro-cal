# Product Requirement Document (PRD)

## 1. Product Overview & Purpose

The **Vedic Muhurta Rules Engine (VMRE)** is a microservice and database system designed to digitize, parse, and execute electional astrology (*Muhurta*) calculations sourced directly from classical Sanskrit treatises (primarily *Muhurta Chintamani*).

The engine separates **universal planetary and Panchanga math** from **individual personal filters**, establishing a foundational database of classical rules upon which hyper-personalized timing recommendations (based on an individual's *Janma Nakshatra*, *Janma Rashi*, and natal positions) can be computed.

---

## 2. Product Architecture & Technical Scope

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      1. Ingestion Pipeline                              │
│   Sanskrit PDF/Text -> Regex Boundary Splitter -> Gemini API           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Generates JSON Seed Data
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      2. Rule Database Layer                             │
│   PostgreSQL / MongoDB (Parameterized Activity Configurations)          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Reads Rule Constraints
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  3. Ephemeris & Calculation Engine                      │
│   Swiss Ephemeris (Lahiri Sidereal) + Planetary Math Pipeline           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Outputs Raw Transit Scores
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                  4. Personalization Layer (API)                         │
│   Single/Dual Chart Integration (Tara Bala, Chandra Bala, Transits)     │
└─────────────────────────────────────────────────────────────────────────┘

```

### In-Scope Activities

* **Financial & Commercial:** Open business, sign contracts, buy machinery, stock investments.
* **Property & Construction:** Property registration, foundation stone (*Shilanyas*), housewarming (*Griha Pravesh*), well digging.
* **Travel & Mobility:** Vehicle purchase and delivery, international travel (*Videsha Yatra*).
* **Education & Career:** Joining a new job, child's first writing (*Vidyarambha*), media launch.
* **Modern Digital Archetypes:** App/website deployment, digital marketing campaigns, cybersecurity patching, smart contract execution.
* **Single-User Samskaras:** Naming ceremony (*Namakarana*), first feeding (*Annaprashana*), ear piercing (*Karna-vedha*).

### Out-of-Scope (Isolating Module)

* **Marriage Muhurta (*Vivaha*):** Excluded from the generic activity engine schema. Evaluated as an independent microservice due to dual-chart interactions (bride & groom), complex global combustions (*Tara Asta*), *Guru/Surya Bala*, and 21 major disqualifying *Doshas*.

---

## 3. Data Models & Database Schema

### A. Activity Rules Table (`muhurta_activity_rules`)

Stores the parameterized rules extracted from classical texts.

```sql
CREATE TABLE muhurta_activity_rules (
    activity_code VARCHAR(50) PRIMARY KEY,       -- e.g., 'BUY_VEHICLE', 'LAUNCH_APP'
    canonical_name VARCHAR(100) NOT NULL,        -- e.g., 'Vahana Krayan Vikrayan'
    source_text VARCHAR(100) DEFAULT 'Muhurta Chintamani',
    shloka_reference VARCHAR(50),                -- e.g., 'Prakarana 6, Shloka 2'
    english_description TEXT,
    
    -- Extracted Classical Parameters
    allowed_nakshatra_ids INT[],                 -- Array of 1-indexed IDs (1-27)
    allowed_tithis INT[],                       -- Array of Tithi numbers (1-30)
    allowed_weekdays INT[],                     -- Array (0=Sun, 1=Mon, ..., 6=Sat)
    preferred_lagna_types VARCHAR(20)[],        -- ['FIXED', 'MOVABLE', 'DUAL']
    primary_kendra_house INT,                   -- e.g., 4 for property/vehicles, 10 for career
    
    -- Conditional Overrides & Weights
    scoring_weights JSONB NOT NULL              -- Weight distribution for evaluation
);

```

### B. Ingestion Record Schema (JSON Seed Format)

Structured response format expected from the LLM parsing layer:

```json
{
  "source": "Muhurta Chintamani",
  "prakarana": "Vahana Prakarana",
  "shloka_number": 2,
  "sanskrit_text": "अश्विनीपुष्यहस्तेषु स्वातिश्रवणधनिष्ठासु वाहनक्रयविक्रयं कुर्यात् ॥",
  "english_translation": "Vehicles should be bought or sold during Ashwini, Pushya, Hasta, Swati, Shravana, and Dhanishta stars.",
  "activity_code": "BUY_VEHICLE",
  "rules": {
    "allowed_nakshatra_ids": [1, 8, 13, 15, 22, 23],
    "allowed_weekdays": [1, 3, 4, 5],
    "allowed_tithis": [2, 3, 5, 7, 10, 11, 13, 15],
    "preferred_lagna_types": ["MOVABLE", "DUAL"]
  }
}

```

---

## 4. Functional Requirements

### FR-1: Classical Text Ingestion Pipeline

1. **Document Splitter:** Parse digitized Sanskrit PDFs (e.g., Kedar Dutt Joshi edition from Archive.org) page-by-page using PyMuPDF, identifying shloka boundaries marked by `॥`.
2. **LLM Structured Parser:** Call Gemini API with deterministic sampling (`temperature=0.1`) enforcing a strict Pydantic JSON schema to translate the Sanskrit shloka into modern English and extract DB-ready integer arrays.
3. **Keyword Entity Mapping:** Map classical terms (e.g., *Griha Pravesh*, *Vahana*, *Vyapar*) and modern digital archetypes (e.g., *App Launch*, *Cybersecurity Patch*) to standard database activity keys.

### FR-2: Universal Calculation Engine (Swiss Ephemeris Base)

1. **Sidereal Mode Enforcement:** Configure Swiss Ephemeris to use **Lahiri Ayanamsa** (`swe.SIDM_LAHIRI`).
2. **Panchanga Engine:** Calculate exact real-time Tithi, Nakshatra (with Pada), Karana, Nitya Yoga, and Weekday for any UTC timestamp and geographic coordinate.
3. **Lagna Engine:** Calculate the exact Sidereal Ascendant (*Lagna*) and planetary house positions for the target location.
4. **General Inauspicious Filters:** Calculate dynamic local windows for *Rahu Kalam*, *Yamagandam*, *Gulika Kalam*, *Vishti Karana (Bhadra)*, and *Rikta Tithis* (4, 9, 14, 30).
5. **Modern Tech Conditions:** Provide automated evaluation flags for Mercury Retrograde, Mercury Combustion (*Asta* within $14^\circ$ of the Sun), and Mars Retrograde.

### FR-3: Personalization Engine

Given a user's **Janma Nakshatra** (1–27) and **Janma Rashi** (1–12):

1. **Tara Bala Engine:**

$$\text{Tara Count} = ((\text{Transit Nakshatra Index} - \text{Janma Nakshatra Index} + 1) \bmod 9)$$


* *Pass:* 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 0/9 (Parama Mitra).
* *Fail:* 1 (Janma), 3 (Vipat), 5 (Pratyak), 7 (Naidhana).


2. **Chandra Bala Engine:**

$$\text{Relative House} = ((\text{Transit Rashi Index} - \text{Janma Rashi Index}) \bmod 12) + 1$$


* *Pass:* 1st, 3rd, 6th, 7th, 10th, 11th houses relative to natal Moon sign.
* *Fail:* 2nd, 4th, 5th, 8th (*Ashtama Chandra*), 9th, 12th houses.


3. **Combined Compatibility Verdict:** Output an overall `is_personally_favorable` boolean. If *Tara Bala* or *Chandra Bala* fails, trigger a hard filter flag.

---

## 5. Scoring & Ranking Pipeline

Rather than returning binary pass/fail results, the engine evaluates micro-slots across a requested window and assigns a **Weighted Suitability Score (0–100%)**.

```
Input Target Date Range & Location
             │
             ▼
[Pass 1: Personal Hard Filters] ──(Fail: Tara/Chandra)──> Score = 0% (Rejected)
             │ (Pass)
             ▼
[Pass 2: Universal Panchanga]   ──(Fail: Bhadra/Rahu)───> Score = 0% (Rejected)
             │ (Pass)
             ▼
[Pass 3: Rule Matching & Weights] ───────────────────────> Calculate Score (0-100%)
             │
             ├─ Target Nakshatra Match (+30 pts)
             ├─ Target Tithi & Weekday Match (+20 pts)
             ├─ Target Lagna Match (+20 pts)
             └─ Planetary Strengths (Mercury/Mars clear) (+30 pts)

```

---

## 6. Non-Functional Requirements (NFRs)

* **Accuracy & Determinism:** Planetary positions calculated via Swiss Ephemeris must match standard astronomical almanacs to within $\pm 0.001$ arcseconds.
* **Latency:** Evaluation of a 30-day window (subdivided into 15-minute Lagna slots) for a specific user and activity must return within **$< 500 \text{ ms}$**.
* **Database Extensibility:** Adding a new activity archetype must be accomplished purely via database seeding (adding a row to `muhurta_activity_rules`) with zero downtime or code modification in the execution engine.
* **Traceability:** Every generated Muhurta slot must return a `source_reference` string indicating the classical shloka and text from which the governing constraints originated.

Here is the complete **OpenAPI 3.0 specification** in YAML format for the Vedic Muhurta Personalization API, designed according to the architecture outlined in your PRD.

```yaml
openapi: 3.0.3
info:
  title: Vedic Muhurta Personalization API
  description: >
    An expert electional astrology engine that calculates personalized auspicious time windows 
    (Muhurtas) by combining classical rules from texts like Muhurta Chintamani with 
    individual natal filters (Tara Bala & Chandra Bala).
  version: 1.0.0
  contact:
    name: API Support
    email: support@muhurtaengine.io

servers:
  - url: https://api.muhurtaengine.io/v1
    description: Production Server
  - url: https://sandbox.api.muhurtaengine.io/v1
    description: Sandbox / Testing Server

paths:
  /activities:
    get:
      summary: List Supported Muhurta Activities
      description: Returns all supported classical and modern digital activity archetypes along with their classical source references.
      operationId: listActivities
      responses:
        '200':
          description: A list of available activity archetypes.
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ActivityArchetype'

  /muhurta/evaluate-slot:
    post:
      summary: Evaluate a Single Time Slot
      description: Evaluates a single timestamp for a specific user profile and activity type. Useful for instant calendar checks.
      operationId: evaluateSingleSlot
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SingleSlotRequest'
      responses:
        '200':
          description: Evaluation response for the specified slot.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SlotEvaluationResult'
        '400':
          $ref: '#/components/responses/400BadRequest'

  /muhurta/search:
    post:
      summary: Search and Rank Favorable Muhurta Windows
      description: Scans a date range at micro-intervals (Lagna slots) and returns ranked auspicious windows sorted by suitability score.
      operationId: searchMuhurtas
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MuhurtaSearchRequest'
      responses:
        '200':
          description: A list of ranked Muhurta time slots with detailed scoring breakdowns.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MuhurtaSearchResponse'
        '400':
          $ref: '#/components/responses/400BadRequest'

components:
  schemas:
    # --- Input Schemas ---
    UserProfile:
      type: object
      required:
        - janma_nakshatra_index
        - janma_rashi_index
      properties:
        janma_nakshatra_index:
          type: integer
          minimum: 1
          maximum: 27
          description: "User's Birth Star index (1 = Ashwini, 27 = Revati)."
          example: 4
        janma_rashi_index:
          type: integer
          minimum: 1
          maximum: 12
          description: "User's Natal Moon Sign index (1 = Aries/Mesha, 12 = Pisces/Meena)."
          example: 2

    Location:
      type: object
      required:
        - latitude
        - longitude
      properties:
        latitude:
          type: number
          format: double
          minimum: -90.0
          maximum: 90.0
          example: 13.0827
        longitude:
          type: number
          format: double
          minimum: -180.0
          maximum: 180.0
          example: 80.2707
        timezone:
          type: string
          example: "Asia/Kolkata"

    SingleSlotRequest:
      type: object
      required:
        - timestamp_utc
        - activity_code
        - location
        - user_profile
      properties:
        timestamp_utc:
          type: string
          format: date-time
          example: "2026-08-12T10:30:00Z"
        activity_code:
          type: string
          example: "BUY_VEHICLE"
        location:
          $ref: '#/components/schemas/Location'
        user_profile:
          $ref: '#/components/schemas/UserProfile'

    MuhurtaSearchRequest:
      type: object
      required:
        - start_date_utc
        - end_date_utc
        - activity_code
        - location
        - user_profile
      properties:
        start_date_utc:
          type: string
          format: date-time
          example: "2026-08-10T00:00:00Z"
        end_date_utc:
          type: string
          format: date-time
          example: "2026-08-17T23:59:59Z"
        activity_code:
          type: string
          example: "LAUNCH_APP_OR_WEBSITE"
        location:
          $ref: '#/components/schemas/Location'
        user_profile:
          $ref: '#/components/schemas/UserProfile'
        minimum_score:
          type: integer
          minimum: 0
          maximum: 100
          default: 60
          description: "Filter out slots below this suitability threshold."

    # --- Output Schemas ---
    ActivityArchetype:
      type: object
      properties:
        activity_code:
          type: string
          example: "GRIHA_PRAVESH"
        canonical_name:
          type: string
          example: "Griha Pravesha"
        category:
          type: string
          example: "PROPERTY"
        source_reference:
          type: string
          example: "Muhurta Chintamani, Prakarana 4"
        description:
          type: string
          example: "Auspicious timing for housewarming and moving into a new residence."

    TaraBalaResult:
      type: object
      properties:
        tara_number:
          type: integer
          example: 2
        tara_name:
          type: string
          example: "Sampat"
        nature:
          type: string
          example: "Highly Auspicious (Wealth & Success)"
        is_favorable:
          type: boolean
          example: true

    ChandraBalaResult:
      type: object
      properties:
        relative_house:
          type: integer
          example: 11
        nature:
          type: string
          example: "Highly Favorable (All-round Gains)"
        is_ashtama_chandra:
          type: boolean
          example: false
        is_favorable:
          type: boolean
          example: true

    PanchangaSnapshot:
      type: object
      properties:
        tithi:
          type: object
          properties:
            index:
              type: integer
              example: 5
            name:
              type: string
              example: "Panchami"
            is_rikta:
              type: boolean
              example: false
        nakshatra:
          type: object
          properties:
            index:
              type: integer
              example: 13
            name:
              type: string
              example: "Hasta"
            pada:
              type: integer
              example: 2
        weekday:
          type: string
          example: "Wednesday"
        is_bhadra_active:
          type: boolean
          example: false
        is_rahu_kalam:
          type: boolean
          example: false

    TechConditions:
      type: object
      properties:
        mercury_retrograde:
          type: boolean
          example: false
        mercury_combust:
          type: boolean
          example: false
        mars_retrograde:
          type: boolean
          example: false

    SlotEvaluationResult:
      type: object
      properties:
        timestamp_utc:
          type: string
          format: date-time
        suitability_score:
          type: integer
          minimum: 0
          maximum: 100
          example: 85
        verdict:
          type: string
          enum: [EXCELLENT, GOOD, ACCEPTABLE, UNFAVORABLE, REJECTED]
          example: "EXCELLENT"
        rejection_reasons:
          type: array
          items:
            type: string
          example: []
        personal_compatibility:
          type: object
          properties:
            passes_personal_filter:
              type: boolean
              example: true
            tara_bala:
              $ref: '#/components/schemas/TaraBalaResult'
            chandra_bala:
              $ref: '#/components/schemas/ChandraBalaResult'
        panchanga:
          $ref: '#/components/schemas/PanchangaSnapshot'
        tech_indicators:
          $ref: '#/components/schemas/TechConditions'

    MuhurtaSearchResponse:
      type: object
      properties:
        activity_code:
          type: string
          example: "BUY_VEHICLE"
        total_slots_evaluated:
          type: integer
          example: 672
        favorable_slots_found:
          type: integer
          example: 4
        ranked_slots:
          type: array
          items:
            $ref: '#/components/schemas/SlotEvaluationResult'

  responses:
    400BadRequest:
      description: Invalid request parameters or missing fields.
      content:
        application/json:
          schema:
            type: object
            properties:
              error_code:
                type: string
                example: "INVALID_NAKSHATRA_INDEX"
              message:
                type: string
                example: "janma_nakshatra_index must be an integer between 1 and 27."

```

