# table-06-round-splayed-legs

Статус: **интеграция подготовлена; автоматические проверки пройдены**.
Общий UV-баг исправлен в integration-пакете, модель зарегистрирована.
Начать с `docs/updates/round-tables-05-06-integration.md` и `model-passport.md`.
Окончательная визуальная приёмка в приложении ещё требуется.

## Воспроизводимость

Команды из корня проекта. Приложение уже содержит Three.js, TypeScript и Vitest.
Дополнительные инструменты генерации в этой проверке:
Node 24.19.0, three 0.185.1, @gltf-transform/core 4.5.0,
gltf-validator 2.0.0-dev.3.10, esbuild 0.28.2.

При необходимости установить временные инструменты без изменения package.json/lock:

```bash
npm install --no-save --package-lock=false @gltf-transform/core@4.5.0 gltf-validator@2.0.0-dev.3.10 esbuild@0.28.2
node assets/source/table-06-round-splayed-legs/build_model.mjs
node assets/source/table-06-round-splayed-legs/validate_model.mjs
npm test
npm run build
```

Builder читает `model-spec.json` и текстуры своей папки, генерирует production GLB
и канонический `mesh-source.json`. Он не изменяет registry или engine.
Исходные regression tests сохранены без ослабления; теперь все они проходят.

## Blender 4.x

```bash
blender --background --python assets/source/table-06-round-splayed-legs/create_model.py
```

Скрипт создаёт настоящие редактируемые Mesh из канонического vertex stream,
сохраняет иерархию, UV, normals, materials и packed images; затем записывает
`table-06-round-splayed-legs.blend` и `table-06-round-splayed-legs-blender-check.glb` в эту source-папку.
Production GLB не перезаписывается. Необходимо отдельно открыть .blend,
реимпортировать проверочный GLB, сравнить bounds, normals, материалы и UV.
В текущей среде выполнена только синтаксическая проверка Python.

## Runtime states и CPU previews

```bash
npx esbuild assets/source/table-06-round-splayed-legs/export_preview_states.ts --bundle --platform=node --format=esm --packages=external --outfile=.model-preview-states.mjs
node .model-preview-states.mjs
python3 assets/source/table-06-round-splayed-legs/render_previews.py
```

Для renderer нужны numpy, scipy, Pillow и DejaVu Sans. GLB читается напрямую,
transforms и repeat/offset берутся из `preview-states.json`, полученного
настоящими controllers. Это CPU validation render, не browser QA и не
production Three.js lighting. Base/max/intermediate/return и две строки
ракурсов соединений сохранены в `previews/`.

Текстуры скопированы из существующего finish `marble-white-gold`; PNG
metallic-roughness упакован как R=255, G=roughness, B=0.
Исходные roughness, normal GL и base color сохранены.

## Интеграция

Модель подключена через `src/configurator/furnitureRegistry.ts`. Общий
`refreshTextures()` восстанавливает исходные transforms известных текстур
перед повторным захватом. Пакет включает исправление, registry и обе модели.

`npm-test.log`, `npm-build.log`, CPU previews и `preview-states.json` в этой
папке сохранены из исходного model-only review; это исторические результаты.
Актуальные итоги интеграции: 10 test files / 34 tests PASS, build PASS,
изменённые TS-файлы ESLint PASS. Детали — в `validation-report.md`.
Оригинальные blocker и manifest сохранены в
`docs/updates/round-tables-05-06-source-review/` как история входного пакета.
