import { api } from '@/services/api';
import { Server, CreateServerDto } from '@/types/server';

export const serversApi = {
  getServers: async (): Promise<Server[]> => {
    const response = await api.get('/servers');
    return response.data;
  },

  createServer: async (data: CreateServerDto): Promise<Server> => {
    const response = await api.post('/servers', data);
    return response.data;
  },

  deleteServer: async (serverId: string): Promise<void> => {
    await api.delete(`/servers/${serverId}`);
  },
}; 