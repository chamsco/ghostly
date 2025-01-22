import { useState, useEffect } from 'react';
import { serversApi } from '@/services/api.service';
import { Server } from '@/types/server';

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setIsLoading(true);
        const data = await serversApi.list();
        setServers(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch servers'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServers();
  }, []);

  return { servers, isLoading, error };
} 