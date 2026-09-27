import {
  Float32BufferAttribute, Material, Mesh, MeshDepthMaterial, MeshDistanceMaterial,
  MeshStandardMaterial, RGBADepthPacking, Vector2, Vector4,
  type BufferGeometry, type WebGLRenderer,
} from 'three'

export const RELIEF_ATTRIBUTE = 'facadeRelief'
export const RELIEF_FADE_START = .75
export const RELIEF_FADE_END = 2.5
export type ReliefProfile = { width: number; depth: number; vertical: boolean }

// No history or distance buckets: a pixel footprint changes continuously with
// perspective, door rotation, canvas size and DPR. Use the differential of
// homogeneous projection, so subpixel camera jitter cancels out of the result.
export const reliefVertexHeader = `
attribute vec4 facadeRelief;
uniform vec2 facadeViewport;
float facadeDetail() {
  if (facadeRelief.z <= 0.0) return 1.0;
  vec4 c = projectionMatrix * modelViewMatrix * vec4(position.xy, position.z + facadeRelief.x, 1.0);
  vec4 ax = projectionMatrix * modelViewMatrix * vec4(facadeRelief.z, 0.0, 0.0, 0.0);
  vec4 ay = projectionMatrix * modelViewMatrix * vec4(0.0, abs(facadeRelief.w), 0.0, 0.0);
  vec2 x = (ax.xy * c.w - c.xy * ax.w) * (0.5 * facadeViewport / max(c.w * c.w, 1e-10));
  vec2 y = (ay.xy * c.w - c.xy * ay.w) * (0.5 * facadeViewport / max(c.w * c.w, 1e-10));
  float area = abs(x.x * y.y - x.y * y.x);
  float pixels;
  if (facadeRelief.w > 0.0) {
    // Width perpendicular to the projected vertical groove, not length(x).
    pixels = area / max(length(y), 1e-8);
  } else {
    // Conservative smallest singular value for multidirectional patterns.
    float trace = dot(x, x) + dot(y, y);
    float largest = sqrt(max(0.5 * (trace + sqrt(max(trace * trace - 4.0 * area * area, 0.0))), 1e-16));
    pixels = area / largest;
  }
  return smoothstep(${RELIEF_FADE_START}, ${RELIEF_FADE_END}, pixels);
}
`

/** Also used by the CPU projection oracle in regression tests. */
export function reliefDetail(pixels: number) {
  const t = Math.max(0, Math.min(1, (pixels - RELIEF_FADE_START) / (RELIEF_FADE_END - RELIEF_FADE_START)))
  return t * t * (3 - 2 * t)
}

export function filterReliefShader(vertex: string) {
  return reliefVertexHeader + vertex
    .replace('void main() {', 'void main() {\n float facadeWeight = facadeDetail();')
    .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
      objectNormal.xy *= mix(1.0, facadeWeight, facadeRelief.y);`)
    .replace('#include <begin_vertex>', `#include <begin_vertex>
      transformed.z += facadeRelief.x * (1.0 - facadeWeight);`)
}

const patched = new WeakMap<Material, Material['onBeforeCompile']>()
export function hasReliefShader(material: Material) { return patched.get(material) === material.onBeforeCompile }

function patchMaterial(material: Material, viewport: Vector2) {
  if (hasReliefShader(material)) return true
  // Do not take ownership of somebody else's shader modifications.
  if (material.onBeforeCompile !== Material.prototype.onBeforeCompile) return false
  material.onBeforeCompile = shader => {
    shader.uniforms.facadeViewport = { value: viewport }
    shader.vertexShader = filterReliefShader(shader.vertexShader)
  }
  patched.set(material, material.onBeforeCompile)
  material.customProgramCacheKey = () => 'facade-screen-relief-v1'
  // Shared finish materials may also render an unfiltered frame/smooth panel.
  Object.assign(material, { defaultAttributeValues: {
    color: [1, 1, 1], uv: [0, 0], uv1: [0, 0], [RELIEF_ATTRIBUTE]: [0, 0, 0, 0],
  } })
  material.needsUpdate = true
  return true
}

const prepared = new WeakMap<BufferGeometry, string>()
/** Geometry is prepared on resize/style changes, never on camera movement.
 * Only axis-aligned panel-local meshes qualify. Position/normal/UV/index and
 * CPU picking/bounds remain original. The shader morph stays inside that shell.
 * Source segmented meshes can be scaled: the feature remains metric in PANEL
 * coordinates, rather than stretching a 3 mm groove with its neighbouring land.
 */
export function prepareReliefGeometry(mesh: Mesh, width: number, height: number, thickness: number,
  bevel: number, profile: ReliefProfile) {
  if ([width, height, thickness, bevel, profile.width, profile.depth].some(n => !Number.isFinite(n)) ||
    Math.min(width, height) <= 2 * bevel || bevel < 0 || profile.width <= 0 || profile.depth <= 0 ||
    profile.depth >= thickness - bevel) return false
  if (mesh.matrixAutoUpdate) mesh.updateMatrix()
  const m = mesh.matrix.elements, geometry = mesh.geometry
  if ([1, 2, 3, 4, 6, 7, 8, 9, 11].some(i => Math.abs(m[i]) > 1e-8) ||
    Math.min(m[0], m[5], m[10]) <= 0) return false
  const positions = geometry.getAttribute('position'), normals = geometry.getAttribute('normal')
  if (!positions || !normals) return false
  const key = JSON.stringify([width, height, thickness, bevel, profile, m])
  if (prepared.get(geometry) === key) return true
  const data = new Float32Array(positions.count * 4), front = thickness / 2
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i) * m[0] + m[12], y = positions.getY(i) * m[5] + m[13]
    const z = positions.getZ(i) * m[10] + m[14]
    const edge = Math.max(0, Math.abs(x) - (width / 2 - bevel), Math.abs(y) - (height / 2 - bevel))
    // Caps follow their front boundary; their side-facing normals remain intact.
    const inFront = z >= front - profile.depth - bevel - 1e-6 && z <= front + 1e-6
    data[i * 4] = inFront ? Math.max(0, front - edge - z) / m[10] : 0
    data[i * 4 + 1] = inFront && normals.getZ(i) > 1e-5 && edge < 1e-7 &&
      (bevel === 0 || (Math.abs(x) < width / 2 - bevel - 1e-6 && Math.abs(y) < height / 2 - bevel - 1e-6)) ? 1 : 0
    data[i * 4 + 2] = profile.width / m[0]
    data[i * 4 + 3] = profile.width / m[5] * (profile.vertical ? 1 : -1)
  }
  geometry.setAttribute(RELIEF_ATTRIBUTE, new Float32BufferAttribute(data, 4))
  prepared.set(geometry, key)
  return true
}

export function createReliefFilter() {
  const viewport = new Vector2(), shadowViewport = new Vector2(), rect = new Vector4()
  let depth: MeshDepthMaterial | null = null, distance: MeshDistanceMaterial | null = null
  const bound = new WeakSet<Mesh>()
  const updateViewport = (renderer: WebGLRenderer, target: Vector2) => {
    renderer.getCurrentViewport(rect); target.set(rect.z, rect.w)
  }
  return {
    attach(mesh: Mesh) {
      // Existing specialised shadow casters need their own integration.
      if (!bound.has(mesh) && (mesh.customDepthMaterial || mesh.customDistanceMaterial)) return
      if (!(mesh.material instanceof MeshStandardMaterial) || !patchMaterial(mesh.material, viewport)) return
      if (bound.has(mesh)) return
      if (!depth || !distance) {
        depth = new MeshDepthMaterial({ depthPacking: RGBADepthPacking }); distance = new MeshDistanceMaterial()
        patchMaterial(depth, shadowViewport); patchMaterial(distance, shadowViewport)
      }
      mesh.customDepthMaterial = depth; mesh.customDistanceMaterial = distance
      bound.add(mesh)
      const before = mesh.onBeforeRender, shadow = mesh.onBeforeShadow
      mesh.onBeforeRender = function (...args) {
        before.apply(this, args); updateViewport(args[0], viewport)
      }
      mesh.onBeforeShadow = function (...args) {
        shadow.apply(this, args); updateViewport(args[0], shadowViewport)
      }
    },
  }
}
