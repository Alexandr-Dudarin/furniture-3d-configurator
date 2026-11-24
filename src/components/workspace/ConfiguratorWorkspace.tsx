import { useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { ConfiguratorSnapshot } from '../../configurator/configuratorStore'
import type { ConfiguratorSession } from '../../configurator/savedConfiguration'
import './workspace.css'

type Mode = ConfiguratorSession['mode']
type Page = 'settings' | 'save'
const MODES: { id: Mode; label: string }[] = [
  { id: 'catalog', label: 'Готовые модели' },
  { id: 'builder', label: 'Собрать стол' },
  { id: 'wardrobe', label: 'Гардеробная' },
]

export function ConfiguratorWorkspace({ mode, title, onModeChange, persistence, notice, viewer, settings, save }: {
  mode: Mode
  title: string
  onModeChange: (mode: Mode) => void
  persistence: ConfiguratorSnapshot['persistence']
  notice: string | null
  viewer: ReactNode
  settings: ReactNode
  save: ReactNode
}) {
  const id = useId()
  const [page, setPage] = useState<Page>('settings')
  const [size, setSize] = useState<'normal' | 'large' | 'collapsed'>('normal')
  const previousSize = useRef<'normal' | 'large'>('normal')
  const scroll = useRef<HTMLDivElement>(null)
  const positions = useRef(new Map<string, number>())
  const positionKey = `${mode}/${page}`
  const rememberPosition = () => {
    if (scroll.current && getComputedStyle(scroll.current.parentElement!).display !== 'none') {
      positions.current.set(positionKey, scroll.current.scrollTop)
    }
  }
  useLayoutEffect(() => {
    if (scroll.current) scroll.current.scrollTop = positions.current.get(positionKey) ?? 0
  }, [positionKey, size])

  const showPage = (next: Page) => {
    rememberPosition()
    setPage(next)
  }
  const togglePanel = () => {
    rememberPosition()
    if (size === 'collapsed') setSize(previousSize.current)
    else {
      previousSize.current = size
      setSize('collapsed')
    }
  }
  return <div className="app configurator-workspace" data-panel-size={size}>
    {viewer}
    <aside className="configuration-panel" aria-label="Панель конструктора">
      <div className="workspace-mobile-toolbar">
        <span className="workspace-mobile-title" title={title}>{title}</span>
        {size !== 'collapsed' && <button type="button"
          aria-label={size === 'large' ? 'Уменьшить панель настроек' : 'Увеличить панель настроек'}
          aria-pressed={size === 'large'}
          onClick={() => { rememberPosition(); setSize(size === 'large' ? 'normal' : 'large') }}>
          {size === 'large' ? 'Уменьшить' : 'Расширить'}
        </button>}
        <button type="button" className="workspace-panel-toggle" aria-controls={`${id}-body`}
          aria-expanded={size !== 'collapsed'}
          aria-label={size === 'collapsed' ? 'Открыть настройки' : 'Скрыть панель и показать модель'}
          onClick={togglePanel}>
          {size === 'collapsed' ? 'Настройки' : 'Скрыть'}
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d={size === 'collapsed' ? 'm5 12 5-5 5 5' : 'm5 7 5 5 5-5'} /></svg>
        </button>
      </div>
      <div className="workspace-panel-body" id={`${id}-body`}>
        <header className="workspace-header">
          <div className="configuration-mode" role="group" aria-label="Способ выбора мебели">
            {MODES.map(item => <button key={item.id} type="button" aria-pressed={mode === item.id}
              onClick={() => {
                rememberPosition()
                if (item.id !== mode) positions.current.delete(`${item.id}/settings`)
                setPage('settings')
                onModeChange(item.id)
              }}>
              {item.label}
            </button>)}
          </div>
          <div className="workspace-navigation" role="group" aria-label="Разделы конструктора">
            <button type="button" aria-pressed={page === 'settings'} aria-controls={`${id}-settings`}
              onClick={() => showPage('settings')}>Настройки</button>
            <button type="button" aria-pressed={page === 'save'} aria-controls={`${id}-save`}
              onClick={() => showPage('save')}>Сохранить и поделиться</button>
          </div>
          {notice && <p className="configuration-notice" role="status">{notice}</p>}
        </header>
        <div className="workspace-scroll" ref={scroll} onScroll={rememberPosition}>
          <div id={`${id}-settings`} hidden={page !== 'settings'} role="region" aria-label="Настройки мебели">
            {settings}
          </div>
          <div id={`${id}-save`} hidden={page !== 'save'} role="region" aria-label="Сохранение конфигурации">
            {save}
          </div>
        </div>
        <footer className="workspace-footer">
          <p className="configuration-save-status" role="status">
            {persistence === 'saved' ? 'Сохранено в этом браузере'
              : persistence === 'pending' ? 'Сохранение…'
                : 'Автосохранение недоступно. Сохраните ссылку на этот вариант.'}
          </p>
        </footer>
      </div>
    </aside>
  </div>
}
