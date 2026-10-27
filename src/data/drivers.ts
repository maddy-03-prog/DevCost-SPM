export type DriverLevel = 'VL' | 'L' | 'N' | 'H' | 'VH' | 'XH'

export const COST_DRIVERS = {
  Product: {
    RELY: { label: 'Required reliability', values: { VL: 0.75, L: 0.88, N: 1, H: 1.15, VH: 1.4 } },
    DATA: { label: 'Database size', values: { L: 0.94, N: 1, H: 1.08, VH: 1.16 } },
    CPLX: { label: 'Product complexity', values: { VL: 0.7, L: 0.85, N: 1, H: 1.15, VH: 1.3, XH: 1.65 } },
  },
  Hardware: {
    TIME: { label: 'Execution time constraint', values: { N: 1, H: 1.11, VH: 1.3, XH: 1.66 } },
    STOR: { label: 'Main storage constraint', values: { N: 1, H: 1.06, VH: 1.21, XH: 1.56 } },
    VIRT: { label: 'Virtual machine volatility', values: { L: 0.87, N: 1, H: 1.15, VH: 1.3 } },
    TURN: { label: 'Computer turnaround time', values: { L: 0.87, N: 1, H: 1.07, VH: 1.15 } },
  },
  Personnel: {
    ACAP: { label: 'Analyst capability', values: { VL: 1.46, L: 1.19, N: 1, H: 0.86, VH: 0.71 } },
    AEXP: { label: 'Applications experience', values: { VL: 1.29, L: 1.13, N: 1, H: 0.91, VH: 0.82 } },
    PCAP: { label: 'Programmer capability', values: { VL: 1.42, L: 1.17, N: 1, H: 0.86, VH: 0.7 } },
    VEXP: { label: 'Virtual machine experience', values: { VL: 1.21, L: 1.1, N: 1, H: 0.9 } },
    LEXP: { label: 'Programming language experience', values: { VL: 1.14, L: 1.07, N: 1, H: 0.95 } },
  },
  Project: {
    MODP: { label: 'Modern programming practices', values: { VL: 1.24, L: 1.1, N: 1, H: 0.91, VH: 0.82 } },
    TOOL: { label: 'Use of software tools', values: { VL: 1.24, L: 1.1, N: 1, H: 0.91, VH: 0.82 } },
    SCED: { label: 'Required development schedule', values: { VL: 1.23, L: 1.08, N: 1, H: 1.04, VH: 1.1 } },
  },
} as const

export type DriverKey = keyof typeof COST_DRIVERS.Product | keyof typeof COST_DRIVERS.Hardware | keyof typeof COST_DRIVERS.Personnel | keyof typeof COST_DRIVERS.Project
export type CostDriverRatings = Record<DriverKey, DriverLevel>
