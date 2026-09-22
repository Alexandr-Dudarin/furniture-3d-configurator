import { ConfigurationSection as Section } from './ConfigurationSection'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'
import { getTableBase, getTabletopEdgeProfile, getTabletopWidthConfig, TABLE_BASES, TABLETOP_EDGE_PROFILES, TOP_FINISHES, TOP_SHAPES, TOP_THICKNESS } from '../configurator/tableAssembly/catalog'
import type { TableAssemblyConfiguration } from '../configurator/tableAssembly/state'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { ChoiceGrid } from './assembly/ChoiceGrid'
import { ShapePreview } from './assembly/ShapePreview'
import { SizeControl } from './assembly/SizeControl'
import { FinishPicker } from './assembly/FinishPicker'

type Props = {
  configuration: TableAssemblyConfiguration
  onChange: (patch: Partial<TableAssemblyConfiguration>) => void
}

export function TableAssemblyControls({ configuration, onChange }: Props) {
  const base = getTableBase(configuration.baseId)
  const cm = (value: number) => Number((value * 100).toFixed(1))
  return <div className="assembly-controls">
    <Section title="Столешница" summary={`${TOP_SHAPES.find((shape) => shape.id === configuration.shape)!.label} · ${getTabletopEdgeProfile(configuration.edgeProfile).label}`} initialOpen>
      <ChoiceGrid label="Форма столешницы" value={configuration.shape} className="shape-choices"
        choices={TOP_SHAPES.map((shape) => ({ ...shape, preview: <ShapePreview shape={shape.id} /> }))}
        onChange={(shape) => onChange({ shape: shape as TableAssemblyConfiguration['shape'] })} />
      <div className="assembly-field">
        <span>Кромка столешницы</span>
        <CustomSelect value={configuration.edgeProfile} options={TABLETOP_EDGE_PROFILES.map((profile) => ({ value: profile.id, label: profile.label }))}
          onChange={(edgeProfile) => onChange({ edgeProfile: edgeProfile as TableAssemblyConfiguration['edgeProfile'] })} ariaLabel="Кромка столешницы" />
      </div>
      <p className="assembly-summary">{getTabletopEdgeProfile(configuration.edgeProfile).description}</p>
    </Section>
    <Section title="Основание" summary={base.label}>
      <ChoiceGrid label="Основание стола" value={base.id} className="base-choices" onChange={(baseId) => onChange({ baseId })}
        choices={TABLE_BASES.map((entry) => ({ id: entry.id, label: entry.label,
          preview: <img src={`/previews/bases/${entry.id}.png`} alt="" loading="lazy" decoding="async" />,
          disabled: !entry.compatibleShapes.includes(configuration.shape),
          description: !entry.compatibleShapes.includes(configuration.shape) ? 'Недоступно для этой формы' : entry.heightMode === 'fixed' ? `Высота ${cm(entry.height.base)} см` : 'Высота 64–84 см',
        }))} />
    </Section>
    <Section title="Размеры" summary={`${configuration.shape === 'circle' ? `Ø ${cm(configuration.length)}` : `${cm(configuration.length)} × ${cm(configuration.width)}`} см · высота стола ${cm(configuration.baseHeight + configuration.thickness)} см`} initialOpen>
      {configuration.shape === 'circle' ? (
        <SizeControl key={`${base.id}-diameter`} name="Диаметр" value={configuration.length} config={base.diameter!} onChange={(length) => onChange({ length })} />
      ) : <>
        <SizeControl key={`${base.id}-length`} name="Длина" value={configuration.length} config={base.length} onChange={(length) => onChange({ length })} />
        <SizeControl key={`${base.id}-${configuration.shape}-width`} name="Ширина" value={configuration.width} config={getTabletopWidthConfig(base, configuration.shape, configuration.length)} onChange={(width) => onChange({ width })} />
      </>}
      {(configuration.shape === 'ellipse' || configuration.shape === 'capsule') && (
        <p className="assembly-summary">Длина больше ширины минимум на 20 см — столешница сохраняет овальную форму.</p>
      )}
      <SizeControl name="Толщина столешницы" value={configuration.thickness} config={TOP_THICKNESS} millimeters onChange={(thickness) => onChange({ thickness })} />
      {base.heightMode !== 'fixed' ? (
        <SizeControl key={`${base.id}-height`} name="Высота основания" value={configuration.baseHeight} config={base.height} onChange={(baseHeight) => onChange({ baseHeight })} />
      ) : <p className="assembly-summary">Высота основания: {cm(base.height.base)} см, фиксирована</p>}
      <p className="assembly-total">Высота стола <strong>{cm(configuration.baseHeight + configuration.thickness)} см</strong></p>
    </Section>
    <Section title="Материалы" summary={`${getMaterialFinish(configuration.topFinish).label} / ${getMaterialFinish(configuration.baseFinish).label}`}>
      <FinishPicker label="Материал столешницы" value={configuration.topFinish} ids={TOP_FINISHES} onChange={(topFinish) => onChange({ topFinish })} />
      <FinishPicker label="Материал основания" value={configuration.baseFinish} ids={base.allowedFinishes} onChange={(baseFinish) => onChange({ baseFinish })} />
    </Section>
  </div>
}
