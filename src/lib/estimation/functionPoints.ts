export type Complexity = 'Low' | 'Average' | 'High'
export type FunctionPointCounts = Record<'EI' | 'EO' | 'EQ' | 'ILF' | 'EIF', Record<Complexity, number>>
export type FunctionPointResult = { ufp: number; vaf: number; afp: number; effort: number; loc: number }

export const FP_WEIGHTS: Record<keyof FunctionPointCounts, Record<Complexity, number>> = {
  EI: { Low: 3, Average: 4, High: 6 },
  EO: { Low: 4, Average: 5, High: 7 },
  EQ: { Low: 3, Average: 4, High: 6 },
  ILF: { Low: 7, Average: 10, High: 15 },
  EIF: { Low: 5, Average: 7, High: 10 },
}

export const LOC_PER_FP = { Java: 53, Python: 35, JavaScript: 47, C: 128, 'C++': 55, 'C#': 54 } as const

/** UFP is the sum of each function count times its complexity weight. */
export function calculateUfp(counts: FunctionPointCounts): number {
  return (Object.keys(FP_WEIGHTS) as Array<keyof FunctionPointCounts>).reduce(
    (total, type) => total + (Object.keys(FP_WEIGHTS[type]) as Complexity[]).reduce(
      (subtotal, complexity) => subtotal + counts[type][complexity] * FP_WEIGHTS[type][complexity], 0,
    ), 0,
  )
}

/** VAF is 0.65 + 0.01 times the sum of the 14 general system characteristic ratings. */
export function calculateVaf(gscRatings: number[]): number {
  return 0.65 + 0.01 * gscRatings.reduce((sum, rating) => sum + rating, 0)
}

/** Adjusted function points are UFP multiplied by VAF. */
export function calculateAfp(ufp: number, vaf: number): number {
  return ufp * vaf
}

/** Function-point effort is adjusted function points divided by productivity in FP per person-month. */
export function calculateFunctionPointEffort(afp: number, fpPerPersonMonth: number): number {
  return afp / fpPerPersonMonth
}

/** Estimated LOC is adjusted function points multiplied by the selected language conversion factor. */
export function convertFpToLoc(afp: number, language: keyof typeof LOC_PER_FP): number {
  return afp * LOC_PER_FP[language]
}

/** Calculates the complete FP output using the standard weight, adjustment, and productivity equations. */
export function calculateFunctionPoints(counts: FunctionPointCounts, ratings: number[], productivity: number, language?: keyof typeof LOC_PER_FP): FunctionPointResult {
  const ufp = calculateUfp(counts)
  const vaf = calculateVaf(ratings)
  const afp = calculateAfp(ufp, vaf)
  return { ufp, vaf, afp, effort: calculateFunctionPointEffort(afp, productivity), loc: language ? convertFpToLoc(afp, language) : 0 }
}
