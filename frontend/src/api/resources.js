import { apiFetch } from './client';

/**
 * Fetch nearby resources for a disaster incident within a given radius.
 * @param {string} disasterId - UUID of the disaster
 * @param {Object} params - { lat, lng, radius }
 */
export async function getNearbyResources(disasterId, params = {}) {
  const query = new URLSearchParams();
  if (params.lat !== undefined && params.lat !== null) query.append('lat', params.lat);
  if (params.lng !== undefined && params.lng !== null) query.append('lng', params.lng);
  if (params.radius !== undefined && params.radius !== null) query.append('radius', params.radius);

  const queryString = query.toString();
  const endpoint = `/disasters/${disasterId}/resources${queryString ? `?${queryString}` : ''}`;
  return apiFetch(endpoint, { method: 'GET' });
}
