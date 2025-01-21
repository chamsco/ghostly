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

import { api } from '@/lib/axios';

/**
 * System metrics data structure
 * Represents current system resource usage
 */
export interface SystemMetrics {
  cpu: {
    usage: number;        // CPU usage percentage
    cores: number;        // Number of CPU cores
    temperature: number;  // CPU temperature in Celsius
  };
  memory: {
    total: number;       // Total memory in bytes
    used: number;        // Used memory in bytes
    free: number;        // Free memory in bytes
    usagePercentage: number;  // Memory usage percentage
  };
  disk: {
    total: number;       // Total disk space in bytes
    used: number;        // Used disk space in bytes
    free: number;        // Free disk space in bytes
    usagePercentage: number;  // Disk usage percentage
  };
  network: {
    bytesReceived: number;    // Total bytes received
    bytesSent: number;        // Total bytes sent
    packetsReceived: number;  // Total packets received
    packetsSent: number;      // Total packets sent
  };
  timestamp: Date;      // Timestamp of the metrics reading
}

/**
 * Historical metrics data point structure
 */
export interface MetricsDataPoint {
  timestamp: Date;
  value: number;
  type: 'cpu' | 'memory' | 'disk' | 'network';
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
  const response = await api.get<SystemMetrics>('/metrics/system');
  return response.data;
}

/**
 * Fetches historical metrics data
 * @param timeRange - Time range to fetch metrics for
 * @returns Promise containing array of metrics data points
 * @throws Error if the historical metrics fetch fails
 */
export async function getHistoricalMetrics(timeRange: TimeRange): Promise<MetricsDataPoint[]> {
  const response = await api.get<MetricsDataPoint[]>(`/metrics/historical?timeRange=${timeRange}`);
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