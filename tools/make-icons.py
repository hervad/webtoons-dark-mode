"""Draws the extension icons (extension/icons/icon-{16,32,48,128}.png) and
Edge's 300 px store logo (dist/store/store-logo-300.png):
a green crescent moon on the theme's dark card colour. Drawn at 512px and
scaled down, so the small sizes stay crisp.

Usage: python -I tools/make-icons.py   (needs Pillow)
"""
from pathlib import Path
from PIL import Image, ImageDraw

S = 512
out = Path(__file__).resolve().parent.parent / 'extension' / 'icons'
out.mkdir(parents=True, exist_ok=True)

img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
# Card: the theme's --wt-bg-elev with a faint lighter top edge.
d.rounded_rectangle((0, 0, S - 1, S - 1), radius=112, fill=(34, 38, 43, 255))
d.rounded_rectangle((6, 6, S - 7, S - 7), radius=106, outline=(255, 255, 255, 22), width=6)
# Crescent: a green disc with a card-coloured disc cut out of its upper right.
moon = Image.new('L', (S, S), 0)
m = ImageDraw.Draw(moon)
m.ellipse((96, 96, 416, 416), fill=255)
m.ellipse((196, 52, 486, 342), fill=0)
green = Image.new('RGBA', (S, S), (0, 213, 100, 255))
img.paste(green, (0, 0), moon)
# A small star beside it (the night-reading hint).
d.ellipse((350, 128, 390, 168), fill=(234, 255, 242, 255))

for size in (16, 32, 48, 128):
    img.resize((size, size), Image.LANCZOS).save(out / f'icon-{size}.png')
print('icons written to', out)

# Edge Add-ons wants a 300 x 300 store logo; it's a store image, not part of
# the package, so it goes with the other store images in dist/store/.
store = out.parent.parent / 'dist' / 'store'
store.mkdir(parents=True, exist_ok=True)
img.resize((300, 300), Image.LANCZOS).save(store / 'store-logo-300.png')
print('store logo written to', store / 'store-logo-300.png')
