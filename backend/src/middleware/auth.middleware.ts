import { FastifyRequest, FastifyReply } from 'fastify';
import { UnauthorizedError } from '../utils/errors.js';
import { verifySupabaseJwt } from '../modules/auth/auth.utils.js';
import { Role } from '@prisma/client';

export async function authenticateMiddleware(request: FastifyRequest, _reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedError('Authorization header missing');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthorizedError('Malformed Authorization header. Format must be: Bearer <token>');
  }

  const token = parts[1];
  if (!token) {
    throw new UnauthorizedError('Token missing');
  }

  const verifiedUser = await verifySupabaseJwt(token);
  if (!verifiedUser) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }

  // Find or auto-create profile for verified Supabase user ID
  let profile = await request.server.prisma.profile.findUnique({
    where: { id: verifiedUser.id },
  });

  if (!profile) {
    try {
      const defaultRole = verifiedUser.role || (verifiedUser.id === '00000000-0000-0000-0000-000000000001' ? Role.ADMIN : Role.CONTRIBUTOR);
      profile = await request.server.prisma.profile.create({
        data: {
          id: verifiedUser.id,
          email: verifiedUser.email || null,
          role: defaultRole,
        },
      });
    } catch (error) {
      throw new UnauthorizedError('User profile not found and could not be initialized');
    }
  } else if (verifiedUser.email && !profile.email) {
    // If profile exists without email, save email
    try {
      profile = await request.server.prisma.profile.update({
        where: { id: verifiedUser.id },
        data: { email: verifiedUser.email },
      });
    } catch (e) {
      // Ignore non-fatal update error
    }
  }

  request.user = {
    id: profile.id,
    role: profile.role,
    email: verifiedUser.email,
  };
}
