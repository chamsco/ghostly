/**
 * Metrics Service
 * 
 * Provides functionality for fetching and managing system metrics including:
 * - System resource usage (CPU, Memory, Disk)
 * - Historical performance data
 * - Real-time monitoring statistics
 * 
 * The service uses the backend API to retrieve metrics and formats them
 * for display in the dashboard and monitoring components.
 */

import { apiInstance } from '@/lib/axios';

/**
 * System metrics data structure
 * Represents current system resource usage
 */
export interface SystemMetrics {
  cpu: {
    usage: number;        // CPU usage percentage
    cores: number;        // Number of CPU cores
    temperature: number;  // CPU temperature in Celsius
    speed: number;         // CPU speed in GHz
  };
  memory: {
    total: number;       // Total memory in bytes
    used: number;        // Used memory in bytes
    free: number;        // Free memory in bytes
    usagePercentage: number;
  };
  disk: {
    total: number;       // Total disk space in bytes
    used: number;        // Used disk space in bytes
    free: number;        // Free disk space in bytes
    usagePercentage: number;
  };
  network: {
    upload: number;      // Total upload bytes
    download: number;    // Total download bytes
  };
  timestamp: Date;      // Timestamp of the metrics reading
}

/**
 * Historical metrics data point structure
 */
export interface MetricsDataPoint {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
}

/**
 * Time range options for historical metrics
 */
export type TimeRange = '1h' | '24h' | '7d' | '30d';

/**
 * Fetches current system metrics
 * @returns Promise containing the current system metrics
 * @throws Error if the metrics fetch fails
 */
export async function getSystemMetrics(): Promise<SystemMetrics> {
  const response = await apiInstance.get<SystemMetrics>('/metrics/system');
  return {
    ...response.data,
    memory: {
      ...response.data.memory,
      usagePercentage: (response.data.memory.used / response.data.memory.total) * 100
    },
    disk: {
      ...response.data.disk,
      usagePercentage: (response.data.disk.used / response.data.disk.total) * 100
    }
  };
}

/**
 * Fetches historical metrics data
 * @param timeRange - Time range to fetch metrics for
 * @returns Promise containing array of metrics data points
 * @throws Error if the historical metrics fetch fails
 */
export async function getHistoricalMetrics(timeRange: TimeRange = '24h'): Promise<MetricsDataPoint[]> {
  const response = await apiInstance.get<MetricsDataPoint[]>(`/metrics/historical?timeRange=${timeRange}`);
  return response.data;
}

/**
 * Formats bytes into human-readable string
 * @param bytes - Number of bytes to format
 * @param decimals - Number of decimal places to show
 * @returns Formatted string (e.g., "1.5 GB")
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Formats a percentage value
 * @param value - Percentage value to format
 * @returns Formatted string with % symbol
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export const metricsService = {
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await apiInstance.get<SystemMetrics>('/metrics/system');
    return {
      ...response.data,
      memory: {
        ...response.data.memory,
        usagePercentage: (response.data.memory.used / response.data.memory.total) * 100
      },
      disk: {
        ...response.data.disk,
        usagePercentage: (response.data.disk.used / response.data.disk.total) * 100
      }
    };
  },

  async getHistoricalMetrics(timeRange: TimeRange = '24h'): Promise<MetricsDataPoint[]> {
    const response = await apiInstance.get<MetricsDataPoint[]>(`/metrics/historical?timeRange=${timeRange}`);
    return response.data;
  }
}; 