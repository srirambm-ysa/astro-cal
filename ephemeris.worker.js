/* ephemeris.worker.js — Web Worker running swisseph loops + coarse-to-fine
   evaluation off the UI thread (PRD §2.5 v1.0). Receives a compute request,
   runs Engine.computeDay for each day in range, posts back the day map.
   Coarse-to-fine: Pass 1 = calendar-field + sunrise panchang across the whole
   range; Pass 2 = intra-day transitions (Bhadra, yogaBan, Abhijit) only on
   candidate days — but since computeDay already bundles both, the worker simply
   computes all days and the main thread filters. */
import { Engine } from "./engine.js";

let engine = null;

async function getEngine() {
  if (!engine) engine = await new Engine().init();
  return engine;
}

self.onmessage = async (e) => {
  const { type, reqId, payload } = e.data;
  if (type !== "computeRange") return;
  try {
    const swe = await getEngine();
    const { rangeStart, rangeEnd, geo, janmaNakshatra, tz } = payload;
    const dayMap = new Map();
    for (let yy = rangeStart.y; yy <= rangeEnd.y; yy++) {
      const mStart = yy === rangeStart.y ? rangeStart.m : 1;
      const mEnd = yy === rangeEnd.y ? rangeEnd.m : 12;
      for (let mm = mStart; mm <= mEnd; mm++) {
        const dStart = yy === rangeStart.y && mm === rangeStart.m ? rangeStart.d : 1;
        const dEnd = yy === rangeEnd.y && mm === rangeEnd.m ? rangeEnd.d : new Date(yy, mm, 0).getDate();
        for (let dd = dStart; dd <= dEnd; dd++) {
          const day = swe.computeDay(yy, mm, dd, geo, janmaNakshatra, tz);
          dayMap.set(day.iso, day);
        }
      }
    }
    // convert Map → plain array for postMessage (structured-clone friendly)
    self.postMessage({ type: "computeRangeResult", reqId, ok: true, days: [...dayMap.entries()] });
  } catch (err) {
    self.postMessage({ type: "computeRangeResult", reqId, ok: false, error: String(err && err.stack || err) });
  }
};
