import { useState, useEffect, useCallback } from 'react';
import { getNearbyResources } from '../api/resources';

export function useResources(disasterId, lat, lng, initialRadius = 5) {
  const [resources, setResources] = useState([]);
  const [radius, setRadius] = useState(initialRadius);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    if (!disasterId || lat === undefined || lat === null || lng === undefined || lng === null) {
      setResources([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getNearbyResources(disasterId, { lat, lng, radius });
      setResources(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch nearby resources:', err);
      setError(err.message || 'Unable to load nearby emergency resources.');
    } finally {
      setLoading(false);
    }
  }, [disasterId, lat, lng, radius]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const filteredResources = resources.filter((item) => {
    if (!typeFilter || typeFilter === 'ALL') return true;
    return item.type?.toUpperCase() === typeFilter.toUpperCase();
  });

  return {
    resources,
    filteredResources,
    typeFilter,
    setTypeFilter,
    radius,
    setRadius,
    loading,
    error,
    refetch: fetchResources,
  };
}
