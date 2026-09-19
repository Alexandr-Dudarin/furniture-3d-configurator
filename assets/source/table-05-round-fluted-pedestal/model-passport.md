# Паспорт: Круглый стол с рифлёной опорой

## Идентичность и статус

- Model ID: `table-05-round-fluted-pedestal`.
- Предлагаемый label: «Круглый стол с рифлёной опорой».
- Standard: **v2.4**; SHA-256 приложенного стандарта: `db45cadd1b6e361b7a4b9cf9622f67243959a78602cec81568a5c60dc21ec80a`.
- Type: constructor-ready; зарегистрирована в integration-пакете. Автоматическая приёмка пройдена, визуальная приёмка в приложении ожидается.
- Runtime compatibility: **Supported by current engine** после включённого generic исправления `refreshTextures()`. Новые resize-rules не требуются; см. `docs/updates/round-tables-05-06-integration.md`.
- Geometry resize: **Supported by current engine** (`Scale X` + `Scale Z`, один diameter).

## Размеры

| Параметр | Base / min | Max | Шаг | Поведение |
|---|---:|---:|---:|---|
| diameter | 1.10 м | 1.40 м | 0.01 м | centered, X + Z |
| height | 0.76 м | фиксировано | — | height-fixed |
| tabletop thickness | 0.022 м | фиксировано | — | thickness-fixed |

Масштаб: 1 unit = 1 м. Root=(0,0,0), rotation=0, scale=1; контакт с полом Y=0.
Front: +Z для унификации превью; конструкция вращательно симметрична с дискретным рифлением.
Изменяется только диаметр. Круг сохраняется, стол не превращается в эллипс или
капсулу, механизм раздвижения и вставки не моделируются.

## Иерархия и pivots

- `Furniture_Root`: parent `None`; Fixed.
- `Base_Assembly`: parent `Furniture_Root`; Fixed.
- `TableTop`: parent `Furniture_Root`; Scale X/Z.
- `Base_Disc`: parent `Base_Assembly`; Fixed.
- `Top_Mount`: parent `Base_Assembly`; Fixed.
- `Fluted_Column`: parent `Base_Assembly`; Fixed.

`TableTop` и `Base_Assembly` — соседние nodes. Scale-target не содержит основание.
Pivot столешницы: центр по X/Z, середина её толщины по Y, мировая высота
0.7490 м. Основание не перемещается и не масштабируется.
Поверхности столешницы — три primitives одного экспортированного mesh; GLTFLoader
может представить его как Group с тремя Mesh. Управляемый node `TableTop` стабилен.
Наклонные опоры малого стола запечены в локальные координаты без rotation/scale;
их продольные unit vectors и длины записаны в extras. Local Y не объявляется
продольной осью наклонной опоры и не используется для её runtime resize.

## Контур и readiness

Profile: `Uniform scaling acceptable` в горизонтальной плоскости. Небольшой
bevel столешницы 1 мм по радиусу при base; он изменяется пропорционально
диаметру до 1.273 мм. По высоте bevel и толщина не меняются.
Отдельное сохранение фиксированного радиуса фаски не заявляется.

`height-fixed`: нет height dimension, floor-anchored stretch contract или
согласованных rules подъёма столешницы/монтажной детали. `height-ready` не заявляется.
`thickness-fixed`: толщина запечена в GLB; нет runtime thickness dimension,
thickness anchor или связанных moving targets. Текущий pivot в центре толщины
не означает готовность к настройке толщины. `thickness-ready` не заявляется.

## Материалы и пользовательские slots

| Точный material.name | Роль | Slot | UV при diameter resize |
|---|---|---|---|
| Stone_Top | Плоский верх | primaryTop | U и V |
| Stone_Bottom | Плоский низ | primaryTop | U и V |
| Stone_Edge_Round | Круговой торец и скруглённые переходы | primaryTop | Только U |
| Metal_Frame | Все части основания и крепления | frameMetal | Fixed; procedural finishes |

Каждый target входит ровно в один slot. `primaryTop` и `frameMetal` независимы.
Отдельные long/short surfaces у круга не нужны; круговой торец имеет собственный
UV-контракт. Дополнительные материалы не создавались.

Default: `primaryTop = marble-black-gold`, `frameMetal = metal-black-matte`.
Для основания: metal-black-matte, metal-white-matte, metal-anthracite.
Для столешницы: oak-natural, walnut-natural, pine-coated, ash-natural, oak-grey,
oak-silver, oak-black, concrete-light, marble-cream, marble-white-gold,
marble-black-gold, marble-duo-gold, terrazzo-neutral.
Все IDs проверены в восстановленном registry с material-library-v1.
Каталог и UI в рамках этой задачи не изменялись.

## UV / PBR

Один период текстуры соответствует одному метру геометрии при base.
Верх/низ: planar UV по X/Z с центром (0.5, 0.5), `diameter -> ['x','y']`.
Торец: U развёрнут вдоль окружности, seam на -Z; V — вдоль профиля толщины
и bevel. `diameter -> 'x'`; thickness используется только в статической UV.
Изначальная длина U на торце равна πD. Масштабирование U компенсирует увеличение
окружности; V остаётся постоянным. На узком скруглении есть небольшой допустимый
компромисс: U использует наружный радиус, поэтому плотность внутри bevel
незначительно отличается от вертикальной части. Повторное применение коэффициента
при смене другого slot исправлено в общем runtime integration-пакета.
Регрессионные тесты сохранены; UV и сам GLB не менялись.

В GLB встроены base color, Normal GL и packed metallic/roughness.
Рисунок золотых прожилок — пигмент, metalness столешницы = 0.
Semantic stone surfaces содержат normals, UV0 и tangents. Однотонный металл
не содержит ненужных UV и normal-map атрибутов.

## Подтверждённые и восстановленные размеры

Из фото: Ø110 см, высота 76 см, колонна Ø23 см.
Из задания: максимальный диаметр 140 см. Толщина
22 мм — принятое проектное значение (22 мм как в ранее согласованной столешнице table-03),
не измерение фотографии и не утверждение универсального стандарта толщины.

Остальные размеры восстановлены по пропорциям референса: Диск основания Ø590 × 24 мм; верхняя монтажная плита Ø320 × 14 мм; 72 геометрических каннелюры, наружный диаметр колонны 230 мм, глубина рифления 5 мм. Диск имеет bevel 1.5 мм, верхняя плита — 1 мм. Нижний торец колонны Y=0.022 м входит в диск с верхней плоскостью Y=0.024 м; верхний торец Y=0.732 м входит в монтажную плиту Y=0.725…0.739 м.
Фурнитура, скрытые механизмы, товарные надписи, окружение и стулья не включены.
Рисунок finish — существующий каталог проекта, не точная копия рисунка товара.

## Performance / source

- GLB: 2,011,788 bytes; SHA-256 `b7dd9a612b372a05eebb4211b2a36061a1a11c164b1b13188b11e715d287830f`.
- Triangles: 13824; glTF mesh nodes: 4; materials: 4; draw calls: 10.
- 3 embedded PBR maps, 2048 × 2048.
- Compression, lights, camera, floor, skins, morphs, animation отсутствуют в GLB.
- Uses shared configurator scene/environment. Превью-сцена — только offline QA.
- `.blend` отсутствует: Blender не доступен. Приложен `create_model.py`,
  синтаксис проверен; запуск и Blender reimport должны быть выполнены позднее.

Результаты обязательных проверок и ограничения — в `validation-report.md`.
