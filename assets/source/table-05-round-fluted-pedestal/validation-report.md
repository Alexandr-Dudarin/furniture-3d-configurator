# Validation report — table-05-round-fluted-pedestal

Дата: 2026-09-18. Статус: **INTEGRATION AUTOMATED CHECKS PASS; BROWSER ACCEPTANCE PENDING**.

GLB из входного review сохранён побитово. Модель зарегистрирована, общий
UV-дефект исправлен. Проверка повторена на базе v1 + v2 + v3.

| Проверка | Результат |
|---|---|
| GLTFLoader production binary | PASS |
| Diameter base/min/intermediate/max/return | PASS |
| Круг, внешний диаметр X=Z | PASS |
| Высота 0.76 м, толщина 0.022 м | PASS |
| Неподвижное основание и floor Y=0 | PASS |
| Отдельные top / bottom / perimeter materials | PASS |
| Наличие UV и tangents | PASS |
| Невырожденные faces / направление normals столешницы | PASS |
| Уникальные slot targets и существующие finish IDs | PASS |
| Физическая плотность UV при diameter resize / reset | PASS |
| Смена только основания после resize сохраняет UV столешницы | PASS — исправлен generic refreshTextures |
| Реальное заглубление соединений в монтажные детали | PASS |
| Khronos glTF Validator | 0 errors, 0 warnings, 0 infos, 0 hints |
| Полный npm test | 34 passed / 34, 10 files |
| npm run build | PASS |
| Blender script syntax | PASS |
| Запуск Blender / .blend / reimport | NOT RUN — Blender отсутствует |
| Browser WebGL / переключение моделей в App | NOT RUN — здесь нет локального WebGL-браузера; требуется приёмка пользователя |
| CPU preview из final GLB: base, intermediate, max, return | PASS |
| Четыре стороны + снизу, black/white frame | PASS — CPU visual inspection |

Модель имеет 4 собственных integration tests; все проходят без skip/expected-fail.
Дополнительный regression suite проверяет смену только основания после resize,
повторные refresh, промежуточный размер и возврат в base на всех шести моделях.
Отдельный fixture проверяет произвольные исходные repeat/offset и новые карты.
Без generic исправления 7 новых проверок падают; с исправлением проходят.

Khronos Validator повторно запущен на неизменённом production GLB: 0 ошибок,
предупреждений, info и hints. Проверки размеров, круглого контура, толщины,
пола, неподвижности основания и соединений повторены реальными controllers.
Изменённые TypeScript-файлы прошли ESLint. Build прошёл; предупреждение
Vite о чанке >500 kB осталось прежним и не является ошибкой сборки.

CPU previews и npm-логи в source-папке принадлежат исходному model-only review.
Они не выдаются за новый WebGL-прогон. Геометрия не изменялась; CPU виды base
и соединений просмотрены при интеграции и сопоставлены с референсами.
Blender script/export в этом этапе не запускались; исходная проверка синтаксиса
описана в историческом отчёте. Проверенный .blend не приложен.

В общем runtime изменён только пересчёт текстур и регистрация новых моделей;
App.tsx, общий материал-каталог, зависимости и GLB прежних столов сохранены.
Визуально проверить: base → max → смена столешницы → смена основания → base,
вид снизу/торец и переключение между всеми моделями.
