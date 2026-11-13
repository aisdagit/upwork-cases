"""Usage: python3 build_pdf.py SHOTS_DIR OUT.pdf "Title" """
import glob, json, sys
from PIL import Image
from reportlab.pdfgen import canvas
shots, out, title = sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 'Business Proposal by SDA'
W, H = 960, 540; k = W / 1280
links = json.load(open(f'{shots}/links.json'))
c = canvas.Canvas(out, pagesize=(W, H)); c.setTitle(title)
for i, f in enumerate(sorted(glob.glob(f'{shots}/s*.png'))):
    j = f.replace('.png', '.jpg'); Image.open(f).convert('RGB').save(j, quality=90)
    c.drawImage(j, 0, 0, W, H)
    for l in links:
        if l['page'] == i:
            c.linkURL(l['href'], (l['x']*k, H-(l['y']+l['h'])*k, (l['x']+l['w'])*k, H-l['y']*k), relative=0)
    c.showPage()
c.save()
print('saved', out)
