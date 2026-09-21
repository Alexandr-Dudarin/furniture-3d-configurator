import { expect, it, vi } from 'vitest'
import { createFurnitureMotionStore } from './furnitureMotionStore'

it('guards model changes, late publication and stale cleanup', () => {
  const store = createFurnitureMotionStore(), toggle = vi.fn(), setAll = vi.fn()
  const old = store.attach('old', { toggle, setAll }, [])
  store.toggle('new', 'door'); expect(toggle).not.toHaveBeenCalled()
  const current = store.attach('new', { toggle, setAll }, [{ id: 'door', open: false, enabled: true }])
  old.publish([]); old.detach()
  expect(store.getSnapshot().modelId).toBe('new')
  store.toggle('old', 'door'); expect(toggle).not.toHaveBeenCalled()
  store.toggle('new', 'door'); expect(toggle).toHaveBeenCalledWith('door')
  store.setAll('new', false, true); expect(setAll).toHaveBeenCalledWith(false, true)
  current.detach(); expect(store.getSnapshot()).toEqual({ modelId: null, parts: [] })
})
it('has stable snapshots between changes and starts fresh in a new viewer', () => {
  const store = createFurnitureMotionStore(), listener = vi.fn()
  const initial = store.getSnapshot(), unsubscribe = store.subscribe(listener)
  expect(store.getSnapshot()).toBe(initial)
  const current = store.attach('id', { toggle() {}, setAll() {} }, [])
  current.publish([{ id: 'drawer', open: true, enabled: true }])
  expect(listener).toHaveBeenCalledTimes(2)
  expect(createFurnitureMotionStore().getSnapshot()).toEqual(initial)
  unsubscribe(); current.detach(); expect(listener).toHaveBeenCalledTimes(2)
})
