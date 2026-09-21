# Четырёхдверный шкаф с длинными ручками — исходники

`wardrobe-08-four-door`. Габариты Ш × В × Г: **1600 × 2200 × 520 мм**.

Это model-only пакет для центрального integration-чата. Геометрия и текущие resize rules проверены; полная интеграция board finishes/UV ещё требуется. В основном конфиге активен только `hardware`; исходный серый неметаллический ЛДСП сохраняется из GLB. Такой статус выбран явно, чтобы не подставлять металл или несуществующий finish ID вместо ЛДСП.

## Основные файлы

- `../../../public/models/wardrobe-08-four-door.glb` относительно этой папки: фактический GLB, который загружается тестами.
- `../../../src/three/models/wardrobe-four-door/config.ts`: проверенный `FurnitureDefinition` для геометрии и фурнитуры, группы board targets и отдельная material-review функция.
- `model-spec.json`: согласованные внешние размеры, диапазоны, базовый цвет.
- `build_model.mjs`: воспроизводимый генератор GLB, конфига, контрактов и нейтральных mesh-данных.
- `mesh-source.json`: все реальные вершины, нормали, UV, индексы, материалы и hierarchy.
- `model-contract.json`: детали, параметры движения/растяжения, полные material targets, UV-требования, петли и ящики.
- `create_model.py`: восстановление настоящего редактируемого `.blend` в Blender 4.x, контрольный экспорт и реимпорт.
- `model-passport.md`, `validation-report.md`, `runtime-compatibility.json`: статус и результаты.
- `previews/`: изображения именно этого GLB. Рендер выполнен на CPU; это не скриншоты приложения.

## Воспроизведение

Выполнять в отдельной копии переданного проекта после импорта model files центральным разработчиком. Корень проекта остаётся текущей рабочей папкой. Source `package.json` устанавливает только авторские инструменты в source-папку и не меняет общий package.json/lock.

```sh
npm ci
npm install --prefix assets/source/wardrobe-08-four-door --no-audit --no-fund
node assets/source/wardrobe-08-four-door/build_model.mjs
node assets/source/wardrobe-08-four-door/validate_model.mjs
npm test
npm run build
node assets/source/wardrobe-08-four-door/prepare_checks.mjs previews
python3 assets/source/wardrobe-08-four-door/render_previews.py
```

Для Python необходимы NumPy, SciPy и Pillow. В Windows можно использовать `python` вместо `python3`.

Для воспроизведения зарегистрированного ограничения:

```sh
node assets/source/wardrobe-08-four-door/prepare_checks.mjs compatibility
```

Ожидаемый код завершения этой диагностики **2**: `REQUIRES_ENGINE_EXTENSION`. Это отдельный gate интеграционной готовности; его нельзя выдавать за PASS на основании зелёного `npm test`.

Для Blender:

```sh
blender --background --python assets/source/wardrobe-08-four-door/create_model.py
```

Скрипт сохраняет `wardrobe-08-four-door.blend`, `wardrobe-08-four-door-blender-check.glb` и, после успешного реимпорта, `blender-verification.json`. В текущей среде Blender отсутствует; эти файлы не созданы, export/reimport **NOT RUN**. Проверка синтаксиса Python выполнена. Контрольный GLB не перезаписывает production автоматически.

## Представление и материалы

Основной GLB содержит только мебель. Свет, пол и камеры есть исключительно в offline renderer.
`export_preview_states.ts` загружает production GLB реальным GLTFLoader и использует неизменённые общие controllers. Повороты дверей, выдвижение ящиков и скрытие фасадов для технических кадров выполняются в этом скрипте после применения размеров. Соответствующих кнопок/анимаций в приложении нет.

Кадр `materials-base.png` показывает реальную material-review замену из существующего каталога: корпус — `oak-natural`, фасады — `oak-grey`, фурнитура — `metal-white-matte`. Только base. Он не доказывает готовность textured resize.
Некоторые существующие изображения каталога имеют другую ориентацию волокон: например `walnut-natural` ориентирован вдоль U, тогда как дубовые декоры — вдоль V. Для всех выбираемых декоров центральному чату нужно нормализовать это соглашение или поддержать общую ориентацию finish. Геометрия использует V вдоль принятого направления волокон детали.

## Редактирование

Изменения вносятся в `model-spec.json` / `build_model.mjs`, затем генератор запускается повторно. Сгенерированный config не следует вручную расходить с GLB. После правок снова выполнить проверки реальной геометрии. Все независимые детали доступны в Blender; плиту образуют девять оболочечных сегментов с постоянным скруглением 0.7 мм, без скрытых внутренних крышек.
