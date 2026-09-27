import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { buildApp } from '../src/app.js';
import { FastifyInstance } from 'fastify';
import { initRealtime, emitDisasterEvent, emitDisasterDeletedEvent } from '../src/realtime/socket.js';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { Role, DisasterStatus } from '@prisma/client';

describe('Realtime Socket.IO Event Tests', () => {
  let app: FastifyInstance;
  let clientSocket: ClientSocket;
  let port: number;

  const mockAdminProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';
    app = buildApp();

    // Start HTTP server on dynamic port
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const addressInfo = app.server.address();
    port = typeof addressInfo === 'object' && addressInfo ? addressInfo.port : 4000;

    // Initialize Realtime Socket.IO server
    initRealtime(app.server);

    // Mock Prisma
    app.prisma.$queryRaw = vi.fn().mockResolvedValue([{ 1: 1 }]);
    app.prisma.profile.findUnique = vi.fn().mockResolvedValue(mockAdminProfile);
    app.prisma.disaster.create = vi.fn().mockImplementation(async ({ data }) => ({
      id: 'realtime-disaster-123',
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  afterEach(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    await app.close();
  });

  it('Client connects to Socket.IO and receives initial connected event', async () => {
    await new Promise<void>((resolve) => {
      clientSocket = ioClient(`http://127.0.0.1:${port}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connected', (data) => {
        expect(data).toBeDefined();
        expect(data.message).toContain('Realtime Event Stream');
        resolve();
      });
    });
  });

  it('Creating disaster emits realtime disaster_updated event to connected sockets', async () => {
    await new Promise<void>((resolve) => {
      clientSocket = ioClient(`http://127.0.0.1:${port}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connected', async () => {
        clientSocket.on('disaster_updated', (data) => {
          expect(data).toBeDefined();
          expect(data.event).toBe('created');
          expect(data.disaster.id).toBe('realtime-disaster-123');
          expect(data.disaster.title).toBe('Realtime Flood');
          resolve();
        });

        // Trigger REST API call which emits event after DB mutation
        await app.inject({
          method: 'POST',
          url: '/api/v1/disasters',
          headers: { authorization: 'Bearer mock-admin-jwt' },
          payload: {
            title: 'Realtime Flood',
            description: 'Flood event for socket test',
          },
        });
      });
    });
  });

  it('Deleting disaster emits realtime disaster_deleted event to connected sockets', async () => {
    await new Promise<void>((resolve) => {
      clientSocket = ioClient(`http://127.0.0.1:${port}`, {
        transports: ['websocket'],
      });

      clientSocket.on('connected', () => {
        clientSocket.on('disaster_deleted', (data) => {
          expect(data).toBeDefined();
          expect(data.id).toBe('disaster-to-delete-999');
          resolve();
        });

        // Emit delete event directly
        emitDisasterDeletedEvent('disaster-to-delete-999');
      });
    });
  });
});
