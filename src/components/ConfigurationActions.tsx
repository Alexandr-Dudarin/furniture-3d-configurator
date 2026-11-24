import { useState } from 'react'

type ConfigurationActionsProps = {
  getShareUrl: () => string
}

export function ConfigurationActions({ getShareUrl }: ConfigurationActionsProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied' | 'manual'>('idle')
  const [manualUrl, setManualUrl] = useState('')

  const copyLink = async () => {
    const href = getShareUrl()
    setCopyStatus('copying')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(href)
      setCopyStatus('copied')
    } catch {
      setManualUrl(href)
      setCopyStatus('manual')
    }
  }

  return (
    <div className="configuration-actions">
      <button type="button" className="configuration-share" onClick={() => void copyLink()} disabled={copyStatus === 'copying'}>
        {copyStatus === 'copying' ? 'Копирование…' : 'Копировать ссылку'}
      </button>
      {copyStatus === 'copied' && <p className="configuration-copy-status" role="status">Ссылка скопирована</p>}
      {copyStatus === 'manual' && (
        <label className="configuration-manual-link">
          Не удалось скопировать автоматически. Выделите и скопируйте ссылку:
          <textarea readOnly value={manualUrl} rows={3} aria-label="Ссылка на конфигурацию"
            onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
    </div>
  )
}
