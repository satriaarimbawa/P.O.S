import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';
import { licenses } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { authenticateVendor } from '../middleware/auth.js';
import { LicenseService } from '../services/license.service.js';

const generateSchema = z.object({
  tenantId: z.string().uuid(),
  outletId: z.string().uuid(),
  durationDays: z.number().optional().default(365),
});

const activateSchema = z.object({
  licenseKey: z.string(),
  machineId: z.string(),
});

const validateSchema = z.object({
  licenseKey: z.string(),
});

export async function licenseRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const allLicenses = await db.select().from(licenses);
    return { data: allLicenses };
  });

  app.post('/generate', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const parseResult = generateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const { tenantId, outletId, durationDays } = parseResult.data;
    const license = await LicenseService.createLicense(tenantId, outletId, durationDays);
    
    return { data: license };
  });

  app.patch('/:id/revoke', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const license = await LicenseService.revokeLicense(id);
    return { data: license };
  });

  app.patch('/:id/extend', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { days } = request.body as { days: number };
    
    const [license] = await db.select().from(licenses).where(eq(licenses.id, id)).limit(1);
    if (!license) return reply.code(404).send({ error: 'License not found' });

    const newExpiry = new Date(license.expiresAt);
    newExpiry.setDate(newExpiry.getDate() + (days || 30));

    const [updated] = await db.update(licenses).set({ expiresAt: newExpiry, status: 'active' }).where(eq(licenses.id, id)).returning();
    
    return { data: updated };
  });

  app.post('/activate', async (request, reply) => {
    const parseResult = activateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    try {
      const { licenseKey, machineId } = parseResult.data;
      const license = await LicenseService.activateLicense(licenseKey, machineId);
      
      const token = app.jwt.sign({
        type: 'pos',
        tenantId: license.tenantId,
        outletId: license.outletId,
        licenseId: license.id
      });

      return { data: license, token };
    } catch (err: any) {
      return reply.code(400).send({ error: err.message });
    }
  });

  app.post('/validate', async (request, reply) => {
    const parseResult = validateSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const { valid, reason, license } = await LicenseService.validateLicense(parseResult.data.licenseKey);
    return { valid, reason, license };
  });
}
