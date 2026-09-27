import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env.js';

let ioInstance: SocketIOServer | null = null;

/**
 * Initializes Socket.IO server on top of Fastify's HTTP server instance.
 */
export function initRealtime(server: HttpServer): SocketIOServer {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: env.FRONTEND_URL || '*',
      methods: ['GET', 'POST'],
    },
  });

  ioInstance.on('connection', (socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    
    socket.emit('connected', {
      message: 'Connected to Disaster Response Realtime Event Stream',
      authenticated: Boolean(token),
      timestamp: new Date().toISOString(),
    });
  });

  return ioInstance;
}

/**
 * Returns active Socket.IO server instance
 */
export function getRealtimeIO(): SocketIOServer | null {
  return ioInstance;
}

/**
 * Emits realtime 'disaster_updated' event after database mutation succeeds
 */
export function emitDisasterEvent(event: 'created' | 'updated', disaster: any): void {
  if (ioInstance) {
    ioInstance.emit('disaster_updated', {
      event,
      disaster: {
        id: disaster.id,
        title: disaster.title,
        status: disaster.status,
        location: disaster.location,
        latitude: disaster.latitude,
        longitude: disaster.longitude,
        createdAt: disaster.createdAt,
        updatedAt: disaster.updatedAt,
      },
    });
  }
}

/**
 * Emits realtime 'disaster_deleted' event after database deletion succeeds
 */
export function emitDisasterDeletedEvent(id: string): void {
  if (ioInstance) {
    ioInstance.emit('disaster_deleted', { id });
  }
}
