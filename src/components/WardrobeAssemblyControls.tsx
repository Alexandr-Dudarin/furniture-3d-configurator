import { WardrobeArrangementControls } from './WardrobeArrangementControls'
import { wardrobeSectionCount, wardrobeSectionLimit, wardrobeArmAt, wardrobeArmRanges, ARM_LABELS } from '../configurator/wardrobeAssembly/arrangement'
import { WardrobeDoorControls } from './WardrobeDoorControls'
import { wardrobeSectionDrawerInset } from '../configurator/wardrobeAssembly/state'
import { WardrobeDrawerFacadeControls } from './WardrobeDrawerFacadeControls'
import { WardrobeDrawerControls } from './WardrobeDrawerControls'
import { drawerInnerHeight, DRAWER_HANDLES, getWardrobeDrawerHandle, isWardrobeDrawerHandle } from '../configurator/wardrobeAssembly/drawerHandles'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import { DRAWER_HEIGHTS, DRAWER_PLACEMENTS, wardrobeDrawerPlacementLabel, wardrobeSectionClosedDepth, wardrobeDrawerLimit, wardrobeFillingFloor } from '../configurator/wardrobeAssembly/state'
import { useState } from 'react'
import { BODY_FINISHES, HARDWARE_FINISHES, SECTION_DIMENSIONS, SECTION_PRESETS, previewWardrobeSectionUpdate, wardrobeCanHaveRod, wardrobeSectionNeedsConfirmation, wardrobeClosedBounds, wardrobeFillingLabel, wardrobeRodY, wardrobeSectionShelfLimit, wardrobeShelfYs, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration, type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from './ConfigurationSection'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'
import { WardrobeHeightConfirmation } from './WardrobeHeightConfirmation'
import { WardrobeFillingPositions } from './WardrobeFillingPositions'
import { WardrobeSectionMaterials } from './WardrobeSectionMaterials'
import { wardrobeSectionFinish } from '../configurator/wardrobeAssembly/state'

export function WardrobeAssemblyControls({ configuration, onAction, onFrame, motionStore }: {
  motionStore: FurnitureMotionStore; configuration: WardrobeAssemblyConfiguration; onAction: (action: WardrobeAssemblyAction) => void; onFrame: () => void
}) {
  const [selectedId, setSelectedId] = useState(configuration.sections[0].id)
  const [pendingHeight, setPendingHeight] = useState<{ current: WardrobeSection; next: WardrobeSection; patch: Partial<Omit<WardrobeSection, 'id'>> } | null>(null)
  const selected = configuration.sections.find(section => section.id === selectedId) ?? configuration.sections[0]
  const index = configuration.sections.indexOf(selected)
  const arrangement = configuration.arrangement
  const limit = wardrobeSectionLimit(configuration), count = wardrobeSectionCount(configuration)
  const arm = wardrobeArmAt(configuration, index), range = wardrobeArmRanges(configuration)[arm]
  const armCount = range.end - range.start
  const bounds = wardrobeClosedBounds(configuration)
  const shelfLimit = wardrobeSectionShelfLimit(selected)
  const handle = getWardrobeDrawerHandle(selected.drawers?.handle)
  const cm = (value: number) => (value * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
  // If a reset/restore changes the source while the dialog is open, discard
  // the preview rather than applying an old decision to a different section.
  const pending = pendingHeight && configuration.sections.includes(pendingHeight.current) ? pendingHeight : null
  const update = (patch: Partial<Omit<WardrobeSection, 'id'>>) => {
    if (pending) return
    const next = previewWardrobeSectionUpdate(selected, patch)
    if (wardrobeSectionNeedsConfirmation(selected, next)) setPendingHeight({ current: selected, next, patch })
    else onAction({ type: 'update-section', id: selected.id, patch })
  }
  return <div className="wardrobe-assembly-controls">
    {pending && <WardrobeHeightConfirmation current={pending.current} next={pending.next}
      number={configuration.sections.indexOf(pending.current) + 1} onCancel={() => setPendingHeight(null)} onConfirm={() => {
        setPendingHeight(null)
        if (configuration.sections.includes(pending.current)) onAction({ type: 'update-section', id: pending.current.id,
          patch: pending.patch, confirmFillingChange: true })
      }} />}
    <h2 className="wardrobe-heading">Собрать гардеробную</h2>
    <p className="assembly-summary">{arrangement?.kind === 'u' ? 'П-образная сборка с двумя открытыми угловыми модулями. Выберите секцию на плане или в списке.' : arrangement ? 'Г-образная сборка с открытым угловым модулем. Выберите секцию на плане или в списке.' : 'Прямая сборка с открытыми секциями или дверями. Выберите секцию слева направо, чтобы изменить её размеры и наполнение.'}</p>
    <p className="assembly-total"><span>{arrangement ? 'Габариты сборки Ш × В × Г' : 'Общие Ш × В × Г'}</span><strong>{cm(bounds.width)} × {cm(bounds.height)} × {cm(bounds.depth)} см</strong></p>
    {configuration.sections.some(section => wardrobeSectionClosedDepth(section) > section.depth) && <p className="assembly-summary">Общая глубина учитывает двери и выступающие ручки при закрытом наполнении.</p>}
    <button type="button" className="wardrobe-frame-button" onClick={onFrame}
      title="Вернуть исходный ракурс и подобрать масштаб под текущие размеры сборки" aria-describedby="wardrobe-frame-hint">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" /><rect x="7" y="7" width="10" height="10" rx="1" />
      </svg>
      Вернуть общий вид
    </button>
    <p id="wardrobe-frame-hint" className="wardrobe-frame-hint">Возвращает ракурс и помещает всю сборку в кадр.</p>
    <WardrobeArrangementControls configuration={configuration} selectedId={selected.id} onSelect={setSelectedId} onAction={onAction} />
    <ConfigurationSection title="Секции" summary={`${count} из ${limit}${arrangement?.kind === 'u' ? ' · включая два угла' : arrangement ? ' · включая угол' : ''}`} initialOpen>
      <div className="wardrobe-sections" role="group" aria-label="Выбор секции гардеробной">
        {configuration.sections.map((section, order) => <button key={section.id} type="button"
          aria-pressed={selected.id === section.id} onClick={() => setSelectedId(section.id)}>
          <svg viewBox="0 0 56 72" aria-hidden="true">
            <path d="M8 68V5h40v63M8 64h40" fill="none" stroke="currentColor" strokeWidth="2" />
            {wardrobeShelfYs(section).map((y, i) => <path key={i} d={`M9 ${64 - y / section.height * 59}h38`} stroke="currentColor" />)}
            {section.drawers && Array.from({ length: section.drawers.count }, (_, i) => <rect key={`drawer-${i}`} x="11" width="34"
              y={64 - (.086 + (i + 1) * section.drawers!.height) / section.height * 59}
              height={(section.drawers!.height - .035) / section.height * 59} fill="currentColor" opacity=".28" />)}
            {section.rod && <path d={`M12 ${64 - wardrobeRodY(section) / section.height * 59}h32`} stroke="currentColor" strokeWidth="3" />}
          </svg>
          <strong>Секция {order + 1}</strong>{arrangement && <span>Сторона {ARM_LABELS[wardrobeArmAt(configuration, order)]}</span>}<span>{cm(section.width)} см</span>
          {section.doors && <span>{section.doors.count === 1 ? 'Одна дверь' : 'Две двери'}</span>}
          {(section.bodyFinish || section.facadeFinish || section.hardwareFinish || section.doors?.finish) && <span className="wardrobe-own-finish">Свой материал</span>}
        </button>)}
      </div>
      <div className="wardrobe-section-actions">
        <button type="button" disabled={index === 0} onClick={() => onAction({ type: 'move-section', id: selected.id, direction: -1 })} aria-label={arrangement ? "Переставить выбранную секцию раньше в списке" : "Переставить выбранную секцию влево"}>{arrangement ? '← Раньше' : '← Влево'}</button>
        <button type="button" disabled={index === configuration.sections.length - 1} onClick={() => onAction({ type: 'move-section', id: selected.id, direction: 1 })} aria-label={arrangement ? "Переставить выбранную секцию дальше в списке" : "Переставить выбранную секцию вправо"}>{arrangement ? 'Дальше →' : 'Вправо →'}</button>
        <button type="button" className="wardrobe-delete" disabled={armCount === 1} aria-label={`Удалить секцию ${index + 1}`} onClick={() => {
          setSelectedId(configuration.sections[Math.max(0, index - 1)].id)
          onAction({ type: 'remove-section', id: selected.id })
        }}>Удалить</button>
      </div>
      <p className="assembly-summary">Добавить секцию{arrangement ? ` на сторону ${ARM_LABELS[arm]}` : ''}</p>
      <div className="wardrobe-add" role="group" aria-label="Добавить секцию гардеробной">
        {SECTION_PRESETS.map(preset => <button type="button" key={preset.id} disabled={count >= limit} onClick={() => {
          let number = 1
          while (configuration.sections.some(item => item.id === `section-${number}`)) number++
          onAction({ type: 'add-section', preset: preset.id, arm }); setSelectedId(`section-${number}`)
        }}>+ {preset.label}</button>)}
      </div>
      {arrangement && <p className="assembly-summary">На каждой стороне нужна хотя бы одна секция. Кнопки перестановки на границе сторон меняют секции местами; распределение сторон задаётся выше.</p>}
      {!wardrobeCanHaveRod(configuration.sections[range.end - 1].height) && <p className="assembly-summary">Новая секция «Со штангой» будет высотой 150 см.</p>}
      {count >= limit && <p className="assembly-summary" role="status">В этой сборке может быть до {limit} секций{arrangement?.kind === 'u' ? ' вместе с двумя углами' : arrangement ? ' вместе с углом' : ''}.</p>}
    </ConfigurationSection>
    <ConfigurationSection title={`Секция ${index + 1}: размеры`} summary={`${cm(selected.width)} × ${cm(selected.height)} × ${cm(selected.depth)} см`} initialOpen>
      {(['width', 'height', 'depth'] as const).map(dimension => <SizeControl key={`${selected.id}-${dimension}`} name={SECTION_DIMENSIONS[dimension].label}
        value={selected[dimension]} config={SECTION_DIMENSIONS[dimension]} onChange={value => update({ [dimension]: value })} />)}
      <p className="assembly-summary">Размеры корпуса без накладных дверей и выступающих ручек. Секции одной стороны выровнены по задней стенке; при разной глубине передние края не совпадают.</p>
    </ConfigurationSection>
    <WardrobeDoorControls section={selected} configuration={configuration} store={motionStore} onChange={update} />
    <ConfigurationSection title="Наполнение секции" summary={wardrobeFillingLabel(selected)} initialOpen>
      {wardrobeCanHaveRod(selected.height)
        ? <label className="wardrobe-toggle"><input type="checkbox" checked={selected.rod} onChange={event => update({ rod: event.target.checked })} />Штанга для одежды</label>
        : <p className="assembly-summary">Штанга доступна в секциях высотой от 150 см.</p>}
      <div className="assembly-field"><span>{selected.rod ? 'Полки со штангой' : 'Количество полок'}</span>
        <CustomSelect value={String(selected.shelves)} ariaLabel={selected.rod ? 'Полки со штангой в выбранной секции' : 'Количество полок в выбранной секции'}
          options={Array.from({ length: shelfLimit + 1 }, (_, i) => ({ value: String(i), label: i === 0 ? 'Без полок' : selected.rod ? i === 1 ? 'Полка сверху' : 'Полки сверху и снизу' : String(i) }))}
          onChange={value => update({ shelves: Number(value) })} />
      </div>
      <p className="assembly-summary">{selected.rod
        ? `${selected.depth < .5 ? 'При глубине меньше 50 см используется торцевая штанга. ' : ''}Ось штанги — не ниже 120 см от пола. Под ней до полки или дна остаётся не меньше 60 см.`
        : selected.layout ? 'Высоты полок настроены вручную. Свободное расстояние между ними — не меньше 20 см.' : 'Полки распределяются равномерно. Свободное расстояние между ними — не меньше 20 см.'}</p>
      {shelfLimit < (selected.rod ? 2 : 6) && <p className="assembly-summary">Варианты полок ограничены высотой секции и режимом расположения. Уменьшение высоты с удалением наполнения потребует подтверждения.</p>}
    </ConfigurationSection>
    <ConfigurationSection title="Ящики внизу секции" summary={selected.drawers ? `${selected.drawers.count} шт. · ряд ${cm(selected.drawers.height)} см · ${wardrobeDrawerPlacementLabel(selected.drawers)}` : 'Без ящиков'} initialOpen>
      <div className="assembly-field"><span>Количество ящиков</span>
        <CustomSelect value={String(selected.drawers?.count ?? 0)} ariaLabel="Количество ящиков в выбранной секции"
          options={Array.from({ length: wardrobeDrawerLimit(selected.height, selected.rod, selected.drawers?.height ?? .2) + 1 }, (_, count) => ({ value: String(count), label: count ? String(count) : 'Без ящиков' }))}
          onChange={value => update({ drawers: Number(value) ? { ...selected.drawers, count: Number(value), height: selected.drawers?.height ?? .2 } : undefined })} />
      </div>
      {selected.drawers && <>
        <div className="assembly-field"><span>Высота ряда</span>
          <CustomSelect value={String(selected.drawers.height)} ariaLabel="Высота ряда ящиков"
            options={DRAWER_HEIGHTS.map(height => ({ value: String(height), label: `${cm(height)} см` }))}
            onChange={value => update({ drawers: { ...selected.drawers!, height: Number(value) } })} />
        </div>
        <div className="assembly-field"><span>Положение фасадов</span>
          <CustomSelect value={selected.drawers.placement ?? 'recessed'} ariaLabel="Положение фасадов ящиков"
            options={DRAWER_PLACEMENTS.filter(option => !selected.doors || option.value === 'recessed')}
            onChange={value => update({ drawers: { ...selected.drawers!, placement: value === 'flush' ? 'flush' : 'recessed' } })} />
        </div>
        <WardrobeDrawerFacadeControls value={selected.drawers.facadeStyle} notch={handle.value === 'finger-notch'}
          onChange={facadeStyle => update({ drawers: { ...selected.drawers!, facadeStyle } })} />
        <div className="assembly-field"><span>Ручки ящиков</span>
          <CustomSelect value={handle.value} ariaLabel="Ручки ящиков выбранной секции" options={DRAWER_HANDLES.map(({ value, label }) => ({ value, label }))}
            onChange={value => { if (isWardrobeDrawerHandle(value)) update({ drawers: { ...selected.drawers!, handle: value } }) }} />
        </div>
        <p className="assembly-summary">{selected.drawers.placement === 'flush'
          ? `Фасады вровень с передними краями боковин. ${handle.projection === 0 ? 'Закрытые ящики не выступают за глубину корпуса.' : `Ручки выступают на ${cm(handle.projection)} см; глубина секции с ручками — ${cm(wardrobeSectionClosedDepth(selected))} см.`}`
          : `Фасады углублены на ${cm(wardrobeSectionDrawerInset(selected))} см.${handle.projection === 0 ? '' : (handle.projection <= wardrobeSectionDrawerInset(selected) ? ' Ручки остаются внутри глубины корпуса.' : ` Ручки выступают за корпус на ${cm(handle.projection - wardrobeSectionDrawerInset(selected))} см.`)}`}</p>
        {handle.value === 'top-grip' && <p className="assembly-summary">Зазор над фасадом — 4 см. Короб ниже, чтобы освободить место для пальцев.</p>}
        {handle.value === 'semicircle' && <p className="assembly-summary">Верх полукруглой ручки — на 3 см ниже верхнего края фасада.</p>}
        {handle.value === 'finger-notch' && <p className="assembly-summary">Выемка по центру верхнего края: ширина 10 см, глубина 3 см. Материал тот же, что у фасада.</p>}
        {handle.value === 'none' && <p className="assembly-summary">Без выступающих ручек. В 3D нажмите на фасад, чтобы открыть ящик.</p>}
        <p className="assembly-summary">Ящики расположены снизу. Верх блока: {Number((wardrobeFillingFloor(selected) * 100).toFixed(1))} см от пола. Полки и штанга располагаются выше него. Крышка блока не входит в число полок.</p>
        <p className="assembly-summary">Высота ряда включает фасад и зазоры. Внутренняя высота короба — {Number(((drawerInnerHeight(selected.drawers.height, selected.drawers.handle)) * 100).toFixed(1))} см. Материал фасадов выбирается отдельно в разделе материалов; короба используют материал корпуса, {handle.projection === 0 ? 'направляющие' : 'ручки и направляющие'} — материал фурнитуры секции.</p>
        <WardrobeDrawerControls section={selected} store={motionStore} />
      </>}
    </ConfigurationSection>
    <ConfigurationSection title="Высоты полок и штанги" summary={selected.layout ? 'Настроены вручную · шаг 5 см' : 'Автоматическое расположение'}>
      <WardrobeFillingPositions key={selected.id} section={selected} onAction={onAction} />
    </ConfigurationSection>
    <ConfigurationSection title={`Секция ${index + 1}: материалы`} summary={`${getMaterialFinish(wardrobeSectionFinish(configuration, selected, 'bodyFinish')).label} · ${selected.bodyFinish ? 'свой' : 'общий'}`}>
      <WardrobeSectionMaterials configuration={configuration} section={selected} onAction={onAction} />
    </ConfigurationSection>
    <ConfigurationSection title="Материалы всей сборки" summary={`Корпус: ${getMaterialFinish(configuration.bodyFinish).label} · Фасады: ${configuration.facadeFinish ? getMaterialFinish(configuration.facadeFinish).label : 'как корпус секции'}`}>
      <p className="assembly-summary">Применяются к секциям без индивидуального материала. Для другого цвета одной секции откройте «Секция {index + 1}: материалы» выше. Её индивидуальные покрытия сохранятся при смене общих.</p>
      <FinishPicker label="Корпус, полки и короба ящиков" value={configuration.bodyFinish} ids={BODY_FINISHES} onChange={finishId => onAction({ type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId })} />
      <label className="wardrobe-toggle"><input type="checkbox" checked={!configuration.facadeFinish}
        onChange={event => onAction({ type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId: event.target.checked ? null : configuration.bodyFinish })} />Фасады в цвет корпуса секции</label>
      {!configuration.facadeFinish && <p className="assembly-summary">Сейчас фасады повторяют корпус своей секции. Выберите цвет ниже, чтобы задать общий материал фасадов отдельно от корпуса.</p>}
      <FinishPicker label="Фасады: двери и ящики" value={configuration.facadeFinish ?? configuration.bodyFinish} ids={BODY_FINISHES} onChange={finishId => onAction({ type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId })} />
      <FinishPicker label="Фурнитура и ручки" value={configuration.hardwareFinish} ids={HARDWARE_FINISHES} onChange={finishId => onAction({ type: 'set-wardrobe-finish', slot: 'hardwareFinish', finishId })} />
    </ConfigurationSection>
  </div>
}
