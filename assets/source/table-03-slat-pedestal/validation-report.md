# Validation report: Table 03 Slat Pedestal

Validation date: 2026-08-14.

## Production asset

```text
public/models/table-03-slat-pedestal.glb
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
Base bounds:  1.20 × 0.75 × 0.75 m
Max bounds:   1.60 × 1.15 × 0.75 m
Triangles:    11,832
Draw calls:   21
Materials:    7
Textures:     3
GLB size:     1,064,096 bytes
```

## Runtime verification

The production-GLB test verifies:

- exact controlled and fixed node names;
- base, intermediate, max and return-to-base dimensions;
- X/Z tabletop scaling only and unchanged pedestal transforms;
- all four semantic tabletop surfaces and their independent UV compensation;
- unique target ownership across `primaryTop` and `pedestalWood`;
- default `oak-natural` on both slots;
- independent `primaryTop -> walnut-natural` and
  `pedestalWood -> ash-natural` replacement;
- `Dark_Pedestal` remains outside replacement and keeps no runtime `finishId`;
- valid finish IDs for every allowed option.

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
Python syntax: create_table_03_slat_pedestal.py passed
Node syntax:   build_table_03_slat_pedestal.mjs passed
Node builder:  completed successfully
```

Blender was not installed. The included Blender 4.x script is syntax-checked,
but no unverified `.blend` is supplied. A `.blend` must be generated, opened and
visually accepted later in a Blender-enabled environment.

## Visual verification

The regenerated previews are rasterized from the final production GLB after
applying the same declarative base/max transforms:

```text
base-1200x750.png
max-1600x1150.png
```

Both views show the complete model with the default oak tabletop and default
oak pedestal wood. The tabletop grows symmetrically; the charcoal core, wooden
slats and lower plinth remain centered and geometrically fixed.
