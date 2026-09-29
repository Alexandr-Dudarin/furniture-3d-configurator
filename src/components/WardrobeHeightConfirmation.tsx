import { useEffect, useId, useRef } from 'react'
import { automaticLayout, wardrobeLayoutAdjustments, type WardrobeSection } from '../configurator/wardrobeAssembly/state'

export function WardrobeHeightConfirmation({ current, next, number, onConfirm, onCancel }: {
  current: WardrobeSection; next: WardrobeSection; number: number
  onConfirm: () => void; onCancel: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId(), descriptionId = useId()
  useEffect(() => {
    const dialog = dialogRef.current!
    dialog.showModal()
    return () => { dialog.close() }
  }, [])
  const heightChanged = current.height !== next.height
  const adjustments = wardrobeLayoutAdjustments(current, next)
  const cm = (value: number) => Number((value * 100).toFixed(1))
  const removingRod = current.rod && !next.rod
  return <dialog ref={dialogRef} className="wardrobe-height-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onCancel() }}>
    <h2 id={titleId}>Изменить {heightChanged ? 'высоту' : 'наполнение'} секции {number}?</h2>
    <div id={descriptionId}>
      {heightChanged && <p>Высота: {cm(current.height)} → {cm(next.height)} см.</p>}
      {removingRod && <p>Штанга будет удалена.{next.height < 1.5 && ' Она доступна только в секциях высотой от 150 см.'}</p>}
      {next.shelves < current.shelves && <p>Количество полок уменьшится: {current.shelves} → {next.shelves}, чтобы сохранить свободное место и зазоры.</p>}
      {removingRod && next.shelves > 0 && !next.layout && <p>Оставшиеся полки будут распределены равномерно по высоте.</p>}
      {(next.drawers?.count ?? 0) < (current.drawers?.count ?? 0) && <p>Количество ящиков уменьшится: {current.drawers?.count} → {next.drawers?.count ?? 0}.</p>}
      {!current.layout && JSON.stringify(current.drawers) !== JSON.stringify(next.drawers) &&
        JSON.stringify(automaticLayout(current)) !== JSON.stringify(automaticLayout(next)) && (current.shelves > 0 || current.rod) &&
        <p>Автоматическое расположение полок и штанги будет пересчитано с учётом высоты блока ящиков.</p>}
      {adjustments.length > 0 && <><p>Чтобы сохранить зазоры, изменятся высоты:</p><ul>
        {adjustments.map(item => <li key={item.label}>{item.label}: {cm(item.before)} → {cm(item.after)} см.</li>)}
      </ul><p>Для полок указана высота нижней поверхности от пола.</p></>}
      <p>При отмене высота и наполнение останутся прежними.</p>
    </div>
    <div className="wardrobe-height-dialog-actions">
      <button type="button" autoFocus onClick={onCancel}>Отмена</button>
      <button type="button" className="wardrobe-confirm-height" onClick={onConfirm}>{heightChanged ? 'Изменить высоту' : 'Изменить наполнение'}</button>
    </div>
  </dialog>
}
