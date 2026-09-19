import fs from 'node:fs/promises'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../../src/three/furniture/furnitureController'
import { createFurnitureMaterialController } from '../../../src/three/materials/materialController'
import { getMaterialFinish } from '../../../src/three/materials/materialRegistry'
import { ROUND_SPLAYED_LEGS_TABLE_CONFIG as config } from '../../../src/three/models/round-splayed-legs-table/config'

// GLTFLoader загружает реальные buffers. Декодирование изображений выполняет renderer.
class ImageStub {
  listeners:Record<string,Set<any>>={};width=1;height=1;complete=true
  addEventListener(t:string,l:any){(this.listeners[t]??=new Set()).add(l)}
  removeEventListener(t:string,l:any){this.listeners[t]?.delete(l)}
  set src(v:string){void v;queueMicrotask(()=>this.listeners.load?.forEach(l=>l({type:'load'})))}
}
Object.assign(globalThis,{self:globalThis,document:{createElementNS:()=>new ImageStub()}})
{
  const root=(await new GLTFLoader().parseAsync(Uint8Array.from(await fs.readFile(`public${config.modelUrl}`)).buffer,'')).scene
  const controller=createFurnitureController(root,config)
  const materials=createFurnitureMaterialController(root,config,{onMaterialsChanged:controller.refreshTextures})
  await materials.setFinishes(materials.getSelections())
  const states=[]
  const d=config.dimensions.diameter
  for(const [name,diameter] of [['base',d.base],['intermediate',(d.base+d.max)/2],['max',d.max],['return-base',d.base]] as const) {
    controller.setDimensions({diameter});capture(name,diameter)
  }
  await materials.setFinish('frameMetal','metal-white-matte')
  capture('white-base',d.base)
  const white=getMaterialFinish('metal-white-matte'),black=getMaterialFinish('metal-black-matte')
  await fs.writeFile(path.join('assets/source',config.id,'preview-states.json'),JSON.stringify({modelId:config.id,generatedBy:'Unmodified FurnitureController and materialController; real production GLB',states,frameFinishes:{white,black}},null,2)+'\n')
  function capture(name:string,diameter:number){
    const nodes:Record<string,any>={},mats:Record<string,any>={}
    root.traverse(o=>{
      o.updateWorldMatrix(true,false)
      nodes[o.name]={position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrixWorld:o.matrixWorld.toArray()}
      if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material]) {
        mats[m.name]={finishId:m.userData.finishId,color:m.color.toArray(),roughness:m.roughness,metalness:m.metalness,repeat:m.map?.repeat.toArray()??[1,1],offset:m.map?.offset.toArray()??[0,0]}
      }
    })
    states.push({name,diameter,nodes,materials:mats})
  }
}
