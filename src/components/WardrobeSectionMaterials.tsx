import { getWardrobeDrawerHandle } from '../configurator/wardrobeAssembly/drawerHandles'
import { BODY_FINISHES, HARDWARE_FINISHES, wardrobeFacadeFinishSource, wardrobeSectionFinish, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration, type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { FinishPicker } from './assembly/FinishPicker'

export function WardrobeSectionMaterials({ configuration, section, onAction }: {
  configuration: WardrobeAssemblyConfiguration; section: WardrobeSection
  onAction: (action: WardrobeAssemblyAction) => void
}) {
  return <div className="wardrobe-section-materials">
    <p className="assembly-summary">Эти настройки действуют только на выбранную секцию. Материал фасадов меняет её двери и ящики. Снимите отметку, чтобы вернуть общий материал.</p>
    {(['bodyFinish', 'facadeFinish', 'hardwareFinish'] as const).filter(slot => slot === 'bodyFinish' || (slot === 'facadeFinish' ? section.drawers || section.doors : section.rod || section.drawers || section.doors)).map(slot => {
      const own = section[slot] !== undefined
      const value = wardrobeSectionFinish(configuration, section, slot)
      const label = slot === 'bodyFinish' ? 'Корпус, полки и короба ящиков' : slot === 'facadeFinish' ? 'Фасады: двери и ящики' : getWardrobeDrawerHandle(section.drawers?.handle).projection === 0 && !section.doors ? 'Фурнитура' : 'Фурнитура и ручки'
      return <div className="wardrobe-section-material" key={slot}>
        <label className="wardrobe-toggle"><input type="checkbox" checked={own} onChange={event => onAction({
          type: 'set-section-finish', id: section.id, slot, finishId: event.target.checked ? value : null,
        })} />{slot === 'bodyFinish' ? 'Свой материал корпуса' : slot === 'facadeFinish' ? 'Свой материал фасадов секции' : 'Свой материал фурнитуры'}</label>
        {own ? <FinishPicker label={label} value={value} ids={slot === 'hardwareFinish' ? HARDWARE_FINISHES : BODY_FINISHES}
          onChange={finishId => onAction({ type: 'set-section-finish', id: section.id, slot, finishId })} />
          : <p className="wardrobe-inherited-finish">{label}: <strong>{getMaterialFinish(value).label}</strong><span>{slot === 'facadeFinish' ? wardrobeFacadeFinishSource(configuration, section) : 'Общий материал сборки'}</span></p>}
        {slot === 'facadeFinish' && section.doors?.finish && <p className="assembly-summary">Для дверей выбран отдельный материал: {getMaterialFinish(section.doors.finish).label}. Он сохраняется; изменить его можно в разделе «Двери секции».</p>}
      </div>
    })}
  </div>
}
