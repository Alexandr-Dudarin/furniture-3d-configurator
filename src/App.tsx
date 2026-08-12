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
    } = runtime

    sceneRef.current =
      scene

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

    applyDimensionsRef.current =
      () => {}

    const prepareFurniture =
      async () => {
        try {
          const model =
            await loadFurnitureModel(
              furnitureDefinition.modelUrl,
            )

          if (
            cancelled
          ) {
            disposeFurnitureModel(
              model,
            )

            return
          }

          const controller =
            createFurnitureController(
              model,
              furnitureDefinition,
            )

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
        }
      }

    void prepareFurniture()

    return () => {
      cancelled =
        true

      applyDimensionsRef.current =
        () => {}

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
      </div>
    </div>
  )
}

export default App