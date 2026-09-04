/** Indonesian PPN rate (11%) */
export const PPN_RATE = 0.11;

/**
 * Calculate PPN (Pajak Pertambahan Nilai) tax amount.
 * @param subtotal - Pre-tax subtotal
 * @returns Tax amount rounded to nearest integer
 */
export function calculatePPN(subtotal: number): number {
  return Math.round(subtotal * PPN_RATE);
}

/**
 * Calculate total with PPN tax.
 * @param subtotal - Pre-tax subtotal
 * @returns Object with tax and total
 */
export function calculateWithTax(subtotal: number): {
  subtotal: number;
  taxAmount: number;
  total: number;
} {
  const taxAmount = calculatePPN(subtotal);
  return {
    subtotal,
    taxAmount,
    total: subtotal + taxAmount,
  };
}

/**
 * Extract pre-tax amount from a tax-inclusive total.
 * @param totalInclusive - Total amount including tax
 * @returns Pre-tax subtotal
 */
export function extractPreTaxAmount(totalInclusive: number): number {
  return Math.round(totalInclusive / (1 + PPN_RATE));
}
