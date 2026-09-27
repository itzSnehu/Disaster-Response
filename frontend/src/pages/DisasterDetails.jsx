import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDisaster, deleteDisaster } from '../api/disasters';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../components/common/Toast';
import { useResources } from '../hooks/useResources';
import { useReports } from '../hooks/useReports';

import { DeleteConfirmModal } from '../components/common/DeleteConfirmModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { DisasterMap } from '../components/map/DisasterMap';
import { ResourceList } from '../components/resources/ResourceList';
import { CommunityReportsList } from '../components/reports/CommunityReportsList';

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Tag,
  Map as MapIcon,
  ShieldCheck,
} from 'lucide-react';

export function DisasterDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Load Disaster Incident Details
  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDisaster(id);
      setDisaster(res.data);
    } catch (err) {
      console.error('Error loading disaster details:', err);
      setError(err.message || 'Failed to fetch disaster details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Hook for Nearby Resources (Passes disaster coords & radius)
  const {
    resources,
    filteredResources,
    typeFilter,
    setTypeFilter,
    radius,
    setRadius,
    loading: resourcesLoading,
    error: resourcesError,
  } = useResources(
    id,
    disaster?.latitude,
    disaster?.longitude,
    5 // default radius 5 km
  );

  // Hook for Community Reports
  const {
    reports,
    meta: reportsMeta,
    loading: reportsLoading,
    error: reportsError,
  } = useReports(id);

  // Delete Action Handler
  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDisaster(id);
      addToast('Disaster incident deleted successfully.', 'success');
      navigate('/disasters');
    } catch (err) {
      console.error('Delete error:', err);
      const msg =
        err.status === 403
          ? "You don't have permission to delete disasters."
          : err.message || 'Failed to delete disaster.';
      addToast(msg, 'error');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <LoadingSpinner message="Loading disaster incident details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDetail} />;
  }

  if (!disaster) {
    return <ErrorState message="Disaster incident not found." />;
  }

  const isActive = disaster.status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* Top Header Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/disasters"
            className="inline-flex items-center text-xs font-bold text-[#E9653B] hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Disasters List
          </Link>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                isActive
                  ? 'bg-[#FCE5D8] text-[#E9653B] border border-[#F9C1A5]'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {disaster.status}
            </span>
            <span className="text-xs font-medium text-[#8A817B]">
              ID: {disaster.id?.substring(0, 8)}...
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Link
            to={`/disasters/${disaster.id}/edit`}
            className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-white border border-[#F0D8CB] text-[#343434] font-bold text-xs hover:bg-[#FFF7F1] transition-colors shadow-warm-sm"
          >
            <Edit className="w-4 h-4 mr-1.5 text-[#F47B4A]" />
            Edit Incident
          </Link>

          {/* Delete Action (ADMIN ONLY) */}
          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs hover:bg-rose-100 transition-colors shadow-warm-sm"
            >
              <Trash2 className="w-4 h-4 mr-1.5 text-rose-500" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Layout: Desktop 2-column, Mobile stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Narrative, Resources & Community Reports */}
        <div className="lg:col-span-7 space-y-6">
          {/* Disaster Info Card */}
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#F0D8CB] shadow-warm-md space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#343434] tracking-tight mb-2">
                {disaster.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8A817B]">
                {disaster.location && (
                  <div className="flex items-center font-semibold text-[#E9653B]">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{disaster.location}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    Created: {new Date(disaster.createdAt || disaster.created_at).toLocaleDateString()}
                  </span>
                </div>
                {(disaster.updatedAt || disaster.updated_at) && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>
                      Updated: {new Date(disaster.updatedAt || disaster.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {disaster.tags && disaster.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-[#F0D8CB]">
                {disaster.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-xl bg-[#FFF7F1] border border-[#F0D8CB] text-[#E9653B] font-bold text-xs"
                  >
                    <Tag className="w-3 h-3 mr-1 text-[#F47B4A]" />
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="space-y-2 pt-2 border-t border-[#F0D8CB]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#8A817B]">
                Incident Narrative & Situation Summary
              </h3>
              <p className="text-sm md:text-base text-[#343434] leading-relaxed whitespace-pre-wrap font-normal">
                {disaster.description}
              </p>
            </div>
          </div>

          {/* Nearby Resources Component */}
          <ResourceList
            resources={filteredResources}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            radius={radius}
            onRadiusChange={setRadius}
            loading={resourcesLoading}
            error={resourcesError}
          />

          {/* Community Reports Component */}
          <CommunityReportsList
            reports={reports}
            meta={reportsMeta}
            loading={reportsLoading}
            error={reportsError}
          />
        </div>

        {/* Right Column: Interactive Leaflet Map Widget */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-[#F0D8CB] shadow-warm-md space-y-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center">
                  <MapIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#343434]">Interactive GIS Map</h3>
                  <p className="text-[11px] text-[#8A817B]">Live incident center & nearby markers</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#E9653B] bg-[#FFF7F1] px-2.5 py-1 rounded-full border border-[#F0D8CB]">
                {filteredResources.length} Markers
              </span>
            </div>

            {/* Leaflet Map */}
            <DisasterMap
              latitude={disaster.latitude}
              longitude={disaster.longitude}
              disasterTitle={disaster.title}
              disasterStatus={disaster.status}
              locationName={disaster.location}
              resources={filteredResources}
              height="450px"
            />
          </div>
        </div>
      </div>

      {/* ADMIN Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Disaster Incident?"
        description={`Are you sure you want to delete "${disaster.title}"? This action cannot be undone.`}
        loading={deleting}
      />
    </div>
  );
}
