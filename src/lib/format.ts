export function formatCurrency(
  value: number,
  opts: { cents?: boolean; sign?: boolean } = {}
): string {
  const { cents = true, sign = false } = opts;
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  }).format(Math.abs(value));
  if (sign) {
    const prefix = value > 0 ? '+' : value < 0 ? '−' : '';
    return `${prefix}${formatted}`;
  }
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}
