import { useState, useEffect, useCallback } from 'react';
import { Subscription, ApiError } from '../types';
import { subscriptionService } from '../services/subscriptionService';
import { parseApiError } from '../services/httpClient';

interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useSubscriptions(): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await subscriptionService.getAll();
      setSubscriptions(res.data);
    } catch (err) {
      setError(parseApiError(err));
      // fallback: keep existing data if any
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { subscriptions, loading, error, refetch: fetch };
}
