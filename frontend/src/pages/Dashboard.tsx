import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth.context';
import { Activity, Server, Cpu, HelpCircle, AlertCircle } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis } from "recharts";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { metricsService, SystemMetrics } from '@/services/metrics';
import { formatBytes } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiInstance } from '@/lib/axios';

interface Stats {
  totalProjects: number;
  activeDeployments: number;
  resourceUsage: {
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface EndpointState<T = any> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  retryCount: number;
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

function ErrorAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

function LoadingCard() {
  return (
    <Card className="p-6 card-gradient animate-pulse">
      <div className="h-20 bg-muted/20 rounded"></div>
    </Card>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<EndpointState<Stats>>({
    data: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });
  const [systemMetrics, setSystemMetrics] = useState<EndpointState<SystemMetrics>>({
    data: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });
  const [historicalMetrics, setHistoricalMetrics] = useState<EndpointState>({
    data: null,
    isLoading: true,
    error: null,
    retryCount: 0
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setDashboardStats(prev => ({ ...prev, isLoading: true }));
        const response = await apiInstance.get('/dashboard/stats');
        setDashboardStats({
          data: response.data,
          isLoading: false,
          error: null,
          retryCount: 0
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        setDashboardStats(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load dashboard statistics',
          retryCount: prev.retryCount + 1
        }));
      }
    };

    const fetchMetrics = async () => {
      try {
        setSystemMetrics(prev => ({ ...prev, isLoading: true }));
        const data = await metricsService.getSystemMetrics();
        setSystemMetrics({
          data,
          isLoading: false,
          error: null,
          retryCount: 0
        });
      } catch (error) {
        console.error('Failed to fetch system metrics:', error);
        setSystemMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load system metrics',
          retryCount: prev.retryCount + 1
        }));
      }
    };

    const fetchHistoricalMetrics = async () => {
      try {
        setHistoricalMetrics(prev => ({ ...prev, isLoading: true }));
        const data = await metricsService.getHistoricalMetrics('24h');
        setHistoricalMetrics({
          data,
          isLoading: false,
          error: null,
          retryCount: 0
        });
      } catch (error) {
        console.error('Failed to fetch historical metrics:', error);
        setHistoricalMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load historical metrics',
          retryCount: prev.retryCount + 1
        }));
      }
    };

    // Initial fetch
    fetchDashboardStats();
    fetchMetrics();
    fetchHistoricalMetrics();

    // Set up polling intervals
    const statsInterval = setInterval(fetchDashboardStats, 60000); // Every minute
    const metricsInterval = setInterval(fetchMetrics, 30000);     // Every 30 seconds
    const historicalInterval = setInterval(fetchHistoricalMetrics, 30000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(metricsInterval);
      clearInterval(historicalInterval);
    };
  }, []);

  const stats: Stats = dashboardStats.data || {
    totalProjects: 0,
    activeDeployments: 0,
    resourceUsage: { cpu: 0, memory: 0, storage: 0 }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName}
          </h2>
        </div>

        {/* Dashboard Stats Section */}
        {dashboardStats.error && (
          <ErrorAlert 
            message="Failed to load dashboard statistics" 
            onRetry={() => {
              // Implement retry logic
            }} 
          />
        )}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardStats.isLoading ? (
            <>
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </>
          ) : (
            <>
              <MetricCard
                title="Total Projects"
                value={stats.totalProjects}
                icon={<Activity className="h-4 w-4" />}
                description="Total number of projects in your account"
              />
              <MetricCard
                title="Active Deployments"
                value={stats.activeDeployments}
                icon={<Server className="h-4 w-4" />}
                description="Currently running deployments"
              />
              <MetricCard
                title="Resource Usage"
                value={`${stats.resourceUsage?.cpu ?? 0}%`}
                icon={<Cpu className="h-4 w-4" />}
                description="Current CPU utilization across all projects"
              />
            </>
          )}
        </div>

        {/* Metrics Section */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Historical Metrics Chart */}
          {historicalMetrics.error ? (
            <ErrorAlert 
              message="Failed to load historical metrics" 
              onRetry={() => {
                // Implement retry logic
              }}
            />
          ) : historicalMetrics.isLoading ? (
            <Card className="p-6 card-gradient animate-pulse">
              <div className="h-[300px] bg-muted/20 rounded"></div>
            </Card>
          ) : (
            <SystemTrafficChart data={historicalMetrics.data?.dataPoints || []} />
          )}

          {/* Current Metrics */}
          {systemMetrics.error ? (
            <ErrorAlert 
              message="Failed to load system metrics" 
              onRetry={() => {
                // Implement retry logic
              }}
            />
          ) : systemMetrics.isLoading ? (
            <Card className="p-6 card-gradient animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-muted/20 rounded w-1/3"></div>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-muted/20 rounded w-full"></div>
                      <div className="h-2 bg-muted/20 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 card-gradient">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Resource Allocation</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium">
                        {systemMetrics.data?.cpu.usage.toFixed(1) ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${systemMetrics.data?.cpu.usage ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {systemMetrics.data?.cpu.cores} Cores @ {systemMetrics.data?.cpu.speed}MHz
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Memory Usage</span>
                      <span className="font-medium">
                        {systemMetrics.data?.memory.usagePercentage.toFixed(1) ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${systemMetrics.data?.memory.usagePercentage ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(systemMetrics.data?.memory.used || 0)} / {formatBytes(systemMetrics.data?.memory.total || 0)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Storage Usage</span>
                      <span className="font-medium">
                        {systemMetrics.data?.disk?.usagePercentage.toFixed(1) ?? 0}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${systemMetrics.data?.disk?.usagePercentage ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatBytes(systemMetrics.data?.disk?.used || 0)} / {formatBytes(systemMetrics.data?.disk?.total || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
} 