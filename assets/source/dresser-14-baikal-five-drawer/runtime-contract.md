# Контракт до моделирования — Комод «Байкал»

Model ID `dresser-14-baikal-five-drawer`; база Ш × В × Г: 402 × 1030 × 331 мм. X/Z center, Y от пола 0; front +Z, 1 unit = 1 m. Высота configurable, толщина fixed. Шаг 1 мм.

- width: 350–600 мм.
- height: 900–1200 мм.
- depth: 300–500 мм.

Ящики: 5; двери: 0; внутренние полки: 0. Число деталей постоянно. Корпус, фасады, ящики, их стенки/днища, направляющие, ручки, двери и оси — отдельные semantic nodes. Фасады и ящики меняют высоту равномерно в своей колонке. Ручки и сечения направляющих сохраняются. Bevel 0,7 мм сохраняется сегментацией плит.

Материалы: carcass, fronts, hardware; внутренние механизмы имеют отдельный фиксированный материал. По умолчанию сохранены цвета референса, без подмены ЛДСП металлом. Общему движку по-прежнему требуется affine UV для полезных длин и фаз перемещаемых кромок; отсутствующие ЛДСП/латунные finish IDs не выдумываются. Контракт передаётся в model-contract.json. Generic engine не меняется.

Декор «Марвэла» — фиксированное число рёбер с постоянным сечением; промежутки меняются по ширине. У «Байкала» угловые диагональные мотивы фиксированы, перемещаются вместе с нижними углами верхнего фасада. Открытые позы вне UI.

Допущения:
- Overall dimensions and part counts are taken from user screenshots; hidden dimensions are estimates.
- Main boards/front envelope 16 mm, drawer bottoms 6 mm, back panels 4 mm, ordinary facade joints 4 mm.
- All configuration ranges are review choices; manufacturer offerings and load capacity are not established.
- Depth is the CLOSED overall envelope including handle projection; handle-free corpus depths are derived.
- Opening/sliding is a technical pose only, not an application interaction.
- Three 45-degree grooves in each lower corner of the top front. Fixed 144 mm corner motifs move apart with width; groove width 2.4 mm, depth 0.8 mm. Pattern is geometric and estimated.
