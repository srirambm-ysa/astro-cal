/* astro-cal app — UI + orchestration. Vanilla ESM, localStorage personal layer. */
import { Engine, RASHI, TAMIL_MONTH, NAKSHATRA, TITHI_NAMES, TAMIL_YEARS_60, timeIST,
         YOGA_NAMES, KARANA_NAMES, TARA_NAMES, TARA_NATURE, NAKSHATRA_GROUP } from "./engine.js";

const LS = {
  birth: "astro-cal-birth",
  events: "astro-cal-events",
  theme: "astro-cal-theme",
  view: "astro-cal-view",
};

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const DAY_MS = 86400000;
const TZ_IST = 5.5;

/* ---------- inline SVG icon set (research-approved; theme-swapped via CSS attr selectors) ---------- */
const I = {
  ama: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" fill="#262A4A"/><circle cx="9" cy="9" r="1" fill="#F8F0DE"/></svg>',
  pur: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill="#D3A94F"/><circle cx="12" cy="12" r="6" fill="#F8F0DE"/><circle cx="12" cy="12" r="3.5" fill="#262A4A"/></svg>',
  ecl: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="#D97427" stroke-width="1.6" stroke-dasharray="3 2"/><circle cx="12" cy="12" r="5.5" fill="#D3A94F"/><circle cx="10.5" cy="11" r="3.2" fill="#262A4A"/></svg>',
  rahu: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><path d="M4 20c3-8 8-13 16-16-1 9-5 14-13 17l-3-1z" fill="#B13B2B" opacity=".2"/><circle cx="9" cy="15" r="1.2" fill="#3D2412"/><circle cx="11" cy="12" r="1"/></svg>',
  yama: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><path d="M5 9l2-3 3 2 3-3 2 2 3-2 1 4-3 5-9-3z" fill="#B98A3E" opacity=".15"/><path d="M5 15h14M7 15v4M17 15v4" stroke="#B98A3E"/></svg>',
  gulika: '<svg viewBox="0 0 24 24" fill="none" stroke="#3D2412" stroke-width="1.7"><circle cx="12" cy="12" r="8" fill="#262A4A" opacity=".22"/><path d="M12 4a8 8 0 0 1 0 16z" fill="#262A4A"/><circle cx="9" cy="9" r="1.1" fill="#F8F0DE"/></svg>',
  shr: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.6"><path d="M8 17c4-1 6-1 8 0M9 14c3-2 5-2 6-1M11 20c2-1 3-1 5-1M7 18l1 3M16 18l1 3" opacity=".7"/><path d="M12 8l2-1 2-3 2 1-1 2-1 2h-4z" fill="#D97427"/></svg>',
  per: '<svg viewBox="0 0 24 24" fill="none" stroke="#B98A3E" stroke-width="1.6"><path d="M12 2l1.8 3.4 3.9.5-2.9 2.7.7 3.9L12 10.8 8.5 12.5l.7-3.9L6.3 5.9l3.9-.5L12 2z" fill="#B98A3E" opacity=".25"/><circle cx="12" cy="12" r="9" stroke="#B98A3E"/></svg>',
  fest: '<svg viewBox="0 0 24 24" fill="none" stroke="#D97427" stroke-width="1.6"><path d="M12 3l1.2 3 3 1.2-3 1.2L12 11.4l-1.2-3-3-1.2 3-1.2L12 3z" fill="#D97427" opacity=".35"/><circle cx="12" cy="12" r="8" stroke="#D97427" stroke-dasharray="3 2"/></svg>',
  san: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.7"><path d="M12 3v18M3 12h18" opacity=".5"/><circle cx="12" cy="12" r="6" fill="#B13B2B" opacity=".2"/><circle cx="12" cy="12" r="3.4" fill="#B13B2B"/></svg>',
  cha: '<svg viewBox="0 0 24 24" fill="none" stroke="#B13B2B" stroke-width="1.7"><path d="M12 3a9 9 0 0 1 0 18z" fill="#B13B2B" opacity=".25"/><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></svg>',
};

/* ---------- built-in Tamil festivals (always computed on the Tamil solar calendar) ---------- */
// nakshatra indexes: Poosam=Pushya(7), Uthiram=Uttara Phalguni(11), Avittam=Dhanishta(22)
// tMonth indexes (sidereal sun rashi): Thai=Makara(9), Karthigai=Vrischika(7), Panguni=Meena(11), Aadi=Karka(3), Aavani=Simha(4)
const TAMIL_FESTIVALS = [
  { key: "thaipoosam", name: "Thai Poosam", tMonth: 9, kind: "nakshatra", val: 7 },
  { key: "karthigaideepam", name: "Karthigai Deepam", tMonth: 7, kind: "tithi", val: 14 }, // full moon in Karthigai
  { key: "panguniuthiram", name: "Panguni Uthiram", tMonth: 11, kind: "nakshatra", val: 11 },
  { key: "aadiperukku", name: "Aadi Perukku", tMonth: 3, kind: "tamday", val: 18 },
  { key: "aavaniavittam", name: "Aavani Avittam", tMonth: 4, kind: "nakshatra", val: 22 },
];

/* ---------- phase 2: muhurta activity tables (starter set — validate against Drik) ---------- */
// Each activity: { nakshatras: shubh list (0-26), vara: favourable weekdays (Sun=0) or null for
//   "not filtered", paksha: "shukla" | "both", badTithis: tithis to avoid ([] = none),
//   badYogas: inauspicious yogas, badKaranas: inauspicious karanas, note }.
// These are the "impersonal" Drik-style filters; tara (personal) is layered on top.
const RIKTA_TITHIS = [3, 8, 13, 18, 23, 28]; // Chathurthi, Navami, Chaturdashi (both pakshas)
// NOTE: Marriage (Vivah) is deferred to a later phase — its tithi/paksha rules vary by tradition
// (Krishna paksha is permitted) and Drik's window-based muhurats are higher-precision than this
// day-granular table can reproduce. Until then the starter set is the three simpler activities below.
const ACTIVITIES = {
  grihapravesh: {
    name: "Griha Pravesh (housewarming)",
    nakshatras: [3, 11, 20, 25],           // fixed (Dhruva): Rohini, Uttara Phalguni, Uttara Ashadha, Uttara Bhadrapada
    vara: [2, 4],                          // Tue/Thu
    paksha: "shukla",
    badTithis: RIKTA_TITHIS,
    badYogas: [],
    badKaranas: [6],
    note: "Fixed (Dhruva) nakshatras; Tue/Thu; Shukla paksha.",
  },
  vehicle: {
    name: "Vehicle purchase",
    nakshatras: [3, 7, 12, 13, 14, 16, 18, 26], // Rohini, Pushya, Hasta, Chitra, Swati, Anuradha, Mula, Revati
    vara: [3, 4],                          // Wed/Thu
    paksha: "shukla",
    badTithis: RIKTA_TITHIS,
    badYogas: [],
    badKaranas: [6],
    note: "Pushya/Rohini/Revati-family stars; Wed/Thu; Shukla paksha.",
  },
  travel: {
    name: "Travel (Yatra)",
    nakshatras: [6, 14, 21, 22, 23],       // movable (Chara): Punarvasu, Swati, Shravana, Dhanishta, Shatabhisha
    vara: [1, 3, 4, 6],                    // Mon/Wed/Thu/Sat (direction-dependent in classical texts — simplified)
    paksha: "both",
    badTithis: RIKTA_TITHIS,
    badYogas: [],
    badKaranas: [6],
    note: "Movable (Chara) nakshatras; Mon/Wed/Thu/Sat. Direction rules simplified for v1.",
  },
};

/* combine personal (tara) + impersonal (activity) filters into a per-day verdict.
   Shubh = tara not bad AND nakshatra in list AND vara fit (if filtered) AND tithi not bad AND
   yoga not bad AND karana not bad.
   Ashubh = tara bad OR nakshatra NOT in the activity list.
   Else Neutral. Returns { verdict, reasons: [] }.

   opts.allowKrishnaFallback: when true and the activity is Shukla-paksha, also allow a
   Krishna-paksha day through the tithi/paksha gate (month-level fallback when Shukla yields
   no valid days). Used with the month pre-scan in renderMuhurta. */
function muhurtaVerdict(day, janmaNakshatra, act, opts = {}) {
  const tara = day.tara; // { number, count } from computeDay
  const taraGood = TARA_NATURE[tara.number - 1] === "good";
  const taraBad = TARA_NATURE[tara.number - 1] === "bad";
  const nakOK = act.nakshatras.length ? act.nakshatras.includes(day.moonNakshatra) : true;
  const varaOK = !act.vara || act.vara.includes(day.vara);
  const tithiBaseOK = !act.badTithis.includes(day.tithiIndex);
  const krishnaAllowed = opts.allowKrishnaFallback && day.tithi.paksha === "Krishna";
  const pakshaOK = act.paksha === "both" || day.tithi.paksha === "Shukla" || krishnaAllowed;
  const tithiOK = tithiBaseOK && pakshaOK;
  const yogaOK = !act.badYogas.includes(day.yoga.index);
  const karanaOK = !act.badKaranas.includes(day.karana.index);
  const impersonalPass = nakOK && varaOK && tithiBaseOK && yogaOK && karanaOK; // paksha-agnostic
  const reasons = [];
  reasons.push(taraGood ? `Tara ${TARA_NAMES[tara.number - 1]} ✓` : taraBad ? `Tara ${TARA_NAMES[tara.number - 1]} ✗` : `Tara ${TARA_NAMES[tara.number - 1]} ~`);
  if (act.nakshatras.length) reasons.push(`${NAKSHATRA[day.moonNakshatra]} ${nakOK ? "✓" : "✗"}`);
  if (act.vara) reasons.push(`Vara ${DOW[day.vara]} ${varaOK ? "✓" : "✗"}`);
  const pakshaTag = krishnaAllowed ? `${day.tithi.paksha}${TITHI_NAMES[day.tithiIndex]} ✓ (Krishna fallback)` : `${day.tithi.paksha} ${TITHI_NAMES[day.tithiIndex]} ${pakshaOK ? "✓" : (day.tithi.paksha === "Krishna" ? "✗ (Shukla only)" : "✗")}`;
  reasons.push(pakshaTag);
  reasons.push(`Yoga ${YOGA_NAMES[day.yoga.index]} ${yogaOK ? "✓" : "✗"}`);
  reasons.push(`Karana ${KARANA_NAMES[day.karana.index]} ${karanaOK ? "✓" : "✗"}`);
  if (day.starEnd) reasons.push(`Star ${NAKSHATRA[day.moonNakshatra]} valid till ${day.starEnd.ist} then ${day.starEnd.endNakshatraName}`);
  let verdict;
  if (taraBad || !nakOK) verdict = "Ashubh";
  else if (!taraBad && nakOK && varaOK && tithiOK && yogaOK && karanaOK) verdict = "Shubh"; // good OR neutral tara
  else verdict = "Neutral";
  return { verdict, reasons, tara, nakOK, varaOK, tithiOK, yogaOK, karanaOK, impersonalPass, krishnaAllowed };
}

/* ---------- state ---------- */
let swe = null;
let birth = null;      // { nakshatra:0-26, pada:1-4, rashi:0-11, place, lat, lon, tz }
let events = [];       // [{id,type,name,date?,tMonth?,tKind?,tVal?}]
let view = { range: "month", anchor: todayISO(), activity: "grihapravesh" }; // anchor = civil date (YYYY-MM-DD)

const $ = (id) => document.getElementById(id);

/* ---------- utils ---------- */
function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
function isoToYMD(iso) { const [y, m, d] = iso.split("-").map(Number); return { y, m, d }; }
function ymdToISO(y, m, d) { const p = (n) => String(n).padStart(2, "0"); return `${y}-${p(m)}-${p(d)}`; }
function dayLabel(iso) {
  const { y, m, d } = isoToYMD(iso);
  const dt = new Date(y, m - 1, d);
  return `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()]} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${String(d).padStart(2, "0")} ${y}`;
}
function fmtHHMM(jd) { const t = timeIST(jd); return t.hhmm; }

/* ---------- persistence ---------- */
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
function load(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }

/* ---------- festival + personal day matching ---------- */
function festivalMatches(f, tm, moonNakshatra, tithiIndex, tDay) {
  if (f.tMonth !== tm) return false;
  if (f.kind === "nakshatra") return moonNakshatra === f.val;
  if (f.kind === "tithi") return tithiIndex === f.val;
  if (f.kind === "tamday") return tDay === f.val;
  return false;
}
function personalMatches(ev, y, m, d, tm, moonNakshatra, tithiIndex, tDay) {
  if (ev.type === "birthday") {
    const dt = new Date(y, m - 1, d);
    const bd = new Date(ev.date);
    return dt.getMonth() === bd.getMonth() && dt.getDate() === bd.getDate();
  }
  if (ev.type === "blocked" || ev.type === "important") return ev.date === ymdToISO(y, m, d);
  if (ev.type === "tamil") {
    if (ev.tMonth !== tm) return false;
    if (ev.tKind === "nakshatra") return moonNakshatra === ev.tVal;
    if (ev.tKind === "tithi") return tithiIndex === ev.tVal;
    if (ev.tKind === "tamday") return tDay === ev.tVal;
    return false;
  }
  return false; // shraddha computed separately (needs death tithi + lunar month)
}

/* ---------- shraddha (annual death-tithi; Pitru Paksha fallback) ---------- */
function computeShraddha(ev, y, swe) {
  // Primary: same lunar tithi+paksha in the same lunar month each year.
  // Fallback (death on amavasya/purnima/chaturdashi, or no date): Sarva Pitru Amavasya.
  if (!ev.date) return [];
  const { y: dy, m: dm, d: dd } = isoToYMD(ev.date);
  const deathJD = swe.julday(dy, dm, dd, 12 - 5.5);
  const dt = swe.tithi(deathJD);
  // Traditional exception: deaths on Amavasya, Purnima or Chaturdashi are
  // commemorated on Sarva Pitru Amavasya instead of the monthly tithi.
  const special = dt.index === 29 || dt.index === 14 || dt.index === 13 || dt.index === 28;
  if (special) {
    const t0 = swe.julday(y, 8, 1, 0);
    const spa = swe.sarvaPitruAmavasya(t0);
    if (spa) {
      const d = swe.revjul(spa);
      return [{ iso: ymdToISO(d.year, d.month, d.day), kind: "spa" }];
    }
    return [];
  }
  // Primary: same tithi in the same lunar month. Search the Amanta cycles in year y,
  // take the cycle whose month matches the death's lunar month, then the days inside it
  // whose sunrise tithi == death tithi; use the SECOND occurrence if it appears twice.
  const deathLunarMonth = swe.lunarMonthOf(deathJD);
  const start = swe.julday(y, 1, 1, 0);
  const end = swe.julday(y, 12, 31, 0);
  const cycles = swe.amantaCycles(start, end);
  const cycle = cycles.find((c) => c.month === deathLunarMonth);
  if (!cycle) return [];
  const hits = [];
  let prevDayKey = "";
  for (let t = cycle.start; t <= cycle.end + 1; t += 0.5) {
    const tt = swe.tithi(t);
    if (tt.index !== dt.index) continue;
    const d = swe.revjul(t);
    const iso = ymdToISO(d.year, d.month, d.day);
    if (iso !== prevDayKey) { hits.push(iso); prevDayKey = iso; }
  }
  if (hits.length >= 2) return [{ iso: hits[hits.length - 1], kind: "annual" }];
  if (hits.length === 1) return [{ iso: hits[0], kind: "annual" }];
  return [];
}

/* ---------- day computation ---------- */
async function computeDay(y, m, d, geo) {
  const jdNoon = swe.julday(y, m, d, 12 - TZ_IST);
  const { rise, set } = swe.sunriseSunset(y, m, d, geo);
  const atSunrise = rise || jdNoon;
  const tt = swe.tithi(atSunrise);
  const tm = swe.tamilDate(atSunrise, y, m, d);
  const ty = swe.tamilYear(y, m, d);
  const kw = swe.kalamWindows(y, m, d, geo);
  const moonLon = swe.siderealLon(atSunrise, swe.swe.SE_MOON);
  const moonNakshatra = swe.nakshatraOf(moonLon);
  const tithiIndex = tt.index;
  const tDay = tm.tDay;
  const tMonth = tm.tMonth;
  const vara = new Date(y, m - 1, d).getDay();
  const yoga = swe.yoga(atSunrise);
  const karana = swe.karana(atSunrise);
  const tara = birth ? swe.taraBala(birth.nakshatra, moonNakshatra) : null;
  // sunrise-star window: does the sunrise nakshatra end before sunset (same civil day)?
  // If so the day is only valid-till that time for star-based verdicts.
  let starEnd = null;
  if (rise) {
    const nakEnd = swe.nakshatraEnd(atSunrise);
    if (nakEnd && nakEnd < set) {
      const endNak = swe.nakshatraOf(swe.siderealLon(nakEnd, swe.swe.SE_MOON));
      starEnd = { jd: nakEnd, ist: fmtHHMM(nakEnd), endNakshatra: endNak, endNakshatraName: NAKSHATRA[endNak] };
    }
  }
  return { y, m, d, iso: ymdToISO(y, m, d), rise, set, tithi: tt, tMonth, tDay, tithiIndex, moonNakshatra, tamilYear: ty, kalam: kw, jdNoon, moonLon, vara, yoga, karana, tara, starEnd };
}

function dayLabelTamil(tMonth, tDay) { return `${TAMIL_MONTH[tMonth]} ${String(tDay).padStart(2, "0")}`; }

/* ---------- calendar range building ---------- */
function buildMonthDays(y, m, geo) {
  const first = new Date(y, m - 1, 1);
  const startWeekday = first.getDay();
  const dim = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push({ y, m, d });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

/* ---------- render ---------- */
async function render() {
  if (!birth) return;
  const geo = [birth.lon, birth.lat, 0];
  const { y: ay, m: am, d: ad } = isoToYMD(view.anchor);
  const anchor = new Date(ay, am - 1, ad);
  $("app").hidden = false;
  renderProfile();

  const y0 = anchor.getFullYear(), m0 = anchor.getMonth() + 1;
  const rangeStart = { y: y0, m: m0, d: 1 };
  const rangeEnd = { y: y0, m: m0, d: new Date(y0, m0, 0).getDate() };
  const title = monthTitle(y0, m0);

  const tStart = swe.julday(rangeStart.y, rangeStart.m, rangeStart.d, 0);
  const tEnd = swe.julday(rangeEnd.y, rangeEnd.m, rangeEnd.d, 24 - TZ_IST) + 0.5;

  // precompute range-level items once
  const janma = { nakshatra: birth.nakshatra, rashi: birth.rashi };
  const chandraWindows = swe.chandrashtama(janma, tStart, tEnd, geo);
  const solarEcl = swe.solarEclipses(tStart, tEnd);
  const lunarEcl = swe.lunarEclipses(tStart, tEnd);

  $("calTitle").textContent = title;
  const tamilYearName = swe.tamilYear(rangeStart.y, rangeStart.m, rangeStart.d);
  $("calTamilYear").textContent = `${TAMIL_MONTH[tmOf(swe, rangeStart.y, rangeStart.m, rangeStart.d, geo)]} · Tamil ${tamilYearName.name} (${tamilYearName.index})`;

  // build day cache
  const dayMap = new Map();
  for (let yy = rangeStart.y; yy <= rangeEnd.y; yy++) {
    const mStart = yy === rangeStart.y ? rangeStart.m : 1;
    const mEnd = yy === rangeEnd.y ? rangeEnd.m : 12;
    for (let mm = mStart; mm <= mEnd; mm++) {
      const dStart = yy === rangeStart.y && mm === rangeStart.m ? rangeStart.d : 1;
      const dEnd = yy === rangeEnd.y && mm === rangeEnd.m ? rangeEnd.d : new Date(yy, mm, 0).getDate();
      for (let dd = dStart; dd <= dEnd; dd++) {
        dayMap.set(ymdToISO(yy, mm, dd), await computeDay(yy, mm, dd, geo));
      }
    }
  }

  // overlay per-day flags (chandrashtama, eclipses, festivals, personal)
  const flagMap = new Map();
  const windowsByDay = new Map();
  for (const w of chandraWindows) {
    // assign window to each civil day it overlaps (for the bar)
    let t = w.start;
    while (t < w.end) {
      const r = swe.revjul(t);
      const iso = ymdToISO(r.year, r.month, r.day);
      if (dayMap.has(iso)) {
        const dl = windowsByDay.get(iso) || [];
        dl.push({ kind: w.kind, start: w.start, end: w.end, nakshatra: w.nakshatra, rashi: w.rashi });
        windowsByDay.set(iso, dl);
      }
      t += 1; // advance ~1 day per iteration (coarse windows span ~2.25d)
    }
  }
  for (const ecl of solarEcl) flagMap.set(dateOfJD(swe, ecl.max), { key: "ecl", name: `Solar eclipse${ecl.total ? " (total)" : ecl.annular ? " (annular)" : " (partial)"}`, start: ecl.begin, end: ecl.end });
  for (const ecl of lunarEcl) flagMap.set(dateOfJD(swe, ecl.max), { key: "ecl", name: `Lunar eclipse${ecl.total ? " (total)" : " (partial)"}`, start: ecl.begin, end: ecl.end });

  // shraddha for the range
  for (const ev of events) {
    if (ev.type !== "shraddha") continue;
    for (let yy = rangeStart.y; yy <= rangeEnd.y; yy++) {
      for (const s of computeShraddha(ev, yy, swe)) {
        if (!flagMap.has(s.iso)) flagMap.set(s.iso, { key: "shr", name: `Shraddha — ${ev.name}` });
      }
    }
  }

  // render grid
  $("cal").innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "calendar";
  grid.innerHTML = DOW.map((x) => `<div class="dow">${x}</div>`).join("");
  for (const cell of buildMonthDays(y0, m0, geo)) {
    if (!cell) { grid.insertAdjacentHTML("beforeend", '<div class="cell other"></div>'); continue; }
    grid.appendChild(renderCell(cell, dayMap, flagMap, windowsByDay));
  }
  $("cal").appendChild(grid);

  renderMonthEvents(dayMap, flagMap, windowsByDay);
  renderLegend();
  renderMuhurta(dayMap);
  $("monthEvTitle").textContent = `Key events — ${title}`;

  // day detail
  const sel = $("cal").querySelector(".cell.selected");
  if (sel) { $("dayDetailCard").hidden = false; showDetail(sel.dataset.iso, dayMap, flagMap, windowsByDay); }
  else { $("dayDetailCard").hidden = true; }
}

function renderCell(cell, dayMap, flagMap, windowsByDay) {
  const { y, m, d } = cell;
  const iso = ymdToISO(y, m, d);
  const day = dayMap.get(iso);
  if (!day) return document.createElement("div");
  const el = document.createElement("div");
  el.className = "cell" + (iso === todayISO() ? " today" : "");
  el.dataset.iso = iso;
  if (iso === view.selected) el.classList.add("selected");

  const ws = windowsByDay.get(iso) || [];
  const coarse = ws.filter((w) => w.kind === "coarse");
  const peak = ws.filter((w) => w.kind === "peak");
  let bar = "";
  if (coarse.length || peak.length) {
    const dayStart = swe.julday(y, m, d, -TZ_IST);
    const dayEnd = swe.julday(y, m, d, 24 - TZ_IST);
    const dayLen = dayEnd - dayStart;
    let coarseLeft = 0, coarseW = 0, peakLeft = 0, peakW = 0;
    if (coarse.length) { const c = coarse[0]; const cs = Math.max(dayStart, c.start), ce = Math.min(dayEnd, c.end); coarseLeft = (cs - dayStart) / dayLen * 100; coarseW = (ce - cs) / dayLen * 100; }
    if (peak.length) { const p = peak[0]; const ps = Math.max(dayStart, p.start), pe = Math.min(dayEnd, p.end); peakLeft = (ps - dayStart) / dayLen * 100; peakW = (pe - ps) / dayLen * 100; }
    bar = `<div class="bar coarse" style="left:${coarseLeft}%;width:${Math.min(100 - coarseLeft, coarseW)}%">${peakW > 0 ? `<div class="peak" style="left:${peakLeft - coarseLeft}%;width:${Math.min(100, peakW)}%"></div>` : ""}</div>`;
  }

  const dots = dayDots(day, iso, flagMap);

  el.innerHTML = `
    <span class="num ${iso === todayISO() ? "today" : ""}">${d}</span>
    <div class="tm">${dayLabelTamil(day.tMonth, day.tDay)}</div>
    <div class="tithi">${day.tithi.paksha === "Shukla" ? "Shu" : "Kr"} ${TITHI_NAMES[day.tithi.index].slice(0, 6)}</div>
    <div class="dots">${dots}</div>
    ${bar}`;
  el.addEventListener("click", () => { view.selected = iso; save(LS.view, view); render(); });
  return el;
}

/* category dots for a day cell: moon, eclipse, festival, personal, shraddha */
function dayDots(day, iso, flagMap) {
  const cats = [];
  if (day.tithi.amavasya || day.tithi.purnima) cats.push("moon");
  if (flagMap.has(iso) && flagMap.get(iso).key === "ecl") cats.push("eclipse");
  const moonN = day.moonNakshatra;
  for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) { cats.push("festival"); break; }
  for (const ev of events) if (personalMatches(ev, day.y, day.m, day.d, day.tMonth, moonN, day.tithiIndex, day.tDay)) { cats.push("personal"); break; }
  if (flagMap.has(iso) && flagMap.get(iso).key === "shr") cats.push("shraddha");
  return cats.slice(0, 4).map((c) => `<span class="dot ${c}"></span>`).join("");
}

const CAT_LABEL = { moon: "Moon", eclipse: "Eclipse", festival: "Festival", personal: "Personal", shraddha: "Shraddha" };

/* phase-2 muhurta table (right panel): cumulative across ALL activities.
   A day is listed if it is Shubh or Neutral for at least one activity (Ashubh-only
   days are hidden). Each row carries a per-activity verdict so one glance shows
   which activity works on which day. The activity dropdown still sets the "focus"
   activity whose tara+window note drives the day-detail panel. */
function renderMuhurta(dayMap) {
  const tbody = $("muhurtas");
  const rows = [];
  const days = [...dayMap.values()].sort((a, b) => (a.iso < b.iso ? -1 : 1));
  const focusAct = ACTIVITIES[view.activity] || ACTIVITIES.grihapravesh;
  // month-level fallback only for the focused activity's summary below
  const shuklaFallback = focusAct.paksha === "shukla" && !days.some((d) => muhurtaVerdict(d, birth.nakshatra, focusAct).impersonalPass && d.tithi.paksha === "Shukla");
  const actEntries = Object.entries(ACTIVITIES);
  let shubhTotal = 0;
  for (const day of days) {
    if (!day.tara) continue; // without birth star, no personal verdict — skip from muhurta list
    // per-activity verdicts (primary rule only; fallback only flags the focused activity)
    const perAct = actEntries.map(([key, a]) => {
      const v = muhurtaVerdict(day, birth.nakshatra, a);
      return { key, name: a.name, verdict: v.verdict };
    });
    const shown = perAct.some((p) => p.verdict === "Shubh" || p.verdict === "Neutral");
    if (!shown) continue;
    if (perAct.some((p) => p.verdict === "Shubh")) shubhTotal++;

    const dt = new Date(day.y, day.m - 1, day.d);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const mn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][day.m - 1];
    const dateStr = `${dayName} ${mn} ${String(day.d).padStart(2, "0")}`;
    const sel = day.iso === view.selected ? " selected" : "";
    const taraTxt = `${TARA_NAMES[day.tara.number - 1]} (${day.tara.number})`;
    // focused verdict (for click → day detail) with active fallback
    const fopts = shuklaFallback && day.tithi.paksha === "Krishna" ? { allowKrishnaFallback: true } : {};
    const fv = muhurtaVerdict(day, birth.nakshatra, focusAct, fopts);
    const title = fv.reasons.join(" · ");
    const chips = actEntries.map(([key, a]) => {
      const p = perAct.find((x) => x.key === key);
      if (p.verdict === "Ashubh") return ""; // only surface Shubh / Neutral verdicts
      const cls = p.verdict === "Shubh" ? "shubh" : "neutral";
      return `${a.name.split(" ")[0]}:<span class="chip verdict ${p.verdict} ${cls}">${p.verdict}</span>`;
    }).filter(Boolean).join(" ");
    rows.push(`<tr class="muhrow${sel}" data-iso="${day.iso}" title="${title}"><td class="dt">${dateStr}</td><td class="tara">${taraTxt}</td><td class="nak">${NAKSHATRA[day.moonNakshatra]}</td><td class="acts">${chips}</td></tr>`);
  }
  tbody.innerHTML = rows.join("");
  tbody.querySelectorAll(".muhrow").forEach((tr) => tr.addEventListener("click", () => { view.selected = tr.dataset.iso; save(LS.view, view); render(); }));
  $("muhActName").textContent = `Activity focus: ${focusAct.name}`;
  const fbNote = shuklaFallback ? " (Krishna-paksha days also shown — no Shukla days qualified this month)" : "";
  $("muhSummary").textContent = `${shubhTotal} Shubh days this month for ${focusAct.name}${fbNote}. ${focusAct.note}`;
}

/* month key-events table (right panel): one row per flagged day */
function renderMonthEvents(dayMap, flagMap, windowsByDay) {
  const tbody = $("monthEvents");
  tbody.innerHTML = "";
  const days = [...dayMap.values()].sort((a, b) => (a.iso < b.iso ? -1 : 1));
  let rows = 0;
  for (const day of days) {
    const { y, m, d } = isoToYMD(day.iso);
    const entries = [];
    const ws = windowsByDay.get(day.iso) || [];
    if (ws.some((w) => w.kind === "coarse")) entries.push({ cat: "chandrashtama", name: "Chandrashtama (coarse)", sub: "avoid new ventures" });
    if (ws.some((w) => w.kind === "peak")) entries.push({ cat: "chandrashtama", name: "Chandrashtama (peak)", sub: "avoid — most inauspicious" });
    if (day.tithi.amavasya) entries.push({ cat: "moon", name: "Amavasya (new moon)", sub: "" });
    if (day.tithi.purnima) entries.push({ cat: "moon", name: "Purnima (full moon)", sub: "" });
    if (day.tDay === 1) entries.push({ cat: "sankranti", name: `${TAMIL_MONTH[day.tMonth]} 1 — sankranti`, sub: "Tamil month begins" });
    if (flagMap.has(day.iso)) {
      const f = flagMap.get(day.iso);
      if (f.key === "ecl") entries.push({ cat: "eclipse", name: f.name, sub: "" });
      if (f.key === "shr") entries.push({ cat: "shraddha", name: f.name, sub: "annual · confirm with a priest" });
    }
    const moonN = day.moonNakshatra;
    for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) entries.push({ cat: "festival", name: f.name, sub: "Tamil festival" });
    for (const ev of events) {
      if (personalMatches(ev, y, m, d, day.tMonth, moonN, day.tithiIndex, day.tDay))
        entries.push({ cat: "personal", name: ev.name, sub: ev.type === "birthday" ? "Annual" : ev.type === "blocked" ? "Blocked day" : "Personal event" });
    }
    if (!entries.length) continue;
    const dt = new Date(y, m - 1, d);
    const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()];
    const dateStr = `${dayName} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1]} ${String(d).padStart(2, "0")}`;
    for (const e of entries) {
      rows++;
      const sel = day.iso === view.selected ? " class=\"selected\"" : "";
      tbody.insertAdjacentHTML("beforeend",
        `<tr${sel} data-iso="${day.iso}"><td class="dt">${dateStr}</td><td><div class="ev-name">${e.name}</div>${e.sub ? `<div class="ev-sub">${e.sub}</div>` : ""}</td><td class="cat"><span class="chip ${e.cat}">${e.cat === "chandrashtama" ? "Chandra" : e.cat === "sankranti" ? "Sankranti" : CAT_LABEL[e.cat] || e.cat}</span></td></tr>`);
    }
  }
  if (!rows) tbody.insertAdjacentHTML("beforeend", '<tr><td colspan="3"><div class="note">No flagged days in this range.</div></td></tr>');
}

/* legend swatches (chandrashtama bar + category dots) */
function renderLegend() {
  $("legend").innerHTML = `
    <div class="item"><span class="swatch two"></span>Chandrashtama (orange coarse · red peak)</div>
    <div class="item"><span class="swatch moon"></span>Moon phase</div>
    <div class="item"><span class="swatch eclipse"></span>Eclipse</div>
    <div class="item"><span class="swatch festival"></span>Festival</div>
    <div class="item"><span class="swatch personal"></span>Personal</div>
    <div class="item"><span class="swatch shraddha"></span>Shraddha</div>`;
}

function showDetail(iso, dayMap, flagMap, windowsByDay) {
  const day = dayMap.get(iso);
  if (!day) return;
  $("detailTitle").textContent = dayLabel(iso);
  const parts = [];
  const ws = windowsByDay.get(iso) || [];
  const coarse = ws.find((w) => w.kind === "coarse");
  const peak = ws.find((w) => w.kind === "peak");
  if (coarse) {
    const peakTxt = peak && peak.nakshatra != null ? ` · peak ${fmtHHMM(peak.start)}–${fmtHHMM(peak.end)} (${NAKSHATRA[peak.nakshatra]})` : "";
    parts.push(periodRow(I.cha, "Chandrashtama — coarse" + (peak ? " + peak" : ""), `${fmtHHMM(coarse.start)} → ${fmtHHMM(coarse.end)}${peakTxt}`, "bad", "AVOID"));
  }
  const k = day.kalam;
  if (k) {
    parts.push(periodRow(I.rahu, "Rahu Kalam", `${fmtHHMM(k.rahu.start)}–${fmtHHMM(k.rahu.end)} · avoid new work`, "mid", "Rahu"));
    parts.push(periodRow(I.yama, "Yama Ghatam", `${fmtHHMM(k.yama.start)}–${fmtHHMM(k.yama.end)} · avoid travel`, "mut", "Yama"));
    parts.push(periodRow(I.gulika, "Gulika Kalam", `${fmtHHMM(k.gulika.start)}–${fmtHHMM(k.gulika.end)} · avoid beginnings`, "mut", "Gulika"));
  }
  if (day.tithi.amavasya) parts.push(periodRow(I.ama, "Amavasya (new moon)", "All day", "per", "Moon"));
  if (day.tithi.purnima) parts.push(periodRow(I.pur, "Purnima (full moon)", "All day", "per", "Moon"));
  if (flagMap.has(iso)) {
    const f = flagMap.get(iso);
    if (f.key === "ecl") parts.push(periodRow(I.ecl, f.name, f.start ? `${fmtHHMM(f.start)} → ${fmtHHMM(f.end)}` : "All day", "per", "Eclipse"));
    if (f.key === "shr") parts.push(periodRow(I.shr, f.name, "Annual · confirm with a priest", "per", "Shraddha"));
  }
  // festivals + personal
  const moonN = day.moonNakshatra;
  for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) parts.push(periodRow(I.fest, f.name, `${dayLabelTamil(day.tMonth, day.tDay)} · Tamil calendar`, "mut", "Festival"));
  for (const ev of events) {
    if (personalMatches(ev, day.y, day.m, day.d, day.tMonth, moonN, day.tithiIndex, day.tDay))
      parts.push(periodRow(I.per, ev.name, ev.type === "birthday" ? "Annual · personal event" : "Personal event", "per", "Personal"));
  }
  $("detail").innerHTML = parts.length ? parts.join("") : '<div class="note">No flagged periods today.</div>';
  $("rSunrise").textContent = day.rise ? fmtHHMM(day.rise) : "–";
  $("rSunset").textContent = day.set ? fmtHHMM(day.set) : "–";
  $("rTithi").textContent = `${day.tithi.paksha} ${day.tithi.name}`;
  // phase-2: tara + per-activity verdict for the selected day
  const act = ACTIVITIES[view.activity] || ACTIVITIES.grihapravesh;
  const days = dayMap ? [...dayMap.values()] : [day];
  const shuklaFallback = act.paksha === "shukla" && !days.some((d) => muhurtaVerdict(d, birth.nakshatra, act).impersonalPass && d.tithi.paksha === "Shukla");
  const vopts = shuklaFallback && day.tithi.paksha === "Krishna" ? { allowKrishnaFallback: true } : {};
  const v = day.tara ? muhurtaVerdict(day, birth.nakshatra, act, vopts) : null;
  $("muhDetail").innerHTML = v ? `
    <div class="muh-line"><span class="k">Tara</span><span class="v">${TARA_NAMES[v.tara.number - 1]} (${v.tara.number}) — ${TARA_NATURE[v.tara.number - 1] === "good" ? "favourable" : TARA_NATURE[v.tara.number - 1] === "bad" ? "unfavourable" : "neutral"}</span></div>
    <div class="muh-line"><span class="k">${act.name}</span><span class="chip ${v.verdict}">${v.verdict}</span></div>
    <div class="muh-line"><span class="k">Reasons</span><span class="v">${v.reasons.join(" · ")}</span></div>${v.krishnaAllowed ? `
    <div class="muh-line note"><span class="k">Fallback</span><span class="v">No Shukla day qualified this month · Krishna paksha shown</span></div>` : ""}${day.starEnd ? `
    <div class="muh-line"><span class="k">Window</span><span class="v">Sunrise star valid till ${day.starEnd.ist}, then ${day.starEnd.endNakshatraName}</span></div>` : ""}` : "";
  $("muhDetailCard").hidden = !v;
}

function periodRow(icon, title, sub, tagCls, tagTxt) {
  return `<div class="period"><div class="l">${icon}<div><span class="t">${title}</span><div class="tt">${sub}</div></div></div><span class="tag ${tagCls}">${tagTxt}</span></div>`;
}

/* ---------- helpers ---------- */
function monthTitle(y, m) { return `${["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][m - 1]} ${y}`; }
function dateOfJD(swe, jd) { const r = swe.revjul(jd); return ymdToISO(r.year, r.month, r.day); }
function tmOf(swe, y, m, d, geo) { const jd = swe.julday(y, m, d, 12 - TZ_IST); return swe.tamilDate(jd, y, m, d).tMonth; }

/* ---------- profile ---------- */
function renderProfile() {
  $("profile").innerHTML = `
    <div class="kv"><div class="k">Janma Nakshatra</div><div class="v">${NAKSHATRA[birth.nakshatra]}</div></div>
    <div class="kv"><div class="k">Janma Rashi</div><div class="v">${RASHI[birth.rashi]}</div></div>
    <div class="kv"><div class="k">Panchang location</div><div class="v">${birth.place} · Lahiri</div></div>
    <div class="kv"><div class="k">Panchang day</div><div class="v">Sunrise → sunrise</div></div>`;
}

/* ---------- ICS export ---------- */
async function buildICS(startISO, endISO) {
  const lines = [];
  const add = (l) => lines.push(l);
  add("BEGIN:VCALENDAR");
  add("VERSION:2.0");
  add("PRODID:-//astro-cal//Muhurta Calendar//EN");
  add("CALSCALE:GREGORIAN");
  add("BEGIN:VTIMEZONE");
  add("TZID:Asia/Kolkata");
  add("BEGIN:STANDARD");
  add("DTSTART:19700101T000000");
  add("TZOFFSETFROM:+0530");
  add("TZOFFSETTO:+0530");
  add("END:STANDARD");
  add("END:VTIMEZONE");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  let uid = 0;
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const dayAdd = (iso) => { const { y, m, d } = isoToYMD(iso); const dt = new Date(Date.UTC(y, m - 1, d)); dt.setUTCDate(dt.getUTCDate() + 1); const p = (n) => String(n).padStart(2, "0"); return `${dt.getUTCFullYear()}${p(dt.getUTCMonth() + 1)}${p(dt.getUTCDate())}`; };
  const event = (summary, dstart, opts = {}) => {
    add("BEGIN:VEVENT");
    add(`UID:astro-cal-${Date.now()}-${uid++}@muhurta`);
    add(`DTSTAMP:${stamp}`);
    add(`SUMMARY:${esc(summary)}`);
    if (opts.allday) { add(`DTSTART;VALUE=DATE:${dstart}`); add(`DTEND;VALUE=DATE:${dayAdd(dstart)}`); }
    else { add(`DTSTART;TZID=Asia/Kolkata:${dstart}`); add(`DTEND;TZID=Asia/Kolkata:${opts.dend}`); }
    if (opts.rrule) add(`RRULE:${opts.rrule}`);
    add("END:VEVENT");
  };
  const tzDT = (jd) => { const t = timeIST(jd); return t.ymd.replace(/-/g, "") + "T" + t.hhmm.replace(":", "") + "00"; };

  const { y: sy, m: sm, d: sd } = isoToYMD(startISO);
  const { y: ey, m: em, d: ed } = isoToYMD(endISO);
  const tStart = swe.julday(sy, sm, sd, 0);
  const tEnd = swe.julday(ey, em, ed, 24 - TZ_IST) + 0.5;
  const geo = [birth.lon, birth.lat, 0];
  const janma = { nakshatra: birth.nakshatra, rashi: birth.rashi };

  // chandrashtama windows (timed)
  for (const w of swe.chandrashtama(janma, tStart, tEnd, geo)) {
    event(`Chandrashtama ${w.kind === "coarse" ? "coarse" : "peak"}`, tzDT(w.start), { dend: tzDT(w.end) });
  }
  // eclipses
  for (const e of swe.solarEclipses(tStart, tEnd)) event(`Solar eclipse${e.total ? " (total)" : ""}`, tzDT(e.begin), { dend: tzDT(e.end) });
  for (const e of swe.lunarEclipses(tStart, tEnd)) event(`Lunar eclipse${e.total ? " (total)" : ""}`, tzDT(e.begin), { dend: tzDT(e.end) });

  // per-day all-day items (amavasya/purnima/festivals/personal)
  const dayMap = new Map();
  for (let yy = sy; yy <= ey; yy++) {
    const mStart = yy === sy ? sm : 1;
    const mEnd = yy === ey ? em : 12;
    for (let mm = mStart; mm <= mEnd; mm++) {
      const dStart = yy === sy && mm === sm ? sd : 1;
      const dEnd = yy === ey && mm === em ? ed : new Date(yy, mm, 0).getDate();
      for (let dd = dStart; dd <= dEnd; dd++) dayMap.set(ymdToISO(yy, mm, dd), await computeDay(yy, mm, dd, geo));
    }
  }
  for (const [iso, day] of dayMap) {
    const dateStr = iso.replace(/-/g, "");
    if (day.tithi.amavasya) event("Amavasya (new moon)", dateStr, { allday: true });
    if (day.tithi.purnima) event("Purnima (full moon)", dateStr, { allday: true });
    const moonN = day.moonNakshatra;
    for (const f of TAMIL_FESTIVALS) if (festivalMatches(f, day.tMonth, moonN, day.tithiIndex, day.tDay)) event(f.name, dateStr, { allday: true });
    const { y: yy, m: mm, d: dd } = isoToYMD(iso);
    for (const ev of events) {
      if (personalMatches(ev, yy, mm, dd, day.tMonth, moonN, day.tithiIndex, day.tDay)) {
        event(ev.name, dateStr, { allday: true, rrule: ev.type === "birthday" ? "FREQ=YEARLY" : undefined });
      }
    }
  }
  // shraddha (annual death-tithi / Sarva Pitru Amavasya) — computed per year like render()
  for (const ev of events) {
    if (ev.type !== "shraddha") continue;
    for (let yy = sy; yy <= ey; yy++) {
      for (const s of computeShraddha(ev, yy, swe)) {
        const iso = s.iso;
        if (iso >= startISO && iso <= endISO) event(`Shraddha — ${ev.name}`, iso.replace(/-/g, ""), { allday: true });
      }
    }
  }
  add("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

/* ---------- events UI ---------- */
function renderEvents() {
  $("evCount").textContent = events.length ? `(${events.length})` : "";
  $("evList").innerHTML = events.length ? "" : '<div class="note">No personal events yet. Add birthdays, blocked days, shraddha tithis, or Tamil-month events.</div>';
  for (const ev of events) {
    const desc = ev.type === "birthday" ? `Annual · ${ev.date}` : ev.type === "shraddha" ? `Death date · ${ev.date}` : ev.type === "tamil" ? `${TAMIL_MONTH[ev.tMonth]} · ${ev.tKind} ${ev.tVal}` : ev.date;
    $("evList").insertAdjacentHTML("beforeend", `<div class="ev"><div><div class="t">${ev.name}</div><div class="tt">${desc}</div></div><button class="rm" data-id="${ev.id}">remove</button></div>`);
  }
  $("evList").querySelectorAll(".rm").forEach((b) => b.addEventListener("click", () => { events = events.filter((e) => e.id !== Number(b.dataset.id)); save(LS.events, events); renderEvents(); render(); }));
}

function evFormToggle() {
  const t = $("evType").value;
  $("evDateF").hidden = t === "tamil";
  $("evTamilF").hidden = t !== "tamil";
}

/* ---------- theme ---------- */
const ICON_MOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const ICON_SUN = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
function setTheme(night) {
  document.body.classList.toggle("night", night);
  $("themeIcon").innerHTML = night ? ICON_SUN : ICON_MOON;
  $("themeLabel").textContent = night ? "Day mode" : "Night mode";
  save(LS.theme, night ? "night" : "day");
}
function toggleTheme() { setTheme(!document.body.classList.contains("night")); }

/* ---------- range nav ---------- */
function nav(delta) {
  const { y, m, d } = isoToYMD(view.anchor);
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + delta);
  view.anchor = ymdToISO(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  save(LS.view, view);
  render();
}

/* ---------- print / copy ---------- */
function printView() { window.print(); }
function copyDayEvents() {
  const iso = view.selected;
  const txt = document.getElementById("detail").innerText;
  if (!iso || !txt) { alert("Select a day first."); return; }
  const { y, m, d } = isoToYMD(iso);
  const dt = new Date(y, m - 1, d);
  const label = `${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dt.getDay()]}, ${dayLabel(iso)}`;
  const copyText = `${label}\n${txt}`;
  navigator.clipboard.writeText(copyText).then(() => {
    const b = $("copyBtn");
    b.textContent = "Copied";
    setTimeout(() => (b.textContent = "Copy events"), 1200);
  }).catch(() => alert("Copy failed."));
}

/* ---------- birth form ---------- */
function openBirthForm() {
  $("landing").scrollIntoView({ behavior: "smooth" });
  $("birthForm").scrollIntoView({ behavior: "smooth" });
}
function computeBirth() {
  const nakshatra = Number($("bNakshatra").value);
  const rashi = Number($("bRashi").value);
  const place = $("bPlace").value.trim() || "Chennai";
  const lat = parseFloat($("bLat").value);
  const lon = parseFloat($("bLon").value);
  const tz = parseFloat($("bTz").value);
  if (isNaN(nakshatra) || isNaN(rashi) || isNaN(lat) || isNaN(lon) || isNaN(tz)) { alert("Pick your janma nakshatra and enter valid panchang coordinates."); return; }
  birth = { nakshatra, rashi, place, lat, lon, tz };
  save(LS.birth, birth);
  $("landing").hidden = true;
  render();
}

/* ---------- init ---------- */
async function init() {
  const t = load(LS.theme, "day");
  setTheme(t === "night");
  const ev = load(LS.events, []);
  events = Array.isArray(ev) ? ev : [];
  view = { ...view, ...load(LS.view, {}) };
  renderEvents();

  // populate tamil month select
  TAMIL_MONTH.forEach((name, i) => $("evTMonth").insertAdjacentHTML("beforeend", `<option value="${i}">${name}</option>`));

  // populate muhurta activity select
  const muhSel = $("muhAct");
  Object.entries(ACTIVITIES).forEach(([key, a]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = a.name;
    if (key === view.activity) opt.selected = true;
    muhSel.appendChild(opt);
  });
  muhSel.addEventListener("change", () => { view.activity = muhSel.value; save(LS.view, view); if (birth) render(); });

  // populate janma nakshatra dropdown (flat 27 list) + rashi select (editable, auto-filled)
  const nakSel = $("bNakshatra");
  NAKSHATRA.forEach((name, n) => {
    const opt = document.createElement("option");
    opt.value = String(n);
    opt.textContent = `${name} (${RASHI[Math.floor((n * 4) / 9) % 12]})`;
    nakSel.appendChild(opt);
  });
  RASHI.forEach((name, i) => $("bRashi").insertAdjacentHTML("beforeend", `<option value="${i}">${name}</option>`));
  nakSel.addEventListener("change", () => {
    const n = Number(nakSel.value);
    $("bRashi").value = String(Math.floor((n * 4) / 9) % 12);
  });

  $("computeBtn").addEventListener("click", computeBirth);
  $("editBirth").addEventListener("click", () => { $("landing").hidden = false; openBirthForm(); });
  $("themeBtn").addEventListener("click", toggleTheme);
  evFormToggle();
  $("navPrev").addEventListener("click", () => nav(-1));
  $("navNext").addEventListener("click", () => nav(1));
  $("printBtn").addEventListener("click", printView);
  $("copyBtn").addEventListener("click", copyDayEvents);
  $("evType").addEventListener("change", evFormToggle);
  $("evAdd").addEventListener("click", () => {
    const name = $("evName").value.trim();
    if (!name) return;
    const type = $("evType").value;
    const ev = { id: Date.now(), name, type };
    if (type === "tamil") { ev.tMonth = Number($("evTMonth").value); ev.tKind = $("evTKind").value; ev.tVal = Number($("evTVal").value); }
    else ev.date = $("evDate").value;
    events.push(ev);
    save(LS.events, events);
    $("evName").value = "";
    renderEvents();
    if (birth) render();
  });
  $("icsBtn").addEventListener("click", () => {
    if (!birth) { alert("Compute a calendar first."); return; }
    const { y: yy, m: mm } = isoToYMD(view.anchor);
    const start = `${yy}-${String(mm).padStart(2, "0")}-01`;
    const end = `${yy}-${String(mm).padStart(2, "0")}-${new Date(yy, mm, 0).getDate()}`;
    buildICS(start, end).then((ics) => {
      const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `muhurta-${start}-to-${end}.ics`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  });

  swe = await new Engine().init();

  const savedBirth = load(LS.birth, null);
  if (savedBirth && Number.isInteger(savedBirth.nakshatra)) {
    if (!Number.isInteger(savedBirth.rashi)) {
      // migrate old birth records (had pada, no rashi field)
      const pada = Number.isInteger(savedBirth.pada) ? savedBirth.pada : 1;
      savedBirth.rashi = Math.floor((savedBirth.nakshatra * 4 + (pada - 1)) / 9) % 12;
    }
    birth = savedBirth;
    $("bNakshatra").value = String(birth.nakshatra);
    $("bRashi").value = String(birth.rashi);
    $("bPlace").value = birth.place || "";
    $("bLat").value = birth.lat;
    $("bLon").value = birth.lon;
    $("bTz").value = birth.tz;
    $("landing").hidden = true;
    render();
  }
}

init();
