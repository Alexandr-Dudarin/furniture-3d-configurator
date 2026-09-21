/// <reference types="node" />
import fs from 'node:fs/promises'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../../src/three/furniture/furnitureController'
import { createFurnitureMaterialController } from '../../../src/three/materials/materialController'
import { getMaterialFinish } from '../../../src/three/materials/materialRegistry'
import { WARDROBE_09_CONFIG as config, createMaterialReviewDefinition } from '../../../src/three/models/wardrobe-chelsea-two-door/config'

// Изображения для CPU preview декодирует Pillow; GLTFLoader читает реальные buffers.
class ImageStub {
  width=1;height=1;complete=true
  listeners=new Map<string,Set<EventListenerOrEventListenerObject>>()
  addEventListener(t:string,l:EventListenerOrEventListenerObject){const set=this.listeners.get(t)??new Set();set.add(l);this.listeners.set(t,set)}
  removeEventListener(t:string,l:EventListenerOrEventListenerObject){this.listeners.get(t)?.delete(l)}
  set src(_value:string){queueMicrotask(()=>this.listeners.get('load')?.forEach(l=>{if(typeof l==='function')l(new Event('load'));else l.handleEvent(new Event('load'))}))}
}
Object.assign(globalThis,{self:globalThis,document:{createElementNS:()=>new ImageStub()}})
const source=`assets/source/${config.id}`
const root=(await new GLTFLoader().parseAsync(Uint8Array.from(await fs.readFile(`public${config.modelUrl}`)).buffer,'')).scene
const contract=JSON.parse(await fs.readFile(`${source}/model-contract.json`,'utf8'))
const controller=createFurnitureController(root,config)
const hardware=createFurnitureMaterialController(root,config,{onMaterialsChanged:controller.refreshTextures})
await hardware.setFinishes(hardware.getSelections())
const states:unknown[]=[]
const base={width:config.dimensions.width.base,height:config.dimensions.height.base,depth:config.dimensions.depth.base}
const max={width:1,height:2.4,depth:.65}
for(const [name,values] of [['base',base],['min',{width:.6,height:1.9,depth:.4}],['intermediate',{width:.8,height:2.15,depth:.525}],['max',max],['return-base',base]] as const) {
  controller.setDimensions(values);capture(name)
}
const doors=contract.doors as {name:string;angle:number}[]
function resetPresentation() {
  for(const {name} of doors){const o=root.getObjectByName(name)!;o.rotation.y=0;o.visible=true}
}
for(const [name,values] of [['open-base',base],['open-max',max]] as const) {
  resetPresentation();controller.setDimensions(values)
  for(const d of doors)root.getObjectByName(d.name)!.rotation.y=THREE.MathUtils.degToRad(d.angle)
  root.updateMatrixWorld(true);capture(name,'Technical presentation; pivots manually posed outside application UI')
}
resetPresentation();controller.setDimensions(base)
for(const d of doors)root.getObjectByName(d.name)!.visible=false
capture('interior-base','Technical presentation with fronts hidden; not a runtime UI feature')
resetPresentation();controller.setDimensions(base)
hardware.dispose()
const review=createMaterialReviewDefinition('oak-natural','oak-grey',['walnut-natural','oak-grey','oak-natural'])
const mc=createFurnitureMaterialController(root,review,{onMaterialsChanged:controller.refreshTextures})
await mc.setFinishes({...mc.getSelections(),hardware:'metal-white-matte'})
capture('materials-base','Existing catalog finishes at base only; board default library and affine resize UV remain pending')
mc.dispose()
const finishCatalog=Object.fromEntries(['walnut-natural','oak-grey','oak-natural','metal-black-matte','metal-white-matte'].map(id=>[id,getMaterialFinish(id)]))
await fs.writeFile(`${source}/preview-states.json`,JSON.stringify({modelId:config.id,generatedBy:'Real production GLB + unchanged furniture and material controllers',states,finishCatalog},null,2)+'\n')
console.log(config.id,states.length,'preview states exported')

function capture(name:string,note='Actual unchanged runtime geometry; original grey board materials') {
  root.updateMatrixWorld(true)
  const nodes:Record<string,unknown>={},materials:Record<string,unknown>={}
  root.traverse(o=>{
    let visible=true;for(let p:THREE.Object3D|null=o;p;p=p.parent)visible=visible&&p.visible
    nodes[o.name]={position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrixWorld:o.matrixWorld.toArray(),visible}
    if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial) {
      materials[m.name]={finishId:m.userData.finishId??null,color:m.color.toArray(),roughness:m.roughness,metalness:m.metalness,normalScale:m.normalScale.toArray(),repeat:m.map?.repeat.toArray()??[1,1],offset:m.map?.offset.toArray()??[0,0]}
    }
  })
  states.push({name,dimensions:controller.getDimensions(),note,nodes,materials})
}
