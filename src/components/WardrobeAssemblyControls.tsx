import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import {
  wardrobeSectionFinish,
  type WardrobeAssemblyAction,
  type WardrobeAssemblyConfiguration,
} from '../configurator/wardrobeAssembly/state'
import { getMaterialFinish } from '../three/materials/materialRegistry'
import { ConfigurationSection } from './ConfigurationSection'
import { WardrobeArrangementControls } from './WardrobeArrangementControls'
import { WardrobeDoorControls } from './WardrobeDoorControls'
import { WardrobeHeightConfirmation } from './WardrobeHeightConfirmation'
import { WardrobeFillingPositions } from './WardrobeFillingPositions'
import { WardrobeSectionMaterials } from './WardrobeSectionMaterials'
import { WardrobeAssemblyOverview } from './wardrobe/WardrobeAssemblyOverview'
import { WardrobeSectionList } from './wardrobe/WardrobeSectionList'
import { WardrobeSectionDimensions } from './wardrobe/WardrobeSectionDimensions'
import { WardrobeFillingControls } from './wardrobe/WardrobeFillingControls'
import { WardrobeDrawerSettings } from './wardrobe/WardrobeDrawerSettings'
import { WardrobeCommonMaterials } from './wardrobe/WardrobeCommonMaterials'
import { useWardrobeSectionEditor } from './wardrobe/useWardrobeSectionEditor'

type Props = {
  motionStore: FurnitureMotionStore
  configuration: WardrobeAssemblyConfiguration
  onAction: (action: WardrobeAssemblyAction) => void
  onFrame: () => void
}

export function WardrobeAssemblyControls({ configuration, onAction, onFrame, motionStore }: Props) {
  const { selected, index, select, pending, update, cancel, confirm } = useWardrobeSectionEditor(
    configuration,
    onAction,
  )
  return (
    <div className="wardrobe-assembly-controls">
      {pending && (
        <WardrobeHeightConfirmation
          current={pending.current}
          next={pending.next}
          number={configuration.sections.indexOf(pending.current) + 1}
          onCancel={cancel}
          onConfirm={confirm}
        />
      )}
      <WardrobeAssemblyOverview configuration={configuration} onFrame={onFrame} />
      <WardrobeArrangementControls
        configuration={configuration}
        selectedId={selected.id}
        onSelect={select}
        onAction={onAction}
      />
      <WardrobeSectionList
        configuration={configuration}
        selected={selected}
        index={index}
        onSelect={select}
        onAction={onAction}
      />
      <WardrobeSectionDimensions selected={selected} index={index} update={update} />
      <WardrobeDoorControls
        section={selected}
        configuration={configuration}
        store={motionStore}
        onChange={update}
      />
      <WardrobeFillingControls selected={selected} update={update} />
      <WardrobeDrawerSettings selected={selected} update={update} motionStore={motionStore} />
      <ConfigurationSection
        title="Высоты полок и штанги"
        summary={selected.layout ? 'Настроены вручную · шаг 5 см' : 'Автоматическое расположение'}
      >
        <WardrobeFillingPositions key={selected.id} section={selected} onAction={onAction} />
      </ConfigurationSection>
      <ConfigurationSection
        title={`Секция ${index + 1}: материалы`}
        summary={`${getMaterialFinish(wardrobeSectionFinish(configuration, selected, 'bodyFinish')).label} · ${selected.bodyFinish ? 'свой' : 'общий'}`}
      >
        <WardrobeSectionMaterials
          configuration={configuration}
          section={selected}
          onAction={onAction}
        />
      </ConfigurationSection>
      <WardrobeCommonMaterials configuration={configuration} index={index} onAction={onAction} />
    </div>
  )
}
