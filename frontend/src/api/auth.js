import { apiFetch } from './client';

/**
 * Fetches current authenticated user profile from backend database.
 */
export async function fetchUserProfile() {
  const res = await apiFetch('/auth/me');
  return res?.data || null;
}

/**
 * Syncs user profile with the backend Prisma database.
 */
export async function syncUserProfile(role = 'CONTRIBUTOR') {
  const res = await apiFetch('/auth/sync', {
    method: 'POST',
    body: JSON.stringify({ role }),
  });
  return res?.data || null;
}
