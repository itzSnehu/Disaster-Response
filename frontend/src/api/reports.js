import { apiFetch } from './client';

/**
 * Fetch community reports for a disaster incident.
 * Returns { data: [...], meta: { source, stale, warning } }
 * @param {string} disasterId - UUID of the disaster
 */
export async function getDisasterReports(disasterId) {
  return apiFetch(`/disasters/${disasterId}/reports`, { method: 'GET' });
}
