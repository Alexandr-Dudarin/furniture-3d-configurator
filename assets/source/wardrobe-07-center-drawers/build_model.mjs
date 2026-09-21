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
const drawerModel = spec.number === 7
const t = .016, b = .0007, gap = .003, plinth = .060, backT = .004
const projection = drawerModel ? 0 : .028
const F = D/2 - projection
const bodyBack = -D/2 + backT, bodyFront = F - t - .002
const bodyDepth = bodyFront - bodyBack, bodyZ = (bodyFront + bodyBack)/2
const floorTop = plinth + t, roofBottom = H-t
const sideClear = W/4 - 1.5*t, centerClear = W/2 - t
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

function metal(name,parent,size,pos,dSize=[0,0,0],dPos=zeros(),extras={},shape='box') {
  let g
  if(shape==='cylinder-x') {g=new THREE.CylinderGeometry(size[1]/2,size[1]/2,size[0],24,1);g.rotateZ(Math.PI/2)}
  else g=dSize.some(Boolean)?new THREE.BoxGeometry(...size):new RoundedBoxGeometry(...size,1,Math.min(.0008,...size.map(x=>x/8)))
  g.deleteAttribute('uv')
  const pm=nodeMeta.get(parent.getName()), local=pos.map((v,a)=>v-pm.position[a]), moves=zeros()
  for(const d of dimensions)moves[d]=dPos[d].map((v,a)=>v-pm.motion[d][a])
  const n=node(name,parent,local,{kind:'hardware',...extras},moves,[{g,material:'Hardware_Metal'}])
  nodeMeta.set(name,{position:pos,motion:dPos})
  for(let a=0;a<3;a++)if(dSize[a])resizeRules.push({type:'stretch-segment',target:name,dimension:dimensions[a],axis:axes[a],baseLength:clean(size[a]),factor:dSize[a]})
  parts.push({name,kind:'hardware',size:size.map(clean),position:pos.map(clean),sizeFactors:dSize,positionFactors:dPos,...extras})
  return n
}

board('Panel_Back',carcass,[W,H,backT],[0,H/2,-D/2+backT/2],[1,1,0],motion(0,.5,-.5),2,'carcass','Back')
board('Panel_Top',carcass,[W,t,bodyDepth],[0,H-t/2,bodyZ],[1,0,1],motion(0,1,0),1,'carcass','Top')
for(const [side,s] of [['Left',-1],['Right',1]]) {
  board(`Panel_Side_${side}`,carcass,[t,H-t,bodyDepth],[s*(W/2-t/2),(H-t)/2,bodyZ],[0,1,1],motion(s*.5,.5,0),0,'carcass','Side')
  board(`Panel_Divider_${side}`,carcass,[t,H-t-floorTop,bodyDepth],[s*W/4,(H-t+floorTop)/2,bodyZ],[0,1,1],motion(s*.25,.5,0),0,'carcass','Divider')
}
board('Panel_Bottom',carcass,[W-2*t,t,bodyDepth],[0,plinth+t/2,bodyZ],[1,0,1],motion(),1,'carcass','Bottom')
board('Plinth_Front',carcass,[W-2*t,plinth,t],[0,plinth/2,bodyFront-.045-t/2],[1,0,0],motion(0,0,.5),2,'carcass','Plinth')
board('Plinth_Back',carcass,[W-2*t,plinth,t],[0,plinth/2,bodyBack+t/2],[1,0,0],motion(0,0,-.5),2,'carcass','Plinth')
for(const [side,s] of [['Left',-1],['Right',1]]) {
  const rear=bodyBack+t,front=bodyFront-.045-t
  board(`Plinth_Brace_${side}`,carcass,[t,plinth,front-rear],[s*W/4,plinth/2,(front+rear)/2],[0,0,1],motion(s*.25,0,0),0,'carcass','PlinthBrace')
}

const shelfLevels=[]
if(drawerModel) {
  board('Panel_Drawer_Separator',carcass,[centerClear,t,bodyDepth],[0,.760-t/2,bodyZ],[.5,0,1],motion(),1,'carcass','DrawerSeparator')
  const clear=(H-t-.760-2*t)/3
  for(let i=1;i<=2;i++)shelfLevels.push({y:.760+i*clear+(i-.5)*t,factor:i/3})
} else {
  const clear=(roofBottom-floorTop-4*t)/5
  for(let i=1;i<=4;i++)shelfLevels.push({y:floorTop+i*clear+(i-.5)*t,factor:i/5})
}
function shelf(section,index,x,width,y,xf,yf) {
  const name=`Shelf_${section}_${String(index).padStart(2,'0')}`
  board(name,carcass,[width-.001,t,bodyDepth-.016],[x,y,bodyZ],[section==='Center'?.5:.25,0,1],motion(xf,yf,0),1,'carcass',`Shelf_${section==='Center'?'Center':'Side'}`,{shelfSection:section,shelfIndex:index})
  for(const [side,s] of [['Left',-1],['Right',1]])for(const [edge,e] of [['Front',1],['Back',-1]]) {
    metal(`${name}_Pin_${side}_${edge}`,carcass,[.006,.006,.006],[x+s*(width/2-.0025),y-t/2-.003,bodyZ+e*((bodyDepth-.016)/2-.040)],[0,0,0],motion(xf+s*(section==='Center'?.25:.125),yf,e*.5),{fitting:'shelf-pin'},'cylinder-x')
  }
}
for(const [side,s] of [['Left',-1],['Right',1]]) {
  const levels=drawerModel?[shelfLevels.at(-1)]:shelfLevels
  for(let i=0;i<levels.length;i++)shelf(side,i+1,s*(3*W/8-t/4),sideClear,levels[i].y,s*3/8,levels[i].factor)
}
const centralLevels=drawerModel?shelfLevels:[shelfLevels.at(-1)]
for(let i=0;i<centralLevels.length;i++)shelf('Center',i+1,0,centerClear,centralLevels[i].y,0,centralLevels[i].factor)
const railLevel=shelfLevels.at(-1), railY=railLevel.y-.075
for(const [section,x,width,xf,wf] of drawerModel?[['Left',-3*W/8+t/4,sideClear,-3/8,.25],['Right',3*W/8-t/4,sideClear,3/8,.25]]:[['Center',0,centerClear,0,.5]]) {
  metal(`ClothesRail_${section}`,carcass,[width-.008,.025,.025],[x,railY,bodyZ],[wf,0,0],motion(xf,railLevel.factor,0),{fitting:'clothes-rail',diameter:.025},'cylinder-x')
  for(const [side,s] of [['Left',-1],['Right',1]])metal(`ClothesRail_${section}_Socket_${side}`,carcass,[.004,.034,.034],[x+s*(width/2-.002),railY,bodyZ],[0,0,0],motion(xf+s*wf/2,railLevel.factor,0),{fitting:'rail-socket'},'cylinder-x')
}

const doors=[]
for(const [i,key,hingeSide] of [[0,'Outer_Left',-1],[1,'Center_Left',-1],[2,'Center_Right',1],[3,'Outer_Right',1]]) {
  const short=drawerModel&&(i===1||i===2), bottom=short?.761:.063, top=H-.003
  const left=-W/2+i*W/4+gap/2, right=-W/2+(i+1)*W/4-gap/2
  const x=(left+right)/2, xf=-.5+(i+.5)*.25
  const hx=hingeSide<0?left+.005:right-.005, hxf=-.5+(i+(hingeSide>0?1:0))*.25
  const hinge=group(`Door_${key}_Hinge`,root,[hx,bottom,F-t],motion(hxf,0,.5),{kind:'door-pivot',axis:'Y',openAngleDegrees:hingeSide<0?-105:105,interactiveAnimation:false})
  board(`Door_${key}_Panel`,hinge,[right-left,top-bottom,t],[x,(top+bottom)/2,F-t/2],[.25,1,0],motion(xf,.5,.5),2,'fronts',short?'Door_Short':'Door_Tall',{doorIndex:i,doorBottom:bottom})
  doors.push({name:hinge.getName(),key,sign:hingeSide,angle:hingeSide<0?-105:105,bottom,hingeX:hx})
  if(!drawerModel) {
    const handleX=hingeSide<0?right-.030:left+.030, handleXF=-.5+(i+(hingeSide<0?1:0))*.25
    const handle=group(`Handle_${key}_Assembly`,hinge,[handleX,bottom+.060+.5,F],motion(handleXF,0,.5),{kind:'handle',fixedLength:1,projection:.028})
    metal(`Handle_${key}_Bar`,handle,[.012,1,.012],[handleX,bottom+.560,F+.022],[0,0,0],motion(handleXF,0,.5),{fitting:'handle-bar'})
    for(const [suffix,y] of [['Lower',bottom+.095],['Upper',bottom+1.025]])metal(`Handle_${key}_Post_${suffix}`,handle,[.012,.018,.016],[handleX,y,F+.008],[0,0,0],motion(handleXF,0,.5),{fitting:'handle-post'})
  }
  const fittings=short?[[bottom+.15,0],[top-.15,1]]:[[bottom+.18,0],[(bottom+top)/2,.5],[top-.18,1]]
  for(let j=0;j<fittings.length;j++) {
    const [y,yf]=fittings[j], suffix=String(j+1).padStart(2,'0')
    metal(`Hinge_${key}_${suffix}_Cup`,hinge,[.028,.036,.006],[hx-hingeSide*.018,y,F-t-.003],[0,0,0],motion(hxf,yf,.5),{fitting:'hinge-cup'})
    metal(`Hinge_${key}_${suffix}_Plate`,carcass,[.004,.042,.035],[hx-hingeSide*.010,y,F-t-.023],[0,0,0],motion(hxf,yf,.5),{fitting:'hinge-plate'})
  }
}

const drawers=[]
if(drawerModel) {
  const frontBottom=.063, frontTop=.745, recess=.015, frontHeight=(frontTop-frontBottom-2*recess)/3
  const boxWidth=centerClear-.026, boxRear=bodyBack+.025, boxFront=F-.026, boxDepth=boxFront-boxRear, boxZ=(boxFront+boxRear)/2
  for(let i=0;i<3;i++) {
    const prefix=`Drawer_${String(i+1).padStart(2,'0')}`, y0=frontBottom+i*(frontHeight+recess), y1=y0+frontHeight
    const drawer=group(prefix+'_Assembly',root,[0,y0,0],zeros(),{kind:'drawer',axis:'+Z',interactiveAnimation:false})
    board(prefix+'_Front',drawer,[W/2-gap,frontHeight,t],[0,(y0+y1)/2,F-t/2],[.5,0,0],motion(0,0,.5),2,'fronts','DrawerFront',{drawerIndex:i})
    // Заглублённая полоса даёт захват, не добавляя наружную ручку.
    board(prefix+'_Grip_Recess',drawer,[W/2-gap,recess,.004],[0,y1+recess/2,F-.014],[.5,0,0],motion(0,0,.5),2,'fronts','GripRecess',{drawerIndex:i})
    const baseY=y0+.020, wallBottom=baseY+.006, wallTop=y1-.020, wallH=wallTop-wallBottom
    board(prefix+'_Bottom',drawer,[boxWidth,.006,boxDepth],[0,baseY+.003,boxZ],[.5,0,1],motion(),1,'carcass','DrawerBottom',{drawerIndex:i})
    for(const [side,s] of [['Left',-1],['Right',1]]) {
      board(prefix+'_Side_'+side,drawer,[t,wallH,boxDepth],[s*(boxWidth/2-t/2),(wallBottom+wallTop)/2,boxZ],[0,0,1],motion(s*.25,0,0),0,'carcass','DrawerSide',{drawerIndex:i})
      metal(prefix+'_Slide_'+side,carcass,[.010,.012,boxDepth-.020],[s*(centerClear/2-.0065),wallBottom+.060,boxZ],[0,0,1],motion(s*.25,0,0),{fitting:'drawer-slide',drawerIndex:i})
    }
    for(const [edge,z,zf] of [['Back',boxRear+t/2,-.5],['Inner_Front',boxFront-t/2,.5]])board(prefix+'_'+edge,drawer,[boxWidth-2*t,wallH,t],[0,(wallBottom+wallTop)/2,z],[.5,0,0],motion(0,0,zf),2,'carcass','DrawerWall',{drawerIndex:i})
    drawers.push({name:drawer.getName(),index:i,closedY:y0,previewTravel:.18})
  }
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
const meta={modelId:spec.id,base:spec.base,constants:{boardThickness:t,backThickness:backT,plinth,bevelRadius:b,facadeGap:gap,drawerBlockTop:drawerModel?.760:null,handleProjection:projection},parts,doors,drawers,materialTargets,uvContract,legacyTextureAxes:textureAxes,reviewStatus:'material library and affine UV integration required'}
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
