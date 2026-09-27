import { FastifyPluginAsync } from 'fastify';
import { Role } from '@prisma/client';
import { authenticateMiddleware } from '../../middleware/auth.middleware.js';
import { authorize } from '../../middleware/authorization.middleware.js';
import { DisasterController } from './disaster.controller.js';

export const disasterRoutes: FastifyPluginAsync = async (fastify) => {
  // All disaster routes require authentication
  fastify.addHook('onRequest', authenticateMiddleware);

  // POST /api/v1/disasters (ADMIN + CONTRIBUTOR)
  fastify.post(
    '/',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'Create a new disaster incident',
        description:
          'Creates a disaster incident. Automatically extracts location using Groq AI if missing from description and geocodes coordinates via OpenStreetMap Nominatim. Roles allowed: ADMIN, CONTRIBUTOR.',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['ACTIVE', 'RESOLVED'], default: 'ACTIVE' },
          },
        },
        response: {
          201: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    DisasterController.createDisaster
  );

  // GET /api/v1/disasters (ADMIN + CONTRIBUTOR)
  fastify.get(
    '/',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'List disaster incidents with pagination and filtering',
        description: 'Returns a list of disaster incidents sorted newest first. Roles allowed: ADMIN, CONTRIBUTOR.',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', default: 1, minimum: 1 },
            limit: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
            tag: { type: 'string', description: 'Filter disasters containing specific tag' },
            status: { type: 'string', enum: ['ACTIVE', 'RESOLVED'], description: 'Filter by status' },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
              pagination: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                  total: { type: 'integer' },
                  totalPages: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
    DisasterController.getDisasters
  );

  // GET /api/v1/disasters/:id (ADMIN + CONTRIBUTOR)
  fastify.get(
    '/:id',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'Get single disaster by ID',
        description: 'Retrieves a single disaster incident by UUID. Roles allowed: ADMIN, CONTRIBUTOR.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    DisasterController.getDisasterById
  );

  // PATCH /api/v1/disasters/:id (ADMIN + CONTRIBUTOR)
  fastify.patch(
    '/:id',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'Update disaster incident',
        description: 'Updates disaster incident fields. If location changes, geocoding re-runs. Roles allowed: ADMIN, CONTRIBUTOR.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            location: { type: 'string' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
            tags: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['ACTIVE', 'RESOLVED'] },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'object', additionalProperties: true },
            },
          },
        },
      },
    },
    DisasterController.updateDisaster
  );

  // DELETE /api/v1/disasters/:id (ADMIN ONLY)
  fastify.delete(
    '/:id',
    {
      preHandler: authorize([Role.ADMIN]),
      schema: {
        summary: 'Delete disaster incident (ADMIN ONLY)',
        description: 'Deletes a disaster incident by UUID. Mandatory business rule: ADMIN ONLY. Returns 403 Forbidden for CONTRIBUTOR.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    DisasterController.deleteDisaster
  );

  // GET /api/v1/disasters/:id/resources (ADMIN + CONTRIBUTOR)
  fastify.get(
    '/:id/resources',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'Discover nearby emergency resources within radius',
        description: 'Finds emergency resources (shelters, hospitals, food, water, rescue) near a disaster using Haversine calculation.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        querystring: {
          type: 'object',
          properties: {
            lat: { type: 'number', minimum: -90, maximum: 90 },
            lng: { type: 'number', minimum: -180, maximum: 180 },
            radius: { type: 'number', default: 10, minimum: 0.1, maximum: 100 },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
            },
          },
        },
      },
    },
    DisasterController.getNearbyResources
  );

  // GET /api/v1/disasters/:id/reports (ADMIN + CONTRIBUTOR)
  fastify.get(
    '/:id/reports',
    {
      preHandler: authorize([Role.ADMIN, Role.CONTRIBUTOR]),
      schema: {
        summary: 'Fetch community reports with in-memory caching & stale fallback',
        description: 'Fetches community reports for a disaster. Leverages in-memory caching and stale fallback if external provider fails.',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
        response: {
          200: {
            type: 'object',
            additionalProperties: true,
            properties: {
              data: { type: 'array', items: { type: 'object', additionalProperties: true } },
              meta: {
                type: 'object',
                additionalProperties: true,
                properties: {
                  source: { type: 'string' },
                  stale: { type: 'boolean' },
                  warning: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    DisasterController.getDisasterReports
  );
};
