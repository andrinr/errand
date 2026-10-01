"""Render the code-drawn Windows 95 social card. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
root = Path(__file__).resolve().parents[1]
im = Image.new('RGB', (1200, 630), '#008080')
d = ImageDraw.Draw(im)
fontdir = Path('/System/Library/Fonts/Supplemental')
def font(size, bold=False):
    return ImageFont.truetype(str(fontdir / ('Arial Bold.ttf' if bold else 'Arial.ttf')), size)
def box(rect, fill='#c0c0c0'):
    x,y,r,b=rect
    d.rectangle(rect, fill=fill)
    d.line([(x,b),(x,y),(r,y)], fill='white', width=4)
    d.line([(r,y),(r,b),(x,b)], fill='#404040', width=4)
box((38,34,1162,596))
d.rectangle((46,42,1154,89), fill='#000080')
d.text((65,52),'computer_use_benchmark.exe',font=font(25,True),fill='white')
box((1106,49,1143,80));d.text((1117,47),'×',font=font(29,True),fill='black')
d.text((79,127),'CUB-95  /  COMPUTER USE EVALUATION',font=font(19,True),fill='#4b4b4b')
d.text((73,174),'Computer Use',font=font(72,True),fill='#181818')
d.text((73,256),'Benchmark',font=font(72,True),fill='#181818')
d.text((79,357),'From instructions to completed tasks.',font=font(28,True),fill='#181818')
d.text((79,407),'7 scored environments · Models, people & animals',font=font(22),fill='#333333')
box((80,466,358,519));d.text((104,480),'Explore the benchmark',font=font(22,True),fill='#181818')
# Printer silhouette from the site's document-output motif.
box((902,193,1060,350), '#fffff0')
d.text((920,213),'PAGE 01',font=font(20,True),fill='#252525')
for y in [252,265,278]:d.line((922,y,1038,y),fill='#9b9b91',width=3)
box((840,318,1100,451),'#dcdccf')
d.rectangle((858,351,1082,364),fill='#444444')
d.rectangle((1060,333,1069,341),fill='#008000')
box((884,397,1060,490),'#fffff0')
d.text((907,419),'OUTPUT',font=font(19,True),fill='#303030')
d.text((913,448),'VERIFIED',font=font(16),fill='#008000')
d.line((52,550,1148,550),fill='#808080',width=2)
d.text((76,565),'andrinr.github.io/errand',font=font(18),fill='#333333')
d.text((870,565),'BROWSER ENVIRONMENTS',font=font(16),fill='#333333')
im.save(root / 'site/assets/social-preview.png', optimize=True)
