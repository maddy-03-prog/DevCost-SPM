import { describe, expect, it } from 'vitest'
import { calculateBasicCocomo, calculateEaf, calculateIntermediateCocomo, NOMINAL_DRIVERS } from './cocomo'
import { calculateAfp, calculateFunctionPointEffort, calculateFunctionPoints, calculateUfp, calculateVaf, convertFpToLoc, FP_WEIGHTS } from './functionPoints'
import { calculateBudget, calculateCashFlow, calculateCostBreakdown, calculateCostPerUnit, calculateOtherCost, calculatePersonnelCost } from './budget'
import { calculatePert, calculatePertExpected, calculatePertStandardDeviation } from './pert'
import { formatCurrency, formatNumber } from './format'
import { calculateEffortDuration, calculateLocEffort, calculateProductivityEffort } from './effort'
import { calculatePhaseDistribution, calculateStaffingProfile } from './cocomo'
import { calculateDeviationPercent, calculateMethodEstimates, normalizeComparison, summarizeComparison } from './comparison'
import { applyScenarioRatings, calculateDeltaPercent, calculateExperienceCurve, calculateScenarioMetrics, calculateSensitivity, calculateSizeCurve, ratingPosition } from './whatIf'
import { calculateReportData } from './report'
import { initialProject } from '../../store/useProjectStore'
import { initialSettings } from '../../store/useProjectStore'
import { buildCsv, createProjectSnapshot, parseProjectSnapshot } from '../projectFile'

const counts = {
  EI: { Low: 2, Average: 3, High: 1 },
  EO: { Low: 1, Average: 2, High: 0 },
  EQ: { Low: 2, Average: 1, High: 1 },
  ILF: { Low: 1, Average: 2, High: 0 },
  EIF: { Low: 1, Average: 0, High: 1 },
}

describe('COCOMO estimation', () => {
  it('calculates the required 32 KLOC organic basic case', () => {
    const result = calculateBasicCocomo(32, 'Organic')
    expect(result.effort).toBeCloseTo(91.3, 0)
    expect(result.duration).toBeCloseTo(13.9, 0)
    expect(result.people).toBeCloseTo(6.6, 0)
  })

  it('returns an EAF of one for nominal ratings', () => {
    expect(calculateEaf(NOMINAL_DRIVERS)).toBe(1)
    expect(calculateIntermediateCocomo(32, 'Organic', NOMINAL_DRIVERS).eaf).toBe(1)
  })

  it('multiplies selected non-nominal multipliers', () => {
    const ratings = { ...NOMINAL_DRIVERS, RELY: 'H' as const, ACAP: 'L' as const }
    expect(calculateEaf(ratings)).toBeCloseTo(1.15 * 1.19)
    expect(calculateIntermediateCocomo(10, 'Organic', ratings).effort).toBeGreaterThan(calculateIntermediateCocomo(10, 'Organic', NOMINAL_DRIVERS).effort)
  })

  it('distributes effort by mode and creates a normalized staffing profile', () => {
    expect(calculatePhaseDistribution(100, 'Organic').map((phase) => phase.percentage)).toEqual([6, 40, 38, 16])
    const profile = calculateStaffingProfile(120, 12)
    expect(profile).toHaveLength(12)
    expect(profile.reduce((sum, point) => sum + point.people, 0)).toBeCloseTo(120)
    expect(calculateStaffingProfile(10, 0)).toEqual([])
  })
})

describe('function point estimation', () => {
  it('uses the standard weights and adjustment equations', () => {
    expect(FP_WEIGHTS.EI.Average).toBe(4)
    expect(calculateUfp(counts)).toBe(96)
    expect(calculateVaf(Array(14).fill(3))).toBeCloseTo(1.07)
    expect(calculateAfp(96, 1.07)).toBeCloseTo(102.72)
    expect(calculateFunctionPointEffort(120, 12)).toBe(10)
    expect(convertFpToLoc(10, 'Python')).toBe(350)
    expect(calculateFunctionPoints(counts, Array(14).fill(3), 12, 'JavaScript')).toMatchObject({ ufp: 96, vaf: 1.07, afp: 102.72, loc: 4827.84 })
  })
})

describe('PERT estimation', () => {
  it('calculates expected value and standard deviation', () => {
    expect(calculatePertExpected(80, 100, 140)).toBe(103.33333333333333)
    expect(calculatePertStandardDeviation(80, 140)).toBe(10)
    expect(calculatePert(80, 100, 140)).toMatchObject({ expected: 103.33333333333333, standardDeviation: 10 })
  })
})

describe('budget estimation', () => {
  const team = [{ role: 'Developer', headcount: 2, monthlySalary: 1000, allocation: 50, months: 3 }]
  const costs = { cloudMonthly: 100, hardware: 200, licenses: 0, tools: 0, training: 0, marketing: 0, office: 0, thirdPartyApis: 0, custom: 0 }

  it('calculates personnel, other costs, contingency, and totals', () => {
    expect(calculatePersonnelCost(team)).toBe(3000)
    expect(calculateOtherCost(costs, 3)).toBe(500)
    expect(calculateBudget(team, costs, { contingencyPercent: 10, overheadPercent: 0, taxPercent: 0 }, 3)).toMatchObject({
      personnel: 3000, directOther: 500, overhead: 0, contingency: 350, tax: 0, total: 3850, monthly: 3850 / 3,
    })
    expect(calculateCostBreakdown(calculateBudget(team, costs, { contingencyPercent: 10, overheadPercent: 0, taxPercent: 0 }, 3))).toEqual([
      { name: 'Team', value: 3000 }, { name: 'Other costs', value: 500 }, { name: 'Overhead', value: 0 }, { name: 'Contingency', value: 350 }, { name: 'Tax', value: 0 },
    ])
    expect(calculateCashFlow(900, 2.2)).toEqual([{ month: 1, amount: 300 }, { month: 2, amount: 300 }, { month: 3, amount: 300 }])
    expect(calculateCashFlow(900, 0)).toEqual([])
    expect(calculateCostPerUnit(100, 4)).toBe(25)
    expect(calculateCostPerUnit(100, 0)).toBe(0)
  })
})

describe('formatting', () => {
  it('formats currency and numbers with locale-appropriate separators', () => {
    expect(formatCurrency(1234567, 'INR')).toContain('12,34,567')
    expect(formatNumber(1234.56, 1)).toBe('1,234.6')
    expect(formatNumber(1234567, 0, 'en-US')).toBe('1,234,567')
  })
})

describe('effort methods', () => {
    it('calculates size, productivity, and team duration', () => {
      expect(calculateLocEffort(10, 500, 5)).toEqual({ personMonths: 20, personHours: 3200, duration: 4 })
      expect(calculateEffortDuration(24, 6)).toBe(4)
      expect(calculateEffortDuration(24, 0)).toBe(0)
      expect(calculateProductivityEffort(100, 8, 4)).toEqual({ personMonths: 5, personHours: 800, duration: 1.25 })
    })

})

describe('method comparison', () => {
  const estimates = [
    { method: 'A', effort: 10, duration: 2, teamSize: 5, cost: 100 },
    { method: 'B', effort: 20, duration: 4, teamSize: 5, cost: 200 },
    { method: 'C', effort: 30, duration: 6, teamSize: 5, cost: 300 },
  ]

  it('creates five estimates and summarizes spread with a normalized chart', () => {
    const fullEstimates = calculateMethodEstimates({
      kloc: 32, mode: 'Organic', drivers: NOMINAL_DRIVERS, productivity: 500, fpCounts: counts,
      gscRatings: Array(14).fill(3), fpProductivity: 12, teamSize: 7, salary: 95000,
      optimistic: 80, mostLikely: 100, pessimistic: 140,
    })
    expect(fullEstimates).toHaveLength(5)
    expect(fullEstimates[4]?.effort).toBeCloseTo(103.333333)
    expect(summarizeComparison(estimates)).toMatchObject({ min: 10, max: 30, average: 20, variancePercent: 100, recommendedLow: 10, recommendedHigh: 30 })
    expect(summarizeComparison([]).insight).toContain('Add estimates')
    expect(normalizeComparison(estimates)).toMatchObject([{ effort: 33.33333333333333 }, { effort: 66.66666666666666 }, { effort: 100 }])
    expect(normalizeComparison([])).toEqual([])
    expect(calculateDeviationPercent(30, 20)).toBe(50)
    expect(calculateDeviationPercent(30, 0)).toBe(0)
  })
})

describe('what-if scenarios', () => {
  it('maps controls, estimates deltas, curves, and driver sensitivity', () => {
    const controls = { complexity: 6, experience: 5, schedule: 2, tools: 4 }
    const ratings = applyScenarioRatings(NOMINAL_DRIVERS, controls)
    expect(ratings).toMatchObject({ CPLX: 'XH', ACAP: 'VH', AEXP: 'VH', PCAP: 'VH', SCED: 'L', TOOL: 'H' })
    expect(ratingPosition('XH', 'complexity')).toBe(6)
    expect(ratingPosition('NA')).toBe(3)
    expect(calculateScenarioMetrics(32, 8, 95000, 'Organic', ratings)).toMatchObject({ team: 8 })
    expect(calculateScenarioMetrics(32, 0, 95000, 'Organic', ratings).duration).toBe(0)
    expect(calculateDeltaPercent(100, 120)).toBe(20)
    expect(calculateDeltaPercent(0, 120)).toBe(0)
    expect(calculateSensitivity(32, 'Organic', NOMINAL_DRIVERS)).toHaveLength(6)
    expect(calculateSizeCurve(32, 'Organic', NOMINAL_DRIVERS)).toHaveLength(5)
    expect(calculateExperienceCurve(32, 95000, 'Organic', NOMINAL_DRIVERS)).toHaveLength(5)
  })

  describe('report data', () => {
    it('collects a complete report from the shared project baseline', () => {
      const report = calculateReportData(initialProject)
      expect(report.methods).toHaveLength(5)
      expect(report.phases.reduce((sum, phase) => sum + phase.percentage, 0)).toBe(100)
      expect(report.risks.length).toBeGreaterThan(0)
      expect(report.assumptions.length).toBeGreaterThan(0)
    })
  })

  describe('project file exports', () => {
    it('creates and validates a project snapshot and escapes CSV values', () => {
      const snapshot = createProjectSnapshot(initialProject, initialSettings, [])
      expect(parseProjectSnapshot(snapshot)).toMatchObject({ version: 1, project: { name: initialProject.name }, scenarios: [] })
      expect(() => parseProjectSnapshot({ version: 99 })).toThrow('not a supported DevCost')
      expect(buildCsv([['project', 'name'], ['DevCost', 'A, "B"']])).toBe('"project","name"\r\n"DevCost","A, ""B"""')
    })
  })
})
