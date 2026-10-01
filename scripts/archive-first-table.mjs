import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync, constants } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const hash = bytes => createHash('sha256').update(bytes).digest('hex')

// Never overwrite a different file. Verification precedes removal of the public copy.
function copyVerified(source, destination) {
  const original = readFileSync(source)
  if (existsSync(destination) && hash(readFileSync(destination)) !== hash(original)) {
    throw new Error(`Archive conflict; both files preserved: ${destination}`)
  }
  if (!existsSync(destination)) copyFileSync(source, destination, constants.COPYFILE_EXCL)
  if (hash(readFileSync(destination)) !== hash(original)) throw new Error(`Copy verification failed: ${destination}`)
  return { bytes: original.length, sha256: hash(original) }
}

export function archiveFirstTable(root, restore = false) {
  const source = join(root, 'public/models/first-table.glb')
  const folder = join(root, '.local-archive/first-table')
  const backup = join(folder, 'first-table.glb')
  const manifest = join(folder, 'manifest.json')
  if (restore) {
    if (!existsSync(backup) || !existsSync(manifest)) throw new Error('No verified local first-table archive found.')
    const metadata = JSON.parse(readFileSync(manifest, 'utf8'))
    if (hash(readFileSync(backup)) !== metadata.model.sha256) throw new Error('Archive checksum differs; nothing restored.')
    mkdirSync(dirname(source), { recursive: true })
    copyVerified(backup, source)
    return 'GLB restored for local inspection. Backup retained. See docs/publication-ready-v1.md to re-enable the model.'
  }
  if (!existsSync(source)) {
    if (existsSync(backup)) {
      if (!existsSync(manifest) || JSON.parse(readFileSync(manifest, 'utf8')).model.sha256 !== hash(readFileSync(backup))) {
        throw new Error('Local archive is incomplete or changed; check it manually.')
      }
      return 'First table is already archived and verified.'
    }
    return 'First table is absent (a clean checkout does not include the local archive).'
  }
  const modelBytes = readFileSync(source)
  if (modelBytes.length < 12 || modelBytes.toString('ascii', 0, 4) !== 'glTF' || modelBytes.readUInt32LE(4) !== 2 || modelBytes.readUInt32LE(8) !== modelBytes.length) {
    throw new Error('Source is not a complete GLB 2.0 file; nothing moved.')
  }
  mkdirSync(folder, { recursive: true })
  // Copy the declarative implementation as well. The lightweight original remains
  // in src for generic controller tests and as a documented restoration example.
  const config = copyVerified(join(root, 'src/three/models/first-table/config.ts'), join(folder, 'config.ts'))
  const model = copyVerified(source, backup)
  writeFileSync(manifest, JSON.stringify({ model, config }, null, 2) + '\n')
  writeFileSync(join(folder, 'README.md'), '# Первый ручной стол\n\nGLB и конфигурация сохранены до удаления публичной копии.\nВосстановление: `node scripts/archive-first-table.mjs --restore`.\nПодключение к каталогу: `docs/publication-ready-v1.md`.\nПапка игнорируется Git и Vercel; храните отдельную резервную копию.\n')
  // Re-read both files in case either was changed while the copy was being made.
  if (hash(readFileSync(source)) !== model.sha256 || hash(readFileSync(backup)) !== model.sha256) {
    throw new Error('Files changed during archiving; public copy retained.')
  }
  unlinkSync(source)
  return `Archived and verified ${(model.bytes / 1048576).toFixed(2)} MiB in .local-archive/first-table/. No Git operations performed.`
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2)
    if (args.length > 1 || (args.length === 1 && args[0] !== '--restore')) throw new Error('Usage: node scripts/archive-first-table.mjs [--restore]')
    console.log(archiveFirstTable(resolve(dirname(fileURLToPath(import.meta.url)), '..'), args.includes('--restore')))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
