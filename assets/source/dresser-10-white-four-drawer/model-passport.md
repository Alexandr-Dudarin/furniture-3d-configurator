# Паспорт модели 10 — Белый комод, 4 ящика

## Model

- Model ID: `dresser-10-white-four-drawer`.
- Type: constructor-ready **на уровне геометрии**.
- Runtime compatibility: **Requires engine extension** — affine UV и полный каталог покрытий плит; подробности в корневом INTEGRATION_REQUIREMENTS.md.
- Base dimensions (Ш × В × Г): **700 × 856 × 350 мм**.
- GLB: `public/models/dresser-10-white-four-drawer.glb`.
- Config: `src/three/models/dresser-white-four-drawer/config.ts`, export `DRESSER_10_CONFIG`.
- Front: +Z. 1 unit = 1 metre. Root `Dresser_10_Root` имеет position 0, rotation 0, scale 1. Пол Y=0.

## Configurable parameters и anchors

| Parameter | Base, мм | Min, мм | Max, мм | Step, мм |
|---|---:|---:|---:|---:|
| width | 700 | 500 | 1000 | 1 |
| height | 856 | 700 | 1050 | 1 |
| depth | 350 | 300 | 500 | 1 |

width → X, центр; height → Y, пол; depth → Z, центр. Диапазоны — проектные допущения. Height readiness: **height-configurable**. Thickness readiness: **thickness-fixed**. Основные плиты 16 мм, задняя стенка 4 мм, днище ящика 6 мм. Толщина не является параметром UI; отдельный thickness anchor не требуется.

## Конструкция и профиль

Четыре одинаковых накладных ящика без наружных ручек, цоколь 60 мм, боковой свес крышки 2 мм. На карточке глубина 350 мм, на схеме 330 мм: в модели 350 мм — общий закрытый габарит, 330 мм — корпус без фасадов. Это согласующее допущение, не подтверждённый чертёж производителя. Вертикальные зазоры между фасадами 6 мм.

4 ящиков, 0 дверей, 0 внутренних полок. В model-contract.json/parts приведены точные базовые размеры и коэффициенты изменения каждой детали; неподписанные в референсе числа являются авторскими оценками.

Profile-resize behavior: **Segmented resize required / Preserve fixed corner radius**. Плита разделена на девять сегментов: прямые участки растягиваются, кромки и углы перемещаются, bevel 0,7 мм постоянен. Целиком группа фасада или ящика не масштабируется. Наружная фурнитура сохраняет форму. У направляющих меняется только длина Z.

## Node structure и controlled behavior

| Узел / группа | Поведение |
|---|---|
| Dresser_10_Root | Fixed, floor Y=0 |
| Carcass_Assembly | Общий родитель корпуса и неподвижной фурнитуры |
| Panel_Top / Bottom / Side_Left / Side_Right / Back | Delta move + stretch segment; толщина фиксирована |
| Panel_Divider_* / Shelf_* при наличии | Перемещение по долям секций; растяжение в плоскости |
| Drawer_NN_Assembly | Независимая группа, ось будущего выдвижения +Z |
| Drawer_NN_Front / Bottom / Side_* / Back / Inner_Front | Фасад и короб отдельно; высота меняется на 1/4 общей дельты |
| Door_*_Hinge при наличии | Ось Y у наружного переднего ребра, угол 105° наружу |
| Handle_* / Drawer_NN_Handle | Fixed geometry; delta move с кромкой или центром фасада |
| Mechanism_Steel / Foot_Plastic | Фиксированная группа материалов, не перекрашивается вместе с фасадами |

Иерархия и полные имена узлов перечислены в mesh-source.json; resizeRules содержит TypeScript config. Локальные дельты учитывают родителя и не складывают одну и ту же мировую дельту дважды. Оси панели совпадают с X/Y/Z; наклон Brooklyn запечён в вершины ручки, runtime не растягивает ручку. Минимальная конфигурация сохраняет положительные размеры частей и зазоры.

## Материалы и UV

Корпус #eeefed, фасады #f4f4f2, metalness 0. Фасад roughness 0.5. Нейтральные карты 1×1 сохраняют однотонный материал при resize.

Наружных ручек нет; внутренние направляющие имеют фиксированный Mechanism_Steel. Пользовательский слот hardware не нужен.

Группы: carcass — корпус и внутренние детали; fronts — фасады вместе с декором; hardware — наружные ручки при наличии; fixed — направляющие, петли и опоры. `MATERIAL_TARGETS` экспортирован конфигом. `createMaterialReviewDefinition` проверяет независимую смену групп с реальными существующими finish IDs. Точные имена находятся также в material-targets.md и model-contract.json.

UV: одна единица на метр в базе. Боковины (X): U=Z, V=Y; горизонтальные панели (Y): U=Z, V=X; фасады/задние стенки (Z): U=X, V=Y. Торцы имеют отдельные привязки толщины и продольной оси. Custom surfaces декора и их торцы имеют отдельные UV-привязки и ненулевые tangent frames. На древесном дубовом материале волокно идёт по V.

Для каждого материала uvContract задаёт baseLength, stretchFactor, translationFactor, anchor отдельно для U/V. Поверхности объединены по материалу только при одинаковом поведении. Штатный textureAxes намеренно пуст: старое API не выражает точную полезную длину или фазу движущейся кромки. После resize рисунок дерева требует общей affine-компенсации. Материалы oak-natural/oak-grey и walnut-natural имеют разное направление волокон; нормализация каталога остаётся задачей интеграции.

## Pivots и scene requirements

Дверь — внешний передний угол, локальная Y; ящик — отдельная группа с локальной +Z. Технические позы задаёт export_preview_states.ts после обычного resize; интерактивные анимации не добавлены. Количество секций/ящиков/полок не меняется.

Uses shared configurator scene/environment. В GLB нет собственных камер, источников света или HDRI. CPU-превью использует отдельную техническую сцену; это не проверка браузерного WebGL.

## Performance

| Метрика | Значение |
|---|---:|
| GLB bytes | 2180512 |
| Triangles | 9192 |
| Nodes glTF | 326 |
| Mesh records glTF | 286 |
| Primitives | 646 |
| Materials | 190 |
| Физические детали | 46 |
| Декоративные узлы | 0 |
| Resize rules | 196 |

Текстуры: нейтральные 1×1, точный список в texture-info.json. Объём GLB определяется отдельными управляемыми деталями и сегментами плит. Высокое число primitives/materials связано с сохранением толщины/bevel и отдельными UV-поверхностями при resize; GPU FPS/draw-call budget на целевом устройстве не измерен. Не использовать неподдерживаемые Draco/Meshopt/KTX2 без общей поддержки загрузчика.

## Source и Three.js handoff

mesh-source.json — полная редактируемая геометрия и иерархия; build_model.mjs побайтно воспроизводит GLB. create_model.py восстанавливает сцену в Blender, сохраняет .blend и проверочный GLB с реимпортом; здесь Blender отсутствует, выполнен только ast.parse. Фиктивного .blend нет.

При подключении не добавлять modelId/node-specific условия в общий controller. Зарегистрировать модель декларативно, добавить реальные покрытия ЛДСП/глянец/кашемир и латунь, выполнить affine UV, затем WebGL/Blender-проверки на актуальном main. SHA256 GLB: `ea63cd908f3d3a7704282a1e5ec5b09f1a64d3d487fcaec4cf07f54d68459ee5`.
