import { CustomSelect, type CustomSelectOption } from './components/ui/CustomSelect/CustomSelect'
import { useConfigurator } from './configurator/useConfigurator'
import { ConfigurationActions } from './components/ConfigurationActions'
import { getFurnitureDefinition, getFurnitureDefinitions } from './configurator/furnitureRegistry'
import { SizeControl } from './components/assembly/SizeControl'
import { FinishPicker } from './components/assembly/FinishPicker'
import { TableAssemblyControls } from './components/TableAssemblyControls'
import { FurnitureViewer } from './components/FurnitureViewer'
import './App.css'

const furnitureOptions: CustomSelectOption[] = getFurnitureDefinitions().map(({ id, label }) => ({ value: id, label }))

function App() {
  const { store, session, persistence, notice } = useConfigurator()
  const selectedModelId = session.selectedModelId
  const furnitureDefinition = getFurnitureDefinition(selectedModelId)
  const { dimensions, materials: materialSelections } = session.models[selectedModelId]

  /*
   * =================================
   * CHANGE MODEL
   * =================================
   */

  const handleModelChange = (modelId: string) => {
    store.dispatch({ type: 'select-model', modelId })
  }

  /*
   * =================================
   * UI
   * =================================
   */

  return (
    <div className="app">
      <FurnitureViewer store={store} />

      <div
        className="configuration-panel"
      >
        <div className="configuration-mode" role="group" aria-label="Способ выбора стола">
          <button type="button" aria-pressed={session.mode === 'catalog'} onClick={() => store.dispatch({ type: 'set-mode', mode: 'catalog' })}>Готовые модели</button>
          <button type="button" aria-pressed={session.mode === 'builder'} onClick={() => store.dispatch({ type: 'set-mode', mode: 'builder' })}>Собрать стол</button>
        </div>
        {session.mode === 'builder' ? (
          <>
            <TableAssemblyControls configuration={session.assembly} onChange={(patch) => store.dispatch({ type: 'update-assembly', patch })} />
          </>
        ) : <>
        {/*
         * -----------------------------
         * MODEL SELECT
         * -----------------------------
         */}

        <div
          style={{
            marginBottom:
              16,
          }}
        >
          <div
            style={{
              marginBottom:
                6,

              fontSize:
                14,

              fontWeight:
                600,
            }}
          >
            Модель
          </div>

          <CustomSelect
            value={
              selectedModelId
            }

            options={
              furnitureOptions
            }

            onChange={
              handleModelChange
            }

            ariaLabel="Выбор модели мебели"
          />
        </div>

        {furnitureDefinition.dimensionOrder.map((dimension) => {
          const config = furnitureDefinition.dimensions[dimension]
          return <SizeControl key={`${selectedModelId}-${dimension}`} name={config.label}
            config={config} value={dimensions[dimension] ?? config.base}
            onChange={(value) => store.dispatch({ type: 'set-dimension', name: dimension, value })} />
        })}
        {Object.entries(furnitureDefinition.materialSlots ?? {}).map(([slotName, slot]) => (
          <FinishPicker key={`${selectedModelId}-${slotName}`} label={slot.label}
            value={materialSelections[slotName] ?? slot.defaultFinish} ids={slot.allowedFinishes}
            onChange={(finishId) => store.dispatch({ type: 'set-material', slot: slotName, finishId })} />
        ))}
        </>}
        <ConfigurationActions
          resetLabel={session.mode === 'builder' ? 'Сбросить сборку' : 'Сбросить эту модель'}
          key={JSON.stringify(session)}
          persistence={persistence}
          notice={notice}
          getShareUrl={store.getShareUrl}
          onReset={() => store.dispatch({ type: 'reset-model' })}
        />
      </div>
    </div>
  )
}

export default App
