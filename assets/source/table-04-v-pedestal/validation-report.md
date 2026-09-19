# Validation report: Table 04 V-Pedestal

Validation date: 2026-08-15.

## Production asset

```text
public/models/table-04-v-pedestal.glb
```

Khronos glTF Validator `2.0.0-dev.3.10`:

```text
Errors:   0
Warnings: 0
Infos:    0
Hints:    0
```

The complete machine-readable result is stored in
`gltf-validator-report.json`.

Asset metrics:

```text
Base bounds:  1.20 × 0.80 × 0.76 m
Max bounds:   1.60 × 1.20 × 0.76 m
Triangles:    4,612
Draw calls:   32
Materials:    13
Textures:     3
GLB size:     531,604 bytes
```

## Runtime and connection verification

The production-GLB test verifies:

- exact 9-slice and support node names;
- base, intermediate, max and return-to-base dimensions;
- `Stretch segment` and signed `Delta move` transforms;
- unchanged 25 mm corner scale and unchanged fixed support transforms;
- all eleven semantic tabletop surfaces and independent UV compensation;
- physical UV spans for center, straight, corner and vertical edge surfaces;
- common length/width compensation across every horizontal 9-slice surface;
- unique ownership of `primaryTop` and `frameMetal` targets;
- generic replacement to `marble-cream` / `metal-black-matte`, then
  `walnut-natural` / `metal-white-matte`;
- final total height remains 0.760 m.

Every support is also checked geometrically. The local beam endpoints are
transformed to world space, compared with the exported anchor extras and tested
against the target-part bounds:

```text
lower endpoint Y: 0.020 m
floor-plinth Y:   0.000..0.035 m
embed depth:      15 mm below the top surface

upper endpoint Y: 0.731 m
under-top mount:  0.718..0.743 m
embed depth:      13 mm above the bottom surface

supports checked:
  Support_Left_Front
  Support_Left_Back
  Support_Right_Front
  Support_Right_Back
```

For both black and white frame selections the test reruns all four connection
checks, and each beam AABB intersects both target-part AABBs.

Compatibility checks executed in the supplied integration snapshot:

```text
npm test      passed — 2 test files, 2 production-GLB tests
npm run build passed — TypeScript no-emit compatibility build
```

The supplied integration archive did not contain the application
`package.json`, App, generic FurnitureController or shared material sources.
Therefore these commands were run in a temporary package-level compatibility
harness around the unchanged model tests and model files. The harness is not
included in the model-only ZIP; the central integration chat must rerun the
complete application suite against current main.

## Source checks

```text
Python syntax: create_table_04_v_pedestal.py passed
Node syntax:   build_table_04_v_pedestal.mjs passed
Node builder:  completed successfully
```

Blender was not installed. The included Blender 4.x script is syntax-checked,
but no unverified `.blend` is supplied. A `.blend` must be generated, opened and
visually accepted later in a Blender-enabled environment.

## Visual verification

All images are regenerated from the final production GLB. Base/max previews
use the declared runtime defaults (`marble-cream` top and
`metal-black-matte` frame), so the table is not rendered fully black:

```text
base-1200x800.png
max-1600x1200.png
```

Additional low-angle connection views use opposite diagonals and show the
model from below with both supported frame finishes:

```text
connection-check-black.png — front/right diagonal, metal-black-matte
connection-check-white.png — back/left diagonal, metal-white-matte
```

Together with the four programmatic endpoint checks, these views cover both
sides, front/back depth pairs and the underside. No light gap is visible at the
lower or upper joints; controlled intersections remain hidden inside the
plates. The base stays fixed while the 9-slice top reaches max dimensions.
