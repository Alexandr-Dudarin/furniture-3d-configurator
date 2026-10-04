import { useSyncExternalStore } from 'react'
import { type WardrobeSection } from '../configurator/wardrobeAssembly/state'
import {
  MAX_DOOR_WIDTH,
  WARDROBE_DOOR_HANDLES,
  wardrobeDoorsLabel,
  wardrobeDoorWidth,
  type WardrobeDoorHandle,
} from '../configurator/wardrobeAssembly/doors'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import {
  DRAWER_FACADE_STYLES,
  isWardrobeDrawerFacade,
  getWardrobeDrawerFacade,
} from '../configurator/wardrobeAssembly/drawerFacades'
import { ConfigurationSection } from './ConfigurationSection'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'
import { ChoiceGrid } from './assembly/ChoiceGrid'
import { FacadePreview } from './FacadeControls'

export function WardrobeDoorControls({
  section,
  store,
  onChange,
  onMaterials,
}: {
  section: WardrobeSection
  store: FurnitureMotionStore
  onMaterials: () => void
  onChange: (patch: Partial<Omit<WardrobeSection, 'id'>>) => void
}) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)
  const doors = section.doors
  const states =
    snapshot.modelId === 'wardrobe-assembly'
      ? snapshot.parts.filter((p) => p.id.startsWith(`${section.id}/Door_`))
      : []
  const variants = [
    { value: '0', label: 'Без дверей' },
    ...(section.width <= MAX_DOOR_WIDTH ? [{ value: '1', label: 'Одна дверца' }] : []),
    { value: '2', label: 'Две дверцы' },
  ]
  return (
    <ConfigurationSection title="Двери секции" summary={wardrobeDoorsLabel(doors)} initialOpen>
      <div className="assembly-field">
        <span>Двери</span>
        <CustomSelect
          value={String(doors?.count ?? 0)}
          ariaLabel="Количество дверей секции"
          options={variants}
          onChange={(value) =>
            onChange({
              doors:
                value === '0'
                  ? undefined
                  : {
                      hinge: 'left',
                      facadeStyle: 'smooth',
                      handle: 'bar',
                      ...doors,
                      count: value === '1' ? 1 : 2,
                    },
            })
          }
        />
      </div>
      <p className="assembly-summary">
        Ширина одной дверцы — до 60 см. Для секций шире 60 см доступны две створки; при увеличении
        ширины одна дверца автоматически заменяется двумя.
      </p>
      {doors && (
        <>
          <p className="assembly-summary">
            Ширина {doors.count === 2 ? 'каждой створки' : 'створки'} с учётом зазоров:{' '}
            {(wardrobeDoorWidth(section.width, doors.count) * 100).toLocaleString('ru-RU', {
              maximumFractionDigits: 1,
            })}{' '}
            см.
          </p>
          {doors.count === 1 && (
            <div className="assembly-field">
              <span>Расположение петель</span>
              <CustomSelect
                value={doors.hinge}
                ariaLabel="Расположение петель двери"
                options={[
                  { value: 'left', label: 'Слева' },
                  { value: 'right', label: 'Справа' },
                ]}
                onChange={(value) =>
                  onChange({ doors: { ...doors, hinge: value === 'right' ? 'right' : 'left' } })
                }
              />
            </div>
          )}
          <div className="assembly-field">
            <span>Рисунок дверей</span>
            <ChoiceGrid
              label="Рисунок дверей выбранной секции"
              className="facade-choices"
              value={doors.facadeStyle}
              choices={DRAWER_FACADE_STYLES.map((id) => ({
                id,
                label: getWardrobeDrawerFacade(id).label,
                preview: <FacadePreview style={id} />,
              }))}
              onChange={(value) => {
                if (isWardrobeDrawerFacade(value))
                  onChange({ doors: { ...doors, facadeStyle: value } })
              }}
            />
          </div>
          <div className="assembly-field">
            <span>Ручки дверей</span>
            <CustomSelect
              value={doors.handle}
              ariaLabel="Ручки дверей секции"
              options={WARDROBE_DOOR_HANDLES}
              onChange={(value) =>
                onChange({ doors: { ...doors, handle: value as WardrobeDoorHandle } })
              }
            />
          </div>
          <button type="button" className="wardrobe-text-button" onClick={onMaterials}>
            Настроить цвет фасадов →
          </button>
          {section.drawers && (
            <p className="assembly-summary">
              За дверями доступны утопленные ящики. При открывании ящика сначала{' '}
              {doors.count === 2 ? 'откроются обе створки' : 'откроется дверца'}, при закрывании
              двери ящики сначала задвинутся.
            </p>
          )}
          {states.find((p) => p.reason)?.reason && (
            <p className="assembly-summary" role="status">
              {states.find((p) => p.reason)!.reason}
            </p>
          )}
          <div className="motion-actions">
            <button
              type="button"
              disabled={!states.some((p) => !p.open)}
              onClick={() =>
                states
                  .filter((p) => !p.open)
                  .forEach((p) => store.toggle('wardrobe-assembly', p.id))
              }
            >
              Открыть двери
            </button>
            <button
              type="button"
              disabled={!states.some((p) => p.open)}
              onClick={() =>
                states.filter((p) => p.open).forEach((p) => store.toggle('wardrobe-assembly', p.id))
              }
            >
              Закрыть двери
            </button>
          </div>
          <div className="motion-parts">
            {states.map((p) => (
              <button
                type="button"
                key={p.id}
                className="motion-part"
                aria-pressed={p.open}
                onClick={() => store.toggle('wardrobe-assembly', p.id)}
              >
                <span>
                  {doors.count === 1
                    ? 'Дверца'
                    : p.id.endsWith('Left')
                      ? 'Левая дверца'
                      : 'Правая дверца'}
                </span>
                <span>{p.open ? 'Открыта' : 'Закрыта'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </ConfigurationSection>
  )
}
