import { useId, useRef, useState } from 'react'
import type { FurnitureDimensionConfig } from '../../three/furniture/types'
import { commitDimensionInput } from './dimensionInput'

type Props = {
  name: string; value: number; config: FurnitureDimensionConfig
  onChange: (value: number) => void; millimeters?: boolean
}

export function SizeControl({ name, value, config, onChange, millimeters = false }: Props) {
  const id = useId()
  const multiplier = millimeters ? 1000 : 100
  const unit = millimeters ? 'мм' : 'см'
  const format = (n: number) => String(Number((n * multiplier).toFixed(1)))
  const source = `${value}:${config.min}:${config.max}:${config.step}`
  const [draft, setDraft] = useState<{ source: string; text: string } | null>(null)
  const [feedback, setFeedback] = useState('')
  const cancelBlur = useRef(false)
  const text = draft?.source === source ? draft.text : format(value)
  const commit = () => {
    if (cancelBlur.current) { cancelBlur.current = false; return }
    const next = commitDimensionInput(text, value, config, multiplier)
    setDraft(null)
    setFeedback(next.notice)
    if (next.value !== value) onChange(next.value)
  }
  return <div className="dimension-control">
    <div className="dimension-heading">
      <label htmlFor={id}>{name}</label>
      <div className="dimension-value">
        <input id={id} type="text" inputMode="decimal" autoComplete="off" value={text}
          aria-label={`${name}, ${unit}`} aria-describedby={`${id}-range ${id}-feedback`}
          onChange={(event) => { setDraft({ source, text: event.currentTarget.value }); setFeedback('') }}
          onBlur={commit} onKeyDown={(event) => {
            if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
            if (event.key === 'Escape') { event.preventDefault(); cancelBlur.current = true; setDraft(null); setFeedback(''); event.currentTarget.blur() }
          }} />
        <span aria-hidden="true">{unit}</span>
      </div>
    </div>
    <input type="range" min={config.min} max={config.max} step={config.step} value={value}
      aria-label={name} aria-valuetext={`${format(value)} ${unit}`} aria-describedby={`${id}-range`}
      onChange={(event) => { setDraft(null); setFeedback(''); onChange(Number(event.currentTarget.value)) }} />
    <div className="dimension-range" id={`${id}-range`}>{format(config.min)}–{format(config.max)} {unit} · шаг {format(config.step)} {unit}</div>
    <div className="dimension-feedback" id={`${id}-feedback`} role="status">{feedback}</div>
  </div>
}
