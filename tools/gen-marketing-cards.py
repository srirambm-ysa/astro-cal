#!/usr/bin/env python3
"""
Generate reusable marketing cards for muhurta.balaramansriram.com
- Hero 1200x630 (Twitter/LinkedIn OG) + 1080x1080 (Instagram square) + 1080x1350 (IG portrait)
- Uses sacred-ornamental palette: canvas #FAF8F5, gold #C59A4E, vermilion #B83A2A, teal #2F7E7E
- No external assets; pure PIL with Georgia/Arial fallbacks (avoids font subset issues)
- Output: assets/marketing/*.png  (+ .webp via pillow save)
"""
from PIL import Image, ImageDraw, ImageFont
import os, textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "marketing")
os.makedirs(OUT, exist_ok=True)

# Palette
CANVAS = (250,248,245)
PAPER = (255,255,255)
INK = (44,36,29)
INK_SOFT = (112,99,87)
GOLD = (197,154,78)
GOLD_FAINT = (232,224,210)
VERMILION = (184,58,42)
SAFFRON = (217,107,39)
TEAL = (47,126,126)
LINE = (212,197,172)

def load_font(size, bold=False):
    # Try Georgia (serif) like the site; fall back to Arial
    candidates = []
    if bold:
        candidates = ["georgiab.ttf", "arialbd.ttf"]
    else:
        candidates = ["georgia.ttf", "arial.ttf", "arial.ttf"]
    for name in candidates:
        for root in [r"C:\Windows\Fonts", "/usr/share/fonts"]:
            p = os.path.join(root, name)
            if os.path.exists(p):
                try:
                    return ImageFont.truetype(p, size)
                except: pass
    return ImageFont.load_default()

def rounded_rect(draw, xy, r, fill, outline=None, width=1):
    x0,y0,x1,y1 = xy
    draw.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width)

def draw_frame(draw, W, H):
    # outer gold border + inner faint
    draw.rounded_rectangle([0,0,W-1,H-1], radius=18, outline=GOLD, width=3)
    draw.rounded_rectangle([10,10,W-11,H-11], radius=14, outline=GOLD_FAINT, width=1)

def badge(draw, x, y, text, fill=VERMILION, fg=(255,255,255), font=None):
    font = font or load_font(11)
    pad_x, pad_y = 8, 4
    # measure
    bbox = draw.textbbox((0,0), text, font=font)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    w, h = tw + pad_x*2, th + pad_y*2
    draw.rounded_rectangle([x,y,x+w,y+h], radius=999, fill=fill)
    draw.text((x+pad_x, y+pad_y-1), text, fill=fg, font=font)
    return w, h

def hero_card(W, H, variant="og"):
    img = Image.new("RGB", (W,H), CANVAS)
    draw = ImageDraw.Draw(img)
    draw_frame(draw, W, H)

    # Header bar
    pad = 36 if W>=1080 else 28
    inner_w = W - pad*2

    # Title
    title_font = load_font(42 if W>=1000 else 36, bold=True)
    sub_font = load_font(13)
    small_font = load_font(11)
    bullet_font = load_font(14)
    url_font = load_font(16, bold=True)
    chip_font = load_font(10)

    y = pad
    # Overline
    draw.text((pad, y), "VEDIC  CALENDAR  ·  LAHIRI  ·  OFFLINE-FIRST", fill=INK_SOFT, font=small_font)
    y += 18
    # Title
    title = "Muhurtha — Vedic Calendar"
    draw.text((pad, y), title, fill=VERMILION, font=title_font)
    # measure title to place URL on same line for OG
    tb = draw.textbbox((pad,y), title, font=title_font)
    y += (tb[3]-tb[1]) + 8
    # URL pill
    url = "muhurta.balaramansriram.com"
    # badge style URL
    bw, bh = badge(draw, pad, y, url, fill=PAPER, fg=VERMILION, font=url_font)
    # give it gold outline
    draw.rounded_rectangle([pad, y, pad+bw, y+bh], radius=999, outline=GOLD, width=1)
    # fallback text already drawn; keep
    y += bh + 16
    # divider
    draw.line([(pad, y), (W-pad, y)], fill=GOLD_FAINT, width=1)
    y += 14

    # Features: 2 columns for OG, 1 column for square
    features = [
        ("Avoid Days First", "Chandrashtama stays at the top — routine only on Ashtama Chandra"),
        ("Daily Panchang", "Tithi · Nakshatra · Yoga · Karana · Rahu/Yama/Gulika · Abhijit"),
        ("Nitya Sadhana", "16 Kalās — daily Devi, kāla/bīja & mantra (behind dīkṣā note)"),
        ("Tirumandiram Verse", "365 curated verses — Tamil + transliteration + English"),
        ("Gochara Pulse", "Today's Moon house + Tara Bala (Vedha-aware) + monthly transits"),
        ("Muhurta Scorer", "250 Muhurta Chintamani rules — Full / Soft / Personal modes"),
    ]
    # City line as footer note
    city_line = "382 cities · Tamil Nadu bbox · Marriage 36-guna & Guna-Milap whitelist"

    # layout
    if W >= 1100: # OG 1200x630 two cols
        col_w = (inner_w - 24)//2
        x_left, x_right = pad, pad + col_w + 24
        cur_y_l, cur_y_r = y, y
        for i, (k,v) in enumerate(features):
            target_x = x_left if i%2==0 else x_right
            target_y = cur_y_l if i%2==0 else cur_y_r
            # bullet dot
            draw.ellipse([target_x, target_y+6, target_x+6, target_y+12], fill=GOLD)
            draw.text((target_x+12, target_y), k, fill=INK, font=bullet_font)
            # measure k
            kb = draw.textbbox((target_x+12,target_y), k, font=bullet_font)
            # value below
            # wrap value
            max_w = col_w - 14
            # simple wrap by words
            words = v.split()
            lines=[]; cur=""
            for w in words:
                test = (cur+" "+w).strip()
                tb2 = draw.textbbox((0,0), test, font=small_font)
                if tb2[2]-tb2[0] > max_w and cur:
                    lines.append(cur); cur=w
                else: cur=test
            if cur: lines.append(cur)
            ty = target_y + (kb[3]-kb[1]) + 2
            for line in lines:
                draw.text((target_x+12, ty), line, fill=INK_SOFT, font=small_font)
                ty += 13
            if i%2==0: cur_y_l = ty + 8
            else: cur_y_r = ty + 8
        y = max(cur_y_l, cur_y_r) + 6
    else: # square / portrait single column stacked
        for k,v in features:
            draw.ellipse([pad, y+6, pad+6, y+12], fill=GOLD)
            draw.text((pad+12, y), k, fill=INK, font=bullet_font)
            kb = draw.textbbox((pad+12,y), k, font=bullet_font)
            # wrap v
            max_w = inner_w - 14
            words = v.split()
            lines=[]; cur=""
            for w in words:
                test=(cur+" "+w).strip()
                tb2=draw.textbbox((0,0), test, font=small_font)
                if tb2[2]-tb2[0] > max_w and cur:
                    lines.append(cur); cur=w
                else: cur=test
            if cur: lines.append(cur)
            ty = y + (kb[3]-kb[1]) + 2
            for line in lines:
                draw.text((pad+12, ty), line, fill=INK_SOFT, font=small_font)
                ty += 13
            y = ty + 8
        y += 2

    # city line
    draw.text((pad, y), city_line, fill=INK_SOFT, font=small_font)
    y += 16
    # chips
    chips = ["Free", "No login", "No ads", "Offline-first", "Swisseph Lahiri"]
    cx = pad
    for c in chips:
        bw,bh = badge(draw, cx, y, c, fill=PAPER, fg=INK, font=chip_font)
        draw.rounded_rectangle([cx, y, cx+bw, y+bh], radius=999, outline=GOLD_FAINT, width=1)
        cx += bw + 6
    # bottom bar URL repeat for share
    footer_y = H - pad - 14
    draw.line([(pad, footer_y-10), (W-pad, footer_y-10)], fill=GOLD_FAINT, width=1)
    # small footer
    foot_font = load_font(10)
    draw.text((pad, footer_y), "Share:  muhurta.balaramansriram.com  ·  also  astro-cal.srirambm.workers.dev", fill=INK_SOFT, font=foot_font)
    # corner mark
    mark_font = load_font(9)
    draw.text((W-pad-90, footer_y), "© srirambm  ·  v1.1.0", fill=INK_SOFT, font=mark_font)

    return img

def carousel_slides():
    slides = [
        ("Avoid Days\nFirst.", "Chandrashtama", "Peak 06 Sep · routine only", VERMILION),
        ("Today's\nPanchang", "Saptami · Krittika", "Vyāghāta · Viṣṭi · Rahu 11:12", TEAL),
        ("Nitya\nSadhana", "Śivadūtī", "kala Śaśinī · bīja ṛṃ · mantra copy", GOLD),
        ("Verse of\nthe Day", "Tantra #2046", "Tamil pre-wrap + transliteration", SAFFRON),
        ("Gochara\nPulse", "Moon 8th → Aśubha", "till 07:26 → 9th Aśubha · Tara Vadha ⚠", TEAL),
        ("Muhurta\nScore", "Griha Pravesh", "5 Shubh · 12 Soft · 2 Personal (Sep)", VERMILION),
    ]
    for i,(big,kicker,meta,color) in enumerate(slides,1):
        for size, name in [((1080,1080), f"slide-{i:02d}-1080"), ((1080,1350), f"slide-{i:02d}-1350")]:
            W,H = size
            img = Image.new("RGB", (W,H), CANVAS)
            draw = ImageDraw.Draw(img)
            draw_frame(draw, W, H)
            pad=48
            # kicker
            kf = load_font(13)
            bf = load_font(54, bold=True)
            mf = load_font(15)
            sf = load_font(12)
            y=pad+10
            draw.text((pad, y), f"SLIDE {i} · {kicker}", fill=INK_SOFT, font=kf)
            y+=22
            draw.line([(pad,y),(W-pad,y)], fill=GOLD_FAINT, width=1)
            y+=28
            # big
            # multiline big
            for line in big.split("\n"):
                draw.text((pad, y), line, fill=INK, font=bf)
                tb=draw.textbbox((pad,y), line, font=bf)
                y+= (tb[3]-tb[1]) + 4
            y+=12
            # badge
            bw,bh = badge(draw, pad, y, meta, fill=color, fg=(255,255,255), font=mf)
            y+= bh + 24
            # footer URL
            draw.line([(pad, H-pad-30),(W-pad, H-pad-30)], fill=GOLD_FAINT, width=1)
            draw.text((pad, H-pad-20), "muhurta.balaramansriram.com", fill=VERMILION, font=load_font(13, bold=True))
            draw.text((W-pad-160, H-pad-20), "v1.1.0 · offline-first", fill=INK_SOFT, font=sf)
            # save
            out = os.path.join(OUT, f"{name}.png")
            img.save(out, "PNG", optimize=True)
            # also webp
            img.save(out.replace(".png",".webp"), "WEBP", quality=88)
            print(f"wrote {out}")

def main():
    # Hero cards
    for (W,H,name) in [(1200,630,"hero-1200x630-og"), (1080,1080,"hero-1080x1080-square"), (1080,1350,"hero-1080x1350-portrait")]:
        img = hero_card(W,H)
        p = os.path.join(OUT, f"{name}.png")
        img.save(p, "PNG", optimize=True)
        img.save(p.replace(".png",".webp"), "WEBP", quality=88)
        print(f"wrote {p}  {W}x{H}")
    carousel_slides()
    # summary
    total = len([f for f in os.listdir(OUT) if f.endswith(".png")])
    print(f"done: {total} PNGs in {OUT}")

if __name__ == "__main__":
    main()
