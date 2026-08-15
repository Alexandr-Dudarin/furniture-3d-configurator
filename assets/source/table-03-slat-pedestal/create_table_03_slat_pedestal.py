"""Create the editable Blender source and production GLB for table-03-slat-pedestal.

Run from the project root with Blender 4.x:

    blender --background --python assets/source/table-03-slat-pedestal/create_table_03_slat_pedestal.py

The Blender scene is Z-up. Helpers map the project contract (X right, Y up,
Z front) to Blender coordinates before glTF export.
"""

from pathlib import Path

import bpy


MODEL_ID = "table-03-slat-pedestal"
SOURCE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SOURCE_DIR.parents[2]
TEXTURE_DIR = SOURCE_DIR / "textures"
BLEND_PATH = SOURCE_DIR / f"{MODEL_ID}.blend"
GLB_PATH = PROJECT_ROOT / "public" / "models" / f"{MODEL_ID}.glb"


def gltf_location(x, y, z):
    return (x, -z, y)


def gltf_dimensions(x, y, z):
    return (x, z, y)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for datablocks in (
        bpy.data.meshes,
        bpy.data.cameras,
        bpy.data.lights,
        bpy.data.materials,
        bpy.data.images,
    ):
        for datablock in list(datablocks):
            datablocks.remove(datablock)


def create_empty(name, parent=None):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "PLAIN_AXES"
    empty.empty_display_size = 0.08
    bpy.context.scene.collection.objects.link(empty)
    empty.parent = parent
    return empty


def create_box(name, dimensions, location, material, bevel, parent):
    bpy.ops.mesh.primitive_cube_add(size=1.0)
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f"{name}_Mesh"
    obj.dimensions = gltf_dimensions(*dimensions)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)

    if bevel > 0:
        modifier = obj.modifiers.new(name="EdgeBevel", type="BEVEL")
        modifier.width = bevel
        modifier.segments = 3
        modifier.limit_method = "ANGLE"
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)

    obj.location = gltf_location(*location)
    obj.parent = parent
    obj.data.materials.append(material)

    for polygon in obj.data.polygons:
        polygon.use_smooth = False

    return obj


def create_pbr_material(name, albedo, normal, metallic_roughness, group, preview):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    if group:
        material["replaceableFinishGroup"] = group
    material["previewFinish"] = preview
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Metallic"].default_value = 0.0
    shader.inputs["Roughness"].default_value = 1.0

    albedo_node = image_node(nodes, albedo, "sRGB")
    normal_node = image_node(nodes, normal, "Non-Color")
    mr_node = image_node(nodes, metallic_roughness, "Non-Color")
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.45

    links.new(albedo_node.outputs["Color"], shader.inputs["Base Color"])
    links.new(normal_node.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], shader.inputs["Normal"])
    links.new(mr_node.outputs["Color"], shader.inputs["Roughness"])
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def image_node(nodes, filename, color_space):
    image = bpy.data.images.load(str(TEXTURE_DIR / filename), check_existing=True)
    image.colorspace_settings.name = color_space
    node = nodes.new("ShaderNodeTexImage")
    node.image = image
    node.extension = "REPEAT"
    return node


def create_dark_material():
    material = bpy.data.materials.new("Dark_Pedestal")
    material.use_nodes = True
    material["previewFinish"] = "charcoal-black"
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (0.035, 0.041, 0.045, 1)
    shader.inputs["Metallic"].default_value = 0.02
    shader.inputs["Roughness"].default_value = 0.34
    return material


def fixed(obj):
    obj["runtimeBehavior"] = "fixed"
    return obj


def assign_tabletop_surfaces_and_uv(obj, materials, length, width, thickness):
    """Split one beveled tabletop Mesh by semantic surface role.

    The 4 mm rounded transition is divided between long and short edge
    materials by dominant horizontal normal. It therefore needs no extra
    corner material target or independent runtime texture rule.
    """

    obj.data.materials.clear()
    for material in materials:
        obj.data.materials.append(material)

    uv_layer = obj.data.uv_layers.active
    if uv_layer is None:
        uv_layer = obj.data.uv_layers.new(name="UVMap")

    for polygon in obj.data.polygons:
        normal = polygon.normal
        if normal.z > 0.9995:
            material_index = 0
        elif normal.z < -0.9995:
            material_index = 1
        elif abs(normal.y) >= abs(normal.x):
            material_index = 2
        else:
            material_index = 3

        polygon.material_index = material_index

        for loop_index in polygon.loop_indices:
            vertex = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            if material_index == 0:
                uv = (vertex.x / length + 0.5, -vertex.y / width + 0.5)
            elif material_index == 1:
                uv = (vertex.x / length + 0.5, vertex.y / width + 0.5)
            elif material_index == 2:
                uv = (vertex.x / length + 0.5, vertex.z / thickness + 0.5)
            else:
                uv = (-vertex.y / width + 0.5, vertex.z / thickness + 0.5)

            uv_layer.data[loop_index].uv = uv


def build_model():
    reset_scene()

    for filename in (
        "oak-albedo.png",
        "oak-normal.png",
        "oak-metallic-roughness.png",
    ):
        if not (TEXTURE_DIR / filename).exists():
            raise FileNotFoundError(
                f"Missing texture {filename}. Run generate_textures.py first."
            )

    wood_args = (
        "oak-albedo.png",
        "oak-normal.png",
        "oak-metallic-roughness.png",
        "PrimaryTop",
        "natural-oak",
    )
    top_materials = (
        create_pbr_material("Wood_Top", *wood_args),
        create_pbr_material("Wood_Bottom", *wood_args),
        create_pbr_material("Wood_Edge_Long", *wood_args),
        create_pbr_material("Wood_Edge_Short", *wood_args),
    )
    pedestal_wood_args = (*wood_args[:3], "PedestalWood", wood_args[4])
    slat_material = create_pbr_material("Wood_Slats", *pedestal_wood_args)
    plinth_material = create_pbr_material("Wood_Plinth", *pedestal_wood_args)
    dark_material = create_dark_material()

    root = create_empty("SlatPedestalTable_Root")
    root["modelId"] = MODEL_ID
    root["assetType"] = "constructor-ready"
    root["unit"] = "meter"
    root["frontDirection"] = "+Z"

    top = create_box(
        "TableTop",
        (1.2, 0.022, 0.75),
        (0, 0.739, 0),
        top_materials[0],
        0.004,
        root,
    )
    top["runtimeBehavior"] = "scale"
    top["lengthLocalAxis"] = "x"
    top["widthLocalAxis"] = "z"
    top["semanticSurfaces"] = (
        "Wood_Top",
        "Wood_Bottom",
        "Wood_Edge_Long",
        "Wood_Edge_Short",
    )
    assign_tabletop_surfaces_and_uv(
        top,
        top_materials,
        1.2,
        0.75,
        0.022,
    )

    fixed(create_box("Base_Plinth", (0.62, 0.035, 0.46), (0, 0.0175, 0), plinth_material, 0.012, root))
    fixed(create_box("Pedestal_Core", (0.37, 0.675, 0.34), (0, 0.3785, 0), dark_material, 0.006, root))
    fixed(create_box("Pedestal_TopPlate", (0.48, 0.018, 0.40), (0, 0.719, 0), dark_material, 0.004, root))

    slat_xs = (-0.144, -0.096, -0.048, 0, 0.048, 0.096, 0.144)
    for side_name, z in (("Front", 0.181), ("Back", -0.181)):
        group = fixed(create_empty(f"Pedestal_Slats_{side_name}", root))
        for index, x in enumerate(slat_xs, start=1):
            fixed(create_box(
                f"Slat_{side_name}_{index:02d}",
                (0.024, 0.63, 0.022),
                (x, 0.388, z),
                slat_material,
                0.003,
                group,
            ))

    return root


def save_and_export():
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))
    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )


if __name__ == "__main__":
    build_model()
    save_and_export()
