import type { AffineTextureBinding, FurnitureDefinition } from './types'

export function validateTextureTransforms(definition: FurnitureDefinition) {
  for (const [name, bindings] of Object.entries(definition.textureTransforms ?? {})) {
    if (definition.textureAxes[name]) throw new Error(`Ambiguous texture contract: ${name}`)
    for (const binding of Object.values(bindings)) {
      if (!binding || !definition.dimensions[binding.dimension]
        || ![binding.baseLength, binding.stretchFactor, binding.translationFactor, binding.anchor, binding.uvUnitsPerMeter].every(Number.isFinite)
        || binding.baseLength <= 0 || binding.uvUnitsPerMeter <= 0) {
        throw new Error(`Invalid texture contract: ${name}`)
      }
      const range = definition.dimensions[binding.dimension]
      for (const value of [range.min, range.max]) {
        if (binding.baseLength + (value - range.base) * binding.stretchFactor <= 0) {
          throw new Error(`Nonpositive texture segment: ${name}`)
        }
      }
    }
  }
}

export function affineTextureTransform(binding: AffineTextureBinding, delta: number, initialRepeat: number, initialOffset: number) {
  const factor = (binding.baseLength + delta * binding.stretchFactor) / binding.baseLength
  return {
    repeat: initialRepeat * factor,
    offset: initialOffset + initialRepeat * (binding.anchor * (1 - factor)
      + delta * binding.translationFactor * binding.uvUnitsPerMeter),
  }
}
