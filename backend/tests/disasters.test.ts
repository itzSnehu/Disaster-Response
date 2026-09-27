import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { Role, DisasterStatus } from '@prisma/client';
import { GroqService } from '../src/services/groq.service.js';
import { GeocodingService } from '../src/services/geocoding.service.js';

describe('Disasters Module Comprehensive API Tests', () => {
  let app: FastifyInstance;

  const mockAdminProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisaster = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Manhattan Flooding',
    description: 'Heavy flooding has affected Manhattan, NYC.',
    location: 'Manhattan, NYC',
    latitude: 40.7831,
    longitude: -73.9712,
    tags: ['flood', 'water'],
    status: DisasterStatus.ACTIVE,
    createdBy: mockAdminProfile.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();

    // Reset mocks
    vi.restoreAllMocks();

    // Mock Prisma methods
    app.prisma.$queryRaw = vi.fn().mockResolvedValue([{ 1: 1 }]);
    app.prisma.profile.findUnique = vi.fn().mockResolvedValue(mockAdminProfile);
    app.prisma.disaster.create = vi.fn().mockResolvedValue(mockDisaster);
    app.prisma.disaster.count = vi.fn().mockResolvedValue(1);
    app.prisma.disaster.findMany = vi.fn().mockResolvedValue([mockDisaster]);
    app.prisma.disaster.findUnique = vi.fn().mockResolvedValue(mockDisaster);
    app.prisma.disaster.update = vi.fn().mockResolvedValue(mockDisaster);
    app.prisma.disaster.delete = vi.fn().mockResolvedValue(mockDisaster);
  });

  it('REQUIRED TEST 1: POST /api/v1/disasters successfully creates disaster with coordinates & createdBy', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/disasters',
      headers: { authorization: 'Bearer mock-admin-jwt' },
      payload: {
        title: 'Manhattan Flooding',
        description: 'Heavy flooding in Manhattan, NYC.',
        location: 'Manhattan, NYC',
        tags: ['flood'],
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data).toBeDefined();
    expect(body.data.title).toBe('Manhattan Flooding');
    expect(body.data.createdBy).toBe(mockAdminProfile.id);
    expect(body.data.latitude).toBe(40.7831);
    expect(body.data.longitude).toBe(-73.9712);
  });

  it('REQUIRED TEST 2: POST /api/v1/disasters with missing title returns 400 VALIDATION_ERROR', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/disasters',
      headers: { authorization: 'Bearer mock-admin-jwt' },
      payload: {
        description: 'Heavy flooding without a title',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('REQUIRED TEST 4: Non-existent disaster ID returns 404 NOT_FOUND for GET, PATCH, DELETE', async () => {
    app.prisma.disaster.findUnique = vi.fn().mockResolvedValue(null);

    const nonExistentUuid = '99999999-9999-9999-9999-999999999999';

    // GET nonexistent
    const resGet = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${nonExistentUuid}`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resGet.statusCode).toBe(404);
    expect(resGet.json().error.code).toBe('NOT_FOUND');

    // PATCH nonexistent
    const resPatch = await app.inject({
      method: 'PATCH',
      url: `/api/v1/disasters/${nonExistentUuid}`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
      payload: { title: 'Updated Title' },
    });
    expect(resPatch.statusCode).toBe(404);

    // DELETE nonexistent
    const resDelete = await app.inject({
      method: 'DELETE',
      url: `/api/v1/disasters/${nonExistentUuid}`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resDelete.statusCode).toBe(404);
  });

  it('REQUIRED TEST 5: GET /api/v1/disasters filters by status and tag', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/disasters?status=ACTIVE&tag=flood',
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toBeDefined();
    expect(body.pagination.total).toBe(1);
  });

  it('REQUIRED TEST 8: Groq failure creates disaster without crashing API', async () => {
    vi.spyOn(GroqService, 'extractLocation').mockResolvedValue(null);
    vi.spyOn(GeocodingService, 'geocodeLocation').mockResolvedValue(null);

    app.prisma.disaster.create = vi.fn().mockImplementation(async ({ data }) => ({
      id: '22222222-2222-2222-2222-222222222222',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/disasters',
      headers: { authorization: 'Bearer mock-admin-jwt' },
      payload: {
        title: 'Unresolved Disaster',
        description: 'Some event description',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.title).toBe('Unresolved Disaster');
    expect(body.data.latitude).toBeNull();
    expect(body.data.longitude).toBeNull();
  });

  it('REQUIRED TEST 9: Geocoding failure creates disaster with null coordinates', async () => {
    vi.spyOn(GeocodingService, 'geocodeLocation').mockResolvedValue(null);

    app.prisma.disaster.create = vi.fn().mockImplementation(async ({ data }) => ({
      id: '33333333-3333-3333-3333-333333333333',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/disasters',
      headers: { authorization: 'Bearer mock-admin-jwt' },
      payload: {
        title: 'Unknown Island Fire',
        description: 'Fire reported on remote island',
        location: 'Unknown Island',
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.data.location).toBe('Unknown Island');
    expect(body.data.latitude).toBeNull();
    expect(body.data.longitude).toBeNull();
  });

  it('REQUIRED TEST 13: Unauthenticated request returns 401 UNAUTHORIZED', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/disasters',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHORIZED');
  });

  it('REQUIRED TEST 14: Invalid token returns 401 UNAUTHORIZED', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/disasters',
      headers: { authorization: 'Bearer invalid.malformed.jwt' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHORIZED');
  });
});
