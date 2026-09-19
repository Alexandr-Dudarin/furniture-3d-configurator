# Table 03 Slat Pedestal — asset source

Source package for the constructor-ready model `table-03-slat-pedestal`.

The v2.4 source keeps `TableTop` as the existing Scale target while exporting
separate `Wood_Top`, `Wood_Bottom`, `Wood_Edge_Long` and `Wood_Edge_Short`
material primitives with independent UV behavior. `Wood_Slats` and
`Wood_Plinth` form the independent declarative `pedestalWood` finish slot;
the charcoal core and upper mounting plate remain fixed.

## Production files

```text
public/models/table-03-slat-pedestal.glb
src/three/models/slat-pedestal-table/config.ts
src/three/models/slat-pedestal-table/slatPedestalTable.test.ts
```

## Source contents

```text
build_table_03_slat_pedestal.mjs   deterministic production-GLB builder
create_table_03_slat_pedestal.py   Blender 4.x editable-source builder
generate_textures.py               deterministic preview PBR textures
model-passport.md
validation-report.md
references/
textures/
previews/
```

## Rebuild production GLB without Blender

From the project root:

```text
python3 assets/source/table-03-slat-pedestal/generate_textures.py
npm install --no-save --package-lock=false @gltf-transform/core@4.5.0
node assets/source/table-03-slat-pedestal/build_table_03_slat_pedestal.mjs
```

The temporary package installation is a source-tool dependency only and must
not be committed to the project.

## Create editable `.blend`

Blender 4.x:

```text
blender --background --python assets/source/table-03-slat-pedestal/create_table_03_slat_pedestal.py
```

The script creates `table-03-slat-pedestal.blend` beside itself and exports a
GLB with the documented semantic names and metadata. Blender was unavailable in
the model-building environment, so no unverified `.blend` is included. The
generated `.blend` must be opened and visually checked before it is accepted as
the editable production source.

After any source rebuild, rerun the production integration test, project build
and Khronos glTF Validator.


## UV correction v3 — 2026-09-18

The Node and Blender builders now use one UV unit per metre on all four
semantic tabletop surfaces. The 22 mm edge occupies a 0.022-high UV strip,
not the full texture height. Top/bottom texture density now matches the
V-Pedestal metre convention. Node hierarchy, geometry, material names,
material slots and runtime resize rules are unchanged. Tangents are rebuilt.
The additional `tabletopUv.integration.test.ts` measures actual UV density
through the production GLB and material controller at base, intermediate,
independent-axis maximum and return-to-base dimensions.


Примечание v3: существующие `previews/` — исторические рендеры геометрии до
исправления UV. Новый браузерный visual QA ещё требуется; см. validation-report.md.
