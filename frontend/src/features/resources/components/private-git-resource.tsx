import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { ServiceType } from '@/types/project';

export function PrivateGitResource() {
  const { projectId, environmentId } = useParams<{ projectId: string; environmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [name, setName] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !environmentId) return;

    try {
      setIsLoading(true);
      console.log('Creating private git resource', { repositoryUrl, name });

      const resource = await projectsApi.createResource(projectId, {
        name,
        type: ServiceType.NODEJS,
        serverId: location.state?.serverId,
        environmentId,
        repositoryUrl,
        environmentVariables: [
          {
            key: 'SSH_PRIVATE_KEY',
            value: privateKey,
            isSecret: true
          }
        ]
      });

      toast({
        title: 'Success',
        description: 'Resource created successfully'
      });

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
        <h1 className="text-3xl font-bold">Private Git Repository</h1>
        <p className="text-muted-foreground">
          Deploy an application from a private Git repository using SSH key
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
                placeholder="git@github.com:username/repository.git"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="privateKey">SSH Private Key</Label>
              <Textarea
                id="privateKey"
                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                required
                className="font-mono"
                rows={10}
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