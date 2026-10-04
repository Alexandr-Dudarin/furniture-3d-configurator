import { useState } from 'react'
import type { CornerPlacement } from '../../configurator/wardrobeAssembly/arrangement'
import {
  BODY_FINISHES,
  SECTION_DIMENSIONS,
  wardrobeShelfLimit,
  wardrobeFillingLabel,
  type WardrobeAssemblyAction,
  type WardrobeAssemblyConfiguration,
} from '../../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from '../ConfigurationSection'
import { SizeControl } from '../assembly/SizeControl'
import { FinishPicker } from '../assembly/FinishPicker'
import { CustomSelect } from '../ui/CustomSelect/CustomSelect'
import { formatWardrobeCm as cm } from './format'

export function WardrobeCornerControls({
  c,
  corner,
  title,
  onAction,
}: {
  c: WardrobeAssemblyConfiguration
  corner: CornerPlacement
  title: string
  onAction: (action: WardrobeAssemblyAction) => void
}) {
  const [pending, setPending] = useState<{
    source: WardrobeAssemblyConfiguration
    height: number
  } | null>(null)
  const cornerId = corner.id === 'corner-2' ? 'corner-2' : 'corner-1'
  return (
    <ConfigurationSection
      title={title}
      summary={`${cm(corner.width)} × ${cm(corner.depth)} см · ${wardrobeFillingLabel({ shelves: corner.shelves, rod: false })}`}
      initialOpen
    >
      <p className="assembly-summary">
        Открытый модуль с диагональным входом около 70 см. Размеры угла подстраиваются под глубину
        соседних сторон. Сейчас в углу доступны полки, без дверей, штанги и ящиков.
      </p>
      <SizeControl
        name={`Высота: ${title.toLowerCase()}`}
        value={corner.height}
        config={SECTION_DIMENSIONS.height}
        onChange={(height) => {
          if (corner.shelves > wardrobeShelfLimit(height, false)) setPending({ source: c, height })
          else onAction({ type: 'update-corner', cornerId, patch: { height } })
        }}
      />
      {pending?.source === c && (
        <div className="assembly-notice" role="alert">
          <p>
            При высоте {cm(pending.height)} см останется {wardrobeShelfLimit(pending.height, false)}{' '}
            полок. Уменьшить высоту угла?
          </p>
          <div className="wardrobe-section-actions">
            <button
              type="button"
              onClick={() => {
                onAction({
                  type: 'update-corner',
                  cornerId,
                  patch: { height: pending.height },
                  confirmFillingChange: true,
                })
                setPending(null)
              }}
            >
              Уменьшить
            </button>
            <button type="button" onClick={() => setPending(null)}>
              Отмена
            </button>
          </div>
        </div>
      )}
      <div className="assembly-field">
        <span>Полки углового модуля</span>
        <CustomSelect
          ariaLabel={`Полки: ${title.toLowerCase()}`}
          value={String(corner.shelves)}
          options={Array.from({ length: wardrobeShelfLimit(corner.height, false) + 1 }, (_, i) => ({
            value: String(i),
            label: i ? String(i) : 'Без полок',
          }))}
          onChange={(value) =>
            onAction({ type: 'update-corner', cornerId, patch: { shelves: Number(value) } })
          }
        />
      </div>
      <p className="assembly-summary">
        Полки распределяются равномерно, просвет — не меньше 20 см.
      </p>
      <label className="wardrobe-toggle">
        <input
          type="checkbox"
          checked={!!corner.bodyFinish}
          onChange={(e) =>
            onAction({
              type: 'update-corner',
              cornerId,
              patch: { bodyFinish: e.target.checked ? c.bodyFinish : undefined },
            })
          }
        />
        Свой материал углового модуля
      </label>
      <FinishPicker
        label="Корпус и полки угла"
        allowReselect={!corner.bodyFinish}
        value={corner.bodyFinish ?? c.bodyFinish}
        ids={BODY_FINISHES}
        onChange={(bodyFinish) =>
          onAction({ type: 'update-corner', cornerId, patch: { bodyFinish } })
        }
      />
    </ConfigurationSection>
  )
}
