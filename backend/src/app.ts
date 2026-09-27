import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { prismaPlugin } from './plugins/prisma.plugin.js';
import { swaggerPlugin } from './plugins/swagger.plugin.js';
import { disasterRoutes } from './modules/disasters/disaster.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { AppError } from './utils/errors.js';
import { formatErrorResponse } from './utils/response.js';
import { env } from './config/env.js';

export function buildApp(): FastifyInstance {
  const app = Fastify({
    bodyLimit: 1048576, // 1MB body payload size limit
    logger: env.NODE_ENV === 'test' ? false : {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    },
  });

  // Register CORS with configured frontend origin
  app.register(cors, {
    origin: env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Register Plugins
  app.register(prismaPlugin);
  app.register(swaggerPlugin);

  // Health check endpoint
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'System health check',
        description: 'Returns health status and environment info',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              timestamp: { type: 'string' },
              environment: { type: 'string' },
              database: { type: 'string', example: 'connected' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      let dbStatus = 'connected';
      try {
        await app.prisma.$queryRaw`SELECT 1`;
      } catch (err) {
        dbStatus = 'disconnected';
      }

      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        database: dbStatus,
      });
    }
  );

  // Register API module routes
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(disasterRoutes, { prefix: '/api/v1/disasters' });

  // Centralized Error Handler
  app.setErrorHandler((error, _request, reply) => {
    // 1. Custom Application Errors
    if (error instanceof AppError) {
      return reply
        .status(error.statusCode)
        .send(formatErrorResponse(error.code, error.message, error.details));
    }

    const err = error as { validation?: unknown; code?: unknown; message?: string; statusCode?: number };

    // 2. Fastify Payload / Validation Errors
    if (err.statusCode === 413) {
      return reply.status(413).send(formatErrorResponse('PAYLOAD_TOO_LARGE', 'Request payload exceeds 1MB limit'));
    }

    if (err.validation) {
      return reply
        .status(400)
        .send(formatErrorResponse('VALIDATION_ERROR', 'Validation failed for request parameters or body', err.validation));
    }

    // 3. Prisma Database Error Handling
    if (err.code && typeof err.code === 'string' && err.code.startsWith('P')) {
      if (err.code === 'P2025') {
        return reply.status(404).send(formatErrorResponse('NOT_FOUND', 'Record not found'));
      }
      if (err.code === 'P2002') {
        return reply.status(400).send(formatErrorResponse('DUPLICATE_ENTRY', 'A record with this identifier already exists'));
      }
      return reply.status(400).send(formatErrorResponse('DATABASE_ERROR', 'Database operation failed'));
    }

    // 4. Log unexpected errors internally without leaking stack traces to client
    app.log.error(error);

    const errorMessage = err.message || 'An unexpected internal server error occurred';
    const message = env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : errorMessage;
    return reply.status(500).send(formatErrorResponse('INTERNAL_SERVER_ERROR', message));
  });

  return app;
}
