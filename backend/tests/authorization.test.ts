import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { Role, DisasterStatus } from '@prisma/client';

describe('Role-Based Authorization API Tests', () => {
  let app: FastifyInstance;

  const mockAdminProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockContributorProfile = {
    id: '00000000-0000-0000-0000-000000000002',
    role: Role.CONTRIBUTOR,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDisaster = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'San Jose Wildfire',
    description: 'Wildfire in San Jose hills',
    location: 'San Jose, CA',
    latitude: 37.3382,
    longitude: -121.8863,
    tags: ['fire'],
    status: DisasterStatus.ACTIVE,
    createdBy: mockContributorProfile.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();

    // Mock Prisma methods
    app.prisma.$queryRaw = vi.fn().mockResolvedValue([{ 1: 1 }]);
    app.prisma.disaster.findUnique = vi.fn().mockResolvedValue(mockDisaster);
    app.prisma.disaster.delete = vi.fn().mockResolvedValue(mockDisaster);
  });

  it('TEST 3: Contributor attempting DELETE returns 403 Forbidden', async () => {
    app.prisma.profile.findUnique = vi.fn().mockResolvedValue(mockContributorProfile);

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/disasters/${mockDisaster.id}`,
      headers: {
        authorization: 'Bearer mock-contributor-jwt',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('FORBIDDEN');
    expect(body.error.message).toContain('CONTRIBUTOR');
  });

  it('Admin attempting DELETE returns 200 OK and succeeds', async () => {
    app.prisma.profile.findUnique = vi.fn().mockResolvedValue(mockAdminProfile);

    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/disasters/${mockDisaster.id}`,
      headers: {
        authorization: 'Bearer mock-admin-jwt',
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.data).toBeDefined();
    expect(body.data.message).toBe('Disaster deleted successfully');
  });

  it('Unauthenticated request returns 401 Unauthorized', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/disasters/${mockDisaster.id}`,
    });

    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('UNAUTHORIZED');
  });
});
