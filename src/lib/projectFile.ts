import type { AppSettings, Project, SavedScenario } from '../store/useProjectStore'
import type { CostDriverRatings, DriverLevel, DriverKey } from '../data/drivers'

export type ProjectSnapshot = { version: 1; savedAt: string; project: Project; settings: AppSettings; scenarios: SavedScenario[] }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

const driverKeys: DriverKey[] = ['RELY', 'DATA', 'CPLX', 'TIME', 'STOR', 'VIRT', 'TURN', 'ACAP', 'AEXP', 'PCAP', 'VEXP', 'LEXP', 'MODP', 'TOOL', 'SCED']
const driverLevels: DriverLevel[] = ['VL', 'L', 'N', 'H', 'VH', 'XH']

function isDriverRatings(value: unknown): value is CostDriverRatings {
  return isRecord(value) && driverKeys.every((key) => typeof value[key] === 'string' && driverLevels.some((level) => level === value[key]))
}

function isSavedScenario(value: unknown): value is SavedScenario {
  return isRecord(value) && typeof value.id === 'string' && typeof value.name === 'string'
    && isFiniteNumber(value.kloc) && isFiniteNumber(value.teamSize) && isFiniteNumber(value.salary)
    && isDriverRatings(value.drivers)
}

function isProject(value: unknown): value is Project {
  if (!isRecord(value) || typeof value.name !== 'string' || typeof value.description !== 'string') return false
  if (!['kloc', 'productivity', 'fpProductivity', 'teamSize', 'salary', 'hoursPerUnit', 'productivityUnits', 'contingencyPercent', 'overheadPercent', 'taxPercent', 'optimistic', 'mostLikely', 'pessimistic'].every((key) => isFiniteNumber(value[key]))) return false
  if (!['Organic', 'Semi-detached', 'Embedded'].includes(String(value.mode))) return false
  if (!['Java', 'Python', 'JavaScript', 'C', 'C++', 'C#'].includes(String(value.fpLanguage))) return false
  if (!Array.isArray(value.gscRatings) || value.gscRatings.length !== 14 || !value.gscRatings.every(isFiniteNumber)) return false
  if (!Array.isArray(value.budgetTeam) || !value.budgetTeam.every((row) => isRecord(row) && typeof row.role === 'string' && ['headcount', 'monthlySalary', 'allocation', 'months'].every((key) => isFiniteNumber(row[key])))) return false
  if (!isRecord(value.otherCosts) || !['cloudMonthly', 'hardware', 'licenses', 'tools', 'training', 'marketing', 'office', 'thirdPartyApis', 'custom'].every((key) => isFiniteNumber(value.otherCosts[key]))) return false
  if (!isDriverRatings(value.drivers)) return false
  if (!isRecord(value.fpCounts) || !['EI', 'EO', 'EQ', 'ILF', 'EIF'].every((key) => {
    const type = value.fpCounts[key]
    return isRecord(type) && ['Low', 'Average', 'High'].every((complexity) => isFiniteNumber(type[complexity]))
  })) return false
  return true
}

function isSettings(value: unknown): value is AppSettings {
  return isRecord(value) && ['light', 'dark', 'system'].includes(String(value.theme))
    && typeof value.accent === 'string' && /^#[\da-f]{6}$/i.test(value.accent) && ['comfortable', 'compact'].includes(String(value.density))
    && ['INR', 'USD', 'EUR', 'GBP'].includes(String(value.currency))
    && ['Indian', 'International'].includes(String(value.numberFormat))
}

/** Validates the import boundary before replacing persisted project data. */
export function parseProjectSnapshot(value: unknown): ProjectSnapshot {
  if (!isRecord(value) || value.version !== 1 || typeof value.savedAt !== 'string') {
    throw new Error('This file is not a supported DevCost project export.')
  }
  if (!isProject(value.project) || !isSettings(value.settings) || !Array.isArray(value.scenarios)) {
    throw new Error('The project file is missing required project or settings data.')
  }
  const scenarios: unknown[] = value.scenarios
  if (scenarios.length > 4 || !scenarios.every(isSavedScenario)) {
    throw new Error('The project file contains an invalid saved scenario.')
  }
  return { version: 1, savedAt: value.savedAt, project: value.project, settings: value.settings, scenarios }
}

export function createProjectSnapshot(project: Project, settings: AppSettings, scenarios: SavedScenario[]): ProjectSnapshot {
  return { version: 1, savedAt: new Date().toISOString(), project, settings, scenarios }
}

/** Escapes CSV values so commas, quotes, and line breaks stay within their cells. */
export function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(',')).join('\r\n')
}
