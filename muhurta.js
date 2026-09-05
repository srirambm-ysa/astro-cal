/* muhurta.html — standalone Muhurta calculator (extracted from index's muhCard for faster dashboard).
   Shares LS keys (astro-cal-birth, astro-cal-theme, astro-cal-view) with index.
   Reuses Engine + taxonomy + scoring logic via muhurta-scoring.mjs. */
import { Engine, RASHI, NAKSHATRA, TARA_NAMES, TARA_NATURE } from "./engine.js";
import { loadTaxonomy } from "./taxonomy.js";
import { SELECTION_MODES, scoreMuhurta, rejectedReasons, REJ_LABEL, REJ_ORDER } from "./muhurta-scoring.mjs";
// ephemeris worker client (copied from app.js — offloads day scans, falls back to main thread)
let worker=null, workerReqId=0; const workerPending=new Map();
function ensureWorker(){ if(worker||typeof Worker==="undefined") return worker; try{ worker=new Worker("./ephemeris.worker.js",{type:"module"}); }catch(e){ worker=null; return null; } worker.onmessage=(e)=>{ const {type,reqId,ok,days,error}=e.data; if(type!=="computeRangeResult") return; const p=workerPending.get(reqId); if(!p) return; workerPending.delete(reqId); if(ok) p.resolve(new Map(days)); else p.reject(new Error(error)); }; worker.onerror=(e)=>{ for(const [,p] of workerPending) p.reject(new Error(e.message)); workerPending.clear(); worker=null; }; return worker; }
function computeRangeViaWorker(rangeStart, rangeEnd, geo, janmaNakshatra, tz){ const w=ensureWorker(); if(!w) return null; const reqId=++workerReqId; return new Promise((resolve,reject)=>{ workerPending.set(reqId,{resolve,reject}); w.postMessage({type:"computeRange",reqId,payload:{rangeStart,rangeEnd,geo,janmaNakshatra,tz}}); }); }

const $=(id)=>document.getElementById(id);
const LS={ birth:"astro-cal-birth", theme:"astro-cal-theme", view:"astro-cal-view" };
const TZ_IST=5.5;
const load=(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } };
const save=(k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };
const todayISO=()=>{ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const isoToYMD=(iso)=>{ const [y,m,d]=iso.split("-").map(Number); return {y,m,d}; };
const ymdToISO=(y,m,d)=>`${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
let birth=load(LS.birth,null);
const storedView=load(LS.view,{});
let view={ anchor: todayISO(), activity: storedView.activity||"ACT_REAL_GRIHA_PRAVESHA_NEW", mode: storedView.mode||"full", selected: storedView.selected||"" };
let TAX=null, swe=null, muhComputed=false;
let lastDetailByIso=new Map();
let lastAct=null;

// Quick Selector Presets (mirrors app.js)
const LS_PRESETS="astro-cal-presets";
const DEFAULT_PRESETS=[
  { label:"Griha Pravesha", domain:"DOM_REAL_ESTATE_CONSTRUCTION", sub:"SUB_OCCUPANCY_LEASING", task:"ACT_REAL_GRIHA_PRAVESHA_NEW" },
  { label:"Vehicle Purchase", domain:"DOM_TRAVEL_TOURISM", sub:"SUB_VEHICLE_OPERATIONS", task:"ACT_TRV_VEHICLE_PURCHASE" },
  { label:"Land Purchase", domain:"DOM_REAL_ESTATE_CONSTRUCTION", sub:"SUB_SITE_ACQUISITION", task:"ACT_REAL_LAND_PURCHASE" },
  { label:"New Venture", domain:"DOM_STARTUPS", sub:"SUB_ENTITY_FOUNDING", task:"ACT_STARTUP_INCORPORATION" },
  { label:"Pilgrimage", domain:"DOM_TRAVEL_TOURISM", sub:"SUB_PILGRIMAGE_LEISURE", task:"ACT_TRV_PILGRIMAGE_YATRA" },
];
function loadCustomPresets(){ try{ return JSON.parse(localStorage.getItem(LS_PRESETS))||[]; }catch{ return []; } }
function saveCustomPresets(a){ localStorage.setItem(LS_PRESETS, JSON.stringify(a)); }
function allPresets(){ return [...DEFAULT_PRESETS, ...loadCustomPresets()]; }
function renderPresetChips(){
  const wrap=$("presetChips"); if(!wrap) return;
  const md=$("muhDomain"), ms=$("muhSub"), mt=$("muhTask");
  if(!md||!ms||!mt) return;
  const curD=md.value, curS=ms.value, curT=mt.value;
  wrap.innerHTML="";
  allPresets().forEach((p,i)=>{
    const active=p.domain===curD && p.sub===curS && p.task===curT;
    const isCustom=i>=DEFAULT_PRESETS.length;
    const btn=document.createElement("button");
    btn.type="button"; btn.className="preset-chip"+(active?" active":"");
    btn.dataset.domain=p.domain; btn.dataset.sub=p.sub; btn.dataset.task=p.task;
    btn.appendChild(document.createTextNode(p.label));
    if(isCustom){
      const x=document.createElement("span"); x.className="pc-x"; x.textContent="×"; x.title="Remove";
      x.addEventListener("click",(e)=>{ e.stopPropagation(); const arr=loadCustomPresets(); arr.splice(i-DEFAULT_PRESETS.length,1); saveCustomPresets(arr); renderPresetChips(); });
      btn.appendChild(x);
    }
    btn.addEventListener("click",()=>{
      if(!TAX) return;
      const d=TAX.domains().find(x=>x.code===p.domain); if(!d) return;
      md.value=p.domain;
      const subs=TAX.subDomains(p.domain);
      ms.innerHTML='<option value="" disabled>Please select</option>';
      subs.forEach(s=> ms.insertAdjacentHTML("beforeend", `<option value="${s.code}">${s.name}</option>`));
      ms.value=p.sub;
      const tasks=TAX.activities(p.domain,p.sub);
      mt.innerHTML='<option value="" disabled>Please select</option>';
      tasks.forEach(a=> mt.insertAdjacentHTML("beforeend", `<option value="${a.activity_id}">${a.activity_name}</option>`));
      mt.value=p.task;
      view.activity=p.task; view.mode=$("muhMode")?.value||"full"; save(LS.view, view);
      renderPresetChips(); clearMuhurtaGlobal();
      const on=!!(md.value&&ms.value&&mt.value); const b=$("srcBtn"); if(b){ b.disabled=!on; }
    });
    wrap.appendChild(btn);
  });
}
function promptSavePreset(){
  const md=$("muhDomain"), ms=$("muhSub"), mt=$("muhTask");
  if(!md?.value||!ms?.value||!mt?.value){ alert("Select a domain, activity and sub-activity first."); return; }
  const label=prompt("Name for this preset (e.g. “My Housewarming”):");
  if(!label||!label.trim()) return;
  const arr=loadCustomPresets();
  arr.push({ label:label.trim(), domain:md.value, sub:ms.value, task:mt.value });
  saveCustomPresets(arr); renderPresetChips();
}

// theme
const ICON_MOON='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const ICON_SUN='<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
function setTheme(night){ document.body.classList.toggle("night",night); const ic=$("themeIcon"); if(ic) ic.innerHTML= night?ICON_SUN:ICON_MOON; const lb=$("themeLabel"); if(lb) lb.textContent= night?"Day mode":"Night mode"; localStorage.setItem(LS.theme, night?"night":"day"); }
setTheme(load(LS.theme,"day")==="night");
$("themeBtn")?.addEventListener("click", ()=> setTheme(!document.body.classList.contains("night")));

// persona
function renderPersona(){
  const t=$("personaText"); if(!t) return;
  const el=$("persona");
  if(birth){ el.title=`Janma ${NAKSHATRA[birth.nakshatra]} · ${RASHI[birth.rashi]} · ${birth.place} — click to edit`; el.setAttribute("aria-label", `Birth star ${NAKSHATRA[birth.nakshatra]} · ${RASHI[birth.rashi]} — click to edit`); t.textContent=`${NAKSHATRA[birth.nakshatra]} · ${RASHI[birth.rashi]}`; }
  else { el.title="Set birth star — click to edit"; el.setAttribute("aria-label","Set birth star — click to edit"); t.textContent="Set birth star"; }
}
renderPersona();
$("persona")?.addEventListener("click", ()=>{ const l=$("landing"); if(l){ l.hidden=false; l.scrollIntoView({behavior:"smooth"}); }});

// month nav
function monthTitle(y,m){ return new Date(y,m-1,1).toLocaleDateString("en-IN",{month:"long", year:"numeric", timeZone:"Asia/Kolkata"}); }
function renderMonthNav(){
  const {y,m}=isoToYMD(view.anchor);
  const t=monthTitle(y,m);
  const a=$("curMonth"); if(a) a.textContent=t;
}
renderMonthNav();
function clearMuhurtaGlobal(){
  muhComputed=false;
  const tb=$("muhurtas"); if(tb) tb.innerHTML="";
  const sm=$("muhSummary"); if(sm) sm.textContent="";
  const an=$("muhActName"); if(an) an.textContent="";
  const hint=$("muhHint"); if(hint){ hint.innerHTML='Select activity + mode, then press <strong>Compute Muhurta</strong>.'; hint.hidden=false; }
  const body=$("muhAccBody"); if(body) body.innerHTML="";
  const head=$("muhAccHead"); if(head) head.textContent="Muhurta details — click a Shubh day row";
  const acc=$("muhAcc"); if(acc) acc.open=false;
  lastDetailByIso=new Map(); lastAct=null;
}
window.clearMuhurta=clearMuhurtaGlobal;
$("navPrev")?.addEventListener("click", ()=>{ const d=new Date(view.anchor); d.setMonth(d.getMonth()-1); view.anchor=ymdToISO(d.getFullYear(), d.getMonth()+1, d.getDate()); save(LS.view,view); renderMonthNav(); clearMuhurtaGlobal(); });
$("navNext")?.addEventListener("click", ()=>{ const d=new Date(view.anchor); d.setMonth(d.getMonth()+1); view.anchor=ymdToISO(d.getFullYear(), d.getMonth()+1, d.getDate()); save(LS.view,view); renderMonthNav(); clearMuhurtaGlobal(); });

// birth form
async function initBirthForm(){
  const form=$("birthForm"); if(!form) return;
  if(!form.querySelector("#bNakshatra")){
    form.innerHTML=`
      <div class="field"><div class="k">Janma Nakshatra</div><select id="bNakshatra"></select></div>
      <div class="field"><div class="k">Janma Rashi</div><select id="bRashi"></select></div>
      <div class="field"><div class="k">Current place</div><input type="text" id="bPlace" value="${birth?.place||"Chennai"}"></div>
      <div class="field"><div class="k">Latitude</div><input type="number" id="bLat" step="0.0001" value="${birth?.lat||13.0827}"></div>
      <div class="field"><div class="k">Longitude</div><input type="number" id="bLon" step="0.0001" value="${birth?.lon||80.2707}"></div>
      <div class="field"><div class="k">Timezone</div><input type="number" id="bTz" step="0.5" value="${birth?.tz||5.5}"></div>
      <div class="field"><button class="btn" id="computeBtn" type="button">Save & Compute</button></div>
    `;
  }
  const nakSel=$("bNakshatra");
  const rashiSel=$("bRashi");
  if(nakSel && rashiSel){
    if(!nakSel.options.length){
      NAKSHATRA.forEach((name,n)=>{
        const o=document.createElement("option"); o.value=String(n); o.textContent=`${name} (${RASHI[Math.floor((n*4)/9)%12]})`; nakSel.appendChild(o);
      });
      RASHI.forEach((name,i)=> rashiSel.insertAdjacentHTML("beforeend", `<option value="${i}">${name}</option>`));
      nakSel.addEventListener("change", ()=>{ const n=Number(nakSel.value); rashiSel.value=String(Math.floor((n*4)/9)%12); });
    }
    if(birth){
      nakSel.value=String(birth.nakshatra);
      rashiSel.value=String(birth.rashi);
      const pl=$("bPlace"); if(pl) pl.value=birth.place||pl.value;
      const la=$("bLat"); if(la) la.value=birth.lat;
      const lo=$("bLon"); if(lo) lo.value=birth.lon;
      const tz=$("bTz"); if(tz) tz.value=birth.tz;
    } else {
      if(!nakSel.value) nakSel.value="0";
      if(!rashiSel.value) rashiSel.value="0";
    }
  }
  $("computeBtn")?.addEventListener("click", ()=>{
    const nak=Number($("bNakshatra").value), ras=Number($("bRashi").value);
    const place=$("bPlace").value.trim()||"Chennai", lat=parseFloat($("bLat").value), lon=parseFloat($("bLon").value), tz=parseFloat($("bTz").value);
    if(isNaN(nak)||isNaN(ras)||isNaN(lat)||isNaN(lon)||isNaN(tz)){ alert("Pick nakshatra and valid coordinates"); return; }
    birth={nakshatra:nak, rashi:ras, place, lat,lon,tz}; save(LS.birth,birth); renderPersona(); const land=$("landing"); if(land) land.hidden=true; clearMuhurtaGlobal();
  });
}
await initBirthForm();
if(!birth){ const land=$("landing"); if(land) land.hidden=false; }

// helpers for detail accordion (ported from app.js)
function chapterDisplay(ch, fallback=null){
  const map={ ch1:"Chapter 1 (Subhashubha Prakarana)", ch2:"Chapter 2 (Nakshatra Prakarana)", ch4:"Chapter 4 (Gochara Prakarana)", ch6:"Chapter 6 (Griha Prakarana)", ch8:"Chapter 8 (Yatra Prakarana)", ch10:"Chapter 10 (Rajyabhisheka Prakarana)", ch11:"Chapter 11 (Rina / Vyapara Prakarana)", ch13:"Chapter 13 (Misra / Chikitsha Prakarana)", ch_samskara:"Samskara Prakarana", panchanga:"Panchanga tables" };
  return map[ch]||fallback||ch;
}
function provItemHTML(ref, sanskrit, english, logic, label){
  return `<div class="prov-item"><div class="prov-ref">${ref}</div>${label?`<div class="prov-label">${label}</div>`:""}${sanskrit?`<div class="prov-sans" lang="sa">${sanskrit.split("\n").join("<br>")}</div>`:""}${english?`<div class="prov-en">${english}</div>`:""}${logic?`<div class="prov-logic">${logic}</div>`:""}</div>`;
}
function classicalBlock(v, act){
  const cls=act.classical||null;
  const verses=v.provenance||[];
  const basisLabel=cls?{classical:"direct classical rule", functional_group:"functional-group classification (Ch. 2)", formula:"panchanga formula"}[cls.basis]||cls.basis:null;
  const FIRED_CAPTION="Classical Foundation — <em>Muhurta Chintamani</em>"+(cls?` (${cls.chapter})`:"");
  if(verses.length){
    const items=verses.map((p)=> provItemHTML(`${p.chapter} · ${p.verse_number}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic)).join("");
    return `<div class="classical-foundation"><details><summary>${FIRED_CAPTION}</summary><div class="cf-body"><div class="cf-basis">Governing basis: ${basisLabel||"muhurta rules"} · Source: ${cls?cls.source:"Muhurta Chintamani"} · ${cls?cls.author:"Acharya Rama Daivagya"}</div>${items}</div></details></div>`;
  }
  const governing=(cls?cls.verses:[]).filter((p)=> p.sanskrit_sloka);
  if(governing.length){
    const items=governing.map((p)=> provItemHTML(`${chapterDisplay(p.chapter, cls.chapter)} · ${p.verse}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic, p.label)).join("");
    return `<div class="classical-foundation"><details open><summary>${FIRED_CAPTION}</summary><div class="cf-body"><div class="cf-basis">Governing basis: ${basisLabel} · Source: ${cls.source} · ${cls.author}</div>${items}${cls.rationale?`<div class="cf-logic">${cls.rationale}</div>`:""}<div class="cf-note">No verse-affirmed rule fired today (no hard blocker or categorical overlay applied). The verses above govern this activity's classification; all temporal terms verified against Muhurta Chintamani (Rama Daivagya).</div></div></details></div>`;
  }
  return `<div class="classical-foundation"><div class="cf-head">Classical Foundation</div><div class="cf-note">${cls?`This activity is classified via ${basisLabel} (panchanga formula); no direct sloka applies. All temporal terms verified against Muhurta Chintamani (Rama Daivagya).`:"Provenance registry not loaded."}</div></div>`;
}
function muhurtaDetailHTML(v, day, act){
  const tierLines=[];
  if(v.tierHits.t1.length) tierLines.push(`<div class="muh-line t1"><span class="k">T1 blockers</span><span class="v">${v.tierHits.t1.join(", ")}</span></div>`);
  const t2bad=v.tierHits.t2.filter(h=> !h.includes("✓"));
  const t3bad=v.tierHits.t3.filter(h=> !h.includes("✓"));
  if(t2bad.length) tierLines.push(`<div class="muh-line t2"><span class="k">T2 primary</span><span class="v">${t2bad.join(", ")}</span></div>`);
  if(t3bad.length) tierLines.push(`<div class="muh-line t3"><span class="k">T3 secondary</span><span class="v">${t3bad.join(", ")}</span></div>`);
  const t2good=v.tierHits.t2.filter(h=> h.includes("✓"));
  const t3good=v.tierHits.t3.filter(h=> h.includes("✓"));
  if(t2good.length||t3good.length) tierLines.push(`<div class="muh-line good"><span class="k">Passing</span><span class="v">${[...t2good,...t3good].join(", ")}</span></div>`);
  return `<div class="muh-line"><span class="k">Score</span><span class="v"><strong>${v.score}/100</strong> · ${v.verdict}</span></div><div class="muh-line"><span class="k">Tara</span><span class="v">${TARA_NAMES[day.tara.number-1]} (${day.tara.number}) — ${TARA_NATURE[day.tara.number-1]==="good"?"favourable":TARA_NATURE[day.tara.number-1]==="bad"?"unfavourable":"neutral"}</span></div>${v.personalMetrics?`<div class="muh-line"><span class="k">Chandra</span><span class="v">Moon transit ${v.personalMetrics.chandraHouse}th house from birth rashi — ${v.personalMetrics.isAshtamaChandra?"Ashtama Chandra (blocked)":v.personalMetrics.chandraScoreBonus>0?`favourable (+${v.personalMetrics.chandraScoreBonus})`:v.personalMetrics.chandraScoreBonus<0?`unfavourable (${v.personalMetrics.chandraScoreBonus})`:"neutral"}</span></div>`:""}<div class="muh-line"><span class="k">${act.name}</span><span class="chip ${v.chip}">${v.chip}</span></div>${tierLines.join("")}${v.overrides.length?`<div class="muh-line ovr"><span class="k">Override</span><span class="v">${v.overrides.join(", ")}</span></div>`:""}${v.krishnaAllowed?`<div class="muh-line note"><span class="k">Fallback</span><span class="v">No Shukla day qualified this month · Krishna paksha shown</span></div>`:""}${v.timeBounded?`<div class="muh-line"><span class="k">Window</span><span class="v">${v.timeBounded.validTill} → ${v.timeBounded.nextStar}</span></div>`:""}${classicalBlock(v, act)}`;
}
function provenanceBodyHTML(act){
  const cls=act.classical||null;
  if(!cls) return `<div class="cf-note">Provenance registry not loaded for this activity.</div>`;
  const items=(cls.verses||[]).filter((p)=> p.sanskrit_sloka).map((p)=> provItemHTML(`${chapterDisplay(p.chapter, cls.chapter)} · ${p.verse}`, p.sanskrit_sloka, p.english_translation, p.applied_rule_logic, p.label)).join("");
  const tier={classical:"Direct classical rule", functional_group:"Functional-group (Ch. 2)", formula:"Panchanga formula"}[cls.basis]||cls.basis;
  return `<div class="pf-label">${act.activity_name}</div><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0"><span class="badge ${cls.basis}">${tier}</span><span class="prov-ref" style="text-transform:none;letter-spacing:.02em">${cls.source} — ${cls.author}</span></div><div class="cf-basis">Governing chapter: ${cls.chapter}${cls.rationale?` · ${cls.rationale}`:""}</div>${items}<div class="cf-note">All verses cited carry proof==="confirmed" — verified against the Muhurta Chintamani text. No fabricated citations.</div>`;
}
function citationText(cls){
  const refs=(cls.verses||[]).filter((v)=> v.sanskrit_sloka).map((v)=> `${v.verse} (${chapterDisplay(v.chapter, cls.chapter)})`);
  return `${cls.source} — ${cls.author}${cls.chapter?", "+cls.chapter:""}${refs.length?": "+refs.join("; "):""}`;
}
function renderMuhurtaDetail(){
  const acc=$("muhAcc"), head=$("muhAccHead"), body=$("muhAccBody");
  if(!acc||!head||!body) return;
  const sel=lastDetailByIso.get(view.selected);
  if(sel){
    const {v, day}=sel;
    body.innerHTML=muhurtaDetailHTML(v, day, lastAct);
    const dt=new Date(day.y, day.m-1, day.d);
    const dayName=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
    const dateStr=`${dayName} ${day.iso}`;
    head.innerHTML=`Muhurta details — <span class="star-label">${dateStr} · ${lastAct.name} · ${v.chip} ${v.score}</span>`;
    acc.open=true;
  } else {
    body.innerHTML="";
    head.textContent="Muhurta details — click a Shubh day row";
    acc.open=false;
  }
}

// taxonomy + muhurta selects
async function initTaxonomy(){
  try{
    const t=await loadTaxonomy();
    TAX=t;
    const md=$("muhDomain"), ms=$("muhSub"), mt=$("muhTask"), mm=$("muhMode");
    if(!md || !ms || !mt){ console.warn("muhurta selects missing"); return; }
    const PH='<option value="" disabled selected>Please select</option>';
    const fillSubs=()=>{
      const subs=TAX.subDomains(md.value); ms.innerHTML=""; ms.insertAdjacentHTML("beforeend", PH);
      subs.forEach(s=> ms.insertAdjacentHTML("beforeend", `<option value="${s.code}">${s.name}</option>`));
    };
    const fillTasks=()=>{
      const tasks= ms.value ? TAX.activities(md.value, ms.value) : []; mt.innerHTML=""; mt.insertAdjacentHTML("beforeend", PH);
      tasks.forEach(a=> mt.insertAdjacentHTML("beforeend", `<option value="${a.activity_id}">${a.activity_name}</option>`));
    };
    md.innerHTML=""; md.insertAdjacentHTML("beforeend", PH);
    TAX.domains().forEach(d=> md.insertAdjacentHTML("beforeend", `<option value="${d.code}">${d.name}</option>`));
    const sync=()=>{ view.activity=mt.value; view.mode=mm.value; save(LS.view,view); };
    const clearLocal=()=> clearMuhurtaGlobal();
    md.addEventListener("change", ()=>{ fillSubs(); fillTasks(); sync(); clearLocal(); });
    ms.addEventListener("change", ()=>{ fillTasks(); sync(); clearLocal(); });
    mt.addEventListener("change", ()=>{ sync(); clearLocal(); });
    if(mm){
      mm.innerHTML="";
      Object.entries(SELECTION_MODES).forEach(([k,m])=>{ const o=document.createElement("option"); o.value=k; o.textContent=m.label; if(k===view.mode) o.selected=true; mm.appendChild(o); });
      mm.addEventListener("change", ()=>{ view.mode=mm.value; save(LS.view,view); clearLocal(); });
    }
    const savedAct=view.activity; const saved=savedAct && TAX.getActivity(savedAct);
    if(saved){ md.value=saved.domain; fillSubs(); ms.value=saved.sub_domain; fillTasks(); mt.value=saved.activity_id; view.activity=saved.activity_id; }
    else { fillSubs(); fillTasks(); }
    // refresh source button
    const refreshSourceBtn=()=>{
      const on=!!(md.value&&ms.value&&mt.value);
      const btn=$("srcBtn"); if(btn){ btn.disabled=!on; btn.title= on?"Show classical source for this activity":"Select a domain, activity and sub-activity first"; }
    };
    refreshSourceBtn();
    md.addEventListener("change", refreshSourceBtn);
    ms.addEventListener("change", refreshSourceBtn);
    mt.addEventListener("change", refreshSourceBtn);
    // preset chips (mirrors index preset chips)
    renderPresetChips();
    md.addEventListener("change", renderPresetChips);
    ms.addEventListener("change", renderPresetChips);
    mt.addEventListener("change", renderPresetChips);
    $("presetAdd")?.addEventListener("click", promptSavePreset);

    // source modal
    const closeSrcModal=()=>{ const m=$("srcModal"); if(m){ m.hidden=true; document.body.style.overflow=""; } };
    $("srcBtn")?.addEventListener("click", ()=>{
      const act=TAX.getActivity(mt.value);
      if(!act) return;
      $("srcTitle").textContent="Classical source — "+act.activity_name;
      $("srcBody").innerHTML=provenanceBodyHTML(act);
      $("srcModal").hidden=false;
      document.body.style.overflow="hidden";
    });
    $("srcClose")?.addEventListener("click", closeSrcModal);
    $("srcModal")?.addEventListener("click", (e)=>{ if(e.target===$("srcModal")) closeSrcModal(); });
    document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeSrcModal(); });
    $("srcCopy")?.addEventListener("click", ()=>{
      const act=TAX.getActivity(mt.value);
      const cls=act?TAX.toMuhurta(act).classical:null;
      if(!cls) return;
      const txt=citationText(cls);
      const done=()=>{ const b=$("srcCopy"); b.textContent="Copied!"; setTimeout(()=> b.textContent="Copy citation", 1600); };
      if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done,done);
      else { const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); try{ document.execCommand("copy"); }catch(e){} ta.remove(); done(); }
    });

    $("muhCompute")?.addEventListener("click", async ()=>{
      sync(); refreshSourceBtn(); if(!md.value||!ms.value||!mt.value){ clearLocal(); const h=$("muhHint"); if(h) h.textContent="Please select a domain, activity and sub-activity, then press Compute Muhurta."; return; }
      if(!birth){ const land=$("landing"); if(land){ land.hidden=false; land.scrollIntoView({behavior:"smooth"}); } return; }
      muhComputed=true; const h=$("muhHint"); if(h) h.hidden=true;
      await runMuhurta();
    });
    $("muhClear")?.addEventListener("click", ()=>{ md.value=""; ms.value=""; mt.value=""; view.activity=""; save(LS.view,view); clearLocal(); refreshSourceBtn(); });
  }catch(e){ console.warn("taxonomy load",e); const tb=$("muhurtas"); if(tb) tb.innerHTML=`<tr><td colspan="4" class="note" style="color:#9A2B2B">Failed to load activities: ${e.message}</td></tr>`; }
}
await initTaxonomy();

async function runMuhurta(){
  if(!swe){ try{ swe=await new Engine().init(); }catch(e){ alert("Ephemeris failed to load: "+e.message); return; } }
  const {y,m}=isoToYMD(view.anchor);
  const rangeStart={y,m,d:1}, rangeEnd={y,m,d:new Date(y,m,0).getDate()};
  const geo=[birth.lon, birth.lat, 0];
  let dayMap=null;
  try{ dayMap=await computeRangeViaWorker(rangeStart, rangeEnd, geo, birth.nakshatra, birth.tz||TZ_IST); }catch(e){ dayMap=null; }
  if(!dayMap){
    const { Engine: E }=await import("./engine.js");
    const eng=await new E().init();
    const map=new Map();
    for(let d=1; d<=rangeEnd.d; d++){ const day=await eng.computeDay(y,m,d,geo, birth.nakshatra, birth.tz||TZ_IST); map.set(ymdToISO(y,m,d), day); }
    dayMap=map;
  }
  const tbody=$("muhurtas"); if(!tbody) return;
  const act=TAX ? TAX.getActivity(view.activity) : null;
  if(!act){ tbody.innerHTML=`<tr><td colspan="4" class="note">Select activity first</td></tr>`; return; }
  const muAct=TAX.toMuhurta(act);
  lastAct=muAct;
  const mEl=$("muhActName"); if(mEl) mEl.textContent=`${muAct.name} · ${SELECTION_MODES[view.mode].label}`;
  const days=[...dayMap.values()].sort((a,b)=> a.iso<b.iso?-1:1);
  const mode=view.mode||"full";
  // shukla fallback (from app.js renderMuhurta)
  const shuklaFallback=muAct.paksha==="shukla" && !days.some((d)=> scoreMuhurta(d, birth.nakshatra, muAct, {mode, calendarField:{ adhikMaas:d.adhikMaas, kharmas:d.kharmas, pitruPaksha:d.pitruPaksha }, birthRashi:birth.rashi}).impersonalPass && d.tithi.paksha==="Shukla");
  let shubhTotal=0;
  const rejCounts=new Map();
  const detailByIso=new Map();
  const rowHtmls=[];
  for(const day of days){
    if(!day.tara) continue;
    const cf={ adhikMaas:day.adhikMaas, kharmas:day.kharmas, pitruPaksha:day.pitruPaksha };
    const opts={ mode, calendarField:cf, birthRashi:birth.rashi };
    if(shuklaFallback && day.tithi.paksha==="Krishna") opts.allowKrishnaFallback=true;
    const v=scoreMuhurta(day, birth.nakshatra, muAct, opts);
    if(v.chip!=="Shubh"){
      for(const k of rejectedReasons(v, day, muAct, mode)) rejCounts.set(k,(rejCounts.get(k)||0)+1);
      continue;
    }
    shubhTotal++;
    detailByIso.set(day.iso, {v, day});
    const dt=new Date(day.y, day.m-1, day.d);
    const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][dt.getDay()];
    const mn=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][day.m-1];
    const dateStr=`${dn} ${mn} ${String(day.d).padStart(2,"0")}`;
    const sel= day.iso===view.selected ? " selected" : "";
    const taraTxt=`${TARA_NAMES[day.tara.number-1]} (${day.tara.number})`;
    const nak=NAKSHATRA[day.moonNakshatra]||"—";
    const title=v.reasons.join(" · ");
    const tb=v.timeBounded ? ` <span class="tbwnd">(${v.timeBounded.validTill}→${v.timeBounded.nextStar})</span>` : "";
    rowHtmls.push(`<tr class="muhrow${sel}" data-iso="${day.iso}" title="${title}"><td class="dt">${dateStr}${tb}</td><td class="tara">${taraTxt}</td><td class="nak">${nak}</td><td class="acts"><span class="chip verdict ${v.chip}">${v.chip} ${v.score}</span></td></tr>`);
  }
  lastDetailByIso=detailByIso;
  // why line lay language
  let whyLine="";
  if(rejCounts.size){
    const parts=[];
    for(const k of REJ_ORDER){
      const n=rejCounts.get(k);
      if(!n) continue;
      parts.push(`${REJ_LABEL[k]} — ${n} ${n===1?"day":"days"}`);
    }
    const rejectedCount=days.length - shubhTotal;
    if(parts.length) whyLine=`Why the other ${rejectedCount} ${rejectedCount===1?"day was":"days were"} set aside: ${parts.join(" · ")}. A day can be set aside for more than one reason.`;
  }
  const rows=rowHtmls.length ? [...rowHtmls] : [];
  if(rows.length && whyLine) rows.push(`<tr class="muhwhy"><td colspan="4">${whyLine}</td></tr>`);
  if(rows.length){
    tbody.innerHTML=rows.join("");
    tbody.querySelectorAll(".muhrow").forEach((tr)=> tr.addEventListener("click", ()=>{
      // toggle selection
      const iso=tr.dataset.iso;
      if(view.selected===iso){
        view.selected="";
      } else {
        view.selected=iso;
      }
      save(LS.view, view);
      // update selected class
      tbody.querySelectorAll(".muhrow").forEach(r=> r.classList.toggle("selected", r.dataset.iso===view.selected));
      renderMuhurtaDetail();
    }));
  } else {
    const whyBlock=whyLine?`<tr class="muhwhy"><td colspan="4">${whyLine}</td></tr>`:"";
    tbody.innerHTML=`<tr><td colspan="4" class="note">No Shubh days this month for ${muAct.name}. Try another activity or a softer mode.</td></tr>${whyBlock}`;
  }
  const sm=$("muhSummary"); if(sm){
    const fbNote= shuklaFallback ? " (Krishna-paksha days also shown — no Shukla days qualified this month)" : "";
    sm.textContent=`${shubhTotal} Shubh days this month for ${muAct.name}${fbNote}. ${muAct.note||""}`;
  }
  // render accordion for current selection
  renderMuhurtaDetail();
}
// initial placeholder
if($("muhurtas") && !$("muhurtas").innerHTML) $("muhurtas").innerHTML=`<tr><td colspan="4" class="note">Select activity + mode, then press Compute Muhurta. Birth star from calendar is shared.</td></tr>`;
