import { useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Activity, Server, Cpu, HelpCircle } from 'lucide-react';
import { api } from '@/lib/axios';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { metricsService, SystemMetrics } from '@/services/metrics';
import { formatBytes } from '@/lib/utils';

interface Stats {
  totalProjects: number;
  activeDeployments: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

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

function SystemTrafficChart({ data }: { data: any[] }) {
  return (
    <Card className="p-6 card-gradient">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">System Traffic Overview</h3>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>24-hour system resource utilization</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCPU" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
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
                dataKey="cpu"
                name="CPU"
                stroke="#8884d8"
                fillOpacity={1}
                fill="url(#colorCPU)"
              />
              <Area
                type="monotone"
                dataKey="memory"
                name="Memory"
                stroke="#82ca9d"
                fillOpacity={1}
                fill="url(#colorMemory)"
              />
              <Area
                type="monotone"
                dataKey="disk"
                name="Storage"
                stroke="#ffc658"
                fillOpacity={1}
                fill="url(#colorDisk)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

// Add debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Debounced fetch function
  const debouncedFetch = useCallback(
    debounce(async () => {
      try {
        const [statsResponse, currentMetrics, historical] = await Promise.all([
          api.get('/dashboard/stats'),
          metricsService.getSystemMetrics(),
          metricsService.getHistoricalMetrics()
        ]);
        
        setStats(statsResponse.data);
        setMetrics(currentMetrics);
        setHistoricalData(historical.dataPoints);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    debouncedFetch();
    // Set up polling every minute instead of every 30 seconds
    const interval = setInterval(debouncedFetch, 60000);
    return () => {
      clearInterval(interval);
    };
  }, [debouncedFetch]);

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
          <SystemTrafficChart data={historicalData} />
          
          <Card className="p-6 card-gradient">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Resource Allocation</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">CPU Usage</span>
                    <span className="font-medium">{metrics?.cpu.usage.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${metrics?.cpu.usage ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics?.cpu.cores} Cores @ {metrics?.cpu.speed}MHz
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Memory Usage</span>
                    <span className="font-medium">{metrics?.memory.usagePercentage.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${metrics?.memory.usagePercentage ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(metrics?.memory.used || 0)} / {formatBytes(metrics?.memory.total || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Storage Usage</span>
                    <span className="font-medium">{metrics?.disk?.usagePercentage.toFixed(1) ?? 0}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${metrics?.disk?.usagePercentage ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(metrics?.disk?.used || 0)} / {formatBytes(metrics?.disk?.total || 0)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
} 