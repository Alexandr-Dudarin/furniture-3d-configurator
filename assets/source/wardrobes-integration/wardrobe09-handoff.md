# Подключение модели 09: оставшиеся общие задачи

Пакет содержит только новую модель `wardrobe-09-chelsea-two-door`. Не содержит engine patches и не включает модели 07–08. Проверен на переданном snapshot, а не на неизвестном более свежем main.

## 1. Материалы плит

В предоставленном общем каталоге нет однотонного неметаллического серого ЛДСП. GLB сохраняет исходный серый цвет #626466, metalness 0, roughness 0,62. `WARDROBE_09_CONFIG` включает только hardware с существующими finish IDs; не выдаёт окрашенный металл за ЛДСП.

После регистрации настоящих покрытий используйте `BOARD_MATERIAL_TARGETS.carcass` и `.fronts` для независимых materialSlots. `createMaterialReviewDefinition(carcassFinish, frontsFinish, allowedFinishes)` позволяет проверить полную трёхслотовую схему на зарегистрированных материалах, но не решает UV. Нормализуйте направление древесных текстур в общем каталоге (oak-natural/oak-grey: V, walnut-natural: U) либо добавьте общий rotation с корректными normal maps.

## 2. Affine UV

Для каждой U/V привязки из `assets/source/wardrobe-09-chelsea-two-door/model-contract.json → uvContract` нужен общий расчёт:

```text
delta = currentDimension - baseDimension
factor = (baseLength + delta * stretchFactor) / baseLength
repeat = initialRepeat * factor
offset = initialOffset
       + initialRepeat * (anchor * (1 - factor) + delta * translationFactor)
```

Обновлять одинаково Base Color / Roughness / Normal и все остальные карты finish. Исходные repeat/offset захватывать до resize, после material replacement обновлять без накопления. Фиксированные кромки имеют stretchFactor=0, но translationFactor может быть ненулевым — только коррекции repeat недостаточно. `uvContract` является предложением handoff, не существующим полем FurnitureDefinition.

Нынешний runtime использует currentDimension/baseDimension. Для фасада нужный repeat 1.195692689998, фактический legacy 1.186943620178 при высоте 2400 мм; ошибка масштаба 0.737109%. Реальный диагностический скрипт `prepare_checks.mjs compatibility` возвращает **2 / REQUIRES_ENGINE_EXTENSION**. Пустой штатный `textureAxes` намеренно не обещает textured resize. Прежняя проблема повторного ratio в refreshTextures уже исправлена в этом snapshot; текущая affine UV-задача отдельная.

## 3. UI и приёмка

Шаг конфигурации 0,001 м требует отображения миллиметров или трёх знаков после запятой в метрах; текущее toFixed(2) скрывает точный размер. Изменять это следует общей задачей UI.

После закрытия общих задач: проверить направление/масштаб рисунка на фасадах, боковинах, полках, задней стенке и кромках в base/min/mid/max/return, в том числе resize → finish switch → resize. Выполнить Blender export/reimport и WebGL-проверку, переключение моделей и оценку draw calls на целевом устройстве. Дверные оси подготовлены; интерактивное открывание/push-to-open и переменное количество полок — отдельные будущие функции.

## 4. Registry

Предлагаемая запись после review в актуальном integration-branch:

```ts
import { WARDROBE_09_CONFIG } from '../three/models/wardrobe-chelsea-two-door/config'

// В список записей общего furnitureRegistry:
[WARDROBE_09_CONFIG.id, WARDROBE_09_CONFIG],
```

Импорт базового конфига показывает геометрию и hardware slot; полные слоты добавляются только после решения пунктов 1–2. Generic controller не должен содержать if по modelId или имена nodes этого шкафа.
