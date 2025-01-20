import { api } from '@/lib/axios';

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    speed: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercentage: number;
  } | null;
  network: {
    interfaceName: string;
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
  } | null;
  os: {
    platform: string;
    release: string;
    uptime: number;
  };
}

export interface HistoricalMetrics {
  timeRange: string;
  dataPoints: Array<{
    timestamp: number;
    cpu: number;
    memory: number;
    disk: number;
  }>;
}

export const metricsService = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await api.get<SystemMetrics>('/metrics/system');
    return response.data;
  },

  async getHistoricalMetrics(timeRange: string = '24h'): Promise<HistoricalMetrics> {
    const response = await api.get<HistoricalMetrics>(`/metrics/historical?timeRange=${timeRange}`);
    return response.data;
  }
}; 