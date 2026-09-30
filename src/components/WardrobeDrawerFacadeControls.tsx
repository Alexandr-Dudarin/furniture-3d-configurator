import { DRAWER_FACADE_STYLES, getWardrobeDrawerFacade, isWardrobeDrawerFacade, type WardrobeDrawerFacade } from '../configurator/wardrobeAssembly/drawerFacades'
import { FacadePreview } from './FacadeControls'
import { ChoiceGrid } from './assembly/ChoiceGrid'

export function WardrobeDrawerFacadeControls({ value, notch, onChange }: {
  value?: WardrobeDrawerFacade; notch: boolean; onChange: (value: WardrobeDrawerFacade) => void
}) {
  return <div className="assembly-field">
    <span>Рисунок фасадов ящиков</span>
    <ChoiceGrid label="Рисунок фасадов ящиков выбранной секции" className="facade-choices" value={value ?? 'smooth'}
      choices={DRAWER_FACADE_STYLES.map(id => ({ id, label: getWardrobeDrawerFacade(id).label, preview: <FacadePreview style={id} /> }))}
      onChange={id => { if (isWardrobeDrawerFacade(id)) onChange(id) }} />
    <p className="assembly-summary">Для всех ящиков выбранной секции. {value === 'frame'
      ? `Ширина рамки — ${notch ? '4' : '2,8'} см. Узкая канавка отделяет её от плоского поля для крепления ручки.`
      : value === 'fluted' || value === 'fluted-wide' ? `Канавки шириной ${value === 'fluted-wide' ? '1,4 см' : '4 мм'}, шаг — 2 см. Рисунок не растягивается и не зависит от выбранной ручки.`
        : 'Гладкая поверхность фасада.'}</p>
    {notch && value && value !== 'smooth' && <p className="assembly-summary">Вокруг выемки остаётся гладкий участок для захвата.</p>}
  </div>
}
