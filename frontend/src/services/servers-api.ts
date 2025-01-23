import { apiInstance } from '@/lib/axios';
import { Server, CreateServerDto } from '@/types/server';

export const serversApi = {
  getServers: async (): Promise<Server[]> => {
    const response = await apiInstance.get('/servers');
    return response.data;
  },

  createServer: async (data: CreateServerDto): Promise<Server> => {
    const response = await apiInstance.post('/servers', data);
    return response.data;
  },

  deleteServer: async (serverId: string): Promise<void> => {
    await apiInstance.delete(`/servers/${serverId}`);
  },
}; 