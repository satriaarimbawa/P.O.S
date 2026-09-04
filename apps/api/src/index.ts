import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { authRoutes } from './routes/auth.js';
import { tenantRoutes } from './routes/tenants.js';
import { licenseRoutes } from './routes/licenses.js';
import { syncRoutes } from './routes/sync.js';
import { analyticsRoutes } from './routes/analytics.js';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { colorize: true },
      },
    },
  });

  // Plugins
  await app.register(cors, { origin: true });
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // Health check
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  }));

  // Routes
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(tenantRoutes, { prefix: '/api/tenants' });
  await app.register(licenseRoutes, { prefix: '/api/licenses' });
  await app.register(syncRoutes, { prefix: '/api/sync' });
  await app.register(analyticsRoutes, { prefix: '/api/analytics' });

  // Start
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`☕ KopiPOS API running on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\nReceived ${signal}, shutting down...`);
      await app.close();
      process.exit(0);
    });
  }
}

main();
