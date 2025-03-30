/**
 * Format a number as USD currency
 */
export function formatCurrency(value: number): string {
  // For large numbers (millions)
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  // For smaller numbers
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  
  return new Intl.NumberFormat('en-US').format(value);
}
