import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '@prisma/client';

export class AuthController {
  /**
   * GET /api/v1/auth/me
   * Fetches the authenticated user's profile from the database.
   */
  static async getMe(request: FastifyRequest, reply: FastifyReply) {
    const userId = request.user?.id;
    if (!userId) {
      return reply.status(401).send({ error: { message: 'Unauthorized' } });
    }

    const profile = await request.server.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return reply.status(404).send({ error: { message: 'User profile not found in database' } });
    }

    return reply.status(200).send({
      data: {
        id: profile.id,
        email: profile.email || request.user?.email,
        role: profile.role,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  }

  /**
   * POST /api/v1/auth/sync
   * Explicitly syncs or updates the authenticated user's profile in the database.
   */
  static async syncProfile(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user;
    if (!user?.id) {
      return reply.status(401).send({ error: { message: 'Unauthorized' } });
    }

    const body = (request.body as { role?: Role }) || {};
    const targetRole = body.role || user.role || Role.CONTRIBUTOR;

    const profile = await request.server.prisma.profile.upsert({
      where: { id: user.id },
      update: {
        email: user.email || undefined,
        role: targetRole,
      },
      create: {
        id: user.id,
        email: user.email || null,
        role: targetRole,
      },
    });

    return reply.status(200).send({
      data: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      },
    });
  }
}
