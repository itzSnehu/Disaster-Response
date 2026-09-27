import { Role } from '@prisma/client';

export interface AuthUser {
  id: string;
  role: Role;
  email?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}
