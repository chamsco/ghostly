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

export function DockerfileResource() {
  const { projectId, environmentId } = useParams<{ projectId: string; environmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [dockerfile, setDockerfile] = useState(`FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !environmentId) return;

    try {
      setIsLoading(true);
      console.log('Creating Dockerfile resource', { name, dockerfile });

      const resource = await projectsApi.createResource(projectId, {
        name,
        type: ServiceType.CUSTOM_DOCKER,
        serverId: location.state?.serverId,
        environmentId,
        environmentVariables: [
          {
            key: 'DOCKERFILE_CONTENT',
            value: dockerfile,
            isSecret: false
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
        <h1 className="text-3xl font-bold">Dockerfile</h1>
        <p className="text-muted-foreground">
          Deploy an application using a custom Dockerfile
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dockerfile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Resource Name</Label>
              <Input
                id="name"
                placeholder="my-docker-app"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dockerfile">Dockerfile Content</Label>
              <Textarea
                id="dockerfile"
                value={dockerfile}
                onChange={(e) => setDockerfile(e.target.value)}
                required
                className="font-mono min-h-[300px]"
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