import { ConfigurationSection } from '../ConfigurationSection'
import {
  BODY_FINISHES,
  HARDWARE_FINISHES,
  type WardrobeAssemblyConfiguration,
  type WardrobeAssemblyAction,
} from '../../configurator/wardrobeAssembly/state'
import { FinishPicker } from '../assembly/FinishPicker'
import { getMaterialFinish } from '../../three/materials/materialRegistry'

type Props = {
  configuration: WardrobeAssemblyConfiguration
  onAction: (action: WardrobeAssemblyAction) => void
}
export function WardrobeCommonMaterials({ configuration, onAction }: Props) {
  return (
    <div className="wardrobe-common-materials">
      <h3 className="wardrobe-group-heading">Материалы всей сборки</h3>
      <p className="assembly-summary">
        Общие цвета для всех модулей. Индивидуальные материалы секций и углов сохраняются. Их можно
        изменить в разделе «Секции и углы».
      </p>
      <ConfigurationSection
        title="Корпус, полки и короба ящиков"
        summary={getMaterialFinish(configuration.bodyFinish).label}
      >
        <FinishPicker
          label="Корпус, полки и короба ящиков"
          value={configuration.bodyFinish}
          ids={BODY_FINISHES}
          onChange={(finishId) =>
            onAction({ type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId })
          }
        />
      </ConfigurationSection>
      <ConfigurationSection
        title="Фасады: двери и ящики"
        summary={
          configuration.facadeFinish
            ? getMaterialFinish(configuration.facadeFinish).label
            : 'В цвет корпуса каждой секции'
        }
      >
        <label className="wardrobe-toggle">
          <input
            type="checkbox"
            checked={!configuration.facadeFinish}
            onChange={(event) =>
              onAction({
                type: 'set-wardrobe-finish',
                slot: 'facadeFinish',
                finishId: event.target.checked ? null : configuration.bodyFinish,
              })
            }
          />
          Фасады в цвет корпуса секции
        </label>
        <p className="assembly-summary">
          Выбор образца задаёт общий цвет фасадов отдельно от корпуса. Индивидуальные цвета секций и
          дверей сохранятся.
        </p>
        <FinishPicker
          label="Фасады: двери и ящики"
          allowReselect={!configuration.facadeFinish}
          value={configuration.facadeFinish ?? configuration.bodyFinish}
          ids={BODY_FINISHES}
          onChange={(finishId) =>
            onAction({ type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId })
          }
        />
      </ConfigurationSection>
      <ConfigurationSection
        title="Фурнитура и ручки"
        summary={getMaterialFinish(configuration.hardwareFinish).label}
      >
        <FinishPicker
          label="Фурнитура и ручки"
          value={configuration.hardwareFinish}
          ids={HARDWARE_FINISHES}
          onChange={(finishId) =>
            onAction({ type: 'set-wardrobe-finish', slot: 'hardwareFinish', finishId })
          }
        />
      </ConfigurationSection>
    </div>
  )
}
