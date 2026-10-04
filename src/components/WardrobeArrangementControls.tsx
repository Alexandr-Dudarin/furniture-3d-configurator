import {
  wardrobePlacement,
  wardrobeSectionCount,
  wardrobeArmRanges,
  ARM_LABELS,
} from '../configurator/wardrobeAssembly/arrangement'
import {
  wardrobeAisleWidth,
  type WardrobeAssemblyAction,
  type WardrobeAssemblyConfiguration,
} from '../configurator/wardrobeAssembly/state'
import { ConfigurationSection } from './ConfigurationSection'
import { CustomSelect } from './ui/CustomSelect/CustomSelect'

const cm = (n: number) => (n * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
type Props = {
  configuration: WardrobeAssemblyConfiguration
  onAction: (a: WardrobeAssemblyAction) => void
}

export function WardrobeArrangementControls({ configuration: c, onAction }: Props) {
  const a = c.arrangement,
    layout = wardrobePlacement(c),
    ranges = wardrobeArmRanges(c),
    isU = a?.kind === 'u'
  const summary = isU
    ? 'П-образная · два угла'
    : a
      ? `Г-образная · угол ${a.side === 'left' ? 'слева' : 'справа'}`
      : 'Прямая'
  return (
    <ConfigurationSection title="Форма сборки" summary={summary} initialOpen>
      <div className="wardrobe-section-actions" role="group" aria-label="Форма гардеробной">
        <button
          type="button"
          aria-pressed={!a}
          disabled={c.sections.length > 7}
          onClick={() => onAction({ type: 'set-arrangement', kind: 'straight' })}
        >
          Прямая
        </button>
        <button
          type="button"
          aria-pressed={a?.kind === 'l'}
          disabled={c.sections.length < 2}
          onClick={() => onAction({ type: 'set-arrangement', kind: 'l' })}
        >
          Г-образная
        </button>
        <button
          type="button"
          aria-pressed={isU}
          disabled={c.sections.length < 3 || c.sections.length > 19}
          onClick={() => onAction({ type: 'set-arrangement', kind: 'u' })}
        >
          П-образная
        </button>
      </div>
      {c.sections.length < 2 && (
        <p className="assembly-summary">Для Г-образной сборки добавьте вторую секцию.</p>
      )}
      {c.sections.length < 3 && (
        <p className="assembly-summary">
          Для П-образной сборки нужны хотя бы три обычные секции — по одной на сторону.
        </p>
      )}
      {c.sections.length > 19 && (
        <p className="assembly-summary">
          Для П-образной сборки оставьте до 19 обычных секций: ещё два места займут углы.
        </p>
      )}
      {a && (
        <>
          {c.sections.length > 7 && (
            <p className="assembly-summary">
              Для возврата к прямой сборке оставьте до 7 обычных секций.
            </p>
          )}
          {a.kind === 'l' ? (
            <div className="assembly-field">
              <span>Расположение угла</span>
              <CustomSelect
                ariaLabel="Расположение угла"
                value={a.side}
                options={[
                  { value: 'left', label: 'Угол слева' },
                  { value: 'right', label: 'Угол справа' },
                ]}
                onChange={(value) =>
                  onAction({
                    type: 'set-arrangement',
                    kind: 'l',
                    side: value === 'right' ? 'right' : 'left',
                  })
                }
              />
            </div>
          ) : (
            <p className="assembly-summary">
              А — задняя сторона между углами, Б — левая, В — правая. Углы добавляются
              автоматически.
            </p>
          )}
          <div className="assembly-field">
            <span>Секций на стороне А</span>
            <CustomSelect
              ariaLabel="Количество секций на стороне А"
              value={String(a.split)}
              options={Array.from(
                {
                  length: isU
                    ? c.sections.length - (ranges[1].end - ranges[1].start) - 1
                    : c.sections.length - 1,
                },
                (_, i) => ({ value: String(i + 1), label: String(i + 1) }),
              )}
              onChange={(value) =>
                onAction({ type: 'set-arm-count', arm: 0, count: Number(value) })
              }
            />
          </div>
          {isU && (
            <div className="assembly-field">
              <span>Секций на стороне Б</span>
              <CustomSelect
                ariaLabel="Количество секций на стороне Б"
                value={String(a.secondSplit - a.split)}
                options={Array.from({ length: c.sections.length - a.split - 1 }, (_, i) => ({
                  value: String(i + 1),
                  label: String(i + 1),
                }))}
                onChange={(value) =>
                  onAction({ type: 'set-arm-count', arm: 1, count: Number(value) })
                }
              />
            </div>
          )}
          <p className="assembly-summary">
            {ranges.map((r) => `${ARM_LABELS[r.arm]}: ${r.end - r.start}`).join(' · ')}.{' '}
            {isU
              ? 'На стороне А секции идут слева направо, на Б и В — от углов к входу.'
              : 'На каждой стороне секции идут от угла к краю.'}
          </p>
          {isU && (
            <p className="assembly-summary">
              <strong>
                Проход между боковыми секциями: не меньше {cm(wardrobeAisleWidth(c)!)} см.
              </strong>{' '}
              Размер учитывает закрытые фасады и выступающие ручки. Открытые двери и ящики занимают
              часть прохода.
            </p>
          )}
          <p className="assembly-summary">
            Если открыванию мешает соседняя дверь или ящик, сначала они закроются. «Открыть всё»
            открывает только совместимые детали.
          </p>
          <p className="assembly-summary">
            Всего {wardrobeSectionCount(c)} из 21: обычных секций {c.sections.length} и{' '}
            {isU ? 'два угла' : 'один угол'}. Размеры по стенам: {cm(layout.bounds.width)} ×{' '}
            {cm(layout.bounds.depth)} см.
          </p>

          <p className="assembly-summary">
            При смене формы сохраняются обычные секции. Удаляемые угловые модули вместе со своими
            настройками не сохраняются.
          </p>
        </>
      )}
    </ConfigurationSection>
  )
}
