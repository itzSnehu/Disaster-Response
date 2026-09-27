import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDisasters } from '../api/disasters';
import { DisasterCard } from '../components/disasters/DisasterCard';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { useRealtime } from '../hooks/useRealtime';
import { Search, Filter, PlusCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';

export function Disasters() {
  const { subscribe } = useRealtime();
  const [disasters, setDisasters] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDisastersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 12,
      };
      if (statusFilter) params.status = statusFilter;
      if (tagFilter) params.tag = tagFilter;

      const res = await getDisasters(params);
      setDisasters(res?.data || []);
      if (res?.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching disasters:', err);
      setError(err.message || 'Failed to load disaster list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisastersData();
  }, [page, statusFilter, tagFilter]);

  // Subscribe to Socket.IO realtime events
  useEffect(() => {
    const unsubscribe = subscribe(({ type, data }) => {
      if (type === 'DELETE' && data?.id) {
        setDisasters((prev) => prev.filter((d) => d.id !== data.id));
      } else {
        fetchDisastersData();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  // Client-side text search filtering
  const filteredDisasters = disasters.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q)
    );
  });

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setTagFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#343434] tracking-tight">
            Disaster Incidents
          </h1>
          <p className="text-sm text-[#8A817B]">
            Browse, search, and manage emergency incidents nationwide.
          </p>
        </div>

        <Link
          to="/disasters/new"
          className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-[#F47B4A] hover:bg-[#E9653B] text-white font-extrabold text-sm transition-all shadow-warm-sm hover:shadow-warm-md w-full md:w-auto"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Report Disaster
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-[#8A817B]" />
            <input
              type="text"
              aria-label="Search disasters by title or location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, location..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3.5 top-3.5 text-[#8A817B]" />
            <select
              aria-label="Filter by incident status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434] appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE Only</option>
              <option value="RESOLVED">RESOLVED Only</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <input
              type="text"
              aria-label="Filter by tag keyword"
              value={tagFilter}
              onChange={(e) => {
                setTagFilter(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by tag (e.g. flood)"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] focus:border-[#F47B4A] focus:outline-hidden text-sm font-medium text-[#343434]"
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        {(searchQuery || statusFilter || tagFilter) && (
          <div className="flex items-center space-x-2 pt-2 text-xs">
            <span className="font-bold text-[#8A817B]">Active Filters:</span>
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-2.5 py-1 rounded-xl bg-[#FCE5D8] text-[#E9653B] font-bold hover:bg-[#F9C1A5] transition-colors"
            >
              <span>Clear All</span>
              <X className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchDisastersData} />
      ) : filteredDisasters.length === 0 ? (
        <EmptyState
          title="No Matching Disasters"
          message={
            statusFilter || tagFilter || searchQuery
              ? 'No disaster records match your applied filter parameters.'
              : 'No disaster incidents recorded yet.'
          }
          actionLabel={statusFilter || tagFilter || searchQuery ? 'Clear Filters' : 'Report First Disaster'}
          onAction={statusFilter || tagFilter || searchQuery ? clearFilters : () => window.location.assign('/disasters/new')}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDisasters.map((disaster) => (
              <DisasterCard key={disaster.id} disaster={disaster} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-[#F0D8CB] shadow-warm-sm">
              <span className="text-xs font-bold text-[#8A817B]">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>

              <div className="flex space-x-2">
                <button
                  aria-label="Previous Page"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2.5 rounded-xl border border-[#F0D8CB] bg-[#FFF7F1] text-[#343434] hover:bg-[#F47B4A] hover:text-white disabled:opacity-40 disabled:hover:bg-[#FFF7F1] disabled:hover:text-[#343434] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  aria-label="Next Page"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2.5 rounded-xl border border-[#F0D8CB] bg-[#FFF7F1] text-[#343434] hover:bg-[#F47B4A] hover:text-white disabled:opacity-40 disabled:hover:bg-[#FFF7F1] disabled:hover:text-[#343434] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
