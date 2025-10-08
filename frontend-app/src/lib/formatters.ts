export interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(value: number, options: FormatCurrencyOptions = {}): string {
  const { currency = 'USD', locale = 'es-MX', minimumFractionDigits = 2, maximumFractionDigits = 2 } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export interface FormatPercentageOptions {
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatPercentage(value: number, options: FormatPercentageOptions = {}): string {
  const { locale = 'es-MX', minimumFractionDigits = 1, maximumFractionDigits = 1 } = options;
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number.isFinite(value) ? value : 0);
}

export interface VariationResult {
  absolute: number;
  percentage: number;
}

export function calculateVariation(current: number, previous: number): VariationResult {
  const safeCurrent = Number.isFinite(current) ? current : 0;
  const safePrevious = Number.isFinite(previous) ? previous : 0;
  const absolute = safeCurrent - safePrevious;
  const percentage = safePrevious === 0 ? (safeCurrent === 0 ? 0 : 1) : absolute / safePrevious;
  return { absolute, percentage };
}
