import { FacadeControls } from './FacadeControls'
import type { ModelConfiguration, ConfigurationAction } from '../configurator/savedConfiguration'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type { FurnitureDefinition } from '../three/furniture/types'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { ConfigurationSection } from './ConfigurationSection'
import { FurnitureMotionControls } from './FurnitureMotionControls'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'

type Props = {
  definition: FurnitureDefinition
  configuration: ModelConfiguration
  dispatch: (action: ConfigurationAction) => void
  motionStore: FurnitureMotionStore
}

const slotLabels: Record<string, string> = { carcass: 'Корпус', fronts: 'Фасады', hardware: 'Фурнитура' }

export function CabinetControls({ definition, configuration, dispatch, motionStore }: Props) {
  const { dimensions, materials } = configuration
  const slots = Object.entries(definition.materialSlots ?? {})
  const sizeSummary = ['width', 'height', 'depth']
    .map(axis => Math.round((dimensions[axis] ?? definition.dimensions[axis].base) * 1000)).join(' × ')

  return <div className="cabinet-controls">
    <ConfigurationSection title="Размеры" summary={`${sizeSummary} мм · Ш × В × Г`} initialOpen>
      {definition.dimensionOrder.map(name => {
        const config = definition.dimensions[name]
        return <SizeControl key={name} name={config.label} config={config}
          value={dimensions[name] ?? config.base} millimeters={config.displayUnit === 'mm'}
          onChange={value => dispatch({ type: 'set-dimension', name, value })} />
      })}
      {definition.description && <p className="assembly-summary">{definition.description}</p>}
    </ConfigurationSection>
    {definition.facades && <FacadeControls spec={definition.facades} value={configuration.facadeStyle}
      onChange={style => dispatch({ type: 'set-facade-style', style })} />}
    <ConfigurationSection title="Материалы" summary={slots.map(([name, slot]) => (
      <span className="catalog-material-summary" key={name}>
        {name === 'hardware' && definition.category === 'dressers' ? 'Ручки' : slotLabels[name] ?? slot.label}: {getMaterialFinish(materials[name] ?? slot.defaultFinish).label}
      </span>
    ))}>
      {slots.map(([name, slot]) => <FinishPicker key={name} label={slot.label}
        value={materials[name] ?? slot.defaultFinish} ids={slot.allowedFinishes}
        onChange={finishId => dispatch({ type: 'set-material', slot: name, finishId })} />)}
    </ConfigurationSection>
    {!!definition.articulations?.length && <FurnitureMotionControls definition={definition} store={motionStore} />}
  </div>
}
