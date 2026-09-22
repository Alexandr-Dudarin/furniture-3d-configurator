import { describe, expect, it, vi } from 'vitest'
import { createPngExportStore } from './pngExportStore'
import { createDefaultSession, updateSession } from './savedConfiguration'

describe('PNG scene bridge', () => {
  it('rejects export until the exact current configuration is ready', async () => {
    const store = createPngExportStore()
    const session = createDefaultSession()
    await expect(store.capture(session)).rejects.toThrow()
    const png = new Blob(['png'], { type: 'image/png' })
    const capture = vi.fn(async () => png)
    const detach = store.attach({ session, capture })
    expect(await store.capture(session)).toBe(png)
    const changed = updateSession(session, { type: 'set-dimension', name: 'length', value: 1.8 })
    await expect(store.capture(changed)).rejects.toThrow()
    expect(capture).toHaveBeenCalledTimes(1)
    detach()
    await expect(store.capture(session)).rejects.toThrow()
  })
  it('ignores stale cleanup and propagates encoding errors so the user can retry', async () => {
    const store = createPngExportStore()
    const session = createDefaultSession()
    const detachOld = store.attach({ session, capture: async () => new Blob() })
    const capture = vi.fn().mockRejectedValueOnce(new Error('context lost')).mockResolvedValue(new Blob(['png']))
    store.attach({ session, capture })
    detachOld()
    await expect(store.capture(session)).rejects.toThrow('context lost')
    await expect(store.capture(session)).resolves.toBeInstanceOf(Blob)
  })
})
