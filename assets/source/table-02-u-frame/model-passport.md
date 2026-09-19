# Паспорт модели: Table 02 U-Frame

## Model

Прямоугольный стол с двумя торцевыми U-образными металлическими рамами.

## Model ID

```text
table-02-u-frame
```

## Type

```text
constructor-ready
```

## Runtime compatibility

```text
Supported by current engine
```

Используемые generic behaviors:

```text
Scale
Delta move / spread
Edge-anchor move
Stretch segment
Fixed — неявно для деталей без отдельного правила
```

## Base dimensions

```text
Length × Width × Height
950 × 550 × 750 mm
```

Столешница:

```text
950 × 550 × 15 mm
```

Металлический профиль принят по визуальной оценке референса:

```text
25 × 25 mm
```

Размер профиля не был указан на размерном референсе и должен быть подтверждён по спецификации производителя, если потребуется абсолютное совпадение с серийным изделием.

## Front direction

```text
+Z
```

## Configurable parameters

```text
length
width
```

Высота фиксирована и не является configurable dimension.

## Limits

```text
length:
  base: 0.95 m
  min:  0.95 m
  max:  1.65 m
  step: 0.01 m

width:
  base: 0.55 m
  min:  0.55 m
  max:  0.80 m
  step: 0.01 m
```

## Dimension mapping

```text
length -> model X
width  -> model Z
height -> model Y — fixed
```

## Resize anchors

```text
length -> center
width  -> center
```

## Node structure

```text
UFrameTable_Root
├── TableTop
├── Frame_Left
│   ├── Frame_Left_Post_Front
│   ├── Frame_Left_Post_Back
│   └── Frame_Left_BottomRail
└── Frame_Right
    ├── Frame_Right_Post_Front
    ├── Frame_Right_Post_Back
    └── Frame_Right_BottomRail
```

## Controlled behavior

```text
TableTop:
  length -> Scale local X
  width  -> Scale local Z

Frame_Left:
  length -> Delta move local-parent X, factor -0.5

Frame_Right:
  length -> Delta move local-parent X, factor +0.5

Frame_*_Post_Front / Back:
  width -> Edge-anchor move local-parent Z

Frame_*_BottomRail:
  width -> Stretch segment local Z
  baseLength: 0.51 m
```

Вертикальные стойки сохраняют исходное сечение и высоту. При изменении ширины они перемещаются наружу, а не масштабируются.

## Hierarchy notes

Каждая U-рама является отдельной Group/Node. Перемещение `Frame_Left` или `Frame_Right` по длине автоматически переносит все три дочерние детали как жёсткую сборку.

Стойки и нижняя поперечина управляются внутри локальной системы своей рамы. Это позволяет независимо изменять ширину после перемещения рам по длине.

## Local-axis notes

```text
TableTop longitudinal axis: local X
TableTop transverse axis:   local Z
BottomRail stretch axis:    local Z
```

Все controlled nodes имеют начальный scale `(1, 1, 1)` и нулевой rotation.

## Profile-resize behavior

```text
TableTop:
  Uniform scaling acceptable

Vertical posts:
  Preserve cross-section and height

Bottom rails:
  Stretch segment; preserve X/Y cross-section
```

## Material names

```text
Top_Primary
Top_Bottom
Top_Edge_Long
Top_Edge_Short
Metal_Frame
```

## Replaceable finish groups

```text
PrimaryTop:
  Top_Primary
  Top_Bottom
  Top_Edge_Long
  Top_Edge_Short

FrameMetal:
  Metal_Frame
```

`Top_Primary` обозначает верх столешницы. Вместе с `Top_Bottom`, `Top_Edge_Long` и `Top_Edge_Short` он входит в один пользовательский slot `primaryTop`. Все четыре поверхности меняют покрытие вместе, но имеют независимую UV-компенсацию.

`Metal_Frame` предназначен для замены варианта порошковой окраски. Базовый preview — чёрное порошковое покрытие. Предусмотрен будущий белый/светлый вариант, который также должен оставаться окрашенным металлом, а не белым пластиком или матовой белой поверхностью без металлического specular response.

Текущий generic material runtime подключает эти группы декларативно:

```text
primaryTop:
  default: concrete-light
  allowed: oak-natural, walnut-natural, pine-coated, ash-natural,
           concrete-light, marble-cream, oak-grey, oak-silver, oak-black,
           marble-white-gold, marble-black-gold, marble-duo-gold, terrazzo-neutral

frameMetal:
  default: metal-black-matte
  allowed: metal-black-matte, metal-white-matte, metal-anthracite
```

## PBR preview materials

### Top_Primary

```text
Preview finish: light concrete
Base Color: embedded 512 × 512 PNG
Normal: embedded 512 × 512 OpenGL normal map
Metallic-Roughness: embedded 512 × 512 PNG
Metallic: 0
Roughness: texture-driven, high
```

### Metal_Frame

```text
Preview finish: powder-coated black steel
Metallic: 0.04
Roughness: 0.29
```

Низкое значение Metallic намеренно: внешний слой является полимерной порошковой краской, а не открытым металлом.

## UV behavior

```text
Top_Primary / Top_Bottom:
  length -> texture U
  width  -> texture V

Top_Edge_Long:
  length -> texture U
  width не влияет на UV торца

Top_Edge_Short:
  width -> texture U
  length не влияет на UV торца

Все поверхности: anchor -> centered
```

Исправление v3 от 18.09.2026: исходная UV-плотность — 1 UV-единица на метр, как у V-Pedestal. Старый масштаб примерно 0.36 м на тайл удалён. Верх и низ используют X/Z; длинный торец — X/Y; короткий — Z/Y. Полная толщина 15 мм занимает 0.015 UV-единицы, а не целую высоту картинки. Runtime сохраняет эту плотность при изменении длины и ширины. Все PBR-карты используют одну развёртку; tangents пересчитаны.

Металлическая рама использует однородный PBR material и не требует динамической UV-компенсации.

## Pivot behavior

```text
UFrameTable_Root: model origin at floor center
TableTop: center pivot
Frame_Left / Frame_Right: group origin at frame center on floor plane
Posts: center pivot
Bottom rails: center pivot for symmetric local-Z stretch
```

## Scene requirements

```text
Uses shared configurator scene/environment.
No asset-specific lights, camera, HDRI or floor.
```

## Performance

```text
GLB size: 454,040 bytes
Triangles: 1,188 unique; 2,388 with node instances
Unique geometry meshes: 3
Runtime nodes: 9
Materials: 5
Draw calls with node instances: 10
Embedded textures: 3 × 512 × 512
Compression: none
glTF Validator: 0 errors, 0 warnings
```

## Notes for Three.js

- GLB использует метрический масштаб: `1 unit = 1 meter`.
- Итоговые base bounds: `0.95 × 0.55 × 0.75 m`.
- Root находится в `(0, 0, 0)`, контакт с полом — `Y = 0`.
- Материалы имеют стабильные semantic names.
- В GLB нет камеры, света и тестового пола.
- Источником runtime-правил является `src/three/models/u-frame-table/config.ts`.

## Assumptions requiring product confirmation

- внешний размер металлического профиля принят `25 × 25 mm`;
- торцевой свес столешницы над рамами принят `25 mm`;
- боковой свес столешницы принят `20 mm`;
- нижняя поперечина считается растягиваемым конструктивным сегментом при изменении ширины.

Эти параметры выбраны по референсам и не меняют generic architecture. Если появится точный технический чертёж производителя, их можно скорректировать в source script и повторно экспортировать asset.


Примечание v3: существующие `previews/` — исторические рендеры геометрии до
исправления UV. Новый браузерный visual QA ещё требуется; см. validation-report.md.
