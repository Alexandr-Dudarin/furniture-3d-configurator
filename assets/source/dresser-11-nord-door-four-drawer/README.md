# Комод «Норд» — модель 11

База **1200 × 900 × 450 мм, Ш × В × Г**. 4 ящиков, 1 дверей, 1 внутренних полок. Подготовлены изменение размеров с сохранением толщин/зазоров, раздельные материалы и технические оси ящиков/дверей.

**Model-only review. Геометрия поддерживается; полное подключение покрытий и affine UV требует общей доработки движка.** Это дополнение к переданному проекту, не отдельное приложение. Модель не зарегистрирована в пользовательском интерфейсе. Общие runtime-файлы не изменены.

Левая секция занимает 1/3 ширины; одна дверца, одна внутренняя полка. Справа четыре ящика. Между ящиками углублённые планки и зазоры 18 мм. Латунная вертикальная ручка 500 мм, выступ 18 мм. Эти размеры ручки и доли секций оценены по фото. Шесть опор высотой 10 мм.

## Важные файлы

- model-spec.json и reference-evidence.md — размеры, диапазоны и явно отмеченные допущения.
- model-passport.md — состав, anchors, UV, материалы и performance.
- model-contract.json, config.ts — точные параметры деталей и декларативный handoff.
- material-targets.md — все имена материалов, разделение carcass/fronts/hardware/fixed.
- mesh-source.json, build_model.mjs, create_model.py — воспроизводимые исходники.
- validation-report.md, JSON-отчёты и логи — фактические проверки и ограничения.
- previews — девять состояний и два листа сравнения, полученных из настоящего GLB.

## Воспроизведение

После переноса файлов в отдельную копию входного проекта, из его корня:

```bash
npm ci
npm ci --prefix assets/source/dresser-11-nord-door-four-drawer --no-audit --no-fund
node assets/source/dresser-11-nord-door-four-drawer/build_model.mjs
node assets/source/dresser-11-nord-door-four-drawer/validate_model.mjs
npm test
npm run build
node assets/source/dresser-11-nord-door-four-drawer/prepare_checks.mjs previews
python3 assets/source/dresser-11-nord-door-four-drawer/render_previews.py
python3 assets/source/dresser-11-nord-door-four-drawer/make_review_sheets.py
node assets/source/dresser-11-nord-door-four-drawer/prepare_checks.mjs compatibility
```

Compatibility-команда намеренно возвращает **2 / REQUIRES_ENGINE_EXTENSION**. Geometry tests остаются отдельной проверкой. Для v2 повторно получено 64 теста / 15 файлов: 30 проверок пяти комодов и 34 прежних теста во входном snapshot. Дополнительный пакет шкафа 09 в эту рабочую копию не включён; он не является зависимостью комодов.

Авторинг: Three.js 0.185.1, glTF-Transform 4.5.0, esbuild 0.28.2, glTF Validator 2.0.0-dev.3.10; версии закреплены отдельным package-lock.json. CPU renderer: Python 3, numpy, scipy, Pillow, DejaVu Sans. Материалы review-превью oak-natural/oak-grey используют карты общей библиотеки входного проекта. В v2 древесные GLB моделей 13/14 используют внешние URI на три существующих общих файла oak-natural; отдельных древесных копий в исходниках нет. Перед сборкой выполнить `python3 assets/source/dressers-10-14-shared/check_resources.py --strict`.

Для настоящего .blend и экспортного round trip в Blender 4.x:

```bash
blender --background --python assets/source/dresser-11-nord-door-four-drawer/create_model.py
```

Blender и WebGL здесь не запускались. Техническое открывание на картинках не означает интерактивную функцию приложения. Исходники и инструкция приложены для следующего этапа интеграции.

## Облегчённый пакет v2

Полная инструкция для основного проекта — `DRESSERS_10_14_INTEGRATION.md` в корне пакета. Геометрия и config сохранены; источники и отчёты обновлены 20.09.2026. Общая affine UV-интеграция по-прежнему необходима. Перед повторным запуском генератора после интеграции синхронизировать его с новым API: он перезаписывает модельный config. Все превью v1 сохранены; для двух деревянных GLB заново получены base/max и подтверждено попиксельное совпадение.
