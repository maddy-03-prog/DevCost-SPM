import { calculateBasicCocomo, calculateIntermediateCocomo, type DevelopmentMode } from './cocomo'
import type { CostDriverRatings } from '../../data/drivers'
import type { FunctionPointCounts } from './functionPoints'
import { calculateFunctionPoints } from './functionPoints'
import { calculateLocEffort } from './effort'
import { calculateEffortDuration } from './effort'
import { calculatePertExpected } from './pert'

export type MethodEstimate = { method: string; effort: number; duration: number; teamSize: number; cost: number }
export type ComparisonSummary = { min: number; max: number; average: number; variancePercent: number; recommendedLow: number; recommendedHigh: number; insight: string }
export type ComparisonChartPoint = { method: string; effort: number; duration: number; team: number; cost: number }

/** Builds all five comparable estimates using shared project assumptions and the requested PERT range. */
export function calculateMethodEstimates(input: {
  kloc: number; mode: DevelopmentMode; drivers: CostDriverRatings; productivity: number; fpCounts: FunctionPointCounts;
  gscRatings: number[]; fpProductivity: number; teamSize: number; salary: number;
  optimistic: number; mostLikely: number; pessimistic: number;
}): MethodEstimate[] {
  const basic = calculateBasicCocomo(input.kloc, input.mode)
  const intermediate = calculateIntermediateCocomo(input.kloc, input.mode, input.drivers)
  const fp = calculateFunctionPoints(input.fpCounts, input.gscRatings, input.fpProductivity)
  const loc = calculateLocEffort(input.kloc, input.productivity, input.teamSize)
  const pert = calculatePertExpected(input.optimistic, input.mostLikely, input.pessimistic)
  const estimates = [
    { method: 'Basic COCOMO', effort: basic.effort, duration: basic.duration, teamSize: basic.people },
    { method: 'Intermediate COCOMO', effort: intermediate.effort, duration: intermediate.duration, teamSize: intermediate.people },
    { method: 'Function Point', effort: fp.effort, duration: calculateEffortDuration(fp.effort, input.teamSize), teamSize: input.teamSize },
    { method: 'LOC productivity', effort: loc.personMonths, duration: loc.duration, teamSize: input.teamSize },
    { method: 'Three-Point PERT', effort: pert, duration: calculateEffortDuration(pert, input.teamSize), teamSize: input.teamSize },
  ]
  return estimates.map((estimate) => ({ ...estimate, cost: estimate.effort * input.salary }))
}

/** Summarizes effort spread and selects the middle three estimates as a robust planning range. */
export function summarizeComparison(estimates: MethodEstimate[]): ComparisonSummary {
  const ordered = estimates.map((estimate) => estimate.effort).sort((a, b) => a - b)
  if (ordered.length === 0) return { min: 0, max: 0, average: 0, variancePercent: 0, recommendedLow: 0, recommendedHigh: 0, insight: 'Add estimates to compare methods.' }
  const min = ordered[0] ?? 0
  const max = ordered[ordered.length - 1] ?? 0
  const average = ordered.reduce((sum, value) => sum + value, 0) / ordered.length
  const variancePercent = average > 0 ? (max - min) / average * 100 : 0
  const lowerIndex = Math.floor((ordered.length - 1) / 4)
  const upperIndex = Math.ceil((ordered.length - 1) * 3 / 4)
  const recommendedLow = ordered[lowerIndex] ?? min
  const recommendedHigh = ordered[upperIndex] ?? max
  return {
    min, max, average, variancePercent, recommendedLow, recommendedHigh,
    insight: `Estimates differ by ${variancePercent.toFixed(0)}%; a practical planning range is ${recommendedLow.toFixed(1)}–${recommendedHigh.toFixed(1)} person-months. Validate outliers against scope and team productivity.`,
  }
}

/** Calculates deviation from the comparison mean as a signed percentage. */
export function calculateDeviationPercent(value: number, average: number): number {
  return average > 0 ? (value - average) / average * 100 : 0
}

/** Normalizes each comparison metric to its own maximum so the grouped chart remains readable. */
export function normalizeComparison(estimates: MethodEstimate[]): ComparisonChartPoint[] {
  const maximums = {
    effort: Math.max(0, ...estimates.map((estimate) => estimate.effort)),
    duration: Math.max(0, ...estimates.map((estimate) => estimate.duration)),
    team: Math.max(0, ...estimates.map((estimate) => estimate.teamSize)),
    cost: Math.max(0, ...estimates.map((estimate) => estimate.cost)),
  }
  return estimates.map((estimate) => ({
    method: estimate.method,
    effort: maximums.effort > 0 ? estimate.effort / maximums.effort * 100 : 0,
    duration: maximums.duration > 0 ? estimate.duration / maximums.duration * 100 : 0,
    team: maximums.team > 0 ? estimate.teamSize / maximums.team * 100 : 0,
    cost: maximums.cost > 0 ? estimate.cost / maximums.cost * 100 : 0,
  }))
}
