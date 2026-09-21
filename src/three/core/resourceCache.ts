/** Cache owns only reusable source data, never live scene meshes/materials.
 * Pending requests are coalesced; only settled entries count toward the budget.
 * Callers may still retain evicted data (for example, a texture clone's image).
 */
export function createResourceCache<T>({ maxEntries, maxBytes, sizeOf, dispose }: {
  maxEntries: number
  maxBytes: number
  sizeOf: (value: T) => number
  dispose: (value: T) => void
}) {
  type Entry = { promise: Promise<T>; ready: boolean; value?: T; bytes: number }
  const entries = new Map<string, Entry>()
  const remove = (key: string, entry: Entry) => {
    entries.delete(key)
    if (entry.ready) dispose(entry.value!)
  }
  const stats = () => {
    const values = [...entries.values()]
    return {
      ready: values.filter((entry) => entry.ready).length,
      pending: values.filter((entry) => !entry.ready).length,
      bytes: values.reduce((sum, entry) => sum + entry.bytes, 0),
    }
  }
  const trim = () => {
    for (const [key, entry] of entries) {
      const current = stats()
      if (current.ready <= maxEntries && current.bytes <= maxBytes) break
      if (entry.ready) remove(key, entry)
    }
  }
  return {
    get(key: string, load: () => Promise<T>): Promise<T> {
      const cached = entries.get(key)
      if (cached) {
        entries.delete(key)
        entries.set(key, cached)
        return cached.promise
      }
      const entry: Entry = { promise: Promise.resolve().then(load), ready: false, bytes: 0 }
      entry.promise = entry.promise.then((value) => {
        if (entries.get(key) !== entry) {
          // A clear during loading must not repopulate the cache.
          dispose(value)
        } else {
          entry.value = value
          entry.bytes = sizeOf(value)
          entry.ready = true
          trim()
        }
        return value
      }, (error: unknown) => {
        // A late failure from an old request must not evict a new request.
        if (entries.get(key) === entry) entries.delete(key)
        throw error
      })
      entries.set(key, entry)
      return entry.promise
    },
    invalidate(key: string, value: T) {
      const entry = entries.get(key)
      if (entry?.ready && entry.value === value) remove(key, entry)
    },
    clear() {
      for (const [key, entry] of entries) remove(key, entry)
    },
    stats,
  }
}
