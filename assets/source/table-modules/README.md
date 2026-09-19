# Исходники модулей столов — modular-tables-v3

Основания извлечены из принятых production GLB без изменения геометрии,
UV, локальных transforms или preview-материалов:

- `public/models/first-table.glb` → `public/modules/bases/four-legs.glb`;
- `public/models/table-03-slat-pedestal.glb` → `public/modules/bases/slat-pedestal.glb`;
- `public/models/table-05-round-fluted-pedestal.glb` → `public/modules/bases/round-fluted.glb`.

Экстрактор не меняет исходные GLB. Перед извлечением table-03 исправлен своим
Node-генератором: нижняя часть ядра продлена в площадку, закрывая зазор 6 мм.
Оба генератора table-03 (Node и Blender) содержат это изменение.
Исходные table-01 и table-05 неизменны.

Повторить извлечение из корня проекта:

```bash
python assets/source/table-modules/extract_bases.py
```

Нужен Python 3 со стандартной библиотекой, без Blender и сторонних Python-пакетов.
Скрипт переносит только используемые nodes, meshes, materials, accessors,
bufferViews, textures и images. Прежняя столешница удаляется; неиспользуемые
бинарные данные не попадают в модуль. Добавляется attachment node.

Отдельные GLB оснований можно импортировать в Blender через glTF 2.0.
Столешница модульного режима генерируется в приложении; её воспроизводимый
исходник — `src/three/tableAssembly/tabletopGeometry.ts`. Готового GLB каждой
комбинации и функции экспорта сборки в этой версии нет.

Runtime-паспорт трёх оснований, метрика UV, размеры, высота, крепление,
материалы и контракт поставки следующих модулей:
`docs/table-module-standard-v1.md`.

Приложены отчёты glTF Validator и снимки реально собранных вариантов в браузере.
Информационное сообщение `NODE_EMPTY` ожидаемо для `Attachment_Tabletop` — это
служебная точка крепления, которая не должна содержать Mesh.

Четыре ножки меняют высоту в runtime через `cornerLegs.ts`, без морфов.
Четыре копии исходных вершин используются для пересчёта, без накопления деформации.
Неиспользуемые UV/тангенты металлических ножек сохранены из исходного GLB:
Validator сообщает о них как INFO, поскольку материал не имеет текстур.

Снимки с суффиксом `-v2.png` относятся к этапу modular-tables-v2; `rounded-slat.png`
и `round-fluted-tall.png` — исторические снимки v1.

В modular-tables-v3 GLB и исходники геометрии не меняются. Оба регулируемых
основания имеют диапазон 640–840 мм, шаг 10 мм. Каталог разделяет исходный
`sourceHeight` GLB и начальное значение `height.base` для пользователя.
На круглой опоре это соответственно 738 и 740 мм; трансформации считаются от 738 мм.
