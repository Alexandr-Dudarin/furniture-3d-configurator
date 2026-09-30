import type { FacadeStyleId, FacadeVariants } from '../three/facades/types'
import { FACADE_STYLES, getFacadeStyle } from '../configurator/facades/catalog'
import { ConfigurationSection } from './ConfigurationSection'
import { ChoiceGrid } from './assembly/ChoiceGrid'

export function FacadePreview({ style }: { style: FacadeStyleId }) {
  return <svg viewBox="0 0 100 68" fill="none" aria-hidden="true">
    <rect x="10" y="8" width="80" height="52" rx="2" fill="#e5dac8" stroke="#8d7b64" />
    {style === 'original' && <><path d="M36 8v52M36 34h54" stroke="#8d7b64" />{[17, 23, 29].map(x => <path key={x} d={`M${x} 15v38`} stroke="#9b876d" />)}</>}
    {style === 'frame' && <rect x="21" y="19" width="58" height="30" rx="1" fill="#d3c5b0" stroke="#9b876d" />}
    {style === 'fluted-wide' && Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${17 + i * 6} 15v38`} stroke="#9b876d" strokeWidth="4.2" strokeLinecap="round" />)}
    {style === 'fluted' && Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${17 + i * 6} 15v38`} stroke="#9b876d" strokeWidth="2" strokeLinecap="round" />)}
    {style === 'fluted-sides' && [18, 24, 30, 70, 76, 82].map(x => <path key={x} d={`M${x} 15v38`} stroke="#9b876d" strokeWidth="2" strokeLinecap="round" />)}
    {style === 'diagonal' && [40, 55, 70, 85, 100, 115].map(sum => {
      const x1 = Math.max(18, sum - 53), x2 = Math.min(82, sum - 15)
      return <path key={sum} d={`M${x1} ${sum - x1}L${x2} ${sum - x2}`} stroke="#9b876d" strokeWidth="2" strokeLinecap="round" />
    })}
    {style === 'diamonds' && [40, 55, 70, 85, 100, 115].map(sum => {
      const x1 = Math.max(18, sum - 53), x2 = Math.min(82, sum - 15)
      return <path key={sum} d={`M${x1} ${sum - x1}L${x2} ${sum - x2}M${100 - x1} ${sum - x1}L${100 - x2} ${sum - x2}`} stroke="#9b876d" strokeWidth="1.5" />
    })}
    {(style === 'herringbone' || style === 'herringbone-wide') && [36, 48, 60, 72, 84].map(sum => {
      const x1 = Math.max(18, sum - 53), x2 = Math.min(47, sum - 15)
      return x2 > x1 && <path key={sum} d={`M${x1} ${sum - x1}L${x2} ${sum - x2}M${100 - x1} ${sum - x1}L${100 - x2} ${sum - x2}`} stroke="#9b876d" strokeWidth="2" strokeLinecap="round" />
    })}
    {style === 'herringbone-wide' && [30, 50, 70].map(x => <g key={x}>
      <path d={`M${x} 9v50`} stroke="#e5dac8" strokeWidth="5" />
      <path d={`M${x} 9v50`} stroke="#8d7b64" strokeWidth=".8" />
    </g>)}
  </svg>
}

export function FacadeControls({ spec, value, onChange }: {
  spec: FacadeVariants; value?: FacadeStyleId; onChange: (style: string) => void
}) {
  const selected = value ?? spec.defaultStyle
  return <ConfigurationSection title="Рисунок фасадов" summary={getFacadeStyle(selected).label} initialOpen>
    <ChoiceGrid label="Рисунок фасадов" className="facade-choices" value={selected}
      choices={FACADE_STYLES.filter(style => spec.styles.includes(style.id)).map(style => ({
        id: style.id, label: style.label, preview: <FacadePreview style={style.id} />,
      }))} onChange={onChange} />
    <p className="assembly-summary">{selected === 'herringbone-wide' && spec.wideDescription ? spec.wideDescription : getFacadeStyle(selected).description}</p>
    <p className="assembly-summary">Рисунок применяется ко всем фасадам этой модели. Покрытие можно выбрать отдельно в разделе «Материалы».</p>
  </ConfigurationSection>
}
