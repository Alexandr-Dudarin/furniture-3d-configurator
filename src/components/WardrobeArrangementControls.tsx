import { useState } from 'react'
import { wardrobePlacement, placementPolygon, wardrobeSectionCount, wardrobeArmRanges, ARM_LABELS, type CornerPlacement } from '../configurator/wardrobeAssembly/arrangement'
import { BODY_FINISHES, SECTION_DIMENSIONS, wardrobeShelfLimit, wardrobeAisleWidth, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration } from '../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from './ConfigurationSection'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'

const cm = (n: number) => (n * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
type Props = { configuration: WardrobeAssemblyConfiguration; selectedId: string; onSelect: (id: string) => void; onAction: (a: WardrobeAssemblyAction) => void }

function CornerControls({ c, corner, title, onAction }: { c: WardrobeAssemblyConfiguration; corner: CornerPlacement; title: string; onAction: Props['onAction'] }) {
  const [pending, setPending] = useState<{ source: WardrobeAssemblyConfiguration; height: number } | null>(null)
  const cornerId = corner.id === 'corner-2' ? 'corner-2' : 'corner-1'
  return <ConfigurationSection title={title} summary={`${cm(corner.width)} × ${cm(corner.depth)} см · ${corner.shelves} полок`}>
    <p className="assembly-summary">Открытый модуль с диагональным входом около 70 см. Размеры угла подстраиваются под глубину соседних сторон. Сейчас в углу доступны полки, без дверей, штанги и ящиков.</p>
    <SizeControl name={`Высота: ${title.toLowerCase()}`} value={corner.height} config={SECTION_DIMENSIONS.height} onChange={height => {
      if (corner.shelves > wardrobeShelfLimit(height, false)) setPending({ source: c, height })
      else onAction({ type: 'update-corner', cornerId, patch: { height } })
    }} />
    {pending?.source === c && <div className="assembly-notice" role="alert">
      <p>При высоте {cm(pending.height)} см останется {wardrobeShelfLimit(pending.height, false)} полок. Уменьшить высоту угла?</p>
      <div className="wardrobe-section-actions"><button type="button" onClick={() => { onAction({ type: 'update-corner', cornerId, patch: { height: pending.height }, confirmFillingChange: true }); setPending(null) }}>Уменьшить</button><button type="button" onClick={() => setPending(null)}>Отмена</button></div>
    </div>}
    <div className="assembly-field"><span>Полки углового модуля</span><CustomSelect ariaLabel={`Полки: ${title.toLowerCase()}`} value={String(corner.shelves)} options={Array.from({ length: wardrobeShelfLimit(corner.height, false) + 1 }, (_, i) => ({ value: String(i), label: i ? String(i) : 'Без полок' }))} onChange={value => onAction({ type: 'update-corner', cornerId, patch: { shelves: Number(value) } })} /></div>
    <p className="assembly-summary">Полки распределяются равномерно, просвет — не меньше 20 см.</p>
    <label className="wardrobe-toggle"><input type="checkbox" checked={!!corner.bodyFinish} onChange={e => onAction({ type: 'update-corner', cornerId, patch: { bodyFinish: e.target.checked ? c.bodyFinish : undefined } })} />Свой материал углового модуля</label>
    {corner.bodyFinish && <FinishPicker label="Корпус и полки угла" value={corner.bodyFinish} ids={BODY_FINISHES} onChange={bodyFinish => onAction({ type: 'update-corner', cornerId, patch: { bodyFinish } })} />}
  </ConfigurationSection>
}

export function WardrobeArrangementControls({ configuration: c, selectedId, onSelect, onAction }: Props) {
  const a = c.arrangement, layout = wardrobePlacement(c), ranges = wardrobeArmRanges(c), isU = a?.kind === 'u'
  const selected = layout.sections.find(p => p.id === selectedId), selectedIndex = c.sections.findIndex(s => s.id === selectedId)
  const scale = 270 / Math.max(layout.bounds.width, layout.bounds.depth)
  const point = ([x, z]: [number, number]) => `${160 + x * scale},${155 + z * scale}`
  const summary = isU ? 'П-образная · два угла' : a ? `Г-образная · угол ${a.side === 'left' ? 'слева' : 'справа'}` : 'Прямая'
  return <ConfigurationSection title="Форма сборки" summary={summary} initialOpen>
    <div className="wardrobe-section-actions" role="group" aria-label="Форма гардеробной">
      <button type="button" aria-pressed={!a} disabled={c.sections.length > 7} onClick={() => onAction({ type: 'set-arrangement', kind: 'straight' })}>Прямая</button>
      <button type="button" aria-pressed={a?.kind === 'l'} disabled={c.sections.length < 2} onClick={() => onAction({ type: 'set-arrangement', kind: 'l' })}>Г-образная</button>
      <button type="button" aria-pressed={isU} disabled={c.sections.length < 3 || c.sections.length > 19} onClick={() => onAction({ type: 'set-arrangement', kind: 'u' })}>П-образная</button>
    </div>
    {c.sections.length < 2 && <p className="assembly-summary">Для Г-образной сборки добавьте вторую секцию.</p>}
    {c.sections.length < 3 && <p className="assembly-summary">Для П-образной сборки нужны хотя бы три обычные секции — по одной на сторону.</p>}
    {c.sections.length > 19 && <p className="assembly-summary">Для П-образной сборки оставьте до 19 обычных секций: ещё два места займут углы.</p>}
    {a && <>
      {c.sections.length > 7 && <p className="assembly-summary">Для возврата к прямой сборке оставьте до 7 обычных секций.</p>}
      {a.kind === 'l' ? <div className="assembly-field"><span>Расположение угла</span><CustomSelect ariaLabel="Расположение угла" value={a.side} options={[{ value: 'left', label: 'Угол слева' }, { value: 'right', label: 'Угол справа' }]} onChange={value => onAction({ type: 'set-arrangement', kind: 'l', side: value === 'right' ? 'right' : 'left' })} /></div>
        : <p className="assembly-summary">А — задняя сторона между углами, Б — левая, В — правая. Углы добавляются автоматически.</p>}
      <div className="assembly-field"><span>Секций на стороне А</span><CustomSelect ariaLabel="Количество секций на стороне А" value={String(a.split)} options={Array.from({ length: isU ? c.sections.length - (ranges[1].end - ranges[1].start) - 1 : c.sections.length - 1 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} onChange={value => onAction({ type: 'set-arm-count', arm: 0, count: Number(value) })} /></div>
      {isU && <div className="assembly-field"><span>Секций на стороне Б</span><CustomSelect ariaLabel="Количество секций на стороне Б" value={String(a.secondSplit - a.split)} options={Array.from({ length: c.sections.length - a.split - 1 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))} onChange={value => onAction({ type: 'set-arm-count', arm: 1, count: Number(value) })} /></div>}
      <p className="assembly-summary">{ranges.map(r => `${ARM_LABELS[r.arm]}: ${r.end - r.start}`).join(' · ')}. {isU ? 'На стороне А секции идут слева направо, на Б и В — от углов к входу.' : 'На каждой стороне секции идут от угла к краю.'}</p>
      <p className="assembly-summary">Вид сверху. Нажмите номер, чтобы выбрать секцию для настройки.</p>
      <svg className="wardrobe-plan" viewBox="0 0 320 310" role="group" aria-label={`План ${isU ? 'П' : 'Г'}-образной гардеробной сверху`}>
        {layout.corners.map((p, i) => <g key={p.id}>
          <polygon points={p.polygon.map(point).join(' ')} fill="#e6ddd0" stroke="#8c775a" strokeWidth="1.5" />
          <text x={160 + (p.origin[0] + p.sign * p.width * .43) * scale} y={155 + (p.origin[1] + p.depth * .43) * scale} textAnchor="middle" fontSize="12">{isU ? `Угол ${i + 1}` : 'Угол'}</text>
        </g>)}
        {layout.sections.map((p, i) => <g key={p.id} role="button" tabIndex={0} aria-label={`Выбрать секцию ${i + 1}, сторона ${ARM_LABELS[p.arm]}`} aria-pressed={p.id === selectedId} onClick={() => onSelect(p.id)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id) } }}>
          <polygon points={placementPolygon(p).map(point).join(' ')} fill={p.id === selectedId ? '#d8e8ff' : '#f0f3f7'} stroke={p.id === selectedId ? '#1667d9' : '#667b94'} strokeWidth={p.id === selectedId ? 2.5 : 1} />
          <text x={160 + p.x * scale} y={159 + p.z * scale} textAnchor="middle" fontSize="12">{ARM_LABELS[p.arm]}{i + 1}</text>
        </g>)}
        {isU && <text x="160" y="304" textAnchor="middle" fontSize="12">Вход</text>}
      </svg>
      {selected && <p className="assembly-summary" role="status">Выбрана секция {selectedIndex + 1}, сторона {ARM_LABELS[selected.arm]}. Её размеры, наполнение и материалы настраиваются ниже.</p>}
      {isU && <p className="assembly-summary"><strong>Проход между боковыми секциями: не меньше {cm(wardrobeAisleWidth(c)!)} см.</strong> Размер учитывает закрытые фасады и выступающие ручки. Открытые двери и ящики занимают часть прохода.</p>}
      <p className="assembly-summary">Если траектории пересекаются, сначала закроется мешающая соседняя секция. «Открыть всё» оставляет конфликтующие детали закрытыми.</p>
      <p className="assembly-summary">Всего {wardrobeSectionCount(c)} из 21: обычных секций {c.sections.length} и {isU ? 'два угла' : 'один угол'}. Размеры по стенам: {cm(layout.bounds.width)} × {cm(layout.bounds.depth)} см.</p>
      {layout.corners.map((p, i) => <CornerControls key={p.id} c={c} corner={p} title={isU ? `Угол ${i + 1}: ${i ? 'правый' : 'левый'}` : 'Угловой модуль'} onAction={onAction} />)}
      <p className="assembly-summary">При смене формы сохраняются обычные секции. Удаляемые угловые модули вместе со своими настройками не сохраняются.</p>
    </>}
  </ConfigurationSection>
}
