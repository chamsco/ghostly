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

interface Stats {
  totalProjects: number;
  activeDeployments: number;
  uptime: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

export function Dashboard() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<Stats>('/stats');
      return response.data;
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
            <CardDescription>Active and archived projects</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Deployments</CardTitle>
            <CardDescription>Currently running services</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.activeDeployments || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Uptime</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.uptime || 0}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>Current system resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU</span>
                <span>{stats?.resourceUsage.cpu || 0}%</span>
              </div>
              <Progress value={stats?.resourceUsage.cpu || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory</span>
                <span>{stats?.resourceUsage.memory || 0}%</span>
              </div>
              <Progress value={stats?.resourceUsage.memory || 0} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage</span>
                <span>{stats?.resourceUsage.storage || 0}%</span>
              </div>
              <Progress value={stats?.resourceUsage.storage || 0} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 