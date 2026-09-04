/**
 * Generate a UUIDv7 (time-ordered unique identifier).
 * Uses current timestamp for ordering + random bytes for uniqueness.
 */
export function generateId(): string {
  const timestamp = Date.now();
  const timestampHex = timestamp.toString(16).padStart(12, '0');
  
  const randomBytes = new Uint8Array(10);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Format as UUID: xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx
  const hex = timestampHex + randomHex;
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    '7' + hex.slice(13, 16),
    ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16) + hex.slice(17, 20),
    hex.slice(20, 32),
  ].join('-');
}
