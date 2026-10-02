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
  index: number
  onAction: (action: WardrobeAssemblyAction) => void
}
export function WardrobeCommonMaterials({ configuration, index, onAction }: Props) {
  return (
    <ConfigurationSection
      title="Материалы всей сборки"
      summary={`Корпус: ${getMaterialFinish(configuration.bodyFinish).label} · Фасады: ${configuration.facadeFinish ? getMaterialFinish(configuration.facadeFinish).label : 'как корпус секции'}`}
    >
      <p className="assembly-summary">
        Применяются к секциям без индивидуального материала. Для другого цвета одной секции откройте
        «Секция {index + 1}: материалы» выше. Её индивидуальные покрытия сохранятся при смене общих.
      </p>
      <FinishPicker
        label="Корпус, полки и короба ящиков"
        value={configuration.bodyFinish}
        ids={BODY_FINISHES}
        onChange={(finishId) =>
          onAction({ type: 'set-wardrobe-finish', slot: 'bodyFinish', finishId })
        }
      />
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
      {!configuration.facadeFinish && (
        <p className="assembly-summary">
          Сейчас фасады повторяют корпус своей секции. Выберите цвет ниже, чтобы задать общий
          материал фасадов отдельно от корпуса.
        </p>
      )}
      <FinishPicker
        label="Фасады: двери и ящики"
        value={configuration.facadeFinish ?? configuration.bodyFinish}
        ids={BODY_FINISHES}
        onChange={(finishId) =>
          onAction({ type: 'set-wardrobe-finish', slot: 'facadeFinish', finishId })
        }
      />
      <FinishPicker
        label="Фурнитура и ручки"
        value={configuration.hardwareFinish}
        ids={HARDWARE_FINISHES}
        onChange={(finishId) =>
          onAction({ type: 'set-wardrobe-finish', slot: 'hardwareFinish', finishId })
        }
      />
    </ConfigurationSection>
  )
}
