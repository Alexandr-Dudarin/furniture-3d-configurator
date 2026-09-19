/// <reference types="node" />
import { readFile } from 'node:fs/promises'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { createFurnitureController } from '../../furniture/furnitureController'
import { createFurnitureMaterialController } from '../../materials/materialController'
import { disposeMaterialFinishCache } from '../../materials/createMaterial'
import { getMaterialFinish } from '../../materials/materialRegistry'
import { ROUND_SPLAYED_LEGS_TABLE_CONFIG as config } from './config'

const HEIGHT = 0.73
const THICKNESS = 0.017
const TOP_NAMES = ['Stone_Top', 'Stone_Bottom', 'Stone_Edge_Round']
afterEach(() => { disposeMaterialFinishCache(); vi.unstubAllGlobals() })

async function load() {
  stubImageElement()
  const file=await readFile(`public${config.modelUrl}`)
  return (await new GLTFLoader().parseAsync(Uint8Array.from(file).buffer,'')).scene
}
function required(root:THREE.Object3D,name:string) {
  const node=root.getObjectByName(name)
  if(!node)throw new Error(`Missing node: ${name}`)
  return node
}
function meshFor(root:THREE.Object3D,name:string):THREE.Mesh {
  let result:THREE.Mesh|undefined
  root.traverse(o=>{if(o instanceof THREE.Mesh && !Array.isArray(o.material) && o.material.name===name)result=o})
  if(!result)throw new Error(`Missing primitive: ${name}`)
  return result
}
function material(root:THREE.Object3D,name:string) {return meshFor(root,name).material as THREE.MeshStandardMaterial}
function points(node:THREE.Object3D) {
  node.updateWorldMatrix(true,true)
  const result:THREE.Vector3[]=[]
  node.traverse(o=>{
    if(!(o instanceof THREE.Mesh))return
    const attr=o.geometry.getAttribute('position')
    for(let i=0;i<attr.count;i++)result.push(new THREE.Vector3().fromBufferAttribute(attr,i).applyMatrix4(o.matrixWorld))
  })
  return result
}
function bounds(node:THREE.Object3D) {return new THREE.Box3().setFromPoints(points(node))}
function close(actual:number,expected:number) {expect(actual).toBeCloseTo(expected,6)}
function capture(node:THREE.Object3D) {
  const transforms:Record<string,number[]>={}
  node.traverse(o=>{transforms[o.name]=[...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()]})
  return transforms
}
function textures(root:THREE.Object3D,name:string) {
  const mat=material(root,name)
  const maps=[mat.map,mat.normalMap,mat.roughnessMap]
  expect(maps.every(Boolean)).toBe(true)
  return maps as THREE.Texture[]
}
function expectTextureDensity(root:THREE.Object3D,diameter:number) {
  const ratio=diameter/config.dimensions.diameter.base
  for(const name of TOP_NAMES)for(const map of textures(root,name)) {
    close(map.repeat.x,ratio);close(map.offset.x,(1-ratio)/2)
    const vertical=name==='Stone_Edge_Round'?1:ratio
    close(map.repeat.y,vertical);close(map.offset.y,(1-vertical)/2)
  }
  // UV-плотность проверяется на реальных vertex streams после transforms.
  for(const name of TOP_NAMES.slice(0,2)) {
    const mesh=meshFor(root,name),p=mesh.geometry.getAttribute('position'),uv=mesh.geometry.getAttribute('uv'),map=material(root,name).map!
    mesh.updateWorldMatrix(true,false)
    const origin=new THREE.Vector3().fromBufferAttribute(p,0).applyMatrix4(mesh.matrixWorld)
    for(let i=1;i<p.count;i++) {
      const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld)
      close((uv.getX(i)-uv.getX(0))*map.repeat.x,v.x-origin.x)
      close((uv.getY(i)-uv.getY(0))*map.repeat.y,v.z-origin.z)
    }
  }
  const edge=meshFor(root,'Stone_Edge_Round'),uv=edge.geometry.getAttribute('uv')
  const u=Array.from({length:uv.count},(_,i)=>uv.getX(i))
  close((Math.max(...u)-Math.min(...u))*material(root,'Stone_Edge_Round').map!.repeat.x,Math.PI*diameter)
}
function expectShape(root:THREE.Object3D,diameter:number) {
  const size=bounds(root).getSize(new THREE.Vector3())
  close(size.x,diameter);close(size.z,diameter);close(size.y,HEIGHT)
  close(bounds(root).min.y,0)
  const top=required(root,'TableTop'),tb=bounds(top)
  close(tb.max.y,HEIGHT);close(tb.max.y-tb.min.y,THICKNESS)
  const edge=meshFor(root,'Stone_Edge_Round'),radii=points(edge).map(p=>Math.hypot(p.x,p.z))
  close(Math.max(...radii),diameter/2)
  // Каждый профильный ring остаётся кругом, а не эллипсом.
  const ys=new Map<string,number[]>()
  for(const p of points(edge)){const key=p.y.toFixed(6);ys.set(key,[...(ys.get(key)??[]),Math.hypot(p.x,p.z)])}
  for(const ring of ys.values())expect(Math.max(...ring)-Math.min(...ring)).toBeLessThan(2e-7)
}

describe(config.id,()=>{
  it('loads production GLB with complete semantic surfaces, nondegenerate faces and valid slots',async()=>{
    const root=await load()
    const allNames:string[]=[];root.traverse(o=>allNames.push(o.name))
    expect(new Set(allNames).size).toBe(allNames.length)
    expect(required(root,'TableTop').parent).toBe(required(root,'Base_Assembly').parent)
    const targets=Object.values(config.materialSlots).flatMap(s=>[...s.targets])
    expect(new Set(targets).size).toBe(targets.length)
    expect([...targets].sort()).toEqual([...TOP_NAMES,'Metal_Frame'].sort())
    for(const slot of Object.values(config.materialSlots)) {
      expect(slot.allowedFinishes as readonly string[]).toContain(slot.defaultFinish)
      for(const finish of slot.allowedFinishes)expect(getMaterialFinish(finish).id).toBe(finish)
    }
    for(const name of TOP_NAMES) {
      const m=meshFor(root,name)
      expect(m.geometry.getAttribute('uv')).toBeDefined()
      expect(m.geometry.getAttribute('tangent')).toBeDefined()
      const pos=m.geometry.getAttribute('position'),normal=m.geometry.getAttribute('normal'),idx=m.geometry.index!
      for(let i=0;i<idx.count;i+=3) {
        const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)]
        const [a,b,c]=ids.map(j=>new THREE.Vector3().fromBufferAttribute(pos,j))
        const cross=b.sub(a).cross(c.sub(a))
        expect(cross.length()).toBeGreaterThan(1e-12)
        const n=ids.map(j=>new THREE.Vector3().fromBufferAttribute(normal,j)).reduce((s,v)=>s.add(v),new THREE.Vector3())
        expect(cross.dot(n)).toBeGreaterThan(0)
      }
    }
    expect(required(root,'Furniture_Root').userData.heightReadiness).toBe('height-fixed')
    expect(required(root,'Furniture_Root').userData.thicknessReadiness).toBe('thickness-fixed')
  })
  it('keeps the circle, thickness, floor contact, fixed base and physical UV density across resize and reset',async()=>{
    const root=await load(),controller=createFurnitureController(root,config)
    const mc=createFurnitureMaterialController(root,config,{onMaterialsChanged:controller.refreshTextures})
    await mc.setFinishes(mc.getSelections())
    const fixed=capture(required(root,'Base_Assembly')),base=config.dimensions.diameter.base,max=config.dimensions.diameter.max
    for(const diameter of [base,Number(((base+max)/2).toFixed(2)),max,base]) {
      controller.setDimensions({diameter})
      close(controller.getDimensions().diameter,diameter)
      expectShape(root,diameter);expectTextureDensity(root,diameter)
      expect(capture(required(root,'Base_Assembly'))).toEqual(fixed)
      close(required(root,'TableTop').scale.y,1)
    }
    expect(required(root,'TableTop').scale.toArray()).toEqual([1,1,1])
    mc.dispose()
  })
  it('replaces tabletop and base independently through the real material controller after resize',async()=>{
    const root=await load(),controller=createFurnitureController(root,config)
    const mc=createFurnitureMaterialController(root,config,{onMaterialsChanged:controller.refreshTextures})
    await mc.setFinishes(mc.getSelections())
    const max=config.dimensions.diameter.max
    controller.setDimensions({diameter:max})
    const baseMaterial=material(root,'Metal_Frame')
    await mc.setFinish('primaryTop','walnut-natural')
    expect(material(root,'Metal_Frame')).toBe(baseMaterial)
    for(const name of TOP_NAMES)expect(material(root,name).userData.finishId).toBe('walnut-natural')
    const tops=TOP_NAMES.map(n=>material(root,n))
    await mc.setFinish('frameMetal','metal-white-matte')
    expect(material(root,'Metal_Frame').userData.finishId).toBe('metal-white-matte')
    TOP_NAMES.forEach((n,i)=>expect(material(root,n)).toBe(tops[i]))
    expectTextureDensity(root,max)
    await mc.setFinish('frameMetal','metal-anthracite')
    controller.setDimensions({diameter:config.dimensions.diameter.base})
    expectTextureDensity(root,config.dimensions.diameter.base)
    mc.dispose()
  })
  it('has real geometric overlap at every mount and horizontal floor contact',async()=>{
    const root=await load(),mount=bounds(required(root,'Top_Mount')),top=bounds(required(root,'TableTop'))
    expect(mount.max.y).toBeGreaterThan(top.min.y)
    expect(mount.max.y).toBeLessThan(top.max.y)
    const column=root.getObjectByName('Fluted_Column')
    if(column) {
      const cb=bounds(column),disc=bounds(required(root,'Base_Disc'))
      expect(cb.min.y).toBeLessThan(disc.max.y)
      expect(cb.max.y).toBeGreaterThan(mount.min.y)
      close(cb.getSize(new THREE.Vector3()).x,0.23)
      for(const p of points(column).filter(p=>Math.abs(p.y-cb.max.y)<1e-7))expect(mount.containsPoint(p)).toBe(true)
    } else {
      for(let i=1;i<=4;i++) {
        const key=String(i).padStart(2,'0'),leg=required(root,`Leg_${key}`),pad=bounds(required(root,`Foot_Pad_${key}`))
        const lb=bounds(leg),ps=points(leg),upper=ps.filter(p=>Math.abs(p.y-lb.max.y)<1e-7),lower=ps.filter(p=>Math.abs(p.y-lb.min.y)<1e-7)
        expect(upper.length).toBeGreaterThan(3);expect(lower.length).toBeGreaterThan(3)
        for(const p of upper)expect(mount.containsPoint(p)).toBe(true)
        for(const p of lower)expect(pad.containsPoint(p)).toBe(true)
        close(pad.min.y,0)
        close(lb.min.y,0.004)
      }
    }
  })
})

class MockImageElement {
  complete = false
  width = 1
  height = 1
  crossOrigin: string | null = null
  private source = ''
  private readonly listeners =
    new Map<
      string,
      Set<
        EventListenerOrEventListenerObject
      >
    >()

  addEventListener(
    type: string,
    listener:
      EventListenerOrEventListenerObject,
  ): void {
    const listeners =
      this.listeners.get(type) ??
      new Set()

    listeners.add(listener)
    this.listeners.set(type, listeners)
  }

  removeEventListener(
    type: string,
    listener:
      EventListenerOrEventListenerObject,
  ): void {
    this.listeners.get(type)?.delete(listener)
  }

  set src(value: string) {
    this.source = value
    this.complete = true

    queueMicrotask(() => {
      const event = new Event('load')

      this.listeners
        .get('load')
        ?.forEach((listener) => {
          if (typeof listener === 'function') {
            listener.call(this, event)
            return
          }

          listener.handleEvent(event)
        })
    })
  }

  get src(): string {
    return this.source
  }
}

function stubImageElement(): void {
  vi.stubGlobal('self', globalThis)
  vi.stubGlobal('document', {
    createElementNS: () =>
      new MockImageElement(),
  })
}
