import { BODY_FINISHES, HARDWARE_FINISHES, wardrobeSectionFinish, type WardrobeAssemblyAction, type WardrobeAssemblyConfiguration, type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { FinishPicker } from './assembly/FinishPicker'

export function WardrobeSectionMaterials({ configuration, section, onAction }: {
  configuration: WardrobeAssemblyConfiguration; section: WardrobeSection
  onAction: (action: WardrobeAssemblyAction) => void
}) {
  return <div className="wardrobe-section-materials">
    <p className="assembly-summary">Свой материал меняет только выбранную секцию. Отключите его, чтобы снова использовать общий.</p>
    {(['bodyFinish', 'hardwareFinish'] as const).filter(slot => slot === 'bodyFinish' || section.rod).map(slot => {
      const own = section[slot] !== undefined
      const value = wardrobeSectionFinish(configuration, section, slot)
      const label = slot === 'bodyFinish' ? 'Корпус и полки' : 'Штанга и крепления'
      return <div className="wardrobe-section-material" key={slot}>
        <label className="wardrobe-toggle"><input type="checkbox" checked={own} onChange={event => onAction({
          type: 'set-section-finish', id: section.id, slot, finishId: event.target.checked ? value : null,
        })} />{slot === 'bodyFinish' ? 'Свой материал корпуса и полок' : 'Свой материал штанги и креплений'}</label>
        {own ? <FinishPicker label={label} value={value} ids={slot === 'bodyFinish' ? BODY_FINISHES : HARDWARE_FINISHES}
          onChange={finishId => onAction({ type: 'set-section-finish', id: section.id, slot, finishId })} />
          : <p className="wardrobe-inherited-finish">{label}: <strong>{getMaterialFinish(value).label}</strong><span>Общий материал сборки</span></p>}
      </div>
    })}
  </div>
}
