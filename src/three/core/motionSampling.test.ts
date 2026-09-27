import { describe, expect, it } from 'vitest'
import { createMotionSamplingBudget, motionOffsets } from './motionSampling'

describe('moving quality budget', () => {
  it('starts bounded, reduces work under sustained load and recovers gradually', () => {
    const b = createMotionSamplingBudget()
    expect(b.samples).toBe(2)
    for (let i = 0; i < 5; i++) b.observe(i * 33, 15)
    expect(b.samples).toBe(1)
    let now = 132
    for (let i = 0; i < 90; i++) { now += 16; b.observe(now, 3) }
    expect(b.samples).toBe(1) // cooldown prevents immediately probing again
    for (let i = 0; i < 40; i++) { now += 16; b.observe(now, 3) }
    expect(b.samples).toBe(2)
    for (let i = 0; i < 130; i++) { now += 16; b.observe(now, 3) }
    expect(b.samples).toBe(4)
    for (let i = 0; i < 4; i++) { now += 33; b.observe(now, 15) }
    expect(b.samples).toBe(2)
    for (let i = 0; i < 4; i++) { now += 33; b.observe(now, 15) }
    expect(b.samples).toBe(1)
  })
  it('ignores idle gaps and isolated stalls rather than oscillating on every frame', () => {
    const b = createMotionSamplingBudget()
    b.observe(0, 300); b.pause(); b.observe(10000, 300)
    expect(b.samples).toBe(2); expect(b.stats.meanMovingFrameMs).toBeNull()
    b.observe(10016, 3); b.observe(10049, 15); b.observe(10065, 3)
    expect(b.samples).toBe(2)
    b.observe(20000, 300); expect(b.samples).toBe(2)
  })
  it('uses centred distinct phases on both axes without moving the average image', () => {
    for (const offsets of Object.values(motionOffsets)) {
      for (const axis of [0, 1]) {
        expect(offsets.reduce((s, p) => s + p[axis], 0)).toBe(0)
        expect(new Set(offsets.map(p => p[axis])).size).toBe(offsets.length)
        expect(offsets.every(p => Math.abs(p[axis]) < .5)).toBe(true)
      }
    }
  })
})
