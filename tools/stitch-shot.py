# tools/stitch-shot.py — joins the phone frames tools/full-page-shot.js writes (one per screen) into one full-length image.
# Each frame is placed at the scroll position the page REPORTED, not the one asked for, so the last screen (where the page cannot scroll
# a full screen further) lands where it really is instead of repeating the one above it.
#   py tools/stitch-shot.py <frames-dir> <out.jpg>
import json, sys
from PIL import Image
d, out = sys.argv[1], sys.argv[2]
meta = json.load(open(f'{d}/frames.json'))
W, H = meta['width'], meta['height']
canvas = Image.new('RGB', (W, H), (6, 9, 18))
for fr in meta['frames']:
    im = Image.open(fr['file']).convert('RGB')
    if im.width != W: im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    skip = fr['want'] - fr['at']                # rows of this frame already drawn by the one above
    canvas.paste(im.crop((0, skip, W, im.height)), (0, fr['want']))
# a frame that landed off its target (anything but the last, which the page's end may stop short) leaves a seam a row wide — say so
off = [f"{fr['want']}->{fr['at']}" for fr in meta['frames'][:-1] if fr['want'] != fr['at']]
if off: print('SEAMS: frames landed off target:', ', '.join(off))
canvas.save(out, quality=85)
print(f'DONE: {out} - {W}x{H} from {len(meta["frames"])} frames')
