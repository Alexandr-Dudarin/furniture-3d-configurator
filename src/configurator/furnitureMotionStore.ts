// A transient bridge between the lazy 3D scene and ordinary UI buttons.
// Opening a door never changes the saved configuration or its share URL.
export type MotionPartState = { id: string; open: boolean; enabled: boolean; reason?: string }
export type MotionSnapshot = { modelId: string | null; parts: readonly MotionPartState[] }
export type MotionCommands = {
  toggle: (id: string) => void
  setAll: (open: boolean, immediate?: boolean) => void
}
export function createFurnitureMotionStore() {
  let snapshot: MotionSnapshot = { modelId: null, parts: [] }
  let owner: object | null = null
  let commands: MotionCommands | null = null
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach(listener => listener())
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    attach(modelId: string, next: MotionCommands, parts: readonly MotionPartState[]) {
      const token = {}
      owner = token; commands = next; snapshot = { modelId, parts }; notify()
      return {
        publish(parts: readonly MotionPartState[]) {
          if (owner !== token) return
          snapshot = { modelId, parts }; notify()
        },
        detach() {
          if (owner !== token) return
          owner = null; commands = null; snapshot = { modelId: null, parts: [] }; notify()
        },
      }
    },
    toggle(modelId: string, id: string) { if (snapshot.modelId === modelId) commands?.toggle(id) },
    setAll(modelId: string, open: boolean, immediate = false) {
      if (snapshot.modelId === modelId) commands?.setAll(open, immediate)
    },
  }
}
export type FurnitureMotionStore = ReturnType<typeof createFurnitureMotionStore>
