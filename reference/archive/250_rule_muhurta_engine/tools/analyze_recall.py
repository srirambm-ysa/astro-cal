"""analyze_recall.py — classify the validation recall-check flags into true
misses vs known false-positive classes (month-name collusions, prose pages)."""
import re
import subprocess
import collections

out = subprocess.run(
    ["python", "tools/validate_rules.py", "--dir", "rules/raw_full", "--text", "rules/chapters/ch1_ch2_ch5.txt"],
    capture_output=True, text=True,
)

issues = []
for ln in out.stdout.splitlines():
    m = re.search(r"p(\d+) RECALL: '([^']+)'", ln)
    if m:
        issues.append((int(m.group(1)), m.group(2)))
    m2 = re.search(r"p(\d+) RECALL: (weekday '[^']+'|tithi group '[^']+')", ln)
    if m2:
        issues.append((int(m2.group(1)), m2.group(2)))

c = collections.Counter(n for _, n in issues)
pages = sorted(set(p for p, _ in issues))
print(f"total recall flags: {len(issues)} across {len(pages)} pages")
print("top names flagged:")
for name, cnt in c.most_common(20):
    print(f"  {name}: {cnt}")