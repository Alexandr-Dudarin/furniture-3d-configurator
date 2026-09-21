# Проверки: wardrobe-08-four-door

## PASS

- GLTFLoader загрузил реальный `public/models/wardrobe-08-four-door.glb`; все config targets найдены, имена уникальны.
- 34 набора размеров на модель: base, 27 сочетаний min/intermediate/max по W/H/D, шесть отдельных крайних изменений. Затем точный возврат transforms в base.
- Проверены реальные vertex bounds: внешние габариты, floor Y=0, толщины, межфасадные и монтажные зазоры, положение перегородок, контакт плит, отсутствие пересечений плит.
- Сечения штанг, ручек и креплений постоянны; угловые сегменты кромок не растягиваются.
- Поворот hinge-pivots и перенос drawer assemblies в технических состояниях работают независимо от resize; это не UI-функция.
- Нет вырожденных треугольников или перевёрнутой наружу/внутрь ориентации относительно normals. В плитах присутствуют UV и tangent.
- UV широких плоских фасадов при base имеют плотность 1 UV/m. Это не утверждение о готовности textured resize.
- На реальном material controller проверены независимые replacements `carcass`/`fronts`/`hardware` с существующими finish IDs.
- Khronos glTF Validator 2.0.0-dev.3.10: **0 errors / 0 warnings / 0 infos / 0 hints**.
- Повторный запуск генератора дал побайтно идентичный GLB: `rebuild-verification.json`.
- Общий `npm test`: **46 passed**, 12 файлов; новые модели добавили 12 тестов.
- `npm run build`: **PASS**, исходное предупреждение о bundle более 500 kB.
- Python scripts: синтаксис проверен; Blender API не исполнялся.

Финальные общие проверки выполнены после `npm ci` по неизменённому пользовательскому package-lock: Node 24.19.0, Three 0.185.1, TypeScript 6.0.3, Vite 8.2.1, Vitest 4.1.10. Генератор: glTF-Transform 4.5.0; вспомогательная сборка: esbuild 0.28.2. Полные выводы — `test-output.txt`, `build-output.txt`.

## Визуальные материалы

`previews/`: min, base, intermediate, max, return-base, open-base, open-max, interior-base, materials-base. Изображения получены из реального GLB и matrixWorld текущего controller, не из отдельной похожей сцены и не с помощью ImageGen. CPU renderer использует собственное студийное освещение; оно не входит в GLB.

Открытые виды и скрытые фасады — только технические позы. Размеры в подписях — закрытые габариты конфигурации. Material variant использует текущий общий каталог только при base; физическая плотность после resize остаётся блокирующим условием интеграции.

## NOT READY / NOT RUN

- Полная интеграция: **REQUIRES_ENGINE_EXTENSION**. Диагностика `prepare_checks.mjs compatibility` возвращает код 2, а не PASS.
- Требуются affine UV repeat/offset, зарегистрированные board finishes и форматирование размера с точностью 1 мм.
- `walnut-natural` имеет направление вдоль U, дубовые декоры вдоль V; нужна общая нормализация направления finish при их включении для плит.
- WebGL в браузере, FPS и визуальное переключение моделей в приложении: **NOT RUN**.
- Blender `.blend`, экспорт и реимпорт: **NOT RUN**, Blender в среде отсутствует. Даны настоящие исходные mesh-данные и скрипт восстановления; фиктивного `.blend` нет.

Зелёные геометрические тесты не снимают ограничения материала/UV. Generic engine, App, registry, state, material registry и package-lock не изменены.
