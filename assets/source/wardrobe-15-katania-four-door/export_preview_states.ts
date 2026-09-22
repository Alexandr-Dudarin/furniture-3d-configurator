import fs from 'node:fs/promises'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../../src/three/furniture/furnitureController'
import { createFurnitureMotion } from '../../../src/three/furniture/furnitureMotion'
import { createFurnitureMaterialController } from '../../../src/three/materials/materialController'
import { getMaterialFinish } from '../../../src/three/materials/materialRegistry'
import { definition } from '../../../src/three/models/wardrobe-katania-four-door/runtime'

class ImageStub extends EventTarget { width=1; height=1; set src(_v:string){queueMicrotask(()=>this.dispatchEvent(new Event('load')))} }
Object.assign(globalThis,{self:globalThis,document:{createElementNS:()=>new ImageStub()}})
const root=(await new GLTFLoader().parseAsync(Uint8Array.from(await fs.readFile(`public${definition.modelUrl}`)).buffer,'')).scene
const resize=createFurnitureController(root,definition)
const motion=createFurnitureMotion(root,definition,resize.getDimensions,()=>{})
const materials=createFurnitureMaterialController(root,definition,{onMaterialsChanged:()=>motion.withClosedPose(resize.refreshTextures)})
const initial=materials.getSelections()
await materials.setFinishes(initial)
const base={width:1.6,height:1.9,depth:.4},max={width:2.4,height:2.7,depth:.6},mid={width:2,height:2.3,depth:.5}
const states:unknown[]=[]
function capture(name:string,note='Real GLB and production geometry, material, affine UV and opening controllers') {
  root.updateMatrixWorld(true)
  const nodes:Record<string,unknown>={},mat:Record<string,unknown>={}
  root.traverse(o=>{
    let visible=true;for(let p:THREE.Object3D|null=o;p;p=p.parent)visible&&=p.visible
    nodes[o.name]={position:o.position.toArray(),quaternion:o.quaternion.toArray(),scale:o.scale.toArray(),matrixWorld:o.matrixWorld.toArray(),visible}
    if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial)mat[m.name]={finishId:m.userData.finishId??null,color:m.color.toArray(),roughness:m.roughness,metalness:m.metalness,normalScale:m.normalScale.toArray(),repeat:m.map?.repeat.toArray()??[1,1],offset:m.map?.offset.toArray()??[0,0]}
  })
  states.push({name,dimensions:resize.getDimensions(),note,nodes,materials:mat})
}
for(const [name,size] of [['base',base],['min',base],['intermediate',mid],['max',max],['return-base',base]] as const){motion.withClosedPose(()=>resize.setDimensions(size));capture(name)}
motion.setAll(true);motion.update(.24);capture('half-open')
motion.update(.24);capture('open-base')
motion.withClosedPose(()=>resize.setDimensions(max));capture('open-max')
motion.withClosedPose(()=>resize.setDimensions({...max,depth:.4}));capture('wide-shallow-open')
motion.withClosedPose(()=>resize.setDimensions({...base,depth:.6}));capture('narrow-deep-open')
motion.setAll(false,true);motion.withClosedPose(()=>resize.setDimensions(base))
for(const name of definition.interiorView!.hiddenNodes)root.getObjectByName(name)!.visible=false
motion.syncVisibility();capture('interior-base')
for(const name of definition.interiorView!.hiddenNodes)root.getObjectByName(name)!.visible=true
motion.syncVisibility()
await materials.setFinishes({carcass:'oak-natural',fronts:'oak-grey',hardware:'metal-white-matte'})
capture('materials-base')
motion.setAll(true,true);motion.withClosedPose(()=>resize.setDimensions(max));capture('materials-open-max')
motion.setAll(false,true);motion.withClosedPose(()=>resize.setDimensions(base))
await materials.setFinishes({carcass:'board-grey-neutral',fronts:'board-grey-neutral',hardware:'metal-black-matte'})
const isolated:THREE.Object3D[]=[]
root.traverse(o=>{if(o.name==='Carcass_Assembly'||/^Door_0[234]_Hinge$/.test(o.name)||o.name==='Handle_01_Assembly'||/^Hinge_01_/.test(o.name)){o.visible=false;isolated.push(o)}})
capture('profile-detail','First facade isolated from the actual GLB to expose the machined top/side cut; unchanged geometry')
for(const node of isolated)node.visible=true
await materials.setFinishes({carcass:'board-white-matte',fronts:'board-white-matte',hardware:'metal-black-matte'})
motion.toggle('Door_01_Hinge');motion.update(.48);capture('hinge-side')
const finishes=[...new Set(Object.values(definition.materialSlots!).flatMap(slot=>[...slot.allowedFinishes]))]
const finishCatalog=Object.fromEntries(finishes.map(id=>[id,getMaterialFinish(id)]))
await fs.writeFile(`assets/source/${definition.id}/preview-states.json`,JSON.stringify({modelId:definition.id,generatedBy:'Production GLB, controllers and shared finishes; CPU renderer decodes real images',states,finishCatalog},null,2)+'\n')
materials.dispose();motion.dispose()
console.log(definition.id,states.length,'production states exported')
