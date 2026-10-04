import {
  BODY_FINISHES,
  HARDWARE_FINISHES,
  wardrobeFacadeFinishSource,
  wardrobeSectionFinish,
  type WardrobeAssemblyAction,
  type WardrobeAssemblyConfiguration,
  type WardrobeSection,
} from '../configurator/wardrobeAssembly/state'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { FinishPicker } from './assembly/FinishPicker'
import { ConfigurationSection } from './ConfigurationSection'

export function WardrobeSectionMaterials({
  configuration,
  section,
  onAction,
}: {
  configuration: WardrobeAssemblyConfiguration
  section: WardrobeSection
  onAction: (action: WardrobeAssemblyAction) => void
}) {
  const doors = section.doors
  return (
    <div className="wardrobe-section-materials">
      <p className="assembly-summary">
        Выберите образец, чтобы задать свой цвет только этой секции. Снимите отметку «Свой
        материал», чтобы вернуться к общим настройкам.
      </p>
      {(['bodyFinish', 'facadeFinish', 'hardwareFinish'] as const)
        .filter(
          (slot) =>
            slot === 'bodyFinish' ||
            (slot === 'facadeFinish'
              ? section.drawers || doors
              : section.rod || section.drawers || doors),
        )
        .map((slot) => {
          const own = section[slot] !== undefined
          const value = wardrobeSectionFinish(configuration, section, slot)
          const label =
            slot === 'bodyFinish'
              ? 'Корпус, полки и короба ящиков'
              : slot === 'facadeFinish'
                ? 'Фасады: двери и ящики'
                : 'Фурнитура и ручки'
          return (
            <ConfigurationSection
              key={slot}
              title={label}
              summary={`${getMaterialFinish(value).label} · ${own ? 'свой' : slot === 'facadeFinish' ? wardrobeFacadeFinishSource(configuration, section) : 'общий'}`}
            >
              <label className="wardrobe-toggle">
                <input
                  type="checkbox"
                  checked={own}
                  onChange={(event) =>
                    onAction({
                      type: 'set-section-finish',
                      id: section.id,
                      slot,
                      finishId: event.target.checked ? value : null,
                    })
                  }
                />
                {slot === 'bodyFinish'
                  ? 'Свой материал корпуса'
                  : slot === 'facadeFinish'
                    ? 'Свой материал фасадов секции'
                    : 'Свой материал фурнитуры'}
              </label>
              {slot === 'facadeFinish' && (
                <p className="assembly-summary">
                  Этот цвет применяется к дверям и фасадам ящиков выбранной секции. Короба ящиков
                  остаются в цвет корпуса.
                </p>
              )}
              <FinishPicker
                label={label}
                value={value}
              allowReselect={!own}
                ids={slot === 'hardwareFinish' ? HARDWARE_FINISHES : BODY_FINISHES}
                onChange={(finishId) =>
                  onAction({ type: 'set-section-finish', id: section.id, slot, finishId })
                }
              />
              {slot === 'facadeFinish' && doors?.finish && (
                <p className="assembly-notice">
                  У дверей отдельный цвет: {getMaterialFinish(doors.finish).label}. Снимите отметку
                  в блоке «Отдельный цвет дверей», чтобы они повторяли цвет ящиков.
                </p>
              )}
            </ConfigurationSection>
          )
        })}
      {!section.drawers && !doors && (
        <p className="assembly-summary">
          Материал фасадов появится после добавления дверей или ящиков.
        </p>
      )}
      {doors && (
        <ConfigurationSection
          title="Отдельный цвет дверей"
          summary={
            doors.finish ? getMaterialFinish(doors.finish).label : 'Как у фасадов этой секции'
          }
        >
          <p className="assembly-summary">
            Используйте, если двери должны отличаться от ящиков этой секции.
          </p>
          <label className="wardrobe-toggle">
            <input
              type="checkbox"
              checked={!!doors.finish}
              onChange={(event) =>
                onAction({
                  type: 'update-section',
                  id: section.id,
                  patch: {
                    doors: {
                      ...doors,
                      finish: event.target.checked
                        ? wardrobeSectionFinish(configuration, section, 'facadeFinish')
                        : undefined,
                    },
                  },
                })
              }
            />
            Свой материал только дверей
          </label>
          <FinishPicker
            label="Двери"
            allowReselect={!doors.finish}
            value={doors.finish ?? wardrobeSectionFinish(configuration, section, 'facadeFinish')}
            ids={BODY_FINISHES}
            onChange={(finish) =>
              onAction({
                type: 'update-section',
                id: section.id,
                patch: { doors: { ...doors, finish } },
              })
            }
          />
        </ConfigurationSection>
      )}
    </div>
  )
}
