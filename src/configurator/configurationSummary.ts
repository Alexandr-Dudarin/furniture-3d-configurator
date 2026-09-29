import { getFacadeStyle } from './facades/catalog'
import { getFurnitureDefinition } from './furnitureRegistry'
import type { ConfiguratorSession } from './savedConfiguration'
import { getTableBase, getTabletopEdgeProfile, TOP_SHAPES } from './tableAssembly/catalog'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { wardrobeBounds, wardrobeFillingLabel, wardrobeSectionFinish, wardrobeShelfLabel } from './wardrobeAssembly/state'

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 })
const size = (meters: number, unit: 'см' | 'мм') => `${number.format(meters * (unit === 'мм' ? 1000 : 100))} ${unit}`
export type ConfigurationSummary = { title: string; fileStem: string; rows: { label: string; value: string }[] }

export function getConfigurationSummary(session: ConfiguratorSession): ConfigurationSummary {
  if (session.mode === 'wardrobe') {
    const config = session.wardrobe, bounds = wardrobeBounds(config)
    return { title: 'Модульная гардеробная', fileStem: 'wardrobe-assembly', rows: [
      { label: 'Компоновка', value: `Прямая · ${config.sections.length} секций` },
      { label: 'Общая ширина', value: size(bounds.width, 'см') },
      { label: 'Максимальная высота', value: size(bounds.height, 'см') },
      { label: 'Максимальная глубина', value: size(bounds.depth, 'см') },
      ...config.sections.map((section, index) => ({ label: `Секция ${index + 1}`, value: `${Math.round(section.width * 100)} × ${Math.round(section.height * 100)} × ${Math.round(section.depth * 100)} см · ${wardrobeFillingLabel(section)}${section.rod && section.depth < .5 ? ' · торцевая штанга' : ''}` })),
      { label: 'Общий материал корпуса', value: getMaterialFinish(config.bodyFinish).label },
      { label: 'Общий материал штанг', value: getMaterialFinish(config.hardwareFinish).label },
      ...config.sections.flatMap((section, index) => [
        { label: `Секция ${index + 1}: корпус и полки`, value: `${getMaterialFinish(wardrobeSectionFinish(config, section, 'bodyFinish')).label} · ${section.bodyFinish ? 'свой' : 'общий'}` },
        ...(section.layout ? [
          ...(section.shelves ? [{ label: `Секция ${index + 1}: низ полок от пола`, value: section.layout.shelves.map((y, i) => `${wardrobeShelfLabel(section, i)} — ${size(y, 'см')}`).join('; ') }] : []),
          ...(section.rod ? [{ label: `Секция ${index + 1}: ось штанги от пола`, value: size(section.layout.rod!, 'см') }] : []),
        ] : []),
        ...(section.rod ? [{ label: `Секция ${index + 1}: штанга`, value: `${getMaterialFinish(wardrobeSectionFinish(config, section, 'hardwareFinish')).label} · ${section.hardwareFinish ? 'свой' : 'общий'}` }] : []),
      ]),
    ] }
  }
  if (session.mode === 'builder') {
    const a = session.assembly
    return { title: 'Сборный стол', fileStem: 'table-assembly', rows: [
      { label: 'Форма столешницы', value: TOP_SHAPES.find(shape => shape.id === a.shape)!.label },
      { label: 'Основание', value: getTableBase(a.baseId).label },
      ...(a.shape === 'circle' ? [{ label: 'Диаметр', value: size(a.length, 'см') }]
        : [{ label: 'Длина', value: size(a.length, 'см') }, { label: 'Ширина', value: size(a.width, 'см') }]),
      { label: 'Толщина столешницы', value: size(a.thickness, 'мм') },
      { label: 'Высота основания', value: size(a.baseHeight, 'см') },
      { label: 'Высота стола', value: size(a.baseHeight + a.thickness, 'см') },
      { label: 'Кромка', value: getTabletopEdgeProfile(a.edgeProfile).label },
      { label: 'Материал столешницы', value: getMaterialFinish(a.topFinish).label },
      { label: 'Материал основания', value: getMaterialFinish(a.baseFinish).label },
    ] }
  }
  const definition = getFurnitureDefinition(session.selectedModelId)
  const config = session.models[definition.id]
  return { title: definition.label, fileStem: definition.id, rows: [
    ...definition.dimensionOrder.map(name => ({ label: definition.dimensions[name].label,
      value: size(config.dimensions[name], definition.dimensions[name].displayUnit === 'mm' ? 'мм' : 'см') })),
    ...(definition.facades ? [{ label: 'Рисунок фасадов', value: getFacadeStyle(config.facadeStyle ?? definition.facades.defaultStyle).label }] : []),
    ...Object.entries(definition.materialSlots ?? {}).map(([name, slot]) => ({ label: slot.label,
      value: getMaterialFinish(config.materials[name] ?? slot.defaultFinish).label })),
  ] }
}

export function configurationSummaryText(summary: ConfigurationSummary, url: string) {
  return [summary.title, ...summary.rows.map(row => `${row.label}: ${row.value}`), '', `Ссылка на вариант: ${url}`].join('\n')
}
