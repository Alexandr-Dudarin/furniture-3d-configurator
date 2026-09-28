import {
  CONFIGURATION_QUERY_KEY,
  CONFIGURATION_STORAGE_KEY,
  LEGACY_CONFIGURATION_STORAGE_KEY,
  PREVIOUS_CONFIGURATION_STORAGE_KEY,
  OLDER_CONFIGURATION_STORAGE_KEY,
  applySharedConfiguration,
  createConfigurationUrl,
  readSavedSession,
  readSharedConfiguration,
  updateSession,
  type ConfigurationAction,
  type ConfiguratorSession,
} from './savedConfiguration'
import { updateTableAssembly } from './tableAssembly/state'

type ConfigurationStorage = Pick<Storage, 'getItem' | 'setItem'>

export type ConfiguratorEnvironment = {
  getStorage: () => ConfigurationStorage
  getHref: () => string
  replaceUrl: (href: string) => void
  onPageHide: (callback: () => void) => () => void
}

export type ConfiguratorSnapshot = {
  session: ConfiguratorSession
  persistence: 'pending' | 'saved' | 'unavailable'
  notice: string | null
}

export function createConfiguratorStore(environment: ConfiguratorEnvironment) {
  let stored: string | null = null
  try {
    stored = environment.getStorage().getItem(CONFIGURATION_STORAGE_KEY) ?? environment.getStorage().getItem(PREVIOUS_CONFIGURATION_STORAGE_KEY) ?? environment.getStorage().getItem(OLDER_CONFIGURATION_STORAGE_KEY) ?? environment.getStorage().getItem(LEGACY_CONFIGURATION_STORAGE_KEY)
  } catch { /* Browsers may disable local storage. The editor still works. */ }
  const restored = readSavedSession(stored)
  const shared = readSharedConfiguration(environment.getHref())
  let snapshot: ConfiguratorSnapshot = {
    session: shared.wardrobe ? { ...restored.session, mode: 'wardrobe', wardrobe: shared.wardrobe }
      : shared.assembly ? { ...restored.session, mode: 'builder', assembly: shared.assembly }
      : shared.configuration ? applySharedConfiguration(restored.session, shared.configuration) : restored.session,
    persistence: 'pending',
    notice: shared.status === 'invalid'
      ? 'Конфигурация в ссылке недоступна. Открыты ваши последние или начальные настройки.'
      : shared.status === 'adjusted'
        ? 'Некоторые параметры ссылки недоступны. Они заменены допустимыми значениями.'
        : shared.status === 'valid' ? 'Конфигурация открыта по ссылке.' : restored.notice,
  }
  const listeners = new Set<() => void>()
  let connected = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let removeInvalidLink = shared.status === 'invalid'

  const publish = (next: ConfiguratorSnapshot) => {
    snapshot = next
    listeners.forEach((listener) => listener())
  }

  const flush = () => {
    clearTimeout(timer)
    timer = undefined
    let persistence: ConfiguratorSnapshot['persistence'] = 'saved'
    try {
      environment.getStorage().setItem(CONFIGURATION_STORAGE_KEY, JSON.stringify(snapshot.session))
    } catch {
      persistence = 'unavailable'
    }
    // A link that was opened must follow subsequent edits; otherwise reloading
    // would restore its old parameters over the newly saved local configuration.
    const href = environment.getHref()
    const url = new URL(href)
    if (url.searchParams.has(CONFIGURATION_QUERY_KEY)) {
      if (removeInvalidLink) url.searchParams.delete(CONFIGURATION_QUERY_KEY)
      const nextUrl = removeInvalidLink ? url.href : createConfigurationUrl(href, snapshot.session)
      try {
        if (nextUrl !== href) environment.replaceUrl(nextUrl)
      } catch { /* Restricted history access must not stop editing or saving. */ }
    }
    removeInvalidLink = false
    if (snapshot.persistence !== persistence) publish({ ...snapshot, persistence })
  }

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    connect: () => {
      connected = true
      flush()
      const unsubscribe = environment.onPageHide(flush)
      return () => {
        unsubscribe()
        flush()
        connected = false
      }
    },
    dispatch: (action: ConfigurationAction) => {
      const session = updateSession(snapshot.session, action)
      if (session === snapshot.session) return
      const notice = action.type === 'update-assembly' ? updateTableAssembly(snapshot.session.assembly, action.patch).notice : null
      publish({ session, persistence: 'pending', notice })
      if (connected) {
        clearTimeout(timer)
        timer = setTimeout(flush, 250)
      }
    },
    getShareUrl: () => createConfigurationUrl(environment.getHref(), snapshot.session),
  }
}

export type ConfiguratorStore = ReturnType<typeof createConfiguratorStore>

export function createBrowserConfiguratorStore() {
  return createConfiguratorStore({
    getStorage: () => window.localStorage,
    getHref: () => window.location.href,
    replaceUrl: (href) => window.history.replaceState(window.history.state, '', href),
    onPageHide: (callback) => {
      window.addEventListener('pagehide', callback)
      return () => window.removeEventListener('pagehide', callback)
    },
  })
}
