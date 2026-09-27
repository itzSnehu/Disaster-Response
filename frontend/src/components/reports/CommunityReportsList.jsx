import { MessageSquare, User, Clock, AlertCircle, Radio, Database, RefreshCw } from 'lucide-react';

export function CommunityReportsList({
  reports = [],
  meta = { source: 'external', stale: false, warning: null },
  loading = false,
  error = null,
}) {
  const getSourceBadge = () => {
    switch (meta?.source) {
      case 'external':
        return {
          label: 'Live Feed',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: Radio,
        };
      case 'cache':
        return {
          label: 'Cached Data',
          bg: 'bg-[#FCE5D8] text-[#E9653B] border-[#F9C1A5]',
          icon: Database,
        };
      case 'fallback':
      default:
        return {
          label: 'Temporary Fallback',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: RefreshCw,
        };
    }
  };

  const badge = getSourceBadge();
  const BadgeIcon = badge.icon;

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-[#F0D8CB] shadow-warm-sm space-y-5">
      {/* Header & Source Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0D8CB]">
        <div>
          <h3 className="text-lg font-black text-[#343434] tracking-tight flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-[#F47B4A]" />
            Community Incident Reports
          </h3>
          <p className="text-xs text-[#8A817B]">
            Real-time social & eyewitness updates from on-ground responders
          </p>
        </div>

        {/* Source Status Indicator */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.bg}`}>
          <BadgeIcon className="w-3.5 h-3.5 mr-1.5" />
          <span>{badge.label}</span>
        </div>
      </div>

      {/* Stale Warning Banner if service failed over to cached/fallback data */}
      {meta?.stale && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>
            {meta?.warning || 'Community reports are temporarily unavailable. Showing the latest available information.'}
          </span>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] animate-pulse space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 bg-gray-200 rounded-lg"></div>
                <div className="h-3 w-16 bg-gray-100 rounded-lg"></div>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-lg"></div>
              <div className="h-3 w-3/4 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 px-4 bg-[#FFF7F1] rounded-2xl border border-[#F0D8CB] space-y-2">
          <MessageSquare className="w-8 h-8 mx-auto text-[#8A817B]" />
          <h4 className="text-sm font-bold text-[#343434]">No Reports Available</h4>
          <p className="text-xs text-[#8A817B]">
            There are currently no eyewitness or community reports logged for this incident.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
          {reports.map((report) => (
            <div
              key={report.id || Math.random()}
              className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] hover:border-[#F47B4A] transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center font-bold text-[#343434]">
                  <div className="w-6 h-6 rounded-full bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center mr-2 text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span>{report.user || report.author || 'Citizen Reporter'}</span>
                </div>
                <div className="flex items-center text-[#8A817B] text-[11px]">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatTimeAgo(report.created_at || report.createdAt)}</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-[#343434] leading-relaxed font-normal">
                {report.content || report.text || report.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
