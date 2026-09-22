import { useSyncExternalStore } from 'react'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { FurnitureDefinition } from '../three/furniture/types'
import { ConfigurationSection } from './ConfigurationSection'

export function FurnitureMotionControls({ definition, store }: { definition: FurnitureDefinition; store: FurnitureMotionStore }) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const ready = snapshot.modelId === definition.id
  const states = ready ? snapshot.parts : []
  const enabled = states.filter(p => p.enabled)
  const opened = enabled.filter(p => p.open).length
  const hidden = states.filter(p => !p.enabled).length
  const summary = !ready ? 'Загрузка…' : enabled.length
    ? `Открыто: ${opened} из ${enabled.length}${hidden ? ` · скрыто: ${hidden}` : ''}`
    : 'Двери скрыты в режиме «Наполнение»'
  return <ConfigurationSection title="Двери и ящики" summary={summary}>
    <p className="motion-hint">Нажмите на дверь или ящик в 3D, чтобы открыть. Повторное нажатие закрывает.</p>
    <div className="motion-actions">
      <button type="button" disabled={!enabled.length || opened === enabled.length}
        onClick={() => store.setAll(definition.id, true)}>Открыть всё</button>
      <button type="button" disabled={!opened}
        onClick={() => store.setAll(definition.id, false)}>Закрыть всё</button>
    </div>
    {!!hidden && <p className="motion-hidden-hint">Чтобы открывать двери, выберите «Внешний вид».</p>}
      <div className="motion-parts">
        {definition.articulations?.map(part => {
          const state = states.find(s => s.id === part.id)
          return <button key={part.id} type="button" className="motion-part" aria-pressed={state?.open ?? false}
            disabled={!state?.enabled} onClick={() => store.toggle(definition.id, part.id)}>
            <span>{part.label}</span><span>{!state ? 'Загрузка…' : !state.enabled ? 'Скрыта' : state.open ? 'Открыто' : 'Закрыто'}</span>
          </button>
        })}
      </div>
  </ConfigurationSection>
}
