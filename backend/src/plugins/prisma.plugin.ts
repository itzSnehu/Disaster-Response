import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

export const prismaPluginAsync: FastifyPluginAsync = async (fastify) => {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/disaster_test';
  }

  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  if (process.env.NODE_ENV !== 'test') {
    await prisma.$connect();
  }

  fastify.decorate('prisma', prisma);

  fastify.addHook('onClose', async (server) => {
    if (process.env.NODE_ENV !== 'test') {
      await server.prisma.$disconnect();
    }
  });
};

export const prismaPlugin = fp(prismaPluginAsync, {
  name: 'prisma-plugin',
});
