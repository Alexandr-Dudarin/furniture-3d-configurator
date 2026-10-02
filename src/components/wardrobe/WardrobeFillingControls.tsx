import { ConfigurationSection } from '../ConfigurationSection'
import {
  wardrobeSectionShelfLimit,
  wardrobeFillingLabel,
  wardrobeCanHaveRod,
  type WardrobeSection,
} from '../../configurator/wardrobeAssembly/state'
import { CustomSelect } from '../ui/CustomSelect/CustomSelect'
import type { UpdateWardrobeSection } from './types'

type Props = { selected: WardrobeSection; update: UpdateWardrobeSection }
export function WardrobeFillingControls({ selected, update }: Props) {
  const shelfLimit = wardrobeSectionShelfLimit(selected)
  return (
    <ConfigurationSection
      title="Наполнение секции"
      summary={wardrobeFillingLabel(selected)}
      initialOpen
    >
      {wardrobeCanHaveRod(selected.height) ? (
        <label className="wardrobe-toggle">
          <input
            type="checkbox"
            checked={selected.rod}
            onChange={(event) => update({ rod: event.target.checked })}
          />
          Штанга для одежды
        </label>
      ) : (
        <p className="assembly-summary">Штанга доступна в секциях высотой от 150 см.</p>
      )}
      <div className="assembly-field">
        <span>{selected.rod ? 'Полки со штангой' : 'Количество полок'}</span>
        <CustomSelect
          value={String(selected.shelves)}
          ariaLabel={
            selected.rod
              ? 'Полки со штангой в выбранной секции'
              : 'Количество полок в выбранной секции'
          }
          options={Array.from({ length: shelfLimit + 1 }, (_, i) => ({
            value: String(i),
            label:
              i === 0
                ? 'Без полок'
                : selected.rod
                  ? i === 1
                    ? 'Полка сверху'
                    : 'Полки сверху и снизу'
                  : String(i),
          }))}
          onChange={(value) => update({ shelves: Number(value) })}
        />
      </div>
      <p className="assembly-summary">
        {selected.rod
          ? `${selected.depth < 0.5 ? 'При глубине меньше 50 см используется торцевая штанга. ' : ''}Ось штанги — не ниже 120 см от пола. Под ней до полки или дна остаётся не меньше 60 см.`
          : selected.layout
            ? 'Высоты полок настроены вручную. Свободное расстояние между ними — не меньше 20 см.'
            : 'Полки распределяются равномерно. Свободное расстояние между ними — не меньше 20 см.'}
      </p>
      {shelfLimit < (selected.rod ? 2 : 6) && (
        <p className="assembly-summary">
          Варианты полок ограничены высотой секции и режимом расположения. Уменьшение высоты с
          удалением наполнения потребует подтверждения.
        </p>
      )}
    </ConfigurationSection>
  )
}
