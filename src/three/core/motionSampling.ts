// Spatial samples belong to ONE camera/content state. Never reuse a previous
// animation frame: doors, highlights and silhouettes must not leave trails.
export const motionOffsets = {
  2: [[-.25, -.25], [.25, .25]],
  4: [[-.375, -.125], [-.125, .375], [.125, -.375], [.375, .125]],
} as const
export type MotionSamples = 1 | 2 | 4

/** Conservative frame-cadence heuristic, not a GPU timer or a device benchmark. */
export function createMotionSamplingBudget() {
  let samples: MotionSamples = 2
  let previous: number | null = null, slow = 0, fast = 0, cooldownUntil = 0
  let intervals = 0, intervalSum = 0, frames = 0, cpuSum = 0
  return {
    observe(now: number, submissionMs: number) {
      frames++; cpuSum += Math.max(0, submissionMs)
      const interval = previous === null ? 0 : now - previous
      previous = now
      // Loading, pauses, background tabs and idle refinement are not moving FPS.
      if (interval <= 0 || interval > 1000) { slow = 0; fast = 0; return }
      intervals++; intervalSum += interval
      const overloaded = interval > 24 || submissionMs > 12
      slow = overloaded ? slow + 1 : 0
      fast = !overloaded && interval < 19 && submissionMs < 8 ? fast + 1 : 0
      if (slow >= 4 && samples > 1) {
        samples = samples === 4 ? 2 : 1
        cooldownUntil = now + 2000; slow = 0; fast = 0
      } else if (fast >= 90 && now >= cooldownUntil && samples < 4) {
        samples = samples === 1 ? 2 : 4
        cooldownUntil = now + 2000; slow = 0; fast = 0
      }
    },
    pause() { previous = null; slow = 0; fast = 0 },
    get samples() { return samples },
    get stats() {
      return {
        samples, movingFrames: frames,
        meanMovingFrameMs: intervals ? intervalSum / intervals : null,
        meanSubmissionMs: frames ? cpuSum / frames : null,
      }
    },
  }
}
