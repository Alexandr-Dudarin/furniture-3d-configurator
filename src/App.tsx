import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  Group,
  Scene,
} from 'three'

import {
  createInitialDimensions,
  updateDimension,
  type ConfiguratorDimensions,
} from './configurator/configuratorState'

import {
  DEFAULT_FURNITURE_ID,
  getFurnitureDefinition,
  getFurnitureDefinitions,
} from './configurator/furnitureRegistry'

import {
  createSceneEnvironment,
} from './three/core/createSceneEnvironment'

import {
  createThreeRuntime,
} from './three/core/createThreeRuntime'

import {
  createFurnitureController,
} from './three/furniture/furnitureController'

import {
  disposeFurnitureModel,
  loadFurnitureModel,
} from './three/furniture/model'

import './App.css'

/*
 * Список всех моделей,
 * зарегистрированных
 * в Furniture Registry.
 */

const furnitureDefinitions =
  getFurnitureDefinitions()

function App() {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  /*
   * --------------------------------
   * SELECTED MODEL
   * --------------------------------
   *
   * Теперь выбранная модель —
   * настоящее состояние приложения.
   *
   * Пока доступен только table-01,
   * но App.tsx уже готов
   * переключаться между моделями.
   */

  const [
    selectedModelId,
    setSelectedModelId,
  ] =
    useState<string>(
      DEFAULT_FURNITURE_ID,
    )

  /*
   * Получаем "паспорт"
   * выбранной модели через registry.
   */

  const furnitureDefinition =
    getFurnitureDefinition(
      selectedModelId,
    )

  /*
   * --------------------------------
   * CONFIGURATOR DIMENSIONS
   * --------------------------------
   */

  const [
    dimensions,
    setDimensions,
  ] =
    useState<ConfiguratorDimensions>(
      () =>
        createInitialDimensions(
          furnitureDefinition,
        ),
    )

  /*
   * Последние актуальные размеры.
   *
   * Они нужны в том числе
   * во время асинхронной
   * загрузки GLB.
   */

  const currentDimensionsRef =
    useRef<ConfiguratorDimensions>(
      dimensions,
    )

  /*
   * React передаёт размеры
   * текущему FurnitureController.
   */

  const applyDimensionsRef =
    useRef<
      (
        dimensions:
          ConfiguratorDimensions,
      ) => void
    >(() => {})

  /*
   * --------------------------------
   * THREE.JS SCENE REF
   * --------------------------------
   *
   * Сцена создаётся только один раз.
   *
   * Выбранная мебель может
   * меняться независимо от неё.
   */

  const sceneRef =
    useRef<Scene | null>(
      null,
    )

  /*
   * --------------------------------
   * DIMENSIONS -> 3D MODEL
   * --------------------------------
   */

  useEffect(() => {
    currentDimensionsRef.current =
      dimensions

    applyDimensionsRef.current(
      dimensions,
    )
  }, [
    dimensions,
  ])

  /*
   * =================================
   * THREE.JS APPLICATION LIFECYCLE
   * =================================
   *
   * Этот effect запускается
   * только один раз.
   *
   * Здесь живёт сама 3D-сцена:
   *
   * renderer
   * camera
   * controls
   * environment
   *
   * Смена модели мебели
   * этот слой не пересоздаёт.
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    const runtime =
      createThreeRuntime(
        container,
      )

    const {
      scene,
    } = runtime

    sceneRef.current =
      scene

    const environment =
      createSceneEnvironment(
        scene,
      )

    return () => {
      /*
       * Не оставляем ссылку
       * на уничтоженную сцену.
       */

      if (
        sceneRef.current ===
        scene
      ) {
        sceneRef.current =
          null
      }

      environment.dispose()

      runtime.dispose()
    }
  }, [])

  /*
   * =================================
   * FURNITURE LIFECYCLE
   * =================================
   *
   * Этот effect отвечает ТОЛЬКО
   * за выбранную мебель.
   *
   * Когда selectedModelId изменится:
   *
   * 1. старая GLB удаляется;
   * 2. освобождается её память;
   * 3. загружается новый GLB;
   * 4. создаётся новый controller;
   * 5. сцена/камера/свет остаются.
   */

  useEffect(() => {
    const scene =
      sceneRef.current

    if (!scene) {
      return
    }

    let cancelled =
      false

    let furnitureModel:
      Group | null =
        null

    /*
     * Пока новая модель загружается,
     * старый controller уже не должен
     * получать новые команды.
     */

    applyDimensionsRef.current =
      () => {}

    const prepareFurniture =
      async () => {
        try {
          /*
           * 1.
           * Загружаем выбранный GLB.
           */

          const model =
            await loadFurnitureModel(
              furnitureDefinition.modelUrl,
            )

          /*
           * За время загрузки пользователь
           * мог выбрать уже другую модель.
           *
           * Тогда этот GLB больше
           * вообще не нужен.
           */

          if (cancelled) {
            disposeFurnitureModel(
              model,
            )

            return
          }

          /*
           * 2.
           * Создаём controller
           * согласно конфигу
           * именно этой модели.
           */

          const controller =
            createFurnitureController(
              model,
              furnitureDefinition,
            )

          /*
           * 3.
           * Связываем React
           * с новым controller.
           */

          applyDimensionsRef.current =
            (
              nextDimensions,
            ) => {
              controller.setDimensions(
                nextDimensions,
              )
            }

          /*
           * 4.
           * Применяем текущую
           * конфигурацию размеров.
           */

          controller.setDimensions(
            currentDimensionsRef.current,
          )

          /*
           * 5.
           * Добавляем модель.
           */

          furnitureModel =
            model

          scene.add(
            model,
          )
        } catch (error) {
          if (cancelled) {
            return
          }

          console.error(
            'Ошибка подготовки мебели:',
            error,
          )
        }
      }

    void prepareFurniture()

    /*
     * --------------------------------
     * FURNITURE CLEANUP
     * --------------------------------
     */

    return () => {
      cancelled =
        true

      applyDimensionsRef.current =
        () => {}

      if (!furnitureModel) {
        return
      }

      scene.remove(
        furnitureModel,
      )

      disposeFurnitureModel(
        furnitureModel,
      )
    }
  }, [
    furnitureDefinition,
  ])

  /*
   * =================================
   * CHANGE MODEL
   * =================================
   */

  const handleModelChange =
    (
      nextModelId:
        string,
    ) => {
      if (
        nextModelId ===
        selectedModelId
      ) {
        return
      }

      /*
       * Получаем паспорт
       * новой модели.
       */

      const nextDefinition =
        getFurnitureDefinition(
          nextModelId,
        )

      /*
       * У новой модели совершенно
       * другие dimensions.
       *
       * Например:
       *
       * старый стол:
       *
       * {
       *   length,
       *   width,
       * }
       *
       * круглый стол:
       *
       * {
       *   diameter,
       * }
       *
       * Поэтому создаём новое
       * начальное состояние.
       */

      const nextDimensions =
        createInitialDimensions(
          nextDefinition,
        )

      /*
       * Ref обновляем сразу,
       * ещё до следующего render.
       *
       * Поэтому новый GLB гарантированно
       * получит уже свои размеры.
       */

      currentDimensionsRef.current =
        nextDimensions

      setDimensions(
        nextDimensions,
      )

      setSelectedModelId(
        nextModelId,
      )
    }

  /*
   * =================================
   * UI
   * =================================
   */

  return (
    <div
      style={{
        position:
          'relative',

        width:
          '100vw',

        height:
          '100vh',

        overflow:
          'hidden',
      }}
    >
      <div
        ref={
          containerRef
        }
        style={{
          width:
            '100%',

          height:
            '100%',
        }}
      />

      <div
        style={{
          position:
            'absolute',

          top:
            16,

          left:
            16,

          width:
            190,

          padding:
            14,

          background:
            'white',

          borderRadius:
            8,

          boxShadow:
            '0 4px 14px rgba(0, 0, 0, 0.15)',

          color:
            '#111',

          fontFamily:
            'sans-serif',
        }}
      >
        {/*
         * -----------------------------
         * MODEL SELECT
         * -----------------------------
         *
         * Пока здесь будет
         * только First Table.
         *
         * Но после регистрации
         * второй модели она появится
         * здесь автоматически.
         */}

        <div
          style={{
            marginBottom:
              16,
          }}
        >
          <div
            style={{
              marginBottom:
                6,

              fontSize:
                14,

              fontWeight:
                600,
            }}
          >
            Модель
          </div>

          <select
            value={
              selectedModelId
            }

            onChange={(
              event,
            ) => {
              handleModelChange(
                event.target.value,
              )
            }}

            style={{
              width:
                '100%',

              boxSizing:
                'border-box',
            }}
          >
            {
              furnitureDefinitions.map(
                (
                  definition,
                ) => (
                  <option
                    key={
                      definition.id
                    }

                    value={
                      definition.id
                    }
                  >
                    {
                      definition.label
                    }
                  </option>
                ),
              )
            }
          </select>
        </div>

        {/*
         * -----------------------------
         * DIMENSION CONTROLS
         * -----------------------------
         */}

        {
          furnitureDefinition
            .dimensionOrder
            .map(
              (
                dimension,
                index,
              ) => {
                const config =
                  furnitureDefinition
                    .dimensions[
                      dimension
                    ]

                const value =
                  dimensions[
                    dimension
                  ] ??
                  config.base

                return (
                  <div
                    key={
                      dimension
                    }

                    style={{
                      marginTop:
                        index === 0
                          ? 0
                          : 16,
                    }}
                  >
                    <div
                      style={{
                        marginBottom:
                          6,

                        fontSize:
                          14,

                        fontWeight:
                          600,
                      }}
                    >
                      {
                        config.label
                      }
                      :{' '}
                      {
                        value.toFixed(
                          2,
                        )
                      }{' '}
                      м
                    </div>

                    <input
                      type="range"

                      min={
                        config.min
                      }

                      max={
                        config.max
                      }

                      step={
                        config.step
                      }

                      value={
                        value
                      }

                      onChange={(
                        event,
                      ) => {
                        const nextValue =
                          Number(
                            event
                              .target
                              .value,
                          )

                        setDimensions(
                          (
                            current,
                          ) =>
                            updateDimension(
                              current,
                              dimension,
                              nextValue,
                            ),
                        )
                      }}

                      style={{
                        width:
                          '100%',
                      }}
                    />
                  </div>
                )
              },
            )
        }
      </div>
    </div>
  )
}

export default App