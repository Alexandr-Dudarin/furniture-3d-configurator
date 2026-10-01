import { useState } from 'react'
import { wardrobePlacement, placementPolygon, wardrobeSectionCount } from '../configurator/wardrobeAssembly/arrangement'
import { BODY_FINISHES, SECTION_DIMENSIONS, wardrobeShelfLimit, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration } from '../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from './ConfigurationSection'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'

export function WardrobeArrangementControls({ configuration: c, selectedId, onSelect, onAction }: {
  configuration: WardrobeAssemblyConfiguration; selectedId: string; onSelect: (id: string) => void; onAction: (a: WardrobeAssemblyAction) => void
}) {
  const [pending, setPending] = useState<{ source: WardrobeAssemblyConfiguration; height: number } | null>(null)
  const a = c.arrangement, layout = wardrobePlacement(c)
  const cm = (n: number) => (n * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
  const scale = 270 / Math.max(layout.bounds.width, layout.bounds.depth)
  const point = ([x, z]: [number, number]) => `${160 + x * scale},${155 + z * scale}`
  return <ConfigurationSection title="Форма сборки" summary={a ? `Г-образная · угол ${a.side === 'left' ? 'слева' : 'справа'}` : 'Прямая'} initialOpen>
    <div className="wardrobe-section-actions" role="group" aria-label="Форма гардеробной">
      <button type="button" aria-pressed={!a} disabled={c.sections.length > 7} onClick={() => onAction({ type: 'set-arrangement', kind: 'straight' })}>Прямая</button>
      <button type="button" aria-pressed={!!a} disabled={c.sections.length < 2} onClick={() => onAction({ type: 'set-arrangement', kind: 'l' })}>Г-образная</button>
    </div>
    {c.sections.length < 2 && <p className="assembly-summary">Для Г-образной сборки добавьте вторую секцию.</p>}
    {a && <>
      {c.sections.length > 7 && <p className="assembly-summary">Для возврата к прямой сборке оставьте до 7 обычных секций.</p>}
      <div className="assembly-field"><span>Расположение угла</span><CustomSelect ariaLabel="Расположение угла" value={a.side} options={[{ value: 'left', label: 'Угол слева' }, { value: 'right', label: 'Угол справа' }]} onChange={value => onAction({ type: 'set-arrangement', kind: 'l', side: value === 'right' ? 'right' : 'left' })} /></div>
      <div className="assembly-field"><span>Секций на стороне А</span><CustomSelect ariaLabel="Количество секций на стороне А" value={String(a.split)} options={Array.from({ length: c.sections.length - 1 }, (_, i) => ({ value: String(i + 1), label: `${i + 1} · на стороне Б: ${c.sections.length - i - 1}` }))} onChange={value => onAction({ type: 'set-arm-count', count: Number(value) })} /></div>
      <p className="assembly-summary">Вид сверху. Нажмите номер секции, чтобы выбрать её. На каждой стороне секции идут от угла к краю.</p>
      <svg className="wardrobe-plan" viewBox="0 0 320 310" role="group" aria-label="План Г-образной гардеробной сверху">
        <polygon points={layout.corner!.polygon.map(point).join(' ')} fill="#e6ddd0" stroke="#8c775a" strokeWidth="1.5" />
        <text x={160 + (layout.corner!.origin[0] + layout.corner!.sign * layout.corner!.width * .43) * scale} y={155 + (layout.corner!.origin[1] + layout.corner!.depth * .43) * scale} textAnchor="middle" fontSize="12">Угол</text>
        {layout.sections.map((p, i) => <g key={p.id} role="button" tabIndex={0} aria-label={`Выбрать секцию ${i + 1}, сторона ${p.arm === 0 ? 'А' : 'Б'}`} aria-pressed={p.id === selectedId} onClick={() => onSelect(p.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}>
          <polygon points={placementPolygon(p).map(point).join(' ')} fill={p.id === selectedId ? '#d8e8ff' : '#f0f3f7'} stroke={p.id === selectedId ? '#1667d9' : '#667b94'} strokeWidth={p.id === selectedId ? 2.5 : 1} />
          <text x={160 + p.x * scale} y={159 + p.z * scale} textAnchor="middle" fontSize="12">{p.arm === 0 ? 'А' : 'Б'}{i + 1}</text>
        </g>)}
      </svg>
      <p className="assembly-summary">Если траектории у угла пересекаются, сначала закроется мешающая соседняя секция. «Открыть всё» оставляет конфликтующие детали закрытыми.</p>
      <p className="assembly-summary">Всего {wardrobeSectionCount(c)} из 21: обычных секций {c.sections.length} и один угол. Размеры по стенам: {cm(layout.bounds.width)} × {cm(layout.bounds.depth)} см.</p>
      <ConfigurationSection title="Угловой модуль" summary={`${cm(layout.corner!.width)} × ${cm(layout.corner!.depth)} см · ${a.corner.shelves} полок`}>
        <p className="assembly-summary">Открытый модуль с диагональным входом около 70 см. Размеры угла подстраиваются под глубину секций обеих сторон. Сейчас в углу доступны полки, без дверей, штанги и ящиков.</p>
        <SizeControl name="Высота углового модуля" value={a.corner.height} config={SECTION_DIMENSIONS.height} onChange={height => {
          if (a.corner.shelves > wardrobeShelfLimit(height, false)) setPending({ source: c, height })
          else onAction({ type: 'update-corner', patch: { height } })
        }} />
        {pending?.source === c && <div className="assembly-notice" role="alert">
          <p>При высоте {cm(pending.height)} см останется {wardrobeShelfLimit(pending.height, false)} полок. Уменьшить высоту угла?</p>
          <div className="wardrobe-section-actions"><button type="button" onClick={() => { onAction({ type: 'update-corner', patch: { height: pending.height }, confirmFillingChange: true }); setPending(null) }}>Уменьшить</button><button type="button" onClick={() => setPending(null)}>Отмена</button></div>
        </div>}
        <div className="assembly-field"><span>Полки углового модуля</span><CustomSelect ariaLabel="Полки углового модуля" value={String(a.corner.shelves)} options={Array.from({ length: wardrobeShelfLimit(a.corner.height, false) + 1 }, (_, i) => ({ value: String(i), label: i ? String(i) : 'Без полок' }))} onChange={value => onAction({ type: 'update-corner', patch: { shelves: Number(value) } })} /></div>
        <p className="assembly-summary">Полки распределяются равномерно, просвет — не меньше 20 см.</p>
        <label className="wardrobe-toggle"><input type="checkbox" checked={!!a.corner.bodyFinish} onChange={e => onAction({ type: 'update-corner', patch: { bodyFinish: e.target.checked ? c.bodyFinish : undefined } })} />Свой материал углового модуля</label>
        {a.corner.bodyFinish && <FinishPicker label="Корпус и полки угла" value={a.corner.bodyFinish} ids={BODY_FINISHES} onChange={bodyFinish => onAction({ type: 'update-corner', patch: { bodyFinish } })} />}
      </ConfigurationSection>
    </>}
  </ConfigurationSection>
}
