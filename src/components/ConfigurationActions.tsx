import { useState } from 'react'
import type { ConfiguratorSnapshot } from '../configurator/configuratorStore'

type ConfigurationActionsProps = {
  persistence: ConfiguratorSnapshot['persistence']
  notice: string | null
  getShareUrl: () => string
  onReset: () => void
}

export function ConfigurationActions({ persistence, notice, getShareUrl, onReset }: ConfigurationActionsProps) {
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
      <p className="configuration-save-status" role="status">
        {persistence === 'saved' ? 'Сохранено в этом браузере'
          : persistence === 'pending' ? 'Сохранение…'
            : 'Автосохранение недоступно. Сохраните ссылку на этот вариант.'}
      </p>
      {notice && <p className="configuration-notice" role="status">{notice}</p>}
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
      <button type="button" className="configuration-reset" onClick={onReset}>Сбросить эту модель</button>
    </div>
  )
}
