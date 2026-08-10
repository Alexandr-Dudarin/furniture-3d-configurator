import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

import { loadFurnitureModel } from './three/furniture/model'
import { createFurnitureController } from './three/furniture/furnitureController'
import { TABLE_CONFIG } from './three/table/tableConfig'

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
    useRef<HTMLDivElement | null>(null)

  const [tableLength, setTableLength] =
    useState<number>(
      BASE_LENGTH,
    )

  const [tableWidth, setTableWidth] =
    useState<number>(
      BASE_WIDTH,
    )

  /*
   * Текущие значения нужны на случай,
   * если пользователь изменит slider
   * раньше, чем GLB успеет загрузиться.
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
   * React пока знает только:
   *
   * "нужно установить такие размеры".
   *
   * Как именно это делается внутри
   * Three.js-модели, теперь решает
   * FurnitureController.
   */

  const applyDimensionsRef = useRef<
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
   * THREE.JS SCENE
   * --------------------------------
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (!container) {
      return
    }

    let animationFrameId = 0
    let destroyed = false

    /*
     * SCENE
     */

    const scene =
      new THREE.Scene()

    scene.background =
      new THREE.Color(
        0xdedede,
      )

    /*
     * CAMERA
     */

    const camera =
      new THREE.PerspectiveCamera(
        45,

        container.clientWidth /
          container.clientHeight,

        0.1,
        100,
      )

    camera.position.set(
      1.8,
      1.4,
      2.2,
    )

    /*
     * RENDERER
     */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
      })

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2,
      ),
    )

    renderer.setSize(
      container.clientWidth,
      container.clientHeight,
    )

    renderer.shadowMap.enabled =
      true

    renderer.shadowMap.type =
      THREE.PCFShadowMap

    container.appendChild(
      renderer.domElement,
    )

    /*
     * CAMERA CONTROLS
     */

    const controls =
      new OrbitControls(
        camera,
        renderer.domElement,
      )

    controls.enableDamping =
      true

    controls.target.set(
      0,
      0.45,
      0,
    )

    controls.minDistance =
      1.2

    controls.maxDistance =
      5

    controls.update()

    /*
     * LIGHTS
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
     * FLOOR
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
     * --------------------------------
     * FURNITURE MODEL
     * --------------------------------
     *
     * Здесь происходит главное
     * архитектурное изменение.
     *
     * App.tsx больше НЕ ищет:
     *
     * TableTop
     * Leg_01
     * Leg_02
     * Leg_03
     * Leg_04
     *
     * App.tsx больше НЕ знает:
     *
     * что length = X
     * что width = Z
     * какие детали надо масштабировать
     * какие детали надо перемещать
     * как менять UV
     *
     * Всё это находится в:
     *
     * TABLE_CONFIG
     *
     * и интерпретируется:
     *
     * FurnitureController.
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
           * React-компонент мог быть
           * уничтожен, пока GLB
           * загружался.
           */

          if (destroyed) {
            return
          }

          /*
           * 2.
           * Создаём универсальный
           * controller на основании
           * конфигурации этой модели.
           */

          const controller =
            createFurnitureController(
              model,
              TABLE_CONFIG,
            )

          /*
           * 3.
           * Связываем React UI
           * с controller.
           *
           * Здесь App знает только
           * названия изменяемых
           * параметров.
           *
           * Он не знает,
           * какие Three.js-объекты
           * изменятся в результате.
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
           * Если slider успели
           * изменить до окончания
           * загрузки GLB,
           * сразу восстанавливаем
           * актуальные размеры.
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
           * в Three.js-сцену.
           */

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
     * RESIZE
     * --------------------------------
     */

    const resizeObserver =
      new ResizeObserver(() => {
        const width =
          container.clientWidth

        const height =
          container.clientHeight

        camera.aspect =
          width / height

        camera.updateProjectionMatrix()

        renderer.setSize(
          width,
          height,
        )

        renderer.setPixelRatio(
          Math.min(
            window.devicePixelRatio,
            2,
          ),
        )
      })

    resizeObserver.observe(
      container,
    )

    /*
     * --------------------------------
     * RENDER LOOP
     * --------------------------------
     */

    const animate =
      () => {
        controls.update()

        renderer.render(
          scene,
          camera,
        )

        animationFrameId =
          requestAnimationFrame(
            animate,
          )
      }

    animate()

    /*
     * --------------------------------
     * CLEANUP
     * --------------------------------
     */

    return () => {
      destroyed = true

      /*
       * После уничтожения сцены
       * React больше не должен
       * обращаться к controller.
       */

      applyDimensionsRef.current =
        () => {}

      cancelAnimationFrame(
        animationFrameId,
      )

      resizeObserver.disconnect()

      controls.dispose()

      floorGeometry.dispose()

      floorMaterial.dispose()

      renderer.dispose()

      if (
        renderer.domElement
          .parentElement ===
        container
      ) {
        container.removeChild(
          renderer.domElement,
        )
      }
    }
  }, [])

  /*
   * --------------------------------
   * UI
   * --------------------------------
   *
   * Интерфейс пока специально
   * оставляем простым и конкретным.
   *
   * Позже его тоже сделаем
   * автоматически генерируемым
   * из TABLE_CONFIG.dimensionOrder.
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
        ref={containerRef}
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
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            marginBottom: 6,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {LENGTH_CONFIG.label}:{' '}
          {tableLength.toFixed(2)} м
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
          onChange={(event) => {
            setTableLength(
              Number(
                event.target.value,
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
          {WIDTH_CONFIG.label}:{' '}
          {tableWidth.toFixed(2)} м
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
          onChange={(event) => {
            setTableWidth(
              Number(
                event.target.value,
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