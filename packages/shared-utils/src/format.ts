/**
 * Format number as Indonesian Rupiah currency string.
 * @example formatIDR(35000) => 'Rp 35.000'
 * @example formatIDR(99900) => 'Rp 99.900'
 */
export function formatIDR(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

/**
 * Format date to Indonesian locale string.
 * @example formatDate('2026-09-04') => '4 September 2026'
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format date and time to Indonesian locale.
 * @example formatDateTime('2026-09-04T13:30:00') => '4 Sep 2026, 13:30'
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format time only.
 * @example formatTime('2026-09-04T13:30:00') => '13:30'
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
