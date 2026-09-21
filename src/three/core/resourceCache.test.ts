import { describe, expect, it, vi } from 'vitest'
import { createResourceCache } from './resourceCache'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: Error) => void
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const resource = (size: number) => ({ size })
const setup = () => {
  const dispose = vi.fn()
  return { dispose, cache: createResourceCache({ maxEntries: 2, maxBytes: 10, sizeOf: (v: { size: number }) => v.size, dispose }) }
}

describe('source resource cache', () => {
  it('coalesces pending requests and evicts least recently used data by byte budget', async () => {
    const { cache, dispose } = setup()
    const a = resource(4), b = resource(4), c = resource(5)
    const load = vi.fn(async () => a)
    const pending = cache.get('a', load)
    expect(cache.get('a', load)).toBe(pending)
    await pending
    await cache.get('b', async () => b)
    await cache.get('a', load) // a is now the most recently used entry.
    await cache.get('c', async () => c)
    expect(load).toHaveBeenCalledTimes(1)
    expect(dispose.mock.calls).toEqual([[b]])
    expect(cache.stats()).toEqual({ ready: 2, pending: 0, bytes: 9 })
    cache.clear(); cache.clear()
    expect(dispose.mock.calls).toEqual([[b], [a], [c]])
  })

  it('caps entry count even for small resources and does not retain oversize data', async () => {
    const { cache, dispose } = setup()
    for (const key of ['a', 'b', 'c']) await cache.get(key, async () => resource(1))
    expect(cache.stats().ready).toBe(2)
    expect(dispose).toHaveBeenCalledTimes(1)
    const huge = resource(11)
    expect(await cache.get('huge', async () => huge)).toBe(huge)
    expect(cache.stats()).toEqual({ ready: 0, pending: 0, bytes: 0 })
    expect(dispose).toHaveBeenCalledWith(huge)
  })

  it('clears late completions without poisoning a replacement request', async () => {
    const { cache, dispose } = setup()
    const old = deferred<{ size: number }>()
    const previous = cache.get('a', () => old.promise)
    cache.clear()
    const fresh = resource(3)
    await cache.get('a', async () => fresh)
    const stale = resource(4)
    old.resolve(stale)
    expect(await previous).toBe(stale)
    expect(dispose.mock.calls).toEqual([[stale]])
    expect(cache.stats().bytes).toBe(3)
    cache.invalidate('a', stale)
    expect(cache.stats().ready).toBe(1)
    cache.invalidate('a', fresh)
    expect(cache.stats().ready).toBe(0)
  })

  it('retries failures and ignores stale rejections after a clear', async () => {
    const { cache } = setup()
    const old = deferred<{ size: number }>()
    const previous = cache.get('a', () => old.promise)
    cache.clear()
    const fresh = resource(3)
    await cache.get('a', async () => fresh)
    old.reject(new Error('offline'))
    await expect(previous).rejects.toThrow('offline')
    expect(await cache.get('a', async () => resource(9))).toBe(fresh)
    await expect(cache.get('b', async () => { throw new Error('offline') })).rejects.toThrow('offline')
    expect(await cache.get('b', async () => resource(2))).toEqual({ size: 2 })
  })
})
