import type { FacadeStyleId } from '../../three/facades/types'

export const FACADE_STYLES: readonly { id: FacadeStyleId; label: string; description: string }[] = [
  { id: 'original', label: 'Исходный', description: 'Первоначальный рисунок модели, включая сочетание гладких и декоративных фасадов.' },
  { id: 'smooth', label: 'Гладкий', description: 'Ровная поверхность с мягкой кромкой.' },
  { id: 'frame', label: 'Рамочный', description: 'Рамка с центральным полем. Ширина рамки сохраняется при изменении размеров.' },
  { id: 'fluted', label: 'Рифлёный', description: 'Мягкие канавки с постоянным шагом. Их количество подстраивается под ширину фасада.' },
]

export const getFacadeStyle = (id: FacadeStyleId) => FACADE_STYLES.find(style => style.id === id)!
