import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { build } from 'esbuild'

// Авторинг/проверка вне приложения. Общие файлы проекта не изменяются.
const source=path.dirname(fileURLToPath(import.meta.url))
const project=path.resolve(source,'../../..')
const spec=JSON.parse(await fs.readFile(path.join(source,'model-spec.json'),'utf8'))
const mode=process.argv[2]??'previews'
if(!['previews','compatibility'].includes(mode))throw new Error('Use previews or compatibility')
const entry=mode==='previews'?'export_preview_states.ts':'check_runtime_compatibility.ts'
const out=path.join(project,'node_modules/.tmp',`${spec.id}-${mode}.mjs`)
await fs.mkdir(path.dirname(out),{recursive:true})
await build({entryPoints:[path.join(source,entry)],bundle:true,platform:'node',format:'esm',packages:'external',outfile:out})
const result=spawnSync(process.execPath,[out],{cwd:project,stdio:'inherit'})
if(result.error)throw result.error
process.exitCode=result.status??1
