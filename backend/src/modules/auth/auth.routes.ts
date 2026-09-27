import { FastifyPluginAsync } from 'fastify';
import { authenticateMiddleware } from '../../middleware/auth.middleware.js';
import { AuthController } from './auth.controller.js';

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // All auth endpoints require authentication
  fastify.addHook('onRequest', authenticateMiddleware);

  // GET /api/v1/auth/me
  fastify.get('/me', {
    schema: {
      summary: 'Get current authenticated user profile',
      description: 'Returns profile details for the active authenticated Supabase user.',
      security: [{ bearerAuth: [] }],
    },
  }, AuthController.getMe);

  // POST /api/v1/auth/sync
  fastify.post('/sync', {
    schema: {
      summary: 'Sync or initialize user profile in database',
      description: 'Ensures the authenticated user exists in the Prisma PostgreSQL database.',
      security: [{ bearerAuth: [] }],
    },
  }, AuthController.syncProfile);
};
