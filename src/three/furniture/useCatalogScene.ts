import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { Group } from 'three'
import type { ThreeRuntime } from '../core/createThreeRuntime'
import type { FurnitureMotionStore } from '../../configurator/furnitureMotionStore'
import { createFurnitureMotion, type FurnitureMotion } from './furnitureMotion'
import { bindFurnitureInteraction } from './furnitureInteraction'
import type { ConfiguratorStore } from '../../configurator/configuratorStore'
import type { ConfiguratorSession } from '../../configurator/savedConfiguration'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from './furnitureController'
import { disposeFurnitureModel, loadFurnitureModel } from './model'
import { createFurnitureMaterialController, type FurnitureMaterialController } from '../materials/materialController'
import { createFurniturePresentation, type FurnitureView } from './furniturePresentation'

export function useCatalogScene(
  runtimeRef: RefObject<ThreeRuntime | null>, anisotropyRef: RefObject<number>,
  store: ConfiguratorStore, session: ConfiguratorSession, furnitureView: FurnitureView, motionStore: FurnitureMotionStore,
) {
  const enabled = session.mode === 'catalog'
  const id = session.selectedModelId
  const configuration = session.models[id]
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<{ token: object; error: string | null; configuration?: typeof configuration; reload?: boolean } | null>(null)
  const active = useRef<{
    token: object; id: string
    controller: ReturnType<typeof createFurnitureController>
    materials: FurnitureMaterialController
    motion: FurnitureMotion
    presentation: ReturnType<typeof createFurniturePresentation>
  } | null>(null)
  const token = useMemo(() => ({ id, enabled, attempt }), [id, enabled, attempt])
  const viewRef = useRef(furnitureView)

  // Read the latest view when a pending model finishes loading. Switching views
  // does not reload its geometry, reapply finishes or move the camera.
  useEffect(() => {
    viewRef.current = furnitureView
    const current = active.current
    if (current) {
      current.motion.setAll(false, true)
      current.presentation.setView(furnitureView)
      current.motion.syncVisibility()
    }
  }, [furnitureView])

  useEffect(() => {
    const runtime = runtimeRef.current
    if (!enabled || !runtime) return
    const { scene } = runtime
    let cancelled = false
    let model: Group | null = null
    let materials: FurnitureMaterialController | null = null
    let presentation: ReturnType<typeof createFurniturePresentation> | null = null
    let motion: FurnitureMotion | null = null
    let binding: ReturnType<FurnitureMotionStore['attach']> | null = null
    let stopFrames: (() => void) | undefined
    let stopInteraction: (() => void) | undefined
    let stopPreference: (() => void) | undefined
    const dispose = () => {
      stopInteraction?.(); stopFrames?.(); stopPreference?.(); binding?.detach()
      motion?.dispose()
      presentation?.dispose()
      materials?.dispose()
      if (model) { scene.remove(model); disposeFurnitureModel(model); model = null }
    }
    let loadingRuntime = false
    const prepare = async () => {
      try {
        const catalogue = getFurnitureDefinition(id)
        loadingRuntime = !!catalogue.loadRuntime
        const definition = catalogue.loadRuntime ? await catalogue.loadRuntime() : catalogue
        loadingRuntime = false
        if (cancelled) return
        const loaded = await loadFurnitureModel(definition.modelUrl)
        if (cancelled) { disposeFurnitureModel(loaded); return }
        model = loaded
        const controller = createFurnitureController(loaded, definition)
        presentation = createFurniturePresentation(loaded, definition)
        materials = createFurnitureMaterialController(loaded, definition, {
          maxAnisotropy: anisotropyRef.current, onMaterialsChanged: () => {
            if (motion) motion.withClosedPose(controller.refreshTextures)
            else controller.refreshTextures()
          },
        })
        let applied
        do {
          applied = store.getSnapshot().session.models[id].materials
          await materials.setFinishes(applied)
        } while (!cancelled && applied !== store.getSnapshot().session.models[id].materials)
        if (cancelled) return
        controller.setDimensions(store.getSnapshot().session.models[id].dimensions)
        presentation.setView(viewRef.current)
        motion = createFurnitureMotion(loaded, definition, controller.getDimensions, states => binding?.publish(states))
        if (definition.articulations?.length) {
          const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
          const updatePreference = () => motion?.setReducedMotion(preference.matches)
          updatePreference()
          preference.addEventListener('change', updatePreference)
          stopPreference = () => preference.removeEventListener('change', updatePreference)
          binding = motionStore.attach(id, motion, motion.getStates())
          stopFrames = runtime.addFrameListener(motion.update)
          stopInteraction = bindFurnitureInteraction(runtime.renderer.domElement, runtime.camera, loaded, motion)
        }
        active.current = { token, id, controller, materials, presentation, motion }
        scene.add(loaded)
        setStatus({ token, configuration: store.getSnapshot().session.models[id], error: null })
      } catch (error) {
        if (cancelled) return
        dispose()
        console.error('Ошибка подготовки мебели:', error)
        setStatus({ token, reload: loadingRuntime, error: loadingRuntime
          ? 'Не удалось загрузить настройки модели. Повтор обновит страницу, сохранив ваш выбор.'
          : 'Не удалось загрузить модель и материалы. Проверьте соединение и повторите попытку.' })
      }
    }
    void prepare()
    return () => {
      cancelled = true
      if (active.current?.token === token) active.current = null
      dispose()
    }
  }, [id, enabled, token, store, runtimeRef, anisotropyRef, motionStore])

  useEffect(() => {
    const current = active.current
    if (!enabled || !current || current.id !== id) return
    let cancelled = false
    current.motion.withClosedPose(() => current.controller.setDimensions(configuration.dimensions))
    void current.materials.setFinishes(configuration.materials).then(() => {
      if (!cancelled && active.current === current) setStatus({ token: current.token, configuration, error: null })
    }).catch((error) => {
      if (cancelled || active.current !== current) return
      console.error('Ошибка смены материала:', error)
      setStatus({ token: current.token, error: 'Не удалось загрузить покрытие. Повторите загрузку модели.' })
    })
    return () => { cancelled = true }
  }, [id, enabled, configuration])

  // Readiness uses a request key, not an old model's completion state.
  return {
    ready: enabled && status?.token === token && status.configuration === configuration && !status.error,
    loading: enabled && status?.token !== token,
    error: enabled && status?.token === token ? status?.error ?? null : null,
    retry: () => {
      if (status?.reload) window.location.replace(store.getShareUrl())
      else setAttempt((value) => value + 1)
    },
  }
}
