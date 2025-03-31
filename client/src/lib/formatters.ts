/**
 * Format a number as USD currency
 * @param value - The value to format
 * @param noDecimals - Whether to remove decimal places (for spent amounts)
 */
export function formatCurrency(value: number, noDecimals = false): string {
  // For large numbers (millions)
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  // For smaller numbers
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: noDecimals ? 0 : 2,
    maximumFractionDigits: noDecimals ? 0 : 2
  }).format(value);
}

/**
 * Format a number with commas for thousands
 * @param value - The value to format 
 * @param noDecimals - Whether to remove decimal places (for volume)
 */
export function formatNumber(value: number, noDecimals = false): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(noDecimals ? 0 : 1)}M`;
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: noDecimals ? 0 : 2
  }).format(value);
}
