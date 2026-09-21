# Передача центральному чату: шкафы 07–08

**Пакет моделей для ревью. Полная интеграция требует общих доработок.**

Геометрия, размеры, постоянные толщины, кромки, зазоры, отдельные ручки/ящики и возврат проверены. Даны настоящие GLB, FurnitureDefinition, tests и исходники. Generic engine, registry, App, state, общая material system и package-lock не изменены.

## 1. Подключение для ревью геометрии

В изолированной интеграционной ветке импортировать новые model files. Предлагаемые записи registry:

```ts
import { WARDROBE_07_CONFIG } from '../three/models/wardrobe-center-drawers/config'
import { WARDROBE_08_CONFIG } from '../three/models/wardrobe-four-door/config'

// В существующий Map:
[WARDROBE_07_CONFIG.id, WARDROBE_07_CONFIG],
[WARDROBE_08_CONFIG.id, WARDROBE_08_CONFIG],
```

Основные configs намеренно оставляют исходный серый ЛДСП в GLB и включают только зарегистрированный `hardware` slot. `createMaterialReviewDefinition` позволяет проверить независимые `carcass`/`fronts`/`hardware` на существующих finishes, но не объявляется production-конфигом с готовым textured resize.

## 2. Общая UV-компенсация по полезной длине и фазе

Текущий runtime рассчитывает repeat как `dimension/base`. Размер полезного участка плиты рассчитывается как `baseLength + delta*factor`. Это разные величины при постоянной толщине, зазоре и высоте нижнего блока. Простая замена `textureAxes` на привычные U/V bindings недостаточна.

Проверка на реальных GLB с доступными legacy bindings:

| Модель | Поверхность | Ожидаемый repeat V при H=2.4 м | Текущий legacy repeat V | Ошибка размера рисунка |
|---|---|---:|---:|---:|
| 07 | `Front_Door_Short_ccc_Z` | 1.2704803358 | 1.1695906433 | 8.626069% |
| 08 | `Front_Door_Tall_ccc_Z` | 1.0937822376 | 1.0909090909 | 0.263372% |

Каждая плита разбита на девять сегментов для сохранения кромок. У перемещаемых, но не растягиваемых сегментов нужно дополнительно менять фазу UV; иначе рисунок перестанет сходиться на стыке с центральным участком.

В `assets/source/<id>/model-contract.json → uvContract` уже есть данные по каждой semantic surface и отдельным U/V:

```text
dimension
baseLength
stretchFactor
translationFactor
anchor
uvUnitsPerMeter = 1

delta  = dimensionCurrent − dimensionBase
factor = (baseLength + delta × stretchFactor) / baseLength
repeat = initialRepeat × factor
offset = initialOffset
       + initialRepeat × (anchor × (1 − factor) + delta × translationFactor)
```

Это предложение данных для общего расширения, не поля действующего FurnitureDefinition. Текущий model-only config не подделывает поддержку таких полей и не вводит искусственные dimensions для UI. Конкретный новый TypeScript API согласовать в центральной ветке, затем преобразовать предоставленные bindings в него.

Проверить: отдельные U/V; кромки, центральные участки и углы; перемещение и растяжение без drift; min/base/intermediate/max/return; все карты finish; resize → смена соседнего slot → resize; вращение/нормализацию рисунка, если она предусмотрена. Сохранить исправление `refreshTextures`, которое уже есть в исходном архиве.

Диагностика воспроизводится `node assets/source/<id>/prepare_checks.mjs compatibility`, возвращает код **2** и пишет `runtime-compatibility.json`. Зелёный `npm test` проверяет выполненную геометрию и независимость materials, но не отменяет этот отдельный gate.

## 3. Реальный ЛДСП в общем каталоге

Добавить неметаллические board finishes для серого/белого/графитового покрытия с настоящими зарегистрированными ID. Metalness 0; roughness подобрать как матовый ламинат, а не использовать metallic finish. Не переименовывать `metal-anthracite` в ЛДСП.

Затем включить `carcass` и `fronts` как обычные независимые slots по `BOARD_MATERIAL_TARGETS`. Список targets уже однозначен, пересечений нет. В model-only package отсутствуют вымышленные finish IDs.

Для древесных вариантов сохранить соглашение: V идёт вдоль основного направления волокон детали. `oak-natural`/`oak-grey` уже визуально подходят этому соглашению; исходный `walnut-natural` имеет горизонтальный рисунок вдоль U. Его следует нормализовать в общем наборе карт либо поддержать общий finish rotation согласованно с normal maps и UV compensation. Не добавлять условия по wardrobe modelId.

## 4. UI и будущие действия

Текущий `value.toFixed(2)` в метрах скрывает 1601/2052 мм и шаг 1 мм. Нужен общий форматтер по step или показ миллиметров. Точность GLB/controller уже сохранена.

Door pivots и drawer assemblies подготовлены. Интерактивное открывание, выдвижение, скрытие фасадов и изменение числа полок остаются отдельной функцией. Открытые PNG получены ручным позированием в проверочном скрипте; это не демонстрация существующей кнопки приложения.

## 5. Финальный интеграционный gate

После общего расширения: включить board slots, применить реальные affine UV bindings, добавить проверки физической плотности и фазы на вершинах после resize/material switch, затем выполнить npm test/build и браузерный визуальный smoke с переключением моделей. Существующие тесты geometry сохраняются.

WebGL/FPS и Blender export/reimport в этом пакете **NOT RUN**. GLB прошли Khronos Validator с 0 errors / 0 warnings / 0 infos / 0 hints. Для Blender переданы реальные mesh-данные и проверенный по синтаксису script; `.blend` не имитировался. Число primitives — 909 / 579, поэтому после сохранения runtime-контракта полезно профилирование на целевых устройствах.

Не считать пакет полностью интегрированным до выполнения этих шагов.
