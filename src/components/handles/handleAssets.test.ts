import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'
import { CATALOG_HANDLES, DOOR_HANDLES } from '../../configurator/handles'
import { DRAWER_HANDLES } from '../../configurator/wardrobeAssembly/drawerHandles'
import { handlePreviewUrl, type HandleKind, type HandleStyle } from './handlePresentation'

it('has a publishable SVG for every selectable handle in the catalogue and assembly', () => {
  const options: [HandleKind, readonly { value: HandleStyle }[]][] = [
    ['doors', DOOR_HANDLES], ['drawers', CATALOG_HANDLES], ['drawers', DRAWER_HANDLES],
  ]
  for (const [kind, handles] of options) for (const handle of handles) {
    const url = handlePreviewUrl(handle.value, kind)
    const svg = readFileSync(join('public', url), 'utf8')
    expect(svg, url).toContain('<svg')
    expect(svg, url).toContain('viewBox=')
    expect(svg, url).not.toMatch(/(?:NaN|Infinity|<script|<foreignObject|(?:href|src)=)/)
  }
})
