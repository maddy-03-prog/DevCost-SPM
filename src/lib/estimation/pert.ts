export type PertEstimate = { expected: number; standardDeviation: number }

/** PERT expected value is (optimistic + 4 × most likely + pessimistic) / 6. */
export function calculatePertExpected(optimistic: number, mostLikely: number, pessimistic: number): number {
  return (optimistic + 4 * mostLikely + pessimistic) / 6
}

/** PERT standard deviation is (pessimistic − optimistic) / 6. */
export function calculatePertStandardDeviation(optimistic: number, pessimistic: number): number {
  return (pessimistic - optimistic) / 6
}

export function calculatePert(optimistic: number, mostLikely: number, pessimistic: number): PertEstimate {
  return {
    expected: calculatePertExpected(optimistic, mostLikely, pessimistic),
    standardDeviation: calculatePertStandardDeviation(optimistic, pessimistic),
  }
}
