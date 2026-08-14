/* worker-client.mjs — browser-side client for marriage.worker.js (Vivaha scan).
   Self-contained per-page client (app.js keeps its own inline client for
   ephemeris.worker.js — index.html's path stays untouched). Offloads the heavy
   swisseph day-scan to a Web Worker so the UI thread never blocks; falls back
   to main-thread computeDay if workers are unavailable (e.g. file:// in some
   browsers) by returning null so the caller can use scanWeddingWindow instead.
   Usage:
     const days = await computeMarriageRangeViaWorker(rangeStart, rangeEnd, geo, tz, {
       onProgress: (done, total, lastISO) => { ... },
     });
     if (!days) // worker unavailable -> main-thread fallback
*/
let worker = null;
let workerReqId = 0;
const workerPending = new Map();

function ensureWorker() {
  if (worker || typeof Worker === "undefined") return worker;
  try { worker = new Worker("./marriage.worker.js", { type: "module" }); } catch (e) { worker = null; return null; }
  worker.onmessage = (e) => {
    const { type, reqId, ok, days, error, done, total, lastISO } = e.data;
    if (type === "computeMarriageProgress") {
      const p = workerPending.get(reqId);
      if (p && p.onProgress) p.onProgress(done, total, lastISO);
      return;
    }
    if (type !== "computeMarriageResult") return;
    const pending = workerPending.get(reqId);
    if (!pending) return;
    workerPending.delete(reqId);
    if (ok) pending.resolve(days);
    else pending.reject(new Error(error));
  };
  worker.onerror = (e) => {
    for (const [, p] of workerPending) p.reject(new Error(e.message));
    workerPending.clear();
    worker = null;
  };
  return worker;
}

/* Resolves to an array of computed day objects, or null when the worker is
   unavailable (caller should fall back to main-thread scanWeddingWindow). */
export function computeMarriageRangeViaWorker(rangeStart, rangeEnd, geo, tz = 5.5, opts = {}) {
  const w = ensureWorker();
  if (!w) return null;
  const reqId = ++workerReqId;
  return new Promise((resolve, reject) => {
    workerPending.set(reqId, { resolve, reject, onProgress: opts.onProgress });
    w.postMessage({ type: "computeMarriageRange", reqId, payload: { rangeStart, rangeEnd, geo, tz } });
  });
}
