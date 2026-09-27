import { buildApp } from './app.js';
import { env } from './config/env.js';
import { initRealtime } from './realtime/socket.js';

async function startServer() {
  const app = buildApp();

  try {
    const address = await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // Initialize Socket.IO realtime server on Fastify's HTTP server
    initRealtime(app.server);

    console.log(`🚀 Disaster Response Platform Backend running on ${address}`);
    console.log(`⚡ Socket.IO Realtime Server active on ${address}`);
    console.log(`📚 Swagger API Documentation available at http://localhost:${env.PORT}/api/docs`);
    console.log(`💓 Health Check available at http://localhost:${env.PORT}/health`);
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
