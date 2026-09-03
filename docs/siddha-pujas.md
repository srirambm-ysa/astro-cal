# Siddha Pujas — Mahaan / Siddhar Observances Layer

> **Source file:** `rules/siddhar_pujas.json` (schema `siddhar-puja-v1`)  
> **Engine wiring:** `app.js:70` globals, `app.js:531` matchers, `app.js:803` month chips, `app.js:880` detail row, `app.js:1168` ICS, `app.js:1365` fetch, `index.html:95` chip style  
> **Status:** v1.1 · 17 entries · TN-curated, local-first, no API  
> **Purpose:** the true purpose of this calendar — surface the Guru Pooja / Jayanthi / Aradhana days of living Siddhars and modern Mahaans venerated across Tamil Nadu, so devotees never miss them.

---

## 0. Why a separate Siddhar layer

Prior layers (Avoid Days, Gochara, Muhurta, Tamil festivals, Shaiva 9 Guru Pujas) cover *panchang mechanics* and *classical Shaiva Siddhanta*. The day-to-day devotional life of Tamil Nadu today, however, is anchored in the ashrams and Brindavanams of modern Siddhars — Seshadri, Ramana, Yogi Ramsuratkumar, Kodi Swamigal, Pamban, Pattinathar, Kanchi Mahaperiyava, Annamalai Swami — plus the pan-Indian Nath/Siddha lineage (Bhogar, Pulipani, Maha Avatar Babaji, Goraknath, Matsyendranath) that the Palani–Kataragama axis keeps alive.

These observances are *not* classical nakshatra-tithi formulas from *Muhurta Chintamani*; they are living traditions kept by trusts/ashrams. Their dates are therefore recorded in two idioms:

- **Tamil solar `tMonth + nakshatra`** (for birth-star Jayanthis — e.g. Thai Hastham, Margazhi Punarvasu, Vaikasi Anusham) — flagged via the sunrise moon nakshatra, same path as `TAMIL_FESTIVALS` / `shaiva_guru_pujas.json`.
- **Fixed Gregorian `month/day`** (for modern Jayanthi/Aradhana/Siddhi days — e.g. Dec 1, Feb 20, Oct 11, May 30) — flagged by Gregorian month/day directly, with the Tamil thithi/nakshatra noted as context but not required for matching.

The siddhar layer is deliberately **additive**: it never hides or re-ranks an Avoid Day (Chandrashtama remains the primary hard-avoid at the top, per `docs/gochara_addition.md` §0).

---

## 1. At a glance — 17 entries (13 figures, 17 observances)

| # | Figure | Observance | Rule | Display | Key |
|---|--------|------------|------|---------|-----|
| 1 | **Seshadri Swamigal** (Tiruvannamalai) | Jayanthi | `Thai Hastham` — nakshatra 12 in tMonth 9 | Thai Hastham | `seshadri_jayanthi` |
| 2 | | Aradhana / Mahasamadhi | `Margazhi Hastham` — nakshatra 12 in tMonth 8 | Margazhi Hastham | `seshadri_aradhana` |
| 3 | **Yogi Ramsuratkumar** (Visiri Samiyar) | Jayanthi | fixed `12/01` | Dec 1 (fixed) | `yogi_ramsuratkumar_jayanthi` |
| 4 | | Aradhana | fixed `02/20` · Masi Dwadashi (K) | Feb 20 · Masi Dwadashi | `yogi_ramsuratkumar_aradhana` |
| 5 | **Kodi Swamigal** (Puravipalayam) | Gurupooja / Siddhi day | fixed `10/11` · Purattasi Ashtami Thithi | Oct 11 · Purattasi Ashtami | `kodi_swamigal_gurupooja` |
| 6 | **Ramana Maharshi** | Jayanthi | `Margazhi Punarpoosam` — nakshatra 6 in tMonth 8 | Margazhi Punarpoosam | `ramana_jayanthi` |
| 7 | | Aradhana / Mahanirvana | fixed `04/14` · Chithirai | Apr 14 (fixed) | `ramana_aradhana` |
| 8 | **Pamban Swamigal** (Kumara Gurudasa) | Gurupooja / Samadhi | fixed `05/30` · Vaikasi | May 30 · Vaikasi | `pamban_gurupooja` |
| 9 | **Pattinathar** (Tiruvottriyur) | Guru Pooja | `Aadi Uthiradam` — nakshatra 20 in tMonth 3 (pournam-adjacent) | Aadi Uthiradam (after Pournami) | `pattinathar_gurupooja` |
| 10 | **Kanchi Maha Periyava** | Jayanthi | `Vaikasi Anusham` — nakshatra 16 in tMonth 1 | Vaikasi Anusham | `kanchi_maha_periyava_jayanthi` |
| 11 | | Aradhana | fixed `01/08` | Jan 8 (fixed) | `kanchi_maha_periyava_aradhana` |
| 12 | **Annamalai Swami** (Ramana disciple) | Aradhana | fixed `11/09` | Nov 9 (fixed) | `annamalai_swami_aradhana` |
| 13 | **Maha Avatar Babaji** (Parangipettai) | Jayanthi | fixed `11/30` · Karthigai Rohini / Deepam | Nov 30 · Karthigai Rohini | `maha_avatar_babaji_jayanthi` |
| 14 | **Bhogar Siddhar** (Palani) | Jayanthi | `Vaikasi Bharani` — nakshatra 1 in tMonth 1 | Vaikasi Bharani | `bhogar_jayanthi` |
| 15 | **Pulipani Siddhar** (Palani Adivaram) | Gurupooja | `Vaikasi Bharani` (co-observance with guru Bhogar) | Vaikasi Bharani (with Bhogar) | `pulipani_siddhar_gurupooja` |
| 16 | **Goraknath** (Nath Sampradaya) | Jayanthi | `Vaikasi Purnima` — tithi 14 in tMonth 1 (Vaishakh Purnima) | Vaikasi Purnima | `goraknath_jayanthi` |
| 17 | **Matsyendranath** (Machamuni) | Jayanthi | `Purattasi Panchami` — tithi 4 in tMonth 5 (Bhadrapada Shukla Panchami) | Purattasi Panchami | `matsyendranath_jayanthi` |

> `tMonth` indexes: 0=Chithirai, 1=Vaikasi, 2=Aani, 3=Aadi, 4=Aavani, 5=Purattasi, 6=Aippasi, 7=Karthigai, 8=Margazhi, 9=Thai, 10=Maasi, 11=Panguni.  
> `val` indexes: 0=Aswini … 6=Punarpoosam … 12=Hastham … 16=Anusham … 20=Uthiradam … 23=Sathayam … 26=Revathi (see `engine.js:98`).

---

## 2. Detailed entries — biography, rule, sources

### 2.1 Seshadri Swamigal — Seshadri Swamigal Ashram, Tiruvannamalai

*Thangakkai Siddhar (Saint with the Golden Hand), “Living God” of Tiruvannamalai alongside Arunachala and Ramana.*

- **Born:** 22-01-1870, Kanchipuram, Kamakoti family (Varadaraja Joshyar & Maragatham), **Hastha nakshatra**, Brahma Muhurta, Uttarayana Saturday; named Seshadri after Kuladevatha Srinivasa (ssss-sangam, seshadriswamigal.com).
- **Life:** Dispassion by 17, initiated by Balaji Paramahamsa (Gouda sanyasi), reached Tiruvannamalai 1889 age 19, never left outskirts; 40 years as avadhuta — no fixed abode, worshipped stone pillars/animals as Atman, “golden hand” seller miracle at age 4.
- **Mahasamadhi:** 04-01-1929, buried in samadhi at Tiruvannamalai, witnessed by Ramana Maharshi (ssss-sangam.org).
- **Observances (Paramporul / Tiruvarunai Mahan / sriseshadriswamigalashramam.org table):**
  - **Jayanthi:** **Thai Hastham** (Thai = Makara sankranti Jan 14 → Feb 13; Hastham = Hasta). *“The birthday of the Mahan falls on the star Hastham in the month of Thai. Special Abhishekam and Alankaram are performed.”*
  - **Aradhana:** **Margazhi Hastham** (Hastham in Dhanur). *“Aradhana day — the saint's samadhi anniversary — falls on the Hastham star in Margazhi.”*
- **JSON:** `kind: "nakshatra", tMonth 9/val 12` and `tMonth 8/val 12`; display `Thai Hastham` / `Margazhi Hastham`.

### 2.2 Yogi Ramsuratkumar — Yogi Ramsuratkumar Ashram, Agrahara Collai, Tiruvannamalai

*Visiri Samiyar (Saint with the Hand Fan), “Godchild” / “this beggar”.*

- **Born:** 01-12-1918, Nardara village, Ballia (UP) on banks of Ganga, to Ramdat Kunwar & Kusum Devi; name Ramsurat = “Love to Ram”.
- **Three Gurus:** Sri Aurobindo (Jnana), Ramana Maharshi (Tapas), Swami Ramdas, Kanhangad (Bhakti — mantra *Om Sri Ram Jai Ram Jai Jai Ram* thrice, “death” of ego, 7-day exodus to Kingdom of God). Travelled India 1952–59, reached Tiruvannamalai 1959, lived as hidden beggar near temple chariot, Sannadhi Street, then Agrahara Collai ashram (3.5 acres, bhumi puja Feb 1994).
- **Observances (yogiramsuratkumarashram.org + yogiramsuratkumar.co.in + Wikipedia + Dinamalar):**
  - **Jayanthi:** **Dec 1 fixed** — *“Born on December 1, 1918”*; ashram board: *“1st December — Celebration of Bhagwan Yogi Ramsuratkumar Jayanthi”*; grand 2-day utsav first Saturday/Sunday of January (but birth is Dec 1).
  - **Aradhana:** **Feb 20 fixed** — *“Died 20 February 2001 (aged 82)”*; Dinamalar temple page: *“shed His mortal coil in Masi on a Dwadasi day in Krishna paksha … Dwadasi in Masi is celebration day”* — kept as `Feb 20 · Masi Dwadashi (K)`; ashram board: *“20th February — Celebration of Bhagwan Aradhana”*; ashram open 06:00–12:00 & 17:00–20:00, annadhanam thrice on both days.
- **JSON:** `kind: "fixed", month 12/day 1` and `month 2/day 20`; display notes Masi Dwadashi context.

### 2.3 Kodi Swamigal — Puravipalayam Palace Terrace, Pollachi Tk, Coimbatore

*Kodi Swamigal Thatha — wanderer from Dhanushkodi, 30 years on the palace terrace without descending.*

- **Life:** Arrived early 1964 (gundu Ramaswamy’s black Vauxhall) at Puravipalayam Zamin palace, pointed to verandah stairs, went up and *never came down* — *“If I come down after going up, I will not be alive.”* Terrace became abode for 30+ years, sea of devotees.
- **Siddhi:** Tuesday afternoon **11-10-1994**, **Ashtami Thithi in Purattasi** at Puravipalayam; body in Brindavanam/Jeeva Samadhi there; Thabovanam temple, Perungudi, Chennai maintains parikaya-pravesham instructions.
- **Observances (kodiswamigal.com gurupoojai pages + siddhargalthiruvadi.com):**
  - **Gurupooja / Siddhi day:** **Oct 11 fixed** annual at Puravipalayam Brindavanam + annadhanam centre; *“Purattasi Ashtami Thithi”* at Thabovanam Chennai (trust notes thithi fell Oct 10 in 2024, Oct 11 in others — hence dual note). `siddhargalthiruvadi.com`: *“10th October of Every Year at Puravipalayam Jamin … 28th-year Siddhi Day Oct 11 2022”* — Oct 10/11 variance is thithi drift; fixed Oct 11 is the civil anchor.
- **JSON:** `kind: "fixed", month 10/day 11`; display `Oct 11 (fixed) · Purattasi Ashtami Thithi`; source cites both URLs and notes terrace abode 1964–1994.

### 2.4 Ramana Maharshi — Sri Ramanasramam, Tiruvannamalai

*Bhagavan Sri Ramana, Arudra Darshan-born.*

- **Born:** Past midnight **29-12-1879** (recorded **30-12-1879**), Tiruchuli, to Sundaram Aiyar; house now *Sri Sundara Mandiram*; star **Punarvasu (Punarpoosam)** in **Margazhi**, Arudra Darshan day — Tiruchuli Bhuminatheswara deity procession moment; blind nurse saw white light (gururamana timeline).
- **Observances:**
  - **Jayanthi:** **Margazhi Punarpoosam** annually — Hindu-Blog 2026: *“147th Jayanti Dec 25 2026 is Punarvasu in Margazhi”*; Ramanalayam Chromepet: *“Tuesday 17 Dec 2026 (Margazhi Punarvasu)”* for 2026; Ramanasramam holds Veda parayanam, Upadesa Saram, Aksharamanamalai, collective silence, girivalam.
  - **Aradhana (Mahanirvana):** **Apr 14 fixed** (Chithirai) — mahanirvana **14-04-1950** at Ramanasramam; annual Aradhana Apr 14–15 per Ramanalayam *“76th Aradhana Wednesday 15 April”* 2026; coincides with Tamil New Year window.
- **JSON:** Jayanthi `kind: "nakshatra", tMonth 8/val 6 (Punarpoosam)`; Aradhana `kind: "fixed", month 4/day 14`.

### 2.5 Pamban Swamigal — Pamban Swamigal Samadhi, Tiruvanmiyur, Chennai

*Kumara Gurudasa Swamigal, Kaliyuga Siddhar, Murugan devotee — 6666 poems, 32 viyasams, 1000 names.*

- **Life:** Born Pamban Island, lived as saint, wrote in 130 Tamil grammatical forms, saw Murugan as infant + two dancing peacocks on 11th day; preferred silent *Aka Pooja*; *Mayura Vahana Seva Vizha* still observed at samadhi.
- **Samadhi:** **30-05-1929 07:15am** at Tiruvanmiyur (Wikipedia / siddha-heartbeat blog May 2016).
- **Observance (pambanswamigal.net + Arulvazhi YouTube 05-06-2026):** **Gurupooja fixed May 30** annual at samadhi, frequently shifted to first convenient weekend in May/June — e.g. *“97th Guru Pooja 06-06-2026 at Kanchipuram Skandhalaya”* with abhishekam & pushpanjali. Temple guide lists special Gurupooja around May/June Tiruvanmiyur. Display kept as `May 30 (fixed) · Vaikasi`.
- **JSON:** `kind: "fixed", month 5/day 30`; note May/June window.

### 2.6 Pattinathar — Pattinathar Temple, Tiruvottriyur seashore, Chennai

*Renunciate saint, Tiruvottriyur seaside linga samadhi.*

- **Tradition:** Belongs to **Uthiradam (Uttara Ashadha)** star — *“Saint Pattinathar belongs to Uthirada Star, hence pujas are offered on the star days each month”* (Dinamalar id=53, LiveChennai).
- **Observance (Dinamalar / DivineGuide):** **Guru Puja on Uthiradam star day following the full moon in Aadi (July–Aug)** — *“Guru Puja is devotionally celebrated on the Uthiradam star day following the full moon day in the month of Aadi”* at the Bay of Bengal seaside shrine (no tower/vimana, linga on square peeta facing sea, Nagarabharana). Daily darshan 06:30–12:00 & 16:00–20:00, Pradosha/Shivaratri/Aipasi Annabishekam also observed.
- **JSON:** `kind: "nakshatra", tMonth 3 (Aadi)/val 20 (Uthiradam)`; display `Aadi Uthiradam (after Pournami)` — engine flags Aadi Uthiradam; pournami-adjacency is noted but not enforced (avoids missing the day when thithi window straddles).

### 2.7 Kanchi Maha Periyava — Kanchi Kamakoti Peetam

*Jagadguru Chandrasekharendra Saraswati, 68th Pontiff (1907–1994), “Paramacharya”.*

- **Born:** **20-05-1894**, Villupuram, 19 nazhigai morning, **Anusham (Anuradha)** in **Vaikasi**, Jaya varusham, Vaikasi 8th day, Sunday — Salivahana Era 1817 — named Swaminathan (Mahendramangalam bio). Second son of Subramania Sastri (Inspector of Schools).
- **Peetam:** Ashram sweekara **13-02-1907** (Paraabhava, Maasi 2, Wednesday), age 13; name Chandrasekharendra Saraswati after guru.
- **Observances (kamakoti.org calendar + Hindu + mahaperiyavaa.blog):**
  - **Jayanthi:** **Vaikasi Anusham** annually — *“121st Jayanthi 12-06-2014 Vaikasi Anusham at Shrimatam”*; *“133rd Jayanthi 31-05-2026 Sunday at Kanchi / Thiruvanaikoil”*; 2023 Anusham shared with **Thiruvalluvar** — *“Vaikasi Anusham is the Jayanthi of both Thiruvalluvar and Mahaperiyava”*; donc along with deivathin kural Thirukkural series.
  - **Aradhana / Siddhi:** **Jan 8 fixed** — *“attained siddhi Saturday 8th January 1994”* (Mahendramangalam); annual *Paramaguru Aaradhana Jan 8* per Kamakoti 2023-24 calendar (`08 Jan Monday — HH Pujya Sri Chandrasekharendra Saraswathi Mahaswamigal Paramaguru Aaradanai`).
- **JSON:** Jayanthi `kind: "nakshatra", tMonth 1/val 16 (Anusham)`; Aradhana `kind: "fixed", month 1/day 8`.

### 2.8 Annamalai Swami — Annamalai Swamigal Ashram, Palakothu, Tiruvannamalai

*Direct disciple & construction manager of Ramana; “Living by the Words of Bhagavan”.*

- **Born:** 1906, illiterate by design (parents feared sanyasa), taught himself to read; fled at 17, reached Tiruvannamalai 1928 age 22, served Ramana as attendant & construction manager for a decade; one bathing episode both fell into samadhi.
- **Life after Ramana:** Told by Bhagavan to *stay put* — did so for 50 years in same house at Palakothu, never leaving even for cataract surgery (done in his room); built Samadhi shrine in 1985 with Siva Lingam.
- **Mahasamadhi:** **09-11-1995 04:45 AM**, seated on chair at his house; body in Samadhi temple built 10 years earlier; trust: `Sri Satguru Annamalai Swamigal Memorial/Spiritual Trust`.
- **Observance (sriannamalaiswami.org/mahasamadhi + latest-news):** **Aradhana Nov 9 fixed** annually at Palakothu Samadhi Shrine (next to Ramanasramam) — Ribhu Gita chanting, Aarathi by Sundaram Swami, annadhanam, ~40+ devotees; also *Final Talks* book launch on Ramana Aradhana day.
- **JSON:** `kind: "fixed", month 11/day 9`; note disciple lineage.

### 2.9 Maha Avatar Babaji — Kriya Yoga lineage, Parangipettai (Porto Novo), Cuddalore

*Mahavatar — Deathless Siddhar, disciple of Bhogar, reviver of Kriya Yoga.*

- **Born:** **30-11-203 CE**, Parangipettai (Swethanathapuram), **Rohini nakshatra**, **Karthigai Deepam** (Tamil month Karthigai), to Nambudri Brahmin priest Swethanatha Ayyar & Gnanambal; birth name Nagarajan/Nagaraj = “Serpent King” (Kundalini) — claimed by Kriya Babaji Sangah (V.T. Neelakantan & S.A.A. Ramaiah, founded 17-10-1952 at Babaji’s request) via Govindan’s *Babaji and the 18 Siddha Kriya Yoga Tradition*. Yogananda (*Autobiography of a Yogi*, 1946) notes Babaji intentionally kept birth secret — “None knows his age, family, birthplace.”
- **Life:** Disciple of **Bhogar** (Boganathar) and Agastya; practiced at Kataragama (Sri Lanka) & Badrinath Himalayas; immortality via Kaya Kalpa; revived Kriya Yoga to Lahiri Mahasaya in 1861 at Ranikhet/Dunagiri.
- **Observance (babajiskriyayoga.net / Wikipedia / arunraj.org):** **Jayanthi Nov 30 fixed** — celebrated annually at Parangipettai birth temple (Muthukumaraswamy shrine) with abhishekam on Karthigai Deepam; Rohini star co-observance `Karthigai Rohini` (`tMonth 7/val 3`) is the Tamil stellar anchor, civil anchor is **Nov 30** (month 11/day 30) so the day always flags.
- **JSON:** `kind: "fixed", month 11/day 30`; display `Nov 30 · Karthigai Rohini / Karthigai Deepam`; source cites Babaji Sangah + Yogananda secrecy note.

### 2.10 Bhogar Siddhar — Palani (Navapashana Murugan)

*Maha Siddhar, goldsmith caste, China traveler, alchemist of Palani Navapashana idol.*

- **Life:** Disciple of **Kalanginathar** (Chinese Siddhar) & Agastya; born **Vaigavur near Palani** ~3000 BCE; traveled Tamil Nadu → China (Bogar 7000 via Tamraparni sea route, Sri Lanka), taught Siddha medicine/astrology/yoga; created **Navapashana (Nava Bashanam) Murugan** at Palani (4448 herbs / 9 poisons, 81 Siddhars) seconded by Agastya; installed Maragatha Lingam + Bhuvaneshwari Yantra; chose Palani Malai for tapas; attained **Swrupa samadhi** inside Palani Murugan sanctum (southwest corner, underground cave, now worshipped at entrance).
- **Works:** *Bhogar 7000*, *Bhogar Vaithiyam*, *Jnana Sagarama*; taught Pulipani, Konkanar, Karuvurar, Idaikadar, Babaji.
- **Observance (18-Siddhar table / agathiyarvanam 13-06-2015 / Jothishi.com / siddharpulippanitradition.org / palani.org/bhogar):** **Jayanthi Vaikasi Bharani** (`tMonth 1/val 1` Bharani) — *“Born in Vaikasi month under Bharani nakshatra”* (300 yrs 18 days, Samadhi Palani). Celebrated annually **Vaikasi Bharani** at Palani Hill + Kataragama Yantra shrine.
- **JSON:** `kind: "nakshatra", tMonth 1/val 1 (Bharani)`; display `Vaikasi Bharani`.

### 2.11 Pulipani Siddhar — Palani Adivaram (Pulipani Ashram)

*“Tiger-handed” — disciple who fetched herbs on tiger-back for Bhogar’s Navapashana.*

- **Life:** Chief disciple of **Bhogar** (called *balaka* / boy by Bhogar in *Saptakanda*); from **China** per siddhapath.info variant, or Tamil per lineage; name from boon of tiger paws to pluck Vilva leaves for Shiva; helped collect 9-herb Nava Bashanam by riding tiger; founded **Pulipani Ashram, Adivaram, Palani** (now Srimath Bhogar Palani Atheenam) per Bhogar’s instruction to marry and maintain Navapashana Murugan + Maragatha Lingam + Bhuvaneshwari for generations. Seven direct heirs attained Jeeva Samadhi (Bhogar → Pulipani line); 13th and living is **Sivananda Pulipani Pathira Swamigal** (Peedathipathi) who simplified palm-leaf siddha arts, yoga, mantra for global disciples.
- **Works:** *Pulipani Jaalam 325, Vaidyam 500, Jothidam 300, etc.* (listed in pulippani siddhar tamil wiki).
- **Observance (siddharpulippanitradition.org Ashram festivals / palani.org):** Exact stellar birth not separately published in the canonical 18-Siddhar table (Pulipani as heir, not in the 18); lineage **co-observes with guru Bhogar during Vaikasi Bharani week** at Palani. Ashram festivals page groups Siddhar Guru Pooja collectively. Kept as **Vaikasi Bharani co-observance** (`tMonth 1/val 1` with note “with Bhogar”) so the disciple appears alongside the guru without inventing a separate star.
- **JSON:** `kind: "nakshatra", tMonth 1/val 1 (Bharani, co-observance)`; display `Vaikasi Bharani (with Bhogar)`; source notes lineage + co-observance.

### 2.12 Goraknath — Nath Sampradaya founder (Kanphata Yogi)

*Maha-Yogi, 9 Naths (Navnath), incarnation of Shiva, founder of Nath / Hatha Yoga monastic movement.*

- **Life:** Early 11th c (some 9th c per Nath tradition), disciple of **Matsyendranath**; born East Bengal (early 1100) per hagiography — ash boon on dung → miraculous child; revived Hatha Yoga (asana, pranayama, shatkarma, mudra, kundalini), authored *Goraksha Shataka* etc.; city **Gorakhpur** (UP) + **Gorkha** district Nepal named after him; cave padukas at Gorkha, Gorakhpur temple; teachings beyond time per Nath view — “he has no origin and end.”
- **Observance (nepalipatro.com / pavitrajyotish.com / Wikipedia Goraksha + hamropatro May 1):** **Jayanthi Vaishakh Purnima** — *“Gorakhnath Jayanti on Purnima of Vaishakh Shukla Paksha”* (also Vaishakh Purnima = **Vaikasi Purnima**). Celebrated with Bhandaras, fairs, yoga/meditation at Gorakhnath Math. Variants: Magh Shukla Trayodashi, Karthigai Trayodashi per some sects — primary is Vaishakh Purnima; our rule keeps the primary.
- **JSON:** `kind: "tithi", tMonth 1/val 14 (Vaikasi Purnima)`; display `Vaikasi Purnima (Vaishakh Purnima)`; note variants.

### 2.13 Matsyendranath — Machamuni, founder of Hatha Yoga / Kaula

*Adinath’s first disciple (Shiva → Matsyendra → Goraksha), 84 Mahasiddhas, 9 Naths — “Lord of the Fishes”.*

- **Life:** Fl. 7th–12th c (640 Narendra Deva Nepal  → 12th c Jnaneshwar), fisher-swallowed legend — heard Shiva teach Yoga to Parvati inside fish, attained Kaula; patron of **Nepal** (Rato Machindranath, world’s largest chariot festival), Thiruparankundram (Madurai) **Kasi Viswanathar Temple Jeeva Samadhi** as **Machamuni** in Tamil Siddhar tradition (18 Siddhars, Thiruparankundram). Captive in *Triya* (women realm) rescued by Gorakhnath disguised as dancing girl; Yamadharma’s Patala ledger erased by Gorakhnath.
- **Observance (hindupad.com/macchindranath-jayanti 08-09-2024 + Wikipedia Matsyendranatha / sannidhi.net Machamuni):** **Jayanthi Bhadrapada Shukla Panchami** (also called Machindra Nath Jayanti) — observed as **Purattasi Panchami** in Tamil (Bhadrapada = Purattasi). In Marathi Vaishakh Krishna Panchami/Sashti yatra variant noted, but classical Bhadrapada Shukla Panchami is primary. Engine flags `Purattasi Panchami` (tMonth 5 / tithi Panchami = 4).
- **JSON:** `kind: "tithi", tMonth 5/val 4 (Purattasi Panchami)`; display `Purattasi Panchami (Bhadrapada Shukla Panchami)`.

---

## 3. Schema — `rules/siddhar_pujas.json`

```json
{
  "schema": "siddhar-puja-v1",
  "ayaNamsa": "Lahiri",
  "provenance": "reference/provenance_registry.json chapter siddhar_parampara (to be added)",
  "entries": [
    {
      "key": "seshadri_jayanthi",
      "name": "Seshadri Swamigal Jayanthi",
      "aliases": ["..."],
      "kind": "nakshatra",        // nakshatra | fixed  (tithi/tamday not used in v1 but matcher supports them)
      "tMonth": 9,                // 0=Chithirai … 11=Panguni  (only for nakshatra/tithi/tamday)
      "tMonthName": "Thai",
      "val": 12,                  // nakshatra index 0=Aswini … 12=Hastham … 26=Revathi
      "valName": "Hastham (Hasta)",
      "display": "Thai Hastham",
      "source": "Paramporul / ... — human citation",
      "note": "One-line context"
    },
    {
      "key": "yogi_ramsuratkumar_jayanthi",
      "name": "Yogi Ramsuratkumar Jayanthi",
      "kind": "fixed",
      "month": 12,                // Gregorian 1..12
      "day": 1,                   // Gregorian 1..31
      "display": "Dec 1 (fixed)",
      "source": "yogiramsuratkumarashram.org + Wikipedia — …",
      "note": "..."
    }
  ]
}
```

**Conventions:**
- `nakshatra`, `tithi`, `tamday` kinds use Tamil solar `tMonth` + `val` (Sun rashi at sunrise, `engine.js:tamilDate`, `rashiOf`, `nakshatraOf`).
- `fixed` kind uses Gregorian `month`/`day` directly — no `tMonth`/`val`. Display may carry Tamil thithi context (e.g. `Feb 20 · Masi Dwadashi`) but matching is civil-date exact so the day always appears.
- Every entry carries `source` (ashram/trust primary) and `note` (one-line human context). Future `provenance_registry.json` chapter `siddhar_parampara` will hold verse-style citations if any classical authority is claimed; v1 leaves it placeholder.

---

## 4. Engine & UI integration

| Area | File | What was done |
|------|------|---------------|
| Globals | `app.js:70` | `let SIDDHAR_PUJAS = null` |
| Fetch | `app.js:1365` | `fetch("./rules/siddhar_pujas.json")` alongside `gochara/tn_holidays/tn_bbox` |
| Matching | `app.js:531` | `festivalMatches()` early-returns false for `fixed`; new `dayMatchesFixed(f,m,d)` + `isSiddharMatch(f,day,y,m,d)` dispatches to fixed vs tMonth+nakshatra |
| Month chips | `app.js:803` | Loop `SIDDHAR_PUJAS.entries` → `isSiddharMatch` → `chip("siddhar", f.name, f.display…)` |
| Detail row | `app.js:880` | Loop same entries → `periodRow(I.san, f.name, f.display·Siddhar, "mut","Siddhar")` in expanded day detail |
| ICS | `app.js:1168` | All-day `event(f.name, dateStr)` via `isSiddharMatch` (so Google Calendar / iOS gets siddhar days) |
| Style | `index.html:95` | `.chip.siddhar{background:#5B4A9A;color:#fff}` — distinct from `.chip.festival` gold and `.chip.holiday` teal; night mode inherits |
| Print | `index.html:288` | Chips carry `print-color-adjust:exact` — siddhar prints as purple pill |

**Matching rule in prose:** for each civil day `(y,m,d)` computed as `day` with `tMonth`, `moonNakshatra`, `tithiIndex`, `tDay` (sunrise→suris), a siddhar entry matches if `kind==="fixed" && month===m && day===d` OR (`tMonth===day.tMonth && val===day.moonNakshatra`) — same sunrise-star principle as Shaiva layer.

**TN gate:** siddhar chips are **not** TN-gated (unlike holidays). They appear for all users regardless of `isInTN()`.

---

## 5. How to add a new Siddhar

1. Verify the primary source (ashram/trust site, samadhi plaque, authoritative calendar). Note whether the tradition keeps a **Tamil nakshatra** or a **Gregorian** anniversary.
2. Add an object to `rules/siddhar_pujas.json:entries` following the schema above. Keep `key` kebab-ish with suffix `_jayanthi/_aradhana/_gurupooja`.
3. No code change. Reload — the new chip appears. For a nakshatra entry, `tMonth`/`val` must use the 0-based indexes above; for fixed, `month`/`day` are Gregorian.
4. Document the source line verbatim in `source` and a one-line `note`.

Example — adding a future entry:

```json
{
  "key": "sivaya_subramuniyaswami_gurupooja",
  "name": "Sivaya Subramuniyaswami Gurupooja",
  "kind": "fixed",
  "month": 11,
  "day": 12,
  "display": "Nov 12 (fixed)",
  "source": "Kauai Aadheenam — Gurudeva Mahasamadhi 12-11-2001",
  "note": "Founder Kauai Aadheenam, Hawaii."
}
```

---

## 6. Verification

- **JSON validity:** `node -e "JSON.parse(fs.readFileSync('./rules/siddhar_pujas.json','utf8'))"` — 12 entries.
- **Matcher unit:** fixed `Oct 11` true only on 10/11, `Dec 1` true only 12/1, `Thai Hastham` true only when `tMonth 9 && val 12`.
- **Calendar smoke:** open `index.html` with any birth → month table now shows purple Siddhar pills (e.g. Oct → Kodi Swamigal, Dec → Yogi Ramsuratkumar, Jan → Kanchi Aradhana, Feb → Yogi Aradhana, Apr → Ramana Aradhana, May → Pamban, Nov → Annamalai Swami; Margazhi/Thai Hastham appear on Hastham days in Margazhi/Thai).
- **ICS:** `Download ICS` → siddhar all-day events included (filter by `SUMMARY` in `.ics`).
- **Tests:** `npm test` still green — `tests-suite` INV/BND/OVR/PRS 310, `marriage` 51, `guna-milap` 45, `gochara` 51.

---

## 7. References (primary)

- Seshadri Ashram — `sriseshadriswamigalashramam.org`, `seshadri.info`, `seshadriswamigal.com`, `tiruvannamalaidevasthanam.org.in`, `paramporul.com/ashram/saints-jayanthi-and-aradhana`, `tiruvarunaimahan.org/sriseshadriashram-4.html`, `ssss-sangam.org/swamigals.php`
- Yogi Ramsuratkumar — `yogiramsuratkumarashram.org`, `yogiramsuratkumar.co.in` (saranalayam calendar), `yogiramsuratkumar.info`, `en.wikipedia.org/wiki/Yogi_Ramsuratkumar`, `or-temple.dinamalar.com/en/new_en.php?id=1177`
- Kodi Swamigal — `kodiswamigal.com` (kodiswamigal-gurupoojai, puravipalayam, gurupoojai-2021/2022/2024), `siddhargalthiruvadi.com/kodi-swamigal-guru-poojai`
- Ramana — `gururamana.org` (timeline, ashram-at-a-glance), `ramanalayam.org/events/2026/aradhana`, `hindu-blog.com` (Bhagavan Jayanthi Dec 25 2026 Margazhi Punarvasu), `blog.dharma-renaissance.org/celebrations/bhagavan-sri-ramana-maharshi-jayanti-2026`
- Pamban — `en.wikipedia.org/wiki/Pamban_Swamigal`, `pambanswamigal.net/festivals.php`, `murugan.org/bhaktas/pamban_swami.htm`, YouTube `Arulvazhi 05-06-2026 97th Gurupooja`
- Pattinathar — `temple.dinamalar.com/en/new_en.php?id=53`, `divineguide.com/temples/arulmigu-pattinathar-temple-thiruvottiyur-chennai`, `livechennai.com/pattinathar.asp`
- Kanchi Maha Periyava — `kamakoti.org/kamakoti/calendar.html`, `/news/2026/133rd-jayanti-*`, `/calendar2023-24.html`, `thehindu.com 04-06-2015 Anusham`, `mahendramangalam.com`, `mahaperiyavaa.blog 02-06-2023 Vaikasi Anusham`
- Annamalai Swami — `sriannamalaiswami.org/mahasamadhi`, `/latest-news`, `kailasapedia.org/wiki/Annamalai_Swamigal`
- Cross-check Tamil `tMonth`/`val` via `drikpanchang.com/tamil/tamil-month-panchangam.html` and `prokerala.com/general/calendar/tamilcalendar.php`

---

*This document is the single later-reference for the siddhar layer. Keep `rules/siddhar_pujas.json` as the machine truth and this `.md` as the human truth — edit both together.*
