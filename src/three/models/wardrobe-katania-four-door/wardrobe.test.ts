import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OBB } from 'three/addons/math/OBB.js'
import { createFurnitureController } from '../../furniture/furnitureController'
import { createFurnitureMotion } from '../../furniture/furnitureMotion'
import { disposeFurnitureModel } from '../../furniture/model'
import { createFurnitureMaterialController } from '../../materials/materialController'
import { disposeMaterialFinishCache } from '../../materials/createMaterial'
import { getMaterialFinish } from '../../materials/materialRegistry'
import { catalogue } from './catalog'
import { definition } from './runtime'
import { MATERIAL_TARGETS } from './config'
import { createModelConfiguration } from '../../../configurator/savedConfiguration'

const contract = JSON.parse(await readFile(`assets/source/${definition.id}/model-contract.json`, 'utf8'))
const keys = ['width', 'height', 'depth'] as const
const axes = ['x', 'y', 'z'] as const
type Size = { width: number; height: number; depth: number }
const base: Size = { width: 1.6, height: 1.9, depth: .45 }
const min: Size = { ...base, depth: .4 }, max: Size = { width: 2.4, height: 2.7, depth: .6 }
const middle: Size = { width: 2, height: 2.3, depth: .5 }
const close = (a: number, b: number, label = '') => expect(Math.abs(a-b), `${label}: ${a} != ${b}`).toBeLessThan(1e-6)
const bounds = (o: THREE.Object3D) => { o.updateWorldMatrix(true, true); return new THREE.Box3().setFromObject(o, true) }
const size = (o: THREE.Object3D) => bounds(o).getSize(new THREE.Vector3())
function find(root: THREE.Object3D, name: string) { const o = root.getObjectByName(name); if (!o) throw new Error(`Missing ${name}`); return o }
function collect(root: THREE.Object3D, predicate: (o: THREE.Object3D) => boolean) { const a: THREE.Object3D[]=[]; root.traverse(o => { if (predicate(o)) a.push(o) }); return a }
const panels = (root: THREE.Object3D) => collect(root, o => o.userData.kind === 'board')
const facets = (root: THREE.Object3D) => collect(root, o => o.userData.profile === 'machined-grooves')
const meshMaterial = (o: THREE.Object3D) => (o as THREE.Mesh).material as THREE.MeshStandardMaterial
function snapshot(root: THREE.Object3D) {
  return Object.fromEntries(collect(root, () => true).map(o => [o.name, [...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()]]))
}
const opened: THREE.Object3D[] = []
async function load() {
  class ImageStub extends EventTarget { width=2; height=2; set src(_v: string) { queueMicrotask(() => this.dispatchEvent(new Event('load'))) } }
  vi.stubGlobal('self',globalThis); vi.stubGlobal('document',{createElementNS:()=>new ImageStub()})
  const root=(await new GLTFLoader().parseAsync(Uint8Array.from(await readFile(`public${definition.modelUrl}`)).buffer,'')).scene
  opened.push(root); return root
}
afterEach(() => { for (const root of opened.splice(0)) disposeFurnitureModel(root); disposeMaterialFinishCache(); vi.unstubAllGlobals() })

function checkShape(root: THREE.Object3D, d: Size) {
  const whole=bounds(root), s=whole.getSize(new THREE.Vector3())
  close(s.x,d.width); close(s.y,d.height); close(s.z,d.depth)
  close(whole.min.x,-d.width/2); close(whole.min.z,-d.depth/2); close(whole.min.y,0)
  for (const p of panels(root)) close(size(p)[p.userData.thicknessAxis as 'x'|'y'|'z'],p.userData.thickness,p.name)
  close(size(find(root,'Plinth_Front')).y,.08)
  for (const p of facets(root)) { close(bounds(p).min.y,.05); close(bounds(p).max.y,d.height-.003); close(size(p).x,d.width/4-.003) }
  const doors=facets(root).sort((a,b)=>bounds(a).min.x-bounds(b).min.x)
  for (let i=1;i<doors.length;i++) close(bounds(doors[i]).min.x-bounds(doors[i-1]).max.x,.003)
  for (const door of contract.doors) {
    close(find(root,door.name).getWorldPosition(new THREE.Vector3()).z,bounds(find(root,door.panel)).min.z)
    close(bounds(find(root,door.panel)).min.z-bounds(find(root,'Panel_Side_Left')).max.z,.004)
  }
  const boardBoxes=panels(root).map(node=>({name:node.name,box:bounds(node)}))
  for(let i=0;i<boardBoxes.length;i++)for(let j=i+1;j<boardBoxes.length;j++) {
    const a=boardBoxes[i],b=boardBoxes[j]
    expect(axes.every(k=>Math.min(a.box.max[k],b.box.max[k])-Math.max(a.box.min[k],b.box.min[k])>1e-6),`${a.name} overlaps ${b.name}`).toBe(false)
  }
}

describe('wardrobe-15-katania-four-door', () => {
  it('starts and resets at a real 450 mm source depth while still supporting 400 mm', async () => {
    const root = await load(), controller = createFurnitureController(root, definition)
    const initial = createModelConfiguration(catalogue).dimensions as Size
    expect(initial).toEqual({ width: 1.6, height: 1.9, depth: .45 })
    controller.setDimensions(initial)
    checkShape(root, initial)
    controller.setDimension('depth', .4)
    checkShape(root, { ...base, depth: .4 })
  })

  it('loads the real GLB with a complete lazy catalog, unique API names and existing independent finishes', async () => {
    expect(await catalogue.loadRuntime!()).toBe(definition)
    expect(definition.dimensions).toEqual(catalogue.dimensions)
    keys.forEach(k=>{ close(definition.dimensions[k].base,base[k]); expect(definition.dimensions[k].step).toBe(.001); expect(definition.dimensions[k].displayUnit).toBe('mm') })
    const root=await load(), names=collect(root,()=>true).map(o=>o.name)
    expect(new Set(names).size).toBe(names.length)
    for (const rule of definition.resizeRules) for (const target of 'target' in rule ? [rule.target] : rule.targets.map(t => typeof t === 'string' ? t : t.target)) find(root,target)
    expect(facets(root)).toHaveLength(4)
    expect(collect(root,o=>o.userData.kind==='hanging-bracket')).toHaveLength(4)
    expect(panels(root).filter(p=>p.name.startsWith('Shelf_Bay_'))).toHaveLength(4)
    expect(definition.articulations).toHaveLength(4)
    expect(definition.articulations!.every(s=>s.kind==='door')).toBe(true)
    const actual = new Set(collect(root,o=>o instanceof THREE.Mesh).map(o=>meshMaterial(o).name))
    const targets=Object.values(MATERIAL_TARGETS).flat()
    expect(new Set(targets).size).toBe(targets.length); expect(actual).toEqual(new Set(targets))
    for(const [key,slot] of Object.entries(definition.materialSlots!)) {
      expect({...slot,targets:[]}).toEqual(catalogue.materialSlots![key])
      expect(slot.allowedFinishes).toContain(slot.defaultFinish)
      for(const finish of slot.allowedFinishes)expect(getMaterialFinish(finish).id).toBe(finish)
    }
    const transforms=Object.keys(definition.textureTransforms!)
    expect(new Set(transforms)).toEqual(new Set([...MATERIAL_TARGETS.carcass,...MATERIAL_TARGETS.fronts]))
    expect(definition.textureAxes).toEqual({})
    checkShape(root,base)
  })

  it('preserves 34 size configurations, 1 mm steps, fixed panel thicknesses and exact return',async()=>{
    const root=await load(), controller=createFurnitureController(root,definition),initial=snapshot(root),cases:Size[]=[base]
    for(const width of [min.width,middle.width,max.width])for(const height of [min.height,middle.height,max.height])for(const depth of [min.depth,middle.depth,max.depth])cases.push({width,height,depth})
    for(const k of keys)for(const value of [min[k],max[k]])cases.push({...base,[k]:value})
    expect(cases).toHaveLength(34)
    for(const d of cases){controller.setDimensions(d);checkShape(root,d)}
    for(const key of keys){const d={...base,[key]:base[key]+.001};controller.setDimensions(d);checkShape(root,d)}
    controller.setDimensions(base);expect(snapshot(root)).toEqual(initial)
  },30000)

  it('keeps groove count, mouth, depth, chamfers and handles fixed while land widths grow',async()=>{
    const root=await load(),controller=createFurnitureController(root,definition)
    const fixed=collect(root,o=>o.userData.fitting==='handle-bar'||o.userData.fitting==='handle-post'||o.userData.fitting==='hinge-cup').map(o=>({name:o.name,size:size(o)}))
    for(const d of [base,middle,max,base]) {
      controller.setDimensions(d)
      for(const panel of facets(root)) {
        const grooves=collect(panel,o=>o.userData.role==='fluted-front'&&o.userData.sector==='groove')
        expect(grooves).toHaveLength(48)
        for(const o of grooves){close(size(o).x,.003);close(size(o).z,.0018);close(size(o).y,d.height-.053)}
        const lands=collect(panel,o=>o.userData.role==='fluted-front'&&o.userData.sector==='land')
        expect(lands).toHaveLength(49)
        for(const o of lands)close(size(o).x,((d.width/4-.003)-48*.003)/49)
        const p=(grooves[0] as THREE.Mesh).geometry.getAttribute('position')
        const xs=[...new Set(Array.from({length:p.count},(_,i)=>p.getX(i)))].sort((a,b)=>a-b)
        close(xs[1]-xs[0],.00025)
      }
      for(const f of fixed)axes.forEach(axis=>close(size(find(root,f.name))[axis],f.size[axis]))
      for(const rod of collect(root,o=>o.userData.fitting==='clothes-end-rod')){close(size(rod).x,.014);close(size(rod).y,.014)}
    }
  })

  it('has valid outward triangles and a closed profiled facade at base and max',async()=>{
    const root=await load(),controller=createFurnitureController(root,definition)
    for(const dimensions of [base,max]) {
      controller.setDimensions(dimensions)
      for(const panel of facets(root)) {
        const edges=new Map<string,number>(),v=[new THREE.Vector3(),new THREE.Vector3(),new THREE.Vector3()]
        const pointKey=(p:THREE.Vector3)=>p.toArray().map(x=>Math.round(x*1e6)).join(',')
        for(const mesh of collect(panel,o=>o instanceof THREE.Mesh) as THREE.Mesh[]) {
          const p=mesh.geometry.getAttribute('position'),n=mesh.geometry.getAttribute('normal'),uv=mesh.geometry.getAttribute('uv'),index=mesh.geometry.index!
          for(let i=0;i<index.count;i+=3) {
            const ids=[index.getX(i),index.getX(i+1),index.getX(i+2)]
            ids.forEach((j,k)=>panel.worldToLocal(mesh.localToWorld(v[k].fromBufferAttribute(p,j))))
            const cross=new THREE.Vector3().subVectors(v[1],v[0]).cross(new THREE.Vector3().subVectors(v[2],v[0]))
            expect(cross.lengthSq()).toBeGreaterThan(1e-18)
            const normal=new THREE.Vector3().fromBufferAttribute(n,ids[0]);expect(cross.dot(normal)).toBeGreaterThan(0)
            for(const j of ids)expect(Number.isFinite(uv.getX(j))&&Number.isFinite(uv.getY(j))).toBe(true)
            for(const [a,b] of [[v[0],v[1]],[v[1],v[2]],[v[2],v[0]]]){const k=[pointKey(a),pointKey(b)].sort().join('|');edges.set(k,(edges.get(k)??0)+1)}
          }
        }
        // Long rear edges may meet multiple coplanar cap segments (T-junctions).
        // Check closure by ray parity at groove/land points as well as edge multiplicity.
        expect([...edges.values()].every(count=>count<=2)).toBe(true)
        const box=bounds(panel),center=box.getCenter(new THREE.Vector3())
        for(let i=0;i<31;i++) {
          const x=box.min.x+box.getSize(new THREE.Vector3()).x*(i+.5)/31
          for(const y of [box.min.y+.001,center.y,box.max.y-.001]) {
            const front=new THREE.Raycaster(new THREE.Vector3(x,y,box.max.z+.01),new THREE.Vector3(0,0,-1)).intersectObject(panel,true)[0]
            const back=new THREE.Raycaster(new THREE.Vector3(x,y,box.min.z-.01),new THREE.Vector3(0,0,1)).intersectObject(panel,true)[0]
            expect(front).toBeDefined();expect(back).toBeDefined()
            const depth=front.point.z-back.point.z
            expect(depth).toBeGreaterThanOrEqual(.0162-1e-6);expect(depth).toBeLessThanOrEqual(.018+1e-6)
          }
        }
      }
    }
  },30000)

  it('places hinge axes on the rear plane and clears carcass panels every 5 degrees at all extreme aspect ratios',async()=>{
    const root=await load(),controller=createFurnitureController(root,definition),motion=createFurnitureMotion(root,definition,controller.getDimensions,()=>{})
    const initial=snapshot(root)
    try {
      for(const d of [base,max,{...max,depth:min.depth},{...min,depth:max.depth},middle,base]) {
        motion.withClosedPose(()=>controller.setDimensions(d));motion.setAll(false,true)
        const fixed=panels(find(root,'Carcass_Assembly')).map(p=>new OBB().fromBox3(bounds(p)))
        for(const articulation of definition.articulations!) {
          if(articulation.kind!=='door')continue
          const hinge=find(root,articulation.target),panel=hinge.children.find(n=>n.name.endsWith('_Panel'))!
          const closed=bounds(panel);close(hinge.getWorldPosition(new THREE.Vector3()).z,closed.min.z)
          const inverse=hinge.matrixWorld.clone().invert()
          for(let degrees=0;degrees<=Math.abs(articulation.angle);degrees+=5) {
            hinge.rotation.y=THREE.MathUtils.degToRad(degrees*Math.sign(articulation.angle));root.updateMatrixWorld(true)
            const obb=new OBB().fromBox3(closed).applyMatrix4(hinge.matrixWorld.clone().multiply(inverse));obb.halfSize.addScalar(-.0001)
            for(const panel of fixed)expect(obb.intersectsOBB(panel),`${hinge.name} collision at ${degrees} degrees, ${JSON.stringify(d)}`).toBe(false)
          }
          hinge.rotation.y=0
        }
        motion.setAll(true);motion.update(.24)
        for(const s of definition.articulations!)if(s.kind==='door')close(find(root,s.target).rotation.y,THREE.MathUtils.degToRad(s.angle*.5))
        motion.update(.24)
      }
      motion.setAll(false,true);motion.withClosedPose(()=>controller.setDimensions(base));expect(snapshot(root)).toEqual(initial)
    } finally { motion.dispose() }
  },30000)

  it('keeps finish groups independent, preserves open pose during replacement and disables hidden doors',async()=>{
    const root=await load(),controller=createFurnitureController(root,definition),motion=createFurnitureMotion(root,definition,controller.getDimensions,()=>{})
    const mc=createFurnitureMaterialController(root,definition,{onMaterialsChanged:()=>motion.withClosedPose(controller.refreshTextures)})
    try {
      await mc.setFinishes(mc.getSelections());motion.setAll(true,true)
      const fixed=collect(root,o=>o instanceof THREE.Mesh&&MATERIAL_TARGETS.fixed.includes(meshMaterial(o).name as never)).map(o=>[o,meshMaterial(o)] as const)
      await mc.setFinish('fronts','board-white-matte')
      for(const o of collect(root,o=>o instanceof THREE.Mesh)) {
        const m=meshMaterial(o)
        if(MATERIAL_TARGETS.carcass.includes(m.name as never))expect(m.userData.finishId).toBe('board-graphite-matte')
        if(MATERIAL_TARGETS.fronts.includes(m.name as never))expect(m.userData.finishId).toBe('board-white-matte')
      }
      for(const [o,m] of fixed)expect(meshMaterial(o)).toBe(m)
      for(const s of definition.articulations!)if(s.kind==='door')close(find(root,s.target).quaternion.angleTo(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),THREE.MathUtils.degToRad(s.angle))),0)
      for(const name of definition.interiorView!.hiddenNodes)find(root,name).visible=false
      motion.syncVisibility();expect(motion.getStates().every(s=>!s.enabled&&!s.open)).toBe(true)
      for(const name of definition.interiorView!.hiddenNodes)find(root,name).visible=true
      motion.syncVisibility();expect(motion.getStates().every(s=>s.enabled&&!s.open)).toBe(true)
    } finally { mc.dispose();motion.dispose() }
  })
})

it('preserves metric UV and phase from actual front cross-section arclength, including caps and finish changes',async()=>{
  const root=await load(),controller=createFurnitureController(root,definition)
  const mc=createFurnitureMaterialController(root,definition,{onMaterialsChanged:controller.refreshTextures})
  const check=()=>{
    root.updateMatrixWorld(true)
    let checked=0,maxError=0
    for(const panel of facets(root)) {
      const fronts=collect(panel,o=>o instanceof THREE.Mesh&&o.userData.role==='fluted-front') as THREE.Mesh[]
      const profile=new Map<string,THREE.Vector3>()
      for(const mesh of fronts) {
        const p=mesh.geometry.getAttribute('position')
        for(let i=0;i<p.count;i++){const q=panel.worldToLocal(mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i)));profile.set(q.x.toFixed(7),q)}
      }
      const ordered=[...profile.values()].sort((a,b)=>a.x-b.x),arc=new Map<string,number>();let length=0
      for(let i=0;i<ordered.length;i++){if(i)length+=Math.hypot(ordered[i].x-ordered[i-1].x,ordered[i].z-ordered[i-1].z);arc.set(ordered[i].x.toFixed(7),.5+ordered[0].x+length)}
      for(const mesh of collect(panel,o=>o instanceof THREE.Mesh) as THREE.Mesh[]) {
        const m=meshMaterial(mesh),p=mesh.geometry.getAttribute('position'),uv=mesh.geometry.getAttribute('uv'),texture=m.map!
        expect(texture).toBeTruthy()
        for(const other of [m.normalMap!,m.roughnessMap!]){expect(other.repeat.toArray()).toEqual(texture.repeat.toArray());expect(other.offset.toArray()).toEqual(texture.offset.toArray())}
        for(let i=0;i<p.count;i++) {
          const q=panel.worldToLocal(mesh.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i)))
          const role=contract.profileUVContract[m.name].role
          const expected=role==='fluted-front'?[arc.get(q.x.toFixed(7))!,.5+q.y]:role==='fluted-cap'?[.5+q.x,.5+q.z]:role==='fluted-side'?[.5+q.z,.5+q.y]:[.5+q.x,.5+q.y]
          const actual=[uv.getX(i)*texture.repeat.x+texture.offset.x,uv.getY(i)*texture.repeat.y+texture.offset.y]
          expected.forEach((value,index)=>{maxError=Math.max(maxError,Math.abs(value-actual[index]));checked++})
        }
      }
    }
    // The previously validated rounded-board mapping is checked independently too.
    root.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return
      const m=meshMaterial(o),info=contract.uvContract[m.name];if(!info)return
      let panel:THREE.Object3D|null=o;while(panel&&panel.userData.kind!=='board')panel=panel.parent
      const bevel=panel!.userData.bevelRadius,p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal'),uv=o.geometry.getAttribute('uv')
      for(let i=0;i<p.count;i++) {
        const q=panel!.worldToLocal(o.localToWorld(new THREE.Vector3().fromBufferAttribute(p,i))),normal=new THREE.Vector3().fromBufferAttribute(n,i)
        for(const [key,component] of [['u','x'],['v','y']] as const) {
          const axis=info.bindings[key].axis as 'x'|'y'|'z',plane=info.surfacePlane as 'x'|'y'|'z'
          const expected=.5+q[axis]-bevel*normal[axis]+bevel*Math.atan2(normal[axis],Math.abs(normal[plane]))
          const actual=(key==='u'?uv.getX(i):uv.getY(i))*m.map!.repeat[component]+m.map!.offset[component]
          maxError=Math.max(maxError,Math.abs(expected-actual));checked++
        }
      }
    })
    expect(checked).toBeGreaterThan(10000);expect(maxError).toBeLessThan(1e-6)
  }
  const uvState=()=>Object.fromEntries(collect(root,o=>o instanceof THREE.Mesh&&!!meshMaterial(o).map).map(o=>{const m=meshMaterial(o);return [m.name,[...m.map!.repeat.toArray(),...m.map!.offset.toArray()]]}))
  try {
    await mc.setFinishes({carcass:'oak-natural',fronts:'oak-grey',hardware:'metal-black-matte'});const initial=uvState()
    for(const values of [base,middle,max,{...max,depth:min.depth},base]) {
      controller.setDimensions(values);check();const before=uvState()
      await mc.setFinish('fronts','board-white-matte');await mc.setFinish('fronts','oak-silver');check()
      controller.refreshTextures();controller.refreshTextures();expect(uvState()).toEqual(before)
    }
    expect(uvState()).toEqual(initial)
  } finally { mc.dispose() }
},30000)
