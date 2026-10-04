import { ConfigurationSection } from '../ConfigurationSection'
import { formatWardrobeCm as cm } from './format'
import type { FurnitureMotionStore } from '../../configurator/furnitureMotionStore'
import {
  DRAWER_HEIGHTS,
  DRAWER_PLACEMENTS,
  wardrobeDrawerPlacementLabel,
  wardrobeSectionClosedDepth,
  wardrobeSectionDrawerInset,
  wardrobeDrawerLimit,
  wardrobeFillingFloor,
  type WardrobeSection,
} from '../../configurator/wardrobeAssembly/state'
import {
  drawerInnerHeight,
  DRAWER_HANDLES,
  getWardrobeDrawerHandle,
  isWardrobeDrawerHandle,
} from '../../configurator/wardrobeAssembly/drawerHandles'
import { WardrobeDrawerFacadeControls } from '../WardrobeDrawerFacadeControls'
import { WardrobeDrawerControls } from '../WardrobeDrawerControls'
import { CustomSelect } from '../ui/CustomSelect/CustomSelect'
import type { UpdateWardrobeSection } from './types'

type Props = {
  selected: WardrobeSection
  update: UpdateWardrobeSection
  motionStore: FurnitureMotionStore
  onMaterials: () => void
}
export function WardrobeDrawerSettings({ selected, update, motionStore, onMaterials }: Props) {
  const handle = getWardrobeDrawerHandle(selected.drawers?.handle)
  return (
    <ConfigurationSection
      title="Ящики внизу секции"
      summary={
        selected.drawers
          ? `${selected.drawers.count} шт. · ряд ${cm(selected.drawers.height)} см · ${wardrobeDrawerPlacementLabel(selected.drawers)}`
          : 'Без ящиков'
      }
      initialOpen
    >
      <div className="assembly-field">
        <span>Количество ящиков</span>
        <CustomSelect
          value={String(selected.drawers?.count ?? 0)}
          ariaLabel="Количество ящиков в выбранной секции"
          options={Array.from(
            {
              length:
                wardrobeDrawerLimit(
                  selected.height,
                  selected.rod,
                  selected.drawers?.height ?? 0.2,
                ) + 1,
            },
            (_, count) => ({ value: String(count), label: count ? String(count) : 'Без ящиков' }),
          )}
          onChange={(value) =>
            update({
              drawers: Number(value)
                ? {
                    ...selected.drawers,
                    count: Number(value),
                    height: selected.drawers?.height ?? 0.2,
                  }
                : undefined,
            })
          }
        />
      </div>
      {selected.drawers && (
        <>
          <div className="assembly-field">
            <span>Высота ряда</span>
            <CustomSelect
              value={String(selected.drawers.height)}
              ariaLabel="Высота ряда ящиков"
              options={DRAWER_HEIGHTS.map((height) => ({
                value: String(height),
                label: `${cm(height)} см`,
              }))}
              onChange={(value) =>
                update({ drawers: { ...selected.drawers!, height: Number(value) } })
              }
            />
          </div>
          <div className="assembly-field">
            <span>Положение фасадов</span>
            <CustomSelect
              value={selected.drawers.placement ?? 'recessed'}
              ariaLabel="Положение фасадов ящиков"
              options={DRAWER_PLACEMENTS.filter(
                (option) => !selected.doors || option.value === 'recessed',
              )}
              onChange={(value) =>
                update({
                  drawers: {
                    ...selected.drawers!,
                    placement: value === 'flush' ? 'flush' : 'recessed',
                  },
                })
              }
            />
          </div>
          <WardrobeDrawerFacadeControls
            value={selected.drawers.facadeStyle}
            notch={handle.value === 'finger-notch'}
            onChange={(facadeStyle) => update({ drawers: { ...selected.drawers!, facadeStyle } })}
          />
          <div className="assembly-field">
            <span>Ручки ящиков</span>
            <CustomSelect
              value={handle.value}
              ariaLabel="Ручки ящиков выбранной секции"
              options={DRAWER_HANDLES.map(({ value, label }) => ({ value, label }))}
              onChange={(value) => {
                if (isWardrobeDrawerHandle(value))
                  update({ drawers: { ...selected.drawers!, handle: value } })
              }}
            />
          </div>
          <p className="assembly-summary">
            {selected.drawers.placement === 'flush'
              ? `Фасады вровень с передними краями боковин. ${handle.projection === 0 ? 'Закрытые ящики не выступают за глубину корпуса.' : `Ручки выступают на ${cm(handle.projection)} см; глубина секции с ручками — ${cm(wardrobeSectionClosedDepth(selected))} см.`}`
              : `Фасады углублены на ${cm(wardrobeSectionDrawerInset(selected))} см.${handle.projection === 0 ? '' : handle.projection <= wardrobeSectionDrawerInset(selected) ? ' Ручки остаются внутри глубины корпуса.' : ` Ручки выступают за корпус на ${cm(handle.projection - wardrobeSectionDrawerInset(selected))} см.`}`}
          </p>
          {handle.value === 'top-grip' && (
            <p className="assembly-summary">
              Зазор над фасадом — 4 см. Короб ниже, чтобы освободить место для пальцев.
            </p>
          )}
          {handle.value === 'semicircle' && (
            <p className="assembly-summary">
              Верх полукруглой ручки — на 3 см ниже верхнего края фасада.
            </p>
          )}
          {handle.value === 'finger-notch' && (
            <p className="assembly-summary">
              Выемка по центру верхнего края: ширина 10 см, глубина 3 см. Материал тот же, что у
              фасада.
            </p>
          )}
          {handle.value === 'none' && (
            <p className="assembly-summary">
              Без выступающих ручек. В 3D нажмите на фасад, чтобы открыть ящик.
            </p>
          )}
          <p className="assembly-summary">
            Ящики расположены снизу. Верх блока:{' '}
            {Number((wardrobeFillingFloor(selected) * 100).toFixed(1))} см от пола. Полки и штанга
            располагаются выше него. Крышка блока не входит в число полок.
          </p>
          <p className="assembly-summary">
            Высота ряда включает фасад и зазоры. Внутренняя высота короба —{' '}
            {Number(
              (drawerInnerHeight(selected.drawers.height, selected.drawers.handle) * 100).toFixed(
                1,
              ),
            )}{' '}
            см. Материал фасадов выбирается в группе «Материалы»; короба используют материал
            корпуса, {handle.projection === 0 ? 'направляющие' : 'ручки и направляющие'} — материал
            фурнитуры секции.
          </p>
          <button type="button" className="wardrobe-text-button" onClick={onMaterials}>
            Настроить цвет ящиков →
          </button>
          <WardrobeDrawerControls section={selected} store={motionStore} />
        </>
      )}
    </ConfigurationSection>
  )
}
