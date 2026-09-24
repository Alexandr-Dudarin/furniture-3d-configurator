# Двухдверный шкаф «Челси» — модель 09

> Текущая ревизия: **opening-joints v1**. Исправления соединений, актуальные
> проверки и превью — в [общем отчёте](../opening-joints-integration/validation-report.md).
> Старые отчёты/хеши/превью ниже относятся к предыдущему авторингу.

База: **802 × 2022 × 514 мм, Ш × В × Г**. Модель подключена к конфигуратору:
меняются размеры, материалы корпуса/фасадов/фурнитуры; работает affine UV.

По запросу пользователя от 21 сентября 2026 года задняя стенка теперь
**цельная, 800 × 1948 × 3 мм** в базе. Две прежние панели и центральный профиль
заменены узлом `Panel_Back`. Внешние границы и толщина сохранены. Отличие от
заводской ведомости явно записано в `assembly-evidence.md` и `model-spec.json`.

## Основные файлы

- `public/models/wardrobe-09-chelsea-two-door.glb` в корне проекта — модель приложения.
- `build_model.mjs`, `mesh-source.json`, `create_model.py` — воспроизводимые исходники.
- `model-spec.json`, `assembly-evidence.md` — размеры, источники, допущения и согласованное изменение.
- `model-contract.json`, `runtime-contract.md` — структура и правила размеров/UV.
- `model-passport.md`, `validation-report.md` — актуальные характеристики и проверки.
- `previews/`, `preview-states.json` — технические CPU-превью актуального GLB.
- `browser-previews/`, `browser-report.json` — WebGL-проверка цельной задней стенки.

`config.ts` — авторский конфиг; приложение получает полную декларацию через
`catalog.ts → loadRuntime() → runtime.ts`. После пересборки геометрии обязательно
перегенерировать интеграцию, чтобы обновить targets и привязки текстур.

## Воспроизведение

Из корня проекта (в Windows команда Python может называться `python`):

```bash
npm ci
npm ci --prefix assets/source/wardrobe-09-chelsea-two-door --no-audit --no-fund
node assets/source/wardrobe-09-chelsea-two-door/build_model.mjs
python3 assets/source/wardrobes-integration/generate_runtime.py
node assets/source/wardrobe-09-chelsea-two-door/validate_model.mjs
npm test
npm run build
```

Отдельный lockfile закрепляет зависимости авторинга; корневые зависимости
приложения не изменены. Для обновления технических превью:

```bash
node assets/source/wardrobe-09-chelsea-two-door/prepare_checks.mjs previews
python3 assets/source/wardrobe-09-chelsea-two-door/render_previews.py
python3 assets/source/wardrobe-09-chelsea-two-door/make_review_sheets.py
```

CPU renderer использует Python 3, numpy, scipy, Pillow и DejaVu Sans.
Открытые двери в этих превью — технические позы, ещё не функция интерфейса.
Исторические `test-output.txt`, `build-output.txt`, `runtime-compatibility.json`
и compatibility-скрипт относятся к исходной передаче model-only. Его код 2
проверяет старый `legacyTextureAxes` и не означает ошибку нынешней интеграции.
Актуальные результаты находятся в `validation-report.md`.

Для локального восстановления Blender-сцены:

```bash
blender --background --python assets/source/wardrobe-09-chelsea-two-door/create_model.py
```

Скрипт читает обновлённый `mesh-source.json`, создаёт `.blend`, контрольный GLB
и `blender-verification.json`; production GLB автоматически не заменяет.
Blender export/reimport в этом обновлении не выполнялся.

## Сменные фасады — facade-variants-v1

Эта модель участвует в пилоте: гладкий, рамочный, вертикально рифлёный.
Параметры находятся в `facade-variants.json`. Интеграционный генератор
категории переносит их в `catalog.ts`; runtime наследует каталог.
Новые профили строятся в приложении внутри прежних panel-групп,
исходный GLB сохраняет гладкие панели. Рисунок и покрытие независимы.
Контракт: `docs/3d-furniture-asset-standard.md`, v2.9, раздел 40.
Бюджеты, проверки и ограничения: `docs/facade-variants-v1-validation.md`.
