import { FastifyRequest, FastifyReply } from 'fastify';

export async function tenantScope(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as any;
  if (!user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  if (user.role === 'admin') {
    request.tenantId = (request.params as any).tenantId || (request.query as any).tenantId || null;
    return;
  }

  if (user.type === 'pos' && user.tenantId) {
    request.tenantId = user.tenantId;
    return;
  }

  return reply.code(403).send({ error: 'Forbidden: Tenant scope could not be determined' });
}

declare module 'fastify' {
  interface FastifyRequest {
    tenantId?: string | null;
  }
}
