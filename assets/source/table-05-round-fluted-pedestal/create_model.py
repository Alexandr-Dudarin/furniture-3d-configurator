"""Blender 4.x: восстановление редактируемой сцены из канонических mesh-данных.

blender --background --python assets/source/<model-id>/create_model.py
Скрипт создаёт .blend и отдельный GLB для последующей сверки с production.
"""
import json
import math
from pathlib import Path
import bpy
from mathutils import Matrix, Quaternion, Vector

SOURCE = Path(__file__).resolve().parent
DATA = json.loads((SOURCE / 'mesh-source.json').read_text(encoding='utf-8'))
SPEC = DATA['spec']
# Three.js Y-up -> Blender Z-up: (x, y, z) -> (x, -z, y).
BASIS = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
materials = {}
for entry in DATA['materials']:
    mat = bpy.data.materials.new(entry['name'])
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = entry['color']
    bsdf.inputs['Metallic'].default_value = entry['metalness']
    bsdf.inputs['Roughness'].default_value = entry['roughness']
    for key, value in entry.get('extras', {}).items():
        mat[key] = value
    if entry['textured']:
        for filename, input_name, colorspace in [
            ('base-color.jpg', 'Base Color', 'sRGB'),
            ('roughness.jpg', 'Roughness', 'Non-Color'),
            ('normal-gl.jpg', 'Normal', 'Non-Color'),
        ]:
            tex = mat.node_tree.nodes.new('ShaderNodeTexImage')
            tex.image = bpy.data.images.load(str(SOURCE / 'textures' / filename), check_existing=True)
            tex.image.colorspace_settings.name = colorspace
            tex.image.pack()
            tex.extension = 'REPEAT'
            if input_name == 'Normal':
                normal = mat.node_tree.nodes.new('ShaderNodeNormalMap')
                normal.inputs['Strength'].default_value = entry['normalScale']
                mat.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
                mat.node_tree.links.new(normal.outputs['Normal'], bsdf.inputs['Normal'])
            else:
                mat.node_tree.links.new(tex.outputs['Color'], bsdf.inputs[input_name])
    materials[entry['name']] = mat

objects = {}
for entry in DATA['nodes']:
    vertices, faces, normals, uvs, material_indices = [], [], [], [], []
    mesh_materials = []
    for primitive in entry['primitives']:
        attrs = primitive['attributes']
        start = len(vertices)
        positions = attrs['position']
        vertices.extend(tuple(BASIS @ Vector(positions[i:i+3])) for i in range(0, len(positions), 3))
        ns = attrs['normal']
        normals.extend(tuple(BASIS @ Vector(ns[i:i+3])) for i in range(0, len(ns), 3))
        # glTF использует верхнее начало изображения. Blender exporter снова перевернёт V.
        uv = attrs.get('uv')
        uvs.extend((uv[i], 1 - uv[i+1]) for i in range(0, len(uv), 2)) if uv else uvs.extend([(0, 0)] * (len(positions)//3))
        idx = primitive['indices']
        faces.extend(tuple(start+j for j in idx[i:i+3]) for i in range(0, len(idx), 3))
        material_indices.extend([len(mesh_materials)] * (len(idx)//3))
        mesh_materials.append(materials[primitive['material']])
    if vertices:
        mesh = bpy.data.meshes.new(entry['name'] + '_Mesh')
        mesh.from_pydata(vertices, [], faces)
        mesh.update()
        for mat in mesh_materials:
            mesh.materials.append(mat)
        for polygon, index in zip(mesh.polygons, material_indices):
            polygon.material_index = index
            polygon.use_smooth = True
        uv_layer = mesh.uv_layers.new(name='UVMap')
        for loop in mesh.loops:
            uv_layer.data[loop.index].uv = uvs[loop.vertex_index]
        mesh.normals_split_custom_set_from_vertices(normals)
        obj = bpy.data.objects.new(entry['name'], mesh)
    else:
        obj = bpy.data.objects.new(entry['name'], None)
    scene.collection.objects.link(obj)
    if entry['parent']:
        obj.parent = objects[entry['parent']]
    obj.location = BASIS @ Vector(entry['translation'])
    q = entry['rotation']
    gltf_rotation = Quaternion((q[3], q[0], q[1], q[2])).to_matrix()
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = (BASIS @ gltf_rotation @ BASIS.transposed()).to_quaternion()
    for key, value in entry['extras'].items():
        obj[key] = value
    objects[entry['name']] = obj

root = objects['Furniture_Root']
bpy.context.view_layer.update()
mesh_objects = [o for o in objects.values() if o.type == 'MESH']
points = [o.matrix_world @ Vector(c) for o in mesh_objects for c in o.bound_box]
size = [max(v[a] for v in points) - min(v[a] for v in points) for a in range(3)]
for actual, expected in zip(size, [SPEC['diameter'], SPEC['diameter'], SPEC['height']]):
    assert abs(actual - expected) < 0.00001, (size, expected)
assert abs(min(v.z for v in points)) < 0.00001
bpy.ops.wm.save_as_mainfile(filepath=str(SOURCE / (SPEC['id'] + '.blend')))
# Отдельный экспорт не перезаписывает production GLB до ручной проверки.
bpy.ops.export_scene.gltf(
    filepath=str(SOURCE / (SPEC['id'] + '-blender-check.glb')),
    export_format='GLB', export_yup=True, export_apply=False,
    export_texcoords=True, export_normals=True, export_tangents=True,
    export_materials='EXPORT', export_extras=True, export_cameras=False,
    export_lights=False, export_animations=False,
)
print('Created editable .blend and Blender-check GLB:', SPEC['id'])
