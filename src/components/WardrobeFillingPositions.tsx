import { FILLING_POSITION_STEP, ROD_RADIUS, PANEL_THICKNESS, PLINTH_HEIGHT, fitWardrobeLayout, wardrobeShelfRange, wardrobeRodRange, wardrobeShelfLabel, wardrobeFreeSpaceBelow, type WardrobeAssemblyAction, type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import { SizeControl } from './assembly/SizeControl'

export function WardrobeFillingPositions({ section, onAction }: { section: WardrobeSection; onAction: (action: WardrobeAssemblyAction) => void }) {
  const manual = section.layout
  const available = !!manual || fitWardrobeLayout(section) !== null
  const cm = (n: number) => (n * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
  if (!section.shelves && !section.rod) return <p className="assembly-summary">Добавьте полки или штангу в разделе «Наполнение секции», чтобы настроить их высоты.</p>
  const rodRange = manual && section.rod ? wardrobeRodRange(section) : null
  return <div className="wardrobe-filling-positions">
    <label className="wardrobe-toggle"><input type="checkbox" checked={!!manual} disabled={!available}
      onChange={event => onAction({ type: 'set-layout-mode', id: section.id, manual: event.target.checked })} />Настроить высоты вручную</label>
    {!manual && <p className="assembly-summary">При включении положения подбираются с шагом 5 см. Отключение возвращает автоматическое расположение.</p>}
    {!available && <p className="assembly-summary">Для этого количества полок не хватает места на сетке 5 см. Уменьшите число полок или увеличьте высоту секции.</p>}
    {manual && <>
      <p className="assembly-summary">Полки: высота нижней поверхности от пола. Штанга: высота оси. Свободная высота — просвет между поверхностями; толщина деталей уже вычтена.</p>
      {manual.shelves.map((height, index) => {
        const range = wardrobeShelfRange(section, index), label = wardrobeShelfLabel(section, index)
        return <div className="wardrobe-position" key={index}>
          <SizeControl name={label} value={height} config={{ label, base: height, ...range, step: FILLING_POSITION_STEP }}
            onChange={value => onAction({ type: 'move-shelf', id: section.id, index, height: value })} />
          <p className="wardrobe-position-gap">{section.rod && index === 0
            ? `До верхнего края штанги: ${cm(height - manual.rod! - ROD_RADIUS)} см.`
            : `Свободная высота под полкой: ${cm(wardrobeFreeSpaceBelow(section, index))} см.`}</p>
        </div>
      })}
      {rodRange && <div className="wardrobe-position">
        <SizeControl name="Ось штанги" value={manual.rod!} config={{ label: 'Ось штанги', base: manual.rod!, ...rodRange, step: FILLING_POSITION_STEP }}
          onChange={height => onAction({ type: 'move-rod', id: section.id, height })} />
        <p className="wardrobe-position-gap">Свободное место под штангой: {cm(manual.rod! - ROD_RADIUS - (section.shelves >= 2 ? manual.shelves[1] + PANEL_THICKNESS : PLINTH_HEIGHT + PANEL_THICKNESS))} см.</p>
      </div>}
      <p className="assembly-summary">Новые детали занимают свободное место, сохраняя выбранные высоты, когда это возможно. Полки без штанги нумеруются снизу вверх, поэтому после добавления номера могут измениться. Подтверждение нужно, если существующие детали придётся сдвинуть или убрать при смене наполнения или уменьшении секции.</p>
    </>}
  </div>
}
