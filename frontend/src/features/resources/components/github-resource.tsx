import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { ServiceType, ProjectStatus } from '@/types/project';
import { z } from 'zod';

// Validation schema for location state
const locationStateSchema = z.object({
  serverId: z.string().optional(),
  returnPath: z.string().optional(),
});

// Validation schema for form data
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  repositoryUrl: z.string()
    .url('Must be a valid URL')
    .refine((url) => url.includes('github.com'), { message: 'Must be a GitHub repository' }),
});

// Validation schema for API response
const resourceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(ServiceType),
  serverId: z.string(),
  status: z.nativeEnum(ProjectStatus),
  error: z.string().optional(),
  url: z.string().optional(),
  environmentId: z.string(),
  projectId: z.string(),
  environmentVariables: z.array(z.object({
    id: z.string(),
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean(),
    created_at: z.string(),
    updated_at: z.string()
  })).optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export function GithubResource() {
  const { projectId = '', environmentId = '' } = useParams<{ projectId: string; environmentId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [name, setName] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  // Parse and validate location state
  const locationState = locationStateSchema.safeParse(location.state);
  const serverId = locationState.success ? locationState.data.serverId ?? '' : '';
  const returnPath = locationState.success && locationState.data.returnPath 
    ? locationState.data.returnPath 
    : `/projects/${projectId}`;

  const validateForm = () => {
    try {
      formSchema.parse({ name, repositoryUrl });
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = Object.fromEntries(
          error.errors.map((err) => [err.path[0], err.message])
        );
        setValidationErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !environmentId) {
      console.error('Missing required parameters', { projectId, environmentId });
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing required project information'
      });
      return;
    }

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      console.log('Creating GitHub resource', { 
        name, 
        repositoryUrl,
        projectId,
        environmentId,
        serverId 
      });

      const response = await projectsApi.createResource(projectId, {
        name,
        type: ServiceType.NODEJS, // We'll detect the actual type from package.json later
        serverId,
        environmentId,
        repositoryUrl,
        environmentVariables: []
      });

      const validatedResource = resourceResponseSchema.parse(response);
      console.log('Validated resource:', validatedResource);

      // Add timeout to prevent rapid state updates
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Success',
        description: 'Resource created successfully'
      });

      navigate(returnPath, {
        replace: true,
        state: { resource: validatedResource }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Validation error'
        });
      } else {
        console.error('API error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create resource'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">GitHub Repository</h1>
        <p className="text-muted-foreground">
          Deploy an application from a GitHub repository using GitHub App
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
                aria-invalid={!!validationErrors.name}
                aria-errormessage={validationErrors.name}
              />
              {validationErrors.name && (
                <p className="text-sm text-destructive">{validationErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="repository">Repository URL</Label>
              <Input
                id="repository"
                placeholder="https://github.com/username/repository"
                value={repositoryUrl}
                onChange={(e) => setRepositoryUrl(e.target.value)}
                required
                aria-invalid={!!validationErrors.repositoryUrl}
                aria-errormessage={validationErrors.repositoryUrl}
              />
              {validationErrors.repositoryUrl && (
                <p className="text-sm text-destructive">{validationErrors.repositoryUrl}</p>
              )}
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
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    Creating...
                  </>
                ) : (
                  'Create Resource'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 