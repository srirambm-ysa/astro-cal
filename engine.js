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
}

export function timeIST(jd) {
  const r = new Date((jd - 2440587.5) * 86400000 + 19800000); // +5:30
  const p = (n) => String(n).padStart(2, "0");
  return { ymd: `${r.getUTCFullYear()}-${p(r.getUTCMonth() + 1)}-${p(r.getUTCDate())}`, hhmm: `${p(r.getUTCHours())}:${p(r.getUTCMinutes())}` };
}
