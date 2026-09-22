import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  summary: ReactNode
  children: ReactNode
  initialOpen?: boolean
}

export function ConfigurationSection({ title, summary, children, initialOpen = false }: Props) {
  const [open, setOpen] = useState(initialOpen)
  return <details className="assembly-section" open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
    <summary>
      <span className="section-heading"><strong>{title}</strong><span className="section-value">{summary}</span></span>
      <span className="section-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </summary>
    <div className="assembly-section-content">{children}</div>
  </details>
}
