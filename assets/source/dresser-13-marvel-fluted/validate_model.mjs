import { readFile, writeFile, realpath } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import validator from 'gltf-validator'
const sourceDir=path.dirname(fileURLToPath(import.meta.url))
const spec=JSON.parse(await readFile(path.join(sourceDir,'model-spec.json'),'utf8'))
const model=path.resolve(sourceDir,'../../../public/models',`${spec.id}.glb`)
const publicRoot=await realpath(path.resolve(sourceDir,'../../../public'))
const externalResourceFunction=async uri=>{
  if (/^[a-z][a-z0-9+.-]*:/i.test(uri) || path.isAbsolute(uri)) throw new Error('Only relative project resources are allowed')
  const resource=await realpath(path.resolve(path.dirname(model),decodeURIComponent(uri)))
  if (!resource.startsWith(publicRoot+path.sep)) throw new Error('Resource escapes public directory')
  return new Uint8Array(await readFile(resource))
}
const report=await validator.validateBytes(new Uint8Array(await readFile(model)),{uri:`${spec.id}.glb`,maxIssues:100,externalResourceFunction})
await writeFile(path.join(sourceDir,'gltf-validator-report.json'),JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify({model:spec.id,validatorVersion:report.validatorVersion,...report.issues}))
if(report.issues.numErrors||report.issues.numWarnings)process.exitCode=1
