# Material source register

Production texture maps are stored under `public/materials/`. Stable project
finish IDs are intentionally independent from the original asset filenames.

All downloaded texture assets in this register are published by Poly Haven
under the CC0 license:

https://polyhaven.com/license

## Production conversion

- resolution: 2K;
- format: JPG;
- included maps: Diffuse/Base Color, Roughness, Normal (GL);
- omitted maps: displacement, AO, packed ARM and DirectX normal;
- every downloaded file was verified against the MD5 returned by the official
  Poly Haven API at download time;
- Base Color is interpreted as sRGB by the runtime;
- Roughness and Normal GL are interpreted as non-color data.

## Registered texture finishes

| Project finish ID | Category | Poly Haven source | Asset ID |
| --- | --- | --- | --- |
| `oak-natural` | wood | [Oak Veneer 01](https://polyhaven.com/a/oak_veneer_01) | `oak_veneer_01` |
| `walnut-natural` | wood | [Natural Walnut Veneer](https://polyhaven.com/a/natural_walnut_veneer) | `natural_walnut_veneer` |
| `pine-coated` | wood | [Coated Pine 02](https://polyhaven.com/a/coated_pine_02) | `coated_pine_02` |
| `ash-natural` | wood | [Ash Veneer](https://polyhaven.com/a/ash_veneer) | `ash_veneer` |
| `concrete-light` | stone | [Brushed Concrete 2](https://polyhaven.com/a/brushed_concrete_2) | `brushed_concrete_2` |
| `marble-cream` | stone | [Marble 01](https://polyhaven.com/a/marble_01) | `marble_01` |

## Procedural coated-metal finishes

The following finishes do not use downloaded texture maps:

- `metal-black-matte`;
- `metal-white-matte`;
- `metal-anthracite`.

They are intentionally modeled as powder-coated surfaces with low metalness
(`0.04`) rather than as exposed metal or plain plastic.

