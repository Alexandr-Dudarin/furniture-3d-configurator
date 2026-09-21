import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import type { Group, Scene } from 'three'
import type { ConfiguratorStore } from '../../configurator/configuratorStore'
import type { ConfiguratorSession } from '../../configurator/savedConfiguration'
import { getFurnitureDefinition } from '../../configurator/furnitureRegistry'
import { createFurnitureController } from './furnitureController'
import { disposeFurnitureModel, loadFurnitureModel } from './model'
import { createFurnitureMaterialController, type FurnitureMaterialController } from '../materials/materialController'

export function useCatalogScene(
  sceneRef: RefObject<Scene | null>, anisotropyRef: RefObject<number>,
  store: ConfiguratorStore, session: ConfiguratorSession,
) {
  const enabled = session.mode === 'catalog'
  const id = session.selectedModelId
  const configuration = session.models[id]
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState<{ token: object; error: string | null; reload?: boolean } | null>(null)
  const active = useRef<{
    token: object; id: string
    controller: ReturnType<typeof createFurnitureController>
    materials: FurnitureMaterialController
  } | null>(null)
  const token = useMemo(() => ({ id, enabled, attempt }), [id, enabled, attempt])

  useEffect(() => {
    const scene = sceneRef.current
    if (!enabled || !scene) return
    let cancelled = false
    let model: Group | null = null
    let materials: FurnitureMaterialController | null = null
    const dispose = () => {
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
        materials = createFurnitureMaterialController(loaded, definition, {
          maxAnisotropy: anisotropyRef.current, onMaterialsChanged: controller.refreshTextures,
        })
        let applied
        do {
          applied = store.getSnapshot().session.models[id].materials
          await materials.setFinishes(applied)
        } while (!cancelled && applied !== store.getSnapshot().session.models[id].materials)
        if (cancelled) return
        controller.setDimensions(store.getSnapshot().session.models[id].dimensions)
        active.current = { token, id, controller, materials }
        scene.add(loaded)
        setStatus({ token, error: null })
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
  }, [id, enabled, token, store, sceneRef, anisotropyRef])

  useEffect(() => {
    const current = active.current
    if (!enabled || !current || current.id !== id) return
    current.controller.setDimensions(configuration.dimensions)
    void current.materials.setFinishes(configuration.materials).then(() => {
      if (active.current === current) setStatus({ token: current.token, error: null })
    }).catch((error) => {
      if (active.current !== current) return
      console.error('Ошибка смены материала:', error)
      setStatus({ token: current.token, error: 'Не удалось загрузить покрытие. Повторите загрузку модели.' })
    })
  }, [id, enabled, configuration])

  // Readiness uses a request key, not an old model's completion state.
  return {
    loading: enabled && status?.token !== token,
    error: enabled && status?.token === token ? status?.error ?? null : null,
    retry: () => {
      if (status?.reload) window.location.replace(store.getShareUrl())
      else setAttempt((value) => value + 1)
    },
  }
}
