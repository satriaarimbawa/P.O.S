import { FastifyInstance } from 'fastify';
import { db } from '../database/connection.js';
import { vendorUsers } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { authenticateVendor } from '../middleware/auth.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const parseResult = loginSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.code(400).send({ error: 'Invalid input', details: parseResult.error.format() });
    }

    const { email, password } = parseResult.data;

    const [user] = await db.select().from(vendorUsers).where(eq(vendorUsers.email, email)).limit(1);
    if (!user || !user.isActive) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  });

  app.post('/refresh', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const user = request.user as any;
    const token = app.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    return { token };
  });

  app.get('/me', { preHandler: [authenticateVendor] }, async (request, reply) => {
    const user = request.user as any;
    const [dbUser] = await db.select().from(vendorUsers).where(eq(vendorUsers.id, user.id)).limit(1);
    
    if (!dbUser) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
  });
}
