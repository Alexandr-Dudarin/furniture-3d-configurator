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

## Generated project finishes

The following seamless 2K texture sets are produced by
`generate_custom_finishes.py`. The three oak variants are colorways derived from
the registered CC0 `oak-natural` source so they retain believable veneer grain.
The marble and terrazzo sets are original procedural artwork inspired by general
material categories and do not copy the supplied visual references. Each set
contains Base Color, Roughness and OpenGL Normal maps.

| Project finish ID | Category | User-facing finish |
| --- | --- | --- |
| `oak-grey` | wood | Серый дуб |
| `oak-silver` | wood | Светлый серебристый дуб |
| `oak-black` | wood | Чёрный дуб |
| `marble-white-gold` | stone | Белый мрамор с золотым рисунком |
| `marble-black-gold` | stone | Чёрный мрамор с золотым рисунком |
| `marble-duo-gold` | stone | Контрастный мрамор с золотым рисунком |
| `terrazzo-neutral` | stone | Нейтральное терраццо |

The gold veins are a decorative printed/coated pattern. They intentionally keep
`metalness: 0`; the runtime must not interpret them as exposed metallic geometry.

Marble fields are periodic on both texture axes and deliberately avoid baked-in
large-area lighting gradients. This keeps repeated regions visually continuous
when runtime UV compensation raises `repeat` for a resized surface.

Model availability remains declarative in each `FurnitureDefinition.materialSlots`.
For example, the wooden pedestal slot accepts only wood finishes, while the new
oak finishes are not automatically added to the stone-oriented V-pedestal top.

To regenerate these source-controlled maps and their contact sheet:

```bash
python -m pip install numpy pillow scipy
python assets/materials/source/generate_custom_finishes.py
```

## Procedural coated-metal finishes

The following finishes do not use downloaded texture maps:

- `metal-black-matte`;
- `metal-white-matte`;
- `metal-anthracite`.

They are intentionally modeled as powder-coated surfaces with low metalness
(`0.04`) rather than as exposed metal or plain plastic.


## Превью карточек материалов

`generate_material_previews.py` создаёт WebP до 192 × 192 из исходного base-color
в `public/materials/previews/`, сохраняя ICC-профиль при его наличии. Он не меняет
ни одну production PBR-карту. Для генерации нужен Pillow; при обычной сборке
используются уже сохранённые превью. В реестре отделка явно задаёт `previewUrl`.
