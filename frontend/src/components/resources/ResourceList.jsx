import {
  Home,
  Hospital,
  Utensils,
  Droplets,
  ShieldAlert,
  Layers,
  MapPin,
  Compass,
} from 'lucide-react';

const RESOURCE_TYPES = [
  { id: 'ALL', label: 'All' },
  { id: 'SHELTER', label: 'Shelter', icon: Home },
  { id: 'HOSPITAL', label: 'Hospital', icon: Hospital },
  { id: 'FOOD', label: 'Food', icon: Utensils },
  { id: 'WATER', label: 'Water', icon: Droplets },
  { id: 'RESCUE', label: 'Rescue', icon: ShieldAlert },
];

const RADIUS_OPTIONS = [1, 5, 10, 25];

export function ResourceList({
  resources = [],
  typeFilter = 'ALL',
  onTypeFilterChange,
  radius = 5,
  onRadiusChange,
  loading = false,
  error = null,
}) {
  const getResourceBadge = (type) => {
    switch (type?.toUpperCase()) {
      case 'SHELTER':
        return { label: 'Shelter', bg: 'bg-[#FCE5D8]', text: 'text-[#E9653B]', icon: Home };
      case 'HOSPITAL':
        return { label: 'Hospital', bg: 'bg-rose-50', text: 'text-rose-600', icon: Hospital };
      case 'FOOD':
        return { label: 'Food', bg: 'bg-amber-50', text: 'text-amber-700', icon: Utensils };
      case 'WATER':
        return { label: 'Water', bg: 'bg-blue-50', text: 'text-blue-600', icon: Droplets };
      case 'RESCUE':
        return { label: 'Rescue', bg: 'bg-orange-50', text: 'text-orange-700', icon: ShieldAlert };
      default:
        return { label: type || 'Resource', bg: 'bg-[#FFF7F1]', text: 'text-[#343434]', icon: Layers };
    }
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-[#F0D8CB] shadow-warm-sm space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F0D8CB]">
        <div>
          <h3 className="text-lg font-black text-[#343434] tracking-tight flex items-center">
            <Compass className="w-5 h-5 mr-2 text-[#F47B4A]" />
            Nearby Emergency Resources
          </h3>
          <p className="text-xs text-[#8A817B]">
            Proximity relief shelters, medical centers & supplies
          </p>
        </div>

        {/* Radius Selector Pills */}
        <div className="flex items-center space-x-1.5 bg-[#FFF7F1] p-1.5 rounded-2xl border border-[#F0D8CB] w-fit">
          <span className="text-[11px] font-bold text-[#8A817B] px-2">Radius:</span>
          {RADIUS_OPTIONS.map((r) => {
            const isActive = radius === r;
            return (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-2.5 py-1 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-[#F47B4A] text-white shadow-warm-sm'
                    : 'text-[#343434] hover:bg-[#FCE5D8]'
                }`}
              >
                {r} km
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Type Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {RESOURCE_TYPES.map((t) => {
          const isActive = typeFilter === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onTypeFilterChange(t.id)}
              className={`inline-flex items-center px-3.5 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-[#F47B4A] border-[#F47B4A] text-white shadow-warm-sm'
                  : 'bg-white border-[#F0D8CB] text-[#343434] hover:bg-[#FFF7F1]'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 mr-1.5" />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] animate-pulse space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-gray-200 rounded-lg"></div>
                <div className="h-4 w-16 bg-[#FCE5D8] rounded-full"></div>
              </div>
              <div className="h-3 w-24 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      ) : resources.length === 0 ? (
        <div className="text-center py-8 px-4 bg-[#FFF7F1] rounded-2xl border border-[#F0D8CB] space-y-2">
          <Layers className="w-8 h-8 mx-auto text-[#8A817B]" />
          <h4 className="text-sm font-bold text-[#343434]">No Resources Found</h4>
          <p className="text-xs text-[#8A817B]">
            No nearby emergency resources detected within {radius} km of this disaster incident.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {resources.map((item) => {
            const badge = getResourceBadge(item.type);
            const BadgeIcon = badge.icon;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-[#FFF7F1] border border-[#F0D8CB] hover:border-[#F47B4A] transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${badge.bg} ${badge.text}`}
                    >
                      <BadgeIcon className="w-3 h-3 mr-1" />
                      {badge.label}
                    </span>
                    {item.distance !== undefined && (
                      <span className="text-xs font-black text-[#E9653B]">
                        {Number(item.distance).toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#343434] group-hover:text-[#E9653B] transition-colors">
                    {item.name}
                  </h4>
                  {(item.latitude || item.longitude) && (
                    <div className="flex items-center text-[11px] text-[#8A817B] font-mono">
                      <MapPin className="w-3 h-3 mr-1 text-[#8A817B]" />
                      <span>
                        {Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
