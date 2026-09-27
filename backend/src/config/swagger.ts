import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    info: {
      title: 'Disaster Response Coordination Platform API',
      description: 'Phase 2 Backend REST API with AI Location Extraction, Geocoding, Nearby Resource Search, & Community Reports.',
      version: '2.0.0',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Supabase JWT access token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Health', description: 'System health monitoring endpoint' },
      { name: 'Disasters', description: 'Disaster incident management, nearby resources & community reports' },
    ],
  },
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/api/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
};
