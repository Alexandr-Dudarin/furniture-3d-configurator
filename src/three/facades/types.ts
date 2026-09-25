export type FacadeStyleId = 'original' | 'smooth' | 'frame' | 'fluted' | 'fluted-sides' | 'diagonal' | 'herringbone' | 'diamonds'

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
  styles: readonly FacadeStyleId[]
  targets: readonly FacadeTarget[]
  materialSlot: string
  bevel: number
  frame: { width: number; depth: number; slope: number; minField: number }
  fluted: { pitch: number; width: number; depth: number; margin: number; endMargin: number; fade: number }
  diagonal?: DiagonalProfile
  herringbone?: HerringboneProfile
  diamonds?: DiamondsProfile
}
