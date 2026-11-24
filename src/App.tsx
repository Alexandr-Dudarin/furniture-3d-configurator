import { useState } from 'react'
import { CustomSelect } from './components/ui/CustomSelect/CustomSelect'
import { useConfigurator } from './configurator/useConfigurator'
import { ConfigurationActions } from './components/ConfigurationActions'
import { getFurnitureDefinition, getFurnitureDefinitions } from './configurator/furnitureRegistry'
import { SizeControl } from './components/assembly/SizeControl'
import { FinishPicker } from './components/assembly/FinishPicker'
import { TableAssemblyControls } from './components/TableAssemblyControls'
import { WardrobeAssemblyControls } from './components/WardrobeAssemblyControls'
import { FurnitureViewer } from './components/FurnitureViewer'
import { FurnitureViewControl } from './components/FurnitureViewControl'
import type { FurnitureView } from './three/furniture/furniturePresentation'
import { createFurnitureMotionStore } from './configurator/furnitureMotionStore'
import { CabinetControls } from './components/CabinetControls'
import { createPngExportStore } from './configurator/pngExportStore'
import { ConfigurationSummary } from './components/ConfigurationSummary'
import { ConfiguratorWorkspace } from './components/workspace/ConfiguratorWorkspace'
import './App.css'

const categories = [{ id: 'tables', label: 'Столы' }, { id: 'wardrobes', label: 'Шкафы' }, { id: 'dressers', label: 'Комоды' }] as const

function App() {
  const { store, session, persistence, notice } = useConfigurator()
  const [pngExport] = useState(createPngExportStore)
  const [motionStore] = useState(createFurnitureMotionStore)
  const [wardrobeViewRevision, setWardrobeViewRevision] = useState(0)
  const [furnitureView, setFurnitureView] = useState<FurnitureView>('exterior')
  const selectedModelId = session.selectedModelId
  const furnitureDefinition = getFurnitureDefinition(selectedModelId)
  const category = furnitureDefinition.category ?? 'tables'
  const furnitureOptions = getFurnitureDefinitions()
    .filter(definition => (definition.category ?? 'tables') === category)
    .map(({ id, label }) => ({ value: id, label }))
  const { dimensions, materials: materialSelections } = session.models[selectedModelId]

  const handleModelChange = (modelId: string) => {
    store.dispatch({ type: 'select-model', modelId })
  }

  const title = session.mode === 'wardrobe' ? 'Модульная гардеробная'
    : session.mode === 'builder' ? 'Сборный стол' : furnitureDefinition.label
  const resetLabel = session.mode === 'catalog' ? 'Сбросить эту модель' : 'Сбросить сборку'

  return <ConfiguratorWorkspace mode={session.mode} title={title} persistence={persistence} notice={notice}
    onModeChange={mode => store.dispatch({ type: 'set-mode', mode })}
    viewer={<FurnitureViewer pngExport={pngExport} store={store} furnitureView={furnitureView}
      motionStore={motionStore} wardrobeViewRevision={wardrobeViewRevision} />}
    settings={
        session.mode === 'wardrobe' ? <WardrobeAssemblyControls configuration={session.wardrobe} motionStore={motionStore}
          onFrame={() => setWardrobeViewRevision(value => value + 1)}
          onAction={action => store.dispatch({ type: 'wardrobe-action', action })} /> : session.mode === 'builder' ? (
          <>
            <TableAssemblyControls configuration={session.assembly} onChange={(patch) => store.dispatch({ type: 'update-assembly', patch })} />
          </>
        ) : <>
        <div className="furniture-categories" role="group" aria-label="Вид мебели">
          {categories.map(item => <button key={item.id} type="button" aria-pressed={category === item.id}
            onClick={() => {
              if (category !== item.id) handleModelChange(getFurnitureDefinitions().find(model => (model.category ?? 'tables') === item.id)!.id)
            }}>{item.label}</button>)}
        </div>
        <div className="catalog-model-picker">
          <span>Модель</span>
          <CustomSelect value={selectedModelId} options={furnitureOptions}
            onChange={handleModelChange} ariaLabel="Выбор модели мебели" />
        </div>

        {category === 'tables' && furnitureDefinition.description && <p className="catalog-description">{furnitureDefinition.description}</p>}
        {furnitureDefinition.interiorView && <FurnitureViewControl value={furnitureView} onChange={setFurnitureView} />}
        {category !== 'tables' ? <CabinetControls key={selectedModelId} definition={furnitureDefinition}
          configuration={session.models[selectedModelId]} dispatch={store.dispatch} motionStore={motionStore} /> : <>
        {furnitureDefinition.dimensionOrder.map((dimension) => {
          const config = furnitureDefinition.dimensions[dimension]
          return <SizeControl key={`${selectedModelId}-${dimension}`} name={config.label}
            config={config} value={dimensions[dimension] ?? config.base} millimeters={config.displayUnit === 'mm'}
            onChange={(value) => store.dispatch({ type: 'set-dimension', name: dimension, value })} />
        })}
        {Object.entries(furnitureDefinition.materialSlots ?? {}).map(([slotName, slot]) => (
          <FinishPicker key={`${selectedModelId}-${slotName}`} label={slot.label}
            value={materialSelections[slotName] ?? slot.defaultFinish} ids={slot.allowedFinishes}
            onChange={(finishId) => store.dispatch({ type: 'set-material', slot: slotName, finishId })} />
        ))}
        </>}
        </>}
    save={<div className="workspace-save">
      <h2>Сохранить вариант</h2>
      <p className="workspace-save-title">{title}</p>
      <ConfigurationActions key={JSON.stringify(session)} getShareUrl={store.getShareUrl} />
      <ConfigurationSummary session={session} store={store} pngExport={pngExport} />
      <div className="workspace-reset">
        <button type="button" onClick={() => {
          motionStore.setAll(selectedModelId, false, true)
          store.dispatch({ type: 'reset-model' })
        }}>{resetLabel}</button>
        <p>Вернёт начальные размеры, материалы и наполнение текущего варианта.</p>
      </div>
    </div>} />
}

export default App
