import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
function files(relative) {
  const full = join(root, relative)
  if (!existsSync(full)) throw new Error(`Missing build input: ${relative}`)
  if (!statSync(full).isDirectory()) return [relative]
  return readdirSync(full).flatMap(name => files(`${relative}/${name}`))
}
const total = paths => paths.reduce((sum, path) => sum + statSync(join(root, path)).size, 0)
const size = bytes => `${(bytes / 1000000).toFixed(2)} MB / ${(bytes / 1048576).toFixed(2)} MiB`

try {
  if (existsSync(join(root, 'public/models/first-table.glb'))) {
    throw new Error('Archive the first table before publishing: node scripts/archive-first-table.mjs (verified copy, no Git operations).')
  }
  // This project uses the documented root allowlist format. Fail instead of
  // silently miscounting if that format is changed to more complex glob rules.
  const rules = readFileSync(join(root, '.vercelignore'), 'utf8').split(/\r?\n/).map(s => s.trim()).filter(s => s && !s.startsWith('#'))
  if (rules[0] !== '/*' || rules.slice(1).some(s => !/^![a-zA-Z0-9_.-]+$/.test(s))) throw new Error('Update this size audit for the new .vercelignore rules.')
  const sourceFiles = rules.slice(1).flatMap(rule => files(rule.slice(1)))
  const sourceSize = total(sourceFiles)
  console.log(`Vercel source allowlist: ${sourceFiles.length} files, ${size(sourceSize)}`)
  // A conservative decimal interpretation of the documented Hobby CLI budget.
  if (sourceSize >= 100000000) throw new Error('Source upload exceeds the 100 MB Hobby CLI budget. Use Git integration/Pro or reduce assets.')
  if (sourceFiles.length > 15000) throw new Error('Source upload exceeds the 15000-file CLI limit.')
  const source = files('src').filter(p => /\.(ts|tsx)$/.test(p) && !p.includes('/first-table/') && !p.endsWith('.test.ts'))
  const urls = new Set(source.flatMap(p => [...readFileSync(join(root, p), 'utf8').matchAll(/['"](\/(?:models|modules|materials|textures)\/[^'"\s]+)['"]/g)].map(match => match[1])))
  for (const url of urls) if (!existsSync(join(root, 'public', url))) throw new Error(`Missing public resource: ${url}`)
  console.log(`Public resource references: ${urls.size} checked.`)
  if (process.argv.includes('--dist')) {
    const outputFiles = files('dist')
    if (!existsSync(join(root, 'dist/index.html'))) throw new Error('Run npm run build first.')
    if (existsSync(join(root, 'dist/models/first-table.glb'))) throw new Error('Stale first-table GLB in dist; rebuild.')
    for (const p of files('public')) {
      const built = join(root, 'dist', p.slice('public/'.length))
      if (!existsSync(built) || !readFileSync(built).equals(readFileSync(join(root, p)))) throw new Error(`Build resource differs: ${p}`)
    }
    console.log(`Static build: ${outputFiles.length} files, ${size(total(outputFiles))}`)
    console.log('PUBLICATION_BUILD_CONFIRMED (local build; hosting and WebGL still require live verification).')
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
