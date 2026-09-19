import { useEffect, useState, useSyncExternalStore } from 'react'
import { createBrowserConfiguratorStore } from './configuratorStore'

export function useConfigurator() {
  const [store] = useState(createBrowserConfiguratorStore)
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  useEffect(() => store.connect(), [store])
  return { store, ...snapshot }
}
