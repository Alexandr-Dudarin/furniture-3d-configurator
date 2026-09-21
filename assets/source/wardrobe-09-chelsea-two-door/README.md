# Двухдверный шкаф «Челси» — модель 09

Модель создана по пользовательским фотографиям и реальной ведомости деталей из инструкции. База: **802 × 2022 × 514 мм, Ш × В × Г**.

Геометрия поддерживает изменение ширины, высоты и глубины. Корпус, фасады, полки, штанга, задние панели, соединительный профиль и фурнитура разделены. Фасады имеют оси для будущего открывания. Число полок/дверей постоянно.

**Статус: model-only review; Requires engine extension для полного подключения отделок и UV.** Конфиг меняет геометрию и цвет фурнитуры; серые неметаллические материалы плит остаются встроенными. Полные material slots можно проверить через `createMaterialReviewDefinition`. Для точного сохранения рисунка при resize необходима общая affine UV-компенсация. Подробности в корневом `INTEGRATION_REQUIREMENTS.md`.

## Проверки

41 тест (34 исходных и 7 для этой модели), сборка и glTF Validator прошли. Валидатор: 0 ошибок / 0 предупреждений / 0 информационных сообщений. Размеры деталей из PDF отдельно проверены на настоящем GLB. Выполнены 34 комбинации размеров, три проверки шага 1 мм и возврат; проверены зазоры, толщины, пересечения плит, сечение овальной штанги, петли и независимость материалов.

Превью получены CPU-рендером настоящего GLB с матрицами из неизменённого Three.js controller. Это не WebGL-проверка. Открытые двери — техническая поза, взаимодействие в приложении не добавлено. Blender здесь отсутствует; выполнена проверка синтаксиса скрипта восстановления. Настоящий `.blend` создаётся локальным Blender 4.x по команде ниже.

## Файлы

- `model-spec.json` — исходные размеры, диапазоны и разделение подтверждённых/оценочных значений.
- `assembly-evidence.md` — привязка деталей к страницам инструкции и все геометрические допущения.
- `runtime-contract.md`, `model-contract.json` — правила размеров, состав, pivots, точные UV-привязки для интегратора.
- `mesh-source.json`, `build_model.mjs`, `create_model.py` — воспроизводимые редактируемые исходники.
- `model-passport.md`, `validation-report.md`, JSON-отчёты — характеристики и фактические результаты.
- `references/`, `textures/`, `previews/` — исходные референсы и карты, результаты просмотра.

## Воспроизведение в отдельной копии входного проекта

Команды выполняются из корня проекта после переноса model-specific файлов. Авторинг зависит от Three.js 0.185.1, glTF-Transform 4.5.0, esbuild 0.28.2, glTF Validator 2.0.0-dev.3.10; отдельный `package-lock.json` закрепляет зависимости скриптов модели. Корневые зависимости проекта не изменяются.

```bash
npm ci
npm ci --prefix assets/source/wardrobe-09-chelsea-two-door --no-audit --no-fund
node assets/source/wardrobe-09-chelsea-two-door/build_model.mjs
node assets/source/wardrobe-09-chelsea-two-door/validate_model.mjs
npm test
npm run build
node assets/source/wardrobe-09-chelsea-two-door/prepare_checks.mjs previews
python3 assets/source/wardrobe-09-chelsea-two-door/render_previews.py
python3 assets/source/wardrobe-09-chelsea-two-door/make_review_sheets.py
node assets/source/wardrobe-09-chelsea-two-door/prepare_checks.mjs compatibility
```

Последняя команда ожидаемо возвращает код **2**, `REQUIRES_ENGINE_EXTENSION`. Зелёные геометрические тесты не снимают этот отдельный интеграционный блокер.

CPU renderer требует Python 3 + numpy + scipy + Pillow и DejaVu Sans. Превью с древесными материалами используют текстуры `oak-natural` и `oak-grey` исходного проекта, не копируя общую библиотеку в пакет.

Для создания `.blend` и проверки Blender export/reimport запустите:

```bash
blender --background --python assets/source/wardrobe-09-chelsea-two-door/create_model.py
```

Скрипт создаст `wardrobe-09-chelsea-two-door.blend`, отдельный контрольный GLB и `blender-verification.json`; production GLB автоматически не заменяется. Перед интеграцией требуется реальная Blender-проверка и визуальное переключение моделей в WebGL.
