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
- запоминание размеров и материалов каждой модели при переключении;
- автосохранение конфигурации в браузере и восстановление после перезагрузки;
- открытие выбранного варианта по ссылке и сброс отдельной модели;
- модульную сборку стола из отдельной столешницы и GLB-основания;
- семь форм столешницы, толщину 20–50 мм и изменение высоты подготовленной опоры;
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
│   ├── furnitureRegistry.ts
│   ├── savedConfiguration.ts  # versioned state, validation, URL
│   ├── configuratorStore.ts   # persistence and state transitions
│   ├── useConfigurator.ts    # React subscription
│   └── tableAssembly/        # module catalog, compatibility and state
├── components/ui/
├── three/
│   ├── core/          # renderer, camera, controls, shared scene
│   ├── furniture/     # generic model controller and behaviors
│   ├── materials/     # finish registry and material controller
│   ├── models/        # declarative configs of individual models
│   └── tableAssembly/ # tabletop geometry and modular assembly
└── App.tsx            # React UI and Three.js lifecycle integration

public/
├── models/            # production GLB
├── modules/bases/     # independent base GLB modules
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

### `table-03-slat-pedestal` — Slat Pedestal Table

- base: `1.20 × 0.75 × 0.75 m`;
- max: `1.60 × 1.15 × 0.75 m`;
- behaviors: `Scale + Fixed`;
- центральная реечная опора остаётся неподвижной, а столешница изменяется относительно центра.

### `table-04-v-pedestal` — V-Pedestal Table

- base: `1.20 × 0.80 × 0.76 m`;
- max: `1.60 × 1.20 × 0.76 m`;
- behaviors: `Stretch segment + Delta move / spread + Fixed`;
- 9-slice столешница сохраняет радиус углов `25 mm`, а V-образная опора остаётся неподвижной.

### `table-05-round-fluted-pedestal` — Круглый стол с рифлёной опорой

- диаметр: `1.10 → 1.40 m`, шаг `0.01 m`;
- высота `0.76 m`, толщина `22 mm` — фиксированы;
- behaviors: `Scale X/Z + Fixed`; центральное основание неподвижно.

### `table-06-round-splayed-legs` — Круглый стол на наклонных ножках

- диаметр: `0.85 → 1.05 m`, шаг `0.01 m`;
- высота `0.73 m`, толщина `17 mm` — фиксированы;
- behaviors: `Scale X/Z + Fixed`; четыре наклонные ножки неподвижны.

Обе круглые столешницы сохраняют круг при resize. Столешница и основание
имеют независимый выбор покрытия; общий refresh текстур сохраняет масштаб
рисунка при смене другого material slot.

## Собрать стол

Переключатель «Готовые модели / Собрать стол» разделяет каталог готовой мебели
и модульную сборку. Готовые шесть столов сохраняют свои настройки.

В сборке доступны семь форм: прямоугольник, скруглённый прямоугольник, два
варианта срезов, круг, эллипс и овал с прямыми сторонами. Основания — отдельные
GLB: реечное, круглое рифлёное и четыре прямые ножки из First Table. Круг совместим
с рифлёной опорой; эллипс и овал — с обоими центральными основаниями.
Четыре прямоугольные формы поддерживают все три основания в их диапазонах.
У эллипса и овала длина больше ширины минимум на 20 см, в том числе при
загрузке старых сохранений с равными осями.

Размеры и материалы столешницы и основания независимы. Толщина — 20–50 мм,
с неподвижной нижней плоскостью. У круглой опоры регулируется высота 678–798 мм
с шагом 5 мм, нижний диск и верхнее крепление сохраняют размеры. У реечного
основания высота фиксирована: 728 мм; зазор между ядром и нижней площадкой
устранён в готовой модели и модуле. Четыре ножки регулируются от 610 до 810 мм
(стандарт 710 мм), сохраняя сечение и торцевые фаски. На срезанных углах
ножки автоматически отступают глубже. Общая высота равна высоте основания плюс
толщина столешницы.

Модульная сборка сохраняется и открывается по ссылке. Прежние localStorage v1
и ссылки готовых моделей поддерживаются. Контракт будущих столешниц и оснований:
[модули стола v1.1](docs/table-module-standard-v1.md).

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

## Сохранение и ссылки

Размеры и материалы запоминаются отдельно для каждой модели. Последний выбор
восстанавливается при следующем открытии приложения на том же адресе в том же
браузере. Кнопка «Сбросить эту модель» возвращает её начальные размеры и покрытия,
сохраняя настройки остальных моделей.

«Копировать ссылку» передаёт выбранную модель, все её размеры и материалы.
Конфигурация из ссылки имеет приоритет перед локальным сохранением. Если браузер
не разрешает копирование, появляется поле для ручного копирования ссылки.

Ссылка с `127.0.0.1` работает при запущенном приложении на этом же компьютере.
После публикации приложения можно делиться ссылками на его публичный адрес.
Камера в конфигурацию пока не входит. Сервер и учётная запись для сохранения
не требуются. Формат данных и правила совместимости описаны в
[документе о состоянии конфигуратора](docs/configuration-state.md).

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

- расширять настройку высоты на новые основания с подходящим контрактом;
- добавить следующие формы кромок и профили столешниц;
- расширить каталог самостоятельных оснований и их проверенные сочетания;
- расширить библиотеку мебельных finishes;
- интегрировать следующие constructor-ready модели и типы мебели;
- улучшить общую сцену, пол, отражения и освещение.

## Принцип проекта

Категория мебели не определяет её поведение. Источником истины является runtime-контракт конкретной модели:

```text
GLB asset
+
FurnitureDefinition
```
