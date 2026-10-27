export type EffortResult = { personMonths: number; personHours: number; duration: number }

/** LOC-based effort is total lines of code divided by lines delivered per person-month. */
export function calculateLocEffort(kloc: number, productivityLocPerMonth: number, teamSize: number): EffortResult {
  const personMonths = (kloc * 1000) / productivityLocPerMonth
  return { personMonths, personHours: personMonths * 160, duration: teamSize > 0 ? personMonths / teamSize : 0 }
}

/** Function-point duration is estimated effort divided evenly by the selected team size. */
export function calculateEffortDuration(personMonths: number, teamSize: number): number {
  return teamSize > 0 ? personMonths / teamSize : 0
}

/** Productivity effort converts estimated unit-hours into person-months using a 160-hour person-month. */
export function calculateProductivityEffort(units: number, hoursPerUnit: number, teamSize: number): EffortResult {
  const personHours = units * hoursPerUnit
  const personMonths = personHours / 160
  return { personMonths, personHours, duration: teamSize > 0 ? personMonths / teamSize : 0 }
}
