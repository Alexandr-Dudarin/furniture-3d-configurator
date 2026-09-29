import { useEffect, useId, useRef } from 'react'
import type { WardrobeSection } from '../configurator/wardrobeAssembly/state'

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
  const removingRod = current.rod && !next.rod
  return <dialog ref={dialogRef} className="wardrobe-height-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); onCancel() }}>
    <h2 id={titleId}>Изменить высоту секции {number}?</h2>
    <div id={descriptionId}>
      <p>Высота: {Math.round(current.height * 100)} → {Math.round(next.height * 100)} см.</p>
      {removingRod && <p>Штанга будет удалена: она доступна только в секциях высотой от 150 см.</p>}
      {next.shelves < current.shelves && <p>Количество полок уменьшится: {current.shelves} → {next.shelves}, чтобы сохранить свободное место и зазоры.</p>}
      {removingRod && next.shelves > 0 && <p>Оставшиеся полки будут распределены равномерно по высоте.</p>}
      <p>При отмене высота и наполнение останутся прежними.</p>
    </div>
    <div className="wardrobe-height-dialog-actions">
      <button type="button" autoFocus onClick={onCancel}>Отмена</button>
      <button type="button" className="wardrobe-confirm-height" onClick={onConfirm}>Изменить высоту</button>
    </div>
  </dialog>
}
