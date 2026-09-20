// Не требуется при запуске приложения. Пересоздаёт карточки из реальных GLB.
// Нужны Playwright/Chromium в отдельной среде: см. README рядом.
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const { createServer } = await import(pathToFileURL(path.join(root, 'node_modules/vite/dist/node/index.js')).href)
const { chromium } = await import(process.env.PREVIEW_PLAYWRIGHT_PATH || 'playwright')
const html = `<!DOCTYPE html><html><body style="margin:0"><script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
window.renderBase = async (url) => {
 const scene = new THREE.Scene(); scene.background = new THREE.Color('#f3f5f7');
 const renderer = new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(320,240); renderer.setPixelRatio(1); renderer.outputColorSpace=THREE.SRGBColorSpace;
 const model = (await new GLTFLoader().loadAsync(url)).scene; scene.add(model);
 const material = new THREE.MeshStandardMaterial({color:'#4d5865',roughness:.7,metalness:0});
 model.traverse(o=>{if(o.isMesh)o.material=material});
 const box = new THREE.Box3().setFromObject(model),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
 const radius=size.length()*.5; const camera=new THREE.PerspectiveCamera(32,4/3,.01,100);
 camera.position.copy(center).add(new THREE.Vector3(1.3,.75,1.8).normalize().multiplyScalar(radius/Math.sin(16*Math.PI/180)*1.04)); camera.lookAt(center);
 scene.add(new THREE.HemisphereLight(0xffffff,0x9da6b1,2));
 const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(2,4,3);scene.add(key);
 const fill=new THREE.DirectionalLight(0xffffff,1);fill.position.set(-3,2,-2);scene.add(fill);
 renderer.render(scene,camera); const data=renderer.domElement.toDataURL('image/png');
 model.traverse(o=>{if(o.isMesh)o.geometry.dispose()});material.dispose();renderer.dispose();return data;
};</script></body></html>`
const server=await createServer({root,server:{host:'127.0.0.1',port:5186,strictPort:true},plugins:[{name:'base-previews',configureServer(server){server.middlewares.use('/__base_previews__.html',async(req,res)=>{res.setHeader('Content-Type','text/html');res.end(await server.transformIndexHtml('/__base_previews__.html',html))})}}]})
let browser
try {
 await server.listen()
 browser=await chromium.launch({headless:true,executablePath:process.env.PREVIEW_CHROMIUM_PATH||undefined,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
 const page=await browser.newPage();await page.goto('http://127.0.0.1:5186/__base_previews__.html');await page.waitForFunction(()=>!!window.renderBase)
 const output=path.join(root,'public/previews/bases');await fs.mkdir(output,{recursive:true})
 for(const id of ['four-legs','slat-pedestal','round-fluted','u-frame','v-pedestal']){
  const data=await page.evaluate(id=>window.renderBase('/modules/bases/'+id+'.glb'),id)
  await fs.writeFile(path.join(output,id+'.png'),Buffer.from(data.split(',')[1],'base64'));console.log(id)
 }
}finally{await browser?.close();await server.close()}
