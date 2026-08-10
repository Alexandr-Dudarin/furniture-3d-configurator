import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import './App.css'

const BASE_LENGTH = 1.2
const MAX_LENGTH = 2.0

const BASE_WIDTH = 0.6
const MAX_WIDTH = 1.0

type TextureAxis = 'x' | 'y'

type TextureState = {
  texture: THREE.Texture
  baseRepeatX: number
  baseRepeatY: number
  baseOffsetX: number
  baseOffsetY: number
  lengthAxis?: TextureAxis
  widthAxis?: TextureAxis
}

function App() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [tableLength, setTableLength] =
    useState(BASE_LENGTH)

  const [tableWidth, setTableWidth] =
    useState(BASE_WIDTH)

  const currentLengthRef = useRef(BASE_LENGTH)
  const currentWidthRef = useRef(BASE_WIDTH)

  const applyDimensionsRef = useRef<
    (length: number, width: number) => void
  >(() => {})

  useEffect(() => {
    currentLengthRef.current = tableLength
    currentWidthRef.current = tableWidth

    applyDimensionsRef.current(
      tableLength,
      tableWidth,
    )
  }, [tableLength, tableWidth])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let animationFrameId = 0
    let destroyed = false

    // SCENE
    const scene = new THREE.Scene()

    scene.background =
      new THREE.Color(0xdedede)

    // CAMERA
    const camera =
      new THREE.PerspectiveCamera(
        45,
        container.clientWidth /
          container.clientHeight,
        0.1,
        100,
      )

    camera.position.set(1.8, 1.4, 2.2)

    // RENDERER
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

    renderer.shadowMap.enabled = true
    renderer.shadowMap.type =
      THREE.PCFShadowMap

    container.appendChild(
      renderer.domElement,
    )

    // CAMERA CONTROLS
    const controls =
      new OrbitControls(
        camera,
        renderer.domElement,
      )

    controls.enableDamping = true

    controls.target.set(
      0,
      0.45,
      0,
    )

    controls.minDistance = 1.2
    controls.maxDistance = 5

    controls.update()

    // LIGHT
    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.2,
      )

    scene.add(ambientLight)

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

    keyLight.castShadow = true

    keyLight.shadow.mapSize.set(
      2048,
      2048,
    )

    scene.add(keyLight)

    // FLOOR
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

    floor.receiveShadow = true

    scene.add(floor)

    // GLB
    const loader =
      new GLTFLoader()

    loader.load(
      '/models/first-table.glb',

      (gltf) => {
        if (destroyed) {
          return
        }

        const table =
          gltf.scene

        table.traverse((object) => {
          if (
            object instanceof
            THREE.Mesh
          ) {
            object.castShadow =
              true

            object.receiveShadow =
              true
          }
        })

        const tableTop =
          table.getObjectByName(
            'TableTop',
          )

        const legNames = [
          'Leg_01',
          'Leg_02',
          'Leg_03',
          'Leg_04',
        ]

        const legs =
          legNames
            .map((name) =>
              table.getObjectByName(
                name,
              ),
            )
            .filter(
              (
                leg,
              ): leg is THREE.Object3D =>
                Boolean(leg),
            )

        if (!tableTop) {
          console.error(
            'Не найден объект TableTop',
          )

          scene.add(table)

          return
        }

        if (legs.length !== 4) {
          console.error(
            `Ожидалось 4 ножки, найдено: ${legs.length}`,
          )

          scene.add(table)

          return
        }

        /*
         * Исходные половины размеров.
         */

        const baseHalfLength =
          BASE_LENGTH / 2

        const baseHalfWidth =
          BASE_WIDTH / 2

        /*
         * Запоминаем положение каждой
         * ножки относительно краёв.
         *
         * X = длина
         * Z = ширина
         */

        const legStates =
          legs.map((leg) => {
            const sideX =
              Math.sign(
                leg.position.x,
              ) || 1

            const sideZ =
              Math.sign(
                leg.position.z,
              ) || 1

            const insetFromLengthEdge =
              baseHalfLength -
              Math.abs(
                leg.position.x,
              )

            const insetFromWidthEdge =
              baseHalfWidth -
              Math.abs(
                leg.position.z,
              )

            return {
              leg,
              sideX,
              sideZ,
              insetFromLengthEdge,
              insetFromWidthEdge,
            }
          })

        /*
         * Как физические размеры
         * соответствуют UV каждого
         * материала.
         *
         * Верх / низ:
         * U = длина
         * V = ширина
         *
         * Длинный торец:
         * U = длина
         *
         * Короткий торец:
         * U = ширина
         */

        const materialTextureAxes =
          new Map<
            string,
            {
              lengthAxis?: TextureAxis
              widthAxis?: TextureAxis
            }
          >([
            [
              'Wood_Top',
              {
                lengthAxis: 'x',
                widthAxis: 'y',
              },
            ],

            [
              'Wood_Bottom',
              {
                lengthAxis: 'x',
                widthAxis: 'y',
              },
            ],

            [
              'Wood_Edge_Long',
              {
                lengthAxis: 'x',
              },
            ],

            [
              'Wood_Edge_Short',
              {
                widthAxis: 'x',
              },
            ],
          ])

        const textureStates:
          TextureState[] = []

        /*
         * Клонируем Texture,
         * чтобы изменение repeat/offset
         * не влияло на другие материалы.
         */

        const cloneTexture = (
          texture:
            | THREE.Texture
            | null,
        ):
          | THREE.Texture
          | null => {
          if (!texture) {
            return null
          }

          const clone =
            texture.clone()

          clone.needsUpdate = true

          return clone
        }

        tableTop.traverse(
          (object) => {
            if (
              !(
                object instanceof
                THREE.Mesh
              )
            ) {
              return
            }

            if (
              Array.isArray(
                object.material,
              )
            ) {
              return
            }

            if (
              !(
                object.material instanceof
                THREE.MeshStandardMaterial
              )
            ) {
              return
            }

            const originalMaterial =
              object.material

            const material =
              originalMaterial.clone()

            material.map =
              cloneTexture(
                originalMaterial.map,
              )

            material.normalMap =
              cloneTexture(
                originalMaterial.normalMap,
              )

            material.roughnessMap =
              cloneTexture(
                originalMaterial.roughnessMap,
              )

            material.metalnessMap =
              cloneTexture(
                originalMaterial.metalnessMap,
              )

            material.aoMap =
              cloneTexture(
                originalMaterial.aoMap,
              )

            material.bumpMap =
              cloneTexture(
                originalMaterial.bumpMap,
              )

            object.material =
              material

            const axes =
              materialTextureAxes.get(
                material.name,
              )

            if (!axes) {
              return
            }

            const textures = [
              material.map,
              material.normalMap,
              material.roughnessMap,
              material.metalnessMap,
              material.aoMap,
              material.bumpMap,
            ]

            const uniqueTextures =
              new Set(
                textures.filter(
                  (
                    texture,
                  ): texture is THREE.Texture =>
                    texture !== null,
                ),
              )

            uniqueTextures.forEach(
              (texture) => {
                if (
                  axes.lengthAxis ===
                    'x' ||
                  axes.widthAxis ===
                    'x'
                ) {
                  texture.wrapS =
                    THREE.RepeatWrapping
                }

                if (
                  axes.lengthAxis ===
                    'y' ||
                  axes.widthAxis ===
                    'y'
                ) {
                  texture.wrapT =
                    THREE.RepeatWrapping
                }

                texture.needsUpdate =
                  true

                textureStates.push({
                  texture,

                  baseRepeatX:
                    texture.repeat.x,

                  baseRepeatY:
                    texture.repeat.y,

                  baseOffsetX:
                    texture.offset.x,

                  baseOffsetY:
                    texture.offset.y,

                  lengthAxis:
                    axes.lengthAxis,

                  widthAxis:
                    axes.widthAxis,
                })
              },
            )
          },
        )

        /*
         * Центральное масштабирование
         * одной UV-оси.
         */

        const applyTextureAxis = (
          texture:
            THREE.Texture,

          axis:
            TextureAxis,

          baseRepeat:
            number,

          baseOffset:
            number,

          scale:
            number,
        ) => {
          const newRepeat =
            baseRepeat *
            scale

          const newOffset =
            baseOffset +
            (baseRepeat *
              (1 - scale)) /
              2

          if (axis === 'x') {
            texture.repeat.x =
              newRepeat

            texture.offset.x =
              newOffset

            return
          }

          texture.repeat.y =
            newRepeat

          texture.offset.y =
            newOffset
        }

        /*
         * Главная функция изменения
         * размеров стола.
         */

        const applyDimensions = (
          newLength: number,
          newWidth: number,
        ) => {
          const lengthScale =
            newLength /
            BASE_LENGTH

          const widthScale =
            newWidth /
            BASE_WIDTH

          /*
           * 1. Столешница растёт
           * относительно центра.
           */

          tableTop.scale.x =
            lengthScale

          tableTop.scale.z =
            widthScale

          /*
           * 2. Ножки остаются
           * на одинаковом расстоянии
           * от четырёх краёв.
           */

          const newHalfLength =
            newLength / 2

          const newHalfWidth =
            newWidth / 2

          legStates.forEach(
            ({
              leg,
              sideX,
              sideZ,
              insetFromLengthEdge,
              insetFromWidthEdge,
            }) => {
              leg.position.x =
                sideX *
                (
                  newHalfLength -
                  insetFromLengthEdge
                )

              leg.position.z =
                sideZ *
                (
                  newHalfWidth -
                  insetFromWidthEdge
                )
            },
          )

          /*
           * 3. Текстуры.
           *
           * Для каждого материала
           * изменяем только те UV-оси,
           * которые соответствуют
           * физически изменившемуся
           * размеру.
           */

          textureStates.forEach(
            ({
              texture,
              baseRepeatX,
              baseRepeatY,
              baseOffsetX,
              baseOffsetY,
              lengthAxis,
              widthAxis,
            }) => {
              /*
               * Сначала возвращаем
               * исходное состояние.
               */

              texture.repeat.x =
                baseRepeatX

              texture.repeat.y =
                baseRepeatY

              texture.offset.x =
                baseOffsetX

              texture.offset.y =
                baseOffsetY

              /*
               * ДЛИНА
               */

              if (
                lengthAxis === 'x'
              ) {
                applyTextureAxis(
                  texture,
                  'x',
                  baseRepeatX,
                  baseOffsetX,
                  lengthScale,
                )
              }

              if (
                lengthAxis === 'y'
              ) {
                applyTextureAxis(
                  texture,
                  'y',
                  baseRepeatY,
                  baseOffsetY,
                  lengthScale,
                )
              }

              /*
               * ШИРИНА
               */

              if (
                widthAxis === 'x'
              ) {
                applyTextureAxis(
                  texture,
                  'x',
                  baseRepeatX,
                  baseOffsetX,
                  widthScale,
                )
              }

              if (
                widthAxis === 'y'
              ) {
                applyTextureAxis(
                  texture,
                  'y',
                  baseRepeatY,
                  baseOffsetY,
                  widthScale,
                )
              }

              texture.needsUpdate =
                true
            },
          )

          tableTop.updateMatrixWorld()
        }

        applyDimensionsRef.current =
          applyDimensions

        /*
         * Если slider изменили,
         * пока GLB ещё загружался.
         */

        applyDimensions(
          currentLengthRef.current,
          currentWidthRef.current,
        )

        scene.add(table)
      },

      undefined,

      (error) => {
        console.error(
          'Ошибка загрузки GLB:',
          error,
        )
      },
    )

    // RESIZE
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

    // RENDER LOOP
    const animate = () => {
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

    // CLEANUP
    return () => {
      destroyed = true

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
          Длина стола:{' '}
          {tableLength.toFixed(2)} м
        </div>

        <input
          type="range"
          min={BASE_LENGTH}
          max={MAX_LENGTH}
          step={0.01}
          value={tableLength}
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
          Ширина стола:{' '}
          {tableWidth.toFixed(2)} м
        </div>

        <input
          type="range"
          min={BASE_WIDTH}
          max={MAX_WIDTH}
          step={0.01}
          value={tableWidth}
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