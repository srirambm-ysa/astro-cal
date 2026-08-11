"""extract_pages.py — extract English OCR text from Muhurta Chintamani PDF.

The PDF is a scan with an invisible Tesseract text layer (English only;
Devanagari exists only as pixels). This tool pulls the English text for a
set of PDF pages, dedupes doubled OCR lines, strips page-number noise, and
segments output by rule headings (uppercase lines).

Usage:
    python tools/extract_pages.py <pdf> [page page ...] [-o out.txt]
    python tools/extract_pages.py muhurtha-chinthamani.pdf 10 19 52 54 66 120
"""
import sys
import re
import argparse
import difflib
import fitz


def is_noise(line: str) -> bool:
    """Page-number / running-header noise to drop."""
    s = line.strip()
    if re.fullmatch(r"\d{1,4}", s):
        return True
    if re.fullmatch(r"(The )?(Nakshtras?|Samsakaras?|Sankrantis?|Marriage Sanskaras?)", s, re.I):
        return True
    if re.search(r"Muhurt[ae]? Chinta Mani", s, re.I) and len(s) < 45:
        return True
    return False


def is_heading(line: str) -> bool:
    s = line.strip()
    if not s or len(s) < 14:
        return False
    # All-caps (with OCR-damaged chars) heading, or numbered "N." + caps
    caps = sum(1 for c in s if c.isalpha() and c.isupper())
    lower = sum(1 for c in s if c.isalpha() and c.islower())
    return caps > 0 and (lower == 0 or lower < caps * 0.25)


# Known-vocabulary terms to score OCR cleanliness of a candidate copy.
_VOCAB = re.compile(
    r"Pushya|Rohini|Hasta|Anuradha|Mrigashira|Mrigshira|Ashwini|Revati|Krittika|Bharani|"
    r"Punarvasu|Shatabhisha|Dhanishtha|Dhanistha|Magha|Poorvashadha|Uttara Phalguni|"
    r"Uttarashadha|Jyeshtha|Moola|Ardra|Ashlesha|Chitra|Swati|Vishakha|Shravana|"
    r"Thursday|Sunday|Tuesday|Wednesday|Friday|Saturday|Monday|"
    r"tithi|Nakshtra|Nakshatra|Shukla|Krishna|paksha|auspicious", re.I)


def _clean_score(lines: list[str]) -> int:
    """Higher = fewer OCR artifacts (more known-vocab words, fewer symbol runes)."""
    text = " ".join(lines)
    known = len(_VOCAB.findall(text))
    runes = len(re.findall(r"[^\w\s.,;:'()\\/\[\]\-]", text))
    return known - runes * 2


def dedup_paragraphs(lines: list[str]) -> list[str]:
    """Collapse near-duplicate paragraphs (the same scan OCR'd twice).

    Groups contiguous lines into paragraphs; when two paragraphs share >= 80%
    of words, keeps the one with the higher cleanliness score (the second OCR
    pass is usually cleaner).
    """
    paras: list[list[str]] = []
    cur: list[str] = []
    for ln in lines:
        if ln == "":
            if cur:
                paras.append(cur)
                cur = []
        else:
            cur.append(ln)
    if cur:
        paras.append(cur)

    out: list[str] = []
    for p in paras:
        text = " ".join(p)
        drop = False
        for q in reversed(out):
            qtext = " ".join(q)
            sim = difflib.SequenceMatcher(None, text, qtext).ratio()
            if sim >= 0.80:
                if _clean_score(p) > _clean_score(q):
                    out.remove(q)
                    out.append(p)
                drop = True
                break
        if not drop:
            out.append(p)
    return [" ".join(p) for p in out]


def extract(pdf_path: str, pages: list[int]) -> list[dict]:
    doc = fitz.open(pdf_path)
    out = []
    for p in pages:
        text = doc[p].get_text()
        lines = []
        prev = None
        for raw in text.split("\n"):
            line = raw.strip()
            if not line or is_noise(line):
                continue
            # dedupe doubled OCR lines (same line repeated back-to-back)
            if line == prev:
                continue
            lines.append(line)
            prev = line
        out.append({"pdf_page": p, "lines": dedup_paragraphs(lines)})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("pdf")
    ap.add_argument("pages", nargs="+", type=int)
    ap.add_argument("-o", "--out", default=None)
    args = ap.parse_args()

    pages = sorted(set(args.pages))
    data = extract(args.pdf, pages)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            for blk in data:
                f.write(f"\n\n##### PDF PAGE {blk['pdf_page']} #####\n\n")
                for ln in blk["lines"]:
                    f.write(ln + "\n")
        print(f"wrote {len(pages)} pages -> {args.out}")
    else:
        for blk in data:
            print(f"\n##### PDF PAGE {blk['pdf_page']} #####\n")
            for ln in blk["lines"]:
                print(ln)


if __name__ == "__main__":
    main()
