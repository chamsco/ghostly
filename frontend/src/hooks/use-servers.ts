import { useState, useEffect } from 'react';
import { serversApi } from '@/services/api.service';
import { Server } from '@/types/server';
import { CreateServerDto } from '@/types/server';

export function useServers() {
  const [servers, setServers] = useState<Server[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchServers = async () => {
    try {
      setIsLoading(true);
      const data = await serversApi.list();
      setServers(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch servers'));
    } finally {
      setIsLoading(false);
    }
  };

  const createServer = async (serverData: CreateServerDto) => {
    try {
      setIsLoading(true);
      const newServer = await serversApi.create(serverData);
      setServers(prev => [...prev, newServer]);
      setError(null);
      return newServer;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create server');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateServer = async (id: string, serverData: Partial<Server>) => {
    try {
      setIsLoading(true);
      const updatedServer = await serversApi.update(id, serverData);
      setServers(prev => prev.map(server => 
        server.id === id ? updatedServer : server
      ));
      setError(null);
      return updatedServer;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update server');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteServer = async (id: string) => {
    try {
      setIsLoading(true);
      await serversApi.delete(id);
      setServers(prev => prev.filter(server => server.id !== id));
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete server');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnection = async (id: string) => {
    try {
      const { status } = await serversApi.checkConnection(id);
      return status;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to check server connection');
      throw error;
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  return {
    servers,
    isLoading,
    error,
    createServer,
    updateServer,
    deleteServer,
    checkConnection,
    refetch: fetchServers
  };
} 