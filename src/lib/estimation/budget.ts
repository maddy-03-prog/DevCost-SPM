export type BudgetLine = { role: string; headcount: number; monthlySalary: number; allocation: number; months: number }
export type OtherCosts = { cloudMonthly: number; hardware: number; licenses: number; tools: number; training: number; marketing: number; office: number; thirdPartyApis: number; custom: number }
export type BudgetOptions = { contingencyPercent: number; overheadPercent: number; taxPercent: number }
export type BudgetResult = { personnel: number; directOther: number; overhead: number; contingency: number; tax: number; total: number; monthly: number }
export type CostCategory = { name: string; value: number }
export type CashFlowPoint = { month: number; amount: number }

/** Personnel cost sums headcount × monthly salary × allocation × project months across all roles. */
export function calculatePersonnelCost(team: BudgetLine[]): number {
  return team.reduce((sum, row) => sum + row.headcount * row.monthlySalary * (row.allocation / 100) * row.months, 0)
}

/** Direct other cost includes monthly cloud cost across project months plus all one-time cost entries. */
export function calculateOtherCost(costs: OtherCosts, months: number): number {
  const { cloudMonthly, ...oneTimeCosts } = costs
  return cloudMonthly * months + Object.values(oneTimeCosts).reduce((sum, cost) => sum + cost, 0)
}

/** Budget totals apply overhead to direct cost, contingency to the overhead-inclusive subtotal, then tax. */
export function calculateBudget(team: BudgetLine[], costs: OtherCosts, options: BudgetOptions, months: number): BudgetResult {
  const personnel = calculatePersonnelCost(team)
  const directOther = calculateOtherCost(costs, months)
  const subtotal = personnel + directOther
  const overhead = subtotal * options.overheadPercent / 100
  const contingency = (subtotal + overhead) * options.contingencyPercent / 100
  const taxable = subtotal + overhead + contingency
  const tax = taxable * options.taxPercent / 100
  const total = taxable + tax
  return { personnel, directOther, overhead, contingency, tax, total, monthly: months > 0 ? total / months : 0 }
}

/** Returns the main budget components for a chart without losing their calculation labels. */
export function calculateCostBreakdown(budget: BudgetResult): CostCategory[] {
  return [
    { name: 'Team', value: budget.personnel },
    { name: 'Other costs', value: budget.directOther },
    { name: 'Overhead', value: budget.overhead },
    { name: 'Contingency', value: budget.contingency },
    { name: 'Tax', value: budget.tax },
  ]
}

/** Spreads project cost evenly over whole project months for an indicative cash-flow view. */
export function calculateCashFlow(total: number, months: number): CashFlowPoint[] {
  const count = Math.ceil(months)
  if (count <= 0) return []
  return Array.from({ length: count }, (_, index) => ({ month: index + 1, amount: total / count }))
}

/** Divides total budget by a size unit, returning zero where the size is unavailable. */
export function calculateCostPerUnit(total: number, units: number): number {
  return units > 0 ? total / units : 0
}
