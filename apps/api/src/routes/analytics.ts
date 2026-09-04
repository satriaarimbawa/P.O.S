import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';
import { tenants, outlets, licenses } from '../database/schema.js';
import { sql, eq } from 'drizzle-orm';
import { authenticateVendor } from '../middleware/auth.js';

export async function analyticsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticateVendor);

  app.get('/overview', async (request, reply) => {
    const [{ count: totalTenants }] = await db.select({ count: sql<number>`count(*)` }).from(tenants);
    const [{ count: activeTenants }] = await db.select({ count: sql<number>`count(*)` }).from(tenants).where(eq(tenants.status, 'active'));
    
    const mrr = 0;
    
    return {
      data: {
        totalTenants: Number(totalTenants),
        activeTenants: Number(activeTenants),
        mrr
      }
    };
  });

  app.get('/transactions', async (request, reply) => {
    return { data: [] };
  });

  app.get('/tenants/:id/summary', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const [{ count: outletCount }] = await db.select({ count: sql<number>`count(*)` }).from(outlets).where(eq(outlets.tenantId, id));
    const [{ count: licenseCount }] = await db.select({ count: sql<number>`count(*)` }).from(licenses).where(eq(licenses.tenantId, id));

    return {
      data: {
        tenantId: id,
        outlets: Number(outletCount),
        licenses: Number(licenseCount),
      }
    };
  });
}
