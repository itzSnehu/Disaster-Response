import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPinOff, AlertTriangle, Flame, Shield, Hospital, Home, Utensils, Droplets } from 'lucide-react';

/**
 * Helper component to recenter and fit bounds on the map when coordinates or resources change
 */
function MapRecenter({ center, zoom, resources = [] }) {
  const map = useMap();

  useEffect(() => {
    if (!center || !center[0] || !center[1]) return;

    if (resources && resources.length > 0) {
      // Create bounds containing center and all valid resource locations
      const validPoints = [center];
      resources.forEach((r) => {
        if (r.latitude && r.longitude) {
          validPoints.push([r.latitude, r.longitude]);
        }
      });
      if (validPoints.length > 1) {
        const bounds = L.latLngBounds(validPoints);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        return;
      }
    }

    map.setView(center, zoom || 13, { animate: true });
  }, [center, zoom, resources, map]);

  return null;
}

// Custom DivIcons for Map Markers
const createDisasterIcon = () => {
  return L.divIcon({
    className: 'custom-disaster-icon',
    html: `
      <div style="
        background: radial-gradient(circle, #F47B4A 0%, #E9653B 100%);
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 14px rgba(233, 101, 59, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transform: translate(-50%, -50%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
};

const createResourceIcon = (type) => {
  let bgColor = '#F47B4A'; // default orange
  let svgContent = '';

  switch (type?.toUpperCase()) {
    case 'SHELTER':
      bgColor = '#E9653B';
      svgContent = `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`;
      break;
    case 'HOSPITAL':
      bgColor = '#DC2626'; // Soft red
      svgContent = `<path d="M12 6v12M6 12h12"/>`;
      break;
    case 'FOOD':
      bgColor = '#F6B24D'; // Amber
      svgContent = `<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8Z"/><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3"/><path d="m2.1 21.9 6.4-6.4"/>`;
      break;
    case 'WATER':
      bgColor = '#2563EB'; // Blue
      svgContent = `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>`;
      break;
    case 'RESCUE':
      bgColor = '#D97706'; // Rescue orange/amber
      svgContent = `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`;
      break;
    default:
      svgContent = `<circle cx="12" cy="12" r="8"/>`;
  }

  return L.divIcon({
    className: 'custom-resource-icon',
    html: `
      <div style="
        background: ${bgColor};
        width: 32px;
        height: 32px;
        border-radius: 12px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 3px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transform: translate(-50%, -50%);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          ${svgContent}
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export function DisasterMap({
  latitude,
  longitude,
  disasterTitle = 'Disaster Location',
  disasterStatus = 'ACTIVE',
  locationName,
  resources = [],
  height = '400px',
  className = '',
}) {
  const hasValidCoords =
    latitude !== undefined &&
    latitude !== null &&
    longitude !== undefined &&
    longitude !== null &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude));

  if (!hasValidCoords) {
    return (
      <div
        style={{ height }}
        className={`w-full bg-[#FFF7F1] border border-[#F0D8CB] rounded-3xl flex flex-col items-center justify-center p-6 text-center shadow-warm-sm ${className}`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#FCE5D8] text-[#E9653B] flex items-center justify-center mb-3">
          <MapPinOff className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-[#343434]">Location Coordinates Unavailable</h4>
        <p className="text-xs text-[#8A817B] max-w-sm mt-1">
          Geospatial latitude and longitude coordinates are not available for this disaster incident yet.
        </p>
      </div>
    );
  }

  const center = [Number(latitude), Number(longitude)];
  const disasterIcon = createDisasterIcon();

  return (
    <div
      style={{ height }}
      className={`w-full rounded-3xl overflow-hidden border border-[#F0D8CB] shadow-warm-sm relative z-0 ${className}`}
    >
      <MapContainer center={center} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={center} zoom={13} resources={resources} />

        {/* Primary Disaster Incident Marker */}
        <Marker position={center} icon={disasterIcon}>
          <Popup>
            <div className="p-1 space-y-1.5 max-w-xs">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#FCE5D8] text-[#E9653B]">
                  {disasterStatus}
                </span>
                <span className="text-[10px] font-bold text-[#8A817B]">Emergency Center</span>
              </div>
              <h4 className="text-sm font-black text-[#343434] leading-tight">{disasterTitle}</h4>
              {locationName && <p className="text-xs font-semibold text-[#E9653B]">{locationName}</p>}
              <p className="text-[11px] text-[#8A817B] font-mono">
                {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Nearby Resource Markers */}
        {resources.map((resource) => {
          if (!resource.latitude || !resource.longitude) return null;
          const resPos = [Number(resource.latitude), Number(resource.longitude)];
          const resIcon = createResourceIcon(resource.type);

          return (
            <Marker key={resource.id} position={resPos} icon={resIcon}>
              <Popup>
                <div className="p-1 space-y-1 max-w-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-[#E9653B]">
                    {resource.type}
                  </span>
                  <h5 className="text-xs font-bold text-[#343434] mt-1">{resource.name}</h5>
                  {resource.distance !== undefined && (
                    <p className="text-xs font-extrabold text-[#E9653B]">
                      {Number(resource.distance).toFixed(1)} km away
                    </p>
                  )}
                  <p className="text-[10px] text-[#8A817B] font-mono">
                    {Number(resource.latitude).toFixed(4)}, {Number(resource.longitude).toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
