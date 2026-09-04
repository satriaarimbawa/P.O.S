import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticateVendor(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const user = request.user as { role?: string };
    if (user.role !== 'admin') {
      return reply.code(403).send({ error: 'Forbidden: Vendor access required' });
    }
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}

export async function authenticatePOS(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
    const pos = request.user as { type?: string, tenantId?: string, outletId?: string };
    if (pos.type !== 'pos') {
      return reply.code(403).send({ error: 'Forbidden: POS access required' });
    }
  } catch (err) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
