import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import ts from 'typescript'
import { expect, it } from 'vitest'
import { getFurnitureDefinitions } from '../../configurator/furnitureRegistry'
import type { AffineTextureBinding, FurnitureDefinition } from '../furniture/types'

const models = getFurnitureDefinitions().filter(model =>
  model.category === 'wardrobes' || model.category === 'dressers')
const sourceRoot = resolve('assets/source')
const readJSON = (path: string) => JSON.parse(readFileSync(path, 'utf8'))

type ModelSpec = {
  id: string
  folder: string
  label: string
  base: Record<string, number>
  limits: Record<string, [number, number]>
  defaults?: Record<string, number>
}

type UVContract = Record<string, {
  bindings: Record<string, AffineTextureBinding & { axis: string }>
}>

type ModelContract = {
  modelId: string
  base: Record<string, number>
  materialTargets: Record<string, string[]>
  uvContract: UVContract
  profileUVContract?: UVContract
}

// Compare the public definitions with authoring inputs, not with a second
// snapshot of generated TypeScript. This also covers Katania's profile UVs,
// whose generator is separate from the Python integration scripts.
it.each(models)('$id keeps runtime data consistent with its source contracts', async catalogue => {
  const source = resolve(sourceRoot, catalogue.id)
  const spec: ModelSpec = readJSON(resolve(source, 'model-spec.json'))
  const contract: ModelContract = readJSON(resolve(source, 'model-contract.json'))
  const facades: FurnitureDefinition['facades'] = readJSON(resolve(source, 'facade-variants.json'))
  const runtime = await catalogue.loadRuntime!()

  expect(spec.id).toBe(catalogue.id)
  expect(contract.modelId).toBe(catalogue.id)
  expect(contract.base).toEqual(spec.base)
  expect(catalogue.label).toBe(spec.label)
  expect(catalogue.modelUrl).toBe(`/models/${spec.id}.glb`)
  expect(runtime.dimensions).toEqual(catalogue.dimensions)
  expect(Object.keys(catalogue.dimensions).sort()).toEqual(Object.keys(spec.base).sort())
  for (const [name, dimension] of Object.entries(catalogue.dimensions)) {
    expect(dimension.base, name).toBe(spec.base[name])
    expect([dimension.min, dimension.max], name).toEqual(spec.limits[name])
    expect(dimension.defaultValue, name).toBe(spec.defaults?.[name])
  }
  expect(catalogue.facades).toEqual(facades)
  expect(runtime.facades).toEqual(facades)
  expect(runtime.articulations).toEqual(catalogue.articulations)
  expect(runtime.handles).toEqual(catalogue.handles)

  const bindings = Object.fromEntries(Object.entries({
    ...contract.uvContract, ...contract.profileUVContract,
  }).map(([material, record]) => [material, Object.fromEntries(
    Object.entries(record.bindings).map(([axis, binding]) => [axis,
      Object.fromEntries(Object.entries(binding).filter(([key]) => key !== 'axis')),
    ]),
  )]))
  expect(runtime.textureTransforms).toEqual(bindings)
  expect(Object.keys(runtime.materialSlots!).sort()).toEqual(Object.keys(catalogue.materialSlots!).sort())
  for (const [key, slot] of Object.entries(runtime.materialSlots!)) {
    expect(slot.targets, key).toEqual(contract.materialTargets[key])
    expect({ ...slot, targets: [] }, key).toEqual(catalogue.materialSlots![key])
  }
})

it('keeps heavy model definitions out of the eager application import graph', () => {
  const forbidden = new Set(models.flatMap(model => {
    const spec: ModelSpec = readJSON(resolve(sourceRoot, model.id, 'model-spec.json'))
    return ['config.ts', 'runtime.ts', 'textureTransforms.ts'].map(file =>
      resolve('src/three/models', spec.folder, file))
  }))
  const visited = new Set<string>()
  function visit(file: string, chain: string[]) {
    expect(forbidden.has(file), `Eager model import: ${[...chain, file].join(' -> ')}`).toBe(false)
    if (visited.has(file)) return
    visited.add(file)
    const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
    for (const statement of source.statements) {
      if (!ts.isImportDeclaration(statement) && !ts.isExportDeclaration(statement)) continue
      if (ts.isImportDeclaration(statement)) {
        if (statement.importClause?.isTypeOnly) continue
        const clause = statement.importClause
        const bindings = clause?.namedBindings
        if (!clause?.name && bindings && ts.isNamedImports(bindings)
          && bindings.elements.length && bindings.elements.every(item => item.isTypeOnly)) continue
      } else {
        if (statement.isTypeOnly) continue
        if (statement.exportClause && ts.isNamedExports(statement.exportClause)
          && statement.exportClause.elements.length
          && statement.exportClause.elements.every(item => item.isTypeOnly)) continue
      }
      const module = statement.moduleSpecifier
      if (!module || !ts.isStringLiteral(module) || !module.text.startsWith('.')) continue
      const path = resolve(dirname(file), module.text)
      const resolved = [path, `${path}.ts`, `${path}.tsx`, `${path}/index.ts`, `${path}/index.tsx`]
        .find(candidate => /\.[cm]?[jt]sx?$/.test(candidate) && existsSync(candidate))
      if (resolved) visit(resolved, [...chain, file])
    }
  }
  // Dynamic imports intentionally do not appear in source.statements as static
  // import/export declarations. They are the lazy boundary under test.
  visit(resolve('src/main.tsx'), [])
  expect(visited.has(resolve('src/configurator/furnitureRegistry.ts'))).toBe(true)
  for (const model of models) {
    const spec: ModelSpec = readJSON(resolve(sourceRoot, model.id, 'model-spec.json'))
    expect(visited.has(resolve('src/three/models', spec.folder, 'catalog.ts'))).toBe(true)
  }
})
