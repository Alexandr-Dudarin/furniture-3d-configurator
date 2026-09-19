"""Create the editable Table 02 U-frame source and export its production GLB.

Run with Blender 4.x:

    blender --background --python create_table_02_u_frame.py

The script writes table-02-u-frame.blend beside itself and exports the GLB to
public/models/table-02-u-frame.glb relative to the project root.
"""

from pathlib import Path

import bpy


MODEL_ID = "table-02-u-frame"
TABLETOP_TEXTURE_METERS = 1.0
TOP_SURFACE_NAMES = ("Top_Primary", "Top_Bottom", "Top_Edge_Long", "Top_Edge_Short")

BASE_LENGTH = 0.95
BASE_WIDTH = 0.55
TOTAL_HEIGHT = 0.75
TOP_THICKNESS = 0.015
TUBE_SIZE = 0.025
END_OVERHANG = 0.025
SIDE_OVERHANG = 0.020
TOP_BEVEL = 0.0015
FRAME_BEVEL = 0.0012

TOP_UNDERSIDE = TOTAL_HEIGHT - TOP_THICKNESS
FRAME_X = BASE_LENGTH / 2 - END_OVERHANG - TUBE_SIZE / 2
POST_Z = BASE_WIDTH / 2 - SIDE_OVERHANG - TUBE_SIZE / 2
RAIL_LENGTH = POST_Z * 2 + TUBE_SIZE
POST_LENGTH = TOP_UNDERSIDE - TUBE_SIZE
POST_Y = TUBE_SIZE + POST_LENGTH / 2
RAIL_Y = TUBE_SIZE / 2
TOP_Y = TOTAL_HEIGHT - TOP_THICKNESS / 2

SOURCE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SOURCE_DIR.parents[2]
TEXTURE_DIR = SOURCE_DIR / "textures"
BLEND_PATH = SOURCE_DIR / f"{MODEL_ID}.blend"
GLB_PATH = PROJECT_ROOT / "public" / "models" / f"{MODEL_ID}.glb"


def gltf_location(x, y, z):
    """Координаты проекта Y-up переводятся в Blender Z-up."""
    return (x, -z, y)


def reset_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    for datablocks in (
        bpy.data.meshes,
        bpy.data.curves,
        bpy.data.cameras,
        bpy.data.lights,
        bpy.data.materials,
        bpy.data.images,
    ):
        for datablock in list(datablocks):
            datablocks.remove(datablock)


def create_empty(name, parent=None, location=(0.0, 0.0, 0.0)):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = "PLAIN_AXES"
    empty.empty_display_size = 0.08
    bpy.context.scene.collection.objects.link(empty)
    empty.parent = parent
    empty.location = gltf_location(*location)
    return empty


def create_box(
    name,
    dimensions,
    location,
    material,
    bevel,
    parent,
):
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.0, 0.0, 0.0))
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f"{name}_Mesh"
    obj.dimensions = (dimensions[0], dimensions[2], dimensions[1])

    bpy.ops.object.transform_apply(
        location=False,
        rotation=False,
        scale=True,
    )

    modifier = obj.modifiers.new(name="EdgeBevel", type="BEVEL")
    modifier.width = bevel
    modifier.segments = 3
    modifier.limit_method = "ANGLE"
    modifier.angle_limit = 0.785398

    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)

    obj.data.materials.append(material)
    obj.parent = parent
    obj.location = gltf_location(*location)

    for polygon in obj.data.polygons:
        polygon.use_smooth = False

    return obj


def assign_tabletop_surfaces_and_uv(obj, template):
    """Разделяем верх/низ/торцы для независимой компенсации размеров."""
    obj.data.materials.clear()
    for index, name in enumerate(TOP_SURFACE_NAMES):
        material = template if index == 0 else template.copy()
        material.name = name
        material["replaceableFinishGroup"] = "PrimaryTop"
        obj.data.materials.append(material)
    obj["semanticSurfaces"] = TOP_SURFACE_NAMES
    obj["tabletopUvMeters"] = TABLETOP_TEXTURE_METERS
    layer = obj.data.uv_layers.active or obj.data.uv_layers.new(name="UVMap")
    for polygon in obj.data.polygons:
        normal = polygon.normal
        if normal.z > 0.9995:
            surface = 0
        elif normal.z < -0.9995:
            surface = 1
        else:
            surface = 2 if abs(normal.y) >= abs(normal.x) else 3
        polygon.material_index = surface
        for loop_index in polygon.loop_indices:
            vertex = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            x, y, z = vertex.x, vertex.z, -vertex.y
            if surface == 0:
                uv = (x + 0.5, z + 0.5)
            elif surface == 1:
                uv = (x + 0.5, 0.5 - z)
            elif surface == 2:
                uv = (x + 0.5, y + 0.5)
            else:
                uv = (z + 0.5, y + 0.5)
            layer.data[loop_index].uv = uv


def create_top_material():
    material = bpy.data.materials.new("Top_Primary")
    material.use_nodes = True
    material["replaceableFinishGroup"] = "PrimaryTop"
    material["previewFinish"] = "light-concrete"

    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (650, 0)

    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.location = (350, 0)
    shader.inputs["Metallic"].default_value = 0.0
    shader.inputs["Roughness"].default_value = 0.82

    albedo = create_image_node(
        nodes,
        "Top Albedo",
        TEXTURE_DIR / "top-primary-albedo.png",
        (-650, 180),
        "sRGB",
    )

    normal = create_image_node(
        nodes,
        "Top Normal",
        TEXTURE_DIR / "top-primary-normal.png",
        (-650, -140),
        "Non-Color",
    )

    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.location = (80, -140)
    normal_map.inputs["Strength"].default_value = 0.35

    links.new(albedo.outputs["Color"], shader.inputs["Base Color"])
    links.new(normal.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], shader.inputs["Normal"])
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])

    return material


def create_image_node(nodes, name, image_path, location, color_space):
    if not image_path.exists():
        raise FileNotFoundError(f"Missing texture: {image_path}")

    node = nodes.new("ShaderNodeTexImage")
    node.name = name
    node.label = name
    node.location = location
    node.image = bpy.data.images.load(str(image_path), check_existing=True)
    node.image.colorspace_settings.name = color_space
    node.extension = "REPEAT"
    node.interpolation = "Linear"
    return node


def create_powder_coated_material(name, rgba, roughness):
    material = bpy.data.materials.new(name)
    material.use_nodes = True

    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = rgba
    shader.inputs["Metallic"].default_value = 0.04
    shader.inputs["Roughness"].default_value = roughness

    return material


def add_behavior_metadata(obj, behavior, **metadata):
    obj["runtimeBehavior"] = behavior
    for key, value in metadata.items():
        obj[key] = value


def build_model():
    reset_scene()

    top_material = create_top_material()
    metal_material = create_powder_coated_material(
        "Metal_Frame",
        (0.012, 0.014, 0.017, 1.0),
        0.29,
    )
    metal_material["replaceableFinishGroup"] = "FrameMetal"
    metal_material["previewFinish"] = "powder-coated-black"

    white_preview = create_powder_coated_material(
        "Metal_Frame_White_Preview",
        (0.78, 0.80, 0.82, 1.0),
        0.31,
    )
    white_preview["replaceableFinishGroup"] = "FrameMetal"
    white_preview["previewOnly"] = True

    root = create_empty("UFrameTable_Root")
    root["modelId"] = MODEL_ID
    root["assetType"] = "constructor-ready"
    root["unit"] = "meter"
    root["frontDirection"] = "+Z"

    top = create_box(
        "TableTop",
        (BASE_LENGTH, TOP_THICKNESS, BASE_WIDTH),
        (0.0, TOP_Y, 0.0),
        top_material,
        TOP_BEVEL,
        root,
    )
    add_behavior_metadata(
        top,
        "scale",
        lengthLocalAxis="x",
        widthLocalAxis="z",
    )

    assign_tabletop_surfaces_and_uv(top, top_material)

    create_frame(root, "Left", -FRAME_X, -0.5, metal_material)
    create_frame(root, "Right", FRAME_X, 0.5, metal_material)

    bpy.context.view_layer.objects.active = root
    root.select_set(True)

    return root


def create_frame(root, side, x, movement_factor, material):
    frame = create_empty(f"Frame_{side}", parent=root, location=(x, 0.0, 0.0))
    add_behavior_metadata(
        frame,
        "delta-move",
        dimension="length",
        localAxis="x",
        factor=movement_factor,
    )

    for position_name, z in (("Front", POST_Z), ("Back", -POST_Z)):
        post = create_box(
            f"Frame_{side}_Post_{position_name}",
            (TUBE_SIZE, POST_LENGTH, TUBE_SIZE),
            (0.0, POST_Y, z),
            material,
            FRAME_BEVEL,
            frame,
        )
        add_behavior_metadata(
            post,
            "edge-anchor",
            dimension="width",
            localAxis="z",
        )

    rail = create_box(
        f"Frame_{side}_BottomRail",
        (TUBE_SIZE, TUBE_SIZE, RAIL_LENGTH),
        (0.0, RAIL_Y, 0.0),
        material,
        FRAME_BEVEL,
        frame,
    )
    add_behavior_metadata(
        rail,
        "stretch-segment",
        dimension="width",
        localAxis="z",
        baseLength=RAIL_LENGTH,
    )


def save_and_export():
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    GLB_PATH.parent.mkdir(parents=True, exist_ok=True)

    bpy.ops.wm.save_as_mainfile(filepath=str(BLEND_PATH))

    bpy.ops.export_scene.gltf(
        filepath=str(GLB_PATH),
        export_format="GLB",
        use_selection=False,
        export_yup=True,
        export_apply=True,
        export_texcoords=True,
        export_normals=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_extras=True,
    )

    print(f"Saved Blender source: {BLEND_PATH}")
    print(f"Exported production GLB: {GLB_PATH}")


if __name__ == "__main__":
    build_model()
    save_and_export()
