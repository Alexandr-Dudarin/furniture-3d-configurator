import type { FurnitureView } from '../three/furniture/furniturePresentation'

export function FurnitureViewControl({ value, onChange }: {
  value: FurnitureView
  onChange: (value: FurnitureView) => void
}) {
  return <div className="furniture-view-control">
    <div className="furniture-view-label">Просмотр шкафа</div>
    <div className="furniture-view-options" role="group" aria-label="Просмотр шкафа">
      <button type="button" aria-pressed={value === 'exterior'} onClick={() => onChange('exterior')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M12 3v18M9 11v3m6-3v3" /></svg>
        Внешний вид
      </button>
      <button type="button" aria-pressed={value === 'interior'} onClick={() => onChange('interior')}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="1.5" /><path d="M4 8h16M12 8v13M12 13h8m-8 4h8M6 11h4" /></svg>
        Наполнение
      </button>
    </div>
    <p className="furniture-view-hint" aria-live="polite">{value === 'interior'
      ? 'Двери скрыты — можно рассмотреть наполнение. Размеры и материалы по-прежнему доступны.'
      : 'Внешний вид с закрытыми дверями. Переключитесь на наполнение, чтобы заглянуть внутрь.'}</p>
  </div>
}
