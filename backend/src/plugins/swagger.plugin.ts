import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { swaggerConfig, swaggerUiConfig } from '../config/swagger.js';

export const swaggerPluginAsync: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifySwagger, swaggerConfig);
  await fastify.register(fastifySwaggerUi, swaggerUiConfig);
};

export const swaggerPlugin = fp(swaggerPluginAsync, {
  name: 'swagger-plugin',
});
