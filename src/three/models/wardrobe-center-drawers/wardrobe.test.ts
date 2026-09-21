/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../furniture/furnitureController'
import { createFurnitureMaterialController } from '../../materials/materialController'
import { disposeMaterialFinishCache } from '../../materials/createMaterial'
import { getMaterialFinish } from '../../materials/materialRegistry'
import { WARDROBE_07_CONFIG as config, BOARD_MATERIAL_TARGETS, createMaterialReviewDefinition } from './config'

const IS_DRAWERS = true
type Size = { width:number; height:number; depth:number }
const base:Size={width:config.dimensions.width.base,height:config.dimensions.height.base,depth:config.dimensions.depth.base}
const EPS=1e-6
afterEach(()=>{disposeMaterialFinishCache();vi.unstubAllGlobals()})

class ImageStub {
  width=1; height=1; complete=true
  private listeners=new Map<string,Set<EventListenerOrEventListenerObject>>()
  addEventListener(type:string,listener:EventListenerOrEventListenerObject){const listeners=this.listeners.get(type)??new Set();listeners.add(listener);this.listeners.set(type,listeners)}
  removeEventListener(type:string,listener:EventListenerOrEventListenerObject){this.listeners.get(type)?.delete(listener)}
  set src(_value:string){queueMicrotask(()=>this.listeners.get('load')?.forEach(listener=>{const event=new Event('load');if(typeof listener==='function')listener(event);else listener.handleEvent(event)}))}
}
async function load() {
  vi.stubGlobal('self',globalThis);vi.stubGlobal('document',{createElementNS:()=>new ImageStub()})
  const bytes=await readFile(`public${config.modelUrl}`)
  return (await new GLTFLoader().parseAsync(Uint8Array.from(bytes).buffer,'')).scene
}
function required(root:THREE.Object3D,name:string) {
  const node=root.getObjectByName(name);if(!node)throw new Error(`Missing ${name}`);return node
}
function bounds(node:THREE.Object3D){node.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(node,true)}
function box(root:THREE.Object3D,name:string){return bounds(required(root,name))}
function close(a:number,b:number){expect(Math.abs(a-b)).toBeLessThan(EPS)}
function capture(root:THREE.Object3D){const result:Record<string,number[]>={};root.traverse(o=>{result[o.name]=[...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]});return result}
function boards(root:THREE.Object3D){const result:THREE.Object3D[]=[];root.traverse(o=>{if(o.userData.kind==='board')result.push(o)});return result}
function materials(root:THREE.Object3D){const result=new Map<string,THREE.MeshStandardMaterial>();root.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial)result.set(m.name,m)});return result}

function shape(root:THREE.Object3D,dimensions:Size) {
  const {width:W,height:H,depth:D}=dimensions,t=.016
  const entire=bounds(root),size=entire.getSize(new THREE.Vector3())
  close(size.x,W);close(size.y,H);close(size.z,D)
  close(entire.min.y,0);close(entire.min.x,-W/2);close(entire.max.x,W/2)
  close(entire.min.z,-D/2);close(entire.max.z,D/2)
  const left=box(root,'Panel_Side_Left'),right=box(root,'Panel_Side_Right')
  const dl=box(root,'Panel_Divider_Left'),dr=box(root,'Panel_Divider_Right')
  const top=box(root,'Panel_Top'),bottom=box(root,'Panel_Bottom'),back=box(root,'Panel_Back')
  close(left.max.x-left.min.x,t);close(right.max.x-right.min.x,t)
  close(dl.max.x-dl.min.x,t);close(dr.max.x-dr.min.x,t)
  close(dl.getCenter(new THREE.Vector3()).x,-W/4);close(dr.getCenter(new THREE.Vector3()).x,W/4)
  close(dl.min.x-left.max.x,W/4-1.5*t);close(dr.min.x-dl.max.x,W/2-t)
  close(top.max.y,H);close(top.min.y,left.max.y);close(top.min.y,right.max.y)
  close(bottom.min.y,.060);close(bottom.max.y,dl.min.y);close(bottom.max.y,dr.min.y)
  close(bottom.min.x,left.max.x);close(bottom.max.x,right.min.x)
  close(back.max.z,left.min.z);close(back.max.z,top.min.z)
  for(const panel of boards(root)) {
    const axis=panel.userData.thicknessAxis as 'x'|'y'|'z'
    close(bounds(panel).getSize(new THREE.Vector3())[axis],panel.userData.thickness as number)
  }
  const panelNames=['Outer_Left','Center_Left','Center_Right','Outer_Right'].map(k=>`Door_${k}_Panel`)
  const doorBoxes=panelNames.map(n=>box(root,n))
  for(let i=0;i<3;i++)close(doorBoxes[i+1].min.x-doorBoxes[i].max.x,.003)
  for(const db of doorBoxes){close(db.max.y,H-.003);close(db.max.z-db.min.z,t)}
  for(const shelf of boards(root).filter(o=>o.name.startsWith('Shelf_'))) {
    const sb=bounds(shelf),isLeft=shelf.name.includes('_Left_'),isRight=shelf.name.includes('_Right_')
    const minX=isLeft?left.max.x:isRight?dr.max.x:dl.max.x,maxX=isLeft?dl.min.x:isRight?right.min.x:dr.min.x
    close(sb.min.x,minX+.0005);close(sb.max.x,maxX-.0005)
    close(sb.min.z,left.min.z+.008);close(sb.max.z,left.max.z-.008)
  }
  if(IS_DRAWERS) {
    close(box(root,'Panel_Drawer_Separator').max.y,.760)
    for(let i=1;i<=3;i++) {
      const prefix=`Drawer_${String(i).padStart(2,'0')}`
      const front=box(root,prefix+'_Front'),leftSide=box(root,prefix+'_Side_Left'),rightSide=box(root,prefix+'_Side_Right')
      close(front.getSize(new THREE.Vector3()).y,(.745-.063-.030)/3)
      close(leftSide.min.x-dl.max.x,.013);close(dr.min.x-rightSide.max.x,.013)
      close(leftSide.min.y,box(root,prefix+'_Bottom').max.y)
      close(box(root,prefix+'_Back').min.x,leftSide.max.x)
      close(box(root,prefix+'_Back').max.x,rightSide.min.x)
      if(i<3)close(box(root,`Drawer_${String(i+1).padStart(2,'0')}_Front`).min.y-front.max.y,.015)
    }
  } else {
    for(const key of ['Outer_Left','Center_Left','Center_Right','Outer_Right']) {
      const handle=box(root,`Handle_${key}_Bar`).getSize(new THREE.Vector3())
      close(handle.x,.012);close(handle.y,1);close(handle.z,.012)
      close(box(root,`Handle_${key}_Assembly`).max.z-box(root,`Door_${key}_Panel`).max.z,.028)
    }
  }
  // Плиты не должны проникать друг в друга: контакт допускается по границе.
  const panels=boards(root).map(o=>({name:o.name,b:bounds(o)}))
  for(let i=0;i<panels.length;i++)for(let j=i+1;j<panels.length;j++) {
    const a=panels[i],b=panels[j],overlap=['x','y','z'].map(axis=>Math.min(a.b.max[axis as 'x'],b.b.max[axis as 'x'])-Math.max(a.b.min[axis as 'x'],b.b.min[axis as 'x']))
    expect(overlap.every(v=>v>EPS),`${a.name} intersects ${b.name}`).toBe(false)
  }
}

describe(config.id,()=>{
  it('loads the actual GLB with unique nodes, complete targets, correct topology and base dimensions',async()=>{
    const root=await load(),names:string[]=[]
    root.traverse(o=>names.push(o.name))
    expect(new Set(names).size).toBe(names.length)
    for(const rule of config.resizeRules) {
      const names='target' in rule?[rule.target]:rule.targets.map(t=>t.target)
      for(const n of names)expect(required(root,n)).toBeDefined()
    }
    const mats=materials(root),targets=[...BOARD_MATERIAL_TARGETS.carcass,...BOARD_MATERIAL_TARGETS.fronts,...config.materialSlots.hardware.targets]
    expect(new Set(targets).size).toBe(targets.length)
    expect([...mats.keys()].sort()).toEqual([...targets].sort())
    for(const id of config.materialSlots.hardware.allowedFinishes)expect(getMaterialFinish(id).id).toBe(id)
    expect(Object.keys(config.materialSlots)).toEqual(['hardware'])
    root.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return
      const p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal'),index=o.geometry.index!
      const material=o.material as THREE.MeshStandardMaterial
      if(material.name!=='Hardware_Metal') {
        expect(o.geometry.getAttribute('uv')).toBeDefined();expect(o.geometry.getAttribute('tangent')).toBeDefined();expect(material.metalness).toBe(0)
      }
      for(let i=0;i<index.count;i+=3) {
        const indices=[index.getX(i),index.getX(i+1),index.getX(i+2)]
        const [a,b,c]=indices.map(j=>new THREE.Vector3().fromBufferAttribute(p,j))
        const cross=b.sub(a).cross(c.sub(a)), normal=indices.map(j=>new THREE.Vector3().fromBufferAttribute(n,j)).reduce((s,v)=>s.add(v),new THREE.Vector3())
        expect(cross.length()).toBeGreaterThan(1e-13);expect(cross.dot(normal)).toBeGreaterThan(0)
      }
    })
    expect(boards(root).filter(o=>o.name.startsWith('Shelf_')).length).toBe(IS_DRAWERS?4:9)
    // В 07 две центральные полки + две боковые; разделительная панель считается отдельно.
    shape(root,base)
  },30000)

  it('preserves all dimensions, panel thicknesses, gaps, joints and floor contact over individual and combined limits',async()=>{
    const root=await load(),controller=createFurnitureController(root,config)
    const initial=capture(root),cases:Size[]=[base]
    for(const width of [1.4,1.7,2])for(const height of [1.9,2.15,2.4])for(const depth of [.4,.525,.65])cases.push({width,height,depth})
    for(const key of ['width','height','depth'] as const)for(const value of [config.dimensions[key].min,config.dimensions[key].max])cases.push({...base,[key]:value})
    for(const dimensions of cases){controller.setDimensions(dimensions);shape(root,dimensions)}
    controller.setDimensions(base)
    expect(controller.getDimensions()).toEqual(base);expect(capture(root)).toEqual(initial)
  },30000)

  it('preserves bevels and hardware cross sections; no fixed handle is nested in a scaled door',async()=>{
    const root=await load(),controller=createFurnitureController(root,config)
    const hardware=new Map<string,THREE.Vector3>()
    root.traverse(o=>{if(o.userData.kind==='hardware')hardware.set(o.name,bounds(o).getSize(new THREE.Vector3()))})
    for(const d of [{width:2,height:2.4,depth:.65},{width:1.4,height:1.9,depth:.4},base]) {
      controller.setDimensions(d)
      root.traverse(o=>{
        if(o.userData.kind==='board-segment') {
          const zones=o.userData.zones as number[],parent=o.parent!,thin=parent.userData.thicknessAxis as 'x'|'y'|'z'
          close(o.scale[thin],1)
          for(let a=0;a<3;a++)if(zones[a]!==0)close(o.scale[['x','y','z'][a] as 'x'],1)
        }
        if(o.userData.kind!=='hardware')return
        const b=hardware.get(o.name)!,s=bounds(o).getSize(new THREE.Vector3())
        if(o.userData.fitting==='clothes-rail'){close(s.y,b.y);close(s.z,b.z)}
        else if(o.userData.fitting==='drawer-slide'){close(s.x,b.x);close(s.y,b.y)}
        else {close(s.x,b.x);close(s.y,b.y);close(s.z,b.z)}
      })
      for(const key of ['Outer_Left','Center_Left','Center_Right','Outer_Right']) {
        const pivot=required(root,`Door_${key}_Hinge`)
        expect(pivot.scale.toArray()).toEqual([1,1,1]);expect(pivot.userData.axis).toBe('Y')
        const handle=root.getObjectByName(`Handle_${key}_Assembly`)
        if(handle)expect(handle.parent).toBe(pivot)
      }
    }
  },30000)

  it('provides useful hinge and drawer pivots without adding unsupported interaction to runtime',async()=>{
    const root=await load(),controller=createFurnitureController(root,config),original=capture(root)
    controller.setDimensions({width:2,height:2.4,depth:.65})
    for(const key of ['Outer_Left','Center_Left','Center_Right','Outer_Right']) {
      const hinge=required(root,`Door_${key}_Hinge`),origin=hinge.getWorldPosition(new THREE.Vector3())
      hinge.rotation.y=THREE.MathUtils.degToRad(hinge.userData.openAngleDegrees as number)
      root.updateMatrixWorld(true)
      expect(hinge.getWorldPosition(new THREE.Vector3()).distanceTo(origin)).toBeLessThan(EPS)
      hinge.rotation.y=0
    }
    for(let i=1;i<=3;i++)if(IS_DRAWERS) {
      const drawer=required(root,`Drawer_${String(i).padStart(2,'0')}_Assembly`),before=bounds(drawer),z=drawer.position.z
      drawer.position.z=z+.18;root.updateMatrixWorld(true)
      const after=bounds(drawer);close(after.min.z-before.min.z,.18);close(after.min.y,before.min.y)
      drawer.position.z=z
    }
    controller.setDimensions(base);expect(capture(root)).toEqual(original)
  })

  it('replaces carcass, fronts and hardware independently using registered finishes in material-review mode',async()=>{
    const root=await load(),review=createMaterialReviewDefinition('oak-natural','walnut-natural',['oak-natural','walnut-natural','oak-grey'])
    const controller=createFurnitureController(root,review),mc=createFurnitureMaterialController(root,review,{onMaterialsChanged:controller.refreshTextures})
    await mc.setFinishes(mc.getSelections());controller.setDimensions({width:2,height:2.4,depth:.65})
    const before=materials(root)
    await mc.setFinish('fronts','oak-grey')
    for(const name of BOARD_MATERIAL_TARGETS.carcass)expect(materials(root).get(name)).toBe(before.get(name))
    for(const name of BOARD_MATERIAL_TARGETS.fronts)expect(materials(root).get(name)!.userData.finishId).toBe('oak-grey')
    const boardsBefore=materials(root)
    await mc.setFinish('hardware','metal-white-matte')
    for(const name of [...BOARD_MATERIAL_TARGETS.carcass,...BOARD_MATERIAL_TARGETS.fronts])expect(materials(root).get(name)).toBe(boardsBefore.get(name))
    expect(materials(root).get('Hardware_Metal')!.userData.finishId).toBe('metal-white-matte')
    await mc.setFinish('carcass','walnut-natural')
    for(const name of BOARD_MATERIAL_TARGETS.fronts)expect(materials(root).get(name)).toBe(boardsBefore.get(name))
    controller.setDimensions(base);shape(root,base);mc.dispose()
  },30000)

  it('has metre-based UVs on broad flat faces at base and leaves pending UV work explicit',async()=>{
    const root=await load();let checked=0
    root.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return
      const tile=o.userData.kind==='board-segment'?o:o.parent
      if(tile?.userData.kind!=='board-segment')return
      const m=o.material as THREE.MeshStandardMaterial,p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv'),n=o.geometry.getAttribute('normal')
      if(!uv||!m.name.endsWith('_Z')||tile.userData.zones.some((z:number)=>z!==0))return
      const panel=tile.parent!
      if(panel.userData.thicknessAxis!=='z')return
      let start=-1
      for(let i=0;i<p.count;i++)if(Math.abs(n.getZ(i))>.99999) {
        if(start<0){start=i;continue}
        close(uv.getX(i)-uv.getX(start),p.getX(i)-p.getX(start))
        close(uv.getY(i)-uv.getY(start),p.getY(i)-p.getY(start));checked++
      }
    })
    expect(checked).toBeGreaterThan(10)
    expect(config.textureAxes).toEqual({})
    expect(required(root,`Wardrobe_${String(7).padStart(2,'0')}_Root`).userData.runtimeCompatibility).toContain('material-and-UV-integration-pending')
  })
})
