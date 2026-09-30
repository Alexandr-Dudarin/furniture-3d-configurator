import { BoxGeometry, BufferGeometry, CylinderGeometry, ExtrudeGeometry, LatheGeometry, Shape, Vector2 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import type { HardwareHandle } from '../../configurator/handles'

// Local X follows the handle length. Z=0 is the FRONT of the facade;
// The U profile wraps the panel edge. Gamma planks start at their own top Y=0.
// Only the owning controller disposes the shared result.
export function createHandleGeometry(style: HardwareHandle | 'long-bar', lengthOverride?: number, panelThickness = .016, faceScale = 1): BufferGeometry {
  const pieces: BufferGeometry[] = []
  const add = (g: BufferGeometry, x: number, y: number, z: number) => { g.translate(x, y, z); pieces.push(g) }
  const box = (w: number, h: number, d: number, x: number, y: number, z: number) => add(new BoxGeometry(w, h, d), x, y, z)
  const cylinder = (radius: number, length: number, x: number, y: number, z: number, axis: 'x' | 'z') => {
    const g = new CylinderGeometry(radius, radius, length, 24)
    if (axis === 'x') g.rotateZ(Math.PI / 2); else g.rotateX(Math.PI / 2)
    add(g, x, y, z)
  }
  if (style === 'bar') {
    cylinder(.004, .136, 0, 0, .024, 'x')
    for (const side of [-1, 1]) cylinder(.004, .020, side * .064, 0, .010, 'z')
  } else if (style === 'knob') {
    cylinder(.014, .008, 0, 0, .016, 'z'); cylinder(.004, .012, 0, 0, .006, 'z')
  } else if (style === 'semicircle') {
    const s = new Shape(); s.moveTo(-.039, 0); s.lineTo(.039, 0)
    s.absellipse(0, 0, .039, .037, 0, -Math.PI, true); s.closePath()
    add(new ExtrudeGeometry(s, { depth: .003, bevelEnabled: false, curveSegments: 24 }), 0, 0, .017)
    box(.070, .003, .017, 0, -.0015, .0085)
  } else if (style === 'edge-pull' || style === 'profile') {
    const length = lengthOverride ?? (style === 'profile' ? .220 : .110)
    const rear = -panelThickness
    // U wraps the top edge. The thick Gamma is instead mounted on the FACE:
    // a 12 mm horizontal root joins the panel, with 24 mm finger clearance
    // under it and a 12 mm outer hook. No part lies on the panel's top edge.
    const section = style === 'profile'
      ? [[rear - .002, .0015], [.028, .0015], [.028, -.040], [.025, -.040], [.025, 0], [rear, 0], [rear, -.026], [rear - .002, -.026]]
      : [[0, 0], [.036, 0], [.036, -.032], [.024, -.032], [.024, -.012], [0, -.012]]
    const s = new Shape()
    for (const [i, [z, y]] of section.entries()) {
      if (i === 0) s.moveTo(z, y); else s.lineTo(z, y)
    }
    s.closePath()
    const g = new ExtrudeGeometry(s, { depth: length, bevelEnabled: false })
    // Extrusion Z -> length X, shape X -> depth Z.
    g.rotateY(-Math.PI / 2); add(g, length / 2, 0, 0)
  } else if (style === 'classic') {
    cylinder(.006, .100, 0, 0, .027, 'x')
    // Turned ends and flared mounting feet, without expensive micro-rib meshes.
    for (const side of [-1, 1]) {
      const points = [[.006, 0], [.006, .004], [.004, .006], [.003, .009], [.005, .012], [.004, .014], [.003, .020], [.004, .024], [.002, .030], [.002, .036], [0, .039]].map(([r, y]) => new Vector2(r, y))
      const end = new LatheGeometry(points, 24); end.rotateZ(-side * Math.PI / 2); add(end, side * .050, 0, .027)
      const foot = new LatheGeometry([[0, 0], [.007, 0], [.007, .002], [.005, .004], [.003, .018], [.004, .024], [0, .024]].map(([r, y]) => new Vector2(r, y)), 24)
      foot.rotateX(Math.PI / 2); add(foot, side * .064, 0, 0)
    }
  } else {
    const length = lengthOverride ?? (style === 'long-bar' ? .600 : .160)
    box(length, .014, .010, 0, 0, .023)
    for (const side of [-1, 1]) box(.010, .014, .018, side * (length / 2 - .012), 0, .009)
  }
  const plain = pieces.map(g => g.index ? g.toNonIndexed() : g)
  const geometry = mergeGeometries(plain)!
  new Set([...pieces, ...plain]).forEach(g => g.dispose())
  geometry.scale(faceScale, faceScale, 1)
  geometry.computeBoundingBox(); geometry.computeBoundingSphere()
  return geometry
}

export function createNotchedFront(width: number, height: number, thickness: number) {
  const x = width / 2, y = height / 2, halfWidth = .050, depth = .030
  const s = new Shape(); s.moveTo(-x, -y); s.lineTo(x, -y); s.lineTo(x, y); s.lineTo(halfWidth, y)
  s.absellipse(0, y, halfWidth, depth, 0, -Math.PI, true)
  s.lineTo(-x, y); s.closePath()
  const geometry = new ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, curveSegments: 24 })
  geometry.translate(0, 0, -thickness / 2)
  return geometry
}
