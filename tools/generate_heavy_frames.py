#!/usr/bin/env python3
"""Dark stone / iron UI frames with sparse antique-brass accents."""
from pathlib import Path
from PIL import Image, ImageDraw
import random

OUT = Path("assets/ui")
BLACK = (4, 3, 2, 255)
TRANSPARENT = (0, 0, 0, 0)

def px(d, x, y, w, h, c):
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)

def panel_heavy():
    w = h = 48
    im = Image.new("RGBA", (w, h), TRANSPARENT)
    d = ImageDraw.Draw(im)
    layers = [
        (4, 3, 2), (17, 14, 11), (31, 25, 20), (46, 37, 28),
        (57, 45, 32), (41, 32, 23), (25, 20, 16), (11, 9, 7),
        (44, 35, 27), (9, 7, 5), (31, 25, 19), (8, 6, 4),
    ]
    for dist, rgb in enumerate(layers):
        px(d, dist, dist, w - dist * 2, h - dist * 2, (*rgb, 255))
    px(d, 12, 12, 24, 24, TRANSPARENT)
    # sparse stone grain; never bright enough to read as a line
    for _ in range(180):
        x = random.randrange(48); y = random.randrange(48)
        if 11 < x < 36 and 11 < y < 36:
            continue
        c = random.choice([(65, 51, 37, 255), (22, 18, 14, 255), (38, 31, 24, 255)])
        d.point((x, y), fill=c)
    # corner iron plates, with a single muted brass rivet
    for ox, oy in [(0, 0), (43, 0), (0, 43), (43, 43)]:
        px(d, ox, oy, 5, 5, BLACK)
        px(d, ox + 1, oy + 1, 3, 3, (39, 31, 24, 255))
        px(d, ox + 2, oy + 2, 1, 1, (63, 47, 28, 255))
        d.point((ox + 2, oy + 2), fill=(118, 87, 48, 255))
    # short corner brackets only, not a full second rectangle
    px(d, 5, 1, 7, 1, (73, 55, 33, 255))
    px(d, 1, 5, 1, 7, (73, 55, 33, 255))
    px(d, 36, 1, 7, 1, (73, 55, 33, 255))
    px(d, 46, 5, 1, 7, (73, 55, 33, 255))
    px(d, 5, 46, 7, 1, (73, 55, 33, 255))
    px(d, 1, 36, 1, 7, (73, 55, 33, 255))
    px(d, 36, 46, 7, 1, (73, 55, 33, 255))
    px(d, 46, 36, 1, 7, (73, 55, 33, 255))
    im.save(OUT / "panel_heavy.png")

def slot_heavy():
    w = h = 32
    im = Image.new("RGBA", (w, h), TRANSPARENT)
    d = ImageDraw.Draw(im)
    layers = [
        (4, 3, 2), (24, 19, 14), (39, 31, 23), (26, 21, 16),
        (47, 37, 27), (16, 13, 10), (8, 6, 4), (35, 28, 21),
    ]
    for dist, rgb in enumerate(layers):
        px(d, dist, dist, w - dist * 2, h - dist * 2, (*rgb, 255))
    px(d, 8, 8, 16, 16, TRANSPARENT)
    for x, y in [(1, 1), (28, 1), (1, 28), (28, 28)]:
        px(d, x, y, 3, 3, (10, 8, 6, 255))
        px(d, x + 1, y + 1, 1, 1, (82, 61, 35, 255))
    # broken edge ticks instead of a continuous gold inset
    for x, y, ww, hh in [(3, 6, 1, 4), (28, 6, 1, 4), (3, 22, 1, 4), (28, 22, 1, 4)]:
        px(d, x, y, ww, hh, (56, 42, 27, 255))
    im.save(OUT / "slot_heavy.png")

def button_heavy(name, gold=False):
    w = h = 40
    im = Image.new("RGBA", (w, h), TRANSPARENT)
    d = ImageDraw.Draw(im)
    layers = [
        (4, 3, 2), (20, 16, 12), (37, 30, 23), (52, 41, 31),
        (31, 24, 18), (17, 13, 10), (8, 6, 4), (46, 36, 26),
        (11, 9, 7), (28, 22, 17),
    ]
    for dist, rgb in enumerate(layers):
        px(d, dist, dist, w - dist * 2, h - dist * 2, (*rgb, 255))
    if gold:
        px(d, 10, 10, 20, 20, (42, 30, 18, 255))
        for yy in range(10, 30, 3):
            px(d, 11, yy, 18, 1, (55, 39, 23, 255) if yy < 19 else (33, 24, 15, 255))
        px(d, 11, 11, 18, 1, (107, 80, 44, 255))
        px(d, 11, 28, 18, 1, (20, 14, 9, 255))
    else:
        px(d, 10, 10, 20, 20, (29, 25, 21, 255))
        for yy in range(10, 30, 3):
            px(d, 11, yy, 18, 1, (41, 35, 29, 255) if yy < 20 else (22, 18, 14, 255))
        px(d, 11, 11, 18, 1, (57, 47, 37, 255))
        px(d, 11, 28, 18, 1, (14, 11, 8, 255))
    # corner rivets only
    for x, y in [(2, 2), (35, 2), (2, 35), (35, 35)]:
        px(d, x, y, 3, 3, (10, 8, 6, 255))
        px(d, x + 1, y + 1, 1, 1, (104, 78, 44, 255) if gold else (65, 52, 37, 255))
    # short top/bottom accent, not a full gold border
    px(d, 17, 1, 6, 1, (79, 60, 36, 255) if gold else (47, 38, 29, 255))
    px(d, 17, 38, 6, 1, (24, 18, 13, 255))
    im.save(OUT / name)

if __name__ == "__main__":
    random.seed(17)
    panel_heavy()
    slot_heavy()
    button_heavy("button_heavy_gold.png", True)
    button_heavy("button_heavy_stone.png", False)
    print("dark heavy frames generated")
