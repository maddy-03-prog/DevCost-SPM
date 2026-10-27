import { useCallback } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { formatNumber } from '../lib/estimation/format'

export function useNumberFormatter() {
  const numberFormat = useProjectStore((state) => state.settings.numberFormat)
  const locale = numberFormat === 'Indian' ? 'en-IN' : 'en-US'
  return useCallback((value: number, maximumFractionDigits = 1) => formatNumber(value, maximumFractionDigits, locale), [locale])
}
