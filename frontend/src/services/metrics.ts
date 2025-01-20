import { api } from '@/lib/axios';

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  storage: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  network: {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  };
}

export const metricsService = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await api.get<SystemMetrics>('/metrics/system');
    return response.data;
  },

  async getHistoricalMetrics(timeRange: string = '24h'): Promise<{
    timestamps: string[];
    cpu: number[];
    memory: number[];
    network: number[];
  }> {
    const response = await api.get(`/metrics/historical?timeRange=${timeRange}`);
    return response.data;
  }
}; 