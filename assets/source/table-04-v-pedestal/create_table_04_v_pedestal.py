"""Create the editable Blender source and production GLB for table-04-v-pedestal.

Run from the project root with Blender 4.x:

    blender --background --python assets/source/table-04-v-pedestal/create_table_04_v_pedestal.py
"""

from pathlib import Path
import math

import bpy
from mathutils import Vector


MODEL_ID = "table-04-v-pedestal"
SOURCE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SOURCE_DIR.parents[2]
TEXTURE_DIR = SOURCE_DIR / "textures"
BLEND_PATH = SOURCE_DIR / f"{MODEL_ID}.blend"
GLB_PATH = PROJECT_ROOT / "public" / "models" / f"{MODEL_ID}.glb"

# Fixed-height support endpoints are embedded into both mounting plates so the
# bevel cannot expose a light gap. No runtime fit behavior is required.
LOWER_SUPPORT_ANCHOR_Y = 0.020
UPPER_SUPPORT_ANCHOR_Y = 0.731


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
    return obj


def create_rect_segment(
    name,
    size_x,
    size_z,
    thickness,
    location,
    top_material,
    bottom_material,
    parent,
    edge_material=None,
    outer_face=None,
):
    """Create only the visible semantic surfaces of one 9-slice segment."""

    half_x = size_x / 2
    half_z = size_z / 2
    half_y = thickness / 2
    gltf_vertices = (
        (-half_x, -half_y, -half_z),
        (half_x, -half_y, -half_z),
        (half_x, -half_y, half_z),
        (-half_x, -half_y, half_z),
        (-half_x, half_y, -half_z),
        (half_x, half_y, -half_z),
        (half_x, half_y, half_z),
        (-half_x, half_y, half_z),
    )
    faces = [
        (4, 7, 6, 5),
        (0, 1, 2, 3),
    ]
    material_indices = [0, 1]
    edge_faces = {
        "front": (3, 2, 6, 7),
        "back": (1, 0, 4, 5),
        "left": (0, 3, 7, 4),
        "right": (2, 1, 5, 6),
    }

    if edge_material and outer_face:
        faces.append(edge_faces[outer_face])
        material_indices.append(2)

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(
        [gltf_location(*vertex) for vertex in gltf_vertices],
        [],
        faces,
    )
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = gltf_location(*location)
    obj.parent = parent
    obj.data.materials.append(top_material)
    obj.data.materials.append(bottom_material)
    if edge_material:
        obj.data.materials.append(edge_material)

    uv_layer = obj.data.uv_layers.new(name="UVMap")
    for polygon, material_index in zip(obj.data.polygons, material_indices):
        polygon.material_index = material_index
        for loop_index in polygon.loop_indices:
            vertex = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            gltf_x = vertex.x
            gltf_y = vertex.z
            gltf_z = -vertex.y

            if material_index in (0, 1):
                uv = (
                    gltf_x / size_x + 0.5,
                    gltf_z / size_z + 0.5,
                )
            elif outer_face in ("front", "back"):
                uv = (
                    gltf_x / size_x + 0.5,
                    gltf_y / thickness + 0.5,
                )
            else:
                uv = (
                    gltf_z / size_z + 0.5,
                    gltf_y / thickness + 0.5,
                )

            uv_layer.data[loop_index].uv = uv

    return obj


def create_quarter_cylinder(
    name,
    radius,
    height,
    theta_start,
    location,
    top_material,
    bottom_material,
    edge_material,
    parent,
):
    segments = 12
    vertices = []
    faces = []
    material_indices = []
    bottom_y = -height / 2
    top_y = height / 2

    vertices.append(gltf_location(0, bottom_y, 0))
    vertices.append(gltf_location(0, top_y, 0))

    for index in range(segments + 1):
        theta = theta_start + math.pi / 2 * index / segments
        x = radius * math.sin(theta)
        z = radius * math.cos(theta)
        vertices.append(gltf_location(x, bottom_y, z))
        vertices.append(gltf_location(x, top_y, z))

    for index in range(segments):
        bottom_a = 2 + index * 2
        top_a = bottom_a + 1
        bottom_b = bottom_a + 2
        top_b = bottom_b + 1
        faces.append((0, bottom_b, bottom_a))
        faces.append((1, top_a, top_b))
        faces.append((bottom_a, bottom_b, top_b, top_a))
        material_indices.extend((1, 0, 2))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = gltf_location(*location)
    obj.parent = parent
    obj.data.materials.append(top_material)
    obj.data.materials.append(bottom_material)
    obj.data.materials.append(edge_material)

    uv_layer = obj.data.uv_layers.new(name="UVMap")
    for polygon, material_index in zip(obj.data.polygons, material_indices):
        polygon.material_index = material_index
        for loop_index in polygon.loop_indices:
            vertex = obj.data.vertices[obj.data.loops[loop_index].vertex_index].co
            gltf_x = vertex.x
            gltf_y = vertex.z
            gltf_z = -vertex.y

            if material_index in (0, 1):
                uv = (
                    gltf_x / (radius * 2) + 0.5,
                    gltf_z / (radius * 2) + 0.5,
                )
            else:
                arc_u = math.atan2(
                    abs(gltf_z),
                    abs(gltf_x),
                ) / (math.pi / 2)
                uv = (
                    arc_u,
                    gltf_y / height + 0.5,
                )

            uv_layer.data[loop_index].uv = uv
    return obj


def create_stone_material(name):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material["replaceableFinishGroup"] = "PrimaryTop"
    material["previewFinish"] = "black-marble"
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()

    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Metallic"].default_value = 0.0
    shader.inputs["Roughness"].default_value = 1.0
    albedo = image_node(nodes, "black-marble-albedo.png", "sRGB")
    normal = image_node(nodes, "black-marble-normal.png", "Non-Color")
    mr = image_node(nodes, "black-marble-metallic-roughness.png", "Non-Color")
    normal_map = nodes.new("ShaderNodeNormalMap")
    normal_map.inputs["Strength"].default_value = 0.35
    links.new(albedo.outputs["Color"], shader.inputs["Base Color"])
    links.new(normal.outputs["Color"], normal_map.inputs["Color"])
    links.new(normal_map.outputs["Normal"], shader.inputs["Normal"])
    links.new(mr.outputs["Color"], shader.inputs["Roughness"])
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def image_node(nodes, filename, color_space):
    image = bpy.data.images.load(str(TEXTURE_DIR / filename), check_existing=True)
    image.colorspace_settings.name = color_space
    node = nodes.new("ShaderNodeTexImage")
    node.image = image
    node.extension = "REPEAT"
    return node


def create_metal_material(name):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material["replaceableFinishGroup"] = "FrameMetal"
    material["previewFinish"] = "powder-coated-black"
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (0.012, 0.014, 0.017, 1)
    shader.inputs["Metallic"].default_value = 0.04
    shader.inputs["Roughness"].default_value = 0.28
    return material


def fixed(obj):
    obj["runtimeBehavior"] = "fixed"
    return obj


def create_top(root, materials):
    length = 1.2
    width = 0.8
    thickness = 0.017
    radius = 0.025
    y = 0.7515
    center_length = length - radius * 2
    center_width = width - radius * 2

    center = create_rect_segment(
        "Top_Center",
        center_length,
        center_width,
        thickness,
        (0, y, 0),
        materials["top_center"],
        materials["bottom_center"],
        root,
    )
    center["runtimeBehavior"] = "stretch-segment"
    center["lengthLocalAxis"] = "x"
    center["lengthBaseLength"] = center_length
    center["widthLocalAxis"] = "z"
    center["widthBaseLength"] = center_width

    for side_name, z, factor in (
        ("Front", width / 2 - radius / 2, 0.5),
        ("Back", -(width / 2 - radius / 2), -0.5),
    ):
        edge = create_rect_segment(
            f"Top_Edge_{side_name}",
            center_length,
            radius,
            thickness,
            (0, y, z),
            materials["top_long"],
            materials["bottom_long"],
            root,
            materials["edge_long"],
            side_name.lower(),
        )
        edge["runtimeBehavior"] = "stretch-segment+delta-move"
        edge["stretchDimension"] = "length"
        edge["stretchLocalAxis"] = "x"
        edge["baseLength"] = center_length
        edge["moveDimension"] = "width"
        edge["moveLocalAxis"] = "z"
        edge["moveFactor"] = factor

    for side_name, x, factor in (
        ("Left", -(length / 2 - radius / 2), -0.5),
        ("Right", length / 2 - radius / 2, 0.5),
    ):
        edge = create_rect_segment(
            f"Top_Edge_{side_name}",
            radius,
            center_width,
            thickness,
            (x, y, 0),
            materials["top_short"],
            materials["bottom_short"],
            root,
            materials["edge_short"],
            side_name.lower(),
        )
        edge["runtimeBehavior"] = "stretch-segment+delta-move"
        edge["stretchDimension"] = "width"
        edge["stretchLocalAxis"] = "z"
        edge["baseLength"] = center_width
        edge["moveDimension"] = "length"
        edge["moveLocalAxis"] = "x"
        edge["moveFactor"] = factor

    corners = (
        ("FrontRight", 1, 1, 0),
        ("BackRight", 1, -1, math.pi / 2),
        ("BackLeft", -1, -1, math.pi),
        ("FrontLeft", -1, 1, math.pi * 1.5),
    )
    for name, x_sign, z_sign, theta in corners:
        corner = create_quarter_cylinder(
            f"Top_Corner_{name}",
            radius,
            thickness,
            theta,
            (x_sign * (length / 2 - radius), y, z_sign * (width / 2 - radius)),
            materials["top_corner"],
            materials["bottom_corner"],
            materials["edge_corner"],
            root,
        )
        corner["runtimeBehavior"] = "delta-move"
        corner["lengthLocalAxis"] = "x"
        corner["lengthFactor"] = x_sign * 0.5
        corner["widthLocalAxis"] = "z"
        corner["widthFactor"] = z_sign * 0.5


def create_beam(name, start, end, material, parent):
    start_blender = Vector(gltf_location(*start))
    end_blender = Vector(gltf_location(*end))
    direction = end_blender - start_blender
    midpoint = (start_blender + end_blender) / 2

    bpy.ops.mesh.primitive_cube_add(size=1.0)
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f"{name}_Mesh"
    obj.dimensions = (0.065, 0.045, direction.length)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = direction.to_track_quat("Z", "Y")
    obj.location = midpoint
    obj.parent = parent
    obj.data.materials.append(material)
    obj["runtimeBehavior"] = "fixed"
    obj["longitudinalLocalAxis"] = "y"
    obj["lowerAnchor"] = start
    obj["upperAnchor"] = end
    obj["connectionMethod"] = "embedded-fixed-anchors"

    modifier = obj.modifiers.new(name="EdgeBevel", type="BEVEL")
    modifier.width = 0.004
    modifier.segments = 3
    modifier.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def build_model():
    reset_scene()

    for filename in (
        "black-marble-albedo.png",
        "black-marble-normal.png",
        "black-marble-metallic-roughness.png",
    ):
        if not (TEXTURE_DIR / filename).exists():
            raise FileNotFoundError(
                f"Missing texture {filename}. Run generate_textures.py first."
            )

    root = create_empty("VPedestalTable_Root")
    root["modelId"] = MODEL_ID
    root["assetType"] = "constructor-ready"
    root["unit"] = "meter"
    root["frontDirection"] = "+Z"

    materials = {
        "top_center": create_stone_material("Stone_Top_Center"),
        "bottom_center": create_stone_material("Stone_Bottom_Center"),
        "top_long": create_stone_material("Stone_Top_LongSegment"),
        "bottom_long": create_stone_material("Stone_Bottom_LongSegment"),
        "top_short": create_stone_material("Stone_Top_ShortSegment"),
        "bottom_short": create_stone_material("Stone_Bottom_ShortSegment"),
        "top_corner": create_stone_material("Stone_Top_Corner"),
        "bottom_corner": create_stone_material("Stone_Bottom_Corner"),
        "edge_long": create_stone_material("Stone_Edge_Long"),
        "edge_short": create_stone_material("Stone_Edge_Short"),
        "edge_corner": create_stone_material("Stone_Edge_Corner"),
    }
    support_material = create_metal_material("Metal_Support")
    base_material = create_metal_material("Metal_Base")
    create_top(root, materials)

    support_group = fixed(create_empty("Support_Frame", root))
    fixed(create_box("Base_Plinth", (0.72, 0.035, 0.50), (0, 0.0175, 0), base_material, 0.018, root))
    fixed(create_box("UnderTop_Mount", (0.82, 0.025, 0.56), (0, 0.7305, 0), support_material, 0.005, support_group))

    for z, side in ((0.20, "Front"), (-0.20, "Back")):
        create_beam(
            f"Support_Left_{side}",
            (-0.13, LOWER_SUPPORT_ANCHOR_Y, z),
            (-0.38, UPPER_SUPPORT_ANCHOR_Y, z),
            support_material,
            support_group,
        )
        create_beam(
            f"Support_Right_{side}",
            (0.13, LOWER_SUPPORT_ANCHOR_Y, z),
            (0.38, UPPER_SUPPORT_ANCHOR_Y, z),
            support_material,
            support_group,
        )

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
