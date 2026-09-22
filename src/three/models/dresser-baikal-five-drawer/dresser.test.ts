/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../furniture/furnitureController'
import { createFurnitureMaterialController } from '../../materials/materialController'
import { disposeMaterialFinishCache } from '../../materials/createMaterial'
import { getMaterialFinish } from '../../materials/materialRegistry'
import { DRESSER_14_CONFIG as config, MATERIAL_TARGETS, createMaterialReviewDefinition } from './config'

type Size = {width:number;height:number;depth:number}
type Axis = 'x'|'y'|'z'
type DrawerRecord = { name:string; front:string; column:number; row:number; boxDepth:number }
const keys=['width','height','depth'] as const, axes=['x','y','z'] as const
// Independent transcription of screenshot dimensions and visible component counts.
const base:Size={"width": 0.402, "height": 1.03, "depth": 0.331}
const expected={drawers:5,doors:0,shelves:0}
const EPS=1e-6
const spec=JSON.parse(await readFile(`assets/source/${config.id}/model-spec.json`,'utf8'))
const contract=JSON.parse(await readFile(`assets/source/${config.id}/model-contract.json`,'utf8'))
const limits=(which:'min'|'max'):Size=>Object.fromEntries(keys.map(k=>[k,config.dimensions[k][which]])) as Size
const mid:Size=Object.fromEntries(keys.map(k=>[k,(config.dimensions[k].min+config.dimensions[k].max)/2])) as Size
class ImageStub {
  width=1;height=1;complete=true
  listeners=new Map<string,Set<EventListenerOrEventListenerObject>>()
  addEventListener(t:string,l:EventListenerOrEventListenerObject){const s=this.listeners.get(t)??new Set();s.add(l);this.listeners.set(t,s)}
  removeEventListener(t:string,l:EventListenerOrEventListenerObject){this.listeners.get(t)?.delete(l)}
  set src(_v:string){queueMicrotask(()=>this.listeners.get('load')?.forEach(l=>{const e=new Event('load');if(typeof l==='function')l(e);else l.handleEvent(e)}))}
}
afterEach(()=>{disposeMaterialFinishCache();vi.unstubAllGlobals()})
async function load(){vi.stubGlobal('self',globalThis);vi.stubGlobal('document',{createElementNS:()=>new ImageStub()});return(await new GLTFLoader().parseAsync(Uint8Array.from(await readFile(`public${config.modelUrl}`)).buffer,'')).scene}
function required(root:THREE.Object3D,name:string){const n=root.getObjectByName(name);if(!n)throw new Error(`Missing ${name}`);return n}
function bounds(n:THREE.Object3D){n.updateWorldMatrix(true,true);return new THREE.Box3().setFromObject(n,true)}
function box(root:THREE.Object3D,name:string){return bounds(required(root,name))}
function size(root:THREE.Object3D,name:string){return box(root,name).getSize(new THREE.Vector3())}
function close(a:number,b:number){expect(Math.abs(a-b),`${a} != ${b}`).toBeLessThan(EPS)}
function closeSize(s:THREE.Vector3,e:number[]){s.toArray().forEach((v,i)=>close(v,e[i]))}
function nodes(root:THREE.Object3D,kind:string){const a:THREE.Object3D[]=[];root.traverse(o=>{if(o.userData.kind===kind)a.push(o)});return a}
function snapshot(root:THREE.Object3D){const out:Record<string,number[]>={};root.traverse(o=>{out[o.name]=[...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]});return out}
function materials(root:THREE.Object3D){const out=new Map<string,THREE.MeshStandardMaterial>();root.traverse(o=>{if(o instanceof THREE.Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof THREE.MeshStandardMaterial)out.set(m.name,m)});return out}
function shape(root:THREE.Object3D,d:Size){
  const all=bounds(root),left=box(root,'Panel_Side_Left'),right=box(root,'Panel_Side_Right'),top=box(root,'Panel_Top'),bottom=box(root,'Panel_Bottom')
  closeSize(all.getSize(new THREE.Vector3()),[d.width,d.height,d.depth]);close(all.min.y,0);close(all.min.x,-d.width/2);close(all.min.z,-d.depth/2)
  close(top.max.y,d.height);close(top.min.y,left.max.y);close(left.min.x-top.min.x,spec.overhang);close(top.max.x-right.max.x,spec.overhang)
  close(bottom.min.x,left.max.x);close(bottom.max.x,right.min.x)
  closeSize(size(root,'Panel_Side_Left'),[.016,d.height-.016-spec.foot,d.depth-spec.projection-.020])
  const boardBoxes=nodes(root,'board').map(n=>({name:n.name,box:bounds(n),node:n}))
  for(const a of boardBoxes)close(a.box.getSize(new THREE.Vector3())[a.node.userData.thicknessAxis as Axis],a.node.userData.thickness)
  for(let i=0;i<boardBoxes.length;i++)for(let j=i+1;j<boardBoxes.length;j++){
    const a=boardBoxes[i],b=boardBoxes[j]
    expect(axes.every(k=>Math.min(a.box.max[k],b.box.max[k])-Math.max(a.box.min[k],b.box.min[k])>EPS),`${a.name} overlaps ${b.name}`).toBe(false)
  }
  for(const bay of contract.bays){
    const drawers=(contract.drawers as DrawerRecord[]).filter(r=>r.column===bay.index).sort((a,b)=>a.row-b.row)
    for(let i=1;i<drawers.length;i++)close(box(root,drawers[i].front).min.y-box(root,drawers[i-1].front).max.y,spec.frontGap)
    for(const r of drawers){
      const prefix=r.name.replace('_Assembly',''),front=box(root,r.front),floor=box(root,prefix+'_Bottom')
      close(front.min.z-left.max.z,.004);close(front.getSize(new THREE.Vector3()).z,.016)
      close(floor.min.y-front.min.y,.020);close(floor.getSize(new THREE.Vector3()).y,.006)
      // Facade-to-box contact is zero; runner side clearances remain independent.
      close(floor.max.z,front.min.z)
      const bayLeft=bay.min+bay.lf*(d.width-base.width),bayRight=bay.max+bay.rf*(d.width-base.width)
      close(floor.min.x-bayLeft,.013);close(bayRight-floor.max.x,.013)
    }
  }
  for(const door of contract.doors){const f=box(root,door.front);close(f.max.y,d.height-.019);close(f.min.y,contract.constants.faceBottom);close(f.getSize(new THREE.Vector3()).z,.016)}
}

describe(config.id,()=>{
  it('loads the production GLB with unique targets, valid triangles, UVs and screenshot component counts',async()=>{
    const root=await load(),names:string[]=[];root.traverse(o=>names.push(o.name));expect(new Set(names).size).toBe(names.length)
    for(const r of config.resizeRules)for(const name of 'target'in r?[r.target]:r.targets.map(t=>t.target))required(root,name)
    const targets=Object.values(MATERIAL_TARGETS).flat();expect(new Set(targets).size).toBe(targets.length);expect([...materials(root).keys()].sort()).toEqual([...targets].sort())
    for(const slot of Object.values(config.materialSlots))for(const id of (slot as {allowedFinishes:readonly string[]}).allowedFinishes)expect(getMaterialFinish(id).id).toBe(id)
    root.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return
      const p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal'),idx=o.geometry.index!,m=o.material as THREE.MeshStandardMaterial
      if(m.userData.materialSlot==='carcass'||m.userData.materialSlot==='fronts'){expect(m.metalness).toBe(0);expect(o.geometry.getAttribute('uv')).toBeDefined();expect(o.geometry.getAttribute('tangent')).toBeDefined()}
      for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],v=ids.map(j=>new THREE.Vector3().fromBufferAttribute(p,j)),cross=v[1].sub(v[0]).cross(v[2].sub(v[0])),normal=ids.map(j=>new THREE.Vector3().fromBufferAttribute(n,j)).reduce((s,v)=>s.add(v),new THREE.Vector3());expect(cross.length()).toBeGreaterThan(1e-13);expect(cross.dot(normal)).toBeGreaterThan(0)}
    })
    expect(nodes(root,'drawer')).toHaveLength(expected.drawers);expect(nodes(root,'door-pivot')).toHaveLength(expected.doors)
    expect(nodes(root,'board').filter(o=>o.name.startsWith('Shelf_'))).toHaveLength(expected.shelves)
    expect(nodes(root,'hardware').filter(o=>o.userData.fitting==='slide-fixed')).toHaveLength(expected.drawers*2)
    keys.forEach(k=>close(config.dimensions[k].base,base[k]));shape(root,base)
  },30000)

  it('preserves overall dimensions, joints, panel thicknesses and drawer clearances in 34 cases, 1 mm steps and return',async()=>{
    const root=await load(),controller=createFurnitureController(root,config),initial=snapshot(root),cases:Size[]=[base]
    for(const width of [limits('min').width,mid.width,limits('max').width])for(const height of [limits('min').height,mid.height,limits('max').height])for(const depth of [limits('min').depth,mid.depth,limits('max').depth])cases.push({width,height,depth})
    for(const k of keys)for(const value of [config.dimensions[k].min,config.dimensions[k].max])cases.push({...base,[k]:value})
    expect(cases).toHaveLength(34)
    for(const d of cases){controller.setDimensions(d);shape(root,d)}
    for(const k of keys){const d={...base,[k]:base[k]+.001};controller.setDimensions(d);shape(root,d)}
    controller.setDimensions(base);expect(snapshot(root)).toEqual(initial)
  },30000)

  it('keeps handles, hinges, bevels and decorative profiles fixed while only slide length follows depth',async()=>{
    const root=await load(),controller=createFurnitureController(root,config),fixed=new Map(nodes(root,'hardware').map(n=>[n.name,bounds(n).getSize(new THREE.Vector3())]))
    for(const d of [limits('min'),limits('max'),base]){
      controller.setDimensions(d)
      for(const tile of nodes(root,'board-segment')){close(tile.scale[tile.parent!.userData.thicknessAxis as Axis],1);for(const [i,zone]of(tile.userData.zones as number[]).entries())if(zone!==0)close(tile.scale[axes[i]],1)}
      for(const n of nodes(root,'hardware')){const s=bounds(n).getSize(new THREE.Vector3()),b=fixed.get(n.name)!;for(const a of axes)close(s[a],b[a]+(a==='z'&&n.userData.fitting?.startsWith('slide-')?d.depth-base.depth:0))}
      const ribs=nodes(root,'decoration').filter(n=>n.userData.decoration==='flute'),corners=nodes(root,'decoration').filter(n=>n.userData.decoration==='diagonal-grooves')
      expect(ribs).toHaveLength(spec.kind==='marvel'?52:0);expect(corners).toHaveLength(spec.kind==='baikal'?2:0)
      for(const n of ribs){const s=bounds(n).getSize(new THREE.Vector3());close(s.x,.008);close(s.z,.002);close(n.scale.x,1);close(n.scale.z,1)}
      for(const n of corners){const s=bounds(n).getSize(new THREE.Vector3());close(s.x,.144);close(s.y,.144);expect(n.scale.toArray()).toEqual([1,1,1])}
      if(spec.kind==='baikal'){
        const front=required(root,'Drawer_05_Front'),left=box(root,'Drawer_05_Front_Corner_Left'),right=box(root,'Drawer_05_Front_Corner_Right'),middle=box(root,'Drawer_05_Front_Lower_Center'),upper=box(root,'Drawer_05_Front_Upper')
        close(left.max.x,middle.min.x);close(middle.max.x,right.min.x);close(left.max.y,upper.min.y);close(bounds(front).max.y,upper.max.y)
      }
    }
  },30000)

  it('supports separate technical drawer translation and outward door poses at min, base and max',async()=>{
    const root=await load(),controller=createFurnitureController(root,config)
    for(const d of [limits('min'),base,limits('max')]){
      controller.setDimensions(d)
      for(const r of contract.drawers){const n=required(root,r.name),p=n.position.clone(),before=box(root,r.front),other=snapshot(root),travel=Math.min(.18,(r.boxDepth+d.depth-base.depth)*.55);expect(n.userData.interactiveAnimation).toBe(false);n.position.z+=travel;const after=box(root,r.front);close(after.min.z-before.min.z,travel);closeSize(after.getSize(new THREE.Vector3()),before.getSize(new THREE.Vector3()).toArray());close(after.min.y,before.min.y);n.position.copy(p);expect(snapshot(root)).toEqual(other)}
      for(const r of contract.doors){
        const pivot=required(root,r.name),origin=pivot.getWorldPosition(new THREE.Vector3()),closed=box(root,r.front)
        close(origin.z,closed.min.z);expect(pivot.userData.interactiveAnimation).toBe(false)
        // The outer corner can pass behind the front plane while outside the side panel.
        // Swept volume/carcass collisions are checked in furnitureJoints.test.ts.
        for(const deg of [0,15,45,90,105]){
          pivot.rotation.y=Math.sign(r.angle)*THREE.MathUtils.degToRad(deg);root.updateMatrixWorld(true)
          expect(pivot.getWorldPosition(new THREE.Vector3()).distanceTo(origin)).toBeLessThan(EPS)
          expect(box(root,r.front).getCenter(new THREE.Vector3()).z+EPS).toBeGreaterThanOrEqual(closed.getCenter(new THREE.Vector3()).z)
        }
        pivot.rotation.y=0
      }
    }
    controller.setDimensions(base);shape(root,base)
  },30000)

  it('changes carcass, fronts and exposed handles independently without recolouring internal mechanisms',async()=>{
    const root=await load(),original=materials(root),review=createMaterialReviewDefinition('oak-natural','walnut-natural',['oak-natural','walnut-natural','oak-grey']),controller=createFurnitureController(root,review),mc=createFurnitureMaterialController(root,review,{onMaterialsChanged:controller.refreshTextures})
    await mc.setFinishes(mc.getSelections());controller.setDimensions(limits('max'))
    const before=materials(root);await mc.setFinish('fronts','oak-grey')
    for(const name of MATERIAL_TARGETS.carcass)expect(materials(root).get(name)).toBe(before.get(name))
    for(const name of MATERIAL_TARGETS.fronts)expect(materials(root).get(name)!.userData.finishId).toBe('oak-grey')
    const boards=materials(root)
    if(MATERIAL_TARGETS.hardware.length){await mc.setFinish('hardware','metal-white-matte');for(const name of [...MATERIAL_TARGETS.carcass,...MATERIAL_TARGETS.fronts])expect(materials(root).get(name)).toBe(boards.get(name));for(const name of MATERIAL_TARGETS.hardware)expect(materials(root).get(name)!.userData.finishId).toBe('metal-white-matte')}
    await mc.setFinish('carcass','walnut-natural')
    for(const name of MATERIAL_TARGETS.fronts)expect(materials(root).get(name)).toBe(boards.get(name))
    for(const name of MATERIAL_TARGETS.fixed)expect(materials(root).get(name)).toBe(original.get(name))
    controller.setDimensions(base);shape(root,base);mc.dispose()
  },30000)

  it('provides metre-based base UVs and complete pending affine contracts for every textured surface',async()=>{
    const root=await load();let checked=0
    root.traverse(o=>{
      if(!(o instanceof THREE.Mesh))return
      const tile=o.userData.kind==='board-segment'?o:o.parent
      if(tile?.userData.kind!=='board-segment'||tile.userData.zones.some((z:number)=>z!==0))return
      const thin=tile.parent!.userData.thicknessAxis as Axis,uvAxes={x:[2,1],y:[2,0],z:[0,1]}[thin],m=o.material as THREE.MeshStandardMaterial
      if(!m.name.endsWith('_'+thin.toUpperCase()))return
      const p=o.geometry.getAttribute('position'),n=o.geometry.getAttribute('normal'),uv=o.geometry.getAttribute('uv'),ni=axes.indexOf(thin);let start=-1
      for(let i=0;i<p.count;i++)if(Math.abs(n.getComponent(i,ni))>.99999){if(start<0){start=i;continue}close(uv.getX(i)-uv.getX(start),p.getComponent(i,uvAxes[0])-p.getComponent(start,uvAxes[0]));close(uv.getY(i)-uv.getY(start),p.getComponent(i,uvAxes[1])-p.getComponent(start,uvAxes[1]));checked++}
    })
    expect(checked).toBeGreaterThan(100);expect(config.textureAxes).toEqual({})
    for(const name of [...MATERIAL_TARGETS.carcass,...MATERIAL_TARGETS.fronts]){expect(contract.uvContract[name]).toBeDefined();required(root,contract.uvContract[name].exampleTarget)}
    expect(required(root,`Dresser_${spec.number}_Root`).userData.runtimeCompatibility).toContain('material-and-UV-integration-pending')
  })
})
