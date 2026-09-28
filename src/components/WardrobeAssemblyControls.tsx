import { useState } from 'react'
import { BODY_FINISHES, HARDWARE_FINISHES, MAX_SECTIONS, SECTION_DIMENSIONS, SECTION_PRESETS, wardrobeBounds, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration, type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from './ConfigurationSection'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'

export function WardrobeAssemblyControls({ configuration, onAction, onFrame }: {
  configuration: WardrobeAssemblyConfiguration; onAction: (action: WardrobeAssemblyAction) => void; onFrame: () => void
}) {
  const [selectedId, setSelectedId] = useState(configuration.sections[0].id)
  const selected = configuration.sections.find(section => section.id === selectedId) ?? configuration.sections[0]
  const index = configuration.sections.indexOf(selected)
  const bounds = wardrobeBounds(configuration)
  const cm = (value: number) => Math.round(value * 100)
  const update = (patch: Partial<Omit<WardrobeSection, 'id'>>) => onAction({ type: 'update-section', id: selected.id, patch })
  return <div className="wardrobe-assembly-controls">
    <h2 className="wardrobe-heading">Собрать гардеробную</h2>
    <p className="assembly-summary">Прямая открытая сборка. Выберите секцию слева направо, чтобы изменить её размеры и наполнение.</p>
    <p className="assembly-total"><span>Общие Ш × В × Г</span><strong>{cm(bounds.width)} × {cm(bounds.height)} × {cm(bounds.depth)} см</strong></p>
    <button type="button" className="configuration-reset" onClick={onFrame}>Показать всю сборку</button>
    <ConfigurationSection title="Секции" summary={`${configuration.sections.length} из ${MAX_SECTIONS}`} initialOpen>
      <div className="wardrobe-sections" role="group" aria-label="Выбор секции гардеробной">
        {configuration.sections.map((section, order) => <button key={section.id} type="button"
          aria-pressed={selected.id === section.id} onClick={() => setSelectedId(section.id)}>
          <svg viewBox="0 0 56 72" aria-hidden="true">
            <path d="M8 68V5h40v63M8 64h40" fill="none" stroke="currentColor" strokeWidth="2" />
            {Array.from({ length: section.shelves }, (_, i) => <path key={i} d={`M9 ${section.rod ? 18 : 6 + 58 * (i + 1) / (section.shelves + 1)}h38`} stroke="currentColor" />)}
            {section.rod && <path d="M12 24h32" stroke="currentColor" strokeWidth="3" />}
          </svg>
          <strong>Секция {order + 1}</strong><span>{cm(section.width)} см</span>
        </button>)}
      </div>
      <div className="wardrobe-section-actions">
        <button type="button" disabled={index === 0} onClick={() => onAction({ type: 'move-section', id: selected.id, direction: -1 })} aria-label="Переставить выбранную секцию влево">← Влево</button>
        <button type="button" disabled={index === configuration.sections.length - 1} onClick={() => onAction({ type: 'move-section', id: selected.id, direction: 1 })} aria-label="Переставить выбранную секцию вправо">Вправо →</button>
        <button type="button" disabled={configuration.sections.length === 1} onClick={() => {
          setSelectedId(configuration.sections[Math.max(0, index - 1)].id)
          onAction({ type: 'remove-section', id: selected.id })
        }}>Удалить</button>
      </div>
      <p className="assembly-summary">Добавить секцию</p>
      <div className="wardrobe-add" role="group" aria-label="Добавить секцию гардеробной">
        {SECTION_PRESETS.map(preset => <button type="button" key={preset.id} disabled={configuration.sections.length >= MAX_SECTIONS} onClick={() => {
          let number = 1
          while (configuration.sections.some(item => item.id === `section-${number}`)) number++
          onAction({ type: 'add-section', preset: preset.id }); setSelectedId(`section-${number}`)
        }}>+ {preset.label}</button>)}
      </div>
      {configuration.sections.length >= MAX_SECTIONS && <p className="assembly-summary" role="status">В этой сборке может быть до {MAX_SECTIONS} секций.</p>}
    </ConfigurationSection>
    <ConfigurationSection title={`Секция ${index + 1}: размеры`} summary={`${cm(selected.width)} × ${cm(selected.height)} × ${cm(selected.depth)} см`} initialOpen>
      {(['width', 'height', 'depth'] as const).map(dimension => <SizeControl key={`${selected.id}-${dimension}`} name={SECTION_DIMENSIONS[dimension].label}
        value={selected[dimension]} config={SECTION_DIMENSIONS[dimension]} onChange={value => update({ [dimension]: value })} />)}
      <p className="assembly-summary">У каждой секции свой корпус. Задние стенки стоят на одной линии; при разной глубине передние края отличаются.</p>
    </ConfigurationSection>
    <ConfigurationSection title="Наполнение секции" summary={`${selected.shelves} полок${selected.rod ? ' · штанга' : ''}`} initialOpen>
      <label className="wardrobe-toggle"><input type="checkbox" checked={selected.rod} onChange={event => update({ rod: event.target.checked })} />Штанга для одежды</label>
      <div className="assembly-field"><span>Количество полок</span>
        <CustomSelect value={String(selected.shelves)} ariaLabel="Количество полок в выбранной секции"
          options={Array.from({ length: selected.rod ? 2 : 7 }, (_, i) => ({ value: String(i), label: i === 0 ? 'Без полок' : String(i) }))}
          onChange={value => update({ shelves: Number(value) })} />
      </div>
      <p className="assembly-summary">{selected.rod
        ? selected.depth < .5 ? 'При глубине меньше 50 см используется торцевая штанга. Можно оставить верхнюю полку или убрать её.' : 'Под штангой остаётся место для одежды. Можно оставить верхнюю полку или убрать её.'
        : 'Полки распределяются равномерно по высоте секции.'}</p>
    </ConfigurationSection>
    <ConfigurationSection title="Материалы сборки" summary={getMaterialFinish(configuration.bodyFinish).label}>
      <FinishPicker label="Корпус и полки" value={configuration.bodyFinish} ids={BODY_FINISHES} onChange={finishId => onAction({ type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId })} />
      <FinishPicker label="Штанги и крепления" value={configuration.hardwareFinish} ids={HARDWARE_FINISHES} onChange={finishId => onAction({ type: 'set-wardrobe-finish', slot: 'hardwareFinish', finishId })} />
    </ConfigurationSection>
  </div>
}
