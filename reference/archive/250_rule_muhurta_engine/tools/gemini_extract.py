"""gemini_extract.py — extract structured Muhurta rules from OCR'd book text
via OpenRouter (Gemini Flash Lite, JSON mode).

Reads the page-blocked text file produced by extract_pages.py, sends each page
block to the model with a strict extraction prompt, and writes one raw JSON
file per page under rules/pilot/raw/.

Usage:
    python tools/gemini_extract.py --text rules/pilot/text/pilot_all.txt \
        --out rules/pilot/raw/ [--model google/gemini-3.5-flash-lite] \
        [--image rules/pilot/images/page_010.png ...] [--pages 10 19 ...]
"""
import os
import re
import json
import base64
import time
import argparse
import threading
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

API = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-3.5-flash-lite"

SCHEMA_PROMPT = """You are an expert in classical Vedic electional astrology (Muhurta). I will give you the OCR'd English translation of a page from *Muhurta Chintamani* (Rama Daivagya, trans. Girish Chand Sharma). The OCR is noisy with typos; reconstruct the intended words.

Extract EVERY distinct rule/shloka on the page as one object in the returned array. The rules often come as: a heading (all-caps), then the rule body, then a "Notes:" commentary paragraph. Ignore the Notes commentary unless it adds a concrete condition; do not invent rules from Notes.

Return a JSON object with this exact shape:
{
  "rules": [
    {
      "heading": "the all-caps rule heading (cleaned, e.g. 'THE NAKSHTRAS, STHIR OR DHRUWA (FIXED)...')",
      "type": "one of: yoga_combination | nakshatra_classification | activity_muhurta | general_rule",
      "verdict": "auspicious | inauspicious | neutral",   // what the rule says about the listed factors
      "activities": ["list of deeds this rule applies to, lowercase, e.g. 'digging well', 'travelling', 'all auspicious deeds'"],
      "conditions": {
        "nakshatras": ["canonical names, e.g. 'Pushya', 'Rohini', 'Uttara Phalguni'. Expand groups: 'the 3 Uttaras' -> Uttara Phalguni/Uttarashadha/Uttara Bhadrapada; 'Dhruwa'-> Rohini,Uttara Phalguni,Uttarashadha,Uttara Bhadrapada; 'Mridu'->Mrigashira,Revati,Chitra,Anuradha; 'Kshipra'->Hasta,Ashwini,Pushya; 'Chara'->Punarvasu,Swati,Shravana,Dhanishtha,Shatabhisha; 'Tikshna'->Moola,Jyeshtha,Ardra,Ashlesha; 'Ugra'->Bharani,Magha,Poorva Phalguni,Poorvashadha,Poorva Bhadrapada; 'Mishra'->Krittika,Vishakha"],
        "weekdays": ["Sunday".."Saturday"],
        "tithis": [numbers, e.g. 5, 7, 11],            // tithi numbers the rule names
        "tithi_groups": ["Nanda","Bhadra","Jaya","Rikta","Poorna"],  // if the rule names a group
        "paksha": "Shukla" | "Krishna" | "Both" | null,
        "yogas": ["named yogas e.g. 'Amrita','Dagdha','Siddha','Halahala','Madhu Sarpisha'"],
        "planetary": {"freeform": "any lagna/house/planet conditions, verbatim-ish"}
      },
      "exclusions": ["explicit avoided factors, e.g. 'Rikta tithis', 'Amavasya', '6th tithi'"],
      "notes": "one-sentence interpretation in your own words",
      "uncertain": false    // true ONLY if the text was too garbled to reconstruct reliably
    }
  ]
}

CRITICAL normalization rules:
- Use the canonical 27-nakshatra spellings: Ashwini, Bharani, Krittika, Rohini, Mrigashira, Ardra, Punarvasu, Pushya, Ashlesha, Magha, Poorva Phalguni, Uttara Phalguni, Hasta, Chitra, Swati, Vishakha, Anuradha, Jyeshtha, Moola, Poorvashadha, Uttarashadha, Shravana, Dhanishtha, Shatabhisha, Poorva Bhadrapada, Uttara Bhadrapada, Revati.
- Fix OCR typos (e.g. 'Pusbya'->Pushya, 'Mngashira'/'Mrigshira'/'Mrigasira'->Mrigashira, 'Rcwali'->Revati, 'Hxsta'->Hasta, 'Amiiadha'->Anuradha).
- **Do NOT drop ANY nakshatra, tithi, weekday, or group named in a rule body, even if the OCR is very garbled. Infer the canonical spelling from context. If a list looks like it may be incomplete, set uncertain=true.** This is the single most important rule: the source lists are the entire point of extraction, and dropping one item silently corrupts the rule.
- A single shloka/rule may contain MULTIPLE tiers of auspiciousness (e.g. "auspicious in these 10 nakshatras, inauspicious in those 10, moderately good in these 7"). Extract EACH tier as its own rule object with the appropriate verdict (auspicious / inauspicious / neutral). Do not merge tiers or drop one tier.
- A tithi group implies its numbers: Nanda=1/6/11, Bhadra=2/7/12, Jaya=3/8/13, Rikta=4/9/14, Poorna=5/10/15.
- Do NOT add nakshatras/tithis that are not in the text. When in doubt, leave a list empty and set uncertain=true."""

# Gemini-compatible multi-role schema prompt (with JSON mode)
JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "rules": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "heading": {"type": "string"},
                    "type": {"type": "string"},
                    "verdict": {"type": "string"},
                    "activities": {"type": "array", "items": {"type": "string"}},
                    "conditions": {
                        "type": "object",
                        "properties": {
                            "nakshatras": {"type": "array", "items": {"type": "string"}},
                            "weekdays": {"type": "array", "items": {"type": "string"}},
                            "tithis": {"type": "array", "items": {"type": "integer"}},
                            "tithi_groups": {"type": "array", "items": {"type": "string"}},
                            "paksha": {"type": ["string", "null"]},
                            "yogas": {"type": "array", "items": {"type": "string"}},
                            "planetary": {"type": "object"}
                        },
                        "required": ["nakshatras", "weekdays", "tithis", "tithi_groups", "paksha", "yogas", "planetary"]
                    },
                    "exclusions": {"type": "array", "items": {"type": "string"}},
                    "notes": {"type": "string"},
                    "uncertain": {"type": "boolean"}
                },
                "required": ["heading", "type", "verdict", "activities", "conditions", "exclusions", "notes", "uncertain"]
            }
        }
    },
    "required": ["rules"]
}


def parse_page_blocks(text: str) -> list[tuple[int, str]]:
    """Split the extract_pages.py output into (pdf_page, block_text)."""
    blocks = []
    cur_page = None
    cur_lines = []
    for line in text.splitlines():
        m = re.match(r"##### PDF PAGE (\d+) #####", line)
        if m:
            if cur_page is not None:
                blocks.append((cur_page, "\n".join(cur_lines)))
            cur_page = int(m.group(1))
            cur_lines = []
        else:
            cur_lines.append(line)
    if cur_page is not None:
        blocks.append((cur_page, "\n".join(cur_lines)))
    return blocks


def load_images(paths: list[str]) -> list[str]:
    out = []
    for p in paths:
        with open(p, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
        ext = os.path.splitext(p)[1].lstrip(".") or "png"
        out.append(f"data:image/{ext};base64,{b64}")
    return out


def call_model(text: str, model: str, image_paths: list[str] | None = None, timeout: int = 120) -> dict:
    key = os.environ["OPENROUTER_API_KEY"]
    content = []
    if image_paths:
        for img in load_images(image_paths):
            content.append({"type": "image_url", "image_url": {"url": img}})
    content.append({"type": "text", "text": SCHEMA_PROMPT})
    content.append({"type": "text", "text": "=== PAGE TEXT START ===\n" + text + "\n=== PAGE TEXT END ==="})

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a classical Muhurta rules extractor. Reply only with the JSON object."},
            {"role": "user", "content": content},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.1,
    }
    body = json.dumps(payload).encode()
    req = urllib.request.Request(API, data=body, headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://astro-cal.local",
        "X-Title": "astro-cal-rules",
    })
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.load(r)


_print_lock = threading.Lock()


def process_page(page: int, text: str, model: str, image_paths: list[str], out_dir: str) -> tuple[int, int | str]:
    out_file = os.path.join(out_dir, f"page_{page:03d}.json")
    imgs = [p for p in image_paths if f"page_{page:03d}" in p] or image_paths or None
    for attempt in range(3):
        try:
            resp = call_model(text, model, imgs)
            raw = resp["choices"][0]["message"]["content"]
            parsed = json.loads(raw)
            meta = {
                "pdf_page": page,
                "model": model,
                "image_input": bool(imgs),
                "usage": resp.get("usage", {}),
            }
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump({"meta": meta, **parsed}, f, indent=2, ensure_ascii=False)
            n = len(parsed.get("rules", []))
            with _print_lock:
                print(f"  page {page}: {n} rules -> {os.path.basename(out_file)}")
            return page, n
        except Exception as e:
            if attempt == 2:
                with open(out_file, "w", encoding="utf-8") as f:
                    json.dump({"meta": {"pdf_page": page, "error": str(e)}}, f, indent=2)
                with _print_lock:
                    print(f"  page {page}: FAILED after 3 attempts: {e}")
                return page, f"FAILED: {e}"
            time.sleep(2 * (attempt + 1))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--image", nargs="*", default=[])
    ap.add_argument("--pages", nargs="*", type=int, default=None)
    ap.add_argument("--workers", type=int, default=6, help="concurrent API calls (default 6)")
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    with open(args.text, encoding="utf-8") as f:
        blocks = parse_page_blocks(f.read())

    if args.pages:
        blocks = [b for b in blocks if b[0] in args.pages]
    print(f"{len(blocks)} page blocks to process with {args.model}, workers={args.workers}")

    done = 0
    failed = []
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        futs = {ex.submit(process_page, page, text, args.model, args.image, args.out): page
                for page, text in blocks}
        for fut in as_completed(futs):
            page, result = fut.result()
            done += 1
            if isinstance(result, str):
                failed.append((page, result))
            if done % 10 == 0:
                print(f"  ... {done}/{len(blocks)} pages done")

    print(f"\ncomplete: {done} pages, {len(failed)} failed")
    for p, e in failed:
        print(f"  FAILED page {p}: {e}")


if __name__ == "__main__":
    main()
