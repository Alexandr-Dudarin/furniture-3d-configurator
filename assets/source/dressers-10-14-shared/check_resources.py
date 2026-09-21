"""Verify the five GLBs and their existing project-shared image dependencies.

Run from any directory; no third-party Python packages required.
Default: missing/invalid resources fail; changed oak hashes produce a warning.
--strict: also require the exact oak images used to validate this package.
--public-root PATH: check a different public/ or built dist/ directory.
"""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import argparse
import hashlib
import json
import struct
import sys

SOURCE = Path(__file__).resolve().parent
MANIFEST = json.loads((SOURCE / 'shared-texture-dependencies.json').read_text())
MODELS = [
    'dresser-10-white-four-drawer', 'dresser-11-nord-door-four-drawer',
    'dresser-12-brooklyn-six-drawer', 'dresser-13-marvel-fluted',
    'dresser-14-baikal-five-drawer',
]


def read_glb(path):
    raw = path.read_bytes()
    if len(raw) < 28 or struct.unpack_from('<III', raw) != (0x46546c67, 2, len(raw)):
        raise ValueError('Invalid GLB header')
    size, kind = struct.unpack_from('<II', raw, 12)
    if kind != 0x4e4f534a:
        raise ValueError('Missing JSON chunk')
    return json.loads(raw[20:20+size])


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--strict', action='store_true')
    parser.add_argument('--public-root', type=Path, default=SOURCE.parents[2] / 'public')
    args = parser.parse_args()
    root = args.public_root.resolve()
    errors, warnings, models, resources = [], [], [], []
    expected_uris = {item['glbURI'] for item in MANIFEST['files']}
    for model_id in MODELS:
        model = root / 'models' / (model_id + '.glb')
        try:
            doc = read_glb(model)
            external = [image for image in doc.get('images', []) if 'uri' in image]
            expected = expected_uris if model_id in MANIFEST['consumers'] else set()
            if {image['uri'] for image in external} != expected or len(external) != len(expected):
                raise ValueError('Unexpected external image set')
            for image in external:
                uri = urlsplit(image['uri'])
                if uri.scheme or uri.netloc or uri.query or uri.fragment or uri.path.startswith('/'):
                    raise ValueError('Expected a relative local image URI')
                resource = (model.parent / unquote(uri.path)).resolve(strict=True)
                resource.relative_to(root)
                if resource.read_bytes()[:3] != b'\xff\xd8\xff':
                    raise ValueError(f'Invalid JPEG: {image["uri"]}')
                if 'bufferView' in image or image.get('mimeType') != 'image/jpeg':
                    raise ValueError('Invalid external image declaration')
            # Shared grayscale roughness is safe only for nonmetallic wood.
            mr_sources = {i for i, image in enumerate(doc['images']) if image.get('name') == 'wood-mr'}
            mr_textures = {i for i, tex in enumerate(doc['textures']) if tex.get('source') in mr_sources}
            for material in doc['materials']:
                pbr = material.get('pbrMetallicRoughness', {})
                if pbr.get('metallicRoughnessTexture', {}).get('index') in mr_textures:
                    if pbr.get('metallicFactor', 1) != 0:
                        raise ValueError('Wood roughness requires metallicFactor=0')
            models.append({'id': model_id, 'status': 'PASS', 'externalImages': len(external), 'bytes': model.stat().st_size})
        except (OSError, ValueError, KeyError, struct.error) as error:
            errors.append(f'{model_id}: {error}')
    for expected in MANIFEST['files']:
        try:
            path = (root / expected['publicPath']).resolve(strict=True)
            path.relative_to(root)
            raw = path.read_bytes()
            digest = hashlib.sha256(raw).hexdigest()
            same = digest == expected['sha256']
            resources.append({'path': expected['publicPath'], 'bytes': len(raw), 'sha256': digest, 'matchesValidatedVersion': same})
            if not same:
                (errors if args.strict else warnings).append(f'Shared texture differs from validated version: {expected["publicPath"]}')
        except (OSError, ValueError) as error:
            errors.append(f'{expected["publicPath"]}: {error}')
    print(json.dumps({'status': 'FAIL' if errors else 'PASS', 'models': models, 'resources': resources,
                      'warnings': warnings, 'errors': errors}, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == '__main__':
    sys.exit(main())
