import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Globe,
  Database,
  Clock,
} from 'lucide-react';

interface SystemStats {
  projectCount: number;
  activeServices: number;
  domains: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
}

export function Dashboard() {
  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ['system-stats'],
    queryFn: () => api.get('/stats').then((res) => res.data),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">
          System overview and statistics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Server className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.projectCount}</div>
            <p className="text-xs text-gray-500">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Services</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeServices}</div>
            <p className="text-xs text-gray-500">Running services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Domains</CardTitle>
            <Globe className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.domains}</div>
            <p className="text-xs text-gray-500">Active domains</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(stats?.uptime / 86400)}d
            </div>
            <p className="text-xs text-gray-500">System uptime</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>CPU Usage</CardTitle>
            <CardDescription>System processor utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats?.cpuUsage} className="h-2" />
            <p className="mt-2 text-sm text-gray-500">
              {stats?.cpuUsage.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>System memory utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats?.memoryUsage} className="h-2" />
            <p className="mt-2 text-sm text-gray-500">
              {stats?.memoryUsage.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disk Usage</CardTitle>
            <CardDescription>Storage utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={stats?.diskUsage} className="h-2" />
            <p className="mt-2 text-sm text-gray-500">
              {stats?.diskUsage.toFixed(1)}% used
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 