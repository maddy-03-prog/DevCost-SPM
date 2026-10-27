import { COST_DRIVERS, type CostDriverRatings } from '../../data/drivers'

export type DevelopmentMode = 'Organic' | 'Semi-detached' | 'Embedded'
export type CocomoResult = { effort: number; duration: number; people: number; eaf: number }

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
