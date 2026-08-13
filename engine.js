/* astro-cal engine — Vedic panchang computation on swisseph-wasm.
   All astronomical positions are sidereal (Lahiri ayanamsa) unless noted.
   Browser + Node ESM. No network at runtime. */
import SwissEph from "./vendor/swisseph/src/swisseph.js";

export const RASHI = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrischika", "Dhanus", "Makara", "Kumbha", "Meena",
];
export const TAMIL_MONTH = [
  "Chithirai", "Vaikasi", "Aani", "Aadi", "Aavani", "Purattasi",
  "Aippasi", "Karthigai", "Margazhi", "Thai", "Maasi", "Panguni",
];
export const NAKSHATRA = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi",
  "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
  "Trayodashi", "Chaturdashi", "Purnima", "Pratipada", "Dwitiya", "Tritiya",
  "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami",
  "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];
export const TAMIL_YEARS_60 = [
  "Prabhava","Vibhava","Shukla","Pramoda","Prajapati","Angirasa","Srimukha","Bhava","Yuva","Dhatu",
  "Ishvara","Bahudhanya","Pramathi","Vikrama","Vrisha","Chitrabhanu","Svabhanu","Tarana","Parthiva","Vyaya",
  "Sarvajit","Sarvadhari","Virodhi","Vikrita","Khara","Nandana","Vijaya","Jaya","Manmatha","Durmukhi",
  "Hemalamba","Vilambi","Vikari","Sharvari","Plava","Shubhakrit","Sobhakrit","Krodhi","Vishvavasu","Parabhava",
  "Plavanga","Kilaka","Saumya","Sadharana","Virodhikrit","Paridhavi","Pramadi","Ananda","Rakshasa","Nala",
  "Pingala","Kalayukti","Siddharthi","Raudra","Durmati","Dundubhi","Rudhirodgari","Raktaksha","Krodhana","Akshaya",
];
export const YOGA_NAMES = [
  "Vishkambha","Priti","Ayushman","Saubhagya","Shobhana","Atiganda","Sukarma","Dhriti","Shula","Ganda",
  "Vriddhi","Dhruva","Vyaghata","Harshana","Vajra","Siddhi","Vyatipata","Variyana","Parigha","Shiva",
  "Siddha","Sadhya","Shubha","Shukla","Brahma","Indra","Vaidhriti",
];
export const KARANA_NAMES = [
  "Bava","Balava","Kaulava","Taitila","Gara","Vanija","Vishti", // 7 movable (cycle)
  "Shakuni","Chatushpada","Naga",                               // 3 fixed near amavasya
  "Kimstughna",                                                 // 1 fixed at shukla pratipada start
];
// Nakshatra nature group (index 0-26 → key). Classical 7-fold classification
// used for per-activity suitability: Dhruva=fixed, Chara=movable, Ubhaya=mixed.
export const NAKSHATRA_GROUP = [
  "kshipra","ugra","ubhaya","dhruva","mridu","tikshna","chara","kshipra","tikshna","ugra",
  "ugra","dhruva","kshipra","mridu","chara","ubhaya","mridu","tikshna","tikshna","ugra",
  "dhruva","chara","chara","chara","ugra","dhruva","mridu",
];
export const TARA_NAMES = [
  "Janma","Sampat","Vipat","Kshema","Pratyari","Sadhaka","Vadha","Mitra","Parama Mitra",
];
// tara index (0-8) → nature
export const TARA_NATURE = ["neutral","good","bad","good","bad","good","bad","good","good"];

// Rahu/Yama/Gulika table: [Rahu, Yama, Gulika] segment (1-8) by weekday (Sun=0)
const KALA_TABLE = [
  [8, 5, 7], // Sun
  [2, 4, 6], // Mon
  [7, 3, 5], // Tue
  [5, 2, 4], // Wed
  [6, 1, 3], // Thu
  [4, 7, 2], // Fri
  [3, 6, 1], // Sat
];

const NAKSHA = 360 / 27;         // 13°20'
const DAY = 24 * 60 * 60 / 86400; // julian day unit

export class Engine {
  constructor() { this.swe = null; }

  async init() {
    this.swe = new SwissEph();
    await this.swe.initSwissEph();
    this.swe.set_sid_mode(this.swe.SE_SIDM_LAHIRI, 0, 0);
    return this;
  }

  close() { if (this.swe) { this.swe.close(); this.swe = null; } }

  /* ---- low-level positions (sidereal, Lahiri) ---- */
  siderealLon(jd, planet) {
    return this.swe.calc_ut(jd, planet, this.swe.SEFLG_SWIEPH | this.swe.SEFLG_SIDEREAL)[0];
  }
  tropicalLon(jd, planet) {
    return this.swe.calc_ut(jd, planet, this.swe.SEFLG_SWIEPH)[0];
  }
  julday(year, month, day, utHours) { return this.swe.julday(year, month, day, utHours); }
  revjul(jd) {
    return this.swe.revjul(jd, this.swe.SE_GREG_CAL); // already { year, month, day, hour }
  }

  /* ---- derived ---- */
  rashiOf(lon) { return ((Math.floor(lon / 30) % 12) + 12) % 12; }
  nakshatraOf(lon) { return ((Math.floor(lon / NAKSHA) % 27) + 27) % 27; }
  padaOf(lon) { return Math.floor((lon % NAKSHA) / (NAKSHA / 4)) + 1; }

  /* elongation moon-sun (0..360) — same in tropical or sidereal */
  elongation(jd) {
    const m = this.tropicalLon(jd, this.swe.SE_MOON);
    const s = this.tropicalLon(jd, this.swe.SE_SUN);
    return (((m - s) % 360) + 360) % 360;
  }
  tithi(jd) {
    const e = this.elongation(jd);
    const idx = Math.floor(e / 12);
    return { index: idx, paksha: idx < 15 ? "Shukla" : "Krishna", name: TITHI_NAMES[idx], amavasya: idx === 29, purnima: idx === 14 };
  }

  /* nitya yoga = (sun_lon + moon_lon) in [0,360), each yoga = 360/27.
     Both sidereal; the sum's zodiac origin cancels out. */
  yoga(jd) {
    const s = this.siderealLon(jd, this.swe.SE_SUN);
    const m = this.siderealLon(jd, this.swe.SE_MOON);
    const sum = (((s + m) % 360) + 360) % 360;
    return { index: Math.floor(sum / (360 / 27)), name: YOGA_NAMES[Math.floor(sum / (360 / 27)) % 27] };
  }

  /* karana = half a tithi. elongation / 6 → 60 halves per synodic month.
     First half of Shukla Pratipada = Kimstughna (fixed); the 7 movable karanas
     cycle halves 2..57; Shakuni/Chatushpada/Naga are the 3 fixed before Amavasya. */
  karana(jd) {
    const e = this.elongation(jd);
    const h = Math.floor(e / 6) % 60;
    let index;
    if (h === 0) index = 10;            // Kimstughna
    else if (h >= 57) index = 7 + (h - 57); // Shakuni(57), Chatushpada(58), Naga(59)
    else index = (h - 1) % 7;           // movable cycle
    return { index, name: KARANA_NAMES[index] };
  }

  /* nava tara: count from janma nakshatra (janma=1, inclusive) to the day's
     nakshatra, fold on a cycle of 9. Returns 1-based tara number (1..9).
     Favorable {2 Sampat,4 Kshema,6 Sadhaka,8 Mitra,9 Parama Mitra};
     unfavorable {3 Vipat,5 Pratyari,7 Vadha}; neutral {1 Janma}. */
   taraBala(janmaNakshatra, dayNakshatra) {
    const count = ((dayNakshatra - janmaNakshatra) % 27 + 27) % 27 + 1;
    return { number: ((count - 1) % 9) + 1, count };
  }

  /* JD when the nakshatra occupied at `jd` ends (next 13°20' boundary), or null.
     Used to flag same-day star transitions in the muhurta verdict. */
  nakshatraEnd(jd) {
    const lon = this.siderealLon(jd, this.swe.SE_MOON);
    const nak = this.nakshatraOf(lon);
    const nextBoundary = (nak + 1) * NAKSHA;
    return this.crossingForward(jd, this.swe.SE_MOON, nextBoundary, 0.05, 4000);
  }

  /* sunrise/sunset (geometric, standard refraction) for one civil day.
     rise_trans returns the NEXT event after the given JD, so we query from
     local midnight to get that calendar day's own rise+set. Returns [JD, JD]. */
  sunriseSunset(year, month, day, geo) {
    const tzHours = Math.round(geo[0] / 15 * 2) / 2;   // approx local offset
    const localMidnight = this.julday(year, month, day, -tzHours); // 00:00 local
    const rise = this.swe.rise_trans(localMidnight, this.swe.SE_SUN, "", this.swe.SEFLG_SWIEPH, this.swe.SE_CALC_RISE, geo, 1013.25, 15);
    const set = this.swe.rise_trans(localMidnight, this.swe.SE_SUN, "", this.swe.SEFLG_SWIEPH, this.swe.SE_CALC_SET, geo, 1013.25, 15);
    return { rise: rise ? rise[0] : null, set: set ? set[0] : null };
  }

  /* exact JD when an unwrapped-able angle function crosses `target` (0..360).
     `angleAt(t)` returns a value in [0,360) that advances forward over time.
     Robust to 0/360 wrap by tracking UNWRAPPED angle. t0 any time before. */
  crossingValue(t0, angleAt, target, stepDays = 0.05, guard = 4000) {
    const startA = angleAt(t0);
    let targetU = target;
    while (targetU < startA + 1e-9) targetU += 360;
    const samples = [{ t: t0, u: startA }];
    let prevA = startA, u = startA, crossed = false, b = t0;
    for (let g = 1; g <= guard; g++) {
      b = t0 + g * stepDays;
      const an = angleAt(b);
      let d = an - prevA;
      while (d < -180) d += 360;
      u += d;
      prevA = an;
      samples.push({ t: b, u });
      if (u >= targetU) { crossed = true; break; }
    }
    if (!crossed) return null;
    let lo = samples[samples.length - 2];
    let hi = samples[samples.length - 1];
    const unwrapFrom = (loU, loA, t) => {
      const an = angleAt(t);
      let d = an - loA;
      while (d < -180) d += 360;
      return loU + d;
    };
    let loU = lo.u, loT = lo.t, loA = angleAt(lo.t);
    let hiU = hi.u, hiT = hi.t;
    for (let i = 0; i < 12; i++) {
      const midT = (loT + hiT) / 2;
      const midU = unwrapFrom(loU, loA, midT);
      if (midU < targetU) { loT = midT; loU = midU; loA = angleAt(midT); }
      else { hiT = midT; hiU = midU; }
    }
    return (loT + hiT) / 2;
  }

  /* exact JD when the body's sidereal longitude crosses `target` (0..360). */
  crossingForward(t0, planet, target, stepDays = 0.05, guard = 4000) {
    return this.crossingValue(
      t0,
      (t) => { const l = this.siderealLon(t, planet); return (((l % 360) + 360) % 360); },
      target, stepDays, guard
    );
  }

  /* exact JD when moon-sun elongation crosses `target` degrees (0 for new moon,
     180 for full moon). Same machinery, different angle function. */
  crossingElongation(t0, target, stepDays = 0.05, guard = 4000) {
    return this.crossingValue(t0, (t) => this.elongation(t), target, stepDays, guard);
  }

  /* the new moon (elongation 0) at or before t */
  prevNewMoon(t) {
    const elo = this.elongation(t);
    const sinceNew = (elo / 360) * 29.530588853; // days since last new moon (approx)
    return this.crossingElongation(t - sinceNew - 0.5, 0, 0.05, 600);
  }
  /* the new moon (elongation 0) at or after t */
  nextNewMoon(t) {
    return this.crossingElongation(t, 0, 0.05, 600);
  }
  /* the full moon (elongation 180) in the same lunar cycle as t (after its new moon) */
  fullMoonOf(t) {
    const nm = this.prevNewMoon(t);
    if (!nm) return null;
    return this.crossingElongation(nm + 0.1, 180, 0.05, 400);
  }

  /* Amanta lunar month index (0-11) of a date: the rashi the Sun occupied at the
     full moon that closes the cycle started by the preceding new moon. */
  lunarMonthOf(t) {
    const fm = this.fullMoonOf(t);
    if (!fm) return null;
    const sunLon = this.siderealLon(fm, this.swe.SE_SUN);
    return this.rashiOf(sunLon);
  }

  /* Sarva Pitru Amavasya for the year containing t0: the new moon that STARTS the
     Amanta Ashwina cycle (full moon with Sun in Tula) — the day before Sharad
     Navratri begins. Returns JD, or null if not found. */
  sarvaPitruAmavasya(t0) {
    let nm = this.prevNewMoon(t0);
    let guard = 0;
    while (guard++ < 48) {
      const fm = this.fullMoonOf(nm + 0.1);
      if (!fm) return null;
      const month = this.rashiOf(this.siderealLon(fm, this.swe.SE_SUN));
      if (month === 6) return nm; // Ashwina cycle starts at Sarva Pitru Amavasya
      nm = this.nextNewMoon(fm + 0.1);
    }
    return null;
  }

  /* Amanta lunar cycles (new-moon to new-moon) within [tStart, tEnd]:
     [{ start, end, fm, month }] where month = Amanta month index from the full
     moon's sun rashi. start/end are the boundary new moons. */
  amantaCycles(tStart, tEnd) {
    const out = [];
    let nm = this.prevNewMoon(tStart);
    let guard = 0;
    while (guard++ < 48) {
      const start = nm;
      const fm = this.fullMoonOf(start + 0.1);
      if (!fm) break;
      const month = this.rashiOf(this.siderealLon(fm, this.swe.SE_SUN));
      const end = this.nextNewMoon(fm + 0.1);
      if (end > tEnd + 1) break;
      out.push({ start, end, fm, month });
      nm = end;
    }
    return out;
  }

  /* janma nakshatra + rashi from birth */
  birthChart(birth) {
    const jd = this.julday(birth.year, birth.month, birth.day, birth.utHour);
    const moonLon = this.siderealLon(jd, this.swe.SE_MOON);
    const sunLon = this.siderealLon(jd, this.swe.SE_SUN);
    return {
      jd,
      moonLon,
      sunLon,
      nakshatra: this.nakshatraOf(moonLon),
      pada: this.padaOf(moonLon),
      rashi: this.rashiOf(moonLon),
    };
  }

  /* chandrashtama windows for the coarse rashi and peak nakshatra.
     Returns array of { start, end, kind: 'coarse'|'peak', nakshatra } sorted, within [tStart,tEnd]. */
  chandrashtama(janma, tStart, tEnd, geo) {
    const rashi = (janma.rashi + 7) % 12;         // 8th rashi inclusive
    const naks = (janma.nakshatra + 16) % 27;     // 16th star past birth star (17th incl.)
    const rashiStart = rashi * 30;
    const rashiEnd = rashiStart + 30;
    const naksStart = naks * NAKSHA;
    const naksEnd = naksStart + NAKSHA;
    const out = [];

    // coarse: moon in [rashiStart, rashiEnd)
    let probe = tStart - 0.5;
    while (probe < tEnd) {
      // find entry into rashiStart
      const entry = this.crossingForward(probe, this.swe.SE_MOON, rashiStart);
      if (!entry || entry > tEnd + 1) break;
      const exit = this.crossingForward(entry + 0.01, this.swe.SE_MOON, rashiEnd);
      if (!exit) break;
      out.push({ kind: "coarse", start: entry, end: exit, rashi });
      probe = exit + 0.5;
    }

    // peak: moon in [naksStart, naksEnd)
    probe = tStart - 0.5;
    while (probe < tEnd) {
      const entry = this.crossingForward(probe, this.swe.SE_MOON, naksStart);
      if (!entry || entry > tEnd + 1) break;
      const exit = this.crossingForward(entry + 0.01, this.swe.SE_MOON, naksEnd);
      if (!exit) break;
      out.push({ kind: "peak", start: entry, end: exit, nakshatra: naks });
      probe = exit + 0.5;
    }

    // clamp to range and sort
    return out
      .filter((w) => w.end > tStart && w.start < tEnd)
      .map((w) => ({ ...w, start: Math.max(w.start, tStart), end: Math.min(w.end, tEnd) }))
      .sort((a, b) => a.start - b.start);
  }

  /* rahu/yama/gulika windows for one civil day (based on sunrise→sunset, 8 segments) */
  kalamWindows(year, month, day, geo) {
    const { rise, set } = this.sunriseSunset(year, month, day, geo);
    if (!rise || !set) return null;
    const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const [rahuSeg, yamaSeg, gulikaSeg] = KALA_TABLE[weekday];
    const L = (set - rise);
    const seg = (n) => ({ start: rise + (n - 1) * L / 8, end: rise + n * L / 8 });
    return {
      rise, set, weekday,
      rahu: seg(rahuSeg), yama: seg(yamaSeg), gulika: seg(gulikaSeg),
      rahuSeg, yamaSeg, gulikaSeg,
    };
  }

  /* Tamil solar date + sankranti for one day (sidereal sun) */
  tamilDate(jd, year, month, day) {
    const sunLon = this.siderealLon(jd, this.swe.SE_SUN);
    const tMonth = this.rashiOf(sunLon);
    // find the PREVIOUS crossing into the current rashi (the sankranti that
    // started this Tamil month — always within the prior ~31 days)
    const sankranti = this.crossingBackward(jd, this.swe.SE_SUN, tMonth * 30, 40, 1);
    const tDay = Math.floor(jd - sankranti) + 1; // day 1 = sankranti day
    return { tMonth, tDay, sankrantiJD: sankranti, monthName: TAMIL_MONTH[tMonth] };
  }

  /* exact JD when the body's sidereal longitude LAST crossed `target` (0..360)
     at or before tEnd. Scans backward up to `daysBack`. */
  crossingBackward(tEnd, planet, target, daysBack = 40, stepDays = 0.05) {
    const lonAt = (t) => { const l = this.siderealLon(t, planet); return (((l % 360) + 360) % 360); };
    // unwrapped at tEnd, anchored by walking forward from (tEnd - daysBack)
    const t0 = tEnd - daysBack;
    let targetU = target;
    const startLon = lonAt(t0);
    while (targetU < startLon) targetU += 360;
    // walk forward from t0 collecting samples until we pass tEnd
    const samples = [{ t: t0, u: startLon }];
    let prevLon = startLon, u = startLon;
    const n = Math.ceil(daysBack / stepDays);
    for (let g = 1; g <= n; g++) {
      const t = t0 + g * stepDays;
      const ln = lonAt(t);
      let d = ln - prevLon;
      while (d < -180) d += 360;
      u += d;
      prevLon = ln;
      samples.push({ t, u });
    }
    // find the last sample pair straddling targetU with u <= targetU (previous crossing)
    let lo = null, hi = null;
    for (let i = 1; i < samples.length; i++) {
      if (samples[i].u > targetU) { lo = samples[i - 1]; hi = samples[i]; break; }
    }
    if (!lo || lo.t > tEnd) return null;
    // bisection between lo and hi
    const unwrapFrom = (loU, loLon, t) => {
      const ln = lonAt(t);
      let d = ln - loLon;
      while (d < -180) d += 360;
      return loU + d;
    };
    let loU = lo.u, loT = lo.t, loLon = lonAt(lo.t);
    let hiT = hi.t;
    for (let i = 0; i < 14; i++) {
      const midT = (loT + hiT) / 2;
      const midU = unwrapFrom(loU, loLon, midT);
      if (midU < targetU) { loT = midT; loU = midU; loLon = lonAt(midT); }
      else { hiT = midT; }
    }
    return (loT + hiT) / 2;
  }

  /* Tamil year name for a civil date: cycle position counted from the Chithirai
     (Mesha) sankranti. Anchor verified: 2026 (post Apr 14) = Parabhava (#40). */
  tamilYear(year, month, day) {
    let cy = year;
    if (month < 4) cy = year - 1;              // before Chithirai → previous year's cycle
    const pos = ((cy - 2026 + 40) % 60 + 60) % 60;
    return { index: pos === 0 ? 60 : pos, name: TAMIL_YEARS_60[pos === 0 ? 59 : pos - 1] };
  }

  /* solar eclipses in [tStart, tEnd) — returns [{max, begin, end, total, annular}] */
  solarEclipses(tStart, tEnd) {
    const out = [];
    let from = tStart;
    while (from < tEnd) {
      const e = this.swe.sol_eclipse_when_glob(from, this.swe.SEFLG_SWIEPH, this.swe.SE_ECL_ALLTYPES_SOLAR, 0);
      if (!e || e.tret[0] > tEnd) break;
      const t = e.tret;
      out.push({
        max: t[0], begin: t[1], end: t[2], beginTotal: t[3], endTotal: t[4],
        total: !!(e.retFlag & this.swe.SE_ECL_TOTAL) || !!(e.retFlag & this.swe.SE_ECL_ANNULAR_TOTAL),
        annular: !!(e.retFlag & this.swe.SE_ECL_ANNULAR),
      });
      from = t[0] + 0.01;
    }
    return out;
  }

  /* lunar eclipses in [tStart, tEnd) */
  lunarEclipses(tStart, tEnd) {
    const out = [];
    let from = tStart;
    while (from < tEnd) {
      const e = this.swe.lun_eclipse_when(from, this.swe.SEFLG_SWIEPH, this.swe.SE_ECL_ALLTYPES_LUNAR, 0);
      if (!e || e.tret[0] > tEnd) break;
      const t = e.tret;
      out.push({
        max: t[0], begin: t[1], end: t[2], beginTotal: t[3], endTotal: t[4],
        total: !!(e.retFlag & this.swe.SE_ECL_TOTAL),
        partial: !!(e.retFlag & this.swe.SE_ECL_PARTIAL) && !(e.retFlag & this.swe.SE_ECL_TOTAL),
      });
      from = t[0] + 0.01;
    }
    return out;
  }

  /* ===== CALENDAR-FIELD PUSHDOWN (PRD §2.6.3) ===== */

  /* Is jd in an Adhik Maas (intercalary lunar month)?
     A lunar month [Amavasya₁ → Amavasya₂) is intercalary iff both bounding
     Amavasyas fall in the same Sun-sign bucket ⌊λ_sun/30°⌋ (no Sankranti). */
  isAdhikMaas(jd) {
    const nm1 = this.prevNewMoon(jd);
    if (!nm1) return false;
    const nm2 = this.nextNewMoon(nm1 + 0.1);
    if (!nm2) return false;
    const b1 = Math.floor(((this.siderealLon(nm1, this.swe.SE_SUN) % 360) + 360) % 360 / 30);
    const b2 = Math.floor(((this.siderealLon(nm2, this.swe.SE_SUN) % 360) + 360) % 360 / 30);
    return b1 === b2;
  }

  /* Kharmas: Sun in Dhanus (Sagittarius, [240°,270°)) or Meena (Pisces, [330°,360°)) bucket. */
  isKharmas(jd) {
    const s = ((this.siderealLon(jd, this.swe.SE_SUN) % 360) + 360) % 360;
    return (s >= 240 && s < 270) || (s >= 330 && s < 360);
  }

  /* Pitru Paksha: the Krishna Paksha of Bhadrapada/Ashwina ending at Sarva Pitru Amavasya
     (the new moon that STARTS the Amanta Ashwina cycle — full moon with Sun in Tula).
     Returns true if jd falls in the 15-day waning moon before Sarva Pitru Amavasya. */
  isPitruPaksha(jd) {
    const spa = this.sarvaPitruAmavasya(jd);
    if (!spa) return false;
    const nm = this.prevNewMoon(spa + 0.1); // the new moon that STARTS Pitru Paksha's krishna paksha
    // Pitru Paksha = (spa - 15 days, spa] approximately; more precisely the krishna paksha
    // of the month ending at spa. Use the full moon before spa.
    const fm = this.fullMoonOf(this.prevNewMoon(spa) + 0.1);
    if (!fm) return false;
    return jd > fm && jd <= spa;
  }

  /* ===== BHADRA (VISHTI KARANA) MATRIX (PRD §2.6.5) ===== */

  /* Vishti Karana window active at jd, or null. Returns proportional Mukha/Puchha split.
     Mukha (malefic) = first 5/30 = 1/6 of the karana span.
     Puchha (usable) = final 3/30 = 1/10 of the karana span. */
  vishtiKaranaAt(jd) {
    const k = this.karana(jd);
    if (k.index !== 6) return null; // Vishti = index 6
    const e = this.elongation(jd);
    const h = Math.floor(e / 6) % 60;
    const karanaStart = this.crossingElongation(jd - 0.6, h * 6);
    const karanaEnd = this.crossingElongation(jd + 0.1, (h + 1) * 6);
    if (!karanaStart || !karanaEnd) return null;
    const duration = karanaEnd - karanaStart;
    return {
      start: karanaStart, end: karanaEnd, duration,
      mukhaEnd: karanaStart + (5 / 30) * duration,
      puchhaStart: karanaEnd - (3 / 30) * duration,
    };
  }

  /* Bhadra Loka (residence) by Moon rashi — PRD §2.6.5 + classical_rule_architecture_mc.md §5.
     Mrityu Loka (Cancer=3, Leo=4, Libra=6, Pisces=11) = severe; all other rashis
     (Swarga / Patala) are harmless on Earth.
     AUTHORITATIVE: Muhurta Chintamani, Ch.1 (Subhashubha Prakarana), Sloka 46:
       कर्किसिंहतुलामीने मृत्युलोके तु भद्रिका॥
       (Karka=Cancer, Simha=Leo, Tula=Libra, Meena=Pisces → Mrityu Loka.)
     VARIANT: some printed English editions (and the OCR archive) print
       "Aquarius, Pisces, Cancer, Leo" — an Aquarius↔Libra translation swap.
       We follow the Sanskrit sloka per provenance_registry. */
  bhadraLoka(jd) {
    const moonRashi = this.rashiOf(this.siderealLon(jd, this.swe.SE_MOON));
    if ([3, 4, 6, 11].includes(moonRashi)) return "mrityu";
    return "harmless";
  }

  /* Planetary combustion (Asta) by solar elongation: Guru ≤ 11°, Shukra ≤ 8°.
     Returns { guru: bool, shukra: bool } at jd. */
  combustion(jd) {
    const sun = this.siderealLon(jd, this.swe.SE_SUN);
    const de = (p) => {
      let d = ((this.siderealLon(jd, p) - sun) % 360 + 360) % 360;
      if (d > 180) d = 360 - d;
      return d;
    };
    return { guru: de(this.swe.SE_JUPITER) <= 11, shukra: de(this.swe.SE_VENUS) <= 8 };
  }

  /* ===== NITYA YOGA PARTIAL GHTI BANS (PRD §2.6.6) ===== */

  /* Per-yoga prohibited-ghati lengths (ghatis counted from yoga start).
     Vyatipata(22) + Vaidhriti(26) banned outright (length = full yoga span).
     Others banned only in initial ghatis. */
  static YOGA_GHATI_BAN = {
    0: 5,   // Vishkambha
    5: 5,   // Atiganda
    8: 5,   // Shula
    9: 5,   // Ganda
    12: 5,  // Vyaghata
    14: 5,  // Vajra
    18: 5,  // Parigha
    16: 60, // Vyatipata — full ban
    26: 60, // Vaidhriti — full ban
  };

  /* Is the Nitya Yoga at jd within its banned initial ghati window?
     Returns { banned, yogaIndex, reason } — banned=false means yoga is clean or past ban window. */
  nityaYogaBan(jd) {
    const y = this.yoga(jd);
    const banLen = Engine.YOGA_GHATI_BAN[y.index];
    if (banLen === undefined) return { banned: false, yogaIndex: y.index, name: y.name };
    // Find when this yoga started (last crossing into this yoga's 13.333° bucket)
    const s = this.siderealLon(jd, this.swe.SE_SUN);
    const m = this.siderealLon(jd, this.swe.SE_MOON);
    const sum = (((s + m) % 360) + 360) % 360;
    const yogaStart = this.crossingValue(
      jd - 1,
      (t) => {
        const ss = this.siderealLon(t, this.swe.SE_SUN);
        const mm = this.siderealLon(t, this.swe.SE_MOON);
        return (((ss + mm) % 360) + 360) % 360;
      },
      y.index * (360 / 27), 0.05, 400
    );
    if (!yogaStart) return { banned: false, yogaIndex: y.index, name: y.name };
    // Yoga duration ≈ 13.333° / (moon_speed + sun_speed) ≈ ~1 day. 1 ghati = 1/60 sidereal day.
    const yogaDuration = 360 / 27 / (13.2 + 0.985); // rough: moon ~13.2°/d, sun ~0.985°/d
    const banDays = (banLen / 60) * (yogaDuration * 60 / 60); // banLen ghatis as fraction of yoga
    // Simpler: 1 ghati = 1/60 day. banLen ghatis = banLen/60 days from yoga start.
    const banWindow = banLen / 60; // in days
    const elapsed = jd - yogaStart;
    const banned = elapsed < banWindow;
    return {
      banned,
      yogaIndex: y.index,
      name: y.name,
      reason: banned ? `${y.name} in initial ${banLen}-ghati ban window` : null,
    };
  }

  /* ===== DAY COMPUTATION (shared by main thread + worker) ===== */

  /* Compute all astronomical + phase-2 fields for one civil day.
     tz = timezone offset in hours (default 5.5 for IST).
     Returns a plain object (serializable for worker postMessage). */
  computeDay(y, m, d, geo, janmaNakshatra, tz = 5.5) {
    const jdNoon = this.julday(y, m, d, 12 - tz);
    const { rise, set } = this.sunriseSunset(y, m, d, geo);
    const atSunrise = rise || jdNoon;
    const tt = this.tithi(atSunrise);
    const tm = this.tamilDate(atSunrise, y, m, d);
    const ty = this.tamilYear(y, m, d);
    const kw = this.kalamWindows(y, m, d, geo);
    const moonLon = this.siderealLon(atSunrise, this.swe.SE_MOON);
    const moonNakshatra = this.nakshatraOf(moonLon);
    const tithiIndex = tt.index;
    const tDay = tm.tDay;
    const tMonth = tm.tMonth;
    const vara = new Date(y, m - 1, d).getDay();
    const yoga = this.yoga(atSunrise);
    const karana = this.karana(atSunrise);
    const tara = janmaNakshatra != null ? this.taraBala(janmaNakshatra, moonNakshatra) : null;
    let starEnd = null;
    if (rise) {
      const nakEnd = this.nakshatraEnd(atSunrise);
      if (nakEnd && nakEnd < set) {
        const endNak = this.nakshatraOf(this.siderealLon(nakEnd, this.swe.SE_MOON));
        starEnd = { jd: nakEnd, ist: timeIST(nakEnd).hhmm, endNakshatra: endNak, endNakshatraName: NAKSHATRA[endNak] };
      }
    }
    // Bhadra matrix. Evaluate Vishti at sunrise AND at solar noon so a karana
    // that only becomes active midday (Test B) still flags the day. Prefer the
    // first probe that finds Vishti in Mrityu Loka (most severe).
    let bhadra = null;
    const probes = [atSunrise];
    if (rise && set) probes.push((rise + set) / 2);
    for (const t of probes) {
      const vk = this.vishtiKaranaAt(t);
      if (!vk) continue;
      const loka = this.bhadraLoka(t);
      bhadra = { ...vk, loka, inMukha: t < vk.mukhaEnd, inPuchha: t >= vk.puchhaStart };
      if (loka === "mrityu") break; // strictest found
    }
    // Nitya Yoga ban
    const yb = this.nityaYogaBan(atSunrise);
    const fullBanYogas = [16, 26]; // Vyatipata, Vaidhriti — banned for their whole span
    const yogaBan = yb.banned ? { ...yb, fullBan: fullBanYogas.includes(yb.yogaIndex) } : null;
    // Abhijit window: 48 min centred on local solar noon (T1 fallback).
    // Check if the window overlaps the civil day (rise→set), not just at sunrise.
    let isInsideAbhijit = false;
    if (rise && set) {
      const noon = (rise + set) / 2;
      const abhijitStart = noon - 0.01667; // ~24 min before noon
      const abhijitEnd = noon + 0.01667;   // ~24 min after noon
      isInsideAbhijit = abhijitEnd > rise && abhijitStart < set; // window overlaps daylight
    }
    // Calendar-field pushdown
    const adhikMaas = this.isAdhikMaas(atSunrise);
    const kharmas = this.isKharmas(atSunrise);
    const pitruPaksha = this.isPitruPaksha(atSunrise);
    const combust = this.combustion(atSunrise);
    const sankranti = tDay === 1; // solar sankranti day (start of Tamil month)
    return { y, m, d, iso: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`, rise, set, tithi: tt, tMonth, tDay, tithiIndex, moonNakshatra, moonRashi: this.rashiOf(moonLon), tamilYear: ty, kalam: kw, jdNoon, moonLon, vara, yoga, karana, tara, starEnd, bhadra, yogaBan, isInsideAbhijit, adhikMaas, kharmas, pitruPaksha, combustion: combust, sankranti };
  }
}

export function timeIST(jd) {
  const r = new Date((jd - 2440587.5) * 86400000 + 19800000); // +5:30
  const p = (n) => String(n).padStart(2, "0");
  return { ymd: `${r.getUTCFullYear()}-${p(r.getUTCMonth() + 1)}-${p(r.getUTCDate())}`, hhmm: `${p(r.getUTCHours())}:${p(r.getUTCMinutes())}` };
}
