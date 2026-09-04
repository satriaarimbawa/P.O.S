/**
 * Generate a unique invoice number for POS transactions.
 * Format: [OUTLET_CODE]-[REGISTER]-[YYMMDD]-[SEQUENCE]
 * @example generateInvoiceNo('JKT01', 'R01', 42) => 'JKT01-R01-260904-0042'
 */
export function generateInvoiceNo(
  outletCode: string,
  registerCode: string,
  dailySequence: number,
  date?: Date,
): string {
  const d = date ?? new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const seq = String(dailySequence).padStart(4, '0');
  return `${outletCode}-${registerCode}-${yy}${mm}${dd}-${seq}`;
}

/**
 * Parse an invoice number back into its components.
 */
export function parseInvoiceNo(invoiceNo: string): {
  outletCode: string;
  registerCode: string;
  dateStr: string;
  sequence: number;
} | null {
  const parts = invoiceNo.split('-');
  if (parts.length !== 4) return null;
  return {
    outletCode: parts[0],
    registerCode: parts[1],
    dateStr: parts[2],
    sequence: parseInt(parts[3], 10),
  };
}
