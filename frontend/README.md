# Disaster Response Coordination Platform — Frontend

A production-grade, highly responsive React web application for emergency incident management, geospatial resource discovery, eyewitness community reporting, and real-time event streaming.

---

## 🎨 Visual Design & Inspiration

The user interface was inspired by the emergency response reference design system:

- **Primary Emergency Orange**: `#F47B4A`
- **Deep Terracotta Accent**: `#E9653B`
- **Soft Peach Highlight**: `#F9C1A5`
- **Warm Cream Background**: `#FFF7F1`
- **Card Container**: `#FFFFFF` with subtle `#F0D8CB` border & soft shadows
- **Soft Surface**: `#FCE5D8`
- **Primary Text**: `#343434` (Charcoal)
- **Muted Metadata**: `#8A817B` (Warm Gray)

### Design Principles
- Card-based information hierarchy
- Mobile-first bottom navigation with safe-area padding
- Fixed desktop sidebar with real-time status telemetry
- Accessible form elements and visible focus rings
- Soft, non-intrusive micro-animations

---

## 🚀 Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Custom Design Tokens
- **Icons**: Lucide React
- **Routing**: React Router v7 (`BrowserRouter`, Protected & Public routes)
- **Authentication**: `@supabase/supabase-js` (JWT session persistence & role management)
- **Mapping**: Leaflet + `react-leaflet` with OpenStreetMap tile layers
- **Realtime**: `socket.io-client`
- **HTTP Client**: Native `fetch` wrapper with automatic JWT Bearer injection & error normalization

---

## 🛠️ Environment Variables Setup

Create a `.env` file in `frontend/`:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:4000/api/v1
```

> **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` or backend secrets in the frontend environment.

---

## 📦 Installation & Running

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000/` (or `http://localhost:3001/`).

### 3. Production Build
```bash
npm run build
```
Generates minified production assets in `dist/`.

---

## 🔑 Key Features & Architecture

### 1. Authentication & Role Handling
- **Supabase Auth Integration**: Email/password registration and login with persistent session restoration on page reload.
- **RBAC Enforcement**:
  - `ADMIN`: Full CRUD privileges including **Delete Incident** action with confirmation modal.
  - `CONTRIBUTOR`: Create, view, and update privileges. Delete actions are hidden from the UI.
- **Backend Authority**: Frontend handles backend `403 Forbidden` responses gracefully via toast notifications.
- **Demo Role Switcher**: Includes an inline role selector for rapid evaluator testing.

### 2. Interactive GIS Mapping (Leaflet)
- Displays emergency incident center with an animated warm orange pin.
- Custom SVG DivIcon markers for nearby resources:
  - 🏠 **SHELTER**: Terracotta home badge (`#E9653B`)
  - 🏥 **HOSPITAL**: Soft red cross badge (`#DC2626`)
  - 🍱 **FOOD**: Amber utensils badge (`#F6B24D`)
  - 💧 **WATER**: Blue droplet badge (`#2563EB`)
  - 🛡️ **RESCUE**: Shield badge (`#D97706`)
- Automatic map recentering and bounds fitting (`MapRecenter`).
- Graceful missing coordinates container (*"Location Coordinates Unavailable"*).

### 3. Nearby Resources & Geospatial Discovery
- Fetches resources via `GET /api/v1/disasters/:id/resources?lat=...&lng=...&radius=...`.
- Interactive radius selector pills (**1 km, 5 km, 10 km, 25 km**).
- Category filter pills (**All, Shelter, Hospital, Food, Water, Rescue**).
- Distance calculation in kilometers (`1.2 km away`).

### 4. Community Reports & Failure Fallbacks
- Fetches eyewitness reports via `GET /api/v1/disasters/:id/reports`.
- Source metadata indicators (**Live Feed**, **Cached Data**, **Temporary Fallback**).
- Stale data warning banners when external services fail over to cached snapshots.

### 5. Realtime Socket.IO Integration
- Connects to backend Socket.IO stream (`disaster_updated`, `disaster_deleted`).
- Live connection badge (🟢 **Live** / ⚪ **Offline**).
- Dynamic React state updates without full page reloads.
- Non-spammable realtime toast notifications.
- Reusable `RealtimeProvider` with clean socket disconnection on component unmount.

### 6. Error Handling & Network Resilience
- **Global Error Boundary**: React class component catching rendering errors with a clean fallback screen and reload button.
- **HTTP Error Normalization**: Centralized handling for `401` (redirect to login), `403` (permission message), `404` (not found), `500` (server error), and network disconnects (*"Unable to connect to the response server"*).

---

## 📱 Responsive Layout Breakdown

- **Mobile (<1024px)**: Stacked layout with compact 2-column metric cards, map container, resource list, community reports, and fixed bottom navigation bar (`Home`, `Disasters`, `+`, `Map`, `Reports`).
- **Tablet (768px - 1024px)**: Fluid 2-column card grid and adaptive map heights.
- **Desktop (1024px+)**: Fixed sidebar navigation, max-width content container (`max-w-7xl`), 4-column metric statistics, and 2-column detail layouts with sticky Leaflet map widgets.
