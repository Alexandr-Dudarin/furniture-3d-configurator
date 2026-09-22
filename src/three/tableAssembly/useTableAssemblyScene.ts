import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
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
  const [status, setStatus] = useState<{ token: object; error: string | null; configuration?: TableAssemblyConfiguration } | null>(null)
  const baseId = configuration.baseId
  const token = useMemo(() => ({ baseId, enabled, attempt }), [baseId, enabled, attempt])

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
        setStatus({ token, configuration: store.getSnapshot().session.assembly, error: null })
      } catch (error) {
        if (cancelled) return
        materials?.dispose()
        assembly?.dispose()
        console.error('Ошибка сборки стола:', error)
        setStatus({ token, error: 'Не удалось загрузить стол. Проверьте соединение и повторите загрузку.' })
      }
    }
    void prepare()
    return () => {
      cancelled = true
      if (activeRef.current?.assembly === assembly) activeRef.current = null
      materials?.dispose()
      if (assembly) { scene.remove(assembly.group); assembly.dispose() }
    }
  }, [enabled, baseId, token, maxAnisotropyRef, sceneRef, store])

  useEffect(() => {
    const active = activeRef.current
    if (!enabled || !active || active.baseId !== configuration.baseId) return
    let cancelled = false
    active.assembly.update(configuration)
    void active.materials.setFinishes({ primaryTop: configuration.topFinish, baseFinish: configuration.baseFinish }).then(() => {
      if (!cancelled && activeRef.current === active) setStatus({ token, configuration, error: null })
    }).catch((error) => {
      if (cancelled || activeRef.current !== active) return
      console.error('Ошибка материала сборки:', error)
      setStatus({ token, error: 'Не удалось загрузить покрытие. Повторите загрузку стола.' })
    })
    return () => { cancelled = true }
  }, [configuration, enabled, token])

  return {
    ready: enabled && status?.token === token && status.configuration === configuration && !status.error,
    loading: enabled && status?.token !== token,
    error: enabled && status?.token === token ? status.error : null,
    retry: () => setAttempt((value) => value + 1),
  }
}
