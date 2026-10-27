import { describe, expect, it } from 'vitest'
import { calculateBasicCocomo, calculateEaf, calculateIntermediateCocomo, NOMINAL_DRIVERS } from './cocomo'
import { calculateAfp, calculateFunctionPointEffort, calculateFunctionPoints, calculateUfp, calculateVaf, convertFpToLoc, FP_WEIGHTS } from './functionPoints'
import { calculateBudget, calculateOtherCost, calculatePersonnelCost } from './budget'
import { calculatePert, calculatePertExpected, calculatePertStandardDeviation } from './pert'
import { formatCurrency, formatNumber } from './format'
import { calculateEffortDuration, calculateLocEffort, calculateProductivityEffort } from './effort'
import { calculatePhaseDistribution, calculateStaffingProfile } from './cocomo'

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
  const counts = {
    EI: { Low: 2, Average: 3, High: 1 },
    EO: { Low: 1, Average: 2, High: 0 },
    EQ: { Low: 2, Average: 1, High: 1 },
    ILF: { Low: 1, Average: 2, High: 0 },
    EIF: { Low: 1, Average: 0, High: 1 },
  }

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
  })
})

describe('formatting', () => {
  it('formats currency and numbers with locale-appropriate separators', () => {
    expect(formatCurrency(1234567, 'INR')).toContain('12,34,567')
    expect(formatNumber(1234.56, 1)).toBe('1,234.6')
  })

  describe('effort methods', () => {
    it('calculates size, productivity, and team duration', () => {
      expect(calculateLocEffort(10, 500, 5)).toEqual({ personMonths: 20, personHours: 3200, duration: 4 })
      expect(calculateEffortDuration(24, 6)).toBe(4)
      expect(calculateEffortDuration(24, 0)).toBe(0)
      expect(calculateProductivityEffort(100, 8, 4)).toEqual({ personMonths: 5, personHours: 800, duration: 1.25 })
    })
  })
})
