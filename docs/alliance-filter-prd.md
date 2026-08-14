# Best-Match Calculator — "Alliance Filter" (PRD)

Companion feature to `marriage.html` / `marriage.mjs`. Lets an alliance search
**first cut on a whitelist of compatible birth combinations** for one partner,
instead of brute-force testing every biodata profile against the full Ashtakoota
engine.

Real source: *Muhurta Chintamani*, Ch.6 (Vivaha Prakarana), pp.149-227 — same
base as the marriage module.

---

## 1. Problem

Alliance screening today (inside `marriage.html`) runs a full 2-stage check per
candidate pair **and** a calendar scan per accepted pair. For a coordinator
handing in N prospect biodatas, most combinations are eliminated at Stage 1 —
often by Nadi / Bhakoot doshas or by a total score < 18 — but that is only
discovered *after* entering each pair.

We want to **invert** the lookup: given **one fixed person's** birth nakshatra,
rashi and pada, compute the **ranked set of partner birth combinations** that
score best on the 36-guna Ashtakoota. The coordinator can then keep only
biodatas whose (nakshatra, rashi, pada) land on a whitelist row.

## 2. Scope

- **Fixed Person**: the anchor chart (Groom or Bride) — nakshatra 1-27,
  rashi 1-12, pada 1-4. Must be a real birth (consistent nakshatra/rashi/pada).
- **Candidate space**: all **astronomically valid** (nakshatra, rashi, pada)
  triples — i.e. the 108 canonical Moon-pada positions (27 x 4), folded into
  36 valid (nakshatra, rashi) pairs. Invalid combinations (e.g. "Ashwini in
  Vrishabha") are never emitted. Generated deterministically from nakshatra
  start longitudes (`NAKSHA = 360/27`, `PADA = NAKSHA/4`).
- **Ranking**: per (nak, rashi) pair, take the **best achievable score over the
  valid padas** (`padaAgnostic` = the user does not need to pick a pada up
  front; the calculator tells them the recommended one). Ranked by:
  1. `isCompatible` (Stage-1 pass) first
  2. `totalScore` desc (36-guna)
  3. tier label precedence (MOST_EXCELLENT > EXCELLENT > MEDIUM > NOT_SUITABLE)
  4. parihara count desc (Nadi/Bhakoot cancelled is better than open)
  5. lower Nadi/Bhakoot dosha severity
- **Output**: ranked table (default top 18) + a "compatible whitelist" =
  every row that `isCompatible` (score >= 18, no open Nadi/Bhakoot dosha).
- **First-cut marriage-nakshatra flag**: a row's partner birth nakshatra is also
  flagged `birthNakInMarriageList` against Ch.6 p.194's 11 marriage
  nakshatras (Mrigashira, Hasta, Moola, Anuradha, Magha, Rohini, Revati,
  Uttaraphalguni, Uttarashadha, Uttarabhadrapada, Swati) — a Stage-2 hint only.

Out of scope (deferred):
- Calendar/day search (Stage 2) is **not** pre-computed here. This tool is a
  birth-combination pre-filter; once a real partner profile matches a
  compatible whitelist row, run it through `marriage.html`'s day scan.
- The 21 non-core Vivaha doshas (Latta/Jamitra/Paata/Ekargala + Sun/Moon-in-Lagna
  removal) are day-level and not meaningful at the birth-combination level;
  they are evaluated at scan time in `marriage.html`.

## 3. User-facing behavior

1. User picks their role (Groom / Bride) and enters their **own** birth
   nakshatra, rashi, pada.
2. Clicks "Compute Best Matches".
3. UI shows:
   - Tier 1: **Compatible whitelist** (count + compact list of nakshatra +
     rashi + recommended pada + score + tier).
   - Tier 2: **Top 18 ranked** rows in a table (with per-row koota breakdown on
     hover / expandable).
   - **Export**: JSON (full ranking) + CSV (table) + "Print to PDF" (browser
     print of the ranked view).
4. Fail state: if the fixed person's inputs are internally inconsistent or yield
   zero compatible candidates, show a clear alert (mirroring `marriage.html`'s
   fail-fast style).

## 4. Data schema

```typescript
// Input (the fixed anchor person)
interface AllianceInput {
  role: "groom" | "bride";
  nakshatra: number;   // 1..27
  rashi: number;       // 1..12
  pada: number;        // 1..4
}

// One ranked, pada-agnostic best row per valid (nakshatra, rashi) pair
interface AllianceRow {
  rank: number;            // 1-based
  nakshatra: number;        // 1..27
  nakshatraName: string;
  rashi: number;            // 1..12
  rashiName: string;
  bestPada: number;         // 1..4 — the pada that realizes totalScore
  totalScore: number;       // 0..36 (max over valid padas)
  scorePercentage: number;
  tierLabel: "MOST_EXCELLENT" | "EXCELLENT" | "MEDIUM" | "NOT_SUITABLE" | null;
  isCompatible: boolean;    // >= 18 + no open Nadi/Bhakoot dosha (Stage 1 pass)
  hasNadiDosha: boolean;     // on the best-pada profile
  hasBhakootDosha: boolean;
  nadiPariharaApplied: boolean;
  bhakootPariharaApplied: boolean;
  birthNakInMarriageList: boolean;  // Ch.6 p.194 11-star marriage list
  breakdown: {               // 8 kootas, best-pada profile
    varna:    { score: number, maxScore: 1, details: string };
    vashya:   { score: number, maxScore: 2, details: string };
    tara:     { score: number, maxScore: 3, details: string };
    yoni:     { score: number, maxScore: 4, details: string };
    maitri:   { score: number, maxScore: 5, details: string };
    gana:     { score: number, maxScore: 6, details: string };
    bhakoot:  { score: number, maxScore: 7, isCanceled: boolean, details: string };
    nadi:     { score: number, maxScore: 8, isCanceled: boolean, details: string };
  };
}

interface AllianceWhitelist {
  schema: "alliance-whitelist-v1";
  generatedAt: string;          // ISO
  fixedPerson: {
    role: string; nakshatra: number; nakshatraName: string;
    rashi: number; rashiName: string; pada: number;
  };
  options: { topN: number; minScore?: number };
  ranking: AllianceRow[];       // sorted, sliced to topN
  compatible: AllianceRow[];    // isCompatible rows, full (no slice)
  summary: {
    validProfiles: number;      // 108
    candidatePairs: number;     // 36 valid (nak,rashi)
    compatibleCount: number;
    byTier: Record<string, number>;
    maxScore: number;
    recommended: AllianceRow | null;  // top compatible row (or top row overall)
  };
  provenance: string;          // "Muhurta Chintamani - Vivaha Prakarana (Chapter 6)"
}
```

CSV columns: `rank,nakshatra,rashi,bestPada,totalScore,scorePercentage,tierLabel,isCompatible,nadiDosha,bhakootDosha,pariharas,birthNakInMarriageList`.

## 5. Engine contract (alliance-filter.mjs)

| Export | Role |
|---|---|
| `generateValidProfiles()` | `() => Array<{nakshatra,rashi,pada}>` — 108 canonical triples. |
| `computeAllianceWhitelist(input, rules, opts)` | pure; reuses `calculateAshtakoota` from `marriage.mjs`; returns `AllianceWhitelist`. `opts.topN` (default 18), `opts.minScore` (default 18). |
| `toCSV(rows)` / `toJSON(whitelist)` | exporters. |

Design notes:
- **Pada handling**: for a given (p2_nak, p2_rashi) the valid padas come from
  `generateValidProfiles()` (a nakshatra rarely lands in >1 rashi, and each rashi
  landing owns 1-4 padas). We score each valid (p2_nak, p2_rashi, p2_pada) against
  the fixed p1 and take the max `totalScore` as that row's score; `bestPada` is the
  first pada achieving it. This is genuinely "pada-agnostic best" while still
  surfacing the exact quarter a real coordinator should record for the partner.
- **Nadi Pada-Bheda**: correctly honored because the fixed p1 carries a concrete
  `pada` — a same-star-same-rashi candidate only cancels Nadi when its `bestPada`
  differs from p1.pada.
- **Reproducibility**: deterministic ordering, no engine/astronomy needed (pure
  function over the 108 canonical profiles + `marriage.mjs` Ashtakoota).
- **Reuse**: no new koota math — delegates every score to `calculateAshtakoota`
  in `marriage.mjs`, so all source-corrected pariharas stay in one place.
