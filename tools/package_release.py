#!/usr/bin/env python3
"""Build a static, deploy-ready copy and a root-level zip for itch.io/Netlify Drop."""
from pathlib import Path
import shutil, zipfile

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
RELEASE = ROOT / "release"
ZIP = RELEASE / "rift-expedition.zip"
INCLUDE = ["index.html", "styles.css", "pixel-skin.css", "heavy-frames.css", "src", "assets"]

if DIST.exists():
    shutil.rmtree(DIST)
DIST.mkdir(parents=True)
for rel in INCLUDE:
    src = ROOT / rel
    dst = DIST / rel
    if src.is_dir():
        shutil.copytree(src, dst)
    else:
        shutil.copy2(src, dst)

RELEASE.mkdir(exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
with zipfile.ZipFile(ZIP, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(DIST.rglob("*")):
        if p.is_file():
            z.write(p, p.relative_to(DIST))

print(f"dist: {DIST}")
print(f"zip:  {ZIP}  ({ZIP.stat().st_size / 1024 / 1024:.1f} MB)")
