# Исходники модулей столов v1

Основания извлечены из принятых production GLB без изменения геометрии,
UV, локальных transforms или preview-материалов:

- `public/models/table-03-slat-pedestal.glb` → `public/modules/bases/slat-pedestal.glb`;
- `public/models/table-05-round-fluted-pedestal.glb` → `public/modules/bases/round-fluted.glb`.

Исходные файлы готовых столов остаются неизменными. Их Blender scripts, референсы
и паспорта находятся в соседних source-папках table-03 и table-05.

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

Runtime-паспорт обоих оснований, метрика UV, размеры, высота, крепление,
материалы и контракт поставки следующих модулей:
`docs/table-module-standard-v1.md`.

Приложены отчёты glTF Validator и снимки реально собранных вариантов в браузере.
Информационное сообщение `NODE_EMPTY` ожидаемо для `Attachment_Tabletop` — это
служебная точка крепления, которая не должна содержать Mesh.
