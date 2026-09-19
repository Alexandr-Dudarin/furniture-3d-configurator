import { useEffect, useRef, useState, type RefObject } from 'react'
import type { Scene } from 'three'
import type { ConfiguratorStore } from '../../configurator/configuratorStore'
import type { TableAssemblyConfiguration } from '../../configurator/tableAssembly/state'
import { getTableBase } from '../../configurator/tableAssembly/catalog'
import { loadFurnitureModel, disposeFurnitureModel } from '../furniture/model'
import { createFurnitureMaterialController, type FurnitureMaterialController } from '../materials/materialController'
import { createTableAssembly, type TableAssembly } from './tableAssembly'

export function useTableAssemblyScene(
  sceneRef: RefObject<Scene | null>,
  maxAnisotropyRef: RefObject<number>,
  store: ConfiguratorStore,
  enabled: boolean,
  configuration: TableAssemblyConfiguration,
) {
  const activeRef = useRef<{ baseId: string; assembly: TableAssembly; materials: FurnitureMaterialController } | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [failure, setFailure] = useState<{ baseId: string; attempt: number; message: string } | null>(null)
  const baseId = configuration.baseId

  useEffect(() => {
    const scene = sceneRef.current
    if (!enabled || !scene) return
    let cancelled = false
    let assembly: TableAssembly | null = null
    let materials: FurnitureMaterialController | null = null
    const prepare = async () => {
      try {
        const baseModel = await loadFurnitureModel(getTableBase(baseId).modelUrl)
        if (cancelled) { disposeFurnitureModel(baseModel); return }
        try {
          assembly = createTableAssembly(baseModel, store.getSnapshot().session.assembly)
        } catch (error) {
          disposeFurnitureModel(baseModel)
          throw error
        }
        materials = createFurnitureMaterialController(assembly.group, assembly.materialDefinition, {
          maxAnisotropy: maxAnisotropyRef.current, onMaterialsChanged: assembly.refreshTextures,
        })
        let applied: TableAssemblyConfiguration
        do {
          applied = store.getSnapshot().session.assembly
          await materials.setFinishes({ primaryTop: applied.topFinish, baseFinish: applied.baseFinish })
        } while (!cancelled && applied !== store.getSnapshot().session.assembly)
        if (cancelled) return
        assembly.update(store.getSnapshot().session.assembly)
        activeRef.current = { baseId, assembly, materials }
        scene.add(assembly.group)
        setFailure(null)
      } catch (error) {
        if (cancelled) return
        materials?.dispose()
        assembly?.dispose()
        console.error('Ошибка сборки стола:', error)
        setFailure({ baseId, attempt, message: 'Не удалось загрузить стол. Проверьте соединение и повторите загрузку.' })
      }
    }
    void prepare()
    return () => {
      cancelled = true
      if (activeRef.current?.assembly === assembly) activeRef.current = null
      materials?.dispose()
      if (assembly) { scene.remove(assembly.group); assembly.dispose() }
    }
  }, [enabled, baseId, attempt, maxAnisotropyRef, sceneRef, store])

  useEffect(() => {
    const active = activeRef.current
    if (!enabled || !active || active.baseId !== configuration.baseId) return
    active.assembly.update(configuration)
    void active.materials.setFinishes({ primaryTop: configuration.topFinish, baseFinish: configuration.baseFinish }).then(() => {
      if (activeRef.current === active) setFailure(null)
    }).catch((error) => {
      if (activeRef.current !== active) return
      console.error('Ошибка материала сборки:', error)
      setFailure({ baseId: configuration.baseId, attempt, message: 'Не удалось загрузить покрытие. Повторите загрузку стола.' })
    })
  }, [configuration, enabled, attempt])

  return {
    error: enabled && failure?.baseId === baseId && failure.attempt === attempt ? failure.message : null,
    retry: () => setAttempt((value) => value + 1),
  }
}
