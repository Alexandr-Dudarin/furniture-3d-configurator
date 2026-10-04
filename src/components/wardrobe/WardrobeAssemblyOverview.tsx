import {
  wardrobeClosedBounds,
  wardrobeSectionClosedDepth,
  type WardrobeAssemblyConfiguration,
} from '../../configurator/wardrobeAssembly/state'
import { formatWardrobeCm as cm } from './format'

type Props = { configuration: WardrobeAssemblyConfiguration; onFrame: () => void }
export function WardrobeAssemblyOverview({ configuration, onFrame }: Props) {
  const arrangement = configuration.arrangement
  const bounds = wardrobeClosedBounds(configuration)
  return (
    <>
      <h2 className="wardrobe-heading">Гардеробная</h2>
      <p className="assembly-total">
        <span>{arrangement ? 'Габариты сборки Ш × В × Г' : 'Общие Ш × В × Г'}</span>
        <strong>
          {cm(bounds.width)} × {cm(bounds.height)} × {cm(bounds.depth)} см
        </strong>
      </p>
      {configuration.sections.some(
        (section) => wardrobeSectionClosedDepth(section) > section.depth,
      ) && (
        <p className="assembly-summary">
          Общая глубина учитывает двери и выступающие ручки при закрытом наполнении.
        </p>
      )}
      <button
        type="button"
        className="wardrobe-frame-button"
        onClick={onFrame}
        title="Вернуть исходный ракурс и подобрать масштаб под текущие размеры сборки"
        aria-describedby="wardrobe-frame-hint"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
          <rect x="7" y="7" width="10" height="10" rx="1" />
        </svg>
        Вернуть общий вид
      </button>
      <p id="wardrobe-frame-hint" className="wardrobe-frame-hint">
        Возвращает ракурс и помещает всю сборку в кадр.
      </p>
    </>
  )
}
