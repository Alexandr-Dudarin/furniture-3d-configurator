import { wardrobeAisleWidth } from './wardrobeAssembly/state'
import { wardrobePlacement, wardrobeSectionCount, wardrobeArmAt, ARM_LABELS } from './wardrobeAssembly/arrangement'
import { wardrobeDoorsLabel, wardrobeDoorWidth } from './wardrobeAssembly/doors'
import { getWardrobeDrawerFacade } from './wardrobeAssembly/drawerFacades'
import { getCatalogHandle } from './handles'
import { getFacadeStyle } from './facades/catalog'
import { getFurnitureDefinition } from './furnitureRegistry'
import type { ConfiguratorSession } from './savedConfiguration'
import { getTableBase, getTabletopEdgeProfile, TOP_SHAPES } from './tableAssembly/catalog'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { getWardrobeDrawerHandle } from './wardrobeAssembly/drawerHandles'
import { wardrobeBounds, wardrobeClosedBounds, wardrobeDrawerPlacementLabel, wardrobeSectionClosedDepth, wardrobeFillingFloor, wardrobeFillingLabel, wardrobeSectionFinish, wardrobeFacadeFinishSource, wardrobeShelfLabel } from './wardrobeAssembly/state'

const number = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 3 })
const size = (meters: number, unit: 'см' | 'мм') => `${number.format(meters * (unit === 'мм' ? 1000 : 100))} ${unit}`
export type ConfigurationSummary = { title: string; fileStem: string; rows: { label: string; value: string }[] }

export function getConfigurationSummary(session: ConfiguratorSession): ConfigurationSummary {
  if (session.mode === 'wardrobe') {
    const config = session.wardrobe, bounds = wardrobeClosedBounds(config)
    return { title: 'Модульная гардеробная', fileStem: 'wardrobe-assembly', rows: [
      { label: 'Компоновка', value: config.arrangement?.kind === 'u' ? `П-образная · ${wardrobeSectionCount(config)} секций вместе с двумя углами` : config.arrangement ? `Г-образная · ${wardrobeSectionCount(config)} секций вместе с углом · угол ${config.arrangement.side === 'left' ? 'слева' : 'справа'}` : `Прямая · ${config.sections.length} секций` },
      { label: 'Общая ширина', value: size(bounds.width, 'см') },
      { label: 'Максимальная высота', value: size(bounds.height, 'см') },
      { label: config.arrangement ? 'Размер по второй стене' : 'Максимальная глубина корпуса', value: size(wardrobeBounds(config).depth, 'см') },
      { label: 'Глубина сборки с дверями и ручками (всё закрыто)', value: size(bounds.depth, 'см') },
      ...wardrobePlacement(config).corners.map((p, i) => ({ label: config.arrangement?.kind === 'u' ? `Угол ${i + 1}: ${i ? 'правый' : 'левый'}` : 'Угловой модуль', value: `${size(p.width, 'см')} × ${size(p.height, 'см')} × ${size(p.depth, 'см')} · открытый · полок: ${p.shelves} · ${getMaterialFinish(p.bodyFinish ?? config.bodyFinish).label}` })),
      ...(config.arrangement?.kind === 'u' ? [{ label: 'Проход между боковыми секциями (всё закрыто)', value: `Не меньше ${size(wardrobeAisleWidth(config)!, 'см')} · с учётом фасадов и ручек` }] : []),
      ...config.sections.map((section, index) => ({ label: `Секция ${index + 1}`, value: `${config.arrangement ? `Сторона ${ARM_LABELS[wardrobeArmAt(config, index)]} · ` : ''}${wardrobeDoorsLabel(section.doors)} · ${Math.round(section.width * 100)} × ${Math.round(section.height * 100)} × ${Math.round(section.depth * 100)} см (корпус) · ${wardrobeFillingLabel(section)}${section.rod && section.depth < .5 ? ' · торцевая штанга' : ''}` })),
      { label: 'Общий материал корпуса', value: getMaterialFinish(config.bodyFinish).label },
      { label: 'Общий материал фасадов', value: config.facadeFinish ? getMaterialFinish(config.facadeFinish).label : 'Как у корпуса каждой секции' },
      { label: 'Общий материал фурнитуры', value: getMaterialFinish(config.hardwareFinish).label },
      ...config.sections.flatMap((section, index) => [
        { label: `Секция ${index + 1}: ${section.drawers ? 'корпус, полки и короба ящиков' : 'корпус и полки'}`, value: `${getMaterialFinish(wardrobeSectionFinish(config, section, 'bodyFinish')).label} · ${section.bodyFinish ? 'свой' : 'общий'}` },
        ...(section.doors ? [
          { label: `Секция ${index + 1}: двери`, value: `${wardrobeDoorsLabel(section.doors)} · ширина створки ${size(wardrobeDoorWidth(section.width, section.doors.count), 'см')}` },
          { label: `Секция ${index + 1}: рисунок дверей`, value: getWardrobeDrawerFacade(section.doors.facadeStyle).label },
          { label: `Секция ${index + 1}: материал дверей`, value: `${getMaterialFinish(section.doors.finish ?? wardrobeSectionFinish(config, section, 'facadeFinish')).label} · ${section.doors.finish ? 'свой материал только дверей' : wardrobeFacadeFinishSource(config, section)}` },
          { label: `Секция ${index + 1}: ручки дверей`, value: getCatalogHandle(section.doors.handle, 'doors').label },
        ] : []),
        ...(section.drawers ? [
          { label: `Секция ${index + 1}: ящики`, value: `${section.drawers.count} шт. · высота ряда ${size(section.drawers.height, 'см')} · верх блока ${size(wardrobeFillingFloor(section), 'см')}` },
          { label: `Секция ${index + 1}: положение фасадов ящиков`, value: wardrobeDrawerPlacementLabel(section.drawers) },
          { label: `Секция ${index + 1}: глубина с фасадами и ручками (всё закрыто)`, value: size(wardrobeSectionClosedDepth(section), 'см') },
          { label: `Секция ${index + 1}: рисунок фасадов ящиков`, value: getWardrobeDrawerFacade(section.drawers.facadeStyle).label },
          { label: `Секция ${index + 1}: материал фасадов ящиков`, value: `${getMaterialFinish(wardrobeSectionFinish(config, section, 'facadeFinish')).label} · ${wardrobeFacadeFinishSource(config, section)}` },
          { label: `Секция ${index + 1}: ручки`, value: getWardrobeDrawerHandle(section.drawers.handle).projection === 0 ? getWardrobeDrawerHandle(section.drawers.handle).label : `${getWardrobeDrawerHandle(section.drawers.handle).label} · ${getMaterialFinish(wardrobeSectionFinish(config, section, 'hardwareFinish')).label} · ${section.hardwareFinish ? 'свой' : 'общий'}` },
          { label: `Секция ${index + 1}: направляющие`, value: `${getMaterialFinish(wardrobeSectionFinish(config, section, 'hardwareFinish')).label} · ${section.hardwareFinish ? 'свой' : 'общий'}` },
        ] : []),
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
    ...(definition.handles ? (['doors', 'drawers'] as const).filter(kind => definition.handles!.targets.some(t => t.kind === (kind === 'doors' ? 'door' : 'drawer'))).map(kind => ({ label: kind === 'doors' ? 'Ручки дверей' : 'Ручки ящиков', value: getCatalogHandle(config.handles?.[kind], kind).label })) : []),
    ...Object.entries(definition.materialSlots ?? {}).map(([name, slot]) => ({ label: slot.label,
      value: getMaterialFinish(config.materials[name] ?? slot.defaultFinish).label })),
  ] }
}

export function configurationSummaryText(summary: ConfigurationSummary, url: string) {
  return [summary.title, ...summary.rows.map(row => `${row.label}: ${row.value}`), '', `Ссылка на вариант: ${url}`].join('\n')
}
