// Offline illustrations from the same geometry as the configurator. No WebGL
// contexts or Three.js imports are needed by the handle picker in the browser.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'
import { AmbientLight, Box3, BoxGeometry, Color, DirectionalLight, Mesh,
  MeshLambertMaterial, OrthographicCamera, Scene, Vector3 } from 'three'
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js'
import { createHandleGeometry, createNotchedFront } from '../src/three/handles/handleGeometry.ts'
import { HARDWARE_HANDLES } from '../src/configurator/handles.ts'

const check = process.argv.includes('--check')
const directory = new URL('../public/previews/handles/', import.meta.url)
const dom = new JSDOM()
globalThis.document = dom.window.document
const width = 240, height = 168
const styles = ['original', ...HARDWARE_HANDLES.map(handle => handle.value), 'long-bar', 'none']
const changed = []
if (!check) await mkdir(directory, { recursive: true })

function render(style, kind) {
  // Original hardware varies by model, so use a restore symbol rather than an
  // invented handle. All other previews show actual selectable geometry.
  if (style === 'original') return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 168"><rect width="240" height="168" rx="12" fill="#f1f4f7"/><rect x="72" y="24" width="96" height="120" rx="4" fill="#d9dce0" stroke="#8d969f" stroke-width="2"/><path d="M141 68a28 28 0 1 0 5 31M141 48v23h-23" fill="none" stroke="#344b63" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>\n'
  const scene = new Scene()
  scene.background = new Color('#f1f4f7')
  scene.add(new AmbientLight(0xffffff, .65))
  const light = new DirectionalLight(0xffffff, 1.1)
  light.position.set(-1, 3, 4)
  scene.add(light)
  const board = new MeshLambertMaterial({ color: '#969b9f' })
  const metal = new MeshLambertMaterial({ color: '#3b4651' })
  const inside = new MeshLambertMaterial({ color: '#747d83' })
  const isDoor = kind === 'doors'
  const length = style === 'long-bar' ? (isDoor ? .6 : .32)
    : style === 'profile' ? (isDoor ? .33 : .22)
      : style === 'edge-pull' ? (isDoor ? .17 : .11) : undefined
  const panelWidth = isDoor ? .21 : Math.max(.27, (length ?? .14) + .1)
  const panelHeight = isDoor ? Math.max(.24, (length ?? .14) + .1) : .16
  const thickness = .016
  const panel = new Mesh(style === 'finger-notch'
    ? createNotchedFront(panelWidth, panelHeight, thickness)
    : new BoxGeometry(panelWidth, panelHeight, thickness), board)
  panel.position.z = -thickness / 2
  scene.add(panel)
  if (style === 'top-grip') {
    const gap = .04
    const rail = new Mesh(new BoxGeometry(panelWidth, .016, thickness), board)
    rail.position.set(0, panelHeight / 2 + gap + .008, -thickness / 2)
    rail.renderOrder = -1
    scene.add(rail)
    const interior = new Mesh(new BoxGeometry(panelWidth, gap, .004), inside)
    interior.position.set(0, panelHeight / 2 + gap / 2, -.035)
    interior.renderOrder = -2
    scene.add(interior)
  } else if (style !== 'none' && style !== 'finger-notch') {
    const faceScale = isDoor && (style === 'knob' || style === 'semicircle') ? 1.75 : 1
    const handle = new Mesh(createHandleGeometry(style, length, thickness, faceScale), metal)
    handle.renderOrder = 1
    if (isDoor) {
      const inset = style === 'profile' ? 0 : style === 'knob' ? .05
        : style === 'semicircle' || style === 'edge-pull' ? .02 : .026
      handle.position.x = panelWidth / 2 - inset
      handle.rotation.z = -Math.PI / 2
    } else {
      const inset = style === 'profile' ? 0 : style === 'edge-pull' ? .035
        : style === 'semicircle' ? .03 : .018
      handle.position.y = panelHeight / 2 - inset
    }
    scene.add(handle)
  }
  const bounds = new Box3().setFromObject(scene)
  const center = bounds.getCenter(new Vector3())
  const camera = new OrthographicCamera(-1, 1, 1, -1, .001, 10)
  camera.position.copy(center).add(new Vector3(.42, .32, 1))
  camera.lookAt(center)
  camera.updateMatrixWorld()
  // Fit projected corners, so long door handles and compact drawer handles
  // both remain legible in the same card, without changing their proportions.
  const viewBounds = new Box3()
  for (const x of [bounds.min.x, bounds.max.x])
    for (const y of [bounds.min.y, bounds.max.y])
      for (const z of [bounds.min.z, bounds.max.z])
        viewBounds.expandByPoint(new Vector3(x, y, z).applyMatrix4(camera.matrixWorldInverse))
  const size = viewBounds.getSize(new Vector3())
  const halfHeight = Math.max(size.y, size.x * height / width) * .58
  const viewCenter = viewBounds.getCenter(new Vector3())
  camera.left = viewCenter.x - halfHeight * width / height
  camera.right = viewCenter.x + halfHeight * width / height
  camera.top = viewCenter.y + halfHeight
  camera.bottom = viewCenter.y - halfHeight
  camera.updateProjectionMatrix()
  const renderer = new SVGRenderer()
  renderer.setSize(width, height)
  renderer.setPrecision(3)
  renderer.render(scene, camera)
  const svg = renderer.domElement
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  svg.removeAttribute('width')
  svg.removeAttribute('height')
  // A rect survives SVG-to-image conversion even if background CSS is ignored.
  const background = dom.window.document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  for (const [key, value] of Object.entries({ x: -width / 2, y: -height / 2, width, height, fill: '#f1f4f7' }))
    background.setAttribute(key, String(value))
  svg.prepend(background)
  const result = `${svg.outerHTML}\n`
  scene.traverse(object => { if (object.isMesh) object.geometry.dispose() })
  board.dispose(); metal.dispose(); inside.dispose()
  return result
}

for (const kind of ['doors', 'drawers']) {
  const options = kind === 'drawers' ? [...styles, 'top-grip', 'finger-notch'] : styles
  for (const style of options) {
    const file = new URL(`${kind}-${style}.svg`, directory)
    const expected = render(style, kind)
    const actual = await readFile(file, 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null
      throw error
    })
    if (actual !== expected) {
      changed.push(fileURLToPath(file))
      if (!check) await writeFile(file, expected)
    }
  }
}
dom.window.close()
if (check && changed.length) {
  console.error('Handle previews are out of date. Run npm run generate:handle-previews.\n' + changed.join('\n'))
  process.exitCode = 1
} else console.log(check ? 'Handle previews match the source geometry.' : `Updated ${changed.length} handle previews.`)
