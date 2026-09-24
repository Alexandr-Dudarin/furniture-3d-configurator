import type { FacadeStyleId } from '../../three/facades/types'

export const FACADE_STYLES: readonly { id: FacadeStyleId; label: string; description: string }[] = [
  { id: 'original', label: 'Исходный', description: 'Первоначальный рисунок модели, включая сочетание гладких и декоративных фасадов.' },
  { id: 'smooth', label: 'Гладкий', description: 'Ровная поверхность с мягкой кромкой.' },
  { id: 'frame', label: 'Рамочный', description: 'Рамка с центральным полем. Ширина рамки сохраняется при изменении размеров.' },
  { id: 'fluted', label: 'Рифлёный', description: 'Мягкие канавки с постоянным шагом. Их количество подстраивается под ширину фасада.' },
  { id: 'fluted-sides', label: 'Рифлёные края', description: 'Рифление по бокам и гладкая середина. Шаг и глубина канавок сохраняются при изменении размеров.' },
  { id: 'diagonal', label: 'Диагональный', description: 'Канавки под углом 45° с закруглёнными концами. Угол и шаг сохраняются при изменении размеров. У каждой двери и ящика свой рисунок.' },
]

export const getFacadeStyle = (id: FacadeStyleId) => FACADE_STYLES.find(style => style.id === id)!
