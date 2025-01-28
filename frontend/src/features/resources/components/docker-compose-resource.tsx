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

export function DockerComposeResource() {
  const { projectId, environmentId } = useParams<{ projectId: string; environmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [composeFile, setComposeFile] = useState(`version: '3'
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=myuser
      - POSTGRES_PASSWORD=mypassword
      - POSTGRES_DB=mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !environmentId) return;

    try {
      setIsLoading(true);
      console.log('Creating Docker Compose resource', { name, composeFile });

      const resource = await projectsApi.createResource(projectId, {
        name,
        type: ServiceType.CUSTOM_DOCKER,
        serverId: location.state?.serverId,
        environmentId,
        dockerComposeContent: composeFile,
        environmentVariables: []
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
        <h1 className="text-3xl font-bold">Docker Compose</h1>
        <p className="text-muted-foreground">
          Deploy a multi-container application using Docker Compose
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Docker Compose Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Resource Name</Label>
              <Input
                id="name"
                placeholder="my-compose-app"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composeFile">docker-compose.yml Content</Label>
              <Textarea
                id="composeFile"
                value={composeFile}
                onChange={(e) => setComposeFile(e.target.value)}
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