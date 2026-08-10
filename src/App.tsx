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

import {
  TABLE_CONFIG,
} from './three/table/tableConfig'

import './App.css'

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
   * Раньше:
   *
   * tableLength
   * tableWidth
   *
   * Теперь состояние универсальное:
   *
   * {
   *   length: 1.2,
   *   width: 0.6,
   * }
   *
   * Для другой модели оно может быть:
   *
   * {
   *   diameter: 1.1,
   * }
   *
   * или:
   *
   * {
   *   width: 1.8,
   *   height: 2.2,
   *   depth: 0.6,
   * }
   */

  const [
    dimensions,
    setDimensions,
  ] =
    useState<ConfiguratorDimensions>(
      () =>
        createInitialDimensions(
          TABLE_CONFIG,
        ),
    )

  /*
   * Последнее актуальное состояние.
   *
   * Нужно на случай,
   * если пользователь изменит
   * настройки до загрузки GLB.
   */

  const currentDimensionsRef =
    useRef<ConfiguratorDimensions>(
      dimensions,
    )

  /*
   * React не знает,
   * как конкретно изменяется GLB.
   *
   * Он просто передаёт движку
   * набор физических размеров.
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
     * THREE.JS RUNTIME
     */

    const runtime =
      createThreeRuntime(
        container,
      )

    const {
      scene,
    } = runtime

    /*
     * SCENE ENVIRONMENT
     */

    const environment =
      createSceneEnvironment(
        scene,
      )

    /*
     * Модель сохраняем
     * для cleanup.
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
           * Загружаем модель
           * из её конфигурации.
           */

          const model =
            await loadFurnitureModel(
              TABLE_CONFIG.modelUrl,
            )

          if (destroyed) {
            return
          }

          /*
           * 2.
           * Создаём универсальный
           * FurnitureController.
           */

          const controller =
            createFurnitureController(
              model,
              TABLE_CONFIG,
            )

          /*
           * 3.
           * React теперь передаёт
           * controller весь объект
           * размеров целиком.
           *
           * App.tsx больше не содержит:
           *
           * length,
           * width
           *
           * как специальные аргументы.
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
           * Применяем актуальное
           * состояние конфигуратора.
           */

          controller.setDimensions(
            currentDimensionsRef.current,
          )

          /*
           * 5.
           * Добавляем модель
           * в сцену.
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
   * Самое важное изменение:
   *
   * slider больше не написаны
   * вручную для length и width.
   *
   * UI строится из:
   *
   * TABLE_CONFIG.dimensionOrder
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
          TABLE_CONFIG
            .dimensionOrder
            .map(
              (
                dimension,
                index,
              ) => {
                const config =
                  TABLE_CONFIG
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