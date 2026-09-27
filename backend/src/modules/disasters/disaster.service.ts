import { PrismaClient, Prisma } from '@prisma/client';
import { CreateDisasterInput, UpdateDisasterInput, DisasterQueryInput, ResourceQueryInput } from './disaster.schema.js';
import { NotFoundError, BadRequestError } from '../../utils/errors.js';
import { PaginationMeta } from '../../utils/response.js';
import { GroqService } from '../../services/groq.service.js';
import { GeocodingService } from '../../services/geocoding.service.js';
import { MockReportsService } from '../../services/mock-reports.service.js';
import { calculateDistanceKm } from '../../utils/geo.js';
import { ResourceWithDistance } from './disaster.types.js';
import { emitDisasterEvent, emitDisasterDeletedEvent } from '../../realtime/socket.js';

export class DisasterService {
  /**
   * Create a new disaster incident with automatic AI location extraction & Nominatim geocoding.
   */
  static async createDisaster(prisma: PrismaClient, input: CreateDisasterInput, userId: string) {
    let resolvedLocation: string | null = input.location || null;
    let resolvedLatitude: number | null = input.latitude ?? null;
    let resolvedLongitude: number | null = input.longitude ?? null;

    // 1. If location text was not explicitly provided by client, extract location using Groq AI
    if (!resolvedLocation && input.description) {
      resolvedLocation = await GroqService.extractLocation(input.description);
    }

    // 2. If location text exists but coordinates are missing, geocode via Nominatim
    if (resolvedLocation && (resolvedLatitude === null || resolvedLongitude === null)) {
      const geocodeResult = await GeocodingService.geocodeLocation(resolvedLocation);
      if (geocodeResult) {
        resolvedLatitude = geocodeResult.latitude;
        resolvedLongitude = geocodeResult.longitude;
      }
    }

    const disaster = await prisma.disaster.create({
      data: {
        title: input.title,
        description: input.description,
        location: resolvedLocation,
        latitude: resolvedLatitude,
        longitude: resolvedLongitude,
        tags: input.tags,
        status: input.status,
        createdBy: userId,
      },
    });

    // Emit Socket.IO realtime event after DB write succeeds
    emitDisasterEvent('created', disaster);

    return disaster;
  }

  /**
   * Get a paginated list of disasters with optional tag and status filtering
   */
  static async getDisasters(prisma: PrismaClient, query: DisasterQueryInput) {
    const { page, limit, tag, status } = query;

    const where: Prisma.DisasterWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const skip = (page - 1) * limit;
    const take = limit;

    const [total, disasters] = await Promise.all([
      prisma.disaster.count({ where }),
      prisma.disaster.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    const pagination: PaginationMeta = {
      page,
      limit,
      total,
      totalPages,
    };

    return {
      data: disasters,
      pagination,
    };
  }

  /**
   * Get a single disaster by ID
   */
  static async getDisasterById(prisma: PrismaClient, id: string) {
    const disaster = await prisma.disaster.findUnique({
      where: { id },
    });

    if (!disaster) {
      throw new NotFoundError(`Disaster with ID '${id}' not found`);
    }

    return disaster;
  }

  /**
   * Update an existing disaster. If location is modified, re-run geocoding.
   */
  static async updateDisaster(prisma: PrismaClient, id: string, input: UpdateDisasterInput) {
    const existing = await this.getDisasterById(prisma, id);

    let updatedLocation = input.location !== undefined ? input.location : existing.location;
    let updatedLatitude = input.latitude !== undefined ? input.latitude : existing.latitude;
    let updatedLongitude = input.longitude !== undefined ? input.longitude : existing.longitude;

    // If location is explicitly updated by client, re-run geocoding
    if (input.location !== undefined) {
      if (input.location && input.location.trim()) {
        const geocodeResult = await GeocodingService.geocodeLocation(input.location);
        if (geocodeResult) {
          updatedLatitude = geocodeResult.latitude;
          updatedLongitude = geocodeResult.longitude;
        } else {
          updatedLatitude = null;
          updatedLongitude = null;
        }
      } else {
        updatedLatitude = null;
        updatedLongitude = null;
      }
    }

    const updatedDisaster = await prisma.disaster.update({
      where: { id },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.location !== undefined && { location: updatedLocation }),
        ...(input.latitude !== undefined || input.location !== undefined ? { latitude: updatedLatitude } : {}),
        ...(input.longitude !== undefined || input.location !== undefined ? { longitude: updatedLongitude } : {}),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.status !== undefined && { status: input.status }),
      },
    });

    // Emit Socket.IO realtime event after DB update succeeds
    emitDisasterEvent('updated', updatedDisaster);

    return updatedDisaster;
  }

  /**
   * Delete a disaster incident by ID
   */
  static async deleteDisaster(prisma: PrismaClient, id: string) {
    await this.getDisasterById(prisma, id);

    await prisma.disaster.delete({
      where: { id },
    });

    // Emit Socket.IO realtime event after DB deletion succeeds
    emitDisasterDeletedEvent(id);

    return { message: 'Disaster deleted successfully' };
  }

  /**
   * Discover nearby emergency resources within radius (in km) using Haversine calculation.
   */
  static async getNearbyResources(prisma: PrismaClient, disasterId: string, query: ResourceQueryInput) {
    const disaster = await this.getDisasterById(prisma, disasterId);

    const targetLat = query.lat !== undefined ? query.lat : disaster.latitude;
    const targetLng = query.lng !== undefined ? query.lng : disaster.longitude;

    if (targetLat === null || targetLat === undefined || targetLng === null || targetLng === undefined) {
      throw new BadRequestError(
        'Disaster has no recorded geographic coordinates. Please specify explicit lat and lng query parameters.'
      );
    }

    const allResources = await prisma.resource.findMany();

    const resourcesWithDistance: ResourceWithDistance[] = allResources
      .map((resource) => {
        const distanceKm = calculateDistanceKm(targetLat, targetLng, resource.latitude, resource.longitude);
        return {
          ...resource,
          distanceKm,
        };
      })
      .filter((resource) => resource.distanceKm <= query.radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return resourcesWithDistance;
  }

  /**
   * Fetch community reports with in-memory caching & stale fallback.
   */
  static async getDisasterReports(prisma: PrismaClient, disasterId: string, forceFail: boolean = false) {
    await this.getDisasterById(prisma, disasterId);

    return MockReportsService.getDisasterReports(disasterId, forceFail);
  }
}
