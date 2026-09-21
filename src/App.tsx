import {
  useEffect,
  useRef,
} from 'react'

import type {
  Group,
  Scene,
} from 'three'

import {
  CustomSelect,
  type CustomSelectOption,
} from './components/ui/CustomSelect/CustomSelect'

import type { ConfiguratorDimensions } from './configurator/configuratorState'
import { useConfigurator } from './configurator/useConfigurator'
import { ConfigurationActions } from './components/ConfigurationActions'
import { getFurnitureDefinition, getFurnitureDefinitions } from './configurator/furnitureRegistry'

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
  type FurnitureMaterialController,
} from './three/materials/materialController'

import { SizeControl } from './components/assembly/SizeControl'
import { FinishPicker } from './components/assembly/FinishPicker'

import { TableAssemblyControls } from './components/TableAssemblyControls'
import { useTableAssemblyScene } from './three/tableAssembly/useTableAssemblyScene'

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

  const { store, session, persistence, notice } = useConfigurator()
  const selectedModelId = session.selectedModelId
  const furnitureDefinition = getFurnitureDefinition(selectedModelId)
  const { dimensions, materials: materialSelections } = session.models[selectedModelId]
  const activeModelIdRef = useRef<string | null>(null)

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
    if (activeModelIdRef.current === furnitureDefinition.id) {
      applyDimensionsRef.current(dimensions)
    }
  }, [dimensions, furnitureDefinition.id])

  useEffect(() => {
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
        renderer,
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
      !scene || session.mode !== 'catalog'
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

          // Selections can change while GLB or textures are loading. Finish
          // preparation with the latest configuration before showing the model.
          let appliedSelections
          do {
            appliedSelections = store.getSnapshot().session.models[furnitureDefinition.id].materials
            await materialController.setFinishes(appliedSelections)
          } while (!cancelled &&
            appliedSelections !== store.getSnapshot().session.models[furnitureDefinition.id].materials)

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

          activeModelIdRef.current = furnitureDefinition.id
          applyDimensionsRef.current =
            (
              nextDimensions,
            ) => {
              controller.setDimensions(
                nextDimensions,
              )
            }

          controller.setDimensions(
            store.getSnapshot().session.models[furnitureDefinition.id].dimensions,
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
      activeModelIdRef.current = null

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
  }, [furnitureDefinition, store, session.mode])

  const assemblyPreview = useTableAssemblyScene(sceneRef, maxAnisotropyRef, store, session.mode === 'builder', session.assembly)

  /*
   * =================================
   * CHANGE MODEL
   * =================================
   */

  const handleModelChange = (modelId: string) => {
    store.dispatch({ type: 'select-model', modelId })
  }

  /*
   * =================================
   * UI
   * =================================
   */

  return (
    <div className="app">
      <div className="viewer" ref={containerRef} />

      <div
        className="configuration-panel"
      >
        <div className="configuration-mode" role="group" aria-label="Способ выбора стола">
          <button type="button" aria-pressed={session.mode === 'catalog'} onClick={() => store.dispatch({ type: 'set-mode', mode: 'catalog' })}>Готовые модели</button>
          <button type="button" aria-pressed={session.mode === 'builder'} onClick={() => store.dispatch({ type: 'set-mode', mode: 'builder' })}>Собрать стол</button>
        </div>
        {session.mode === 'builder' ? (
          <>
            <TableAssemblyControls configuration={session.assembly} onChange={(patch) => store.dispatch({ type: 'update-assembly', patch })} />
            {assemblyPreview.error && <div className="assembly-error" role="alert">
              <p>{assemblyPreview.error}</p><button type="button" onClick={assemblyPreview.retry}>Повторить загрузку</button>
            </div>}
          </>
        ) : <>
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

        {furnitureDefinition.dimensionOrder.map((dimension) => {
          const config = furnitureDefinition.dimensions[dimension]
          return <SizeControl key={`${selectedModelId}-${dimension}`} name={config.label}
            config={config} value={dimensions[dimension] ?? config.base}
            onChange={(value) => store.dispatch({ type: 'set-dimension', name: dimension, value })} />
        })}
        {Object.entries(furnitureDefinition.materialSlots ?? {}).map(([slotName, slot]) => (
          <FinishPicker key={`${selectedModelId}-${slotName}`} label={slot.label}
            value={materialSelections[slotName] ?? slot.defaultFinish} ids={slot.allowedFinishes}
            onChange={(finishId) => store.dispatch({ type: 'set-material', slot: slotName, finishId })} />
        ))}
        </>}
        <ConfigurationActions
          resetLabel={session.mode === 'builder' ? 'Сбросить сборку' : 'Сбросить эту модель'}
          key={JSON.stringify(session)}
          persistence={persistence}
          notice={notice}
          getShareUrl={store.getShareUrl}
          onReset={() => store.dispatch({ type: 'reset-model' })}
        />
      </div>
    </div>
  )
}

export default App
