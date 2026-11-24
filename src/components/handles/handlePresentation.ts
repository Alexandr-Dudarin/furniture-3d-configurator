import { HARDWARE_HANDLES, type CatalogHandle } from '../../configurator/handles'

export type HandleStyle = CatalogHandle | 'top-grip' | 'finger-notch'
export type HandleKind = 'doors' | 'drawers'

export function handlePreviewUrl(style: HandleStyle, kind: HandleKind) {
  return `/previews/handles/${kind}-${style}.svg`
}

const cm = (metres: number) => Number((metres * 100).toFixed(1)).toLocaleString('ru-RU')

export function handleDescription(style: HandleStyle, kind: HandleKind) {
  if (style === 'original') return {
    size: 'Как в исходной модели',
    mounting: 'Восстанавливает исходный вариант, в том числе отсутствие ручек.',
  }
  if (style === 'none') return {
    size: 'Без выступающей ручки',
    mounting: 'Без выступающей ручки. В 3D нажмите на фасад, чтобы открыть его.',
  }
  if (style === 'top-grip') return {
    size: 'Зазор сверху 4 см',
    mounting: 'Фасад укорочен сверху, чтобы за него можно было взяться рукой.',
  }
  if (style === 'finger-notch') return {
    size: 'Выемка 10 × 3 см',
    mounting: 'Выемка по центру верхнего края, в материале самого фасада.',
  }
  if (style === 'long-bar') return {
    size: `Длина до ${kind === 'doors' ? 60 : 32} см`,
    mounting: 'Прямоугольная скоба на двух опорах. Длина учитывает размер фасада.',
  }
  const handle = HARDWARE_HANDLES.find(option => option.value === style)!
  const length = kind === 'doors'
    ? style === 'edge-pull' ? .17 : style === 'profile' ? .33
      : (style === 'knob' || style === 'semicircle') ? handle.length * 1.75 : handle.length
    : handle.length
  return {
    size: `${style === 'knob' ? 'Диаметр' : style === 'semicircle' ? 'Ширина' : 'Длина'} ${cm(length)} см`,
    mounting: style === 'profile'
      ? 'Охватывает край фасада: крепление внутри, захват снаружи.'
      : style === 'edge-pull'
        ? 'Толстая планка с крючком, закреплённая на плоскости фасада.'
        : kind === 'doors'
          ? 'На лицевой стороне дверцы, возле свободного края.'
          : 'На лицевой стороне ящика, под верхним краем.',
  }
}
