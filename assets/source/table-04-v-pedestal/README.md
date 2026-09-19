# Table 04 V-Pedestal — asset source

Source package for the constructor-ready model `table-04-v-pedestal`.

The v2.4 source preserves the existing nine resize targets and adds separate
top, bottom, long-edge, short-edge and corner material primitives according to
each segment's independent UV compensation.

Horizontal 9-slice surfaces share one physical projected UV coordinate system.
Vertical edges use the same physical texture density along their length and
17 mm thickness, avoiding the former full-tile compression on thin sides.

The four fixed supports are built between source anchors embedded in the floor
plinth and under-top mount. This removes bevel-related visual gaps without a
runtime `Fit between anchors` behavior and without changing the 9-slice resize.

## Production files

```text
public/models/table-04-v-pedestal.glb
src/three/models/v-pedestal-table/config.ts
src/three/models/v-pedestal-table/vPedestalTable.test.ts
```

## Source contents

```text
build_table_04_v_pedestal.mjs   deterministic production-GLB builder
create_table_04_v_pedestal.py   Blender 4.x editable-source builder
generate_textures.py            deterministic preview PBR textures
model-passport.md
validation-report.md
references/
textures/
previews/
```

## Rebuild production GLB without Blender

From the project root:

```text
python3 assets/source/table-04-v-pedestal/generate_textures.py
npm install --no-save --package-lock=false @gltf-transform/core@4.4.2
node assets/source/table-04-v-pedestal/build_table_04_v_pedestal.mjs
```

The temporary package installation is a source-tool dependency only and must
not be committed to the project.

## Create editable `.blend`

Blender 4.x:

```text
blender --background --python assets/source/table-04-v-pedestal/create_table_04_v_pedestal.py
```

The script creates `table-04-v-pedestal.blend` beside itself and exports a GLB
with the documented 9-slice tabletop hierarchy. Blender was unavailable in the
model-building environment, so no unverified `.blend` is included. The
generated `.blend` must be opened and visually checked before it is accepted as
the editable production source.

After any source rebuild, rerun the production integration test, project build
and Khronos glTF Validator.
