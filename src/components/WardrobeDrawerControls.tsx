import { useSyncExternalStore } from 'react'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { WardrobeSection } from '../configurator/wardrobeAssembly/state'

export function WardrobeDrawerControls({ section, store }: { section: WardrobeSection; store: FurnitureMotionStore }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const states = snapshot.modelId === 'wardrobe-assembly' ? snapshot.parts.filter(p => p.id.startsWith(`${section.id}/`)) : []
  const opened = states.filter(p => p.open).length
  const setSection = (open: boolean) => states.forEach(p => { if (p.open !== open) store.toggle('wardrobe-assembly', p.id) })
  return <>
    <p className="motion-hint">Нажмите на ящик в 3D или на кнопку ниже. Нумерация снизу вверх.</p>
    <div className="motion-actions">
      <button type="button" disabled={!states.length || opened === states.length} onClick={() => setSection(true)}>Открыть в секции</button>
      <button type="button" disabled={!opened} onClick={() => setSection(false)}>Закрыть в секции</button>
    </div>
    <div className="motion-parts">
      {Array.from({ length: section.drawers?.count ?? 0 }, (_, i) => {
        const id = `${section.id}/Drawer_${i + 1}`, state = states.find(p => p.id === id)
        return <button key={id} type="button" className="motion-part" disabled={!state?.enabled} aria-pressed={state?.open ?? false}
          onClick={() => store.toggle('wardrobe-assembly', id)}>
          <span>Ящик {i + 1}</span><span>{!state ? 'Загрузка…' : state.open ? 'Открыт' : 'Закрыт'}</span>
        </button>
      })}
    </div>
  </>
}
