import { expect, it } from 'vitest'
import { commitDimensionInput } from './dimensionInput'

const config = { label: 'Длина', base: 1.2, min: 0.95, max: 1.65, step: 0.01 }
it('accepts exact centimeters, rounds comma fractions and clamps to the selected base', () => {
  expect(commitDimensionInput('130', 1.2, config, 100)).toEqual({ value: 1.3, notice: '' })
  expect(commitDimensionInput('130,5', 1.2, config, 100).value).toBe(1.31)
  expect(commitDimensionInput('999', 1.2, config, 100)).toEqual({ value: 1.65, notice: 'Значение приведено к допустимому диапазону и шагу.' })
  expect(commitDimensionInput('-3', 1.2, config, 100).value).toBe(0.95)
})
it('retains the previous size for incomplete/invalid input, including empty strings', () => {
  for (const text of ['', ' ', '-', 'abc', '1e3', 'NaN', 'Infinity', '130cm']) expect(commitDimensionInput(text, 1.2, config, 100).value).toBe(1.2)
  expect(commitDimensionInput('', 1.2, config, 100).notice).toBe('')
  expect(commitDimensionInput('abc', 1.2, config, 100).notice).not.toBe('')
})
it('uses millimeters for thickness and current dynamic width bounds', () => {
  const thickness = { label: 'Толщина', base: 0.022, min: 0.02, max: 0.05, step: 0.001 }
  expect(commitDimensionInput('35', 0.022, thickness, 1000).value).toBe(0.035)
  expect(commitDimensionInput('35.5', 0.022, thickness, 1000).value).toBe(0.036)
  expect(commitDimensionInput('110', 0.8, { ...config, min: 0.8, max: 0.9 }, 100).value).toBe(0.9)
})
