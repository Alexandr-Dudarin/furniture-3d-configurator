import { readFile } from 'node:fs/promises'
import { expect, it } from 'vitest'
import { Color } from 'three'
import { getMaterialFinishes } from './materialRegistry'

it('ships separate small WebP previews for all textured finishes and matching sRGB metal swatches', async () => {
  for (const finish of getMaterialFinishes()) {
    if (finish.kind === 'procedural') {
      expect(finish.previewColor).toBe(`#${new Color(finish.color).getHexString()}`)
      continue
    }
    expect(finish.previewUrl).not.toBe(finish.maps.color)
    const preview = await readFile(`public${finish.previewUrl}`)
    const full = await readFile(`public${finish.maps.color}`)
    expect(preview.subarray(8, 12).toString()).toBe('WEBP')
    expect(preview.length).toBeLessThan(15_000)
    expect(preview.length).toBeLessThan(full.length / 10)
  }
})
