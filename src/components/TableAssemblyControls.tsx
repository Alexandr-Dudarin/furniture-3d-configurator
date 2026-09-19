import { CustomSelect } from './ui/CustomSelect/CustomSelect'
import { getTableBase, getTabletopWidthConfig, TABLE_BASES, TOP_FINISHES, TOP_SHAPES, TOP_THICKNESS } from '../configurator/tableAssembly/catalog'
import type { TableAssemblyConfiguration } from '../configurator/tableAssembly/state'
import type { FurnitureDimensionConfig } from '../three/furniture/types'
import { getMaterialFinish } from '../three/materials/materialRegistry'

type Props = {
  configuration: TableAssemblyConfiguration
  onChange: (patch: Partial<TableAssemblyConfiguration>) => void
}

function SizeControl({ name, value, config, onChange, millimeters = false }: {
  name: string; value: number; config: FurnitureDimensionConfig; onChange: (value: number) => void; millimeters?: boolean
}) {
  const display = `${Number((value * (millimeters ? 1000 : 100)).toFixed(1))} ${millimeters ? 'мм' : 'см'}`
  return (
    <label className="assembly-field">
      <span>{name}: {display}</span>
      <input type="range" min={config.min} max={config.max} step={config.step} value={value}
        aria-label={name} aria-valuetext={display} onChange={(event) => onChange(Number(event.currentTarget.value))} />
    </label>
  )
}

export function TableAssemblyControls({ configuration, onChange }: Props) {
  const base = getTableBase(configuration.baseId)
  const finishOptions = (ids: readonly string[]) => ids.map((id) => ({ value: id, label: getMaterialFinish(id).label }))
  return (
    <div className="assembly-controls">
      <div className="assembly-field">
        <span>Форма столешницы</span>
        <CustomSelect value={configuration.shape} options={TOP_SHAPES.map((shape) => ({ value: shape.id, label: shape.label }))}
          onChange={(shape) => onChange({ shape: shape as TableAssemblyConfiguration['shape'] })} ariaLabel="Форма столешницы" />
      </div>
      <div className="assembly-field">
        <span>Основание</span>
        <CustomSelect value={base.id} options={TABLE_BASES.map((entry) => ({
          value: entry.id, label: entry.label, disabled: !entry.compatibleShapes.includes(configuration.shape),
          description: entry.compatibleShapes.includes(configuration.shape) ? undefined : 'Не подходит для выбранной формы',
        }))} onChange={(baseId) => onChange({ baseId })} ariaLabel="Основание стола" />
      </div>
      {configuration.shape === 'circle' ? (
        <SizeControl name="Диаметр" value={configuration.length} config={base.diameter!} onChange={(length) => onChange({ length })} />
      ) : <>
        <SizeControl name="Длина" value={configuration.length} config={base.length} onChange={(length) => onChange({ length })} />
        <SizeControl name="Ширина" value={configuration.width} config={getTabletopWidthConfig(base, configuration.shape, configuration.length)} onChange={(width) => onChange({ width })} />
      </>}
      {(configuration.shape === 'ellipse' || configuration.shape === 'capsule') && (
        <p className="assembly-summary">Длина больше ширины минимум на 20 см — столешница сохраняет овальную форму.</p>
      )}
      <SizeControl name="Толщина столешницы" value={configuration.thickness} config={TOP_THICKNESS} millimeters onChange={(thickness) => onChange({ thickness })} />
      {base.heightMode !== 'fixed' ? (
        <SizeControl name="Высота основания" value={configuration.baseHeight} config={base.height} onChange={(baseHeight) => onChange({ baseHeight })} />
      ) : <p className="assembly-summary">Высота основания: {base.height.base * 100} см, фиксирована</p>}
      <p className="assembly-summary">Высота стола: {Number(((configuration.baseHeight + configuration.thickness) * 100).toFixed(1))} см</p>
      <div className="assembly-field">
        <span>Материал столешницы</span>
        <CustomSelect value={configuration.topFinish} options={finishOptions(TOP_FINISHES)} onChange={(topFinish) => onChange({ topFinish })} ariaLabel="Материал столешницы" />
      </div>
      <div className="assembly-field">
        <span>{base.allowedFinishes.includes('oak-natural') ? 'Материал основания' : 'Цвет основания'}</span>
        <CustomSelect value={configuration.baseFinish} options={finishOptions(base.allowedFinishes)} onChange={(baseFinish) => onChange({ baseFinish })} ariaLabel="Материал основания" />
      </div>
    </div>
  )
}
