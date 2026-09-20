import { useId, type ReactNode } from 'react'

type Choice = { id: string; label: string; preview: ReactNode; disabled?: boolean; description?: string }

export function ChoiceGrid({ label, value, choices, onChange, className = '' }: {
  label: string; value: string; choices: readonly Choice[]; onChange: (id: string) => void; className?: string
}) {
  const name = useId()
  return <fieldset className={`choice-fieldset ${className}`}>
    <legend className="visually-hidden">{label}</legend>
    <div className="choice-grid">
      {choices.map((choice) => <label key={choice.id} className={`choice-card${choice.disabled ? ' choice-disabled' : ''}`}>
        <input type="radio" name={name} value={choice.id} checked={value === choice.id} disabled={choice.disabled}
          aria-label={choice.label} aria-describedby={choice.description ? `${name}-${choice.id}` : undefined}
          onChange={() => onChange(choice.id)} />
        <span className="choice-body">
          <span className="choice-preview" aria-hidden="true">{choice.preview}</span>
          <span className="choice-label">{choice.label}</span>
          {choice.description && <span className="choice-description" id={`${name}-${choice.id}`}>{choice.description}</span>}
          <span className="choice-check" aria-hidden="true">✓</span>
        </span>
      </label>)}
    </div>
  </fieldset>
}
