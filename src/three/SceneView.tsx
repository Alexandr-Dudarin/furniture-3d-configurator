import type { PngExportStore } from '../configurator/pngExportStore'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import type { Scene } from 'three'
import { getFurnitureDefinition, getFurnitureDefinitions } from '../configurator/furnitureRegistry'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { ConfiguratorStore } from '../configurator/configuratorStore'
import { ViewerStatus } from '../components/ViewerStatus'
import { createThreeRuntime } from './core/createThreeRuntime'
import { combineFurnitureFrames } from './core/furnitureFraming'
import { createSceneEnvironment } from './core/createSceneEnvironment'
import { disposeMaterialFinishCache } from './materials/createMaterial'
import { disposeFurnitureSourceCache } from './furniture/model'
import { useCatalogScene } from './furniture/useCatalogScene'
import type { FurnitureView } from './furniture/furniturePresentation'
import { useTableAssemblyScene } from './tableAssembly/useTableAssemblyScene'

const wardrobeFrame = combineFurnitureFrames(getFurnitureDefinitions().filter(model => model.category === 'wardrobes').map(model => model.framing))

export default function SceneView({ store, furnitureView, motionStore, pngExport }: { pngExport: PngExportStore; store: ConfiguratorStore; furnitureView: FurnitureView; motionStore: FurnitureMotionStore }) {
  const { session } = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<Scene | null>(null)
  const runtimeRef = useRef<ReturnType<typeof createThreeRuntime> | null>(null)
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
    runtimeRef.current = runtime
    sceneRef.current = runtime.scene
    anisotropyRef.current = runtime.renderer.capabilities.getMaxAnisotropy()
    return () => {
      runtimeRef.current = null
      sceneRef.current = null
      environment.dispose()
      runtime.dispose()
      disposeMaterialFinishCache()
      disposeFurnitureSourceCache()
    }
  }, [])

  const selectedHeight = session.models[session.selectedModelId].dimensions.height
  useEffect(() => {
    const definition = getFurnitureDefinition(session.selectedModelId)
    if (session.mode === 'catalog' && definition.category === 'wardrobes') {
      runtimeRef.current?.framing.select(definition.id, wardrobeFrame, 'wardrobes')
    } else if (session.mode === 'catalog' && definition.category === 'dressers') {
      runtimeRef.current?.framing.select(definition.id, definition.framing, definition.id, selectedHeight / 2)
    } else {
      runtimeRef.current?.framing.select('tables')
    }
  }, [session.mode, session.selectedModelId, selectedHeight])

  const catalog = useCatalogScene(runtimeRef, anisotropyRef, store, session, furnitureView, motionStore)
  const assembly = useTableAssemblyScene(sceneRef, anisotropyRef, store, session.mode === 'builder', session.assembly)
  const preview = session.mode === 'builder' ? assembly : catalog
  useEffect(() => {
    const definition = getFurnitureDefinition(session.selectedModelId)
    const style = session.models[session.selectedModelId].facadeStyle ?? definition.facades?.defaultStyle
    const detail = session.mode === 'catalog' && !!definition.facades &&
      (style === 'fluted' || style === 'fluted-sides' || style === 'diagonal' || style === 'original')
    runtimeRef.current?.setDetailRefinement(detail)
    // Session edits can change geometry immediately; async finish/model readiness
    // invalidates again once resources arrive. Both catalog and builder use this.
    runtimeRef.current?.invalidate()
  }, [session, furnitureView, preview.ready, preview.loading, preview.error])
  useEffect(() => {
    const runtime = runtimeRef.current
    if (!runtime || !preview.ready) return
    return pngExport.attach({ session, capture: () => {
      if (store.getSnapshot().session !== session) return Promise.reject(new Error('Configuration changed'))
      return runtime.capturePng()
    } })
  }, [pngExport, preview.ready, session, store, furnitureView])
  return <>
    <div className="scene-canvas" ref={containerRef} aria-label="3D-просмотр мебели" aria-busy={preview.loading} />
    {preview.error
      ? <ViewerStatus message={preview.error} onRetry={preview.retry} />
      : preview.loading && <ViewerStatus message="Загружаем модель и материалы…" />}
  </>
}
