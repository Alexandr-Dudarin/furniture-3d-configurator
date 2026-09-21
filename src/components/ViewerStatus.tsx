export function ViewerStatus({ message, onRetry, retryLabel = 'Повторить загрузку' }: {
  message: string; onRetry?: () => void; retryLabel?: string
}) {
  return <div className="viewer-status">
    <div className="viewer-status-card" role={onRetry ? 'alert' : 'status'}>
      {!onRetry && <span className="viewer-spinner" aria-hidden="true" />}
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>{retryLabel}</button>}
    </div>
  </div>
}
