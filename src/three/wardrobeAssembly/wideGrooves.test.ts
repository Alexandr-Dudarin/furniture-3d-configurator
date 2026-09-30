import { expect, it } from 'vitest'
import { Mesh, MeshStandardMaterial, Raycaster, Vector3 } from 'three'
import { createDrawerFacadeGeometry, DRAWER_FACADE_PROFILE } from './drawerFacadeGeometry'
import { createFacadeGeometry, flutingFilterProfile } from '../facades/facadeGeometry'
import { DOOR_FACADE_PROFILE } from './wardrobeDoors'

it('has a 10 mm flat floor inside each 14 mm channel, with two 2 mm walls and 26 mm pitch and unchanged depth', () => {
  for (const notch of [false, true]) {
    const g = createDrawerFacadeGeometry(.564, .246, .016, 'fluted-wide', notch ? 'finger-notch' : 'none')
    const material = new MeshStandardMaterial(), mesh = new Mesh(g, material)
    mesh.updateMatrixWorld()
    const z = (x: number) => new Raycaster(new Vector3(x, 0, .02), new Vector3(0, 0, -1)).intersectObject(mesh)[0].point.z
    for (const center of [-.026, 0, .026]) {
      for (const offset of [-.0045, 0, .0045]) expect(z(center + offset)).toBeCloseTo(.0062, 6)
      expect(z(center + .006)).toBeCloseTo(.0071, 6)
      expect(z(center + .007)).toBeCloseTo(.008, 6)
      // The full uncut land now spans 7..19 mm from this groove's centre.
      for (const offset of [.007, .010, .013, .016, .019]) expect(z(center + offset)).toBeCloseTo(.008, 6)
    }
    g.dispose(); material.dispose()
  }
})
it('keeps floor and lands optically planar; wall normals do not bleed across flat bands', () => {
  const all = [createDrawerFacadeGeometry(.564, .246, .016, 'fluted-wide'),
    createDrawerFacadeGeometry(.564, .246, .016, 'fluted-wide', 'finger-notch'),
    createFacadeGeometry(.496, 2.726, .016, 'fluted-wide', DOOR_FACADE_PROFILE)]
  for (const g of all) {
    const p = g.attributes.position, n = g.attributes.normal
    let floors = 0, lands = 0, walls = 0
    for (let i = 0; i < p.count; i++) {
      if (Math.abs(p.getY(i)) > g.userData.facade.height / 2 - (g.userData.facade.notch ? .046 : .024) + 1e-7 || Math.abs(p.getX(i)) > .20 || n.getZ(i) < .1 || p.getZ(i) < .006) continue
      const phase = Math.abs(p.getX(i) - Math.round(p.getX(i) / .026) * .026)
      if (phase < .005 - 1e-7) { expect(n.getZ(i)).toBeCloseTo(1, 6); floors++ }
      if (phase >= .007 - 1e-7) { expect(n.getZ(i)).toBeCloseTo(1, 6); lands++ }
      if (Math.abs(p.getZ(i) - .0071) < 1e-7) { expect(Math.abs(n.getX(i))).toBeGreaterThan(.7); walls++ }
    }
    expect(floors).toBeGreaterThan(0); expect(lands).toBeGreaterThan(0); expect(walls).toBeGreaterThan(0)
    g.dispose()
  }
  expect(flutingFilterProfile(DRAWER_FACADE_PROFILE, 'fluted-wide').width).toBeCloseTo(.012)
  expect(flutingFilterProfile(DRAWER_FACADE_PROFILE, 'fluted').width).toBe(.004)
})
