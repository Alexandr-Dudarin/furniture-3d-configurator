"""Извлекает самостоятельные основания из GLB 01–05 без изменения геометрии.
Запуск из корня проекта: python assets/source/table-modules/extract_bases.py
Только стандартная библиотека Python; исходные GLB остаются неизменными.
"""
from pathlib import Path
import copy
import json
import struct

ROOT = Path(__file__).resolve().parents[3]


def extract(source, target, attachment_height, excluded_nodes=('TableTop',)):
    raw = (ROOT / source).read_bytes()
    json_size = struct.unpack_from('<I', raw, 12)[0]
    doc = json.loads(raw[20:20 + json_size])
    assert set(excluded_nodes) <= {node.get('name') for node in doc['nodes']}, 'Не найдены все части столешницы'
    binary = raw[28 + json_size:]
    assert not doc.get('extensionsUsed'), 'Расширения требуют отдельного экспортера'
    result = {'asset': {'version': '2.0', 'generator': 'Furniture Configurator module extractor v2'},
              'scene': 0, 'scenes': [{'nodes': [0]}]}
    maps = {key: {} for key in ['nodes', 'meshes', 'materials', 'accessors', 'bufferViews', 'textures', 'images', 'samplers']}
    output = bytearray()

    def take(kind, old_index):
        if old_index in maps[kind]:
            return maps[kind][old_index]
        value = copy.deepcopy(doc[kind][old_index])
        new_index = len(result.setdefault(kind, []))
        maps[kind][old_index] = new_index
        result[kind].append(value)
        if kind == 'nodes':
            if 'mesh' in value: value['mesh'] = take('meshes', value['mesh'])
            children = [i for i in value.get('children', []) if doc['nodes'][i].get('name') not in excluded_nodes]
            if children: value['children'] = [take('nodes', i) for i in children]
            else: value.pop('children', None)
        elif kind == 'meshes':
            for primitive in value['primitives']:
                assert 'targets' not in primitive
                primitive['attributes'] = {key: take('accessors', index) for key, index in primitive['attributes'].items()}
                if 'indices' in primitive: primitive['indices'] = take('accessors', primitive['indices'])
                if 'material' in primitive: primitive['material'] = take('materials', primitive['material'])
        elif kind == 'accessors':
            assert 'sparse' not in value
            if 'bufferView' in value: value['bufferView'] = take('bufferViews', value['bufferView'])
        elif kind == 'bufferViews':
            assert value['buffer'] == 0
            while len(output) % 4: output.append(0)
            start = value.get('byteOffset', 0)
            chunk = binary[start:start + value['byteLength']]
            value['byteOffset'] = len(output)
            output.extend(chunk)
        elif kind == 'materials':
            def walk(item):
                for key, entry in item.items():
                    if key.endswith('Texture') and isinstance(entry, dict) and 'index' in entry:
                        entry['index'] = take('textures', entry['index'])
                    elif isinstance(entry, dict): walk(entry)
            walk(value)
        elif kind == 'textures':
            value['source'] = take('images', value['source'])
            if 'sampler' in value: value['sampler'] = take('samplers', value['sampler'])
        elif kind == 'images':
            assert 'uri' not in value
            value['bufferView'] = take('bufferViews', value['bufferView'])
        return new_index

    roots = doc['scenes'][doc.get('scene', 0)]['nodes']
    assert len(roots) == 1
    assert take('nodes', roots[0]) == 0
    result['nodes'][0]['name'] = 'Base_Root'
    anchor = len(result['nodes'])
    result['nodes'].append({'name': 'Attachment_Tabletop', 'translation': [0, attachment_height, 0]})
    result['nodes'][0].setdefault('children', []).append(anchor)
    result['extras'] = {'sourceAsset': source, 'moduleKind': 'table-base', 'contractVersion': 1}
    while len(output) % 4: output.append(0)
    result['buffers'] = [{'byteLength': len(output)}]
    data = json.dumps(result, ensure_ascii=True, separators=(',', ':')).encode()
    data += b' ' * (-len(data) % 4)
    glb = struct.pack('<III', 0x46546C67, 2, 28 + len(data) + len(output))
    glb += struct.pack('<II', len(data), 0x4E4F534A) + data
    glb += struct.pack('<II', len(output), 0x004E4942) + output
    dest = ROOT / target
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(glb)
    print(target, len(glb), 'bytes')


if __name__ == '__main__':
    extract('public/models/first-table.glb', 'public/modules/bases/four-legs.glb', 0.71)
    extract('public/models/table-03-slat-pedestal.glb', 'public/modules/bases/slat-pedestal.glb', 0.728)
    extract('public/models/table-05-round-fluted-pedestal.glb', 'public/modules/bases/round-fluted.glb', 0.738)
    extract('public/models/table-02-u-frame.glb', 'public/modules/bases/u-frame.glb', 0.735)
    extract('public/models/table-04-v-pedestal.glb', 'public/modules/bases/v-pedestal.glb', 0.743, (
        'Top_Center', 'Top_Edge_Front', 'Top_Edge_Back', 'Top_Edge_Left', 'Top_Edge_Right',
        'Top_Corner_FrontLeft', 'Top_Corner_FrontRight', 'Top_Corner_BackLeft', 'Top_Corner_BackRight',
    ))
