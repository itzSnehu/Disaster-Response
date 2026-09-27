import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AppLayout } from '../components/layout/AppLayout';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Pages
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Disasters } from '../pages/Disasters';
import { CreateDisaster } from '../pages/CreateDisaster';
import { DisasterDetails } from '../pages/DisasterDetails';
import { EditDisaster } from '../pages/EditDisaster';
import { ComingSoon } from '../pages/ComingSoon';
import { Map as MapIcon, FileText } from 'lucide-react';

/**
 * ProtectedRoute component - redirects unauthenticated users to /login
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F1] flex items-center justify-center p-4">
        <LoadingSpinner message="Checking authentication status..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * PublicOnlyRoute component - redirects authenticated users to /dashboard
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7F1] flex items-center justify-center p-4">
        <LoadingSpinner message="Initializing application..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Protected App Routes inside AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/disasters" element={<Disasters />} />
        <Route path="/disasters/new" element={<CreateDisaster />} />
        <Route path="/disasters/:id" element={<DisasterDetails />} />
        <Route path="/disasters/:id/edit" element={<EditDisaster />} />
        
        {/* Phase 2 Placeholders */}
        <Route
          path="/map"
          element={
            <ComingSoon
              title="Interactive GIS Incident Map"
              featureName="Geospatial Map & Live Boundary Tracking"
              icon={MapIcon}
            />
          }
        />
        <Route
          path="/reports"
          element={
            <ComingSoon
              title="Community Incident Reports"
              featureName="Social Media & Citizen Report Aggregation"
              icon={FileText}
            />
          }
        />
      </Route>

      {/* Default Catch-all Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
