import { Color } from 'three'
import { getMaterialFinish } from '../../three/materials/materialRegistry'
import { ChoiceGrid } from './ChoiceGrid'

export function FinishPicker({ label, value, ids, onChange }: {
  label: string; value: string; ids: readonly string[]; onChange: (id: string) => void
}) {
  return <div className="finish-picker">
    <p className="finish-selection">{label}: <strong>{getMaterialFinish(value).label}</strong></p>
    <ChoiceGrid label={label} value={value} className="finish-choices" onChange={onChange} choices={ids.map((id) => {
      const finish = getMaterialFinish(id)
      return { id, label: finish.label, preview: finish.kind === 'texture'
        ? <img src={finish.maps.color} alt="" loading="lazy" decoding="async" />
        : <span className="solid-swatch" style={{ backgroundColor: `#${new Color(finish.color).getHexString()}` }} /> }
    })} />
  </div>
}
