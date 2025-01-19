import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Server, Database, Box, Cloud, RefreshCcw } from 'lucide-react';

interface Stats {
  activeServers: number;
  totalProjects: number;
  databases: number;
  deploymentsToday: number;
  serverLoad: number;
  trafficData: {
    time: string;
    value: number;
  }[];
}

export default function Dashboard() {
  const { data: stats, isLoading, refetch } = useQuery<Stats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // TODO: Replace with actual API call
      return {
        activeServers: 12,
        totalProjects: 24,
        databases: 8,
        deploymentsToday: 16,
        serverLoad: 68,
        trafficData: Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          value: 2400 + Math.random() * 1000
        }))
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin">
          <RefreshCcw className="w-6 h-6 text-purple-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Welcome back, Admin 👋</h1>
          <p className="text-muted-foreground">Infrastructure Overview</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="bg-background/60 border-purple-800/20 hover:bg-purple-500/10"
          onClick={() => refetch()}
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-background/60 border-purple-800/20 hover:bg-purple-500/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Active Servers</p>
                <h3 className="text-2xl font-bold">{stats?.activeServers}</h3>
                <p className="text-sm text-green-500 mt-1 flex items-center">
                  <span className="mr-1">↑</span> 1.8%
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Server className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 border-purple-800/20 hover:bg-purple-500/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Total Projects</p>
                <h3 className="text-2xl font-bold">{stats?.totalProjects}</h3>
                <div className="h-4" />
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Box className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 border-purple-800/20 hover:bg-purple-500/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Databases</p>
                <h3 className="text-2xl font-bold">{stats?.databases}</h3>
                <div className="h-4" />
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-background/60 border-purple-800/20 hover:bg-purple-500/5 transition-colors">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Deployments Today</p>
                <h3 className="text-2xl font-bold">{stats?.deploymentsToday}</h3>
                <p className="text-sm text-green-500 mt-1 flex items-center">
                  <span className="mr-1">↑</span> 12%
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Cloud className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Load */}
      <Card className="bg-background/60 border-purple-800/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Server Load</h3>
            <div className="flex items-center space-x-2">
              <Select defaultValue="5min">
                <SelectTrigger className="w-[100px] h-8 bg-background/60 border-purple-800/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1min">1 minute</SelectItem>
                  <SelectItem value="5min">5 minutes</SelectItem>
                  <SelectItem value="15min">15 minutes</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{stats?.serverLoad}%</span>
            </div>
          </div>
          <Progress 
            value={stats?.serverLoad} 
            className="h-2 bg-purple-500/20" 
          />
        </CardContent>
      </Card>

      {/* Traffic Graph */}
      <Card className="bg-background/60 border-purple-800/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-medium">System Traffic Overview</h3>
              <div className="flex items-center mt-1">
                <div className="w-3 h-3 rounded-full bg-purple-500/80 mr-2" />
                <span className="text-sm text-muted-foreground">Real-time Traffic</span>
              </div>
            </div>
            <Tabs defaultValue="24h" className="w-fit">
              <TabsList className="bg-background/60 border-purple-800/20">
                <TabsTrigger value="1h">1h</TabsTrigger>
                <TabsTrigger value="24h">24h</TabsTrigger>
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.trafficData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#666"
                  tick={{ fill: '#666' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#666"
                  tick={{ fill: '#666' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a1a', 
                    border: '1px solid #333',
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorValue)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#8b5cf6' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 