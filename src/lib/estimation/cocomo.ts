import { COST_DRIVERS, type CostDriverRatings } from '../../data/drivers'

export type DevelopmentMode = 'Organic' | 'Semi-detached' | 'Embedded'
export type CocomoResult = { effort: number; duration: number; people: number; eaf: number }
export type PhaseEffort = { phase: string; percentage: number; personMonths: number }
export type StaffingPoint = { month: number; people: number }

const coefficients: Record<DevelopmentMode, { a: number; b: number; c: number; d: number }> = {
  Organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
  'Semi-detached': { a: 3, b: 1.12, c: 2.5, d: 0.35 },
  Embedded: { a: 3.6, b: 1.2, c: 2.5, d: 0.32 },
}

const intermediateCoefficients: Record<DevelopmentMode, { a: number; b: number; c: number; d: number }> = {
  Organic: { a: 3.2, b: 1.05, c: 2.5, d: 0.38 },
  'Semi-detached': { a: 3, b: 1.12, c: 2.5, d: 0.35 },
  Embedded: { a: 2.8, b: 1.2, c: 2.5, d: 0.32 },
}
const phasePercentages: Record<DevelopmentMode, [number, number, number, number]> = {
  Organic: [6, 40, 38, 16],
  'Semi-detached': [7, 42, 33, 18],
  Embedded: [8, 43, 35, 14],
}

export const NOMINAL_DRIVERS: CostDriverRatings = {
  RELY: 'N', DATA: 'N', CPLX: 'N', TIME: 'N', STOR: 'N', VIRT: 'N', TURN: 'N',
  ACAP: 'N', AEXP: 'N', PCAP: 'N', VEXP: 'N', LEXP: 'N', MODP: 'N', TOOL: 'N', SCED: 'N',
}

/** Basic COCOMO effort is a × KLOC^b; schedule is c × effort^d and staffing is effort / schedule. */
export function calculateBasicCocomo(kloc: number, mode: DevelopmentMode): CocomoResult {
  const { a, b, c, d } = coefficients[mode]
  const effort = a * Math.pow(kloc, b)
  const duration = c * Math.pow(effort, d)
  return { effort, duration, people: effort / duration, eaf: 1 }
}

/** Intermediate EAF is the product of the 15 selected cost-driver multipliers. */
export function calculateEaf(ratings: CostDriverRatings): number {
  return Object.values(COST_DRIVERS).flatMap((group) => Object.entries(group)).reduce((product, [key, driver]) => {
    const level = ratings[key as keyof CostDriverRatings] as keyof typeof driver.values
    return product * driver.values[level]
  }, 1)
}

/** Intermediate COCOMO multiplies a × KLOC^b by the driver EAF, then applies the COCOMO schedule equation. */
export function calculateIntermediateCocomo(kloc: number, mode: DevelopmentMode, ratings: CostDriverRatings): CocomoResult {
  const { a, b, c, d } = intermediateCoefficients[mode]
  const eaf = calculateEaf(ratings)
  const effort = a * Math.pow(kloc, b) * eaf
  const duration = c * Math.pow(effort, d)
  return { effort, duration, people: effort / duration, eaf }
}

/** Applies the documented mode-specific phase allocation to the estimated person-month effort. */
export function calculatePhaseDistribution(effort: number, mode: DevelopmentMode): PhaseEffort[] {
  const phases = ['Plans & Requirements', 'Design', 'Coding', 'Integration & Test']
  return phases.map((phase, index) => ({
    phase,
    percentage: phasePercentages[mode][index],
    personMonths: effort * phasePercentages[mode][index] / 100,
  }))
}

/** Produces a normalized Rayleigh-style staffing curve across project months. */
export function calculateStaffingProfile(effort: number, duration: number, points = 12): StaffingPoint[] {
  if (duration <= 0 || points <= 0) return []
  const sigma = duration / 3
  const raw = Array.from({ length: points }, (_, index) => {
    const month = duration * (index + 1) / points
    return { month, value: (month / (sigma * sigma)) * Math.exp(-(month * month) / (2 * sigma * sigma)) }
  })
  const area = raw.reduce((sum, point) => sum + point.value, 0)
  const interval = duration / points
  return raw.map((point) => ({ month: point.month, people: area > 0 ? (point.value / area) * effort / interval : 0 }))
}
