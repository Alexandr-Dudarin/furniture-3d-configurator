import { afterEach, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { archiveFirstTable } from './archive-first-table.mjs'

const roots: string[] = []
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'first-table-archive-')); roots.push(root)
  mkdirSync(join(root, 'public/models'), { recursive: true })
  mkdirSync(join(root, 'src/three/models/first-table'), { recursive: true })
  const glb = Buffer.alloc(12); glb.write('glTF'); glb.writeUInt32LE(2, 4); glb.writeUInt32LE(12, 8)
  writeFileSync(join(root, 'public/models/first-table.glb'), glb)
  writeFileSync(join(root, 'src/three/models/first-table/config.ts'), '// source implementation\n')
  return { root, glb, source: join(root, 'public/models/first-table.glb'), backup: join(root, '.local-archive/first-table/first-table.glb') }
}
afterEach(() => roots.splice(0).forEach(root => rmSync(root, { recursive: true, force: true })))

it('archives byte-for-byte, can be repeated and restores without removing the backup', () => {
  const f = fixture()
  archiveFirstTable(f.root)
  expect(existsSync(f.source)).toBe(false)
  expect(readFileSync(f.backup)).toEqual(f.glb)
  expect(readFileSync(join(f.root, '.local-archive/first-table/config.ts'), 'utf8')).toContain('source implementation')
  expect(archiveFirstTable(f.root)).toContain('already archived')
  archiveFirstTable(f.root, true)
  expect(readFileSync(f.source)).toEqual(f.glb)
  expect(readFileSync(f.backup)).toEqual(f.glb)
})
it('refuses to overwrite a different backup and keeps the public original', () => {
  const f = fixture()
  mkdirSync(join(f.root, '.local-archive/first-table'), { recursive: true })
  writeFileSync(f.backup, 'another model')
  expect(() => archiveFirstTable(f.root)).toThrow('conflict')
  expect(readFileSync(f.source)).toEqual(f.glb)
  expect(readFileSync(f.backup, 'utf8')).toBe('another model')
})
it('refuses to remove a truncated source', () => {
  const f = fixture(); writeFileSync(f.source, 'glTF')
  expect(() => archiveFirstTable(f.root)).toThrow('complete GLB')
  expect(readFileSync(f.source, 'utf8')).toBe('glTF')
})
it('rejects a changed archive on restore and on a repeated archive check', () => {
  const f = fixture(); archiveFirstTable(f.root); writeFileSync(f.backup, 'changed')
  expect(() => archiveFirstTable(f.root, true)).toThrow('checksum')
  expect(() => archiveFirstTable(f.root)).toThrow('incomplete or changed')
  expect(existsSync(f.source)).toBe(false)
})
it('does not overwrite a restored public model that has local edits', () => {
  const f = fixture(); archiveFirstTable(f.root); writeFileSync(f.source, 'edited locally')
  expect(() => archiveFirstTable(f.root, true)).toThrow('conflict')
  expect(readFileSync(f.source, 'utf8')).toBe('edited locally')
})
