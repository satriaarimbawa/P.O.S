import crypto from 'crypto';
import { db } from '../database/connection.js';
import { licenses } from '../database/schema.js';
import { eq } from 'drizzle-orm';

export class LicenseService {
  static generateLicenseKey(): string {
    return `KPOS-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
  }

  static async createLicense(tenantId: string, outletId: string, durationDays: number = 365) {
    const licenseKey = this.generateLicenseKey();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const [license] = await db.insert(licenses).values({
      tenantId,
      outletId,
      licenseKey,
      expiresAt,
      status: 'pending'
    }).returning();

    return license;
  }

  static async activateLicense(licenseKey: string, machineId: string) {
    const [license] = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey)).limit(1);

    if (!license) {
      throw new Error('Invalid license key');
    }

    if (license.status === 'revoked' || license.status === 'expired') {
      throw new Error('License is not active');
    }

    if (license.machineId && license.machineId !== machineId) {
      throw new Error('License already activated on another machine');
    }

    const [updated] = await db.update(licenses).set({
      status: 'active',
      machineId,
      activatedAt: license.activatedAt || new Date()
    }).where(eq(licenses.id, license.id)).returning();

    return updated;
  }

  static async validateLicense(licenseKey: string) {
    const [license] = await db.select().from(licenses).where(eq(licenses.licenseKey, licenseKey)).limit(1);

    if (!license) {
      return { valid: false, reason: 'not_found' };
    }

    if (license.status === 'revoked') {
      return { valid: false, reason: 'revoked' };
    }

    if (new Date() > license.expiresAt) {
      await db.update(licenses).set({ status: 'expired' }).where(eq(licenses.id, license.id));
      return { valid: false, reason: 'expired' };
    }

    return { valid: true, license };
  }

  static async revokeLicense(licenseId: string) {
    const [updated] = await db.update(licenses).set({ status: 'revoked' }).where(eq(licenses.id, licenseId)).returning();
    return updated;
  }
}
