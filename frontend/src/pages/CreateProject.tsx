import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import {
  ProjectType,
  DatabaseType,
  ServiceType,
  CreateProjectDto,
  EnvironmentVariable
} from '@/types/project';

interface Server {
  id: string;
  name: string;
  supportedTypes: ProjectType[];
}

export function CreateProject() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        const data = await projectsApi.listServers();
        setServers(data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load deployment targets",
          variant: "destructive"
        });
      }
    };
    fetchServers();
  }, [toast]);

  // Basic Info
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType | ''>('');
  const [serverId, setServerId] = useState('');

  // Database Config
  const [databaseType, setDatabaseType] = useState<DatabaseType | ''>('');
  const [databaseName, setDatabaseName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Service Config
  const [serviceType, setServiceType] = useState<ServiceType | ''>('');
  const [repositoryUrl, setRepositoryUrl] = useState('');

  // Website Config
  const [branch, setBranch] = useState('main');

  // Environment Variables
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  const [newEnvSecret, setNewEnvSecret] = useState(false);

  const handleAddEnvVar = () => {
    if (!newEnvKey || !newEnvValue) return;
    setEnvVars([
      ...envVars,
      { key: newEnvKey, value: newEnvValue, isSecret: newEnvSecret }
    ]);
    setNewEnvKey('');
    setNewEnvValue('');
    setNewEnvSecret(false);
  };

  const handleRemoveEnvVar = (key: string) => {
    setEnvVars(envVars.filter(env => env.key !== key));
  };

  const handleEnvFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const vars = content.split('\n')
        .filter(line => line && !line.startsWith('#'))
        .map(line => {
          const [key, value] = line.split('=').map(part => part.trim());
          return { key, value, isSecret: false };
        });
      setEnvVars([...envVars, ...vars]);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type || !serverId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const projectData: CreateProjectDto = {
        name,
        type: type as ProjectType,
        serverId,
        environmentVariables: envVars
      };

      // Add type-specific fields
      if (type === ProjectType.DATABASE) {
        if (!databaseType || !databaseName || !adminEmail) {
          throw new Error('Please fill in all database fields');
        }
        Object.assign(projectData, {
          databaseType,
          databaseName,
          adminEmail
        });
      } else if (type === ProjectType.SERVICE) {
        if (!serviceType || !repositoryUrl) {
          throw new Error('Please fill in all service fields');
        }
        Object.assign(projectData, {
          serviceType,
          repositoryUrl
        });
      } else if (type === ProjectType.WEBSITE) {
        if (!repositoryUrl) {
          throw new Error('Please fill in the repository URL');
        }
        Object.assign(projectData, {
          repositoryUrl,
          branch
        });
      }

      await projectsApi.create(projectData);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      navigate('/projects');
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Project Type</Label>
              <Select 
                value={type} 
                onValueChange={(value: ProjectType | '') => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectType.DATABASE}>Database</SelectItem>
                  <SelectItem value={ProjectType.SERVICE}>Service</SelectItem>
                  <SelectItem value={ProjectType.WEBSITE}>Website</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="server">Deployment Target</Label>
              <Select value={serverId} onValueChange={setServerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  {servers
                    .filter(server => !type || server.supportedTypes.includes(type as ProjectType))
                    .map(server => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {type === ProjectType.DATABASE && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Database Configuration</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="databaseType">Database Type</Label>
                <Select 
                  value={databaseType} 
                  onValueChange={(value: DatabaseType | '') => setDatabaseType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select database type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DatabaseType.POSTGRESQL}>PostgreSQL</SelectItem>
                    <SelectItem value={DatabaseType.MYSQL}>MySQL</SelectItem>
                    <SelectItem value={DatabaseType.MONGODB}>MongoDB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="databaseName">Database Name</Label>
                <Input
                  id="databaseName"
                  value={databaseName}
                  onChange={(e) => setDatabaseName(e.target.value)}
                  placeholder="my_database"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>
          </Card>
        )}

        {type === ProjectType.SERVICE && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Service Configuration</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Select 
                  value={serviceType} 
                  onValueChange={(value: ServiceType | '') => setServiceType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ServiceType.NODEJS}>Node.js</SelectItem>
                    <SelectItem value={ServiceType.PYTHON}>Python</SelectItem>
                    <SelectItem value={ServiceType.PHP}>PHP</SelectItem>
                    <SelectItem value={ServiceType.DOCKER}>Custom Docker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="repositoryUrl">Repository URL</Label>
                <Input
                  id="repositoryUrl"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
          </Card>
        )}

        {type === ProjectType.WEBSITE && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Website Configuration</h2>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="repositoryUrl">Repository URL</Label>
                <Input
                  id="repositoryUrl"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="branch">Branch</Label>
                <Input
                  id="branch"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                />
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="envKey">Key</Label>
                <Input
                  id="envKey"
                  value={newEnvKey}
                  onChange={(e) => setNewEnvKey(e.target.value)}
                  placeholder="DATABASE_URL"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="envValue">Value</Label>
                <Input
                  id="envValue"
                  value={newEnvValue}
                  onChange={(e) => setNewEnvValue(e.target.value)}
                  placeholder="postgres://localhost:5432/db"
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="secret"
                    checked={newEnvSecret}
                    onCheckedChange={setNewEnvSecret}
                  />
                  <Label htmlFor="secret">Secret</Label>
                </div>
                <Button
                  type="button"
                  onClick={handleAddEnvVar}
                  disabled={!newEnvKey || !newEnvValue}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {envVars.map((env) => (
                <div key={env.key} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <div>
                    <span className="font-mono">{env.key}=</span>
                    <span className="font-mono">{env.isSecret ? '********' : env.value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEnvVar(env.key)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept=".env"
                onChange={handleEnvFileUpload}
              />
              <Button type="button" variant="outline">
                Import .env
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/projects')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  );
} 