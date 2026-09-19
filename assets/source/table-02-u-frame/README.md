# Table 02 U-Frame — asset source

Папка содержит исходные материалы constructor-ready модели `table-02-u-frame`.

## Состав

```text
create_table_02_u_frame.py
model-passport.md
references/
textures/
previews/
validation-report.md
table-02-u-frame.blend — создаётся Blender-скриптом
```

Production GLB находится отдельно:

```text
public/models/table-02-u-frame.glb
```

Runtime config:

```text
src/three/models/u-frame-table/config.ts
```

Готовые контрольные изображения базового и максимального размеров находятся
в `previews/`.

## Зачем нужен `.blend`

`.glb` является production-ассетом для браузера, но не удобным главным исходником. `.blend` нужен для:

- точного редактирования геометрии и профиля;
- изменения bevel, UV и pivots;
- проверки hierarchy и material slots;
- подготовки новых вариантов конструкции;
- повторного контролируемого экспорта GLB;
- сохранения editable master source рядом с паспортом модели.

## Создание `.blend`

В среде, где установлен Blender 4.x, из корня проекта выполнить:

```powershell
blender --background --python assets/source/table-02-u-frame/create_table_02_u_frame.py
```

Если команда `blender` не добавлена в `PATH`, указать полный путь к `blender.exe`, например:

```powershell
& "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" --background --python assets/source/table-02-u-frame/create_table_02_u_frame.py
```

Скрипт:

1. создаст чистую constructor-ready сцену;
2. сохранит `table-02-u-frame.blend` в эту папку;
3. экспортирует production GLB в `public/models/`;
4. сохранит semantic node names, hierarchy, material slots и custom behavior metadata.

После выполнения необходимо снова запустить:

```powershell
npm test
npm run build
```

## Важное ограничение

Файл `.blend` не следует редактировать независимо от паспорта и runtime config. Если меняются имена controlled nodes, base dimensions, pivots или local axes, одновременно обновляются:

- `model-passport.md`;
- `src/three/models/u-frame-table/config.ts`;
- соответствующие unit/integration tests.


## Исправление UV v3 — 18.09.2026

Столешница теперь содержит четыре semantic material targets: `Top_Primary`
(верх), `Top_Bottom`, `Top_Edge_Long`, `Top_Edge_Short`. Все они входят в
`primaryTop`; `Top_Primary` сохранён для совместимости существующих тестов.
GLB и `config.ts` необходимо обновлять вместе. Геометрия, normals, положение
узлов, профиль рам и resize rules сохранены; UV и tangents пересчитаны.

Для повторной UV-переразвёртки существующего production GLB без Blender:

```powershell
npm install --no-save --package-lock=false @gltf-transform/core@4.5.0
node assets/source/table-02-u-frame/update_table_02_uv.mjs
```

Скрипт допускает входной и выходной GLB двумя аргументами. Он повторяемый:
UV вычисляются из координат вершин, поэтому повторный запуск не накапливает
изменения. Build-time зависимость не добавляется в package.json/lock-файл.
Blender-генератор тоже обновлён: метрические UV, четыре материала, преобразование
Y-up координат проекта в Z-up Blender. В этом пакете он проверен синтаксически;
фактический экспорт и приёмка `.blend` ещё требуют Blender.

Новый тест `src/three/models/tabletopUv.integration.test.ts` проверяет реальную
плотность UV на верхе, низе и торцах, раздельные изменения длины/ширины,
смену камня/дерева и возврат к исходным размерам.


Примечание v3: существующие `previews/` — исторические рендеры геометрии до
исправления UV. Новый браузерный visual QA ещё требуется; см. validation-report.md.
