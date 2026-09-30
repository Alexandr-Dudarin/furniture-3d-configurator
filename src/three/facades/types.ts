export type FacadeStyleId = 'original' | 'smooth' | 'frame' | 'fluted' | 'fluted-wide' | 'fluted-sides' | 'diagonal' | 'herringbone' | 'diamonds' | 'herringbone-wide'

/** Panel centre relative to the centre of its closed composition envelope, in metres. */
export type FacadeComposition = { width: number; height: number; x: number; y: number }

export type DiagonalProfile = {
  pitch: number; width: number; depth: number
  margin: number; endMargin: number; minLength: number
}

export type DiamondsProfile = Omit<DiagonalProfile, 'minLength'> & { fade: number }

export type HerringboneProfile = DiagonalProfile & { centerGap: number }

export type FacadeDimension = { base: number; dimension: string; factor: number }
export type FacadeTarget = {
  // Centred, axis-aligned panel group inside the existing moving assembly.
  panel: string
  // Optional closed-front composition group; omitted targets share one envelope.
  compositionGroup?: string
  width: FacadeDimension
  height: FacadeDimension
  thickness: number
  // Drawer rails can be narrower than door rails in the same cabinet.
  frameWidth?: number
  // A flush field leaves the mounting plane of central handles intact.
  frameField?: 'flush'
  // Clear a centred vertical strip for handle feet, without moving grooves.
  flutedClearCenter?: number
}

export type FacadeVariants = {
  defaultStyle: FacadeStyleId
  sourceStyle?: 'original' | 'smooth'
  // Opt-in draw-call reduction for segmented source panels with solid finishes.
  batchSolidSource?: boolean
  // Explicit metric profile for supported recessed, vertical source panels.
  sourceRelief?: { width: number; depth: number }
  styles: readonly FacadeStyleId[]
  // Migrate retired choices from links/storage without changing reset defaults.
  styleFallbacks?: Partial<Record<FacadeStyleId, FacadeStyleId>>
  wideDescription?: string
  targets: readonly FacadeTarget[]
  materialSlot: string
  bevel: number
  frame: { width: number; depth: number; slope: number; minField: number }
  fluted: { pitch: number; width: number; depth: number; margin: number; endMargin: number; fade: number }
  diagonal?: DiagonalProfile
  herringbone?: HerringboneProfile
  diamonds?: DiamondsProfile
}
