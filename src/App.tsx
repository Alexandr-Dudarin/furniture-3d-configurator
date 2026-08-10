import {
  useEffect,
  useRef,
  useState,
} from 'react'

import type {
  Group,
} from 'three'

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

const LENGTH_CONFIG =
  TABLE_CONFIG.dimensions.length

const WIDTH_CONFIG =
  TABLE_CONFIG.dimensions.width

const BASE_LENGTH =
  LENGTH_CONFIG.base

const MAX_LENGTH =
  LENGTH_CONFIG.max

const BASE_WIDTH =
  WIDTH_CONFIG.base

const MAX_WIDTH =
  WIDTH_CONFIG.max

function App() {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  const [
    tableLength,
    setTableLength,
  ] =
    useState<number>(
      BASE_LENGTH,
    )

  const [
    tableWidth,
    setTableWidth,
  ] =
    useState<number>(
      BASE_WIDTH,
    )

  /*
   * Значения хранятся дополнительно
   * в ref на случай, если пользователь
   * изменит slider раньше окончания
   * загрузки GLB.
   */

  const currentLengthRef =
    useRef<number>(
      BASE_LENGTH,
    )

  const currentWidthRef =
    useRef<number>(
      BASE_WIDTH,
    )

  /*
   * React знает только:
   *
   * "установить такие размеры".
   *
   * Реальную механику модели
   * выполняет FurnitureController.
   */

  const applyDimensionsRef =
    useRef<
      (
        length: number,
        width: number,
      ) => void
    >(() => {})

  /*
   * --------------------------------
   * REACT STATE -> 3D MODEL
   * --------------------------------
   */

  useEffect(() => {
    currentLengthRef.current =
      tableLength

    currentWidthRef.current =
      tableWidth

    applyDimensionsRef.current(
      tableLength,
      tableWidth,
    )
  }, [
    tableLength,
    tableWidth,
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

    let destroyed = false

    /*
     * --------------------------------
     * THREE.JS RUNTIME
     * --------------------------------
     *
     * Здесь находятся:
     *
     * Scene
     * Camera
     * Renderer
     * OrbitControls
     * ResizeObserver
     * render loop
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
     *
     * Здесь теперь находятся:
     *
     * свет
     * пол
     *
     * Позже этот слой можно будет
     * заменить более качественной
     * системой окружения.
     */

    const environment =
      createSceneEnvironment(
        scene,
      )

    /*
     * Модель сохраняем для cleanup.
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
           * Загружаем GLB.
           */

          const model =
            await loadFurnitureModel(
              TABLE_CONFIG.modelUrl,
            )

          /*
           * Компонент мог быть уничтожен
           * во время загрузки.
           */

          if (destroyed) {
            return
          }

          /*
           * 2.
           * Создаём универсальный
           * controller модели.
           */

          const controller =
            createFurnitureController(
              model,
              TABLE_CONFIG,
            )

          /*
           * 3.
           * Соединяем React UI
           * с FurnitureController.
           */

          applyDimensionsRef.current =
            (
              length,
              width,
            ) => {
              controller.setDimensions({
                length,
                width,
              })
            }

          /*
           * 4.
           * Восстанавливаем актуальные
           * значения размеров.
           */

          controller.setDimensions({
            length:
              currentLengthRef.current,

            width:
              currentWidthRef.current,
          })

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
      destroyed = true

      applyDimensionsRef.current =
        () => {}

      if (furnitureModel) {
        scene.remove(
          furnitureModel,
        )
      }

      /*
       * Освещение и пол
       * очищаются своим модулем.
       */

      environment.dispose()

      /*
       * Renderer, controls,
       * ResizeObserver и render loop
       * очищаются runtime-модулем.
       */

      runtime.dispose()
    }
  }, [])

  /*
   * --------------------------------
   * UI
   * --------------------------------
   */

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div
        ref={
          containerRef
        }
        style={{
          width: '100%',
          height: '100%',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          width: 190,
          padding: 14,
          background: 'white',
          borderRadius: 8,

          boxShadow:
            '0 4px 14px rgba(0, 0, 0, 0.15)',

          color: '#111',

          fontFamily:
            'sans-serif',
        }}
      >
        <div
          style={{
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {
            LENGTH_CONFIG.label
          }
          :{' '}
          {
            tableLength.toFixed(
              2,
            )
          }{' '}
          м
        </div>

        <input
          type="range"
          min={
            LENGTH_CONFIG.min
          }
          max={
            MAX_LENGTH
          }
          step={
            LENGTH_CONFIG.step
          }
          value={
            tableLength
          }
          onChange={(
            event,
          ) => {
            setTableLength(
              Number(
                event.target
                  .value,
              ),
            )
          }}
          style={{
            width: '100%',
          }}
        />

        <div
          style={{
            marginTop: 16,
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {
            WIDTH_CONFIG.label
          }
          :{' '}
          {
            tableWidth.toFixed(
              2,
            )
          }{' '}
          м
        </div>

        <input
          type="range"
          min={
            WIDTH_CONFIG.min
          }
          max={
            MAX_WIDTH
          }
          step={
            WIDTH_CONFIG.step
          }
          value={
            tableWidth
          }
          onChange={(
            event,
          ) => {
            setTableWidth(
              Number(
                event.target
                  .value,
              ),
            )
          }}
          style={{
            width: '100%',
          }}
        />
      </div>
    </div>
  )
}

export default App