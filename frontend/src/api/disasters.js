import { apiFetch } from './client';

export async function getDisasters(params = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);
  if (params.status) query.append('status', params.status);
  if (params.tag) query.append('tag', params.tag);

  const queryString = query.toString();
  const endpoint = `/disasters${queryString ? `?${queryString}` : ''}`;
  return apiFetch(endpoint, { method: 'GET' });
}

export async function getDisaster(id) {
  return apiFetch(`/disasters/${id}`, { method: 'GET' });
}

export async function createDisaster(data) {
  return apiFetch('/disasters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDisaster(id, data) {
  return apiFetch(`/disasters/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteDisaster(id) {
  return apiFetch(`/disasters/${id}`, {
    method: 'DELETE',
  });
}
