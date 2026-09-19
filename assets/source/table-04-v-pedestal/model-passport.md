# Model passport: Table 04 V-Pedestal

## Model

Extendable stone-top dining table with four inclined central supports and a
fixed powder-coated floor plinth.

## Model ID

```text
table-04-v-pedestal
```

## Type and runtime compatibility

```text
constructor-ready
Supported by current engine
```

Existing generic behavior only:

```text
Stretch segment
Delta move / spread
Fixed — nodes without a resize rule
centered texture repeat/offset compensation
declarative material replacement
```

No `Fit between anchors`, model-specific condition or engine extension is used.

## Base dimensions

```text
Length × Width × Height
1200 × 800 × 760 mm
```

Tabletop thickness:

```text
17 mm
```

## Configurable parameters and limits

```text
length:
  base/min: 1.20 m
  max:      1.60 m
  step:     0.01 m

width:
  base/min: 0.80 m
  max:      1.20 m
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
VPedestalTable_Root
├── Top_Center
├── Top_Edge_Front
├── Top_Edge_Back
├── Top_Edge_Left
├── Top_Edge_Right
├── Top_Corner_FrontLeft
├── Top_Corner_FrontRight
├── Top_Corner_BackLeft
├── Top_Corner_BackRight
├── Base_Plinth
└── Support_Frame
    ├── UnderTop_Mount
    ├── Support_Left_Front
    ├── Support_Left_Back
    ├── Support_Right_Front
    └── Support_Right_Back
```

Each 9-slice node remains unchanged as a resize target. Its glTF Mesh now has
separate primitives/material indices for top, bottom and applicable exterior
edge surfaces. Internal seam faces between adjacent segments are omitted.

## Controlled behavior

The fixed tabletop corner radius is `25 mm`.

```text
Top_Center:
  length -> Stretch segment local X, baseLength 1.15 m
  width  -> Stretch segment local Z, baseLength 0.75 m

Top_Edge_Front / Back:
  length -> Stretch segment local X, baseLength 1.15 m
  width  -> Delta move local Z, factors +0.5 / -0.5

Top_Edge_Left / Right:
  width  -> Stretch segment local Z, baseLength 0.75 m
  length -> Delta move local X, factors -0.5 / +0.5

Top_Corner_*:
  length -> Delta move local X, factor by side ±0.5
  width  -> Delta move local Z, factor by side ±0.5

Support_Frame and all descendants:
Base_Plinth:
  Fixed
```

All four inclined supports are generated between fixed source anchors:

```text
lower anchor Y: 0.020 m — 15 mm inside the 0.000..0.035 m floor plinth
upper anchor Y: 0.731 m — 13 mm inside the 0.718..0.743 m mount
lower X:        ±0.130 m
upper X:        ±0.380 m
depth Z:        ±0.200 m
```

The controlled embedding closes the bevel-induced light gaps while preserving
the fixed height and all existing resize rules. `lowerAnchor`, `upperAnchor`
and `connectionMethod: embedded-fixed-anchors` are exported as node extras.

## Profile-resize behavior

```text
Preserve fixed corner radius
Segmented resize required
```

Corner geometry and scale remain fixed. Only center and straight edge regions
stretch along their declared axes.

## Height readiness

```text
height-fixed
```

Inclined supports are rigid fixed parts without vertical stretch targets,
height anchors or moving upper-assembly rules. A future height change that
alters their angle would likely require generic `Fit between anchors` support.
The fixed source anchors used to close the current joints do not make the model
`height-ready`.

## Tabletop thickness readiness

```text
thickness-fixed
```

The 17 mm thickness is baked into all nine segments. No `topThickness`
dimension, common thickness anchor or linked mount movement is declared.

## Exact tabletop material names and purpose

```text
Stone_Top_Center
  upper face of the center segment; changes with length and width

Stone_Bottom_Center
  lower face of the center segment; changes with length and width

Stone_Top_LongSegment
  upper faces of front/back straight strips; changes with length only

Stone_Bottom_LongSegment
  lower faces of front/back straight strips; changes with length only

Stone_Top_ShortSegment
  upper faces of left/right straight strips; changes with width only

Stone_Bottom_ShortSegment
  lower faces of left/right straight strips; changes with width only

Stone_Top_Corner
  upper faces of the four fixed-radius corner sectors

Stone_Bottom_Corner
  lower faces of the four fixed-radius corner sectors

Stone_Edge_Long
  front/back exterior vertical edges; changes with length only

Stone_Edge_Short
  left/right exterior vertical edges; changes with width only

Stone_Edge_Corner
  curved exterior perimeter of fixed corner sectors
```

Frame materials:

```text
Metal_Support
Metal_Base
```

The eleven tabletop targets are necessary because their geometry and texture
compensation differ. Surfaces with identical behavior share one target across
the relevant symmetric nodes; no per-corner or per-side duplicate materials are
created.

## Replaceable finish slots

```text
primaryTop:
  targets: all eleven Stone_* materials listed above
  default: marble-cream
  allowed:
    oak-natural
    walnut-natural
    pine-coated
    ash-natural
    concrete-light
    marble-cream
    marble-white-gold
    marble-black-gold
    marble-duo-gold
    terrazzo-neutral

frameMetal:
  targets:
    Metal_Support
    Metal_Base
  default: metal-black-matte
  allowed:
    metal-black-matte
    metal-white-matte
    metal-anthracite
```

Every target belongs to exactly one slot. The embedded production preview is
black marble, while the declarative runtime default remains the shared
`marble-cream` finish.

## UV behavior

```text
All Stone_Top_* / Stone_Bottom_* surfaces:
  length -> texture U
  width  -> texture V

Stone_Edge_Long:
  length -> texture U
  tabletop thickness -> physical-scale UV V

Stone_Edge_Short:
  width -> texture U
  tabletop thickness -> physical-scale UV V

Stone_Edge_Corner:
  fixed physical arc/thickness UV; no runtime dimension binding

runtime UV anchor -> centered
```

The whole horizontal 9-slice surface is projected in one common
one-texture-tile-per-meter coordinate system. Adjacent center, straight and
corner segments therefore start from matching UV coordinates. Every horizontal
surface receives the same centered length/width compensation, including fixed
corners that move with the outer boundary. Vertical edges use the same physical
UV density in their longitudinal and 17 mm thickness directions, so the finish
is not compressed into a full square tile on the thin edge.

Only `length` and `width` occur in `textureAxes`. Thickness is used only for
the static physical-scale edge unwrap. All normal-mapped primitives export
OpenGL normal maps, UV0 and tangents.

## Pivot and local-axis notes

```text
Top_Center pivot: center
straight edge pivots: center
corner pivots: center of fixed-radius sector
support beams: local Y follows physical beam length
```

## Scene requirements

```text
Uses shared configurator scene/environment.
No asset-specific camera, lights, floor or HDRI.
```

## Performance

```text
GLB size:       531,604 bytes
Triangles:      4,612
Mesh nodes:     15
Draw calls:     32
Materials:      13
Textures:       3 × 512 × 512 PNG
Compression:    none
glTF Validator: 0 errors, 0 warnings, 0 infos, 0 hints
```

## Editable source status

Blender was unavailable in the production environment. No unverified `.blend`
is included. `create_table_04_v_pedestal.py` is syntax-checked for Blender 4.x
and reproduces the semantic surfaces and UV layout. A `.blend` must be generated
and visually inspected later in a Blender-enabled environment.

## Explicit assumptions

Unspecified support dimensions remain visual estimates:

```text
corner radius:       25 mm
floor plinth:        720 × 500 × 35 mm
under-top mount:     820 × 560 × 25 mm
support section:     65 × 45 mm
support bottom X:    ±130 mm
support top X:       ±380 mm
support depth:       ±200 mm
support lower Y:     20 mm, embedded in floor plinth
support upper Y:     731 mm, embedded in under-top mount
```

The physical insert and hidden extension mechanism are represented by the
approved continuous 9-slice resize. Literal insert visibility would require a
future generic conditional visibility/variant behavior.
