import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import validator from 'gltf-validator'
const sourceDir=path.dirname(fileURLToPath(import.meta.url))
const spec=JSON.parse(await readFile(path.join(sourceDir,'model-spec.json'),'utf8'))
const model=path.resolve(sourceDir,'../../../public/models',`${spec.id}.glb`)
const report=await validator.validateBytes(new Uint8Array(await readFile(model)),{uri:`${spec.id}.glb`,maxIssues:100})
await writeFile(path.join(sourceDir,'gltf-validator-report.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({model:spec.id,validatorVersion:report.validatorVersion,...report.issues}))
if(report.issues.numErrors||report.issues.numWarnings)process.exitCode=1
