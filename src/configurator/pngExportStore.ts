import type { ConfiguratorSession } from './savedConfiguration'

type Source = { session: ConfiguratorSession; capture: () => Promise<Blob> }

// A small UI/scene bridge: no WebGL code is pulled into the initial UI bundle.
export function createPngExportStore() {
  let source: Source | null = null
  const listeners = new Set<() => void>()
  const publish = () => listeners.forEach(listener => listener())
  return {
    getSnapshot: () => source,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    attach: (next: Source) => {
      source = next
      publish()
      return () => { if (source === next) { source = null; publish() } }
    },
    capture: (session: ConfiguratorSession) => {
      if (!source || source.session !== session) return Promise.reject(new Error('Модель и материалы ещё не готовы. Повторите после загрузки.'))
      return source.capture()
    },
  }
}
export type PngExportStore = ReturnType<typeof createPngExportStore>
