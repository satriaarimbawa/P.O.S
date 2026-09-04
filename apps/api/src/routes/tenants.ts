import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';
import { tenants, outlets } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { authenticateVendor } from '../middleware/auth.js';

const createTenantSchema = z.object({
  name: z.string().min(1),
  businessName: z.string().optional(),
  ownerName: z.string().optional(),
  email: z.string().email().optional(),
  plan: z.enum(['trial', 'basic', 'pro', 'enterprise']).default('trial'),
});

const updateTenantSchema = createTenantSchema.partial().extend({
  status: z.enum(['active', 'trial', 'suspended', 'expired']).optional(),
  brandColor: z.string().optional(),
});

const createOutletSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
});

export async function tenantRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateVendor);

  app.get('/', async (request, reply) => {
    const allTenants = await db.select().from(tenants);
    return { data: allTenants };
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
    
    if (!tenant) {
      return reply.code(404).send({ error: 'Tenant not found' });
    }
    
    return { data: tenant };
  });

  app.post('/', async (request, reply) => {
    const parseResult = createTenantSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const [newTenant] = await db.insert(tenants).values(parseResult.data).returning();
    return { data: newTenant };
  });

  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = updateTenantSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const [updatedTenant] = await db.update(tenants)
      .set(parseResult.data)
      .where(eq(tenants.id, id))
      .returning();
      
    if (!updatedTenant) {
      return reply.code(404).send({ error: 'Tenant not found' });
    }

    return { data: updatedTenant };
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [deletedTenant] = await db.update(tenants)
      .set({ status: 'suspended' })
      .where(eq(tenants.id, id))
      .returning();
      
    if (!deletedTenant) {
      return reply.code(404).send({ error: 'Tenant not found' });
    }

    return { data: deletedTenant };
  });

  app.get('/:id/outlets', async (request, reply) => {
    const { id } = request.params as { id: string };
    const tenantOutlets = await db.select().from(outlets).where(eq(outlets.tenantId, id));
    return { data: tenantOutlets };
  });

  app.post('/:id/outlets', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parseResult = createOutletSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const [newOutlet] = await db.insert(outlets)
      .values({ ...parseResult.data, tenantId: id })
      .returning();
      
    return { data: newOutlet };
  });
}
