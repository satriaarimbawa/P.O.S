import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';
import { syncEvents, tenantConfigs, registers } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { authenticatePOS } from '../middleware/auth.js';

const pushSchema = z.object({
  events: z.array(z.object({
    id: z.string(),
    type: z.string(),
    payload: z.any(),
    timestamp: z.string(),
  })),
});

const heartbeatSchema = z.object({
  registerId: z.string().uuid().optional(),
});

export async function syncRoutes(app: FastifyInstance) {
  app.addHook('preHandler', authenticatePOS);

  app.post('/push', async (request, reply) => {
    const parseResult = pushSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const user = request.user as any;
    const { events } = parseResult.data;

    const dbEvents = events.map(e => ({
      tenantId: user.tenantId,
      outletId: user.outletId,
      eventType: e.type,
      payload: e.payload,
    }));

    if (dbEvents.length > 0) {
      await db.insert(syncEvents).values(dbEvents);
    }

    const acceptedIds = events.map(e => e.id);
    return { accepted: acceptedIds };
  });

  app.get('/pull-config', async (request, reply) => {
    const user = request.user as any;
    const configs = await db.select().from(tenantConfigs).where(eq(tenantConfigs.tenantId, user.tenantId));
    return { data: configs };
  });

  app.post('/heartbeat', async (request, reply) => {
    const parseResult = heartbeatSchema.safeParse(request.body);
    
    if (parseResult.success && parseResult.data.registerId) {
      await db.update(registers)
        .set({ lastSeenAt: new Date() })
        .where(eq(registers.id, parseResult.data.registerId));
    }

    return { status: 'ok', timestamp: new Date().toISOString() };
  });
}
