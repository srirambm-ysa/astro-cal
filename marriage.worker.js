/* marriage.worker.js — dedicated Web Worker for the Vivaha Muhurta scan.
   Mirrors ephemeris.worker.js but is marriage-specific: besides computeDay it
   also computes the marriage extras (lagna rashi, sun nakshatra, planet
   positions) per day, and streams progress so the UI bar animates. Kept
   separate from ephemeris.worker.js so index.html's worker path is untouched.
   Protocol:
     in  { type:"computeMarriageRange", reqId, payload:{ rangeStart, rangeEnd, geo, tz } }
     out { type:"computeMarriageProgress", reqId, done, total, lastISO }   (every ~7 days)
     out { type:"computeMarriageResult",  reqId, ok:true, days:[...] }
     out { type:"computeMarriageResult",  reqId, ok:false, error }         (on failure) */
import { Engine } from "./engine.js";

let engine = null;

async function getEngine() {
  if (!engine) engine = await new Engine().init();
  return engine;
}

function dayExtras(swe, day, geo) {
  const t = day.rise || day.jdNoon;
  day.geo = geo;
  day.lagnaRashi = swe.ascendant(t, geo);
  day.sunNakshatra = swe.sunNakshatra(t);
  day.planets = swe.planetPositions(t);
}

self.onmessage = async (e) => {
  const { type, reqId, payload } = e.data;
  if (type !== "computeMarriageRange") return;
  try {
    const swe = await getEngine();
    const { rangeStart, rangeEnd, geo, tz } = payload;
    const days = [];
    let total = 0;
    for (let yy = rangeStart.y; yy <= rangeEnd.y; yy++) {
      const mStart = yy === rangeStart.y ? rangeStart.m : 1;
      const mEnd = yy === rangeEnd.y ? rangeEnd.m : 12;
      for (let mm = mStart; mm <= mEnd; mm++) {
        const dStart = yy === rangeStart.y && mm === rangeStart.m ? rangeStart.d : 1;
        const dEnd = yy === rangeEnd.y && mm === rangeEnd.m ? rangeEnd.d : new Date(yy, mm, 0).getDate();
        for (let dd = dStart; dd <= dEnd; dd++) {
          const day = swe.computeDay(yy, mm, dd, geo, null, tz);
          dayExtras(swe, day, geo);
          days.push(day);
          total++;
          if (total % 7 === 0) {
            self.postMessage({ type: "computeMarriageProgress", reqId, done: total, lastISO: day.iso });
          }
        }
      }
    }
    self.postMessage({ type: "computeMarriageResult", reqId, ok: true, days });
  } catch (err) {
    self.postMessage({ type: "computeMarriageResult", reqId, ok: false, error: String(err && err.stack || err) });
  }
};
