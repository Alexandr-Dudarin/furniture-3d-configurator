import { useState, useSyncExternalStore } from 'react'
import type { ConfiguratorStore } from '../configurator/configuratorStore'
import type { ConfiguratorSession } from '../configurator/savedConfiguration'
import type { PngExportStore } from '../configurator/pngExportStore'
import { configurationSummaryText, getConfigurationSummary } from '../configurator/configurationSummary'
import { ConfigurationSection } from './ConfigurationSection'

export function ConfigurationSummary({ session, store, pngExport }: {
  session: ConfiguratorSession; store: ConfiguratorStore; pngExport: PngExportStore
}) {
  const source = useSyncExternalStore(pngExport.subscribe, pngExport.getSnapshot)
  const summary = getConfigurationSummary(session)
  const text = configurationSummaryText(summary, store.getShareUrl())
  const [copy, setCopy] = useState<{ text: string; manual: boolean } | null>(null)
  const [saving, setSaving] = useState(false)
  const [pngStatus, setPngStatus] = useState('')
  const copySummary = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(text)
      setCopy({ text, manual: false })
    } catch { setCopy({ text, manual: true }) }
  }
  const savePng = async () => {
    if (saving) return
    setSaving(true)
    setPngStatus('')
    try {
      const blob = await pngExport.capture(session)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${summary.fileStem}-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      // Give browsers time to consume the download URL before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
      setPngStatus('PNG передан на скачивание.')
    } catch {
      setPngStatus('Не удалось сохранить PNG. Дождитесь загрузки модели и повторите попытку.')
    } finally { setSaving(false) }
  }
  return <div className="configuration-result">
    <ConfigurationSection title="Ваш вариант" summary={summary.title} initialOpen>
      <dl className="configuration-summary">
        {summary.rows.map(row => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}
      </dl>
      <button type="button" className="configuration-reset" onClick={() => void copySummary()}>Копировать описание</button>
      {copy?.text === text && (copy.manual
        ? <label className="configuration-manual-link">Выделите и скопируйте описание:
          <textarea aria-label="Описание конфигурации" readOnly rows={7} value={text} onFocus={e => e.currentTarget.select()} />
        </label>
        : <p className="configuration-copy-status" role="status">Описание со ссылкой скопировано</p>)}
    </ConfigurationSection>
    <button type="button" className="configuration-reset" disabled={saving || source?.session !== session} onClick={() => void savePng()}>
      {saving ? 'Сохраняем PNG…' : 'Сохранить вид в PNG'}
    </button>
    <p className="configuration-export-hint">PNG сохранит текущий ракурс и открытые двери и ящики. Ссылка передаёт размеры, материалы и выбранный рисунок фасадов.</p>
    {pngStatus && <p className="configuration-copy-status" role="status">{pngStatus}</p>}
  </div>
}
