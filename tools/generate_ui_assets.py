#!/usr/bin/env python3
"""Generate pixel-art fantasy UI textures for Rift Expedition."""
from pathlib import Path
from PIL import Image, ImageDraw
import random

OUT = Path("assets/ui")
OUT.mkdir(parents=True, exist_ok=True)

# Palette
BLACK = (7, 6, 7, 255)
INK = (14, 11, 10, 255)
IRON_D = (27, 24, 22, 255)
IRON = (44, 38, 33, 255)
STONE_D = (24, 21, 18, 255)
STONE = (38, 32, 27, 255)
STONE_L = (55, 46, 37, 255)
STONE_H = (73, 61, 47, 255)
BRONZE_D = (59, 38, 19, 255)
BRONZE = (108, 71, 31, 255)
GOLD_D = (141, 97, 40, 255)
GOLD = (188, 137, 61, 255)
GOLD_L = (231, 185, 101, 255)
GOLD_H = (255, 232, 159, 255)
GEM = (83, 38, 27, 255)
GEM_L = (175, 77, 46, 255)
TRANSPARENT = (0, 0, 0, 0)


def new(w, h):
    return Image.new("RGBA", (w, h), TRANSPARENT)


def drect(d, x, y, w, h, c):
    if w <= 0 or h <= 0:
        return
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=c)


def border(d, size, color, width=1):
    w, h = size
    drect(d, 0, 0, w, width, color)
    drect(d, 0, h - width, w, width, color)
    drect(d, 0, 0, width, h, color)
    drect(d, w - width, 0, width, h, color)


def make_stone_tile():
    random.seed(21)
    im = new(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 31, 31], fill=STONE_D)
    row_h = 8
    for row in range(4):
        y = row * row_h
        offset = (-12, 4, -7, 9)[row]
        for col in range(-2, 4):
            x = col * 16 + offset
            w = 15
            d.rectangle([x + 1, y + 1, x + w - 1, y + row_h - 2], fill=STONE)
            d.line([x + 2, y + 1, x + w - 2, y + 1], fill=STONE_L)
            d.line([x + 1, y + 2, x + 1, y + row_h - 3], fill=STONE_L)
            d.line([x + 2, y + row_h - 2, x + w - 1, y + row_h - 2], fill=INK)
            d.line([x + w - 1, y + 2, x + w - 1, y + row_h - 2], fill=(14, 12, 10, 255))
            if random.random() < .45:
                sx = x + random.randint(3, 11)
                sy = y + random.randint(3, 5)
                d.point((sx, sy), fill=STONE_H)
                d.point((sx + 1, sy + 1), fill=STONE_D)
            if random.random() < .18:
                sx = x + random.randint(3, 10)
                sy = y + 3
                d.line([sx, sy, sx + random.randint(2, 5), sy + random.randint(1, 3)], fill=INK)
    # Mortar / edge blend
    d.line([0, 0, 31, 0], fill=STONE_L)
    d.line([0, 31, 31, 31], fill=BLACK)
    im.save(OUT / "stone_tile.png")

    # Darker variant for inputs / cards
    dark = Image.eval(im.convert("RGB"), lambda v: int(v * .82)).convert("RGBA")
    dark.save(OUT / "stone_tile_dark.png")


def panel_frame(w=80, h=80, slice_px=18, dark=False):
    im = new(w, h)
    d = ImageDraw.Draw(im)
    inner = (24, 20, 17, 255) if dark else STONE_L
    # outer silhouette black
    drect(d, 0, 0, w, h, BLACK)
    # dark bronze outer band
    drect(d, 1, 1, w - 2, h - 2, BRONZE_D)
    # bronze body
    drect(d, 2, 2, w - 4, h - 4, BRONZE)
    # upper-left highlight and lower-right shadow of rim
    d.line([2, 2, w - 3, 2], fill=GOLD)
    d.line([2, 2, 2, h - 3], fill=GOLD)
    d.line([2, h - 3, w - 3, h - 3], fill=BRONZE_D)
    d.line([w - 3, 2, w - 3, h - 3], fill=BRONZE_D)
    # inset dark line
    drect(d, 4, 4, w - 8, h - 8, BLACK)
    # gold inner rim
    drect(d, 5, 5, w - 10, h - 10, GOLD_D)
    drect(d, 6, 6, w - 12, h - 12, GOLD)
    d.line([6, 6, w - 7, 6], fill=GOLD_L)
    d.line([6, 6, 6, h - 7], fill=GOLD_L)
    d.line([6, h - 7, w - 7, h - 7], fill=GOLD_D)
    d.line([w - 7, 6, w - 7, h - 7], fill=GOLD_D)
    # inner iron bevel
    drect(d, 8, 8, w - 16, h - 16, BLACK)
    drect(d, 9, 9, w - 18, h - 18, IRON_D)
    d.line([9, 9, w - 10, 9], fill=IRON)
    d.line([9, 9, 9, h - 10], fill=IRON)
    # interior: leave transparent from slice
    drect(d, 14, 14, w - 28, h - 28, TRANSPARENT)
    # corner brackets / rivets
    for x, y, sx, sy in [(5, 5, 1, 1), (w - 9, 5, -1, 1), (5, h - 9, 1, -1), (w - 9, h - 9, -1, -1)]:
        # outer stud
        drect(d, x, y, 4, 4, BLACK)
        drect(d, x + 1, y + 1, 2, 2, GOLD_L)
        d.point((x + 1, y + 1), fill=GOLD_H)
        # L-shaped filigree inside
        drect(d, x + (1 if sx > 0 else -5), y + 5, 4, 1, GOLD_D)
        drect(d, x + 5, y + (1 if sy > 0 else -5), 1, 4, GOLD_D)
    # edge studs at quarter positions? subtle, avoids stretched repetition by keeping in corners
    im.save(OUT / ("panel_dark.png" if dark else "panel.png"))


def button_frame(name, gold=True, w=64, h=64):
    im = new(w, h)
    d = ImageDraw.Draw(im)
    drect(d, 0, 0, w, h, BLACK)
    drect(d, 1, 1, w - 2, h - 2, BRONZE_D)
    drect(d, 2, 2, w - 4, h - 4, BRONZE if gold else IRON_D)
    d.line([2, 2, w - 3, 2], fill=GOLD_L if gold else STONE_H)
    d.line([2, 2, 2, h - 3], fill=GOLD_L if gold else STONE_H)
    d.line([2, h - 3, w - 3, h - 3], fill=BRONZE_D)
    d.line([w - 3, 2, w - 3, h - 3], fill=BRONZE_D)
    drect(d, 4, 4, w - 8, h - 8, BLACK)
    drect(d, 5, 5, w - 10, h - 10, GOLD_D if gold else STONE_D)
    # interior stepped bands
    face_top = GOLD if gold else STONE
    face_bot = GOLD_D if gold else STONE_D
    for y in range(7, h - 7, 2):
        t = (y - 7) / max(1, h - 14)
        if gold:
            if t < .18: c = GOLD_L
            elif t < .55: c = GOLD
            elif t < .82: c = GOLD_D
            else: c = BRONZE
        else:
            if t < .2: c = STONE_H
            elif t < .65: c = STONE
            else: c = STONE_D
        drect(d, 7, y, w - 14, 1, c)
    d.line([7, 7, w - 8, 7], fill=GOLD_H if gold else STONE_H)
    d.line([7, h - 8, w - 8, h - 8], fill=BRONZE_D)
    # corner studs
    for x, y in [(6, 6), (w - 10, 6), (6, h - 10), (w - 10, h - 10)]:
        drect(d, x, y, 4, 4, BLACK)
        drect(d, x + 1, y + 1, 2, 2, GOLD_L if gold else GOLD_D)
    im.save(OUT / name)


def slot_frame():
    w = h = 48
    im = new(w, h)
    d = ImageDraw.Draw(im)
    drect(d, 0, 0, w, h, BLACK)
    drect(d, 1, 1, w - 2, h - 2, BRONZE_D)
    drect(d, 2, 2, w - 4, h - 4, BRONZE)
    d.line([2, 2, w - 3, 2], fill=GOLD)
    d.line([2, 2, 2, h - 3], fill=GOLD)
    drect(d, 4, 4, w - 8, h - 8, BLACK)
    drect(d, 5, 5, w - 10, h - 10, GOLD_D)
    drect(d, 6, 6, w - 12, h - 12, GOLD)
    d.line([7, 7, w - 8, 7], fill=GOLD_L)
    d.line([7, 7, 7, h - 8], fill=GOLD_L)
    drect(d, 8, 8, w - 16, h - 16, BLACK)
    drect(d, 9, 9, w - 18, h - 18, INK)
    drect(d, 12, 12, w - 24, h - 24, TRANSPARENT)
    # corner brackets
    for x, y, sx, sy in [(5, 5, 1, 1), (w - 9, 5, -1, 1), (5, h - 9, 1, -1), (w - 9, h - 9, -1, -1)]:
        drect(d, x, y, 3, 3, GOLD_L)
        drect(d, x + (0 if sx > 0 else 2), y, 1, 1, GOLD_H)
    # filigree ticks
    d.line([13, 18, 18, 13], fill=GOLD_D)
    d.line([w - 14, 18, w - 19, 13], fill=GOLD_D)
    im.save(OUT / "slot.png")


def bar_frame():
    w, h = 32, 20
    im = new(w, h)
    d = ImageDraw.Draw(im)
    drect(d, 0, 0, w, h, BLACK)
    drect(d, 1, 1, w - 2, h - 2, BRONZE_D)
    drect(d, 2, 2, w - 4, h - 4, GOLD_D)
    d.line([2, 2, w - 3, 2], fill=GOLD_L)
    d.line([2, 2, 2, h - 3], fill=GOLD_L)
    drect(d, 3, 3, w - 6, h - 6, BLACK)
    drect(d, 4, 4, w - 8, h - 8, INK)
    drect(d, 6, 6, w - 12, h - 12, TRANSPARENT)
    im.save(OUT / "bar_frame.png")


def card_frame():
    w, h = 112, 144
    im = new(w, h)
    d = ImageDraw.Draw(im)
    drect(d, 0, 0, w, h, BLACK)
    drect(d, 1, 1, w - 2, h - 2, BRONZE_D)
    drect(d, 2, 2, w - 4, h - 4, BRONZE)
    d.line([2, 2, w - 3, 2], fill=GOLD)
    d.line([2, 2, 2, h - 3], fill=GOLD)
    d.line([2, h - 3, w - 3, h - 3], fill=BRONZE_D)
    d.line([w - 3, 2, w - 3, h - 3], fill=BRONZE_D)
    drect(d, 4, 4, w - 8, h - 8, BLACK)
    drect(d, 5, 5, w - 10, h - 10, GOLD_D)
    drect(d, 6, 6, w - 12, h - 12, GOLD)
    d.line([7, 7, w - 8, 7], fill=GOLD_L)
    d.line([7, 7, 7, h - 8], fill=GOLD_L)
    d.line([7, h - 8, w - 8, h - 8], fill=GOLD_D)
    drect(d, 9, 9, w - 18, h - 18, BLACK)
    drect(d, 10, 10, w - 20, h - 20, IRON_D)
    d.line([10, 10, w - 11, 10], fill=IRON)
    d.line([10, 10, 10, h - 11], fill=IRON)
    drect(d, 18, 18, w - 36, h - 36, TRANSPARENT)
    # ornate corner filigree
    for x, y, sx, sy in [(6, 6, 1, 1), (w - 20, 6, -1, 1), (6, h - 20, 1, -1), (w - 20, h - 20, -1, -1)]:
        # rivet
        drect(d, x + (1 if sx > 0 else 9), y + (1 if sy > 0 else 9), 4, 4, BLACK)
        drect(d, x + (2 if sx > 0 else 10), y + (2 if sy > 0 else 10), 2, 2, GOLD_L)
        # curly bracket
        cx = x + (4 if sx > 0 else 8)
        cy = y + (4 if sy > 0 else 8)
        for i in range(5):
            d.point((cx + sx * i, cy - sy * i), fill=GOLD_L)
            d.point((cx + sx * i + 1, cy - sy * i), fill=GOLD_D)
        d.line([cx + sx * 4, cy - sy * 4, cx + sx * 4 + sx * 5, cy - sy * 4], fill=GOLD_D)
        d.line([cx - sx * 0, cy - sy * 4, cx - sx * 0, cy - sy * 9], fill=GOLD_D)
    # center gem at top? add a diamond stud on top edge (within border, avoid stretch? top center would stretch if not in corner)
    # Keep edge plain to avoid stretching motif; a CSS gem will do.
    im.save(OUT / "card.png")


def endcap():
    w, h = 56, 72
    im = new(w, h)
    d = ImageDraw.Draw(im)
    # backing bracket
    drect(d, 8, 6, 40, 60, BLACK)
    drect(d, 10, 8, 36, 56, BRONZE_D)
    drect(d, 12, 10, 32, 52, IRON_D)
    drect(d, 14, 12, 28, 48, STONE_D)
    # gryphon / wing silhouette
    wing = [
        (10, 18), (4, 14), (2, 22), (8, 24), (3, 30), (10, 31),
        (6, 38), (13, 37), (11, 45), (18, 41), (17, 50), (23, 45),
        (24, 54), (30, 48), (31, 36), (27, 24), (20, 18)
    ]
    d.polygon(wing, fill=GOLD_D)
    d.line(wing + [wing[0]], fill=BLACK)
    # inner feathers
    for i, y in enumerate([24, 29, 34, 39, 44]):
        d.line([10 - i, y, 18, y + 5], fill=GOLD)
        d.line([8 - i, y + 1, 17, y + 6], fill=GOLD_L)
    # head / beak at base, toward right
    d.polygon([(30, 20), (43, 17), (48, 24), (42, 30), (34, 29)], fill=GOLD_D)
    d.polygon([(33, 22), (43, 20), (45, 24), (38, 26)], fill=GOLD)
    d.point((41, 21), fill=BLACK)
    d.polygon([(46, 24), (53, 26), (46, 29)], fill=GOLD_L)
    d.line([(31, 18), (40, 15)], fill=BLACK)
    # lower bracket
    drect(d, 8, 56, 40, 8, BLACK)
    drect(d, 10, 58, 36, 4, BRONZE)
    d.line([10, 58, 45, 58], fill=GOLD_L)
    # gem
    drect(d, 24, 12, 8, 8, BLACK)
    drect(d, 26, 14, 4, 4, GEM)
    d.point((27, 15), fill=GEM_L)
    im.save(OUT / "endcap.png")


def minimap_ring():
    size = 128
    im = new(size, size)
    d = ImageDraw.Draw(im)
    cx = cy = size // 2
    # outer black outline
    for r, c in [(62, BLACK), (60, BRONZE_D), (58, BRONZE), (56, GOLD_D), (54, GOLD), (52, BLACK)]:
        d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=c, width=2)
    # clipped corners / studs
    for angle in range(0, 360, 45):
        import math
        a = math.radians(angle)
        x = int(cx + math.cos(a) * 58)
        y = int(cy + math.sin(a) * 58)
        d.rectangle([x - 2, y - 2, x + 1, y + 1], fill=BLACK)
        d.rectangle([x - 1, y - 1, x, y], fill=GOLD_H)
    # inner hairline
    d.ellipse([cx - 51, cy - 51, cx + 51, cy + 51], outline=GOLD_L, width=1)
    # clear center
    mask = Image.new("RGBA", (size, size), TRANSPARENT)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - 50, cy - 50, cx + 50, cy + 50], fill=(255, 255, 255, 255))
    center = Image.new("RGBA", (size, size), TRANSPARENT)
    im.paste(center, (0, 0), mask)
    im.save(OUT / "minimap_ring.png")


def divider():
    w, h = 96, 16
    im = new(w, h)
    d = ImageDraw.Draw(im)
    d.line([0, 7, 38, 7], fill=BRONZE_D)
    d.line([0, 8, 38, 8], fill=GOLD_D)
    d.line([58, 7, 95, 7], fill=GOLD_D)
    d.line([58, 8, 95, 8], fill=BRONZE_D)
    poly = [(48, 0), (54, 7), (48, 15), (42, 7)]
    d.polygon(poly, fill=BLACK)
    d.polygon([(48, 2), (52, 7), (48, 13), (44, 7)], fill=GOLD)
    d.point((48, 6), fill=GOLD_H)
    im.save(OUT / "divider.png")


def main():
    make_stone_tile()
    panel_frame(80, 80, 18, False)
    panel_frame(80, 80, 18, True)
    button_frame("button_gold.png", True)
    button_frame("button_stone.png", False)
    slot_frame()
    bar_frame()
    card_frame()
    endcap()
    minimap_ring()
    divider()
    print("generated", len(list(OUT.glob("*.png"))), "ui assets")

if __name__ == "__main__":
    main()
