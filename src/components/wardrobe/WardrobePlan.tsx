import {
  placementPolygon,
  wardrobePlacement,
  ARM_LABELS,
} from '../../configurator/wardrobeAssembly/arrangement'
import type { WardrobeAssemblyConfiguration } from '../../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from '../ConfigurationSection'

type Props = {
  configuration: WardrobeAssemblyConfiguration
  selectedId: string
  onSelect: (id: string) => void
}

export function WardrobePlan({ configuration, selectedId, onSelect }: Props) {
  if (!configuration.arrangement) return null
  const layout = wardrobePlacement(configuration)
  const isU = configuration.arrangement.kind === 'u'
  const scale = 270 / Math.max(layout.bounds.width, layout.bounds.depth)
  const point = ([x, z]: [number, number]) => `${160 + x * scale},${155 + z * scale}`
  const selectable = (id: string, label: string) => ({
    role: 'button',
    tabIndex: 0,
    'aria-label': label,
    'aria-pressed': id === selectedId,
    onClick: () => onSelect(id),
    onKeyDown: (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onSelect(id)
      }
    },
  })
  return (
    <ConfigurationSection
      title="План сверху"
      summary="Выберите секцию или угол на схеме"
      initialOpen
    >
      <svg
        className="wardrobe-plan"
        viewBox="0 0 320 310"
        role="group"
        aria-label={`План ${isU ? 'П' : 'Г'}-образной гардеробной сверху`}
      >
        {layout.corners.map((corner, index) => (
          <g key={corner.id} {...selectable(corner.id, `Выбрать угол ${index + 1}`)}>
            <polygon
              points={corner.polygon.map(point).join(' ')}
              fill={corner.id === selectedId ? '#d8e8ff' : '#e6ddd0'}
              stroke={corner.id === selectedId ? '#1667d9' : '#8c775a'}
              strokeWidth="1.5"
            />
            <text
              x={160 + (corner.origin[0] + corner.sign * corner.width * 0.43) * scale}
              y={155 + (corner.origin[1] + corner.depth * 0.43) * scale}
              textAnchor="middle"
              fontSize="12"
            >
              Угол {index + 1}
            </text>
          </g>
        ))}
        {layout.sections.map((section, index) => (
          <g
            key={section.id}
            {...selectable(
              section.id,
              `Выбрать секцию ${index + 1}, сторона ${ARM_LABELS[section.arm]}`,
            )}
          >
            <polygon
              points={placementPolygon(section).map(point).join(' ')}
              fill={section.id === selectedId ? '#d8e8ff' : '#f0f3f7'}
              stroke={section.id === selectedId ? '#1667d9' : '#667b94'}
              strokeWidth={section.id === selectedId ? 2.5 : 1}
            />
            <text
              x={160 + section.x * scale}
              y={159 + section.z * scale}
              textAnchor="middle"
              fontSize="12"
            >
              {ARM_LABELS[section.arm]}
              {index + 1}
            </text>
          </g>
        ))}
        {isU && (
          <text x="160" y="304" textAnchor="middle" fontSize="12">
            Вход
          </text>
        )}
      </svg>
      <p className="assembly-summary">
        Буква — сторона сборки, цифра — номер секции. Нажатие открывает настройки выбранного модуля.
      </p>
    </ConfigurationSection>
  )
}
