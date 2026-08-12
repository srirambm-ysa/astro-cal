## Classical Rule Architecture in *Muhurta Chintamani*

The astrological rules embedded in the classical text *Muhurta Chintamani* (authored by Rama Daivagya) follow a deterministic relational model [source: 1]. They map temporal variables (**Tithi**, **Vara/Day**, **Nakshatra**, **Rashi**, and **Ghati**) to electional outcomes and planetary transit effects [source: 1].

Below is the extraction and re-structuring of these classical slokas into functional rule tables and logical data models [source: 1].

---

### 1. Tithi Taxonomy, Deities, and Day Combinations (*Chapter 1, Slokas 3–5*)

Tithis are categorized into five functional groups (Nanda through Poorna) across three cycles per month [source: 1]. Each group possesses specific presiding deities and forms **Siddha Yoga** or **Amrita Yoga** when paired with specific weekdays [source: 1].

| Tithi Group | Tithis (Shukla/Krishna) | Presiding Deities (*Tithi Isa*) | Siddha Yoga Day | Amrita Yoga Day | Baseline Quality (Shukla Paksha) | Baseline Quality (Krishna Paksha) |
| --- | --- | --- | --- | --- | --- | --- |
| **Nanda** | 1, 6, 11 | Agni (1), Kartikeya (6), Visvedeva (11) [source: 1] | Friday [source: 1] | Sunday, Tuesday [source: 1] | Inauspicious (1st frequency) [source: 1] | Fully Auspicious [source: 1] |
| **Bhadra** | 2, 7, 12 | Brahma (2), Surya (7), Vishnu (12) [source: 1] | Wednesday [source: 1] | Monday, Friday [source: 1] | Medium Auspicious [source: 1] | Medium Auspicious [source: 1] |
| **Jaya** | 3, 8, 13 | Gauri (3), Shiva (8), Kamadeva (13) [source: 1] | Tuesday [source: 1] | Wednesday [source: 1] | Fully Auspicious [source: 1] | Inauspicious [source: 1] |
| **Rikta** | 4, 9, 14 | Ganesha (4), Durga (9), Shiva (14) [source: 1] | Saturday [source: 1] | Thursday [source: 1] | Inauspicious (Avoid) [source: 1] | Inauspicious (Avoid) [source: 1] |
| **Poorna** | 5, 10, 15 / 30 | Sarpa (5), Yama (10), Chandra (15) / Pitris (30) [source: 1] | Thursday [source: 1] | Saturday [source: 1] | Fully Auspicious [source: 1] | Inauspicious (3rd frequency) [source: 1] |

* **Interpretation Rule:** Siddha Yoga neutralizes minor electional defects (*Masa Shunya*, *Masa Dagdha*) [source: 1]. Rikta tithis paired with Saturday form a productive Siddha Yoga despite being individual malefic elements [source: 1].

---

### 2. Day-Nakshatra Inauspicious & Auspicious Yogas (*Chapter 1, Slokas 5, 8–9, 28–29*)

Combinations of weekdays with specific Nakshatras produce either catastrophic (*Dagdha*, *Yama Ghanta*) or universally favorable (*Sarvartha Siddhi*) outcome matrices [source: 1].

| Weekday | Dagdha Yoga Nakshatra | Visha Yoga Tithi | Yama Ghanta Nakshatra | Sarvartha Siddhi Nakshatras |
| --- | --- | --- | --- | --- |
| **Sunday** | Bharani [source: 1] | Tithi 4 [source: 1] | Magha [source: 1] | Hasta, Moola, Uttara Phalguni, Uttarashadha, Uttara Bhadrapada, Pushya, Ashwini [source: 1] |
| **Monday** | Chitra [source: 1] | Tithi 6 [source: 1] | Vishakha [source: 1] | Shravana, Rohini, Mrigashira, Pushya, Anuradha [source: 1] |
| **Tuesday** | Uttarashadha [source: 1] | Tithi 7 [source: 1] | Ardra [source: 1] | Ashwini, Uttara Bhadrapada, Krittika, Ashlesha [source: 1] |
| **Wednesday** | Dhanishtha [source: 1] | Tithi 2 [source: 1] | Moola [source: 1] | Rohini, Anuradha, Hasta, Krittika, Mrigashira [source: 1] |
| **Thursday** | Uttara Phalguni [source: 1] | Tithi 8 [source: 1] | Krittika [source: 1] | Revati, Anuradha, Ashwini, Punarvasu, Pushya [source: 1] |
| **Friday** | Jyeshtha [source: 1] | Tithi 9 [source: 1] | Rohini [source: 1] | Revati, Anuradha, Ashwini, Punarvasu, Shravana [source: 1] |
| **Saturday** | Revati [source: 1] | Tithi 7 [source: 1] | Hasta [source: 1] | Shravana, Rohini, Swati [source: 1] |

* **Interpretation Rule:** An auspicious yoga (*Sarvartha Siddhi*, *Ravi Yoga*) occurring on the same day overrides and destroys co-existing malefic yogas like *Dagdha* or *Krakacha* [source: 1].

---

### 3. Sevenfold Nakshatra Functional Classification (*Chapter 2, Slokas 2–8*)

Nakshatras are partitioned into seven functional temperaments. Each temperament defines permissible activities and optimal weekdays [source: 1].

```
                    Nakshatra Functional Taxonomy
                                  │
    ┌─────────────┬───────────────┼──────────────┬─────────────┐
 Dhruva        Chara           Ugra          Mishra        Kshipra ...
(Fixed)      (Movable)        (Cruel)       (Mixed)        (Swift)

```

| Category Name | Nakshatras Included | Associated Day | Permissible / Recommended Activities |
| --- | --- | --- | --- |
| **Dhruva / Sthira** (Fixed) | Rohini, Uttara Phalguni, Uttarashadha, Uttara Bhadrapada [source: 1] | Sunday [source: 1] | House construction, foundation laying, tree planting, seed sowing, peace rituals [source: 1]. |
| **Chara / Chala** (Movable) | Swati, Punarvasu, Shravana, Dhanishtha, Shatabhisha [source: 1] | Monday [source: 1] | Vehicle purchase, riding animals/cars, travel, gardening, movement-based tasks [source: 1]. |
| **Ugra / Krura** (Cruel) | Poorva Phalguni, Poorvashadha, Poorva Bhadrapada, Bharani, Magha [source: 1] | Tuesday [source: 1] | Demolition, deceit/ambush, poison preparation, warfare, weapon usage, fire works [source: 1]. |
| **Mishra / Sadharana** (Mixed) | Vishakha, Krittika [source: 1] | Wednesday [source: 1] | Agnihotra (fire offerings), mixing compounds, releasing bulls (*Vrishotsarga*) [source: 1]. |
| **Kshipra / Laghu** (Swift) | Hasta, Ashwini, Pushya, Abhijit [source: 1] | Thursday [source: 1] | Trade/commerce, physical arts (*Shilpa*), wearing jewelry, education, sexual intimacy [source: 1]. |
| **Mridu / Maitra** (Tender) | Mrigashira, Revati, Chitra, Anuradha [source: 1] | Friday [source: 1] | Fine arts, learning music, tailoring/wearing new clothes, games, making friends [source: 1]. |
| **Tikshna / Daruna** (Sharp) | Moola, Jyeshtha, Ardra, Ashlesha [source: 1] | Saturday [source: 1] | Tantric rituals (*Abhichara*), animal taming/binding, causing division, exorcism [source: 1]. |

---

### 4. Spatial Orientation of Nakshatras (*Chapter 2, Sloka 9*)

The direction toward which a Nakshatra's influence faces determines its structural application [source: 1].

| Facing Direction (*Mukha*) | Nakshatra List | Ideal Applications |
| --- | --- | --- |
| **Urdhvamukhi** (Facing Upward) | Ardra, Pushya, Shravana, Dhanishtha, Shatabhisha, Rohini, Uttara Phalguni, Uttarashadha, Uttara Bhadrapada [source: 1] | Building upper stories, flag hoisting, canopy setup, coronation, multi-story entry [source: 1]. |
| **Adhomukhi** (Facing Downward) | Moola, Ashlesha, Vishakha, Krittika, Poorva Phalguni, Poorvashadha, Poorva Bhadrapada, Bharani, Magha [source: 1] | Digging wells, tanks, underground basements, mining, unearthing treasures, root crops [source: 1]. |
| **Tiryakamukhi** (Facing Sideways) | Anuradha, Hasta, Swati, Punarvasu, Jyeshtha, Ashwini [source: 1] | Animal training/purchasing, road transportation, driving, general trade, navigation [source: 1]. |

---

### 5. Bhadra (Vishti Karana) Spatial & Temporal Matrix (*Chapter 1, Slokas 43–45*)

Bhadra is an inauspicious half-tithi period (*Karana*) whose malefic impact depends on its active location (Loka) and specific Ghati division (Mouth vs. Tail) [source: 1].

#### A. Temporal Schedule

| Fortnight (*Paksha*) | Active Tithi | Active Half | Active Prahara (Mouth) | Active Prahara (Tail) |
| --- | --- | --- | --- | --- |
| **Shukla** | Chaturthi (4) | 2nd Half | 5th Prahara [source: 1] | 8th Prahara [source: 1] |
| **Shukla** | Ashtami (8) | 1st Half | 2nd Prahara [source: 1] | 1st Prahara [source: 1] |
| **Shukla** | Ekadashi (11) | 2nd Half | 7th Prahara [source: 1] | 6th Prahara [source: 1] |
| **Shukla** | Poornima (15) | 1st Half | 4th Prahara [source: 1] | 3rd Prahara [source: 1] |
| **Krishna** | Tritiya (3) | 2nd Half | 8th Prahara [source: 1] | 7th Prahara [source: 1] |
| **Krishna** | Saptami (7) | 1st Half | 3rd Prahara [source: 1] | 2nd Prahara [source: 1] |
| **Krishna** | Dashami (10) | 2nd Half | 6th Prahara [source: 1] | 5th Prahara [source: 1] |
| **Krishna** | Chaturdashi (14) | 1st Half | 1st Prahara [source: 1] | 4th Prahara [source: 1] |

#### B. Location & Impact (*Loka*)

> **VARIANT NOTE:** this table previously read "Aquarius, Pisces, Cancer, Leo" for Mrityu Loka.
> The Sanskrit of *Muhurta Chintamani* Ch.1 (*Subhashubha Prakarana*) **Sloka 46** is
> **कर्किसिंहतुलामीने मृत्युलोके तु भद्रिका॥** — Karka (Cancer), Simha (Leo), Tula (Libra),
> Meena (Pisces). The older reading was an Aquarius↔Libra translation swap adopted from a
> printed English edition; the engine follows the sloka (`[3,4,6,11]`, see `engine.js:516`).

| Active Moon Sign (*Chandra Rashi*) | Active World (*Loka*) | Practical Impact on Earth |
| --- | --- | --- |
| Cancer, Leo, Libra, Pisces | **Mrityu Loka** (Earth) [source: 1] | **Severe Malefic:** Avoid all auspicious ventures [source: 1]. |
| Aries, Taurus, Gemini, Scorpio | **Swarga Loka** (Heaven) [source: 1] | **Neutral / Harmless** on Earth [source: 1]. |
| Virgo, Sagittarius, Capricorn, Aquarius | **Patala Loka** (Underworld) [source: 1] | **Neutral / Harmless** on Earth [source: 1]. |

* **Segmentation Rule:** The first **5 Ghatis** of Bhadra represent the **Mouth** (*Mukha*, extremely malefic) [source: 1]. The final **3 Ghatis** represent the **Tail** (*Puchha*, auspicious and usable for initiation) [source: 1].

---

### 6. Gochara (Planetary Transits) & Vedha (Interference) Rules (*Chapter 4, Slokas 1–4*)

When a planet transits a favorable house relative to the Natal Moon (*Janma Rashi*), its positive output is obstructed if another planet occupies its corresponding **Vedha house** [source: 1].

```
   [Natal Moon] ─────> Favorable Transit House (Grants Auspicious Result)
                              ▲
                              │ Obstructive Ray (Vedha)
                              │
                      Vedha House Occupied (Cancels Auspicious Result)

```

| Planet | Auspicious Transit Houses (*from Moon*) | Corresponding Vedha Houses | Exemption Rule (No Vedha) |
| --- | --- | --- | --- |
| **Sun** | 3, 6, 10, 11 [source: 1] | 9, 12, 4, 5 [source: 1] | Saturn in 12th does not obstruct Sun in 6th (Father-Son relation) [source: 1]. |
| **Moon** | 1, 3, 6, 7, 10, 11 [source: 1] | 5, 9, 12, 2, 4, 8 [source: 1] | Mercury does not cause Vedha to Moon (Father-Son relation) [source: 1]. |
| **Mars / Saturn / Rahu / Ketu** | 3, 6, 11 [source: 1] | 12, 9, 5 [source: 1] | Sun in 12th does not obstruct Saturn in 6th [source: 1]. |
| **Mercury** | 2, 4, 6, 8, 10, 11 [source: 1] | 5, 3, 9, 1, 8, 12 [source: 1] | Moon does not cause Vedha to Mercury [source: 1]. |
| **Jupiter** | 2, 5, 7, 9, 11 [source: 1] | 12, 4, 3, 10, 8 [source: 1] | Standard planetary obstruction applies [source: 1]. |
| **Venus** | 1, 2, 3, 4, 5, 8, 9, 11, 12 [source: 1] | 8, 7, 1, 10, 9, 5, 11, 3, 6 [source: 1] | Standard planetary obstruction applies [source: 1]. |

* **Vipareeta Vedha Principle:** If a planet sits in a malefic transit house while its corresponding auspicious position is simultaneously occupied, the malefic effect is reversed into a favorable outcome [source: 1].

---

### 7. Recovery Matrix for Lost / Stolen Property (*Chapter 2, Slokas 22–23*)

Lost property recovery probabilities are mapped based on the Nakshatra active at the time of loss [source: 1].

| Classification Category | Associated Nakshatras | Recovery Outcome & Direction |
| --- | --- | --- |
| **Andhaksha** (Blind) | Rohini, Pushya, Uttara Phalguni, Vishakha, Poorvashadha, Dhanishtha, Revati [source: 1] | Recovered immediately; item moved East [source: 1]. |
| **Mandaksha** (Dull Sighted) | Mrigashira, Ashlesha, Hasta, Anuradha, Uttarashadha, Shatabhisha, Ashwini [source: 1] | Recovered after effort; item moved South [source: 1]. |
| **Madhyaksha** (Medium Vision) | Ardra, Magha, Chitra, Jyeshtha, Abhijit, Poorva Bhadrapada, Bharani [source: 1] | News heard from far away; item not recovered; moved West [source: 1]. |
| **Swaksha / Sulochana** (Clear Vision) | Punarvasu, Poorva Phalguni, Swati, Moola, Shravana, Uttara Bhadrapada, Krittika [source: 1] | No news obtained; completely unrecoverable; moved North [source: 1]. |