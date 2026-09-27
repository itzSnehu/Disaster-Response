import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDisasters } from '../api/disasters';
import { DisasterCard } from '../components/disasters/DisasterCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { DisasterMap } from '../components/map/DisasterMap';
import { useAuth } from '../hooks/useAuth';
import { useRealtime } from '../hooks/useRealtime';
import {
  Flame,
  CheckCircle2,
  MapPin,
  MessageSquare,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Map as MapIcon,
} from 'lucide-react';

export function Dashboard() {
  const { user, role } = useAuth();
  const { subscribe } = useRealtime();

  const [activeDisasters, setActiveDisasters] = useState([]);
  const [stats, setStats] = useState({ activeCount: 0, resolvedCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Active Disasters
      const activeRes = await getDisasters({ status: 'ACTIVE', limit: 6 });
      const activeData = activeRes?.data || [];
      const activeTotal = activeRes?.pagination?.total ?? activeData.length;

      // Fetch Resolved Disasters Count
      const resolvedRes = await getDisasters({ status: 'RESOLVED', limit: 1 });
      const resolvedTotal = resolvedRes?.pagination?.total ?? (resolvedRes?.data?.length || 0);

      setActiveDisasters(activeData);
      setStats({
        activeCount: activeTotal,
        resolvedCount: resolvedTotal,
      });
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Unable to connect to the Disaster API backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to Socket.IO realtime events for live updates
    const unsubscribe = subscribe(() => {
      fetchDashboardData();
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Find first disaster with valid coordinates for map preview center
  const firstWithCoords = activeDisasters.find((d) => d.latitude && d.longitude);

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting */}
      <div className="bg-gradient-to-r from-[#F47B4A] via-[#E9653B] to-[#F6B24D] rounded-3xl p-6 md:p-8 text-white shadow-warm-md relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-white/90 mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Role: {role}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.email ? user.email.split('@')[0] : 'Responder'}
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Stay informed. Coordinate response operations across emergency zones.
            </p>
          </div>

          <Link
            to="/disasters/new"
            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-white text-[#E9653B] font-extrabold text-sm hover:bg-[#FFF7F1] transition-all shadow-warm-sm w-fit"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Report Incident
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid (Mobile 2-column, Desktop 4-column) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Disasters Stat */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#8A817B] uppercase tracking-wider">Active Disasters</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#343434]">{loading ? '...' : stats.activeCount}</span>
            <p className="text-xs text-[#8A817B] mt-1 font-medium">Ongoing emergency incidents</p>
          </div>
        </div>

        {/* Resolved Disasters Stat */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#8A817B] uppercase tracking-wider">Resolved</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-[#343434]">{loading ? '...' : stats.resolvedCount}</span>
            <p className="text-xs text-[#8A817B] mt-1 font-medium">Controlled disaster zones</p>
          </div>
        </div>

        {/* Nearby Resources Stat */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#8A817B] uppercase tracking-wider">Resources</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FCE5D8] text-[#F47B4A] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-[#343434]">Haversine Active</span>
            <p className="text-xs text-[#8A817B] mt-1 font-medium">Proximity shelter & supply lookup</p>
          </div>
        </div>

        {/* Community Reports Stat */}
        <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#8A817B] uppercase tracking-wider">Reports</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FCE5D8] text-[#F47B4A] flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-[#343434]">Live Feed Active</span>
            <p className="text-xs text-[#8A817B] mt-1 font-medium">Eyewitness & social reports</p>
          </div>
        </div>
      </div>

      {/* Map Preview Section */}
      {firstWithCoords && (
        <div className="bg-white p-6 rounded-3xl border border-[#F0D8CB] shadow-warm-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center">
                <MapIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#343434]">Active Disasters Map Overview</h3>
                <p className="text-xs text-[#8A817B]">Live GIS positioning of ongoing emergency incidents</p>
              </div>
            </div>
            <Link
              to="/disasters"
              className="inline-flex items-center text-xs font-bold text-[#E9653B] hover:underline"
            >
              <span>Explore All Incidents</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <DisasterMap
            latitude={firstWithCoords.latitude}
            longitude={firstWithCoords.longitude}
            disasterTitle={firstWithCoords.title}
            disasterStatus={firstWithCoords.status}
            locationName={firstWithCoords.location}
            height="320px"
          />
        </div>
      )}

      {/* Active Incidents Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-extrabold text-[#343434]">Recent Active Disasters</h2>
            <p className="text-xs text-[#8A817B]">Active incidents requiring immediate attention</p>
          </div>

          <Link
            to="/disasters"
            className="inline-flex items-center text-xs font-bold text-[#E9653B] hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDashboardData} />
        ) : activeDisasters.length === 0 ? (
          <EmptyState
            title="No Active Disasters"
            message="There are currently no active disaster reports in the system."
            actionLabel="Report New Disaster"
            onAction={() => window.location.assign('/disasters/new')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeDisasters.map((disaster) => (
              <DisasterCard key={disaster.id} disaster={disaster} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
