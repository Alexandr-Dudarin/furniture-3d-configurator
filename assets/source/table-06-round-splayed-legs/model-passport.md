# Паспорт: Круглый стол на наклонных ножках

## Идентичность и статус

- Model ID: `table-06-round-splayed-legs`.
- Предлагаемый label: «Круглый стол на наклонных ножках».
- Standard: **v2.4**; SHA-256 приложенного стандарта: `db45cadd1b6e361b7a4b9cf9622f67243959a78602cec81568a5c60dc21ec80a`.
- Type: constructor-ready; зарегистрирована в integration-пакете. Автоматическая приёмка пройдена, визуальная приёмка в приложении ожидается.
- Runtime compatibility: **Supported by current engine** после включённого generic исправления `refreshTextures()`. Новые resize-rules не требуются; см. `docs/updates/round-tables-05-06-integration.md`.
- Geometry resize: **Supported by current engine** (`Scale X` + `Scale Z`, один diameter).

## Размеры

| Параметр | Base / min | Max | Шаг | Поведение |
|---|---:|---:|---:|---|
| diameter | 0.85 м | 1.05 м | 0.01 м | centered, X + Z |
| height | 0.73 м | фиксировано | — | height-fixed |
| tabletop thickness | 0.017 м | фиксировано | — | thickness-fixed |

Масштаб: 1 unit = 1 м. Root=(0,0,0), rotation=0, scale=1; контакт с полом Y=0.
Front: +Z для унификации превью; конструкция симметрична с четырьмя ножками.
Изменяется только диаметр. Круг сохраняется, стол не превращается в эллипс или
капсулу, механизм раздвижения и вставки не моделируются.

## Иерархия и pivots

- `Furniture_Root`: parent `None`; Fixed.
- `Base_Assembly`: parent `Furniture_Root`; Fixed.
- `TableTop`: parent `Furniture_Root`; Scale X/Z.
- `Top_Mount`: parent `Base_Assembly`; Fixed.
- `Leg_01`: parent `Base_Assembly`; Fixed.
- `Foot_Pad_01`: parent `Base_Assembly`; Fixed.
- `Leg_02`: parent `Base_Assembly`; Fixed.
- `Foot_Pad_02`: parent `Base_Assembly`; Fixed.
- `Leg_03`: parent `Base_Assembly`; Fixed.
- `Foot_Pad_03`: parent `Base_Assembly`; Fixed.
- `Leg_04`: parent `Base_Assembly`; Fixed.
- `Foot_Pad_04`: parent `Base_Assembly`; Fixed.

`TableTop` и `Base_Assembly` — соседние nodes. Scale-target не содержит основание.
Pivot столешницы: центр по X/Z, середина её толщины по Y, мировая высота
0.7215 м. Основание не перемещается и не масштабируется.
Поверхности столешницы — три primitives одного экспортированного mesh; GLTFLoader
может представить его как Group с тремя Mesh. Управляемый node `TableTop` стабилен.
Наклонные опоры малого стола запечены в локальные координаты без rotation/scale;
их продольные unit vectors и длины записаны в extras. Local Y не объявляется
продольной осью наклонной опоры и не используется для её runtime resize.

## Контур и readiness

Profile: `Uniform scaling acceptable` в горизонтальной плоскости. Небольшой
bevel столешницы 1 мм по радиусу при base; он изменяется пропорционально
диаметру до 1.235 мм. По высоте bevel и толщина не меняются.
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

Default: `primaryTop = marble-white-gold`, `frameMetal = metal-black-matte`.
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

Из фото: Ø85 см, высота 73 см.
Из задания: максимальный диаметр 105 см. Толщина
17 мм — принятое проектное значение (22 мм минус 5 мм),
не измерение фотографии и не утверждение универсального стандарта толщины.

Остальные размеры восстановлены по пропорциям референса: Четыре опоры; сечение 55 × 30 мм с фасками 0.8 мм. Радиус нижних центров 370 мм, верхних — 130 мм; азимуты 45°, 135°, 225°, 315°. Монтажная плита 320 × 320 × 14 мм, Y=0.700…0.714 м; центры верхних торцов Y=0.707 м. Нижние торцы Y=0.004 м входят в подпятники 60 × 35 × 6 мм, контакт Y=0. Торцы опор срезаны горизонтально; полное сечение входит в сопряжения.
Фурнитура, скрытые механизмы, товарные надписи, окружение и стулья не включены.
Рисунок finish — существующий каталог проекта, не точная копия рисунка товара.

## Performance / source

- GLB: 1,658,764 bytes; SHA-256 `d801ae3b427a41a4bb15901ff100e64bfbdaed570c0d9a7342dbcf255227da62`.
- Triangles: 5452; glTF mesh nodes: 10; materials: 4; draw calls: 12.
- 3 embedded PBR maps, 2048 × 2048.
- Compression, lights, camera, floor, skins, morphs, animation отсутствуют в GLB.
- Uses shared configurator scene/environment. Превью-сцена — только offline QA.
- `.blend` отсутствует: Blender не доступен. Приложен `create_model.py`,
  синтаксис проверен; запуск и Blender reimport должны быть выполнены позднее.

Результаты обязательных проверок и ограничения — в `validation-report.md`.
