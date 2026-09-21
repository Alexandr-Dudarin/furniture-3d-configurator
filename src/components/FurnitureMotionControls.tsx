import { useSyncExternalStore } from 'react'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { FurnitureDefinition } from '../three/furniture/types'

export function FurnitureMotionControls({ definition, store }: { definition: FurnitureDefinition; store: FurnitureMotionStore }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const ready = snapshot.modelId === definition.id
  const states = ready ? snapshot.parts : []
  const enabled = states.filter(p => p.enabled)
  const opened = enabled.filter(p => p.open).length
  return <section className="furniture-motion" aria-label="Открывание мебели">
    <p className="motion-hint">Нажмите на дверь или ящик в 3D, чтобы открыть. Повторное нажатие закрывает.</p>
    <div className="motion-actions">
      <button type="button" disabled={!enabled.length || opened === enabled.length}
        onClick={() => store.setAll(definition.id, true)}>Открыть всё</button>
      <button type="button" disabled={!opened}
        onClick={() => store.setAll(definition.id, false)}>Закрыть всё</button>
    </div>
    <details className="assembly-section motion-details">
      <summary><span><strong>Двери и ящики</strong><span className="section-value">
        {!ready ? 'Загрузка…' : `Открыто: ${opened} из ${enabled.length}`}
      </span></span><span className="section-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </span></summary>
      <div className="assembly-section-content motion-parts">
        {definition.articulations?.map(part => {
          const state = states.find(s => s.id === part.id)
          return <button key={part.id} type="button" className="motion-part" aria-pressed={state?.open ?? false}
            disabled={!state?.enabled} onClick={() => store.toggle(definition.id, part.id)}>
            <span>{part.label}</span><span>{state && !state.enabled ? 'Скрыта' : state?.open ? 'Открыто' : 'Закрыто'}</span>
          </button>
        })}
      </div>
    </details>
  </section>
}
