/**
 * Format a number as USD currency
 * @param value - The value to format
 * @param compact - Whether to use compact notation for large numbers
 * @param noDecimals - Whether to remove decimal places
 * @param forceCompact - Whether to always use compact notation for marketCap regardless of size
 */
export function formatCurrency(value: number, compact = false, noDecimals = false, forceCompact = false): string {
  // Handle null or undefined values
  if (value === null || value === undefined) {
    return '$0';
  }
  
  // For market caps (always use M/B format when forceCompact is true)
  if (forceCompact) {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
  }
  
  // For large numbers (millions) with compact option
  if (value >= 1000000 && compact) {
    return `$${(value / 1000000).toFixed(noDecimals ? 0 : 1)}M`;
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

/**
 * Format a number in compact notation (K, M, B)
 * @param value - The value to format
 * @param includeSymbol - Whether to include the $ symbol
 */
export function formatCompactNumber(value: number | null, includeSymbol = true): string {
  if (value === null || value === undefined) {
    return includeSymbol ? '$0' : '0';
  }
  
  const prefix = includeSymbol ? '$' : '';
  
  if (value >= 1000000000) {
    return `${prefix}${(value / 1000000000).toFixed(1)}B`;
  }
  
  if (value >= 1000000) {
    return `${prefix}${(value / 1000000).toFixed(1)}M`;
  }
  
  if (value >= 1000) {
    return `${prefix}${(value / 1000).toFixed(1)}K`;
  }
  
  return `${prefix}${value.toFixed(0)}`;
}
