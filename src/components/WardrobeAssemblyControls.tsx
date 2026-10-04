import { useRef, useState } from 'react'
import type { FurnitureMotionStore } from '../configurator/furnitureMotionStore'
import type {
  WardrobeAssemblyAction,
  WardrobeAssemblyConfiguration,
} from '../configurator/wardrobeAssembly/state'
import {
  ARM_LABELS,
  wardrobeArmAt,
  wardrobePlacement,
} from '../configurator/wardrobeAssembly/arrangement'
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
import { WardrobeCornerControls } from './wardrobe/WardrobeCornerControls'
import { WardrobePlan } from './wardrobe/WardrobePlan'
import { useWardrobeSectionEditor } from './wardrobe/useWardrobeSectionEditor'
import './wardrobe/wardrobePanel.css'

type Props = {
  motionStore: FurnitureMotionStore
  configuration: WardrobeAssemblyConfiguration
  onAction: (action: WardrobeAssemblyAction) => void
  onFrame: () => void
}
const GROUPS = [
  { id: 'dimensions', label: 'Размеры' },
  { id: 'filling', label: 'Наполнение' },
  { id: 'doors', label: 'Двери' },
  { id: 'materials', label: 'Материалы' },
] as const

export function WardrobeAssemblyControls({ configuration, onAction, onFrame, motionStore }: Props) {
  const { selected, index, select, pending, update, cancel, confirm } = useWardrobeSectionEditor(
    configuration,
    onAction,
  )
  const [scope, setScope] = useState<'assembly' | 'modules'>('assembly')
  const [group, setGroup] = useState<(typeof GROUPS)[number]['id']>('dimensions')
  const [cornerId, setCornerId] = useState<string | null>(null)
  const navigation = useRef<HTMLDivElement>(null)
  const editorHeading = useRef<HTMLHeadingElement>(null)
  const materialsButton = useRef<HTMLButtonElement>(null)
  const corner = wardrobePlacement(configuration).corners.find((item) => item.id === cornerId)
  // A removed corner must not become selected again when the shape is restored.
  if (cornerId && !corner) setCornerId(null)
  const selectModule = (id: string) => {
    setScope('modules')
    if (id.startsWith('corner-')) setCornerId(id)
    else {
      setCornerId(null)
      select(id)
    }
  }
  const showMaterials = () => {
    setGroup('materials')
    materialsButton.current?.focus()
  }
  const cornerTitle =
    configuration.arrangement?.kind === 'u'
      ? cornerId === 'corner-2'
        ? 'Угол 2: правый'
        : 'Угол 1: левый'
      : 'Угловой модуль'
  const moduleTitle = corner
    ? cornerTitle
    : `Секция ${index + 1}${configuration.arrangement ? ` · сторона ${ARM_LABELS[wardrobeArmAt(configuration, index)]}` : ''}`
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
      <div
        ref={navigation}
        className="wardrobe-scope-navigation"
        role="group"
        aria-label="Область настройки гардеробной"
      >
        {(
          [
            { id: 'assembly', label: 'Вся сборка' },
            { id: 'modules', label: 'Секции и углы' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={scope === item.id}
            onClick={() => {
              setScope(item.id)
              requestAnimationFrame(() => navigation.current?.scrollIntoView({ block: 'start' }))
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div hidden={scope !== 'assembly'} role="region" aria-label="Настройки всей сборки">
        <p className="wardrobe-scope-hint">Форма, расположение сторон и общие материалы.</p>
        <WardrobeArrangementControls configuration={configuration} onAction={onAction} />
        <WardrobePlan
          configuration={configuration}
          selectedId={cornerId ?? selected.id}
          onSelect={(id) => {
            selectModule(id)
            requestAnimationFrame(() => {
              editorHeading.current?.focus({ preventScroll: true })
              editorHeading.current?.scrollIntoView({ block: 'nearest' })
            })
          }}
        />
        <WardrobeCommonMaterials configuration={configuration} onAction={onAction} />
      </div>
      <div hidden={scope !== 'modules'} role="region" aria-label="Настройки секций и углов">
        <WardrobeSectionList
          configuration={configuration}
          selected={selected}
          index={index}
          selectedCornerId={corner?.id}
          onSelect={selectModule}
          onAction={onAction}
        />
        <div className="wardrobe-selected-context">
          <span>Выбранный модуль</span>
          <h3 ref={editorHeading} tabIndex={-1}>
            {moduleTitle}
          </h3>
          <p>Настройки ниже меняют только {corner ? 'этот угол' : 'эту секцию'}.</p>
        </div>
        {corner && (
          <WardrobeCornerControls
            key={corner.id}
            c={configuration}
            corner={corner}
            title={cornerTitle}
            onAction={onAction}
          />
        )}
        <div hidden={!!corner}>
          <div
            className="wardrobe-editor-navigation"
            role="group"
            aria-label="Настройки выбранной секции"
          >
            {GROUPS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={group === item.id}
                ref={item.id === 'materials' ? materialsButton : undefined}
                onClick={() => setGroup(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div hidden={group !== 'dimensions'}>
            <WardrobeSectionDimensions selected={selected} index={index} update={update} />
          </div>
          <div hidden={group !== 'filling'}>
            <WardrobeFillingControls selected={selected} update={update} />
            <ConfigurationSection
              title="Высоты полок и штанги"
              summary={
                selected.layout ? 'Настроены вручную · шаг 5 см' : 'Автоматическое расположение'
              }
            >
              <WardrobeFillingPositions key={selected.id} section={selected} onAction={onAction} />
            </ConfigurationSection>
            <WardrobeDrawerSettings
              selected={selected}
              update={update}
              motionStore={motionStore}
              onMaterials={showMaterials}
            />
          </div>
          <div hidden={group !== 'doors'}>
            <WardrobeDoorControls
              section={selected}
              store={motionStore}
              onChange={update}
              onMaterials={showMaterials}
            />
          </div>
          <div hidden={group !== 'materials'}>
            <WardrobeSectionMaterials
              configuration={configuration}
              section={selected}
              onAction={onAction}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
