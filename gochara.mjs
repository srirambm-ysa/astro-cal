/* gochara.mjs — monthly Rāśi ingress (Gochara) engine
   Sidereal (Lahiri) only, Moon-excluded. Reuses Engine for all astronomy.
   Pure, no DOM. Deterministic. See docs/gochara_addition.md
*/
import { RASHI, NAKSHATRA, TARA_NAMES } from "./engine.js";

const PLANETS = [
  { key: "Sun", idVar: "SE_SUN" },
  { key: "Mercury", idVar: "SE_MERCURY" },
  { key: "Venus", idVar: "SE_VENUS" },
  { key: "Mars", idVar: "SE_MARS" },
  { key: "Jupiter", idVar: "SE_JUPITER" },
  { key: "Saturn", idVar: "SE_SATURN" },
  { key: "Rahu", idVar: "SE_MEAN_NODE" },
];

const PLANET_ID_MAP = {
  Sun: "SE_SUN", Mercury: "SE_MERCURY", Venus: "SE_VENUS", Mars: "SE_MARS",
  Jupiter: "SE_JUPITER", Saturn: "SE_SATURN", Moon: "SE_MOON", Rahu: "SE_MEAN_NODE"
};

// Normalize planet name from rules (case-insensitive)
function normalizePlanet(p){ return p.charAt(0).toUpperCase()+p.slice(1).toLowerCase(); }

function jdToISTParts(jd){
  const ms = (jd - 2440587.5) * 86400000 + 5.5*3600000;
  const d = new Date(ms);
  const y=d.getUTCFullYear(), m=d.getUTCMonth()+1, day=d.getUTCDate();
  const hh=String(d.getUTCHours()).padStart(2,'0'), mm=String(d.getUTCMinutes()).padStart(2,'0');
  const WEEKDAY=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return {
    date: `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
    y, m, day, hhmm:`${hh}:${mm}`, timeIST:`${hh}:${mm} IST`, weekday: WEEKDAY[d.getUTCDay()], wdayShort: WEEKDAY[d.getUTCDay()].slice(0,3)
  };
}

/**
 * List monthly sidereal Rāśi ingresses for the given Gregorian month.
 * @param {number} year
 * @param {number} month 1..12
 * @param {import("./engine.js").Engine} engine — already init'd
 * @returns {Array} Transit[]
 * Transit { jd, date, weekday, timeIST, planet, planetSanskrit, fromRashi, toRashi, fromRashiName, toRashiName, transitNak, transitNakName }
 */
export function listMonthlyTransits(year, month, engine){
  const jdStart = engine.julday(year, month, 1, -5.5);
  const nextM = month===12?1:month+1;
  const nextY = month===12?year+1:year;
  const jdEnd = engine.julday(nextY, nextM, 1, -5.5);

  const out=[];
  for(const p of PLANETS){
    const pid = engine.swe[p.idVar];
    if(pid===undefined) continue;
    let prevRashi = engine.rashiOf(engine.siderealLon(jdStart, pid));
    const step=0.1;
    for(let jd=jdStart+step; jd < jdEnd+1e-9; jd+=step){
      const curRashi = engine.rashiOf(engine.siderealLon(jd, pid));
      if(curRashi!==prevRashi){
        // bisection to refine crossJd
        let lo=jd-step, hi=jd;
        for(let i=0;i<18;i++){
          const mid=(lo+hi)/2;
          const midR=engine.rashiOf(engine.siderealLon(mid, pid));
          if(midR===prevRashi) lo=mid; else hi=mid;
        }
        const crossJd=(lo+hi)/2;
        if(crossJd>=jdStart && crossJd < jdEnd){
          const parts=jdToISTParts(crossJd);
          const fromRashi=prevRashi;
          const toRashi=curRashi;
          const transitNak = engine.nakshatraOf(engine.siderealLon(crossJd, pid));
          // Ketu companion when Rahu moves
          if(p.key==="Rahu"){
            // Rahu event
            out.push({
              jd: crossJd,
              date: parts.date,
              weekday: parts.weekday,
              wdayShort: parts.wdayShort,
              timeIST: parts.timeIST,
              planet: "Rahu",
              planetSanskrit: "Rāhu",
              fromRashi, toRashi,
              fromRashiName: RASHI[fromRashi],
              toRashiName: RASHI[toRashi],
              transitNak,
              transitNakName: NAKSHATRA[transitNak]
            });
            // Ketu is opposite 180°
            const kFrom=(fromRashi+6)%12, kTo=(toRashi+6)%12;
            const ketuLon=(engine.siderealLon(crossJd, pid)+180)%360;
            const ketuNak=engine.nakshatraOf(ketuLon);
            out.push({
              jd: crossJd,
              date: parts.date,
              weekday: parts.weekday,
              wdayShort: parts.wdayShort,
              timeIST: parts.timeIST,
              planet: "Ketu",
              planetSanskrit: "Ketu",
              fromRashi: kFrom, toRashi: kTo,
              fromRashiName: RASHI[kFrom],
              toRashiName: RASHI[kTo],
              transitNak: ketuNak,
              transitNakName: NAKSHATRA[ketuNak]
            });
          } else {
            const sanskritMap={Sun:"Sūrya", Mercury:"Budha", Venus:"Śukra", Mars:"Maṅgala", Jupiter:"Guru", Saturn:"Śani"};
            out.push({
              jd: crossJd,
              date: parts.date,
              weekday: parts.weekday,
              wdayShort: parts.wdayShort,
              timeIST: parts.timeIST,
              planet: p.key,
              planetSanskrit: sanskritMap[p.key]||p.key,
              fromRashi, toRashi,
              fromRashiName: RASHI[fromRashi],
              toRashiName: RASHI[toRashi],
              transitNak,
              transitNakName: NAKSHATRA[transitNak]
            });
          }
        }
        prevRashi=curRashi;
      }
    }
  }
  out.sort((a,b)=>a.jd-b.jd);
  return out;
}

/**
 * Personalize one transit for a birth.
 * @param {object} transit — from listMonthlyTransits
 * @param {{rashi:number, nakshatra:number}} birth — 0-based indices
 * @param {object} rules — parsed rules/gochara_rules.json
 * @param {import("./engine.js").Engine} engine — for Vedha rashi lookup at jd
 * @returns {object} GocharaRow { ...transit, house, effect, paraphrase, verseKey, vedhaBlocked, tara }
 */
export function gocharaForBirth(transit, birth, rules, engine){
  if(!birth || birth.rashi==null) return { ...transit, house:null, effect:null, paraphrase:null, verseKey:null, vedhaBlocked:false, tara:null };
  const toRashi = transit.toRashi;
  const house = ((toRashi - birth.rashi + 12)%12)+1;
  const planetNorm = normalizePlanet(transit.planet);
  // find rule: planet case may differ (rules store Sun/Moon... with capital first)
  let rule = rules.rules.find(r=> r.planet===planetNorm && r.house===house);
  // fallback for Rahu/Ketu: derive from Saturn if not in corpus (we store only 7 grahas)
  if(!rule && (planetNorm==="Rahu"||planetNorm==="Ketu")){
    rule = rules.rules.find(r=> r.planet==="Saturn" && r.house===house);
    // clone with planet name retained for display
  }
  const effect = rule?.effect || null;
  const paraphrase = rule?.paraphrase || null;
  const verseKey = rule?.verseKey || null;
  // Vedha: check if vedha planet at transit jd is in vedhaHouse
  let vedhaBlocked=false;
  if(rule?.vedha && engine){
    const vedhaBy = rule.vedha.vedhaBy;
    const vedhaHouse = rule.vedha.vedhaHouse;
    const vedhaPidName = PLANET_ID_MAP[normalizePlanet(vedhaBy)] || PLANET_ID_MAP[vedhaBy];
    const vedhaPid = vedhaPidName ? engine.swe[vedhaPidName] : null;
    if(vedhaPid!=null){
      const vedhaRashi = engine.rashiOf(engine.siderealLon(transit.jd, vedhaPid));
      const vedhaActualHouse = ((vedhaRashi - birth.rashi +12)%12)+1;
      vedhaBlocked = (vedhaActualHouse===vedhaHouse);
    }
  }
  // Tārā: planet's nakshatra at crossing vs janma nakshatra
  let tara=null;
  if(birth.nakshatra!=null && transit.transitNak!=null){
    const tb = engine.taraBala(birth.nakshatra, transit.transitNak);
    const tnum = tb.number;
    const tname = TARA_NAMES[tnum-1];
    const natureMap = ["neutral","good","bad","good","bad","good","bad","good","good"];
    const nature = natureMap[tnum-1];
    tara = { number: tnum, name: tname, count: tb.count, nature, isFavourable: nature==="good", isUnfavourable: nature==="bad" };
  }
  return {
    ...transit,
    house,
    effect,
    paraphrase,
    verseKey,
    vedhaBlocked,
    tara
  };
}

/**
 * Convenience: list + personalize for a month.
 * @param {number} year
 * @param {number} month
 * @param {{rashi:number, nakshatra:number}|null} birth
 * @param {import("./engine.js").Engine} engine
 * @param {object} rules
 * @returns {Array} GocharaRow[]
 */
export function listMonthlyGochara(year, month, birth, engine, rules){
  const transits = listMonthlyTransits(year, month, engine);
  if(!birth || birth.rashi==null) return transits.map(t=> ({...t, house:null, effect:null, paraphrase:null, verseKey:null, vedhaBlocked:false, tara:null }));
  return transits.map(t=> gocharaForBirth(t, birth, rules, engine));
}
