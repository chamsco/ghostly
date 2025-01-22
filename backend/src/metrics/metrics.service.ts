import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as si from 'systeminformation';

@Injectable()
export class MetricsService {
  private metricHistory: Array<{
    timestamp: number;
    cpu: number;
    memory: number;
    disk: number;
  }> = [];

  constructor() {
    // Initialize metrics collection
    this.collectMetrics();
    // Collect metrics every 2 minutes
    setInterval(() => this.collectMetrics(), 120000);
  }

  private async collectMetrics() {
    const [cpu, memory, disk] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize()
    ]);

    const metrics = {
      timestamp: Date.now(),
      cpu: cpu.currentLoad,
      memory: (memory.used / memory.total) * 100,
      disk: disk[0] ? (disk[0].used / disk[0].size) * 100 : 0
    };

    this.metricHistory.push(metrics);

    // Keep last 24 hours of metrics (2880 data points at 30-second intervals)
    if (this.metricHistory.length > 2880) {
      this.metricHistory.shift();
    }
  }

  async getSystemMetrics() {
    const [cpu, memory, disk, network] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats()
    ]);

    return {
      cpu: {
        usage: cpu.currentLoad,
        cores: os.cpus().length,
        model: os.cpus()[0].model,
        speed: os.cpus()[0].speed
      },
      memory: {
        total: memory.total,
        used: memory.used,
        free: memory.free,
        usagePercentage: (memory.used / memory.total) * 100
      },
      disk: disk[0] ? {
        total: disk[0].size,
        used: disk[0].used,
        free: disk[0].size - disk[0].used,
        usagePercentage: (disk[0].used / disk[0].size) * 100
      } : null,
      network: network[0] ? {
        interfaceName: network[0].iface,
        bytesReceived: network[0].rx_bytes,
        bytesSent: network[0].tx_bytes,
        packetsReceived: network[0].rx_sec,
        packetsSent: network[0].tx_sec
      } : null,
      os: {
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime()
      }
    };
  }

  getHistoricalMetrics(timeRange: string) {
    const now = Date.now();
    let timeWindow: number;

    switch (timeRange) {
      case '1h':
        timeWindow = 60 * 60 * 1000; // 1 hour in milliseconds
        break;
      case '6h':
        timeWindow = 6 * 60 * 60 * 1000;
        break;
      case '12h':
        timeWindow = 12 * 60 * 60 * 1000;
        break;
      case '24h':
      default:
        timeWindow = 24 * 60 * 60 * 1000;
    }

    const filteredMetrics = this.metricHistory.filter(
      metric => (now - metric.timestamp) <= timeWindow
    );

    return {
      timeRange,
      dataPoints: filteredMetrics.map(metric => ({
        timestamp: metric.timestamp,
        cpu: metric.cpu,
        memory: metric.memory,
        disk: metric.disk
      }))
    };
  }
} 