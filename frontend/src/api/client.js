import { supabase } from '../lib/supabase';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');

/**
 * Universal fetch wrapper with Supabase Auth token injection and HTTP status error normalization.
 */
export async function apiFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Get active Supabase session access token
  let token = null;
  try {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token || null;
  } catch (err) {
    console.warn('Failed to retrieve Supabase session token:', err);
  }

  // Fallback demo tokens for testing/demo mode if Supabase session isn't live
  if (!token) {
    const localRole = localStorage.getItem('demo_role') || 'ADMIN';
    token = localRole === 'ADMIN' ? 'mock-admin-jwt' : 'mock-contributor-jwt';
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = null;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    console.error('Network request failed:', netErr);
    const error = new Error('Unable to connect to the response server. Please check your network or backend server.');
    error.status = 0;
    error.code = 'NETWORK_ERROR';
    throw error;
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    let errorMessage = data?.error?.message;

    if (!errorMessage) {
      switch (response.status) {
        case 401:
          errorMessage = 'Authentication session expired. Please sign in again.';
          break;
        case 403:
          errorMessage = "You don't have permission to perform this operation.";
          break;
        case 404:
          errorMessage = 'The requested resource was not found.';
          break;
        case 500:
          errorMessage = 'Internal server error occurred. Please try again later.';
          break;
        default:
          errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.code = data?.error?.code || `HTTP_${response.status}`;
    error.details = data?.error?.details || null;

    throw error;
  }

  return data;
}
