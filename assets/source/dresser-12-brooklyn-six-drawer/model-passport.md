# Паспорт модели 12 — Комод «Бруклин»

## Model

- Model ID: `dresser-12-brooklyn-six-drawer`.
- Type: constructor-ready **на уровне геометрии**.
- Runtime compatibility: **Requires engine extension** — affine UV и полный каталог покрытий плит; подробности в корневом INTEGRATION_REQUIREMENTS.md.
- Base dimensions (Ш × В × Г): **1600 × 680 × 450 мм**.
- GLB: `public/models/dresser-12-brooklyn-six-drawer.glb`.
- Config: `src/three/models/dresser-brooklyn-six-drawer/config.ts`, export `DRESSER_12_CONFIG`.
- Front: +Z. 1 unit = 1 metre. Root `Dresser_12_Root` имеет position 0, rotation 0, scale 1. Пол Y=0.

## Configurable parameters и anchors

| Parameter | Base, мм | Min, мм | Max, мм | Step, мм |
|---|---:|---:|---:|---:|
| width | 1600 | 1200 | 2000 | 1 |
| height | 680 | 550 | 900 | 1 |
| depth | 450 | 350 | 600 | 1 |

width → X, центр; height → Y, пол; depth → Z, центр. Диапазоны — проектные допущения. Height readiness: **height-configurable**. Thickness readiness: **thickness-fixed**. Основные плиты 16 мм, задняя стенка 4 мм, днище ящика 6 мм. Толщина не является параметром UI; отдельный thickness anchor не требуется.

## Конструкция и профиль

Шесть ящиков: две равные колонки по три. Белые глянцевые фасады roughness 0,14. Наклонные накладные ручки с округлёнными углами, ширина 120 мм, выступ 24 мм. Зазоры 4 мм, шесть низких опор 10 мм. Сечения и размеры фурнитуры оценочные.

6 ящиков, 0 дверей, 0 внутренних полок. В model-contract.json/parts приведены точные базовые размеры и коэффициенты изменения каждой детали; неподписанные в референсе числа являются авторскими оценками.

Profile-resize behavior: **Segmented resize required / Preserve fixed corner radius**. Плита разделена на девять сегментов: прямые участки растягиваются, кромки и углы перемещаются, bevel 0,7 мм постоянен. Целиком группа фасада или ящика не масштабируется. Наружная фурнитура сохраняет форму. У направляющих меняется только длина Z.

## Node structure и controlled behavior

| Узел / группа | Поведение |
|---|---|
| Dresser_12_Root | Fixed, floor Y=0 |
| Carcass_Assembly | Общий родитель корпуса и неподвижной фурнитуры |
| Panel_Top / Bottom / Side_Left / Side_Right / Back | Delta move + stretch segment; толщина фиксирована |
| Panel_Divider_* / Shelf_* при наличии | Перемещение по долям секций; растяжение в плоскости |
| Drawer_NN_Assembly | Независимая группа, ось будущего выдвижения +Z |
| Drawer_NN_Front / Bottom / Side_* / Back / Inner_Front | Фасад и короб отдельно; высота меняется на 1/3 общей дельты |
| Door_*_Hinge при наличии | Ось Y у наружного переднего ребра, угол 105° наружу |
| Handle_* / Drawer_NN_Handle | Fixed geometry; delta move с кромкой или центром фасада |
| Mechanism_Steel / Foot_Plastic | Фиксированная группа материалов, не перекрашивается вместе с фасадами |

Иерархия и полные имена узлов перечислены в mesh-source.json; resizeRules содержит TypeScript config. Локальные дельты учитывают родителя и не складывают одну и ту же мировую дельту дважды. Оси панели совпадают с X/Y/Z; наклон Brooklyn запечён в вершины ручки, runtime не растягивает ручку. Минимальная конфигурация сохраняет положительные размеры частей и зазоры.

## Материалы и UV

Корпус #eeeeec, фасады #f4f4f1, metalness 0. Фасад roughness 0.14. Нейтральные карты 1×1 сохраняют однотонный материал при resize.

Штатный hardware slot использует metal-white-matte; доступные зарегистрированные варианты: metal-black-matte / metal-white-matte / metal-anthracite.

Группы: carcass — корпус и внутренние детали; fronts — фасады вместе с декором; hardware — наружные ручки при наличии; fixed — направляющие, петли и опоры. `MATERIAL_TARGETS` экспортирован конфигом. `createMaterialReviewDefinition` проверяет независимую смену групп с реальными существующими finish IDs. Точные имена находятся также в material-targets.md и model-contract.json.

UV: одна единица на метр в базе. Боковины (X): U=Z, V=Y; горизонтальные панели (Y): U=Z, V=X; фасады/задние стенки (Z): U=X, V=Y. Торцы имеют отдельные привязки толщины и продольной оси. Custom surfaces декора и их торцы имеют отдельные UV-привязки и ненулевые tangent frames. На древесном дубовом материале волокно идёт по V.

Для каждого материала uvContract задаёт baseLength, stretchFactor, translationFactor, anchor отдельно для U/V. Поверхности объединены по материалу только при одинаковом поведении. Штатный textureAxes намеренно пуст: старое API не выражает точную полезную длину или фазу движущейся кромки. После resize рисунок дерева требует общей affine-компенсации. Материалы oak-natural/oak-grey и walnut-natural имеют разное направление волокон; нормализация каталога остаётся задачей интеграции.

## Pivots и scene requirements

Дверь — внешний передний угол, локальная Y; ящик — отдельная группа с локальной +Z. Технические позы задаёт export_preview_states.ts после обычного resize; интерактивные анимации не добавлены. Количество секций/ящиков/полок не меняется.

Uses shared configurator scene/environment. В GLB нет собственных камер, источников света или HDRI. CPU-превью использует отдельную техническую сцену; это не проверка браузерного WebGL.

## Performance

| Метрика | Значение |
|---|---:|
| GLB bytes | 3137696 |
| Triangles | 14088 |
| Nodes glTF | 470 |
| Mesh records glTF | 414 |
| Primitives | 918 |
| Materials | 191 |
| Физические детали | 78 |
| Декоративные узлы | 0 |
| Resize rules | 279 |

Текстуры: нейтральные 1×1, точный список в texture-info.json. Объём GLB определяется отдельными управляемыми деталями и сегментами плит. Высокое число primitives/materials связано с сохранением толщины/bevel и отдельными UV-поверхностями при resize; GPU FPS/draw-call budget на целевом устройстве не измерен. Не использовать неподдерживаемые Draco/Meshopt/KTX2 без общей поддержки загрузчика.

## Source и Three.js handoff

mesh-source.json — полная редактируемая геометрия и иерархия; build_model.mjs побайтно воспроизводит GLB. create_model.py восстанавливает сцену в Blender, сохраняет .blend и проверочный GLB с реимпортом; здесь Blender отсутствует, выполнен только ast.parse. Фиктивного .blend нет.

При подключении не добавлять modelId/node-specific условия в общий controller. Зарегистрировать модель декларативно, добавить реальные покрытия ЛДСП/глянец/кашемир и латунь, выполнить affine UV, затем WebGL/Blender-проверки на актуальном main. SHA256 GLB: `75a8364a32d8e01b86a85ab0aeda4ad119e449c819038fe50e44c70928f5b497`.

## Соединения фасадов — opening-joints v1, 21 сентября 2026

Короб ящика доходит до задней поверхности фасада: номинальный зазор 0 мм. Боковины и дно удлинены вперёд, внутренняя передняя стенка перенесена к фасаду; задний отступ сохранён.

Пересобраны GLB, mesh-source, контракт, resize и affine UV. Актуальная проверка: [отчёт по соединениям](../opening-joints-integration/validation-report.md). Прежние превью и отчёты авторинга сохраняются как история и не подтверждают эту ревизию.
