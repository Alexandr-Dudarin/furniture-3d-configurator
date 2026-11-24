import { useId, useState } from 'react'
import { ChoiceGrid } from '../assembly/ChoiceGrid'
import { handleDescription, handlePreviewUrl, type HandleKind, type HandleStyle } from './handlePresentation'
import './handlePicker.css'

export function HandlePicker<T extends HandleStyle>({ label, value, options, kind, onChange }: {
  label: string
  value: T
  options: readonly { value: T; label: string }[]
  kind: HandleKind
  onChange: (value: T) => void
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const selected = options.find(option => option.value === value) ?? options[0]
  if (!selected) return null
  const description = handleDescription(selected.value, kind)
  return <div className="handle-picker">
    <button type="button" className="handle-picker-toggle"
      aria-expanded={open} aria-controls={`${id}-options`} aria-describedby={`${id}-selected`}
      aria-label={`${open ? 'Скрыть' : 'Показать'} варианты: ${label}`}
      onClick={() => setOpen(previous => !previous)}>
      <img src={handlePreviewUrl(selected.value, kind)} width="88" height="72" alt="" decoding="async" />
      <span className="handle-picker-current" id={`${id}-selected`}>
        <strong>{selected.label}</strong>
        <span>{description.size}</span>
      </span>
      <span className="handle-picker-action" aria-hidden="true">{open ? 'Свернуть' : 'Изменить'}
        <svg viewBox="0 0 20 20" focusable="false"><path d="m5 7 5 5 5-5" /></svg>
      </span>
    </button>
    <div id={`${id}-options`} hidden={!open} className="handle-picker-options">
      <p className="handle-picker-note">Выберите форму. Цвет ручек задаётся в материалах.</p>
      <ChoiceGrid label={label} value={selected.value} className="handle-choices"
        choices={options.map(option => ({
          id: option.value,
          label: option.label,
          description: handleDescription(option.value, kind).size,
          preview: <img src={handlePreviewUrl(option.value, kind)} width="160" height="112"
            loading="lazy" decoding="async" alt="" />,
        }))}
        onChange={id => {
          const option = options.find(candidate => candidate.value === id)
          if (option) onChange(option.value)
        }} />
      <p className="handle-picker-note">{description.mounting}</p>
    </div>
  </div>
}
