import { calculateBudget, calculateCashFlow, calculateCostBreakdown } from './budget'
import { calculateBasicCocomo, calculateIntermediateCocomo, calculatePhaseDistribution, calculateStaffingProfile } from './cocomo'
import { calculateMethodEstimates, summarizeComparison } from './comparison'
import { calculateFunctionPoints } from './functionPoints'
import { calculateLocEffort, calculateProductivityEffort } from './effort'
import { calculatePert } from './pert'
import type { Project } from '../../store/useProjectStore'

/** Collects consistent results for the executive report from the shared project assumptions. */
export function calculateReportData(project: Project) {
  const basic = calculateBasicCocomo(project.kloc, project.mode)
  const intermediate = calculateIntermediateCocomo(project.kloc, project.mode, project.drivers)
  const functionPoints = calculateFunctionPoints(project.fpCounts, project.gscRatings, project.fpProductivity, project.fpLanguage)
  const loc = calculateLocEffort(project.kloc, project.productivity, project.teamSize)
  const productivity = calculateProductivityEffort(project.productivityUnits, project.hoursPerUnit, project.teamSize)
  const pert = calculatePert(project.optimistic, project.mostLikely, project.pessimistic)
  const budget = calculateBudget(project.budgetTeam, project.otherCosts, {
    contingencyPercent: project.contingencyPercent, overheadPercent: project.overheadPercent, taxPercent: project.taxPercent,
  }, basic.duration)
  const methods = calculateMethodEstimates({
    kloc: project.kloc, mode: project.mode, drivers: project.drivers, productivity: project.productivity,
    fpCounts: project.fpCounts, gscRatings: project.gscRatings, fpProductivity: project.fpProductivity,
    teamSize: project.teamSize, salary: project.salary, optimistic: project.optimistic,
    mostLikely: project.mostLikely, pessimistic: project.pessimistic,
  })
  const comparison = summarizeComparison(methods)
  const phases = calculatePhaseDistribution(basic.effort, project.mode)
  const staffing = calculateStaffingProfile(basic.effort, basic.duration)
  const costBreakdown = calculateCostBreakdown(budget)
  const cashFlow = calculateCashFlow(budget.total, basic.duration)
  const risks = [
    'Estimates depend on the current size and productivity assumptions; validate them with project-specific historical data.',
    intermediate.eaf >= 1.3 ? 'The cost-driver combination raises effort materially above the nominal Intermediate COCOMO baseline.' : 'Review cost-driver ratings with the project team; nominal defaults can understate risk.',
    comparison.variancePercent >= 50 ? 'Estimation methods show a wide spread; reconcile the high and low assumptions before committing to a budget.' : 'The estimate methods are reasonably aligned, but scope and schedule uncertainty remain.',
    'Budget cash flow is an even monthly planning allocation and does not model phase-specific payment milestones.',
  ]
  const assumptions = [
    'One person-month is treated as 160 person-hours.',
    'Labor cost uses the project-level average monthly salary in method comparisons and what-if scenarios.',
    `Basic COCOMO is shown in ${project.mode} mode using ${project.kloc} KLOC.`,
    'Function Point adjustment uses 14 General System Characteristic ratings on a 0–5 scale.',
    'Phase allocation is a documented Boehm-inspired teaching approximation, not an exact calibrated project baseline.',
    `Budget contingency is ${project.contingencyPercent}%, overhead is ${project.overheadPercent}%, and tax is ${project.taxPercent}%.`,
  ]
  return { basic, intermediate, functionPoints, loc, productivity, pert, budget, methods, comparison, phases, staffing, costBreakdown, cashFlow, risks, assumptions }
}
