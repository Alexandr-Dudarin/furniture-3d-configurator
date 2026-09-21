import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { Scene } from 'three'
import type { ConfiguratorStore } from '../configurator/configuratorStore'
import { ViewerStatus } from '../components/ViewerStatus'
import { createThreeRuntime } from './core/createThreeRuntime'
import { createSceneEnvironment } from './core/createSceneEnvironment'
import { disposeMaterialFinishCache } from './materials/createMaterial'
import { disposeFurnitureSourceCache } from './furniture/model'
import { useCatalogScene } from './furniture/useCatalogScene'
import { useTableAssemblyScene } from './tableAssembly/useTableAssemblyScene'

export default function SceneView({ store }: { store: ConfiguratorStore }) {
  const { session } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const anisotropyRef = useRef(1)

  useEffect(() => {
    if (!containerRef.current) return
    const runtime = createThreeRuntime(containerRef.current)
    let environment: ReturnType<typeof createSceneEnvironment>
    try {
      environment = createSceneEnvironment(runtime.scene, runtime.renderer)
    } catch (error) {
      runtime.dispose()
      throw error
    }
    sceneRef.current = runtime.scene
    anisotropyRef.current = runtime.renderer.capabilities.getMaxAnisotropy()
    return () => {
      sceneRef.current = null
      environment.dispose()
      runtime.dispose()
      disposeMaterialFinishCache()
      disposeFurnitureSourceCache()
    }
  }, [])

  const catalog = useCatalogScene(sceneRef, anisotropyRef, store, session)
  const assembly = useTableAssemblyScene(sceneRef, anisotropyRef, store, session.mode === 'builder', session.assembly)
  const preview = session.mode === 'builder' ? assembly : catalog
  return <>
    <div className="scene-canvas" ref={containerRef} aria-label="3D-просмотр мебели" aria-busy={preview.loading} />
    {preview.error
      ? <ViewerStatus message={preview.error} onRetry={preview.retry} />
      : preview.loading && <ViewerStatus message="Загружаем модель и материалы…" />}
  </>
}
