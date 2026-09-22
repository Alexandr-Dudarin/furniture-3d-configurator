# Model package — шкаф 15 «Катания-4.2»

Дата: 22.09.2026. Стандарт: **v2.7**. Формат: **model-only ZIP** для центрального integration-чата.

В пакете одна новая модель. Общие исходники, registry, другие модели, `node_modules`, `dist`, `.git` и полная копия проекта не включены. Пользователь передаёт пакет основному чату разработки; подключение и финальный интеграционный архив выполняются там.

## Модель и параметры

| Поле | Значение |
|---|---|
| Model ID | `wardrobe-15-katania-four-door` |
| Label / category | `Шкаф «Катания-4.2»` / `wardrobes` |
| GLB URL | `/models/wardrobe-15-katania-four-door.glb` |
| Model folder | `src/three/models/wardrobe-katania-four-door/` |
| Catalogue export | `catalogue` из `catalog.ts` |
| Runtime export | `definition` из `runtime.ts` → `WARDROBE_15_CONFIG` |
| База, Ш × В × Г | 1600 × 1900 × 400 мм |
| Минимум | 1600 × 1900 × 400 мм |
| Максимум | 2400 × 2700 × 600 мм |
| Шаг | 1 мм по каждой оси |
| Готовность | height-configurable; thickness-fixed |
| GLB размер | 4 350 804 байта / 4,15 MiB |

Исходный snapshot: `furniture-3d-configurator под архив (2).zip`, SHA-256 `18dc7a516c8b7e0436eaa018d7b002ad8070965a117888cb953e4a0e9d36eb36`. Локальная ветка создания `feat/model-wardrobe-15-katania`; baseline `7b1de12acdc9f40e74272fa96df7e4de23bb1855` относится только к локальному snapshot.

## Registry: точная предлагаемая запись

В актуальном `src/configurator/furnitureRegistry.ts` центральному чату добавить:

```ts
import { catalogue as wardrobe15 } from '../three/models/wardrobe-katania-four-door/catalog'
```

В существующий Map:

```ts
[wardrobe15.id, wardrobe15],
```

Не переносить старую копию registry и не импортировать полный конфиг в начальный каталог. Пошаговый handoff: `docs/updates/wardrobe-15-katania-handoff.md`.

## Используемые механизмы и материалы

Текущий движок уже поддерживает всё поведение данного фиксированного наполнения: `stretch-segment`, `delta-move`, affine `textureTransforms`, независимые `materialSlots`, lazy runtime, `interiorView`, door `articulations`, `motion.withClosedPose`. Общие изменения runtime для этого пакета не нужны.

| Группа | Материалы | Существующее покрытие по умолчанию |
|---|---|---|
| `carcass` | 168 `Board_*`; точные имена в `model-contract.json → materialTargets.carcass` | `board-graphite-matte` |
| `fronts` | 196 `Front_Fluted_*`; точные имена в `model-contract.json → materialTargets.fronts` | `board-graphite-matte` |
| `hardware` | `Hardware_Metal` | `metal-black-matte` |
| `fixed` | `Mechanism_Steel` | фиксированный стальной материал, вне UI выбора |

Полные API-имена также экспортированы в `MATERIAL_TARGETS` из `config.ts`. Корпус, фасады и ручки выбираются независимо. Используются существующие однотонные, дубовые и металлические покрытия общего каталога. Новых finish IDs и тяжёлых дублей PBR-изображений нет; GLB содержит только три карты 1 × 1 суммарно 207 байт.

## Проверка

- Production GLB: glTF Validator 2.0.0-dev.3.10, **0 errors / 0 warnings**.
- Полный прогон с временно подключённым шкафом: `npm test -- --maxWorkers=1 --testTimeout=15000`, **312 / 312 tests, 41 / 41 files passed**.
- `npm run build` с подключённым шкафом: **PASS**. Новый runtime — отдельный lazy chunk 367,64 kB / 19,40 kB gzip. Предупреждение о существующем SceneView >500 kB было уже в baseline.
- Исходный `npm test`: 299 / 300, один тайм-аут старого теста столешницы; отдельный повтор файла прошёл 24 / 24. В некоторых дальнейших запусках эти тесты снова превысили 5 секунд. Лимит 15 секунд применялся только флагом запуска, общие тесты не изменены.
- Проверены реальные размеры, 1 мм, сохранение толщин и канавок, точный возврат, независимые материалы, физические UV, четыре двери каждые 5°, resize при открытых дверях и скрытие фасадов.
- Повторная генерация семи outputs детерминирована; `reproduction-report.json` содержит hashes. Синтаксис авторинговых MJS и Python проверен.
- Просмотрены CPU-превью base/max, открывания, материалов и деталей. WebGL/FPS и Blender roundtrip остаются финальными этапами интеграции. Приложен настоящий воспроизводимый Blender script; фиктивного `.blend` нет.

Подробности и логи: `assets/source/wardrobe-15-katania-four-door/validation-report.md` и `evidence/`.

## Все принятые допущения и ограничения

1. База, диапазоны, четыре накладных фасада, цоколь 80 мм и его перекрытие на 30 мм взяты из скриншотов. Шаг 1 мм — настройка конструктора, а не подтверждённый шаг заказа изготовителя.
2. Четыре равных отделения, по одной верхней полке. Точная деталировка неизвестна; корпус 16 мм, фасады 18 мм, задник 4 мм и фурнитура оценены по изображению. Это визуальный 3D-ассет, не производственный чертёж.
3. Торцевые кронштейны остаются во всём диапазоне 400–600 мм. Замена на поперечные штанги от 500 мм, указанная в карточке, и выдвижение кронштейнов не реализованы; для них потребуется общий механизм вариантов.
4. По 48 канавок на дверь: ширина 3 мм, глубина 1,8 мм, фаски 0,25 мм — оценки. Сечение и количество сохраняются, расширяются плоские промежутки. Срезы открывают профиль; боковины корпуса имеют радиус 0,7 мм. Прямые тыльные стыки сегментов могут иметь совпадающие T-junction.
5. Четыре ручки длиной 800 мм и выступом 28 мм — оценки; габаритная глубина включает закрытые ручки. Межфасадные зазоры 3 мм, сверху 3 мм, за закрытым фасадом 4 мм — принятые значения.
6. Вращение дверей ±105° — существующая визуальная модель осевой петли; фурнитура упрощена. Количество полок/секций не меняется.
7. Графитовый `board-graphite-matte` — приближение к фотографии. Типы ЛДСП/МДФ переданы через существующие покрытия; новая специализированная плёнка не создавалась.
8. Карточка указывает кромку 1 мм и шаг перфорации 128 мм; отдельная лента, неиспользуемые отверстия и скрытые крепежи не геометризованы.
9. 18 652 треугольника, 1 397 glTF meshes, 1 601 примитив и 366 материалов. Повышенное число draw calls связано с сохранением профиля и UV; GPU-производительность не измерена.
10. Blender в среде отсутствует, браузерный WebGL не проверен. Запустить Blender script и реальную сцену конструктора при интеграции; команды даны в handoff и README.

## Полный список файлов

Все пути ниже относительны корню проекта. `MODEL_PACKAGE_SHA256SUMS.txt` содержит SHA-256 каждого файла кроме себя.

<!-- FILE-LIST -->
```text
MODEL_PACKAGE_MANIFEST.md
MODEL_PACKAGE_SHA256SUMS.txt
assets/source/wardrobe-15-katania-four-door/README.md
assets/source/wardrobe-15-katania-four-door/build_model.mjs
assets/source/wardrobe-15-katania-four-door/create_model.py
assets/source/wardrobe-15-katania-four-door/evidence/baseline-build.txt
assets/source/wardrobe-15-katania-four-door/evidence/baseline-edge-profile-retry.txt
assets/source/wardrobe-15-katania-four-door/evidence/baseline-test.txt
assets/source/wardrobe-15-katania-four-door/evidence/final-build.txt
assets/source/wardrobe-15-katania-four-door/evidence/final-test.txt
assets/source/wardrobe-15-katania-four-door/evidence/final-validator.txt
assets/source/wardrobe-15-katania-four-door/evidence/final-with-default-time-limit.txt
assets/source/wardrobe-15-katania-four-door/export_preview_states.ts
assets/source/wardrobe-15-katania-four-door/gltf-validator-report.json
assets/source/wardrobe-15-katania-four-door/mesh-source.json
assets/source/wardrobe-15-katania-four-door/model-contract.json
assets/source/wardrobe-15-katania-four-door/model-passport.md
assets/source/wardrobe-15-katania-four-door/model-spec.json
assets/source/wardrobe-15-katania-four-door/package-lock.json
assets/source/wardrobe-15-katania-four-door/package.json
assets/source/wardrobe-15-katania-four-door/performance.json
assets/source/wardrobe-15-katania-four-door/prepare_previews.mjs
assets/source/wardrobe-15-katania-four-door/preview-states.json
assets/source/wardrobe-15-katania-four-door/preview-verification.json
assets/source/wardrobe-15-katania-four-door/previews/base.png
assets/source/wardrobe-15-katania-four-door/previews/half-open.png
assets/source/wardrobe-15-katania-four-door/previews/hinge-side.png
assets/source/wardrobe-15-katania-four-door/previews/interior-base.png
assets/source/wardrobe-15-katania-four-door/previews/intermediate.png
assets/source/wardrobe-15-katania-four-door/previews/materials-open-max.png
assets/source/wardrobe-15-katania-four-door/previews/max.png
assets/source/wardrobe-15-katania-four-door/previews/open-base.png
assets/source/wardrobe-15-katania-four-door/previews/overview.png
assets/source/wardrobe-15-katania-four-door/previews/profile-detail.png
assets/source/wardrobe-15-katania-four-door/previews/return-base.png
assets/source/wardrobe-15-katania-four-door/references/reference-01-exterior.png
assets/source/wardrobe-15-katania-four-door/references/reference-02-interior.png
assets/source/wardrobe-15-katania-four-door/references/reference-03-fluted-panel.png
assets/source/wardrobe-15-katania-four-door/references/reference-04-dimensions.png
assets/source/wardrobe-15-katania-four-door/render_previews.py
assets/source/wardrobe-15-katania-four-door/reproduction-report.json
assets/source/wardrobe-15-katania-four-door/requirements-preview.txt
assets/source/wardrobe-15-katania-four-door/runtime-contract.md
assets/source/wardrobe-15-katania-four-door/textures/metallic-roughness.png
assets/source/wardrobe-15-katania-four-door/textures/neutral-color.png
assets/source/wardrobe-15-katania-four-door/textures/normal-gl.png
assets/source/wardrobe-15-katania-four-door/textures/roughness.png
assets/source/wardrobe-15-katania-four-door/validate_model.mjs
assets/source/wardrobe-15-katania-four-door/validation-report.md
docs/updates/wardrobe-15-katania-handoff.md
public/models/wardrobe-15-katania-four-door.glb
src/three/models/wardrobe-katania-four-door/catalog.ts
src/three/models/wardrobe-katania-four-door/config.ts
src/three/models/wardrobe-katania-four-door/runtime.ts
src/three/models/wardrobe-katania-four-door/wardrobe.test.ts
```
