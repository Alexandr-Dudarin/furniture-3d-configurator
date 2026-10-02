import { ConfigurationSection } from '../ConfigurationSection'
import { formatWardrobeCm as cm } from './format'
import type {
  WardrobeAssemblyConfiguration,
  WardrobeAssemblyAction,
  WardrobeSection,
} from '../../configurator/wardrobeAssembly/state'
import {
  wardrobeArmAt,
  wardrobeArmRanges,
  wardrobeSectionCount,
  wardrobeSectionLimit,
  ARM_LABELS,
} from '../../configurator/wardrobeAssembly/arrangement'
import {
  SECTION_PRESETS,
  wardrobeCanHaveRod,
  wardrobeRodY,
  wardrobeShelfYs,
} from '../../configurator/wardrobeAssembly/state'

type Props = {
  configuration: WardrobeAssemblyConfiguration
  selected: WardrobeSection
  index: number
  onSelect: (id: string) => void
  onAction: (action: WardrobeAssemblyAction) => void
}
export function WardrobeSectionList({ configuration, selected, index, onSelect, onAction }: Props) {
  const arrangement = configuration.arrangement
  const limit = wardrobeSectionLimit(configuration)
  const count = wardrobeSectionCount(configuration)
  const arm = wardrobeArmAt(configuration, index)
  const range = wardrobeArmRanges(configuration)[arm]
  const armCount = range.end - range.start
  return (
    <ConfigurationSection
      title="Секции"
      summary={`${count} из ${limit}${arrangement?.kind === 'u' ? ' · включая два угла' : arrangement ? ' · включая угол' : ''}`}
      initialOpen
    >
      <div className="wardrobe-sections" role="group" aria-label="Выбор секции гардеробной">
        {configuration.sections.map((section, order) => (
          <button
            key={section.id}
            type="button"
            aria-pressed={selected.id === section.id}
            onClick={() => onSelect(section.id)}
          >
            <svg viewBox="0 0 56 72" aria-hidden="true">
              <path d="M8 68V5h40v63M8 64h40" fill="none" stroke="currentColor" strokeWidth="2" />
              {wardrobeShelfYs(section).map((y, i) => (
                <path key={i} d={`M9 ${64 - (y / section.height) * 59}h38`} stroke="currentColor" />
              ))}
              {section.drawers &&
                Array.from({ length: section.drawers.count }, (_, i) => (
                  <rect
                    key={`drawer-${i}`}
                    x="11"
                    width="34"
                    y={64 - ((0.086 + (i + 1) * section.drawers!.height) / section.height) * 59}
                    height={((section.drawers!.height - 0.035) / section.height) * 59}
                    fill="currentColor"
                    opacity=".28"
                  />
                ))}
              {section.rod && (
                <path
                  d={`M12 ${64 - (wardrobeRodY(section) / section.height) * 59}h32`}
                  stroke="currentColor"
                  strokeWidth="3"
                />
              )}
            </svg>
            <strong>Секция {order + 1}</strong>
            {arrangement && <span>Сторона {ARM_LABELS[wardrobeArmAt(configuration, order)]}</span>}
            <span>{cm(section.width)} см</span>
            {section.doors && <span>{section.doors.count === 1 ? 'Одна дверь' : 'Две двери'}</span>}
            {(section.bodyFinish ||
              section.facadeFinish ||
              section.hardwareFinish ||
              section.doors?.finish) && <span className="wardrobe-own-finish">Свой материал</span>}
          </button>
        ))}
      </div>
      <div className="wardrobe-section-actions">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => onAction({ type: 'move-section', id: selected.id, direction: -1 })}
          aria-label={
            arrangement
              ? 'Переставить выбранную секцию раньше в списке'
              : 'Переставить выбранную секцию влево'
          }
        >
          {arrangement ? '← Раньше' : '← Влево'}
        </button>
        <button
          type="button"
          disabled={index === configuration.sections.length - 1}
          onClick={() => onAction({ type: 'move-section', id: selected.id, direction: 1 })}
          aria-label={
            arrangement
              ? 'Переставить выбранную секцию дальше в списке'
              : 'Переставить выбранную секцию вправо'
          }
        >
          {arrangement ? 'Дальше →' : 'Вправо →'}
        </button>
        <button
          type="button"
          className="wardrobe-delete"
          disabled={armCount === 1}
          aria-label={`Удалить секцию ${index + 1}`}
          onClick={() => {
            onSelect(configuration.sections[Math.max(0, index - 1)].id)
            onAction({ type: 'remove-section', id: selected.id })
          }}
        >
          Удалить
        </button>
      </div>
      <p className="assembly-summary">
        Добавить секцию{arrangement ? ` на сторону ${ARM_LABELS[arm]}` : ''}
      </p>
      <div className="wardrobe-add" role="group" aria-label="Добавить секцию гардеробной">
        {SECTION_PRESETS.map((preset) => (
          <button
            type="button"
            key={preset.id}
            disabled={count >= limit}
            onClick={() => {
              let number = 1
              while (configuration.sections.some((item) => item.id === `section-${number}`))
                number++
              onAction({ type: 'add-section', preset: preset.id, arm })
              onSelect(`section-${number}`)
            }}
          >
            + {preset.label}
          </button>
        ))}
      </div>
      {arrangement && (
        <p className="assembly-summary">
          На каждой стороне нужна хотя бы одна секция. Кнопки перестановки на границе сторон меняют
          секции местами; распределение сторон задаётся выше.
        </p>
      )}
      {!wardrobeCanHaveRod(configuration.sections[range.end - 1].height) && (
        <p className="assembly-summary">Новая секция «Со штангой» будет высотой 150 см.</p>
      )}
      {count >= limit && (
        <p className="assembly-summary" role="status">
          В этой сборке может быть до {limit} секций
          {arrangement?.kind === 'u'
            ? ' вместе с двумя углами'
            : arrangement
              ? ' вместе с углом'
              : ''}
          .
        </p>
      )}
    </ConfigurationSection>
  )
}
