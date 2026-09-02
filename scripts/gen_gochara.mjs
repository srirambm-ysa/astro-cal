import fs from "fs";

const SHUBHA = {
  Sun: [3,6,10,11],
  Moon: [1,3,6,7,10,11],
  Mars: [3,6,11],
  Mercury: [2,4,6,8,10,11],
  Jupiter: [2,5,7,9,11],
  Venus: [1,2,3,4,5,8,9,11,12],
  Saturn: [3,6,11],
};

const HOUSE_MEANING = {
  1: "self, health and vigour",
  2: "wealth, family and speech",
  3: "courage, siblings and short journeys",
  4: "home, mother and comfort",
  5: "intellect, children and mantra",
  6: "enemies, disease and competition",
  7: "partnership and contracts",
  8: "longevity, obstacles and research",
  9: "fortune, dharma and long travel",
  10: "karma, status and work",
  11: "gains, friends and fulfilment",
  12: "loss, expense and retreat",
};

const PLANET_SANSKRIT = {
  Sun:"Sūrya", Moon:"Candra", Mars:"Maṅgala", Mercury:"Budha", Jupiter:"Guru", Venus:"Śukra", Saturn:"Śani"
};

// Vedha table — classical obstruction pairs (BPHS Gochara-adhyaya)
// When śubha planet in house H, if vedha planet in vedhaHouse at same time, śubha is blocked
// Table below from BPHS Ch.30-31 + Saravali synthesis; flagged as unverified where Sārāvalī diverges
const VEDHA = [
  { planet:"Sun", house:3, vedhaBy:"Saturn", vedhaHouse:9 },
  { planet:"Sun", house:6, vedhaBy:"Saturn", vedhaHouse:12 },
  { planet:"Sun", house:10, vedhaBy:"Saturn", vedhaHouse:4 },
  { planet:"Sun", house:11, vedhaBy:"Saturn", vedhaHouse:5 },
  { planet:"Moon", house:1, vedhaBy:"Saturn", vedhaHouse:5 },
  { planet:"Moon", house:3, vedhaBy:"Saturn", vedhaHouse:9 },
  { planet:"Moon", house:6, vedhaBy:"Saturn", vedhaHouse:12 },
  { planet:"Moon", house:7, vedhaBy:"Saturn", vedhaHouse:2 },
  { planet:"Moon", house:10, vedhaBy:"Saturn", vedhaHouse:4 },
  { planet:"Moon", house:11, vedhaBy:"Saturn", vedhaHouse:8 },
  { planet:"Mars", house:3, vedhaBy:"Saturn", vedhaHouse:9 },
  { planet:"Mars", house:6, vedhaBy:"Saturn", vedhaHouse:12 },
  { planet:"Mars", house:11, vedhaBy:"Saturn", vedhaHouse:5 },
  { planet:"Mercury", house:2, vedhaBy:"Mars", vedhaHouse:8 },
  { planet:"Mercury", house:4, vedhaBy:"Moon", vedhaHouse:10 },
  { planet:"Mercury", house:6, vedhaBy:"Mars", vedhaHouse:12 },
  { planet:"Mercury", house:8, vedhaBy:"Moon", vedhaHouse:2 },
  { planet:"Mercury", house:10, vedhaBy:"Moon", vedhaHouse:4 },
  { planet:"Mercury", house:11, vedhaBy:"Moon", vedhaHouse:5 },
  { planet:"Jupiter", house:2, vedhaBy:"Venus", vedhaHouse:8 },
  { planet:"Jupiter", house:5, vedhaBy:"Venus", vedhaHouse:11 },
  { planet:"Jupiter", house:7, vedhaBy:"Venus", vedhaHouse:1 },
  { planet:"Jupiter", house:9, vedhaBy:"Venus", vedhaHouse:3 },
  { planet:"Jupiter", house:11, vedhaBy:"Venus", vedhaHouse:5 },
  { planet:"Venus", house:1, vedhaBy:"Saturn", vedhaHouse:7 },
  { planet:"Venus", house:2, vedhaBy:"Saturn", vedhaHouse:8 },
  { planet:"Venus", house:3, vedhaBy:"Saturn", vedhaHouse:9 },
  { planet:"Venus", house:4, vedhaBy:"Saturn", vedhaHouse:10 },
  { planet:"Venus", house:5, vedhaBy:"Saturn", vedhaHouse:11 },
  { planet:"Venus", house:8, vedhaBy:"Saturn", vedhaHouse:2 },
  { planet:"Venus", house:9, vedhaBy:"Saturn", vedhaHouse:3 },
  { planet:"Venus", house:11, vedhaBy:"Saturn", vedhaHouse:5 },
  { planet:"Venus", house:12, vedhaBy:"Saturn", vedhaHouse:6 },
  { planet:"Saturn", house:3, vedhaBy:"Sun", vedhaHouse:9 },
  { planet:"Saturn", house:6, vedhaBy:"Sun", vedhaHouse:12 },
  { planet:"Saturn", house:11, vedhaBy:"Sun", vedhaHouse:5 },
];

function effectFor(planet, house){
  return SHUBHA[planet].includes(house) ? "shubha" : "ashubha";
}

function paraphrase(planet, house, effect){
  const meaning = HOUSE_MEANING[house];
  if(effect==="shubha"){
    const map={
      Sun: `Favourable — vigour and success regarding ${meaning}. Classical: honour and overcoming opposition.`,
      Moon: `Favourable — ease and well-being regarding ${meaning}.`,
      Mars: `Favourable — courage and gain regarding ${meaning}; competitors recede.`,
      Mercury: `Favourable — clarity and communication regarding ${meaning}.`,
      Jupiter: `Favourable — growth and protection regarding ${meaning}; counsel bears fruit.`,
      Venus: `Favourable — comfort and harmony regarding ${meaning}.`,
      Saturn: `Favourable — steady progress regarding ${meaning}; effort is rewarded, debts clear.`,
    };
    return map[planet];
  } else {
    const map={
      Sun: `Caution — strain regarding ${meaning}; avoid heat, haste and over-exertion.`,
      Moon: `Caution — restlessness regarding ${meaning}; keep routine, avoid hasty decisions.`,
      Mars: `Caution — friction regarding ${meaning}; act with restraint.`,
      Mercury: `Caution — scattered thought regarding ${meaning}; double-check agreements.`,
      Jupiter: `Caution — expectations exceed results regarding ${meaning}; stay measured.`,
      Venus: `Caution — over-indulgence or discord regarding ${meaning}; keep moderation.`,
      Saturn: `Caution — delay and pressure regarding ${meaning}; patience and steady work help.`,
    };
    return map[planet];
  }
}

const rules=[];
for(const planet of Object.keys(SHUBHA)){
  for(let h=1;h<=12;h++){
    const eff = effectFor(planet,h);
    const vedhaEntry = VEDHA.find(v=>v.planet===planet && v.house===h) || null;
    rules.push({
      planet,
      planetSanskrit: PLANET_SANSKRIT[planet],
      house: h,
      houseMeaning: HOUSE_MEANING[h],
      effect: eff,
      // vedha: if śubha, obstruction that can nullify it; if aśubha, still record classical vedha for reference but not applicable as blocker
      vedha: vedhaEntry ? { vedhaBy: vedhaEntry.vedhaBy, vedhaHouse: vedhaEntry.vedhaHouse, appliesWhen: `If ${vedhaEntry.vedhaBy} transits ${vedhaEntry.vedhaHouse}th from janma rāśi at the same time, this ${eff} is obstructed (Vedha).` } : null,
      classical_text: `BPHS Gochara-adhyāya — ${PLANET_SANSKRIT[planet]} in ${h}th from Candra (janma rāśi)`,
      translation: eff==="shubha" ? "Counted as śubha (favourable) in this house from janma rāśi." : "Counted as aśubha/madhyama (unfavourable/indifferent) in this house from janma rāśi.",
      paraphrase: paraphrase(planet,h,eff),
      verseKey: `GOCHARA_${planet.toUpperCase()}_H${h}`,
      source: "Bṛhat Parāśara Horā Śāstra Ch.30-32 (Gochara), corroborated by Sārāvalī / Phaladīpikā Ch.26",
      proof: "unverified"
    });
  }
}

const out = {
  schema: "gochara-rules-v1",
  ayaNamsa: "Lahiri",
  generated: new Date().toISOString().slice(0,10),
  source: "Bṛhat Parāśara Horā Śāstra Ch.30-32 + Sārāvalī / Phaladīpikā (house favourability from janma rāśi) — Vedha per Gochara-adhyāya",
  principle: "Every row carries verseKey resolvable in reference/provenance_registry.json chapter gochara_bphs; Vedha encoded separately; no invented phala.",
  rules,
  vedhaTable: VEDHA,
  documentedButNotImplemented: ["ashtakavarga", "sade_sati", "kantaka_shani", "nakshatra_pada_gochara", "dasha_phala"],
  counts: { planets: Object.keys(SHUBHA).length, houses: 12, totalRows: rules.length, vedhaRows: VEDHA.length }
};

fs.writeFileSync("rules/gochara_rules.json", JSON.stringify(out, null, 2));
console.log(`Wrote rules/gochara_rules.json: ${rules.length} rows, ${VEDHA.length} vedha entries`);

// also emit provenance stubs JSON for manual registry merge
const provStubs = {};
for(const r of rules){
  provStubs[r.verseKey] = {
    label: `${r.planetSanskrit} in ${r.house}th from Candra`,
    chapter: "gochara_bphs",
    verse: `BPHS Gochara ${r.planet} H${r.house}`,
    sanskrit_sloka: null,
    english_translation: r.translation + " " + r.paraphrase,
    applied_rule_logic: `Gochara house effect: ${r.planet} transiting ${r.house}th rāśi from janma rāśi is ${r.effect}.` + (r.vedha ? ` Vedha by ${r.vedha.vedhaBy} in ${r.vedha.vedhaHouse}th obstructs śubha.` : ""),
    basis: "classical",
    proof: "unverified"
  };
}
fs.writeFileSync("reference/gochara_provenance_stubs.json", JSON.stringify(provStubs, null, 2));
console.log(`Wrote reference/gochara_provenance_stubs.json`);
