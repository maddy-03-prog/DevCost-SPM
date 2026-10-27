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
  numberFormat: 'Indian' | 'International'
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
  numberFormat: 'Indian',
}

export const demoProject: Project = {
  name: 'QuickBite Delivery Platform',
  description: 'Online food ordering and delivery platform for customers, restaurants, and couriers.',
  kloc: 48,
  productivity: 650,
  fpProductivity: 14,
  fpCounts: {
    EI: { Low: 3, Average: 8, High: 2 }, EO: { Low: 2, Average: 5, High: 2 },
    EQ: { Low: 3, Average: 5, High: 1 }, ILF: { Low: 2, Average: 5, High: 2 }, EIF: { Low: 2, Average: 3, High: 1 },
  },
  gscRatings: [4, 4, 3, 5, 3, 5, 4, 4, 4, 3, 3, 3, 4, 3],
  fpLanguage: 'JavaScript',
  hoursPerUnit: 10,
  productivityUnits: 2400,
  teamSize: 12,
  salary: 125000,
  mode: 'Semi-detached',
  drivers: {
    RELY: 'H', DATA: 'H', CPLX: 'H', TIME: 'H', STOR: 'N', VIRT: 'N', TURN: 'N',
    ACAP: 'N', AEXP: 'L', PCAP: 'N', VEXP: 'N', LEXP: 'L', MODP: 'N', TOOL: 'H', SCED: 'N',
  },
  budgetTeam: [
    { role: 'Project Manager', headcount: 1, monthlySalary: 165000, allocation: 80, months: 17.2 },
    { role: 'Developer', headcount: 7, monthlySalary: 125000, allocation: 100, months: 17.2 },
    { role: 'QA Engineer', headcount: 2, monthlySalary: 95000, allocation: 100, months: 15 },
    { role: 'UI/UX Designer', headcount: 1, monthlySalary: 115000, allocation: 70, months: 6 },
    { role: 'DevOps Engineer', headcount: 1, monthlySalary: 145000, allocation: 60, months: 10 },
  ],
  otherCosts: { cloudMonthly: 85000, hardware: 180000, licenses: 240000, tools: 160000, training: 90000, marketing: 450000, office: 120000, thirdPartyApis: 300000, custom: 75000 },
  contingencyPercent: 12,
  overheadPercent: 8,
  taxPercent: 0,
  optimistic: 200,
  mostLikely: 260,
  pessimistic: 370,
}

type ProjectState = {
  project: Project
  settings: AppSettings
  scenarios: SavedScenario[]
  updateProject: (updates: Partial<Project>) => void
  updateSettings: (updates: Partial<AppSettings>) => void
  loadDemoProject: () => void
  loadProjectData: (project: Project, settings: AppSettings, scenarios: SavedScenario[]) => void
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
  loadDemoProject: () => set({ project: demoProject, scenarios: [] }),
  loadProjectData: (project, settings, scenarios) => set({ project, settings, scenarios }),
  saveScenario: (scenario) => set((state) => ({ scenarios: [...state.scenarios.filter((item) => item.id !== scenario.id), scenario].slice(0, 4) })),
  removeScenario: (id) => set((state) => ({ scenarios: state.scenarios.filter((scenario) => scenario.id !== id) })),
  resetProject: () => set({ project: initialProject }),
  resetAll: () => set({ project: initialProject, settings: initialSettings, scenarios: [] }),
}), {
  name: 'devcost-project',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({ project: state.project, settings: state.settings, scenarios: state.scenarios }),
}))
