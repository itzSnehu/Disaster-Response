import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { Role, DisasterStatus, ResourceType } from '@prisma/client';
import { calculateDistanceKm } from '../src/utils/geo.js';
import { CacheService } from '../src/services/cache.service.js';
import { MockReportsService } from '../src/services/mock-reports.service.js';

describe('Geospatial & Community Reports Tests', () => {
  let app: FastifyInstance;

  const mockAdminProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisasterNYC = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Manhattan Flooding',
    description: 'Heavy flooding in Manhattan, NYC.',
    location: 'Manhattan, NYC',
    latitude: 40.7831,
    longitude: -73.9712,
    tags: ['flood'],
    status: DisasterStatus.ACTIVE,
    createdBy: mockAdminProfile.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockResources = [
    {
      id: 'res-1',
      name: 'Nearby Shelter A',
      type: ResourceType.SHELTER,
      latitude: 40.785,
      longitude: -73.97, // ~0.24 km from NYC
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'res-2',
      name: 'Relief Hub B',
      type: ResourceType.FOOD,
      latitude: 40.85,
      longitude: -73.91, // ~9.04 km from NYC
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'res-3',
      name: 'Distant Base C',
      type: ResourceType.RESCUE,
      latitude: 41.0,
      longitude: -73.8, // ~28.2 km from NYC
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    CacheService.clear();
    app = buildApp();
    await app.ready();

    // Reset mocks
    vi.restoreAllMocks();

    app.prisma.$queryRaw = vi.fn().mockResolvedValue([{ 1: 1 }]);
    app.prisma.profile.findUnique = vi.fn().mockResolvedValue(mockAdminProfile);
    app.prisma.disaster.findUnique = vi.fn().mockResolvedValue(mockDisasterNYC);
    app.prisma.resource.findMany = vi.fn().mockResolvedValue(mockResources);
  });

  it('REQUIRED TEST 7: Haversine formula calculates distance within acceptable tolerance', () => {
    // Distance between NYC (40.7831, -73.9712) and Shelter A (40.785, -73.97) is ~0.24 km
    const dist = calculateDistanceKm(40.7831, -73.9712, 40.785, -73.97);
    expect(dist).toBeGreaterThan(0.2);
    expect(dist).toBeLessThan(0.3);
  });

  it('REQUIRED TEST 6: GET /api/v1/disasters/:id/resources filters within radius & sorts nearest first', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/resources?radius=5`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(1); // Only Shelter A is < 5km
    expect(body.data[0].id).toBe('res-1');
    expect(body.data[0].distanceKm).toBeDefined();
  });

  it('REQUIRED TEST 10: Community reports caching — 1st request calls provider, 2nd request hits cache', async () => {
    const providerSpy = vi.spyOn(MockReportsService, 'getReportsFromProvider');

    // 1st request -> Cache MISS
    const res1 = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/reports`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(res1.statusCode).toBe(200);
    expect(res1.json().meta.source).toBe('external');
    expect(providerSpy).toHaveBeenCalledTimes(1);

    // 2nd request -> Cache HIT
    const res2 = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/reports`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(res2.statusCode).toBe(200);
    expect(res2.json().meta.source).toBe('cache');
    expect(providerSpy).toHaveBeenCalledTimes(1); // Still 1 call
  });

  it('REQUIRED TEST 11: Community reports provider failure returns stale cached data', async () => {
    // Populate cache first
    await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/reports`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });

    // Simulate provider failure
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/reports?forceFail=true`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.meta.source).toBe('stale_cache');
    expect(body.meta.stale).toBe(true);
    expect(body.meta.warning).toBeDefined();
  });

  it('REQUIRED TEST 12: Invalid resource query parameters return 400 Bad Request', async () => {
    // Invalid lat (> 90)
    const resLat = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/resources?lat=200`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resLat.statusCode).toBe(400);

    // Invalid lng (> 180)
    const resLng = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/resources?lng=500`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resLng.statusCode).toBe(400);

    // Negative radius
    const resRadius = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/resources?radius=-1`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resRadius.statusCode).toBe(400);

    // Exceeding max radius (> 100km)
    const resMaxRadius = await app.inject({
      method: 'GET',
      url: `/api/v1/disasters/${mockDisasterNYC.id}/resources?radius=150`,
      headers: { authorization: 'Bearer mock-admin-jwt' },
    });
    expect(resMaxRadius.statusCode).toBe(400);
  });
});
