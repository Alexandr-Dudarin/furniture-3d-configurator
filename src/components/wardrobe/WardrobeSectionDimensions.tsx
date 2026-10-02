import { ConfigurationSection } from '../ConfigurationSection'
import { formatWardrobeCm as cm } from './format'
import { SECTION_DIMENSIONS, type WardrobeSection } from '../../configurator/wardrobeAssembly/state'
import { SizeControl } from '../assembly/SizeControl'
import type { UpdateWardrobeSection } from './types'

type Props = { selected: WardrobeSection; index: number; update: UpdateWardrobeSection }
export function WardrobeSectionDimensions({ selected, index, update }: Props) {
  return (
    <ConfigurationSection
      title={`Секция ${index + 1}: размеры`}
      summary={`${cm(selected.width)} × ${cm(selected.height)} × ${cm(selected.depth)} см`}
      initialOpen
    >
      {(['width', 'height', 'depth'] as const).map((dimension) => (
        <SizeControl
          key={`${selected.id}-${dimension}`}
          name={SECTION_DIMENSIONS[dimension].label}
          value={selected[dimension]}
          config={SECTION_DIMENSIONS[dimension]}
          onChange={(value) => update({ [dimension]: value })}
        />
      ))}
      <p className="assembly-summary">
        Размеры корпуса без накладных дверей и выступающих ручек. Секции одной стороны выровнены по
        задней стенке; при разной глубине передние края не совпадают.
      </p>
    </ConfigurationSection>
  )
}
