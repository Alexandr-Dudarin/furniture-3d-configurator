import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Document, NodeIO, Accessor } from '@gltf-transform/core'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

// Авторинг одной модели. Не добавляет поведение в общий runtime.
const sourceDir = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(sourceDir, '../../..')
const spec = JSON.parse(await fs.readFile(path.join(sourceDir, 'model-spec.json'), 'utf8'))
const { width: W, height: H, depth: D } = spec.base
const t = .016, b = .0007, gap = .004, plinth = .070, backT = .003
const F = D/2 - .002
const bodyBack = -D/2 + backT, bodyFront = F - t - .003
const bodyDepth = bodyFront - bodyBack, bodyZ = (bodyFront + bodyBack)/2
const clearWidth = W - .034
const shelfLowerTop = .386, shelfUpperTop = H - .350, railY = H - .440
const axes = ['x','y','z'], dimensions = ['width','height','depth']
const doc = new Document(), buffer = doc.createBuffer(), scene = doc.createScene('FurnitureScene')
doc.getRoot().setDefaultScene(scene)
doc.getRoot().getAsset().generator = 'Furniture wardrobe model authoring / glTF-Transform'
const source = { spec, materials:[], nodes:[] }
const parts = [], resizeRules = [], uvContract = {}, textureAxes = {}, materialTargets = {carcass:[],fronts:[],hardware:[]}
const nodeMeta = new Map(), materials = new Map(), materialCache = new Map()
const tex = {}
for (const [key,file] of Object.entries({color:'neutral-color.png',normal:'normal-gl.png',mr:'metallic-roughness.png'})) {
  tex[key] = doc.createTexture(key).setImage(new Uint8Array(await fs.readFile(path.join(sourceDir,'textures',file)))).setMimeType('image/png')
}
const zeros = () => ({width:[0,0,0],height:[0,0,0],depth:[0,0,0]})
const motion = (wx=0,hy=0,dz=0) => ({width:[wx,0,0],height:[0,hy,0],depth:[0,0,dz]})
const clean = n => Math.abs(n)<1e-12 ? 0 : Number(n.toFixed(12))

function node(name, parent, pos, extras={}, moves=zeros(), primitives=[]) {
  const n = doc.createNode(name).setTranslation(pos.map(clean)).setExtras(extras)
  const record = {name,parent:parent?.getName()??null,translation:pos.map(clean),rotation:[0,0,0,1],extras,primitives:[]}
  if(primitives.length) {
    const mesh = doc.createMesh(name+'_Mesh')
    for(const {g, material} of primitives) {
      const p = doc.createPrimitive().setMaterial(materials.get(material)), attributes={}
      for(const [a,semantic,type] of [['position','POSITION','VEC3'],['normal','NORMAL','VEC3'],['uv','TEXCOORD_0','VEC2'],['tangent','TANGENT','VEC4']]) {
        const attr=g.getAttribute(a);if(!attr)continue
        const array=new Float32Array(attr.array)
        p.setAttribute(semantic,doc.createAccessor(name+'_'+a,buffer).setType(Accessor.Type[type]).setArray(array))
        attributes[a]=Array.from(array)
      }
      const indices=g.index?Array.from(g.index.array):Array.from({length:g.attributes.position.count},(_,i)=>i)
      p.setIndices(doc.createAccessor(name+'_indices',buffer).setType('SCALAR').setArray(new Uint32Array(indices)))
      mesh.addPrimitive(p);record.primitives.push({material,attributes,indices});g.dispose()
    }
    n.setMesh(mesh)
  }
  if(parent)parent.addChild(n);else scene.addChild(n)
  for(const dimension of dimensions) for(let a=0;a<3;a++) {
    const factor=clean(moves[dimension]?.[a]??0)
    if(factor)resizeRules.push({type:'delta-move',dimension,axis:axes[a],targets:[{target:name,factor}]})
  }
  source.nodes.push(record)
  return n
}

// Группы задаются в мировых координатах при base. Локальные дельты вычисляются
// относительно parent, поэтому ручки не наследуют растяжение полотна.
function group(name,parent,worldPos,worldMotion=zeros(),extras={}) {
  const pm=parent?nodeMeta.get(parent.getName()):{position:[0,0,0],motion:zeros()}
  const local=worldPos.map((p,i)=>p-pm.position[i]), moves=zeros()
  for(const d of dimensions)moves[d]=worldMotion[d].map((v,i)=>v-pm.motion[d][i])
  const n=node(name,parent,local,extras,moves)
  nodeMeta.set(name,{position:worldPos,motion:worldMotion})
  return n
}

const root=group(`Wardrobe_${spec.number.toString().padStart(2,'0')}_Root`,null,[0,0,0],zeros(),{
  modelId:spec.id,unit:'meter',front:'+Z',floorAnchor:0,heightReadiness:'height-configurable',
  thicknessReadiness:'thickness-fixed',runtimeCompatibility:'geometry-supported; material-and-UV-integration-pending',
})
const carcass=group('Carcass_Assembly',root,[0,0,0])

function newMaterial(name,slot,color,metalness,roughness,textured,extras={}) {
  const c=new THREE.Color(color), colorFactor=[...c.toArray(),1]
  const m=doc.createMaterial(name).setBaseColorFactor(colorFactor).setMetallicFactor(metalness).setRoughnessFactor(roughness).setExtras({materialSlot:slot,...extras})
  if(textured) {
    m.setBaseColorTexture(tex.color).setNormalTexture(tex.normal).setNormalScale(.1).setMetallicRoughnessTexture(tex.mr)
    for(const info of [m.getBaseColorTextureInfo(),m.getNormalTextureInfo(),m.getMetallicRoughnessTextureInfo()])info.setWrapS(10497).setWrapT(10497)
  }
  materials.set(name,m);materialTargets[slot].push(name)
  source.materials.push({name,textured,color:colorFactor,metalness,roughness,normalScale:.1,extras:{materialSlot:slot,...extras}})
  return name
}
newMaterial('Hardware_Metal','hardware',0x181a1c,.04,.34,false,{previewFinish:'metal-black-matte'})
newMaterial('Hardware_Plastic','hardware',0x282a2c,0,.55,false,{previewFinish:'metal-black-matte',constructionMaterial:'plastic'})

function geometry(data) {
  const g=new THREE.BufferGeometry()
  for(const [key,size] of [['position',3],['normal',3],['uv',2]])if(data[key]?.length)g.setAttribute(key,new THREE.Float32BufferAttribute(data[key],size))
  g.setIndex(Array.from({length:data.position.length/3},(_,i)=>i))
  if(data.uv?.length)g.computeTangents()
  return g
}

function boardMaterial(family,slot,size,dSize,zones,thin,plane,uvAxes,tileName) {
  const key=JSON.stringify({family,slot,size:size.map(clean),dSize,zones,thin,plane,uvAxes})
  if(materialCache.has(key))return materialCache.get(key)
  const zoneCode=zones.map(n=>n===-1?'m':n===1?'p':'c').join('')
  const name=`${slot==='fronts'?'Front':'Board'}_${family}_${zoneCode}_${axes[plane].toUpperCase()}`
  const bindings={}
  for(const [uv,axis] of Object.entries({u:uvAxes[0],v:uvAxes[1]})) {
    const zone=zones[axis], coefficient=dSize[axis]
    const baseLength=size[axis]-2*b
    bindings[uv]={axis:axes[axis],dimension:dimensions[axis],baseLength:clean(baseLength),
      stretchFactor:zone===0?coefficient:0,translationFactor:zone*coefficient/2,
      anchor:clean(.5+zone*baseLength/2),uvUnitsPerMeter:1}
  }
  uvContract[name]={slot,exampleTarget:tileName,surfacePlane:axes[plane],bindings,
    formula:'repeat=(baseLength+delta*stretchFactor)/baseLength; offset=anchor*(1-repeat)+delta*translationFactor',
    status:'requires generic affine UV bindings; not active in current preview config'}
  // Только диагностическая совместимость со старым API; не выдаётся за точную UV-компенсацию.
  textureAxes[name]={}
  for(const [uv,binding] of Object.entries(bindings))if(binding.stretchFactor)textureAxes[name][binding.dimension]=uv==='u'?'x':'y'
  newMaterial(name,slot,spec.boardColor,0,.62,true,{surfacePlane:axes[plane],uvPeriodMeters:1,boardFinishPending:true})
  materialCache.set(key,name)
  return name
}

// Девять частей плиты сохраняют толщину и радиус кромки при любом W/H/D.
// Скрытых перегородок между частями нет: они образуют одну замкнутую оболочку.
function board(name,parent,size,pos,dSize,dPos,thin,slot='carcass',family=name,extras={}) {
  const baseSize=size.map(clean), part=group(name,parent,pos,dPos,{kind:'board',thickness:baseSize[thin],thicknessAxis:axes[thin],bevelRadius:b,...extras})
  parts.push({name,kind:'board',slot,size:baseSize,position:pos.map(clean),sizeFactors:dSize,positionFactors:dPos,thinAxis:thin,bevel:b,...extras})
  const rounded=new RoundedBoxGeometry(...size,2,b)
  const positions=rounded.attributes.position.array, normals=rounded.attributes.normal.array
  const faces=rounded.groups, buckets=new Map()
  for(let vertex=0;vertex<positions.length/3;vertex+=3) {
    const face=faces.findIndex(f=>vertex>=f.start&&vertex<f.start+f.count)
    const plane=Math.floor(face/2)
    const zone=[0,0,0]
    for(let a=0;a<3;a++)if(a!==thin) {
      const values=[0,1,2].map(k=>positions[(vertex+k)*3+a]), inner=size[a]/2-b
      if(Math.min(...values)>=inner-2e-7)zone[a]=1
      else if(Math.max(...values)<=-inner+2e-7)zone[a]=-1
    }
    const code=zone.map(z=>z<0?'m':z>0?'p':'c').join(''), key=code+plane
    if(!buckets.has(key))buckets.set(key,{zone,plane,position:[],normal:[],uv:[]})
    const out=buckets.get(key)
    let uvAxes
    if(plane===thin)uvAxes=thin===0?[2,1]:thin===1?[2,0]:[0,1]
    else uvAxes=[thin,[0,1,2].find(a=>a!==thin&&a!==plane)]
    out.uvAxes=uvAxes
    for(let k=0;k<3;k++) {
      const p=Array.from(positions.slice((vertex+k)*3,(vertex+k)*3+3)), n=Array.from(normals.slice((vertex+k)*3,(vertex+k)*3+3))
      out.position.push(...p.map((v,a)=>v-zone[a]*(size[a]/2-b)))
      out.normal.push(...n)
      for(const a of uvAxes) {
        // Физическая длина прямого участка + дуга скругления, одна UV-единица на метр.
        const arc=b*Math.atan2(n[a],Math.abs(n[plane]))
        const flat=p[a]-b*n[a]
        out.uv.push(.5+flat+arc)
      }
    }
  }
  rounded.dispose()
  const tiles=new Map()
  for(const bucket of buckets.values()) {
    const code=bucket.zone.map(z=>z<0?'m':z>0?'p':'c').join(''), tileName=`${name}_Tile_${code}`
    if(!tiles.has(code))tiles.set(code,{name:tileName,zone:bucket.zone,primitives:[]})
    const material=boardMaterial(family,slot,size,dSize,bucket.zone,thin,bucket.plane,bucket.uvAxes,tileName)
    tiles.get(code).primitives.push({g:geometry(bucket),material})
  }
  for(const tile of tiles.values()) {
    const loc=tile.zone.map((z,a)=>z*(size[a]/2-b)), moves=zeros()
    for(let a=0;a<3;a++)moves[dimensions[a]][a]=tile.zone[a]*dSize[a]/2
    node(tile.name,part,loc,{kind:'board-segment',zones:tile.zone,bevelRadius:b},moves,tile.primitives)
    for(let a=0;a<3;a++)if(dSize[a]&&tile.zone[a]===0)resizeRules.push({type:'stretch-segment',target:tile.name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]-2*b),factor:dSize[a]})
  }
  return part
}

function metal(name,parent,size,pos,dSize=[0,0,0],dPos=zeros(),extras={},shape='box',material='Hardware_Metal') {
  let g
  if(shape==='oval-x') {g=new THREE.CylinderGeometry(size[1]/2,size[1]/2,size[0],32,1);g.rotateZ(Math.PI/2);g.scale(1,1,size[2]/size[1])}
  else g=dSize.some(Boolean)?new THREE.BoxGeometry(...size):new RoundedBoxGeometry(...size,1,Math.min(.0008,...size.map(x=>x/8)))
  g.deleteAttribute('uv')
  const pm=nodeMeta.get(parent.getName()), local=pos.map((v,a)=>v-pm.position[a]), moves=zeros()
  for(const d of dimensions)moves[d]=dPos[d].map((v,a)=>v-pm.motion[d][a])
  const n=node(name,parent,local,{kind:'hardware',...extras},moves,[{g,material}])
  nodeMeta.set(name,{position:pos,motion:dPos})
  for(let a=0;a<3;a++)if(dSize[a])resizeRules.push({type:'stretch-segment',target:name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]),factor:dSize[a]})
  parts.push({name,kind:'hardware',size:size.map(clean),position:pos.map(clean),sizeFactors:dSize,positionFactors:dPos,...extras})
  return n
}

// Dimensions below reconcile the manufacturer part list, PDF pp. 1-4.
board('Panel_Top',carcass,[W,t,D],[0,H-t/2,0],[1,0,1],motion(0,1,0),1,'carcass','Top',{pdfPart:3})
for(const [side,sign,partNo] of [['Left',-1,1],['Right',1,2]]) {
  board(`Panel_Side_${side}`,carcass,[t,H-t,bodyDepth],[sign*(W/2-.001-t/2),(H-t)/2,bodyZ],[0,1,1],motion(sign*.5,.5,0),0,'carcass','Side',{pdfPart:partNo})
}
// User-approved variant: one 800 × 1948 × 3 mm back at base, spanning both sides.
// Replaces manufacturer parts 9 (two panels) and 10 (join profile); the envelope is unchanged.
board('Panel_Back',carcass,[W-.002,H-.074,backT],[0,(.058+H-t)/2,-D/2+backT/2],[1,1,0],motion(0,.5,-.5),2,'carcass','Back',{designVariant:'single-piece-back',replacesPdfParts:[9,10]})
board('Panel_Bottom',carcass,[clearWidth,t,bodyDepth],[0,plinth+t/2,bodyZ],[1,0,1],motion(),1,'carcass','Bottom',{pdfPart:5})
board('Plinth_Front',carcass,[clearWidth,plinth,t],[0,plinth/2,bodyFront-.020-t/2],[1,0,0],motion(0,0,.5),2,'carcass','Plinth',{pdfPart:6})
board('Shelf_Lower',carcass,[clearWidth,t,bodyDepth],[0,shelfLowerTop-t/2,bodyZ],[1,0,1],motion(),1,'carcass','Shelf',{pdfPart:4,attachment:'fixed cam connectors',mountHeight:'estimated; floor anchored'})
board('Shelf_Upper',carcass,[clearWidth,t,bodyDepth],[0,shelfUpperTop-t/2,bodyZ],[1,0,1],motion(0,1,0),1,'carcass','Shelf',{pdfPart:4,attachment:'fixed cam connectors',mountHeight:'estimated; roof anchored'})
board('Rear_Brace',carcass,[clearWidth,.120,t],[0,H/2+.005,bodyBack+t/2],[1,0,0],motion(0,.5,-.5),2,'carcass','RearBrace',{pdfPart:7,mountHeight:'estimated'})
metal('ClothesRail_Oval',carcass,[clearWidth-.003,.030,.015],[0,railY,bodyZ],[1,0,0],motion(0,1,0),{fitting:'clothes-rail',pdfPart:11,sectionHeight:.030,sectionDepth:.015},'oval-x')
for(const [side,sign] of [['Left',-1],['Right',1]]) {
  metal(`ClothesRail_Socket_${side}`,carcass,[.0015,.040,.025],[sign*(clearWidth/2-.00075),railY,bodyZ],[0,0,0],motion(sign*.5,1,0),{fitting:'rail-socket'},'oval-x')
}

const doors=[],drawers=[]
const doorBottom=.071,doorTop=H-.018,doorWidth=W/2-.004
for(const [index,key,sign] of [[0,'Left',-1],[1,'Right',1]]) {
  const outer=sign*(W/2-.002), x=sign*(W/4)
  // The rear-face virtual axis keeps the open leaf beside the carcass.
  // This remains a visual swing model, not an exact four-bar hinge mechanism.
  const hinge=group(`Door_${key}_Hinge`,root,[outer,doorBottom,F-t],motion(sign*.5,0,.5),{kind:'door-pivot',axisPlane:'facade-back',axis:'Y',openAngleDegrees:sign*105,interactiveAnimation:false,axisStatus:'approximate virtual swing axis'})
  board(`Door_${key}_Panel`,hinge,[doorWidth,doorTop-doorBottom,t],[x,(doorTop+doorBottom)/2,F-t/2],[.5,1,0],motion(sign*.25,.5,.5),2,'fronts','Door_Tall',{pdfPart:8,doorIndex:index,doorBottom})
  doors.push({name:hinge.getName(),key,sign,angle:sign*105,bottom:doorBottom,hingeX:outer})
  for(let i=0;i<4;i++) {
    const fraction=i/3,y=doorBottom+.160+fraction*(doorTop-doorBottom-.320),suffix=String(i+1).padStart(2,'0')
    metal(`Hinge_${key}_${suffix}_Cup`,hinge,[.032,.036,.006],[outer-sign*.038,y,F-t-.003],[0,0,0],motion(sign*.5,fraction,.5),{fitting:'hinge-cup',approximate:true})
    metal(`Hinge_${key}_${suffix}_Plate`,carcass,[.0035,.042,.034],[sign*(clearWidth/2-.00175),y,bodyFront-.025],[0,0,0],motion(sign*.5,fraction,.5),{fitting:'hinge-plate',approximate:true})
  }
  const latchX=sign*.030,latchY=shelfUpperTop-t-.006
  const latch=group(`PushLatch_${key}_Assembly`,carcass,[latchX,latchY,bodyFront-.024],motion(0,1,.5),{kind:'push-latch',approximate:true})
  metal(`PushLatch_${key}_Body`,latch,[.018,.012,.045],[latchX,latchY,bodyFront-.024],[0,0,0],motion(0,1,.5),{fitting:'push-latch-body'},'box','Hardware_Plastic')
  metal(`PushLatch_${key}_Tip`,latch,[.006,.006,.0045],[latchX,latchY,bodyFront+.00075],[0,0,0],motion(0,1,.5),{fitting:'push-latch-tip'},'box','Hardware_Plastic')
}

// Одно правило перемещения на dimension/axis: эти коэффициенты уже локальны.
const moves=new Map(), finalRules=[]
for(const rule of resizeRules) {
  if(rule.type!=='delta-move'){finalRules.push(rule);continue}
  const key=rule.dimension+rule.axis
  if(!moves.has(key))moves.set(key,{...rule,targets:[]})
  moves.get(key).targets.push(...rule.targets)
}
finalRules.push(...moves.values())
const hardware={label:'Цвет фурнитуры',targets:materialTargets.hardware,defaultFinish:'metal-black-matte',allowedFinishes:['metal-black-matte','metal-white-matte','metal-anthracite']}
const definition={id:spec.id,label:spec.label,modelUrl:`/models/${spec.id}.glb`,dimensions:Object.fromEntries(dimensions.map((key,i)=>[key,{label:['Ширина','Высота','Глубина'][i],base:spec.base[key],min:spec.limits[key][0],max:spec.limits[key][1],step:.001}])),dimensionOrder:dimensions,resizeRules:finalRules,textureAxes:{},materialSlots:{hardware}}
const meta={modelId:spec.id,base:spec.base,constants:{boardThickness:t,backThickness:backT,plinth,bevelRadius:b,facadeGap:gap,doorBottom,shelfLowerTop,shelfUpperTop,railY,topSideOverhang:.001,topFrontOverhang:.002,doorOuterInsetFromTop:.002,frontCarcassClearance:.003,handleProjection:0,backConstruction:'single-piece',backSideInset:.001},parts,doors,drawers,materialTargets,uvContract,legacyTextureAxes:textureAxes,reviewStatus:'material library and affine UV integration required'}
await fs.mkdir(path.join(projectRoot,'public/models'),{recursive:true})
const glb=await new NodeIO().writeBinary(doc)
await fs.writeFile(path.join(projectRoot,'public/models',spec.id+'.glb'),glb)
await fs.writeFile(path.join(sourceDir,'mesh-source.json'),JSON.stringify(source))
await fs.writeFile(path.join(sourceDir,'model-contract.json'),JSON.stringify(meta,null,2)+'\n')
const configDir=path.join(projectRoot,'src/three/models',spec.folder)
await fs.mkdir(configDir,{recursive:true})
const constant=`WARDROBE_${spec.number.toString().padStart(2,'0')}_CONFIG`
const ts=`import type { FurnitureDefinition } from '../../furniture/types'\n\n// Автоматически создано build_model.mjs. Размеры проверяются текущим generic controller.\n// Серые исходные материалы остаются в GLB: board finish IDs ещё не зарегистрированы.\n// Точные UV-привязки находятся в model-contract.json и требуют общего расширения.\nexport const ${constant} = ${JSON.stringify(definition,null,2)} as const satisfies FurnitureDefinition\n\nexport const BOARD_MATERIAL_TARGETS = ${JSON.stringify({carcass:materialTargets.carcass,fronts:materialTargets.fronts},null,2)} as const\n\n// Только material-review: позволяет проверить независимость slots с РЕАЛЬНЫМИ\n// finish IDs каталога. Не обещает стабильный UV рисунка при resize.\nexport function createMaterialReviewDefinition(carcassFinish: string, frontsFinish: string, allowedFinishes: readonly string[]): FurnitureDefinition {\n  for (const id of [carcassFinish, frontsFinish]) if (!allowedFinishes.includes(id)) throw new Error('Default finish must be allowed')\n  return { ...${constant}, materialSlots: { ...${constant}.materialSlots,\n    carcass: { label: 'Корпус и полки', targets: BOARD_MATERIAL_TARGETS.carcass, defaultFinish: carcassFinish, allowedFinishes },\n    fronts: { label: 'Фасады', targets: BOARD_MATERIAL_TARGETS.fronts, defaultFinish: frontsFinish, allowedFinishes },\n  } }\n}\n`
await fs.writeFile(path.join(configDir,'config.ts'),ts)
const performance={id:spec.id,glbBytes:glb.byteLength,nodes:source.nodes.length,meshes:source.nodes.filter(n=>n.primitives.length).length,primitives:source.nodes.reduce((s,n)=>s+n.primitives.length,0),triangles:source.nodes.flatMap(n=>n.primitives).reduce((s,p)=>s+p.indices.length/3,0),materials:source.materials.length,physicalParts:parts.length,resizeRules:finalRules.length,boardTextureResolution:'1×1 uniform PBR maps; physical UV for later finish replacement'}
await fs.writeFile(path.join(sourceDir,'performance.json'),JSON.stringify(performance,null,2)+'\n')
console.log(JSON.stringify(performance))
