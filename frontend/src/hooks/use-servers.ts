import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Server, CreateServerDto } from '@/types/server';
import { serversApi } from '../services/servers-api';

export function useServers() {
  const queryClient = useQueryClient();

  const { data: servers = [], isLoading, error, refetch } = useQuery<Server[]>({
    queryKey: ['servers'],
    queryFn: () => serversApi.getServers(),
  });

  const createServerMutation = useMutation({
    mutationFn: (data: CreateServerDto) => serversApi.createServer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  const deleteServerMutation = useMutation({
    mutationFn: (serverId: string) => serversApi.deleteServer(serverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers'] });
    },
  });

  return {
    servers,
    isLoading,
    error,
    refetch,
    createServer: createServerMutation.mutateAsync,
    deleteServer: deleteServerMutation.mutateAsync,
  };
} 