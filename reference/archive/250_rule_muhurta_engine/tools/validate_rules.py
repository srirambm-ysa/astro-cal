"""validate_rules.py — validate extracted Muhurta rules against canonical vocab
and the reference tables transcribed in classical_rule_architecture_mc.md.

Checks per extracted rule:
  1. name canonicalization (every nakshatra/weekday/tithi_group is known)
  2. reference cross-check: for rules that match a known reference (Dhruva,
     Kshipra, Mridu, Tikshna, Ugra, Chara, Mishra groups; Amrita/Dagdha
     yoga; tithi groups), diff the extracted list vs the reference list
  3. completeness of group expansion (e.g. 'Dhruwa' should not appear
     unexpanded in nakshatras or headings)

Usage:
    python tools/validate_rules.py rules/pilot/raw/*.json
    python tools/validate_rules.py --dir rules/pilot/raw
"""
import sys
import glob
import json
import argparse
import re
from difflib import SequenceMatcher

# ---- Canonical names (28 incl. Abhijit as the book lists it) ----
NAKSHATRAS_27 = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Poorva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Moola", "Poorvashadha", "Uttarashadha", "Shravana",
    "Dhanishtha", "Shatabhisha", "Poorva Bhadrapada", "Uttara Bhadrapada",
    "Revati",
]
NAKSHATRAS_28 = NAKSHATRAS_27 + ["Abhijit"]

WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
TITHI_GROUPS = {
    "Nanda": [1, 6, 11],
    "Bhadra": [2, 7, 12],
    "Jaya": [3, 8, 13],
    "Rikta": [4, 9, 14],
    "Poorna": [5, 10, 15],
}

# ---- Reference tables from classical_rule_architecture_mc.md ----
REFERENCES = [
    # §3 sevenfold classification (name -> nakshatras)
    {"key": "dhruva",   "names": ["Dhruva", "Sthir", "Dhruwa", "Fixed"],
     "nakshatras": ["Rohini", "Uttara Phalguni", "Uttarashadha", "Uttara Bhadrapada"], "weekday": "Sunday"},
    {"key": "chara",    "names": ["Chara", "Movable"],
     "nakshatras": ["Punarvasu", "Swati", "Shravana", "Dhanishtha", "Shatabhisha"], "weekday": "Monday"},
    {"key": "ugra",     "names": ["Ugra", "Krura", "Cruel"],
     "nakshatras": ["Bharani", "Magha", "Poorva Phalguni", "Poorvashadha", "Poorva Bhadrapada"], "weekday": "Tuesday"},
    {"key": "mishra",   "names": ["Mishra", "Mixed", "Sadharana"],
     "nakshatras": ["Krittika", "Vishakha"], "weekday": "Wednesday"},
    {"key": "kshipra",  "names": ["Kshipra", "Laghu", "Swift"],
     "nakshatras": ["Ashwini", "Pushya", "Hasta", "Abhijit"], "weekday": "Thursday"},
    {"key": "mridu",    "names": ["Mridu", "Maitra", "Delicate", "Tender", "Friendly"],
     "nakshatras": ["Mrigashira", "Chitra", "Revati", "Anuradha"], "weekday": "Friday"},
    {"key": "tikshna",  "names": ["Tikshna", "Teekshna", "Daruna", "Sharp", "Horrible"],
     "nakshatras": ["Ardra", "Ashlesha", "Moola", "Jyeshtha"], "weekday": "Saturday"},
    # §1 Amrita yoga weekday -> tithi group
    {"key": "amrita", "names": ["Amrita"],
     "weekday_groups": {"Sunday": "Nanda", "Monday": "Bhadra", "Tuesday": "Nanda",
                        "Wednesday": "Jaya", "Thursday": "Rikta", "Friday": "Bhadra",
                        "Saturday": "Poorna"}},
    # §2 Dagdha yoga weekday -> nakshatra
    {"key": "dagdha", "names": ["Dagdha", "Daghda"],
     "weekday_nakshatras": {"Sunday": "Bharani", "Monday": "Chitra", "Tuesday": "Uttarashadha",
                            "Wednesday": "Dhanishtha", "Thursday": "Uttara Phalguni",
                            "Friday": "Jyeshtha", "Saturday": "Revati"}},
]

# linguistic merges for canonicalization (OCR variants)
MERGE = {
    "Mrigshira": "Mrigashira", "Mrigasira": "Mrigashira", "Mragashira": "Mrigashira",
    "Mnphiia": "Mrigashira", "Mngashira": "Mrigashira", "Mrigsira": "Mrigashira",
    "ReWati": "Revati", "Rewati": "Revati", "Rcwali": "Revati", "Retfati": "Revati",
    "Pusbya": "Pushya", "Fusfepi": "Pushya", "Pusbyi": "Pushya", "Pushy": "Pushya",
    "Hxsta": "Hasta",
    "Anmadha": "Anuradha", "Amiiadha": "Anuradha", "Anurada": "Anuradha",
    "Dhanistha": "Dhanishtha", "Dhanishta": "Dhanishtha",
    "Shatbhisha": "Shatabhisha", "Shafbhisha": "Shatabhisha", "Shatbisha": "Shatabhisha",
    "Dlianishtha": "Dhanishtha", "Shzavana": "Shravana", "Shravan": "Shravana",
    "Jyeriaha": "Jyeshtha", "Jyesfatha": "Jyeshtha", "Jyesbtha": "Jyeshtha",
    "Poorvashadha": "Poorvashadha", "Poorshqrho": "Poorvashadha",
    "Uttamhadha": "Uttarashadha", "Uttara shadha": "Uttarashadha", "Utlara": "Uttara",
    "Rdiini": "Rohini", "Rohin": "Rohini",
    "Kritika": "Krittika",
    "Aswini": "Ashwini", "Ashwim": "Ashwini", "Ashw ini": "Ashwini",
    "Punarvasva": "Punarvasu", "Pttnarvasu": "Punarvasu",
    "Moola": "Moola",
    "Ashksha": "Ashlesha",
    "Banani": "Bharani",
    "Vishakha": "Vishakha",
}


def canon_nakshatra(name: str) -> str | None:
    n = name.strip()
    if n in NAKSHATRAS_28:
        return n
    if n in MERGE:
        return MERGE[n]
    # fuzzy match
    for cand in NAKSHATRAS_28:
        if SequenceMatcher(None, n.lower(), cand.lower()).ratio() >= 0.72:
            return cand
    return None


def canon_weekday(w: str) -> str | None:
    w = w.strip().title()
    if w in WEEKDAYS:
        return w
    for cand in WEEKDAYS:
        if SequenceMatcher(None, w.lower(), cand.lower()).ratio() >= 0.7:
            return cand
    return None


def canon_group(g: str) -> str | None:
    g = g.strip()
    for k in TITHI_GROUPS:
        if k.lower() in g.lower():
            return k
    if "Nand" in g:
        return "Nanda"
    if "Poorn" in g or "Pooma" in g:
        return "Poorna"
    return None


def is_heading(line: str) -> bool:
    s = line.strip()
    if not s or len(s) < 14:
        return False
    caps = sum(1 for c in s if c.isalpha() and c.isupper())
    lower = sum(1 for c in s if c.isalpha() and c.islower())
    return caps > 0 and (lower == 0 or lower < caps * 0.25)


def match_reference(heading: str, conditions: dict) -> dict | None:
    h = heading.lower()
    # Group references only fire when the rule already carries nakshatras AND
    # the heading names the group with a nakshatra-specific token (NOT generic
    # 'Fixed'/'Movable'/'Sharp' which also describe Karana-yoga terminology).
    has_naks = bool(conditions.get("nakshatras"))
    for ref in REFERENCES:
        names = ref["names"]
        if ref.get("nakshatras") and has_naks:
            for n in names:
                nl = n.lower()
                if len(nl) >= 4 and nl in h:
                    # only nakshatra-group tokens, not generic adjectives
                    if nl in ("dhruva", "dhruwa", "sthir", "chara", "ugra",
                              "krura", "mishra", "kshipra", "laghu", "mridu",
                              "maitra", "tikshna", "teekshna", "daruna",
                              "sadharana", "swift", "movable", "fixed"):
                        return ref
        if ref.get("weekday_groups"):
            yogas = [y.lower() for y in conditions.get("yogas", [])]
            if any(n.lower() in yogas for n in names[:2]):
                return ref
        if ref.get("weekday_nakshatras"):
            yogas = [y.lower() for y in conditions.get("yogas", [])]
            if any(n.lower() in yogas for n in names[:2]):
                return ref
    return None


def check_rule(page, rule, issues):
    c = rule.get("conditions", {})
    heading = rule.get("heading", "")
    # 1. nakshatras canonical
    for n in c.get("nakshatras", []):
        canon = canon_nakshatra(n)
        if canon is None:
            issues.append(f"p{page} '{heading[:38]}': UNKNOWN nakshatra '{n}'")
        elif canon != n:
            issues.append(f"p{page} '{heading[:38]}': non-canonical nakshatra '{n}' -> '{canon}'")
    for w in c.get("weekdays", []):
        if canon_weekday(w) is None:
            issues.append(f"p{page} '{heading[:38]}': UNKNOWN weekday '{w}'")
    for g in c.get("tithi_groups", []):
        if canon_group(g) is None:
            issues.append(f"p{page} '{heading[:38]}': UNKNOWN tithi group '{g}'")

    # 2. reference diff
    ref = match_reference(heading, c)
    if not ref:
        return
    keys = ref.get("nakshatras")
    if keys:
        got = {canon_nakshatra(n) for n in c.get("nakshatras", []) if canon_nakshatra(n)}
        want = set(ref["nakshatras"])
        missing = want - got
        extra = got - want
        if missing:
            issues.append(f"p{page} REF[{ref['key']}] '{heading[:38]}': MISSING {sorted(missing)}")
        if extra:
            issues.append(f"p{page} REF[{ref['key']}] '{heading[:38]}': EXTRA {sorted(extra)}")
    wg = ref.get("weekday_groups")
    if wg:
        got_w = c.get("weekdays", [])
        got_g = [canon_group(x) for x in c.get("tithi_groups", [])]
        if len(got_w) == len(got_g) and got_w:
            for w, g in zip(got_w, got_g):
                wc = canon_weekday(w)
                want_g = wg.get(wc)
                if want_g and g != want_g:
                    issues.append(f"p{page} REF[amrita] {wc}: got {g}, want {want_g}")
    wn = ref.get("weekday_nakshatras")
    if wn:
        got_w = [canon_weekday(w) for w in c.get("weekdays", [])]
        got_n = [canon_nakshatra(n) for n in c.get("nakshatras", [])]
        if got_w and len(got_w) == len(wn):
            for w, n in zip(got_w, got_n):
                want_n = wn.get(w)
                if want_n and n != want_n:
                    issues.append(f"p{page} REF[dagdha] {w}: got {n}, want {want_n}")

    # 3. group left unexpanded
    for key, grp_names in [("nakshatras", ["Dhruwa", "Kshipra", "Mridu", "Chara", "Tikshna", "Ugra", "Mishra"])]:
        for n in c.get(key, []):
            if n in grp_names:
                issues.append(f"p{page} '{heading[:38]}': UNexpanded group '{n}' in {key}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("files", nargs="*")
    ap.add_argument("--dir", default=None)
    ap.add_argument("--text", default=None, help="extract_pages.py output; if given, runs a page-level recall check (every nakshatra/weekday/tithi-group named in the source text must appear in some extracted rule on that page)")
    args = ap.parse_args()

    files = list(args.files)
    if args.dir:
        files += sorted(glob.glob(args.dir.rstrip("\\/") + "/*.json"))
    files = sorted(set(files))

    all_issues = []
    n_rules = 0
    page_data = {}  # page -> {nakshatras:{n:True}, weekdays:{w:True}, tithi_groups:{g:True}}
    for fp in files:
        try:
            data = json.load(open(fp, encoding="utf-8"))
        except Exception as e:
            print(f"{fp}: ERROR {e}")
            continue
        page = data.get("meta", {}).get("pdf_page", "?")
        for rule in data.get("rules", []):
            n_rules += 1
            check_rule(page, rule, all_issues)
            c = rule.get("conditions", {})
            slot = page_data.setdefault(page, {"nakshatras": {}, "weekdays": {}, "tithi_groups": {}})
            for n in c.get("nakshatras", []):
                cy = canon_nakshatra(n)
                if cy:
                    slot["nakshatras"][cy] = True
            for w in c.get("weekdays", []):
                cw = canon_weekday(w)
                if cw:
                    slot["weekdays"][cw] = True
            for g in c.get("tithi_groups", []):
                cg = canon_group(g)
                if cg:
                    slot["tithi_groups"][cg] = True
            # an exclusion ("except Rikta tithis", "excluding Poorvashadha and Magha")
            # still counts as the item being captured, not a recall miss
            for ex in rule.get("exclusions", []):
                e = canon_nakshatra(ex)
                if e:
                    slot["nakshatras"][e] = True
                g = canon_group(ex)
                if g:
                    slot["tithi_groups"][g] = True
                w = canon_weekday(ex)
                if w:
                    slot["weekdays"][w] = True

    # Page-level recall check against raw source text
    if args.text:
        recall_issues, n_pages = recall_check(args.text, page_data)
        print(f"recall check on {n_pages} source pages: {len(recall_issues)} issue(s)")
        for i in recall_issues:
            print("  -", i)
        all_issues += recall_issues

    print(f"checked {n_rules} rules across {len(files)} files")
    if not all_issues:
        print("ALL CLEAN — no validation issues")
    else:
        print(f"{len(all_issues)} total issue(s):")
        for i in all_issues:
            print("  -", i)


# Hindu month names collide with nakshatra names (Jyeshtha, Magha, Shravana...)
_MONTHS = ["Chaitra", "Vaisakha", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana",
           "Bhadrapada", "Ashwin", "Kartika", "Margashirsha", "Margashira",
           "Pausha", "Magha", "Phalguna"]


def recall_check(text_path: str, page_data: dict) -> tuple[list[str], int]:
    """Page-level recall — catches *missing* nakshatras from a dropped rule
    (e.g. the Prasuti rule dropping its 'medium' tier). This necessarily
    over-reports prose mentions (months collide with nakshatra names, tables
    list weekdays as headers), so treat flags as a screening list, not errors."""
    issues = []
    cur_page = None
    page_text = {}
    for line in open(text_path, encoding="utf-8"):
        m = re.match(r"##### PDF PAGE (\d+) #####", line.strip())
        if m:
            cur_page = int(m.group(1))
            page_text.setdefault(cur_page, [])
        elif cur_page is not None:
            page_text[cur_page].append(line)
    n_pages = 0
    for page, lines in page_text.items():
        n_pages += 1
        text = " ".join(lines)
        got = page_data.get(page, {"nakshatras": {}, "weekdays": {}, "tithi_groups": {}})
        months_hit = sum(1 for mn in _MONTHS if re.search(rf"\b{mn}\b", text, re.I))
        month_prose = months_hit >= 3
        distinct_wd = [w for w in WEEKDAYS if re.search(rf"\b{w}\b", text, re.I)]
        weekday_table = len(distinct_wd) >= 5
        if not re.search(r"[Ss]yno?nym|[Ss]ymmy|deit", text) and not month_prose:
            for nak in NAKSHATRAS_28:
                if re.search(rf"\b{re.escape(nak)}\b", text, re.I) and nak not in got["nakshatras"]:
                    issues.append(f"p{page} RECALL: '{nak}' in source text but in NO extracted rule")
        if not weekday_table:
            for w in WEEKDAYS:
                if re.search(rf"\b{w}\b", text, re.I) and w not in got["weekdays"]:
                    issues.append(f"p{page} RECALL: weekday '{w}' in source text but in NO extracted rule")
        for g in TITHI_GROUPS:
            if re.search(rf"\b{g}\b", text, re.I) and g not in got["tithi_groups"]:
                issues.append(f"p{page} RECALL: tithi group '{g}' in source text but in NO extracted rule")
    return issues, n_pages


if __name__ == "__main__":
    main()