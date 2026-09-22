import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { spawnSync } from 'node:child_process'

const source=path.dirname(fileURLToPath(import.meta.url)),project=path.resolve(source,'../../..')
const out=path.join(project,'node_modules/.tmp/wardrobe-15-preview-states.mjs')
await fs.mkdir(path.dirname(out),{recursive:true})
await build({entryPoints:[path.join(source,'export_preview_states.ts')],bundle:true,platform:'node',format:'esm',packages:'external',outfile:out})
const result=spawnSync(process.execPath,[out],{cwd:project,stdio:'inherit'})
if(result.error)throw result.error
process.exitCode=result.status??1
