import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

export function authorize(allowedRoles: Role[]) {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('User is not authenticated');
    }

    if (!allowedRoles.includes(request.user.role)) {
      throw new ForbiddenError(
        `User role '${request.user.role}' is not authorized to perform this action. Required role: ${allowedRoles.join(' or ')}`
      );
    }
  };
}
