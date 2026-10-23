
from PIL import Image, ImageDraw, ImageOps
import random, math, os

OUT='assets/ui'
os.makedirs(OUT, exist_ok=True)
random.seed(41)

def px(d, x, y, c):
    d.point((x,y), fill=c)

def rect(d, x0,y0,x1,y1,c):
    d.rectangle([x0,y0,x1,y1], fill=c)

def noise_panel(img, d, x0,y0,x1,y1, base):
    # low-contrast stone grain
    for y in range(y0,y1):
        for x in range(x0,x1):
            r=random.random()
            if r < .10:
                px(d,x,y,base[0])
            elif r > .93:
                px(d,x,y,base[1])

def corner_tile(size=38):
    t=Image.new('RGBA',(size,size),(0,0,0,0))
    d=ImageDraw.Draw(t)
    # broad muted bronze L, segmented so it doesn't read as a web border
    d.line([(7,6),(25,6)], fill=(126,96,54,210), width=2)
    d.line([(6,7),(6,25)], fill=(126,96,54,210), width=2)
    d.line([(10,10),(25,10)], fill=(82,58,33,190), width=1)
    d.line([(10,10),(10,25)], fill=(82,58,33,190), width=1)
    # scroll progression into the edge
    for i,(x,y) in enumerate([(27,6),(29,7),(31,9),(32,12),(32,15),(31,18),(29,20),(27,21)]):
        px(d,x,y,(151,116,64,220))
        if i%2==0: px(d,x+1,y,(65,46,28,200))
    for i,(x,y) in enumerate([(6,27),(7,29),(9,31),(12,32),(15,32),(18,31),(20,29),(21,27)]):
        px(d,x,y,(151,116,64,220))
        if i%2==0: px(d,x,y+1,(65,46,28,200))
    # corner boss / rivet
    d.rectangle([13,13,18,18], fill=(48,36,23,255))
    d.rectangle([14,14,17,17], fill=(166,128,72,255))
    d.rectangle([15,15,16,16], fill=(222,184,118,255))
    px(d,13,13,(238,206,146,255)); px(d,18,18,(84,60,34,255))
    # small leaf / notch
    d.polygon([(24,12),(28,12),(26,15)], fill=(91,67,38,220))
    d.polygon([(12,24),(12,28),(15,26)], fill=(91,67,38,220))
    d.point((22,22), fill=(190,154,92,180))
    return t

# 128x128 nine-slice panel, 36px corners, transparent center
panel=Image.new('RGBA',(128,128),(0,0,0,0))
d=ImageDraw.Draw(panel)
# dark stone band
rect(d,0,0,127,127,(0,0,0,0))
for y in range(128):
    for x in range(128):
        edge = x < 23 or x > 104 or y < 23 or y > 104
        if not edge: continue
        c = (27,24,21,255) if (x+y)%2 else (31,27,23,255)
        if x<2 or y<2 or x>125 or y>125: c=(5,4,3,255)
        d.point((x,y),fill=c)
# grain
for _ in range(900):
    x=random.randrange(128); y=random.randrange(128)
    if x<23 or x>104 or y<23 or y>104:
        c=random.choice([(39,33,27,255),(22,20,18,255),(45,38,30,255),(18,17,16,255)])
        d.point((x,y),fill=c)
# bevel lines
d.rectangle([2,2,125,125], outline=(7,6,5,255), width=1)
# no continuous inner line; the stone band and corner filigree define the frame
d.rectangle([18,18,109,109], outline=(8,7,6,255), width=1)
# no second full rectangle
# inner faint highlight
# no full-length edge highlight
# corner filigree
ct=corner_tile()
for ox,oy,im in [
    (0,0,ct),
    (128-ct.width,0,ImageOps.mirror(ct)),
    (0,128-ct.height,ImageOps.flip(ct)),
    (128-ct.width,128-ct.height,ImageOps.mirror(ImageOps.flip(ct)))
]:
    panel.alpha_composite(im,(ox,oy))
panel.save(os.path.join(OUT,'ach_panel.png'))

# 72x72 card frame, 18px slice, transparent center
def make_card(unlocked=False):
    im=Image.new('RGBA',(72,72),(0,0,0,0)); dd=ImageDraw.Draw(im)
    for y in range(72):
        for x in range(72):
            if x<7 or x>64 or y<7 or y>64:
                c=(38,32,26,255) if (x+y)%2 else (42,35,28,255)
                if x<1 or y<1 or x>70 or y>70: c=(4,4,3,255)
                dd.point((x,y),fill=c)
    for _ in range(280):
        x=random.randrange(72); y=random.randrange(72)
        if x<7 or x>64 or y<7 or y>64:
            dd.point((x,y),fill=random.choice([(54,45,35,255),(28,25,21,255),(65,54,40,255)]))
    dd.rectangle([1,1,70,70],outline=(6,5,4,255),width=1)
    dd.rectangle([3,3,68,68],outline=(12,10,8,255),width=1)
    dd.rectangle([6,6,65,65],outline=(8,7,6,255),width=1)
    # corner caps: only small gold marks, no full edge
    gc=(174,137,82,255) if unlocked else (106,81,50,220)
    hc=(238,207,147,255) if unlocked else (132,102,60,180)
    for (x,y,sx,sy) in [(3,3,1,1),(68,3,-1,1),(3,68,1,-1),(68,68,-1,-1)]:
        dd.line([(x,y),(x+sx*7,y)],fill=gc,width=1)
        dd.line([(x,y),(x,y+sy*7)],fill=gc,width=1)
        dd.point((x+sx*2,y+sy*2),fill=hc)
    if unlocked:
        # warm, broken inner accent at corners only
        for (x,y,sx,sy) in [(9,9,1,1),(62,9,-1,1),(9,62,1,-1),(62,62,-1,-1)]:
            dd.line([(x,y),(x+sx*5,y)],fill=(139,104,57,130),width=1)
            dd.line([(x,y),(x,y+sy*5)],fill=(139,104,57,130),width=1)
    return im
make_card(False).save(os.path.join(OUT,'ach_card.png'))
make_card(True).save(os.path.join(OUT,'ach_card_unlocked.png'))

# subtle stone tile, 96x96
tex=Image.new('RGBA',(96,96),(0,0,0,255)); td=ImageDraw.Draw(tex)
for y in range(96):
    for x in range(96):
        c=random.choice([(18,17,16),(21,19,17),(16,15,14),(23,21,19)])
        td.point((x,y),fill=c)
for _ in range(80):
    x=random.randrange(96); y=random.randrange(96)
    td.line([(x,y),(x+random.randrange(2,9),y+random.randrange(-2,3))],fill=(34,30,26),width=1)
for _ in range(140):
    x=random.randrange(96); y=random.randrange(96)
    td.point((x,y),fill=random.choice([(41,36,30),(12,12,11),(52,45,35)]))
tex.save(os.path.join(OUT,'ach_texture.png'))

# divider 192x20
div=Image.new('RGBA',(192,20),(0,0,0,0)); dd=ImageDraw.Draw(div)
for x in range(4,188):
    a=int(150 * (1 - abs(x-96)/96))
    dd.point((x,10),fill=(112,86,50,a))
    if 20 < x < 172:
        dd.point((x,9),fill=(65,49,30,a//2))
for x in range(70,122):
    if x < 94:
        dd.point((x,8),fill=(149,114,65,180))
    elif x > 98:
        dd.point((x,8),fill=(149,114,65,180))
# center diamond
dd.polygon([(96,3),(104,10),(96,17),(88,10)],fill=(36,27,18,255))
dd.polygon([(96,5),(101,10),(96,15),(91,10)],fill=(128,96,54,255))
dd.point((96,9),fill=(222,187,119,255))
# side flourishes
for sx in [76,116]:
    dd.line([(sx,10),(sx+4,7),(sx+8,10)],fill=(97,73,42,200),width=1)
div.save(os.path.join(OUT,'ach_divider.png'))

# faint warband sigil 256x256
sig=Image.new('RGBA',(256,256),(0,0,0,0)); sd=ImageDraw.Draw(sig)
gold=(130,99,55,90); dim=(90,69,42,55); high=(163,128,73,100)
cx=cy=128
for r,w,c in [(104,2,dim),(92,1,gold),(72,1,dim),(52,1,gold),(33,1,dim)]:
    sd.ellipse([cx-r,cy-r,cx+r,cy+r],outline=c,width=w)
# compass points / diamond
sd.polygon([(cx,14),(cx+19,cy),(cx,cy+19),(cx-19,cy)],outline=gold,width=2)
sd.polygon([(cx,cy-19),(cx+19,cy),(cx,cy+19),(cx-19,cy)],outline=high,width=1)
# crossed swords
sd.line([(cx-64,cy-64),(cx+64,cy+64)],fill=(119,91,52,70),width=3)
sd.line([(cx+64,cy-64),(cx-64,cy+64)],fill=(119,91,52,70),width=3)
for a in [0,90,180,270]:
    ang=math.radians(a)
    x=cx+math.cos(ang)*92; y=cy+math.sin(ang)*92
    sd.rectangle([x-2,y-2,x+2,y+2],fill=(155,120,68,110))
# small crown at top
sd.line([(112,72),(118,64),(124,72),(130,64),(136,72)],fill=(151,116,64,95),width=2)
sig.save(os.path.join(OUT,'ach_sigil.png'))
print('generated')
