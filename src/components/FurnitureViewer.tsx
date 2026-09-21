import { Component, useEffect, useState, type ComponentType, type ReactNode } from 'react'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { ConfiguratorStore } from '../configurator/configuratorStore'
import { ViewerStatus } from './ViewerStatus'
import type { FurnitureView } from '../three/furniture/furniturePresentation'

type SceneProps = { store: ConfiguratorStore; furnitureView: FurnitureView; motionStore: FurnitureMotionStore }

// The UI has no runtime Three.js imports. Import after its first painted frame.
export function FurnitureViewer({ store, furnitureView, motionStore }: SceneProps) {
  const [attempt, setAttempt] = useState(0)
  return <div className="viewer">
    <SceneBoundary key={attempt} onRetry={() => setAttempt((value) => value + 1)}>
      <DeferredScene store={store} furnitureView={furnitureView} motionStore={motionStore} />
    </SceneBoundary>
  </div>
}

function DeferredScene({ store, furnitureView, motionStore }: SceneProps) {
  const [loaded, setLoaded] = useState<{ View: ComponentType<SceneProps> } | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let cancelled = false
    let secondFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        void import('../three/SceneView').then(
          ({ default: View }) => { if (!cancelled) setLoaded({ View }) },
          () => { if (!cancelled) setFailed(true) },
        )
      })
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
    }
  }, [])

  // Browsers can cache a rejected dynamic import in the current document.
  // A new document is the reliable retry, including after a deployment changed
  // chunk names. Put the latest selection in the URL even if storage is blocked.
  if (failed) return <ViewerStatus
    message="Не удалось загрузить 3D-просмотр. Перезагрузите страницу — выбранные настройки сохранятся."
    retryLabel="Перезагрузить страницу"
    onRetry={() => window.location.replace(store.getShareUrl())} />
  if (!loaded) return <ViewerStatus message="Загружаем 3D-просмотр…" />
  return <loaded.View store={store} furnitureView={furnitureView} motionStore={motionStore} />
}

class SceneBoundary extends Component<{ children: ReactNode; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed
      ? <ViewerStatus message="Не удалось запустить 3D-просмотр. Попробуйте ещё раз." onRetry={this.props.onRetry} />
      : this.props.children
  }
}
