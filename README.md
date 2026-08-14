# Furniture 3D Configurator

Универсальный мебельный 3D-конфигуратор на React, TypeScript и чистом Three.js — без React Three Fiber.

Проект строится вокруг declarative-подхода: каждая constructor-ready модель подключается как `GLB + FurnitureDefinition`, а generic runtime управляет её размерами, деталями, UV и материалами без специальных условий по `modelId`.

## Текущее состояние

Рабочий прототип поддерживает:

- загрузку и переключение моделей через Furniture Registry;
- configurable dimensions с индивидуальными `base/min/max/step`;
- declarative mapping физических размеров на local/model axes;
- generic resize behaviors: `Scale`, `Edge-anchor move`, `Delta move / spread`, `Stretch segment` и неявный `Fixed`;
- сохранение сечения перемещаемых опор и конструктивных сегментов;
- компенсацию `texture.repeat` / `texture.offset` без растягивания рисунка;
- общий каталог PBR finishes;
- заменяемые материалы столешницы и варианты окрашенного металлического каркаса;
- индивидуальные `allowedFinishes` для material slots каждой модели;
- сохранение выбранных finishes модели в текущей React-сессии;
- unit- и integration-тесты на программных Three.js fixtures и production GLB.

## Технологии

- React 19;
- TypeScript;
- Vite;
- Three.js без React Three Fiber;
- Vitest;
- ESLint;
- GLB / glTF 2.0;
- PBR: Base Color, Roughness и OpenGL Normal maps.

## Архитектура

```text
src/
├── configurator/
│   ├── configuratorState.ts
│   └── furnitureRegistry.ts
├── components/ui/
├── three/
│   ├── core/          # renderer, camera, controls, shared scene
│   ├── furniture/     # generic model controller and behaviors
│   ├── materials/     # finish registry and material controller
│   └── models/        # declarative configs of individual models
└── App.tsx            # React UI and Three.js lifecycle integration

public/
├── models/            # production GLB
└── materials/         # shared runtime PBR textures

assets/source/         # editable sources, passports, references and previews
docs/                  # asset and runtime standards
```

Three.js scene/runtime создаётся один раз. При переключении мебели меняется только lifecycle выбранной модели; камера, renderer, controls, свет и environment остаются общими.

## Зарегистрированные модели

### `table-01` — First Table

- base: `1.20 × 0.60 m`;
- max: `2.00 × 1.00 m`;
- behaviors: `Scale + Edge-anchor move`;
- четыре отдельные опоры сохраняют собственное сечение.

### `table-02-u-frame` — U-Frame Table

- base: `0.95 × 0.55 × 0.75 m`;
- max: `1.65 × 0.80 × 0.75 m`;
- behaviors: `Scale + Delta move / spread + Edge-anchor move + Stretch segment`;
- две U-рамы расходятся по длине, а их поперечные сегменты корректно изменяются по ширине.

## Локальный запуск

Требуется Node.js и npm.

```bash
npm install
npm run dev -- --host 127.0.0.1
```

Открыть адрес, который Vite напечатает в строке `Local`, обычно:

```text
http://127.0.0.1:5173/
```

Dev-сервер работает, пока терминал остаётся открытым. `Ctrl+C` останавливает его.

## Проверки

```bash
npm test
npm run build
npm run lint
```

`npm run build` выполняет TypeScript build и production-сборку Vite.

## Как подключается новая модель

Новая модель должна стремиться к следующему пакету:

```text
public/models/<model-id>.glb
src/three/models/<model-folder>/config.ts
src/three/models/<model-folder>/<model-name>.test.ts
assets/source/<model-id>/
```

Model config декларативно задаёт:

- physical dimensions и limits;
- dimension-to-axis mapping;
- resize rules для controlled nodes;
- texture axis bindings;
- semantic material slots;
- default и allowed finishes.

Generic controller не должен содержать знания о столах, количестве ножек или именах конкретной модели.

Полный контракт подготовки constructor-ready ассетов находится в [стандарте 3D-ассетов](docs/3d-furniture-asset-standard.md).

## Координаты и масштаб

```text
X = слева направо
Y = вверх
Z = спереди назад

1 Three.js unit = 1 meter
```

Physical dimension и local/model axis задаются отдельно для каждой модели. Нельзя глобально предполагать, что `length = X` или `width = Z`.

## Ближайшие этапы

- сохранять размеры отдельно для каждой модели при переключении;
- добавить generic configurable height;
- подготовить configurable tabletop thickness с явным anchor;
- расширить библиотеку мебельных finishes;
- интегрировать следующие constructor-ready модели;
- улучшить общую сцену, пол, отражения и освещение;
- добавить сохранение конфигурации и shareable URL.

## Принцип проекта

Категория мебели не определяет её поведение. Источником истины является runtime-контракт конкретной модели:

```text
GLB asset
+
FurnitureDefinition
```
