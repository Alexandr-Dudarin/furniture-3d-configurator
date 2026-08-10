import {
  useEffect,
  useRef,
  useState,
} from 'react'

import * as THREE from 'three'

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
   * Текущие значения нужны,
   * если пользователь изменит
   * slider раньше окончания
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
   * Конкретную механику модели
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
   * REACT STATE -> THREE.JS
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
   * 3D SCENE
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
     * Базовая Three.js-инфраструктура
     * теперь создаётся отдельно.
     *
     * App больше не создаёт вручную:
     *
     * Scene
     * Camera
     * Renderer
     * OrbitControls
     * ResizeObserver
     * requestAnimationFrame loop
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
     * LIGHTS
     * --------------------------------
     *
     * Свет пока оставляем здесь.
     *
     * Позже вынесем его отдельно
     * вместе с окружением сцены.
     */

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.2,
      )

    scene.add(
      ambientLight,
    )

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        3,
      )

    keyLight.position.set(
      2.5,
      4,
      2,
    )

    keyLight.castShadow =
      true

    keyLight.shadow.mapSize.set(
      2048,
      2048,
    )

    scene.add(
      keyLight,
    )

    /*
     * --------------------------------
     * FLOOR
     * --------------------------------
     */

    const floorGeometry =
      new THREE.PlaneGeometry(
        8,
        8,
      )

    const floorMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xb8b8b8,
        roughness: 0.9,
      })

    const floor =
      new THREE.Mesh(
        floorGeometry,
        floorMaterial,
      )

    floor.rotation.x =
      -Math.PI / 2

    floor.receiveShadow =
      true

    scene.add(
      floor,
    )

    /*
     * Храним ссылку,
     * чтобы при cleanup удалить
     * модель из сцены.
     */

    let furnitureModel:
      THREE.Group | null =
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

          if (destroyed) {
            return
          }

          /*
           * 2.
           * Создаём controller,
           * который интерпретирует
           * TABLE_CONFIG.
           */

          const controller =
            createFurnitureController(
              model,
              TABLE_CONFIG,
            )

          /*
           * 3.
           * Связываем React UI
           * с универсальным controller.
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
           * Применяем актуальные
           * значения интерфейса.
           */

          controller.setDimensions({
            length:
              currentLengthRef.current,

            width:
              currentWidthRef.current,
          })

          /*
           * 5.
           * Добавляем готовую модель
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
      destroyed = true

      applyDimensionsRef.current =
        () => {}

      if (furnitureModel) {
        scene.remove(
          furnitureModel,
        )
      }

      scene.remove(
        ambientLight,
      )

      scene.remove(
        keyLight,
      )

      scene.remove(
        floor,
      )

      floorGeometry.dispose()

      floorMaterial.dispose()

      runtime.dispose()
    }
  }, [])

  /*
   * --------------------------------
   * REACT UI
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