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
