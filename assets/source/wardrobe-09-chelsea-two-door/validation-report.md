# Фактические проверки модели 09

Дата: 2026-09-19. Вход — последняя переданная в этом чате копия `furniture-3d-configurator под архив.zip`; более свежий main не предоставлялся. Пакеты 07–08 использованы как источник авторинга, но не интегрированы в исходный snapshot и не включены в новый ZIP.

| Проверка | Результат |
|---|---|
| Baseline проекта | 34 теста / 10 файлов и build PASS |
| Итоговый npm test | **41 тест / 11 файлов PASS**: исходные 34 и новые 7 |
| Итоговый npm run build | PASS; прежнее предупреждение bundle >500 kB |
| glTF Validator 2.0.0-dev.3.10 | 0 errors / 0 warnings / 0 infos / 0 hints |
| Производственные размеры PDF стр. 2 | PASS на реальных vertex bounds GLB |
| Размеры и конструктивные зазоры | PASS: base + 27 сочетаний min/mid/max + 6 независимых крайних осей |
| Шаг и возврат | PASS: +1 мм по каждой оси, точное возвращение transforms |
| Геометрия | PASS: толщины/сечения/пол/свесы, отсутствие пересечения объёмов плит, невырожденные треугольники, согласованные normals |
| Фиксированный bevel | PASS по scale всех зон/осей после resize |
| Door pivots | PASS при base/min/max и углах 0/15/45/90/105°, фасады не пересекают боковины |
| Независимость материалов | PASS на реальном material controller, после max resize и смены каждого slot |
| UV плоскостей при base | PASS, 1 UV/m, проверены X/Y/Z поверхности |
| Воспроизводимость | PASS, повторная генерация побайтно идентична |
| Blender Python syntax | PASS, ast.parse |
| Affine UV / весь каталог ЛДСП | **REQUIRES_ENGINE_EXTENSION**, отдельная команда возвращает 2 |
| Browser WebGL / смена модели | NOT RUN |
| Blender export/reimport | NOT RUN: Blender отсутствует |
| GPU FPS | NOT RUN |

Логи: `test-output.txt`, `build-output.txt`, `gltf-validator-report.json`, `rebuild-verification.json`, `runtime-compatibility.json`. CPU-превью не заменяют WebGL. ImageStub в Node заменяет только события загрузки карт: реальные бинарные геометрии читает GLTFLoader, настоящие изображения для рендера декодирует Pillow.

Дополнительные изображения: base/min/intermediate/max/return-base, open-base/open-max, interior-base, materials-base; все виды просмотрены. Открытые позы задаются скриптом отдельно от UI. Сравнение base и return-base вне заголовка: 1 331 000 пикселей, 0 отличий, PASS; результат в `visual-return-verification.json`.

UV probe: материал `Front_Door_Tall_ccc_Z`, высота 2,022 → 2,400 м. Нужный repeat V = 1.195692689998; старый runtime = 1.186943620178; ошибка размера фактуры 0.737109%. Компенсация перевода кромок также не поддержана. Рабочий конфиг сохраняет однотонные материалы, поэтому не скрывает ошибку под фиктивным точным textureAxes.

Исходные общие файлы, registry, package.json/package-lock.json проекта и runtime не изменены. Новая модель не зарегистрирована в интерфейсе. Пакет предназначен для центрального integration-чата.

SHA256 GLB: `b9e8f6d926445f9346a59c1f8b879d5c6090d16a1fe131082cca24e4ed749490`.
