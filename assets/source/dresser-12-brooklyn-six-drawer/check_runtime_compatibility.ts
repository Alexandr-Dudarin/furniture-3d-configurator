/// <reference types="node" />
import fs from 'node:fs/promises'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../../src/three/furniture/furnitureController'
import { getMaterialFinishes } from '../../../src/three/materials/materialRegistry'
import { DRESSER_12_CONFIG as config } from '../../../src/three/models/dresser-brooklyn-six-drawer/config'

class ImageStub {
  width=1;height=1;complete=true
  listeners=new Map<string,Set<()=>void>>()
  addEventListener(t:string,l:()=>void){const set=this.listeners.get(t)??new Set();set.add(l);this.listeners.set(t,set)}
  removeEventListener(t:string,l:()=>void){this.listeners.get(t)?.delete(l)}
  set src(_v:string){queueMicrotask(()=>this.listeners.get('load')?.forEach(l=>l()))}
}
Object.assign(globalThis,{self:globalThis,document:{createElementNS:()=>new ImageStub()}})
const source=`assets/source/${config.id}`,contract=JSON.parse(await fs.readFile(`${source}/model-contract.json`,'utf8'))
const root=(await new GLTFLoader().parseAsync(Uint8Array.from(await fs.readFile(`public${config.modelUrl}`)).buffer,'')).scene
// Проба максимально доступной старой textureAxes-конфигурации на РЕАЛЬНОМ GLB.
const controller=createFurnitureController(root,{...config,textureAxes:contract.legacyTextureAxes})
const targetName='Front_Facade_plain_Drawer_ccc_Z'
let primitive:THREE.Mesh|undefined
root.traverse(o=>{if(o instanceof THREE.Mesh&&!Array.isArray(o.material)&&o.material.name===targetName)primitive=o})
if(!primitive)throw new Error('Missing diagnostic target')
const tile=root.getObjectByName(contract.uvContract[targetName].exampleTarget)!
controller.setDimensions({width:config.dimensions.width.max,height:config.dimensions.height.max,depth:config.dimensions.depth.max})
const actual=(primitive.material as THREE.MeshStandardMaterial).map!.repeat.y,expected=tile.scale.y
const report={modelId:config.id,status:'REQUIRES_ENGINE_EXTENSION',integrationReady:false,
  previewConfig:'Geometry with embedded base finishes and available hardware slots; board finish integration pending',
  boardFinishCatalogReady:false,registeredFinishIds:getMaterialFinishes().map(f=>f.id),
  affineUvReady:Math.abs(expected-actual)<1e-6,
  probe:{productionGlb:true,semanticMaterial:targetName,dimension:'height',base:config.dimensions.height.base,max:config.dimensions.height.max,expectedRepeat:expected,actualLegacyRepeat:actual,featureSizeErrorPercent:100*(expected/actual-1)},
  fixedBevelUv:'Moving edge/corner UV phases also need translationFactor; mere repeat correction is insufficient',
  required:['generic affine UV mapping with repeat and offset per surface','registered nonmetallic board finishes','UI precision for 1 mm step','nonmetallic gloss white and cashmere finishes, brass hardware finish','normalize texture grain axes for wood finish swaps'],
  manualQa:{webglBrowser:'NOT RUN',blenderExportReimport:'NOT RUN'}}
controller.setDimensions({width:config.dimensions.width.base,height:config.dimensions.height.base,depth:config.dimensions.depth.base})
await fs.writeFile(`${source}/runtime-compatibility.json`,JSON.stringify(report,null,2)+'\n')
console.log(JSON.stringify(report.probe))
console.log(config.id,report.status)
process.exitCode=2
