import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import type { Project, EnvironmentVariable } from '@/types/project';
import { AlertCircle } from 'lucide-react';

export function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [environmentVariables, setEnvironmentVariables] = useState<EnvironmentVariable[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        setError(null);
        const data = await projectsApi.get(id);
        setProject(data);
        setName(data.name);
        setEnvironmentVariables(data.environmentVariables || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    try {
      setIsLoading(true);
      // TODO: Implement update project API
      toast({
        title: "Success",
        description: "Project settings updated successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update project settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Error Loading Project</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Settings</h1>
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
              <Label>Project Type</Label>
              <p className="text-sm text-muted-foreground capitalize">{project.type}</p>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <p className="text-sm text-muted-foreground capitalize">{project.status}</p>
            </div>

            <div className="grid gap-2">
              <Label>Created At</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <div className="space-y-4">
            {environmentVariables.map((env) => (
              <div key={env.key} className="flex items-center justify-between p-2 bg-secondary rounded">
                <div>
                  <span className="font-mono">{env.key}=</span>
                  <span className="font-mono">{env.isSecret ? '********' : env.value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEnvironmentVariables(envs => envs.filter(e => e.key !== env.key))}
                >
                  Remove
                </Button>
              </div>
            ))}
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
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
} 