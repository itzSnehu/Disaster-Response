import { useState, useEffect, useCallback } from 'react';
import { getDisasterReports } from '../api/reports';

export function useReports(disasterId) {
  const [reports, setReports] = useState([]);
  const [meta, setMeta] = useState({ source: 'external', stale: false, warning: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = useCallback(async () => {
    if (!disasterId) {
      setReports([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await getDisasterReports(disasterId);
      setReports(res?.data || []);
      if (res?.meta) {
        setMeta(res.meta);
      }
    } catch (err) {
      console.error('Failed to fetch community reports:', err);
      setError(err.message || 'Unable to load community incident reports.');
    } finally {
      setLoading(false);
    }
  }, [disasterId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return {
    reports,
    meta,
    loading,
    error,
    refetch: fetchReports,
  };
}
