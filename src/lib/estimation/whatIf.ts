import { calculateIntermediateCocomo, type DevelopmentMode } from './cocomo'
import type { CostDriverRatings } from '../../data/drivers'

export type ScenarioMetrics = { effort: number; duration: number; team: number; cost: number }
export type SensitivityItem = { driver: string; impact: number }
export type CurvePoint = { x: number; y: number }
export type ScenarioControls = { complexity: number; experience: number; schedule: number; tools: number }
const EXPERIENCE_LEVELS = ['VL', 'L', 'N', 'H', 'VH'] as const
const COMPLEXITY_LEVELS = ['VL', 'L', 'N', 'H', 'VH', 'XH'] as const

/** Maps what-if slider positions onto the matching COCOMO rating levels without mutating baseline drivers. */
export function applyScenarioRatings(baseline: CostDriverRatings, controls: ScenarioControls): CostDriverRatings {
  const experience = EXPERIENCE_LEVELS[controls.experience - 1] ?? 'N'
  const complexity = COMPLEXITY_LEVELS[controls.complexity - 1] ?? 'N'
  const schedule = EXPERIENCE_LEVELS[controls.schedule - 1] ?? 'N'
  const tools = EXPERIENCE_LEVELS[controls.tools - 1] ?? 'N'
  return { ...baseline, CPLX: complexity, ACAP: experience, AEXP: experience, PCAP: experience, SCED: schedule, TOOL: tools }
}

/** Returns the one-based slider position for a COCOMO rating, falling back to nominal if unavailable. */
export function ratingPosition(rating: string, category: 'five-level' | 'complexity' = 'five-level'): number {
  const levels: readonly string[] = category === 'complexity' ? COMPLEXITY_LEVELS : EXPERIENCE_LEVELS
  const position = levels.indexOf(rating)
  return position < 0 ? 3 : position + 1
}

/** Scenario cost is estimated effort multiplied by the average monthly salary assumption. */
export function calculateScenarioMetrics(kloc: number, teamSize: number, salary: number, mode: DevelopmentMode, drivers: CostDriverRatings): ScenarioMetrics {
  const estimate = calculateIntermediateCocomo(kloc, mode, drivers)
  return { effort: estimate.effort, duration: teamSize > 0 ? estimate.effort / teamSize : 0, team: teamSize, cost: estimate.effort * salary }
}

/** Returns signed percentage change from baseline, with zero used when baseline is zero. */
export function calculateDeltaPercent(baseline: number, scenario: number): number {
  return baseline === 0 ? 0 : (scenario - baseline) / baseline * 100
}

/** Estimates the influence of each selected driver by changing it to its high-impact reference rating. */
export function calculateSensitivity(kloc: number, mode: DevelopmentMode, drivers: CostDriverRatings): SensitivityItem[] {
  const baseline = calculateIntermediateCocomo(kloc, mode, drivers).effort
  const testRatings = [
    { key: 'CPLX', value: 'VH', label: 'Product complexity' },
    { key: 'ACAP', value: 'VL', label: 'Analyst capability' },
    { key: 'AEXP', value: 'VL', label: 'Applications experience' },
    { key: 'PCAP', value: 'VL', label: 'Programmer capability' },
    { key: 'SCED', value: 'VH', label: 'Schedule pressure' },
    { key: 'TOOL', value: 'VL', label: 'Tool support' },
  ] as const
  return testRatings.map(({ key, value, label }) => {
    const changed = calculateIntermediateCocomo(kloc, mode, { ...drivers, [key]: value })
    return { driver: label, impact: baseline === 0 ? 0 : (changed.effort - baseline) / baseline * 100 }
  }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
}

/** Calculates effort at representative sizes for a live size-sensitivity chart. */
export function calculateSizeCurve(kloc: number, mode: DevelopmentMode, drivers: CostDriverRatings): CurvePoint[] {
  const sizes = [Math.max(1, kloc * 0.25), Math.max(2, kloc * 0.5), kloc, kloc * 1.5, kloc * 2]
  return sizes.map((x) => ({ x, y: calculateIntermediateCocomo(x, mode, drivers).effort }))
}

/** Calculates effort change as team experience improves across the five COCOMO rating levels. */
export function calculateExperienceCurve(kloc: number, salary: number, mode: DevelopmentMode, drivers: CostDriverRatings): CurvePoint[] {
  const levels = ['VL', 'L', 'N', 'H', 'VH'] as const
  return levels.map((level, index) => {
    const ratings = { ...drivers, ACAP: level, AEXP: level, PCAP: level }
    return { x: index + 1, y: calculateIntermediateCocomo(kloc, mode, ratings).effort * salary }
  })
}
