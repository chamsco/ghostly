import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { ServiceType } from '@/types/project';

export function PublicGitResource() {
  const { projectId, environmentId } = useParams<{ projectId: string; environmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !environmentId) return;

    try {
      setIsLoading(true);
      console.log('Creating public Git resource', { repositoryUrl, name });

      const resource = await projectsApi.createResource(projectId, {
        name,
        type: ServiceType.NODEJS, // You might want to detect this from the repository
        environmentId,
        serverId: location.state?.serverId,
        repositoryUrl,
        environmentVariables: []
      });

      toast({
        title: 'Success',
        description: 'Resource created successfully'
      });

      // Navigate back with the created resource
      navigate(location.state?.returnPath || `/projects/${projectId}`, {
        replace: true,
        state: { resource }
      });
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create resource'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Public Git Repository</h1>
        <p className="text-muted-foreground">
          Deploy an application from a public Git repository
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repository Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Resource Name</Label>
              <Input
                id="name"
                placeholder="my-awesome-app"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repository">Repository URL</Label>
              <Input
                id="repository"
                placeholder="https://github.com/username/repository"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Resource'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 