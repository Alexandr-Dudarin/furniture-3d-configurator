# Validation report: Table 02 U-Frame

Дата проверки: 2026-08-12.

## Production asset

```text
public/models/table-02-u-frame.glb
```

Результат Khronos glTF Validator:

```text
Errors:   0
Warnings: 0
Infos:    0
Hints:    0
```

Метрики GLB:

```text
Bounds:       0.95 × 0.55 × 0.75 m
Triangles:    1,188
Vertices:     3,564
Draw calls:   3
Materials:    2
Textures:     3
File size:    450,920 bytes
```

## Runtime checks

```text
npm test
Test files: 2 passed
Tests:      5 passed

npm run build
Result:     passed
```

Integration test проверяет реальный production GLB в базовом и максимальном
размерах, неизменность профиля стоек, перемещение рам, локальное растяжение
нижних поперечин, UV-компенсацию столешницы и точный возврат к base state.

## Source-script check

```text
python3 -m py_compile assets/source/table-02-u-frame/create_table_02_u_frame.py
Result: passed
```

Фактическое открытие и сохранение `.blend` требует Blender 4.x. Blender не был
доступен в среде сборки, поэтому бинарный `.blend` создаётся приложенным
воспроизводимым Blender-скриптом.
