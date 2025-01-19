import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Activity, Users, Server, Cpu, HardDrive } from 'lucide-react';
import { api } from '@/lib/axios';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface Stats {
  totalProjects: number;
  activeDeployments: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

// Mock data for the chart - replace with real data in production
const trafficData = [
  { time: "00:00", value: 2400 },
  { time: "03:00", value: 2800 },
  { time: "06:00", value: 3200 },
  { time: "09:00", value: 2800 },
  { time: "12:00", value: 2400 },
  { time: "15:00", value: 2800 },
  { time: "18:00", value: 3600 },
  { time: "21:00", value: 3200 },
  { time: "24:00", value: 3000 },
];

function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  description 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode; 
  trend?: { value: number; isPositive: boolean; }; 
  description?: string; 
}) {
  return (
    <Card className="p-6 card-gradient hover:shadow-lg transition-all duration-200 animate-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            {description && (
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>{description}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trend && (
              <span className={`text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </Card>
  );
}

function SystemTrafficChart() {
  return (
    <Card className="p-6 card-gradient">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">System Traffic Overview</h3>
          <span className="text-xs text-muted-foreground">Real-time Traffic</span>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProjects: 0,
    activeDeployments: 0,
    resourceUsage: {
      cpu: 0,
      memory: 0,
      storage: 0
    }
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/dashboard/stats');
        setStats(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setError('Failed to load dashboard statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Set up polling every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName}
          </h2>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive px-4 py-2 rounded-md">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Projects"
            value={stats.totalProjects}
            icon={<Activity className="h-4 w-4" />}
            description="Total number of projects in your account"
            trend={{ value: 12, isPositive: true }}
          />

          <MetricCard
            title="Active Deployments"
            value={stats.activeDeployments}
            icon={<Server className="h-4 w-4" />}
            description="Currently running deployments"
            trend={{ value: 5, isPositive: true }}
          />

          <MetricCard
            title="Resource Usage"
            value={`${stats.resourceUsage?.cpu ?? 0}%`}
            icon={<Cpu className="h-4 w-4" />}
            description="Current CPU utilization across all projects"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SystemTrafficChart />
          
          <Card className="p-6 card-gradient">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resource Allocation</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span className="font-medium">{stats.resourceUsage?.cpu ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${stats.resourceUsage?.cpu ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-medium">{stats.resourceUsage?.memory ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${stats.resourceUsage?.memory ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Storage Usage</span>
                    <span className="font-medium">{stats.resourceUsage?.storage ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${stats.resourceUsage?.storage ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
} 