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
  CustomSelect,
  type CustomSelectOption,
} from './components/ui/CustomSelect/CustomSelect'

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

import {
  createFurnitureMaterialController,
  createInitialMaterialSelections,
  type FurnitureMaterialController,
} from './three/materials/materialController'

import {
  getMaterialFinish,
} from './three/materials/materialRegistry'

import type {
  MaterialSelections,
} from './three/materials/types'

import './App.css'

const furnitureDefinitions =
  getFurnitureDefinitions()

const furnitureOptions:
  CustomSelectOption[] =
    furnitureDefinitions.map(
      (definition) => ({
        value:
          definition.id,

        label:
          definition.label,
      }),
    )

function App() {
  const containerRef =
    useRef<HTMLDivElement | null>(
      null,
    )

  /*
   * --------------------------------
   * SELECTED MODEL
   * --------------------------------
   */

  const [
    selectedModelId,
    setSelectedModelId,
  ] =
    useState<string>(
      DEFAULT_FURNITURE_ID,
    )

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

  const currentDimensionsRef =
    useRef<ConfiguratorDimensions>(
      dimensions,
    )

  /*
   * --------------------------------
   * MATERIAL SELECTIONS
   * --------------------------------
   *
   * Selections are kept per model for the
   * current session. Switching furniture and
   * returning to it restores its finishes.
   */

  const [
    materialSelectionsByModel,
    setMaterialSelectionsByModel,
  ] = useState<
    Record<
      string,
      MaterialSelections
    >
  >(() => ({
    [furnitureDefinition.id]:
      createInitialMaterialSelections(
        furnitureDefinition,
      ),
  }))

  const materialSelections =
    materialSelectionsByModel[
      furnitureDefinition.id
    ] ??
    createInitialMaterialSelections(
      furnitureDefinition,
    )

  const currentMaterialSelectionsRef =
    useRef<MaterialSelections>(
      materialSelections,
    )

  const materialControllerRef =
    useRef<
      {
        furnitureId: string
        controller:
          FurnitureMaterialController
      } | null
    >(null)

  const maxAnisotropyRef =
    useRef(1)

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

  useEffect(() => {
    currentMaterialSelectionsRef.current =
      materialSelections

    const activeController =
      materialControllerRef.current

    if (
      !activeController ||
      activeController.furnitureId !==
        furnitureDefinition.id
    ) {
      return
    }

    void activeController
      .controller
      .setFinishes(
        materialSelections,
      )
      .catch(
        (error) => {
          console.error(
            'Ошибка смены материала:',
            error,
          )
        },
      )
  }, [
    furnitureDefinition.id,
    materialSelections,
  ])

  /*
   * =================================
   * THREE.JS APPLICATION LIFECYCLE
   * =================================
   *
   * Scene, renderer, camera,
   * controls и environment
   * создаются один раз.
   */

  useEffect(() => {
    const container =
      containerRef.current

    if (
      !container
    ) {
      return
    }

    const runtime =
      createThreeRuntime(
        container,
      )

    const {
      scene,
      renderer,
    } = runtime

    sceneRef.current =
      scene

    maxAnisotropyRef.current =
      renderer.capabilities
        .getMaxAnisotropy()

    const environment =
      createSceneEnvironment(
        scene,
      )

    return () => {
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
   * Этот effect отвечает
   * только за выбранную модель.
   *
   * При смене модели:
   *
   * старая мебель удаляется,
   * её ресурсы освобождаются,
   * новый GLB загружается,
   *
   * а сцена, камера и свет
   * остаются прежними.
   */

  useEffect(() => {
    const scene =
      sceneRef.current

    if (
      !scene
    ) {
      return
    }

    let cancelled =
      false

    let furnitureModel:
      Group | null =
        null

    let preparingModel:
      Group | null =
        null

    let materialController:
      FurnitureMaterialController | null =
        null

    applyDimensionsRef.current =
      () => {}

    const prepareFurniture =
      async () => {
        try {
          const model =
            await loadFurnitureModel(
              furnitureDefinition.modelUrl,
            )

          preparingModel =
            model

          if (
            cancelled
          ) {
            if (
              preparingModel ===
              model
            ) {
              disposeFurnitureModel(
                model,
              )
            }

            preparingModel =
              null

            return
          }

          const controller =
            createFurnitureController(
              model,
              furnitureDefinition,
            )

          materialController =
            createFurnitureMaterialController(
              model,
              furnitureDefinition,
              {
                maxAnisotropy:
                  maxAnisotropyRef.current,
                onMaterialsChanged:
                  controller.refreshTextures,
              },
            )

          await materialController
            .setFinishes(
              currentMaterialSelectionsRef.current,
            )

          if (cancelled) {
            materialController.dispose()

            if (
              preparingModel ===
              model
            ) {
              disposeFurnitureModel(
                model,
              )
            }

            preparingModel =
              null

            return
          }

          materialControllerRef.current =
            {
              furnitureId:
                furnitureDefinition.id,
              controller:
                materialController,
            }

          applyDimensionsRef.current =
            (
              nextDimensions,
            ) => {
              controller.setDimensions(
                nextDimensions,
              )
            }

          controller.setDimensions(
            currentDimensionsRef.current,
          )

          furnitureModel =
            model

          preparingModel =
            null

          scene.add(
            model,
          )
        } catch (
          error
        ) {
          if (
            cancelled
          ) {
            return
          }

          console.error(
            'Ошибка подготовки мебели:',
            error,
          )

          if (preparingModel) {
            disposeFurnitureModel(
              preparingModel,
            )

            preparingModel =
              null
          }
        }
      }

    void prepareFurniture()

    return () => {
      cancelled =
        true

      applyDimensionsRef.current =
        () => {}

      if (
        materialControllerRef.current
          ?.controller ===
          materialController
      ) {
        materialControllerRef.current =
          null
      }

      materialController?.dispose()

      if (preparingModel) {
        disposeFurnitureModel(
          preparingModel,
        )

        preparingModel =
          null
      }

      if (
        !furnitureModel
      ) {
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

      const nextDefinition =
        getFurnitureDefinition(
          nextModelId,
        )

      const nextDimensions =
        createInitialDimensions(
          nextDefinition,
        )

      currentDimensionsRef.current =
        nextDimensions

      setDimensions(
        nextDimensions,
      )

      const nextMaterialSelections =
        materialSelectionsByModel[
          nextModelId
        ] ??
        createInitialMaterialSelections(
          nextDefinition,
        )

      currentMaterialSelectionsRef.current =
        nextMaterialSelections

      if (
        !materialSelectionsByModel[
          nextModelId
        ]
      ) {
        setMaterialSelectionsByModel(
          (current) => ({
            ...current,
            [nextModelId]:
              nextMaterialSelections,
          }),
        )
      }

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
            220,

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

          <CustomSelect
            value={
              selectedModelId
            }

            options={
              furnitureOptions
            }

            onChange={
              handleModelChange
            }

            ariaLabel="Выбор модели мебели"
          />
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


        {Object.entries(
          furnitureDefinition
            .materialSlots ?? {},
        ).map(
          ([slotName, slot]) => {
            const value =
              materialSelections[
                slotName
              ] ??
              slot.defaultFinish

            const options =
              slot.allowedFinishes.map(
                (finishId) => {
                  const finish =
                    getMaterialFinish(
                      finishId,
                    )

                  return {
                    value:
                      finish.id,
                    label:
                      finish.label,
                  }
                },
              )

            return (
              <div
                key={
                  slotName
                }
                style={{
                  marginTop: 16,
                }}
              >
                <div
                  style={{
                    marginBottom:
                      6,
                    fontSize: 14,
                    fontWeight:
                      600,
                  }}
                >
                  {slot.label}
                </div>

                <CustomSelect
                  value={value}
                  options={options}
                  onChange={(
                    finishId,
                  ) => {
                    const next = {
                      ...materialSelections,
                      [slotName]:
                        finishId,
                    }

                    currentMaterialSelectionsRef.current =
                      next

                    setMaterialSelectionsByModel(
                      (current) => ({
                        ...current,
                        [furnitureDefinition.id]:
                          next,
                      }),
                    )
                  }}
                  ariaLabel={
                    slot.label
                  }
                />
              </div>
            )
          },
        )}
      </div>
    </div>
  )
}

export default App
