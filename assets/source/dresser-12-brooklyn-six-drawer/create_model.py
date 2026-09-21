"""Восстановление редактируемой сцены в Blender 4.x из канонической геометрии.

blender --background --python assets/source/<model-id>/create_model.py
Создаёт настоящий .blend, отдельный контрольный GLB и реимпортирует контрольный GLB.
В среде создания пакета Blender отсутствует; здесь выполнена только проверка синтаксиса.
"""
import json
from pathlib import Path
import bpy
from mathutils import Matrix, Quaternion, Vector

SOURCE = Path(__file__).resolve().parent
DATA = json.loads((SOURCE / 'mesh-source.json').read_text(encoding='utf-8'))
SPEC = DATA['spec']
BASIS = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1


def properties(block, values):
    for key, value in values.items():
        if value is None:
            continue
        block[key] = json.dumps(value, ensure_ascii=False) if isinstance(value, dict) else value


materials = {}
for entry in DATA['materials']:
    mat = bpy.data.materials.new(entry['name'])
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = entry['color']
    bsdf.inputs['Metallic'].default_value = entry['metalness']
    bsdf.inputs['Roughness'].default_value = entry['roughness']
    properties(mat, entry.get('extras', {}))
    if entry['textured']:
        for filename, target, space in [
            (entry['textureFiles']['color'], 'Base Color', 'sRGB'),
            (entry['textureFiles']['roughness'], 'Roughness', 'Non-Color'),
            (entry['textureFiles']['normal'], 'Normal', 'Non-Color'),
        ]:
            tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
            tex.image = bpy.data.images.load(str(SOURCE/'textures'/filename), check_existing=True)
            tex.image.colorspace_settings.name = space
            tex.image.pack()
            tex.extension = 'REPEAT'
            if target == 'Base Color':
                multiply = mat.node_tree.nodes.new('ShaderNodeMixRGB')
                multiply.blend_type = 'MULTIPLY'
                multiply.inputs[0].default_value = 1
                multiply.inputs[2].default_value = entry['color']
                mat.node_tree.links.new(tex.outputs['Color'], multiply.inputs[1])
                mat.node_tree.links.new(multiply.outputs['Color'], bsdf.inputs[target])
            elif target == 'Roughness':
                multiply = mat.node_tree.nodes.new('ShaderNodeMath')
                multiply.operation = 'MULTIPLY'
                multiply.inputs[1].default_value = entry['roughness']
                mat.node_tree.links.new(tex.outputs['Color'], multiply.inputs[0])
                mat.node_tree.links.new(multiply.outputs[0], bsdf.inputs[target])
            else:
                normal = mat.node_tree.nodes.new('ShaderNodeNormalMap')
                normal.inputs['Strength'].default_value = entry['normalScale']
                mat.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
                mat.node_tree.links.new(normal.outputs['Normal'], bsdf.inputs[target])
    materials[entry['name']] = mat

objects = {}
for entry in DATA['nodes']:
    vertices, normals, uvs, faces, material_indices, mesh_materials = [], [], [], [], [], []
    for primitive in entry['primitives']:
        attrs = primitive['attributes']
        start = len(vertices)
        p, ns = attrs['position'], attrs['normal']
        vertices.extend(tuple(BASIS @ Vector(p[i:i+3])) for i in range(0, len(p), 3))
        normals.extend(tuple(BASIS @ Vector(ns[i:i+3])) for i in range(0, len(ns), 3))
        uv = attrs.get('uv')
        if uv:
            uvs.extend((uv[i], 1-uv[i+1]) for i in range(0, len(uv), 2))
        else:
            uvs.extend([(0, 0)] * (len(p)//3))
        idx = primitive['indices']
        faces.extend(tuple(start+j for j in idx[i:i+3]) for i in range(0, len(idx), 3))
        material_indices.extend([len(mesh_materials)] * (len(idx)//3))
        mesh_materials.append(materials[primitive['material']])
    if vertices:
        mesh = bpy.data.meshes.new(entry['name']+'_Mesh')
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        for mat in mesh_materials:
            mesh.materials.append(mat)
        for poly, index in zip(mesh.polygons, material_indices):
            poly.material_index = index
            poly.use_smooth = True
        uv_layer = mesh.uv_layers.new(name='UVMap')
        for loop in mesh.loops:
            uv_layer.data[loop.index].uv = uvs[loop.vertex_index]
        mesh.normals_split_custom_set_from_vertices(normals)
        obj = bpy.data.objects.new(entry['name'], mesh)
    else:
        obj = bpy.data.objects.new(entry['name'], None)
        obj.empty_display_type = 'PLAIN_AXES'
        obj.empty_display_size = .025
    scene.collection.objects.link(obj)
    if entry['parent']:
        obj.parent = objects[entry['parent']]
    obj.location = BASIS @ Vector(entry['translation'])
    q = entry['rotation']
    rotation = Quaternion((q[3], q[0], q[1], q[2])).to_matrix()
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = (BASIS @ rotation @ BASIS.transposed()).to_quaternion()
    properties(obj, entry['extras'])
    objects[entry['name']] = obj

for filename in ['model-spec.json', 'model-contract.json']:
    text = bpy.data.texts.new(filename)
    text.write((SOURCE/filename).read_text(encoding='utf-8'))


def verify_geometry():
    bpy.context.view_layer.update()
    meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    points = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
    lower = [min(v[a] for v in points) for a in range(3)]
    upper = [max(v[a] for v in points) for a in range(3)]
    size = [upper[a]-lower[a] for a in range(3)]
    expected = [SPEC['base']['width'], SPEC['base']['depth'], SPEC['base']['height']]
    for actual, desired in zip(size, expected):
        assert abs(actual-desired) < .00001, (size, expected)
    assert abs(lower[2]) < .00001, lower
    return {'size_blender_xyz': size, 'floor_z': lower[2], 'meshes': len(meshes)}


before = verify_geometry()
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE/(SPEC['id']+'.blend')))
check_glb = SOURCE/(SPEC['id']+'-blender-check.glb')
bpy.ops.export_scene.gltf(
    filepath=str(check_glb), export_format='GLB', export_yup=True,
    export_apply=False, export_texcoords=True, export_normals=True,
    export_tangents=True, export_materials='EXPORT', export_extras=True,
    export_cameras=False, export_lights=False, export_animations=False,
)
# Контрольный экспорт не заменяет исходный production GLB автоматически.
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(check_glb))
after = verify_geometry()
missing = [n['name'] for n in DATA['nodes'] if n['name'] not in bpy.data.objects]
assert not missing, missing
report = {'status': 'PASS', 'blender_version': bpy.app.version_string, 'before_export': before, 'after_reimport': after, 'semantic_nodes_preserved': True}
(SOURCE/'blender-verification.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report))
