export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP'

/** Formats currency using locale-aware grouping, including Indian digit grouping for INR. */
export function formatCurrency(value: number, currency: CurrencyCode = 'INR'): string {
  const locale = currency === 'INR' ? 'en-IN' : 'en-US'
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
}

export function formatNumber(value: number, maximumFractionDigits = 1, locale: 'en-IN' | 'en-US' = 'en-IN'): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits }).format(value)
}
