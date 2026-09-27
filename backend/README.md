# Disaster Response Coordination Platform - Production Backend

A clean, maintainable, production-quality backend API built with **Node.js**, **TypeScript**, **Fastify**, **PostgreSQL (Supabase)**, **Prisma ORM**, **Supabase Auth**, **Groq AI**, **OpenStreetMap Nominatim**, **Haversine Geospatial Search**, and **Socket.IO Realtime Events**.

---

## 1. Overview

The **Disaster Response Coordination Platform** empowers emergency response teams and coordinators to manage disaster incidents, discover nearby emergency resources (shelters, hospitals, food, water, rescue operations) within a configurable geographic radius, receive real-time updates via WebSockets, and aggregate community reports with resilience against external infrastructure failures.

---

## 2. Key Features

- 🔐 **Authentication & RBAC**: Supabase JWT verification with server-side role resolution (`ADMIN` vs `CONTRIBUTOR`).
- 🤖 **AI Location Extraction**: Automatic extraction of human-readable location text from disaster descriptions using Groq LLM (`llama-3.3-70b-versatile`).
- 🗺️ **Nominatim Geocoding**: Automatic conversion of location strings to latitude/longitude coordinates with 24-hour geocode caching.
- 📍 **Geospatial Resource Discovery**: Haversine distance calculation to discover nearby resources within a radius (e.g. 5km, 10km) sorted nearest first.
- 💬 **Community Reports**: Normalized social/community reporting integration with in-memory caching and stale fallback resilience.
- ⚡ **Realtime WebSockets**: Socket.IO event stream emitting `disaster_updated` and `disaster_deleted` events immediately after database mutations succeed.
- 🛡️ **Security & Error Hardening**: 1MB payload body limits, strict Zod validation, fail-fast environment parsing, CORS origin isolation, and zero internal error leakage.
- 📚 **Interactive Swagger Docs**: OpenAPI 3.0 UI available at `/api/docs`.
- 🧪 **100% Automated Testing**: 19 Vitest integration/unit tests with zero external test dependencies.

---

## 3. Architecture

```mermaid
flowchart TD
    Client[Client / Frontend / Socket.IO Listener]

    subgraph Fastify API Server [Port 4000]
        Router[API Routes /api/v1/disasters]
        Auth[Auth Middleware - Supabase JWT]
        RBAC[RBAC Middleware - ADMIN / CONTRIBUTOR]
        Controller[Disaster Controller]
        Service[Disaster Service]
        Realtime[Socket.IO Realtime Server]
    end

    subgraph External & Storage
        DB[(Supabase PostgreSQL)]
        Groq[Groq AI API]
        Geo[OpenStreetMap Nominatim]
        Cache[In-Memory Map Cache]
        Reports[External / Mock Reports Provider]
    end

    Client -- REST API & Bearer JWT --> Router
    Client <== Socket.IO WebSockets ==> Realtime

    Router --> Auth --> RBAC --> Controller --> Service

    Service --> Groq
    Service --> Geo
    Service --> DB
    Service --> Cache
    Service --> Reports

    Service -- Post-DB Mutation --> Realtime
```

### End-to-End Location Resolution Flow

```
POST /api/v1/disasters
      │
      ▼
Fastify Auth & Zod Input Validation
      │
      ├── Location explicitly provided? ──► [ YES ] ──┐
      │                                                │
      └── [ NO ] ──► Groq AI Location Extraction ──────┤ ("Manhattan, NYC")
                          │                            │
                          ▼                            │
                    Extract Location ◄─────────────────┘
                          │
                          ▼
                 Nominatim Geocoding (Check 24h Cache)
                          │
                          ▼
             { latitude: 40.7831, longitude: -73.9712 }
                          │
                          ▼
         Prisma Client ──► PostgreSQL Database
                          │
                          ▼
             Emit Socket.IO `disaster_updated` Event
```

---

## 4. Technology Stack

| Technology | Purpose |
|---|---|
| **Node.js (v24)** | Runtime environment |
| **TypeScript (v5)** | Type-safe strict mode language |
| **Fastify (v5)** | High-performance HTTP Web Framework |
| **PostgreSQL (Supabase)** | Relational database storage |
| **Prisma ORM (v6)** | Database schema management & type-safe queries |
| **Supabase Auth** | Authentication identity provider & JWT verification |
| **Socket.IO (v4)** | Realtime WebSocket event server |
| **Groq API** | AI-assisted geographic location extraction from text |
| **Nominatim** | OpenStreetMap geocoding service |
| **Zod (v3)** | Schema validation for environment, body, query, and params |
| **Swagger / OpenAPI 3.0** | Interactive API browser documentation |
| **Vitest (v3)** | Automated test runner & assertion library |

---

## 5. Database Schema & Indexing

### Models

- **`Profile`**: Maps to Supabase `auth.users.id` (UUID). Role enum: `ADMIN` | `CONTRIBUTOR`.
- **`Disaster`**: Stores incident title, description, human-readable `location`, numeric `latitude`/`longitude`, `tags` array, `status` enum (`ACTIVE` | `RESOLVED`), and `createdBy` FK.
- **`Resource`**: Stores reusable emergency assets (`SHELTER`, `HOSPITAL`, `FOOD`, `WATER`, `RESCUE`) with mandatory `latitude` and `longitude`.

### Indexes

- `Disaster`: `@@index([createdBy])`, `@@index([status])`, `@@index([createdAt])`, `@@index([tags])`
- `Resource`: `@@index([type])`, `@@index([latitude])`, `@@index([longitude])`

---

## 6. Authentication & RBAC Rules

Expected header: `Authorization: Bearer <Supabase-JWT>`

| Endpoint | HTTP Method | Allowed Roles | Operation |
|---|---|---|---|
| `/health` | `GET` | Public | System health check |
| `/api/docs` | `GET` | Public | Interactive Swagger documentation |
| `/api/v1/disasters` | `POST` | `ADMIN`, `CONTRIBUTOR` | Create disaster incident |
| `/api/v1/disasters` | `GET` | `ADMIN`, `CONTRIBUTOR` | List disasters (Paginated & Filtered) |
| `/api/v1/disasters/:id` | `GET` | `ADMIN`, `CONTRIBUTOR` | Fetch single disaster by ID |
| `/api/v1/disasters/:id` | `PATCH` | `ADMIN`, `CONTRIBUTOR` | Update disaster incident |
| `/api/v1/disasters/:id` | `DELETE` | **`ADMIN` ONLY** | Delete disaster (`403 Forbidden` for Contributor) |
| `/api/v1/disasters/:id/resources` | `GET` | `ADMIN`, `CONTRIBUTOR` | Discover nearby resources within radius |
| `/api/v1/disasters/:id/reports` | `GET` | `ADMIN`, `CONTRIBUTOR` | Fetch community reports (Cached / Stale fallback) |

---

## 7. Realtime Socket.IO Events

The Socket.IO server is active on the same port as the HTTP server (`http://localhost:4000`).

### Event Contracts

1. **`disaster_updated`**: Emitted when a disaster is created or updated.
   ```json
   {
     "event": "created",
     "disaster": {
       "id": "11111111-1111-1111-1111-111111111111",
       "title": "Manhattan Flooding",
       "status": "ACTIVE",
       "location": "Manhattan, NYC",
       "latitude": 40.7831,
       "longitude": -73.9712,
       "createdAt": "2026-09-26T20:00:00.000Z",
       "updatedAt": "2026-09-26T20:00:00.000Z"
     }
   }
   ```

2. **`disaster_deleted`**: Emitted when a disaster is deleted.
   ```json
   {
     "id": "11111111-1111-1111-1111-111111111111"
   }
   ```

### Realtime Client Verification Snippet

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connected", (data) => {
  console.log("Connected to Realtime Server:", data);
});

socket.on("disaster_updated", (payload) => {
  console.log("Disaster Event Received:", payload.event, payload.disaster);
});

socket.on("disaster_deleted", (payload) => {
  console.log("Disaster Deleted:", payload.id);
});
```

---

## 8. Community Reports Caching & Resilience Strategy

`GET /api/v1/disasters/:id/reports` utilizes a 3-tier resilience architecture:

1. **Fresh Cache (`source: "cache"`)**: Returns cached reports if within 5-minute TTL (`CACHE_TTL_SECONDS=300`).
2. **External Fetch (`source: "external"`)**: On cache miss, fetches from provider with 5s timeout, normalizes data, and updates cache.
3. **Stale Cache Fallback (`source: "stale_cache"`, `stale: true`)**: If external service times out or fails, returns expired cached data with a warning flag instead of crashing.
4. **Empty Fallback (`source: "fallback"`)**: If provider fails and no stale cache exists, returns `{ data: [], meta: { source: "fallback", warning: "..." } }` with HTTP 200.

---

## 9. Local Installation & Development Guide

```bash
# 1. Install dependencies
npm install

# 2. Configure environment file
cp .env.example .env

# 3. Generate Prisma Client
npm run db:generate

# 4. Push database schema to Supabase PostgreSQL
npm run db:push

# 5. Seed demo data (Profiles, Disasters, Emergency Resources)
npm run db:seed

# 6. Compile TypeScript
npm run build

# 7. Run Vitest Test Suite (19 Tests)
npm test

# 8. Start Development Server
npm run dev
```

---

## 10. Supabase Setup Instructions

1. Create a project at [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** -> **Providers** -> **Email** and **Disable "Confirm email"** (enables immediate login for demo accounts).
3. Copy Database strings and API Keys into `.env`:

```env
DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:5432/postgres"

SUPABASE_URL="https://[ref].supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJKV1..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJKV1..."

GROQ_API_KEY="gsk_..."
NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
REPORTS_SERVICE_URL="http://localhost:4000/api/v1/mock/reports"
CACHE_TTL_SECONDS=300
PORT=4000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

---

## 11. Interactive API Documentation

Access Swagger UI in your browser at:

```
http://localhost:4000/api/docs
```

To test protected endpoints, click **Authorize** at the top right and input:
`Bearer mock-admin-jwt` or your actual Supabase access token.

---

## 12. Automated Test Suite (19 Tests Passed)

```bash
npm test
```

- `tests/disasters.test.ts` (8 tests): Creation with coordinates, 400 validation, 404 missing handling, status/tag filtering, Groq failure fallback, Geocoding failure fallback, 401 unauthenticated, 401 invalid token.
- `tests/authorization.test.ts` (3 tests): Contributor DELETE returns 403 Forbidden, Admin DELETE succeeds, Unauthenticated returns 401.
- `tests/phase2.test.ts` (5 tests): Haversine distance tolerance, AI extraction flow, nearby resource radius filtering & sorting, community reports cache hit/miss & stale fallback, invalid resource query parameters (400).
- `tests/realtime.test.ts` (3 tests): Client connection, `disaster_updated` emission, `disaster_deleted` emission.

---

## 13. AI Usage Disclosure

- **AI Service (`Groq` API)**: Utilized in `src/services/groq.service.ts` solely for extracting location text from disaster description strings.
- **AI Coding Assistance**: Developed in pair-programming collaboration with Google DeepMind's Antigravity AI assistant. Architecture, types, error boundaries, tests, and documentation were developer-reviewed and empirically verified.

---

## 14. Architectural Tradeoffs & Design Decisions

1. **In-Memory Cache vs. Redis**: Used a TypeScript `Map` cache with TTL and stale retention for zero external dependency overhead. For multi-node horizontal scaling, Redis can replace `CacheService`.
2. **Haversine Formula vs. PostGIS**: Calculated distance in Node.js (`src/utils/geo.ts`) since resource dataset size per disaster query is within tens of thousands. PostGIS with spatial indexing would be added for scale beyond 1M+ resources.
3. **Mock Reports Provider**: Simulated external social/community provider to demonstrate normalization, caching, and stale fallback without depending on flaky 3rd-party APIs.
4. **Synchronous Geocoding vs. Message Queue**: Geocodes synchronously on disaster creation with 6-second timeout. If timeout occurs, creation succeeds with `latitude = null`. Background BullMQ worker queues could be added for async geocoding retries in future phases.

---

## 15. Future Improvements

- Add PostGIS database extensions & spatial indexes (`ST_DWithin`).
- Add Redis pub/sub for scaling Socket.IO across multiple server instances.
- Add background queue processing (BullMQ / Celery) for async background geocoding.
- Implement official social media ingestion pipelines (Twitter/X API, Reddit API).
