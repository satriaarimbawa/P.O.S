import 'dotenv/config';
import { db, client } from './connection.js';
import { vendorUsers, tenants, outlets, licenses } from './schema.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

function generateLicenseKey() {
  return `KPOS-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

async function runSeed() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('admin123', 10);
  
  await db.insert(vendorUsers).values({
    email: 'admin@kopipos.id',
    passwordHash,
    name: 'Admin KopiPOS',
    role: 'admin',
    isActive: true,
  });

  const tenant1 = await db.insert(tenants).values({
    name: 'Kopi Nusa',
    businessName: 'PT Kopi Nusa Jaya',
    plan: 'pro',
    status: 'active',
  }).returning();

  const tenant2 = await db.insert(tenants).values({
    name: 'Brew & Bite',
    businessName: 'Brew & Bite Corp',
    plan: 'basic',
    status: 'trial',
  }).returning();

  const outlet1 = await db.insert(outlets).values({
    tenantId: tenant1[0].id,
    name: 'Senopati',
    code: 'JKT01',
  }).returning();

  const outlet2 = await db.insert(outlets).values({
    tenantId: tenant1[0].id,
    name: 'PIM3',
    code: 'JKT02',
  }).returning();

  const outlet3 = await db.insert(outlets).values({
    tenantId: tenant2[0].id,
    name: 'BSD',
    code: 'BSD01',
  }).returning();

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await db.insert(licenses).values([
    {
      tenantId: tenant1[0].id,
      outletId: outlet1[0].id,
      licenseKey: generateLicenseKey(),
      expiresAt,
    },
    {
      tenantId: tenant1[0].id,
      outletId: outlet2[0].id,
      licenseKey: generateLicenseKey(),
      expiresAt,
    },
    {
      tenantId: tenant2[0].id,
      outletId: outlet3[0].id,
      licenseKey: generateLicenseKey(),
      expiresAt,
    }
  ]);

  console.log('Database seeded successfully!');
  await client.end();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
