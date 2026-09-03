# Sodashi Tithi Nitya Devis — Sri Vidya Layer

> **Source file:** `rules/nitya_devis.json` (schema `nitya-devi-v1`) · Corpus: `reference/nitya_devis_provenance.json` (chapter `nitya_devi`)  
> **Engine wiring:** `nitya.mjs:8` helpers, `app.js:71` globals, `app.js:1380` fetch, `app.js:812` month Tithi enrichment, `app.js:905` detail row, `app.js:1205` ICS, `index.html:97` chip/nitya style  
> **Status:** v1 · 16 kalās (15 tithi Nityās + 1 Mahā-Nityā Lalitā) · local-first, no API  
> **Purpose:** show, for each civil day's sunrise tithi, the presiding Śoḍaśī Tithi Nityā — and on Amāvāsyā/Pūrṇimā the 16th Mahā-Nityā — with a mantra discoverable only in the expanded row behind a subtle dīkṣā notice. Mobile-first.

---

## 0. Why this layer, and what it is not

The lunar month is not just 30 tithis; in Śrī Vidyā it is **16 kalās** ruled by 16 Nityās. The 15 visible kalās are the 15 tithi Nityās (Kāmeśvarī … Citrā); the 16th `Amṛtā / Sadākhyā` is `Mahā Tripura Sundarī / Lalitā / Ṣoḍaśī` herself in the Bindu. This is not a muhūrta score — it never turns a day Shubh/Aśubh — it is a *remembrance* layer, like Siddhar pujas, that lets a practitioner see *which Devi presides today* and, if initiated, which vidyā belongs there.

Classical authorities: `Tantrarāja Tantra` (central Nityā chapter + mantras/yantras), `Jñānārṇava`, `Nitya-Ṣoḍaśārṇava`, `Dakṣiṇāmūrti Saṃhitā`, `Śrīvidyārṇava Tantra` ch.7/20-21, `Parāśurāma Kalpasūtra` + Rameśvara, `Nityotsava` (Umānandanātha), `Kāmakalā Vilāsa` v.13. The widely-quoted English summary used for cross-check is `15nitya.com`, `arunraj.org/nitya-devi`, `srimeru.org Tithi-Nitya Pūjā PDF`, `astrojyoti/lunar-phases` — all PDF/transcriptions of the same Tantrarāja verses.

**Scope:** display only. Sunrise-tithi anchoring (same instant as the Tithi column today). Authentic full mantras are public-domain transcriptions from Tantrarāja; they are shown *only* in the expanded row, never inline in the table, behind a subtle notice (see §7).

---

## 1. Lock-ins — D1 … D5 as decided 2026-09-03

| Decision | Choice | What it locks |
|----------|--------|---------------|
| **D1** | **Pedagogic counting** — 15 + 1 (Lalitā outside the 15). `Kṛṣṇa-forward, Śukla-reverse` per `Tantrarāja / 15nitya.com / arunraj.org` | Corpus 15 entries for tithis + 1 Mahā-Nityā for Amāvāsyā/Pūrṇimā. Krishna Pratipad (index 15) = Kāmeśvarī … Krishna Chaturdaśī = Jvālāmālinī; Śukla Pratipad (index 0) = Citrā … Śukla Chaturdaśī = Bhagamālinī. `Tvaritā` (Aṣṭamī, #8) is the pivot — **identical both pakṣas** and adorns the crown. See full table §3. |
| **D2** | **Amāvāsyā + Pūrṇimā → Mahā Tripura Sundarī** (16th Amṛtā kalā) with an **unobstructive subtle dīkṣā notice** | Detail row for those two tithis shows Lalitā/Ṣoḍaśī only, with the 16-syllable Vidyā and a one-line footer: *“These vidyās are dīkṣā-bound in Śrī Vidyā; display is informational — chant only as your guru instructs.”* Not a modal blocker, not hidden. |
| **D3** | **Mantra only in expanded row** (never in the table) | Bhagamālinī alone is ~60 padas; table truncation would be lossy. The month cell holds only the Devi name (+ optional dot); the full `mantraTarpana` + dhyāna ref lives in the `.mdetail` row with a `Copy` affordance. |
| **D4** | **Enrich the Tithi** (Option B), mobile-preferred | No new column. Tithi TD becomes `Pratipad · Kāmeśvarī` (desktop) with a stack-friendly wrap; on ≤640 px the same string stays on one line in the card via `td::before` label logic already in `index.html`. Keeps the 5-col desktop intact (Date · Tithi · Nakshatra · Kalam · Events). Visit the table, not the Events chips, to see the Nitya. |
| **D5** | **`kalā + bīja` stored, detail-only** | Corpus carries `kalaName` (Manadā … Pūrṇā + Amṛtā) and `bija` (अं आं इं … अः) per Tantrarāja; rendered only in the expanded row as `Manadā kalā · bīja अं`. Table stays light. |

> **Reversal dispute noted for honesty:** the Śrīmeru/StotraVeda pddhati line teaches the mirror (`Śukla-forward Kāmeśvarī→Citrā`). We deliberately follow **Tantrarāja-pedagogic Kṛṣṇa-forward** here and record it as `mapping.convention: "pedagogic-krishna-forward"` in `nitya_devis.json`. Switch is a single boolean if a lineage prefers the mirror.

---

## 2. The 16 kalās at a glance

| # | Devi (IAST) | Tamil / search key | Kala · bīja | Presides (pedagogic) | Key |
|---|-------------|-------------------|-------------|----------------------|-----|
| 1 | Kāmeśvarī | Kameshwari | Manadā · अं | Kṛṣṇa Pratipad (idx 15) / Śukla Chaturdaśī (idx 13) reverse pair | `kameshwari` |
| 2 | Bhagamālinī | Bhagamalini | Pūṣā · आं | Kṛṣṇa Dvitīyā / Śukla Trayodaśī | `bhagamalini` |
| 3 | Nityaklinnā | Nityaklinne | Tuṣṭi · इं | Kṛṣṇa Tṛtīyā / Śukla Dvādaśī | `nityaklinna` |
| 4 | Bheruṇḍā | Bherunde / Bherunda | Puṣṭi · ईं | Kṛṣṇa Chaturthī / Śukla Ekādaśī | `bherunda` |
| 5 | Vahnivāsinī | Vanhivasini | Rati · उं | Kṛṣṇa Pañcamī / Śukla Daśamī | `vahnivasini` |
| 6 | Mahā Vajreśvarī | Maha Vajreshwari | Dhṛti · ऊं | Kṛṣṇa Ṣaṣṭhī / Śukla Navamī | `maha_vajreshwari` |
| 7 | Śivadūtī (Raudrī) | Shivadooti | Śaśinī · ऋं | Kṛṣṇa Saptamī / Śukla Aṣṭamī (?) — sequence holds, see §3 | `shivaduti` |
| 8 | **Tvaritā** | **Tvarita / Twarita** | **Chandrikā · ॠं** | **Aṣṭamī both pakṣas — common crown** | `tvarita` |
| 9 | Kulasundarī | Kulasundari | Kānti · ऌं | Kṛṣṇa Navamī / Śukla Saptamī | `kulasundari` |
| 10 | Nityā (Nityāmbā) | Nitya | Jyotsnā · ॡं | Kṛṣṇa Daśamī / Śukla Ṣaṣṭhī | `nitya` |
| 11 | Nīlapatākā | Nilapataka | Śrī · एं | Kṛṣṇa Ekādaśī / Śukla Pañcamī | `nilapataka` |
| 12 | Vijayā | Vijaya | Prīti · ऐं | Kṛṣṇa Dvādaśī / Śukla Chaturthī | `vijaya` |
| 13 | Sarvamaṅgalā | Sarvamangala | Aṅgadā · ओं | Kṛṣṇa Trayodaśī / Śukla Tṛtīyā | `sarvamangala` |
| 14 | Jvālāmālinī | Jwalamalini | Pūrṇā · औं | Kṛṣṇa Chaturdaśī / Śukla Dvitīyā | `jvalamalini` |
| 15 | Citrā (Vicitrā) | Chitra | (Pūrṇā-vicitrā) · अं* | Kṛṣṇa Pañcadaśī / Śukla Pratipad | `chitra` |
| 16 | **Mahā Tripura Sundarī** | **Lalitā · Ṣoḍaśī** | **Amṛtā · अः** | **Amāvāsyā (29) + Pūrṇimā (14)** — Bindu | `maha_tripura_sundari` |

> *`bīja` for Citrā varies by manuscript (`च्कौं` in some transcripts); corpus stores the Tantrarāja form and notes variant.

Full pedagogic mapping table below removes the pairwise ambiguity.

---

## 3. Tithi → Nitya mapping (sunrise-anchored, the only mapping the code uses)

`engine.js:21` `TITHI_NAMES` is 0..29 where `0=Śukla Pratipad … 14=Pūrṇimā, 15=Kṛṣṇa Pratipad … 29=Amāvāsyā`. `day.tithi.index` is that value; `day.tithi.paksha` follows; `k = index % 15` is the position inside the pakṣa (0=Pratipad … 14=Pañcadaśī).

| Tithi (civil sunrise) | idx | pakṣa | k | Nitya (pedagogic) | kala | note |
|---|---|---|---|---|---:|---|
| Śukla Pratipad | 0 | Śukla | 0 | **Citrā** | 15 | reverse start |
| Śukla Dvitīyā | 1 | Śukla | 1 | **Jvālāmālinī** | 14 | |
| Śukla Tṛtīyā | 2 | Śukla | 2 | **Sarvamaṅgalā** | 13 | |
| Śukla Chaturthī | 3 | Śukla | 3 | **Vijayā** | 12 | |
| Śukla Pañcamī | 4 | Śukla | 4 | **Nīlapatākā** | 11 | |
| Śukla Ṣaṣṭhī | 5 | Śukla | 5 | **Nityā** | 10 | |
| Śukla Saptamī | 6 | Śukla | 6 | **Kulasundarī** | 9 | |
| **Śukla Aṣṭamī** | 7 | Śukla | 7 | **Tvaritā** | 8 | **common crown** |
| Śukla Navamī | 8 | Śukla | 8 | **Śivadūtī** | 7 | mirror of 9 |
| Śukla Daśamī | 9 | Śukla | 9 | **Mahā Vajreśvarī** | 6 | |
| Śukla Ekādaśī | 10 | Śukla | 10 | **Vahnivāsinī** | 5 | |
| Śukla Dvādaśī | 11 | Śukla | 11 | **Bheruṇḍā** | 4 | |
| Śukla Trayodaśī | 12 | Śukla | 12 | **Nityaklinnā** | 3 | |
| Śukla Chaturdaśī | 13 | Śukla | 13 | **Bhagamālinī** | 2 | |
| **Pūrṇimā** | 14 | Śukla | 14 | **Mahā Tripura Sundarī** | Amṛtā | Bindu |
| Kṛṣṇa Pratipad | 15 | Kṛṣṇa | 0 | **Kāmeśvarī** | 1 | forward start |
| Kṛṣṇa Dvitīyā | 16 | Kṛṣṇa | 1 | **Bhagamālinī** | 2 | |
| Kṛṣṇa Tṛtīyā | 17 | Kṛṣṇa | 2 | **Nityaklinnā** | 3 | |
| Kṛṣṇa Chaturthī | 18 | Kṛṣṇa | 3 | **Bheruṇḍā** | 4 | |
| Kṛṣṇa Pañcamī | 19 | Kṛṣṇa | 4 | **Vahnivāsinī** | 5 | |
| Kṛṣṇa Ṣaṣṭhī | 20 | Kṛṣṇa | 5 | **Mahā Vajreśvarī** | 6 | |
| Kṛṣṇa Saptamī | 21 | Kṛṣṇa | 6 | **Śivadūtī** | 7 | |
| **Kṛṣṇa Aṣṭamī** | 22 | Kṛṣṇa | 7 | **Tvaritā** | 8 | **same as Śukla Aṣṭamī** |
| Kṛṣṇa Navamī | 23 | Kṛṣṇa | 8 | **Kulasundarī** | 9 | |
| Kṛṣṇa Daśamī | 24 | Kṛṣṇa | 9 | **Nityā** | 10 | |
| Kṛṣṇa Ekādaśī | 25 | Kṛṣṇa | 10 | **Nīlapatākā** | 11 | |
| Kṛṣṇa Dvādaśī | 26 | Kṛṣṇa | 11 | **Vijayā** | 12 | |
| Kṛṣṇa Trayodaśī | 27 | Kṛṣṇa | 12 | **Sarvamaṅgalā** | 13 | |
| Kṛṣṇa Chaturdaśī | 28 | Kṛṣṇa | 13 | **Jvālāmālinī** | 14 | |
| **Amāvāsyā** | 29 | Kṛṣṇa | 14 | **Mahā Tripura Sundarī** | Amṛtā | Bindu |
| (Kṛṣṇa Pañcadaśī display value) | — | — | 14 | **Citrā** | 15 | only if a text counts Amāvāsyā as 15th and Pūrṇimā separately; not needed when Mahā fills both. Our code uses the row above. |

*Tvaritā invariance:* both `idx 7` and `idx 22` (Aṣṭamī) resolve to `tvarita`. This is the classical `crown` check — import test asserts it.

---

## 4. Mantras (verbatim tarpaṇa vidyā from Tantrarāja; public-domain transcription)

Stored per-entry as `mantraTarpana` + short `mantraBija` where useful. Shown **only** in the expanded row with a Copy button. Truncation is forbidden in JSON; UI may ellipsize with `…` but the copied value is the full string.

| Devi | Mantra (tarpaṇa form `… Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ`) |
|------|---------------------------------------------------------------|
| Kāmeśvarī | `Aiṃ Hrīṃ Śrīṃ Aṃ Aiṃ Sa Ka La Hrīṃ Nityaklinne Madadrave Sauḥ Aṃ Kāmeśvarī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Bhagamālinī | `Aiṃ Hrīṃ Śrīṃ Aṃ Aiṃ Bhagabhuge Bhagini Bhagodari Bhagamāle Bhagāvahe Bhagaguhye Bhagayoni Bhaganipātini Sarvabhagavaśaṅkari Bhagarūpe Nityaklinne Bhagasvarūpe Sarvāṇi Bhagāni Me Hyanaya Varade Rete Surete Bhagaklinne Klinnadrave Kledaya Dravaya Amoghe Bhagavicce Kṣubha Kṣobhaya Sarvasatvān Bhagodari Aiṃ Bluṃ Jeṃ Bluṃ Bheṃ Bluṃ Moṃ Bluṃ Heṃ Bluṃ Heṃ Klinne Sarvāṇi Bhagāni Me Vaśamānaya Strīṃ Hara Bleṃ Hrīṃ Aṃ Bhagamālinī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Nityaklinnā | `Aiṃ Hrīṃ Śrīṃ Iṃ Oṃ Hrīṃ Nityaklinne Madadrave Svāhā Iṃ Nityaklinnā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Bheruṇḍā | `Aiṃ Hrīṃ Śrīṃ Īṃ Oṃ Kroṃ Bhroṃ Krauṃ Jhmrauṃ Cchrauṃ Jrauṃ Svāhā Īṃ Bheruṇḍā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Vahnivāsinī | `Aiṃ Hrīṃ Śrīṃ Uṃ Oṃ Hrīṃ Vahnivāsinyai Namaḥ Uṃ Vahnivāsinī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Mahā Vajreśvarī | `Aiṃ Hrīṃ Śrīṃ Ūṃ Hrīṃ Klinne Aiṃ Kroṃ Nitya Madadrave Hrīṃ Ūṃ Mahāvajreśvarī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Śivadūtī | `Aiṃ Hrīṃ Śrīṃ Śivadūtyai Namaḥ Śivadūtī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Tvaritā | `Oṃ Hrīṃ Huṃ Khe Ca Che Kṣaḥ Strīṃ Huṃ Kṣe Hrīṃ Phaṭ` (Tantrarāja Tvaritā vidyā; pujā form adds `… Tvaritā Nityā … Tarpayāmi Namaḥ` where manuscripts include it) |
| Kulasundarī | `Aiṃ Hrīṃ Śrīṃ Aiṃ Klīṃ Sauḥ Kulasundarī Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Nityā | `Ha Sa Ka La Rā Ḍaiṃ Ha Sa Ka La Rā Ḍīṃ Ha Sa Ka La Rā Ḍauḥ Nityā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Nīlapatākā | `Aiṃ Hrīṃ Śrīṃ Phreṃ Struṃ Kroṃ Aṃ Klīṃ Aiṃ Bluṃ Nityamadadrave Huṃ Phreṃ Hrīṃ Eṃ Nīlapatākā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Vijayā | `Aiṃ Hrīṃ Śrīṃ Bha Ma Rā Ya Auṃ Aiṃ Vijayā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Sarvamaṅgalā | `Aiṃ Hrīṃ Śrīṃ Svauṃ Oṃ Sarvamaṅgalā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| Jvālāmālinī | `Oṃ Namo Bhagavati Jvālāmālini Devadevi Sarvabhūtasaṃhārakārike Jātavedasi Jvalanti Jvala Jvala Prajvala Prajvala Hrīṃ Hrīṃ Huṃ Raṃ Raṃ Raṃ Raṃ Raṃ Raṃ Raṃ Jvālāmālinī Huṃ Phaṭ Svāhā` (+ tarpaṇa closure where manuscripts add it) |
| Citrā | `Aiṃ Hrīṃ Śrīṃ Ckauṃ Aṃ Citrā Nityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` |
| **Mahā Tripura Sundarī (Ṣoḍaśī)** | `Aiṃ Hrīṃ Śrīṃ Ka E Ī La Hrīṃ Ha Sa Ka Ha La Hrīṃ Sa Ka La Hrīṃ` (16-syllable Śrī Vidyā; tarpaṇa form `… Ahaṃ Ṣoḍaśī Mahānityā Śrī Pādukāṃ Pūjayāmi Tarpayāmi Namaḥ` in Nityotsava) |

> Transcribed from `Tantrarāja / Śrīvidyārṇava / srimeru PDF` convergent lines. Minor sandhi/spelling drifts (`Bhroṃ` vs `Broṃ`) are kept as in Tantrarāja; corpus records the chosen manuscript spelling per entry with `variant: [...]` note if needed.

Each Devi also has a `dhyāna-śloka` (e.g. Kāmeśvarī `Bālābham…`, Bhagamālinī `…Bhagarūpā…`) quoted in `stotranidhi` and `Tantrarāja`. Stored as `dhyanaRef` (first pāda + URL) not as full blockquote to keep JSON readable; the expand row links to the stotranidhi page.

---

## 5. Schema — `rules/nitya_devis.json`

```json
{
  "schema": "nitya-devi-v1",
  "ayaNamsa": "Lahiri",
  "provenance": "reference/provenance_registry.json chapter nitya_devi",
  "mapping": {
    "convention": "pedagogic-krishna-forward",
    "tvaritaIsCommon": true,
    "amavasyaAndPurnima": "maha_tripura_sundari",
    "source": "Tantrarāja Tantra / Jñānārnava / Śrīvidyārṇava — 15nitya.com + arunraj.org cross-check"
  },
  "entries": [
    {
      "key": "kameshwari",
      "deviName": "Kāmeśvarī",
      "tamilName": "Kameshwari",
      "tithiNumber": 1,
      "kalaName": "Manadā",
      "bija": "अं",
      "display": "Kāmeśvarī",
      "mantraTarpana": "Aiṃ Hrīṃ … Namaḥ",
      "dhyanaRef": "Tantrarāja — Bālābham … (stotranidhi.com/nitya-devi-dhyana-shloka)",
      "source": "Tantrarāja / srimeru PDF v1",
      "note": "Kṛṣṇa Pratipad; mirror Śukla Chaturdaśī",
      "warning": "dīkṣā-bound — informational"
    }
  ]
}
```

**Conventions:**
- `entries` holds **16** objects in canonical order 1..15 + Mahā-last; `tithiNumber` is 1..15 for 15 + `16` for Mahā (mirrors kalā count).
- `kalaName`/`bija` travel together; `note` carries the reverse-pakṣa alias for grep.
- No Tamil solar `tMonth` here — this layer is purely **lunar tithi** (`engine.js:tithi()`), independent of Gochara/Siddhar solar month.

---

## 6. Engine & UI integration (what will be built post-lock)

| Area | File | What will be done |
|------|------|-------------------|
| Corpus | `rules/nitya_devis.json` + `reference/nitya_devis_provenance.json` | 16 entries as above; provenance rows `nitya_01`..`nitya_16` with tarpaṇa line as `sanskrit` + short translation |
| Helpers | `nitya.mjs` (pure) | `nityaForDay(day) → entry`, `nityaForTithiIndex(idx) → entry`, `isMahaNitya(day)`; unit-exported; no DOM, reuses `engine.js:TITHI_NAMES` mapping §3 verbatim |
| Globals | `app.js:71` | `let NITYA_DEVIS = null` (+ `let NITYA_BY_KEY = null`) |
| Fetch | `app.js:1380` | `fetch("./rules/nitya_devis.json")` alongside `siddhar_pujas.json` |
| Month Tithi cell | `app.js:812` | Enrich: `<td data-label="Tithi">Pratipad <span class="nitya-inline">· Kāmeśvarī</span></td>` — `day.tithi.name` + `nityaForDay(day).display`. Styles: `.nitya-inline{font-size:10px;color:var(--ink-faint); letter-spacing:.02em}`; wraps naturally; no new column |
| Month Events | not touched | Keeps Siddhar/festival/holiday chips; Nitya is not an Event chip (it's a panchang datum) |
| Detail row | `app.js:905` | In `.mdetail` inserted row: `periodRow(I.nitya, deviName, mantra + " · " + kalaName + " kalā · " + bija + " · " + paksha, "mut", "Nitya")` followed by `Copy` button + subtle footer `ⓘ These vidyās are traditionally dīkṣā-bound; display is public-domain informational — chant only as your guru instructs.` |
| ICS | `app.js:1205` | Append tithi-Nitya to the ICS summary for traceability: `Tithi: Śukla Pratipad — Nitya: Citrā` (current `Tithi` already not in ICS; now it carries Nitya). Maha on Amāvāsyā/Pūrṇimā |
| Style | `index.html:97` | `.nitya-inline`, `.chip.nitya` (reserve for detail-row chip), `.period .mantra{font-family: ui-monospace, "Noto Sans Devanagari", monospace; font-size:11px; white-space:pre-wrap; word-break:break-word}`, `.copy-btn`, `.diksa-footnote{font-size:10px;color:var(--ink-faint);border-left:2px solid var(--line)}` |
| Print | same sheet | `print-color-adjust:exact` — Nitya name prints with the tithi, mantra prints in detail row only when expanded |
| A11y |  | `aria-label` on Tithi cell `Tithi Pratipad, Nitya Kameshwari`; Copy button `aria-label="Copy Nitya mantra"` |

**Why not the Events column:** per your D4 we chose Tithi enrichment. The Events column already carries Siddhar purples; mixing Nitya there would force “Events: Siddhar + Nitya + Festival + Holiday” = noisy. Tithi+ Nitya is semantically one datum (which Devi owns this lunar digit).

**Matching rule in prose:** for a civil day `(y,m,d)` whose sunrise tithi is `tithiWithPaksha`, let `k = tithiIndex % 15`. If `tithi.amavasya || tithi.purnima` → `maha_tripura_sundari`. Else if `paksha==="Krishna"` → `entries[k]` (0→Kāmeśvarī), if `paksha==="Shukla"` → `entries[14 - k]` (0→Citrā). Tvaritā (k=7) is invariant under reverse, hence the classic self-test.

**TN gate:** none — lunar tithi is universal, like Gochara is personal but not region-gated; Nitya shows for all users. Still local-first (no API).

---

## 7. Dīkṣā notice — wording and placement (subtle, unobstructive)

Shown **only** in the expanded detail row, below the mantra, in a faint left-bordered note:

> `ⓘ Śrī Vidyā Nitya vidyās are traditionally dīkṣā-bound. These mantras appear here as public-domain Tantrarāja transcriptions for study. Please chant or practise only as your own guru instructs.`

No gate before viewing; no click-through; no all-caps banner. One line, `color: var(--ink-faint)`, `font-size: 10px`. The mantra `Copy` button sits above it, so the notice is seen after the user has already engaged.

---

## 8. How to correct or extend a Nitya

- Mantra typos → edit `mantraTarpana` string in `rules/nitya_devis.json`; no code. Transcribe exactly from your chosen Tantrarāja manuscript; add `variants: [...]` if lineages differ.
- Want the mirror Śukla-forward convention? Flip `mapping.convention` to `shukla-forward` and swap the two array arms in `nitya.mjs:getForTithiIndex` — one-line change; table updates automatically for every past/future date (no recomputation needed).
- To add per-Nityā gems/colours/yantras later → add optional fields `yantra:b64`, `colour`, `icon` to the entry; UI already reads generically.

---

## 9. Verification (what green looks like)

- **Corpus:** `node -e "JSON.parse(fs.readFileSync('./rules/nitya_devis.json','utf8')).entries.length"` → `16` (15 + 1 Mahā). Every `mantraTarpana` contains `Pūjayāmi Tarpayāmi` or a Tvaritā/Jvālā canonical exception.
- **Matcher unit (standalone):** for 30 `tithiIndex` values, assert `nityaForTithiIndex(0)==chitra`, `7==tvarita`, `14==maha`, `15==kameshwari`, `22==tvarita`, `29==maha` and `for k!=7: nityaForTithiIndex(k) != nityaForTithiIndex(15+k)` yet mirrored (equivalently `nityaForTithiIndex(k) == nityaForTithiIndex(29-k)` for k<15). This is the Tvaritā-crown + mirror test.
- **Calendar smoke:** open `index.html` → any month: Tithi column now reads e.g. `Śukla Pratipad · Citrā` → `Śukla Aṣṭamī · Tvaritā` → `Pūrṇimā · Mahā Tripura Sundarī` → `Kṛṣṇa Pratipad · Kāmeśvarī` → `Kṛṣṇa Aṣṭamī · Tvaritā` → `Amāvāsyā · Mahā Tripura Sundarī`. Tap a row → detail shows mantra + `Manadā kalā · अं` + dīkṣā footer + Copy works (clipboard API with `execCommand` fallback for iOS).
- **Responsive:** Playwright `360×800` → cards still single-wrap for Tithi line; `scrollWidth - clientWidth == 0` on table-wrap. No new column, so no overflow.
- **ICS:** `Download ICS` → `SUMMARY:Tithi - Nitya Kāmeśvarī` lines present for each all-day date.
- **Tests:** `npm test` still green — existing suites (INV/BND/OVR/PRS 310, marriage 51, guna-milap 45, gochara 51) untouched; new `tests/nitya-tests.mjs` under `npm test` does the 30-tithi mirror + mantra-shape.

---

## 10. References (primary, already fetched for this doc — reused at build)

- `15nitya.com` — The Fifteen Nityās and Śrī Cakra (Bright/Dark reversal quoted verbatim), The Expansion of the Nityās (16th as Lalitā in Bindu)
- `arunraj.org/nitya-devi` — kala/bīja/pakṣa table (pedagogic, C15) + dhyāna summary
- `srimeru.org Tithi-Nitya Pūjā PDF` — invocation + 16 upacāras pddhati (used for tarpaṇa spellings)
- `stotraveda.com Powerful Tithi Nitya Devata Mantras` — same mantras with Roman/Harvā transcription
- `astrojyoti.com/lunarphases…` (Pandit S.P. Tata) — kalā list + “Kṛṣṇa forward / Śukla reverse” line
- `wisdomlib.org datal divinities of Tantra Ch.3` (Nityotsava/Bṛhat-Tantrasāra citations) — variant list + ascendo-descendo (Saṃhāra-krama)
- `stotranidhi.com/nitya-devi-dhyana-shloka` — dhyāna-śloka set (one per Nityā)
- `srividya-sadhana.com/nitya-devi`, `blog.shlokmantra.com/16-nitya-devi-mantras`, `indiadivine.org Tithinityas` — cross-check names/spellings
- Cross-check lunar mapping vs `engine.js:21 TITHI_NAMES / 108 tithi()` and `engine.js:113 paksha` — authoritative for the `k`/`paksha` split

---

*This document is the single later-reference for the Nitya layer. Keep `rules/nitya_devis.json` as the machine truth and this `.md` as the human truth — edit both together. To flip conventions (Śukla-forward mirror), change only `mapping.convention` + the glance table §2 — no other doc section needs editing.*
