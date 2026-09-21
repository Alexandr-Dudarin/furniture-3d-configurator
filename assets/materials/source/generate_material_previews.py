"""Small selection-card images. Never changes production PBR maps.
Run from any directory: python assets/materials/source/generate_material_previews.py
Requires Pillow, like the existing material generation scripts.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
MATERIALS = ROOT / 'public/materials'
OUTPUT = MATERIALS / 'previews'
SIZE = 192  # Enough for current cards at 2x display density.


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for category in ('wood', 'stone'):
        for source in sorted((MATERIALS / category).glob('*/base-color.jpg')):
            with Image.open(source) as original:
                preview = original.convert('RGB')
                preview.thumbnail((SIZE, SIZE), Image.Resampling.LANCZOS)
                target = OUTPUT / f'{source.parent.name}.webp'
                preview.save(target, 'WEBP', quality=88, method=6, icc_profile=original.info.get('icc_profile', b''))
                print(f'{target.relative_to(ROOT)}: {target.stat().st_size} bytes')


if __name__ == '__main__':
    main()
