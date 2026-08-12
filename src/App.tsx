import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  Group,
} from 'three'

import {
  createInitialDimensions,
  updateDimension,
  type ConfiguratorDimensions,
} from './configurator/configuratorState'

import {
  DEFAULT_FURNITURE_ID,
  getFurnitureDefinition,
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
  loadFurnitureModel,
} from './three/furniture/model'

import './App.css'

/*
 * --------------------------------
 * SELECTED FURNITURE
 * --------------------------------
 *
 * App.tsx больше не импортирует
 * конфигурацию конкретного стола.
 *
 * Он знает только ID модели,
 * которую нужно открыть.
 *
 * Реестр сам возвращает
 * соответствующий FurnitureDefinition.
 */

const furnitureDefinition =
  getFurnitureDefinition(
    DEFAULT_FURNITURE_ID,
  )

function App() {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  /*
   * --------------------------------
   * CONFIGURATOR STATE
   * --------------------------------
   *
   * Состояние размеров создаётся
   * автоматически из описания
   * выбранной модели.
   *
   * Например для нашего стола:
   *
   * {
   *   length: 1.2,
   *   width: 0.6,
   * }
   *
   * Но App.tsx не знает заранее,
   * какие именно размеры существуют.
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
   * Последнее актуальное состояние.
   *
   * Оно нужно на случай,
   * если пользователь успеет
   * изменить параметры раньше,
   * чем загрузится GLB.
   */

  const currentDimensionsRef =
    useRef<ConfiguratorDimensions>(
      dimensions,
    )

  /*
   * React не знает,
   * как физически изменяется GLB.
   *
   * Он только передаёт контроллеру
   * выбранные пользователем размеры.
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
   * CONFIGURATOR STATE -> 3D MODEL
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
   * --------------------------------
   * 3D APPLICATION
   * --------------------------------
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    let destroyed =
      false

    /*
     * --------------------------------
     * THREE.JS RUNTIME
     * --------------------------------
     */

    const runtime =
      createThreeRuntime(
        container,
      )

    const {
      scene,
    } = runtime

    /*
     * --------------------------------
     * SCENE ENVIRONMENT
     * --------------------------------
     */

    const environment =
      createSceneEnvironment(
        scene,
      )

    /*
     * Сохраняем ссылку
     * на загруженную мебель,
     * чтобы убрать её при cleanup.
     */

    let furnitureModel:
      Group | null =
        null

    /*
     * --------------------------------
     * FURNITURE
     * --------------------------------
     */

    const prepareFurniture =
      async () => {
        try {
          /*
           * 1.
           * Загружаем GLB,
           * указанный в определении
           * выбранной модели.
           */

          const model =
            await loadFurnitureModel(
              furnitureDefinition.modelUrl,
            )

          /*
           * Компонент мог быть
           * уничтожен за время
           * загрузки GLB.
           */

          if (destroyed) {
            return
          }

          /*
           * 2.
           * Создаём универсальный
           * FurnitureController.
           *
           * Он получает:
           *
           * GLB
           * +
           * описание этой модели.
           */

          const controller =
            createFurnitureController(
              model,
              furnitureDefinition,
            )

          /*
           * 3.
           * Соединяем состояние React
           * с FurnitureController.
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
           * Применяем актуальные
           * пользовательские значения.
           */

          controller.setDimensions(
            currentDimensionsRef.current,
          )

          /*
           * 5.
           * Добавляем подготовленную
           * модель в сцену.
           */

          furnitureModel =
            model

          scene.add(
            model,
          )
        } catch (error) {
          if (destroyed) {
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
     * CLEANUP
     * --------------------------------
     */

    return () => {
      destroyed =
        true

      /*
       * React больше не должен
       * обращаться к старому
       * FurnitureController.
       */

      applyDimensionsRef.current =
        () => {}

      if (furnitureModel) {
        scene.remove(
          furnitureModel,
        )
      }

      environment.dispose()

      runtime.dispose()
    }
  }, [])

  /*
   * --------------------------------
   * UI
   * --------------------------------
   *
   * UI строится автоматически
   * из определения выбранной модели.
   *
   * App.tsx не знает заранее:
   *
   * есть length?
   * есть width?
   * есть diameter?
   * есть height?
   *
   * Он просто читает dimensionOrder.
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