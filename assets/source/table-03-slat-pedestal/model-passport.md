# Model passport: Table 03 Slat Pedestal

## Model

Extendable rectangular dining table with a central charcoal pedestal, vertical
oak slats and a wooden floor plinth.

## Model ID

```text
table-03-slat-pedestal
```

## Type and runtime compatibility

```text
constructor-ready
Supported by current engine
```

Only existing generic runtime behavior is used:

```text
Scale
Fixed — nodes without a resize rule
centered texture repeat/offset compensation
declarative material replacement
```

No `modelId` condition or shared-engine change is required.

## Base dimensions

```text
Length × Width × Height
1200 × 750 × 750 mm
```

Tabletop thickness:

```text
22 mm
```

## Configurable parameters and limits

```text
length:
  base/min: 1.20 m
  max:      1.60 m
  step:     0.01 m

width:
  base/min: 0.75 m
  max:      1.15 m
  step:     0.01 m
```

## Coordinate and anchor contract

```text
X = left/right
Y = up
Z = front/back
front = +Z

length -> X, center anchor
width  -> Z, center anchor
```

Root is `(0, 0, 0)` and floor contact is `Y = 0`.

## Node structure

```text
SlatPedestalTable_Root
├── TableTop
├── Base_Plinth
├── Pedestal_Core
├── Pedestal_TopPlate
├── Pedestal_Slats_Front
│   └── Slat_Front_01..07
└── Pedestal_Slats_Back
    └── Slat_Back_01..07
```

`TableTop` remains one controlled glTF node and one glTF Mesh. The Mesh contains
four primitives/material indices for the semantic tabletop surfaces.

## Controlled behavior

```text
TableTop:
  length -> Scale local X
  width  -> Scale local Z

Base_Plinth:
Pedestal_Core:
Pedestal_TopPlate:
Pedestal_Slats_Front / Back:
  Fixed
```

The pedestal and slats are not descendants of `TableTop` and inherit no scale.

## Profile-resize behavior

```text
Uniform scaling acceptable
```

The approved continuous tabletop resize and 4 mm production rounding are
preserved. Rounded transition triangles are classified as long- or short-edge
surfaces by their dominant horizontal normal. They use the corresponding edge
UV projection, so an additional `Wood_Edge_Corner` target would not provide an
independent runtime mapping and is intentionally not created.

## Height readiness

```text
height-fixed
```

The pedestal core and slat assemblies have no declared vertical stretch
segments, base lengths, height pivots or floor-anchored resize rules. Height is
not a configurable dimension.

## Tabletop thickness readiness

```text
thickness-fixed
```

The 22 mm value is baked into the production geometry. No `topThickness`
dimension, thickness anchor or linked moving targets are declared. The centered
`TableTop` pivot alone is not sufficient to claim `thickness-ready`.

## Exact material names

Replaceable tabletop surfaces:

```text
Wood_Top         — upper horizontal surface
Wood_Bottom      — lower horizontal surface
Wood_Edge_Long   — front/back edges and compatible rounded transitions
Wood_Edge_Short  — left/right edges and compatible rounded transitions
```

Replaceable pedestal-wood surfaces:

```text
Wood_Slats       — fourteen vertical wooden slats (front and back)
Wood_Plinth      — lower wooden floor plinth
```

Fixed material outside the replaceable slots:

```text
Dark_Pedestal    — central charcoal core and upper mounting plate
```

The upper `Pedestal_TopPlate` is visibly part of the charcoal central
construction in the supplied screenshots, not a wooden design detail. It is
therefore intentionally excluded from `pedestalWood`. No exposed part is
declared as configurable metal, so the model does not add an artificial
`frameMetal` slot.

## Replaceable finish slot

```text
primaryTop:
  targets:
    Wood_Top
    Wood_Bottom
    Wood_Edge_Long
    Wood_Edge_Short
  default: oak-natural
  allowed:
    oak-natural
    walnut-natural
    pine-coated
    ash-natural
    concrete-light
    marble-cream

pedestalWood:
  label: Материал деревянных элементов основания
  targets:
    Wood_Slats
    Wood_Plinth
  default: oak-natural
  allowed:
    oak-natural
    walnut-natural
    pine-coated
    ash-natural
```

The slots are independent. Every semantic target belongs to exactly one slot;
`Dark_Pedestal` belongs to neither slot. `pedestalWood` uses the generic
declarative material runtime and requires no model-specific UI.

## UV behavior

```text
Wood_Top:
  length -> texture U
  width  -> texture V

Wood_Bottom:
  length -> texture U
  width  -> texture V

Wood_Edge_Long:
  length -> texture U
  tabletop thickness -> ordinary UV V only

Wood_Edge_Short:
  width -> texture U
  tabletop thickness -> ordinary UV V only

runtime UV anchor -> centered
```

Only real configurable dimensions (`length`, `width`) occur in `textureAxes`.
Thickness is used only while constructing the static edge UV unwrap. All maps
use the OpenGL normal convention and every normal-mapped primitive has tangents.
`Wood_Slats` and `Wood_Plinth` have ordinary object UVs and no runtime
`textureAxes` entry because their geometry is fixed during length/width resize.

### Physical UV density — v3, 2026-09-18

Tabletop surfaces use one UV unit per metre on both texture axes, matching
the V-Pedestal convention. Top and bottom use metric X/Z projections. Long
edges use X/Y and short edges use Z/Y; the full 22 mm thickness spans 0.022
UV units rather than V=0..1. The base top spans about 1.2 × 0.75 UV units
before bevel subtraction. Runtime compensation preserves this density after
length/width resize and material replacement, including every PBR map.
Pedestal wood UVs and the independent pedestalWood slot are unchanged.

## Pivot and local-axis notes

```text
TableTop pivot: model center
TableTop local X: length
TableTop local Z: width
Fixed nodes: centered object pivots
```

## Scene requirements

```text
Uses shared configurator scene/environment.
No asset-specific camera, lights, floor or HDRI.
```

## Performance

```text
GLB size:       1,064,096 bytes
Triangles:      11,832
Mesh nodes:     18
Draw calls:     21
Materials:      7
Textures:       3 × 512 × 512 PNG
Compression:    none
glTF Validator: 0 errors, 0 warnings, 0 infos, 0 hints
```

## Editable source status

Blender was unavailable in the production environment. No unverified `.blend`
is included. `create_table_03_slat_pedestal.py` is syntax-checked for Blender
4.x and reproduces the semantic materials and UV assignment. A `.blend` must be
generated and visually inspected later in a Blender-enabled environment.

## Explicit assumptions

The reference provides only the external folded/extended dimensions. The
following are visual estimates rather than manufacturer specifications:

```text
pedestal core:      370 × 340 mm
wooden plinth:      620 × 460 × 35 mm
top mounting plate: 480 × 400 × 18 mm
slats:              7 front + 7 back, 24 mm wide
```

The physical insert, seams and folding mechanism are represented by the
approved continuous centered resize. Literal insert visibility would require a
future generic conditional visibility/variant behavior.


Примечание v3: существующие `previews/` — исторические рендеры геометрии до
исправления UV. Новый браузерный visual QA ещё требуется; см. validation-report.md.
