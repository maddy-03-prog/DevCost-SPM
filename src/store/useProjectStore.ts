import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { NOMINAL_DRIVERS, type DevelopmentMode } from '../lib/estimation/cocomo'
import type { BudgetLine, OtherCosts } from '../lib/estimation/budget'
import type { CostDriverRatings } from '../data/drivers'
import type { CurrencyCode } from '../lib/estimation/format'

export type AppTheme = 'light' | 'dark' | 'system'
export type Project = {
  name: string
  description: string
  kloc: number
  productivity: number
  fpProductivity: number
  fpCounts: { EI: { Low: number; Average: number; High: number }; EO: { Low: number; Average: number; High: number }; EQ: { Low: number; Average: number; High: number }; ILF: { Low: number; Average: number; High: number }; EIF: { Low: number; Average: number; High: number } }
  gscRatings: number[]
  fpLanguage: 'Java' | 'Python' | 'JavaScript' | 'C' | 'C++' | 'C#'
  hoursPerUnit: number
  productivityUnits: number
  teamSize: number
  salary: number
  mode: DevelopmentMode
  drivers: CostDriverRatings
  budgetTeam: BudgetLine[]
  otherCosts: OtherCosts
  contingencyPercent: number
  overheadPercent: number
  taxPercent: number
  optimistic: number
  mostLikely: number
  pessimistic: number
}

export type AppSettings = {
  theme: AppTheme
  accent: string
  density: 'comfortable' | 'compact'
  currency: CurrencyCode
}
export type SavedScenario = { id: string; name: string; kloc: number; drivers: CostDriverRatings; teamSize: number; salary: number }

export const initialProject: Project = {
  name: 'New software project',
  description: 'Project estimation workspace',
  kloc: 32,
  productivity: 500,
  fpProductivity: 12,
  fpCounts: {
    EI: { Low: 2, Average: 3, High: 1 }, EO: { Low: 1, Average: 2, High: 0 },
    EQ: { Low: 2, Average: 1, High: 1 }, ILF: { Low: 1, Average: 2, High: 0 }, EIF: { Low: 1, Average: 0, High: 1 },
  },
  gscRatings: Array(14).fill(3),
  fpLanguage: 'JavaScript',
  hoursPerUnit: 8,
  productivityUnits: 1200,
  teamSize: 7,
  salary: 95000,
  mode: 'Organic',
  drivers: NOMINAL_DRIVERS,
  budgetTeam: [{ role: 'Developer', headcount: 7, monthlySalary: 95000, allocation: 100, months: 13.9 }],
  otherCosts: { cloudMonthly: 12000, hardware: 0, licenses: 0, tools: 0, training: 0, marketing: 0, office: 0, thirdPartyApis: 0, custom: 0 },
  contingencyPercent: 10,
  overheadPercent: 0,
  taxPercent: 0,
  optimistic: 80,
  mostLikely: 100,
  pessimistic: 140,
}

export const initialSettings: AppSettings = {
  theme: 'light',
  accent: '#6258e8',
  density: 'comfortable',
  currency: 'INR',
}

type ProjectState = {
  project: Project
  settings: AppSettings
  scenarios: SavedScenario[]
  updateProject: (updates: Partial<Project>) => void
  updateSettings: (updates: Partial<AppSettings>) => void
  saveScenario: (scenario: SavedScenario) => void
  removeScenario: (id: string) => void
  resetProject: () => void
  resetAll: () => void
}

export const useProjectStore = create<ProjectState>()(persist((set) => ({
  project: initialProject,
  settings: initialSettings,
  scenarios: [],
  updateProject: (updates) => set((state) => ({ project: { ...state.project, ...updates } })),
  updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
  saveScenario: (scenario) => set((state) => ({ scenarios: [...state.scenarios.filter((item) => item.id !== scenario.id), scenario].slice(0, 4) })),
  removeScenario: (id) => set((state) => ({ scenarios: state.scenarios.filter((scenario) => scenario.id !== id) })),
  resetProject: () => set({ project: initialProject }),
  resetAll: () => set({ project: initialProject, settings: initialSettings, scenarios: [] }),
}), {
  name: 'devcost-project',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ project: state.project, settings: state.settings, scenarios: state.scenarios }),
}))
