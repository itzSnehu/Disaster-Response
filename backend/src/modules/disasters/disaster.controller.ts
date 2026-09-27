import { FastifyRequest, FastifyReply } from 'fastify';
import { DisasterService } from './disaster.service.js';
import {
  createDisasterSchema,
  updateDisasterSchema,
  disasterQuerySchema,
  disasterParamsSchema,
  resourceQuerySchema,
} from './disaster.schema.js';
import { formatSuccessResponse } from '../../utils/response.js';
import { ValidationError, UnauthorizedError } from '../../utils/errors.js';

export class DisasterController {
  /**
   * Create disaster handler
   * POST /api/v1/disasters
   */
  static async createDisaster(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user) {
      throw new UnauthorizedError('User authentication context is missing');
    }

    const parseResult = createDisasterSchema.safeParse(request.body);
    if (!parseResult.success) {
      throw new ValidationError('Invalid request body for disaster creation', parseResult.error.format());
    }

    const disaster = await DisasterService.createDisaster(
      request.server.prisma,
      parseResult.data,
      request.user.id
    );

    return reply.status(201).send(formatSuccessResponse(disaster));
  }

  /**
   * List disasters handler
   * GET /api/v1/disasters
   */
  static async getDisasters(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = disasterQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      throw new ValidationError('Invalid query parameters', parseResult.error.format());
    }

    const { data, pagination } = await DisasterService.getDisasters(
      request.server.prisma,
      parseResult.data
    );

    return reply.status(200).send(formatSuccessResponse(data, pagination));
  }

  /**
   * Get single disaster handler
   * GET /api/v1/disasters/:id
   */
  static async getDisasterById(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = disasterParamsSchema.safeParse(request.params);
    if (!parseResult.success) {
      throw new ValidationError('Invalid disaster ID parameter', parseResult.error.format());
    }

    const disaster = await DisasterService.getDisasterById(
      request.server.prisma,
      parseResult.data.id
    );

    return reply.status(200).send(formatSuccessResponse(disaster));
  }

  /**
   * Update disaster handler
   * PATCH /api/v1/disasters/:id
   */
  static async updateDisaster(request: FastifyRequest, reply: FastifyReply) {
    const paramsParse = disasterParamsSchema.safeParse(request.params);
    if (!paramsParse.success) {
      throw new ValidationError('Invalid disaster ID parameter', paramsParse.error.format());
    }

    const bodyParse = updateDisasterSchema.safeParse(request.body);
    if (!bodyParse.success) {
      throw new ValidationError('Invalid request body for disaster update', bodyParse.error.format());
    }

    const updatedDisaster = await DisasterService.updateDisaster(
      request.server.prisma,
      paramsParse.data.id,
      bodyParse.data
    );

    return reply.status(200).send(formatSuccessResponse(updatedDisaster));
  }

  /**
   * Delete disaster handler (ADMIN only)
   * DELETE /api/v1/disasters/:id
   */
  static async deleteDisaster(request: FastifyRequest, reply: FastifyReply) {
    const paramsParse = disasterParamsSchema.safeParse(request.params);
    if (!paramsParse.success) {
      throw new ValidationError('Invalid disaster ID parameter', paramsParse.error.format());
    }

    const result = await DisasterService.deleteDisaster(
      request.server.prisma,
      paramsParse.data.id
    );

    return reply.status(200).send(formatSuccessResponse(result));
  }

  /**
   * Discover nearby resources handler
   * GET /api/v1/disasters/:id/resources
   */
  static async getNearbyResources(request: FastifyRequest, reply: FastifyReply) {
    const paramsParse = disasterParamsSchema.safeParse(request.params);
    if (!paramsParse.success) {
      throw new ValidationError('Invalid disaster ID parameter', paramsParse.error.format());
    }

    const queryParse = resourceQuerySchema.safeParse(request.query);
    if (!queryParse.success) {
      throw new ValidationError('Invalid query parameters for resource search', queryParse.error.format());
    }

    const resources = await DisasterService.getNearbyResources(
      request.server.prisma,
      paramsParse.data.id,
      queryParse.data
    );

    return reply.status(200).send(formatSuccessResponse(resources));
  }

  /**
   * Fetch community reports handler
   * GET /api/v1/disasters/:id/reports
   */
  static async getDisasterReports(request: FastifyRequest, reply: FastifyReply) {
    const paramsParse = disasterParamsSchema.safeParse(request.params);
    if (!paramsParse.success) {
      throw new ValidationError('Invalid disaster ID parameter', paramsParse.error.format());
    }

    const query = request.query as { forceFail?: string };
    const forceFail = query.forceFail === 'true';

    const reportsResult = await DisasterService.getDisasterReports(
      request.server.prisma,
      paramsParse.data.id,
      forceFail
    );

    return reply.status(200).send({
      data: reportsResult.data,
      meta: reportsResult.meta,
    });
  }
}
