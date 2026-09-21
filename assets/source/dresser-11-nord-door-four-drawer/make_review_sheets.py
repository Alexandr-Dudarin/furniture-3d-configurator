"""Compose deterministic review sheets and verify visual return from rendered GLB states."""
import json
from pathlib import Path
import numpy as np
from PIL import Image

SOURCE = Path(__file__).resolve().parent
PREVIEWS = SOURCE/'previews'
base = Image.open(PREVIEWS/'base.png').convert('RGB')
returned = Image.open(PREVIEWS/'return-base.png').convert('RGB')
# Only the header's state name differs. Body, floor and dimension caption must match.
a = np.asarray(base)[88:]
b = np.asarray(returned)[88:]
assert a.shape == b.shape
different = int(np.any(a != b, axis=-1).sum())
report = {'status': 'PASS' if different == 0 else 'FAIL',
          'comparedPixels': int(a.shape[0]*a.shape[1]), 'differentPixels': different,
          'scope': 'Actual CPU GLB raster: model, floor and size caption; header excluded'}
(SOURCE/'visual-return-verification.json').write_text(json.dumps(report, indent=2)+'\n')
assert different == 0, report

def sheet(names, filename):
    cell_width = 800
    cell_height = round(base.height*cell_width/base.width)
    canvas = Image.new('RGB', (cell_width*2, cell_height*2), (244, 242, 237))
    for i, name in enumerate(names):
        im = Image.open(PREVIEWS/f'{name}.png').convert('RGB').resize((cell_width, cell_height), Image.Resampling.LANCZOS)
        canvas.paste(im, (i % 2*cell_width, i // 2*cell_height))
    canvas.save(PREVIEWS/filename)

sheet(['base', 'open-base', 'max', 'materials-base'], 'overview.png')
sheet(['min', 'intermediate', 'max', 'return-base'], 'size-comparison.png')
print(json.dumps(report))
