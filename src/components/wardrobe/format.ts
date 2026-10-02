export function formatWardrobeCm(value: number) {
  return (value * 100).toLocaleString('ru-RU', { maximumFractionDigits: 1 })
}
