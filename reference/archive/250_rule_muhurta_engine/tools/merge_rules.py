"""merge_rules.py — merge per-page extraction JSON (rules/raw_full/page_XXX.json)
into a single rules corpus (rules/muhurta_rules.json).

Assigns stable ids (MC-<chapter>-<page>-<seq>), adds source provenance
(chapter, pdf_page, book_page = pdf_page - 3), and writes a versioned corpus.
Also canonicalizes nakshatra spellings (OCR variants -> the 27 canonical forms).

Usage:
    python tools/merge_rules.py --in rules/raw_full/ --out rules/muhurta_rules.json
"""
import os
import glob
import json
import argparse
from difflib import SequenceMatcher

NAKSHATRAS_28 = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Poorva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Moola", "Poorvashadha", "Uttarashadha", "Shravana",
    "Dhanishtha", "Shatabhisha", "Poorva Bhadrapada", "Uttara Bhadrapada",
    "Revati", "Abhijit",
]

MERGE = {
    "Mrigshira": "Mrigashira", "Mrigasira": "Mrigashira", "Mngashira": "Mrigashira",
    "Purva Phalguni": "Poorva Phalguni", "Poorva Phalguni": "Poorva Phalguni",
    "ReWati": "Revati", "Rewati": "Revati", "Rcwali": "Revati",
    "Pusbya": "Pushya", "Pusbyi": "Pushya",
    "Hxsta": "Hasta", "Anmadha": "Anuradha", "Dhanistha": "Dhanishtha",
    "Shatbhisha": "Shatabhisha", "Jyeriaha": "Jyeshtha", "Uttamhadha": "Uttarashadha",
    "Kritika": "Krittika", "Aswini": "Ashwini", "Ashwim": "Ashwini",
    "Punarvasva": "Punarvasu",
}


def canon(n: str) -> str:
    n2 = n.strip()
    if n2 in NAKSHATRAS_28:
        return n2
    if n2 in MERGE:
        return MERGE[n2]
    for c in NAKSHATRAS_28:
        if SequenceMatcher(None, n2.lower(), c.lower()).ratio() >= 0.72:
            return c
    return n2


def _normalize(rule: dict) -> None:
    c = rule.get("conditions", {})
    c["nakshatras"] = [canon(n) for n in c.get("nakshatras", [])]
    # dedupe, preserve order
    seen, out = set(), []
    for n in c["nakshatras"]:
        if n not in seen:
            seen.add(n)
            out.append(n)
    c["nakshatras"] = out


def chapter_of(page: int) -> int:
    if 4 <= page <= 49:
        return 1
    if 50 <= page <= 92:
        return 2
    if 116 <= page <= 148:
        return 5
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="indir", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()

    rules = []
    for fp in sorted(glob.glob(os.path.join(args.indir, "*.json"))):
        try:
            data = json.load(open(fp, encoding="utf-8"))
        except Exception as e:
            print(f"{fp}: ERROR {e}")
            continue
        page = data.get("meta", {}).get("pdf_page")
        if page is None:
            print(f"{fp}: skipped (no pdf_page) {data.get('meta', {}).get('error', '')}")
            continue
        ch = chapter_of(page)
        for r in data.get("rules", []):
            seq = sum(1 for x in rules if x["source"]["pdf_page"] == page and x["source"]["chapter"] == ch) + 1
            r["id"] = f"MC-{ch}-{page:03d}-{seq}"
            r["source"] = {"chapter": ch, "pdf_page": page, "book_page": page - 3}
            _normalize(r)
            rules.append(r)

    corpus = {
        "rules_engine_version": "1.0",
        "source_text": "Muhurta Chintamani (Rama Daivagya, trans. Girish Chand Sharma)",
        "chapters": [1, 2, 5],
        "total_rules": len(rules),
        "rules": rules,
    }
    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(corpus, f, indent=2, ensure_ascii=False)
    print(f"merged {len(rules)} rules -> {args.out}")


if __name__ == "__main__":
    main()