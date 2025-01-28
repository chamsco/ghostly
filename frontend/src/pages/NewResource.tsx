import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation, useSearchParams, Outlet } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
//import { CardHeader } from '@/components/ui/card';
import { GitBranch, Box, Database, Container, Loader2 } from 'lucide-react';
import { Resource, ServiceType, ProjectStatus } from '@/types/project';
//import { EnvironmentVariable } from '@/types/environment';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
//import { Button } from '@/components/ui/button';

// Validation schemas
const environmentVariableSchema = z.object({
  id: z.string(),
  key: z.string(),
  value: z.string(),
  isSecret: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

const resourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.nativeEnum(ServiceType),
  serverId: z.string(),
  status: z.nativeEnum(ProjectStatus),
  error: z.string().optional(),
  url: z.string().optional(),
  environmentId: z.string(),
  projectId: z.string(),
  environmentVariables: z.array(environmentVariableSchema).optional(),
  created_at: z.string(),
  updated_at: z.string()
});

const locationStateSchema = z.object({
  from: z.string(),
  serverId: z.string().optional(),
  returnPath: z.string(),
  resource: resourceSchema.optional(),
});

type LocationState = z.infer<typeof locationStateSchema>;

interface ResourceCreatedState {
  createdResource: Resource;
  environmentId: string;
}

export function NewResource() {
  const { projectId = '', environmentId = '' } = useParams<{ projectId: string; environmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const { toast } = useToast();
  const returnTo = searchParams.get('returnTo') || `/projects/${projectId}`;
  const serverId = searchParams.get('server') || '';

  // Handle resource creation result from child routes
  useEffect(() => {
    const handleLocationState = () => {
      const parseResult = locationStateSchema.safeParse(location.state);
      
      if (!parseResult.success) {
        console.error('Invalid location state:', parseResult.error);
        return;
      }

      const state = parseResult.data;
      if (state?.resource) {
        console.log('Resource created:', state.resource);
        handleResourceCreated(state.resource);
      }
    };

    handleLocationState();
  }, [location.state]);

  const handleResourceCreated = (resource: Resource) => {
    console.log('Handling resource creation success', { resource, returnTo });
    try {
      // Navigate back with the created resource
      navigate(returnTo, {
        replace: true,
        state: { 
          createdResource: resource,
          environmentId: environmentId 
        } as ResourceCreatedState
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to return to project page"
      });
      // Fallback to simple navigation if state transfer fails
      navigate(returnTo, { replace: true });
    }
  };

  const handleResourceTypeSelect = (path: string) => {
    if (!projectId || !environmentId) {
      console.error('Missing required parameters', { projectId, environmentId });
      toast({
        variant: "destructive",
        title: "Error",
        description: "Missing required project information"
      });
      return;
    }

    try {
      setIsNavigating(true);
      console.log(`Selected resource type: ${path}`, { 
        projectId, 
        environmentId,
        serverId,
        returnTo,
        currentPath: location.pathname 
      });
      
      const params = new URLSearchParams({
        server: serverId,
        returnTo: returnTo
      });
      
      navigate(path + '?' + params.toString(), {
        state: { 
          from: location.pathname,
          serverId,
          returnPath: returnTo
        } as LocationState
      });
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to navigate to resource creation"
      });
    } finally {
      // Reset navigation state after a short delay to ensure the loader is visible
      setTimeout(() => setIsNavigating(false), 100);
    }
  };

  const categories = [
    {
      title: 'Git Based',
      description: 'Deploy applications directly from Git repositories',
      items: [
        {
          id: 'public-repo',
          title: 'Public Repository',
          description: 'You can deploy any kind of public repositories from the supported git providers.',
          icon: <GitBranch className="h-8 w-8" />,
          path: `public`
        },
        {
          id: 'github-app',
          title: 'Private Repository (with GitHub App)',
          description: 'You can deploy public & private repositories through your GitHub Apps.',
          icon: <Box className="h-8 w-8" />,
          path: `github`
        },
        {
          id: 'deploy-key',
          title: 'Private Repository (with deploy key)',
          description: 'You can deploy public & private repositories with a simple deploy key (SSH key).',
          icon: <GitBranch className="h-8 w-8" />,
          path: `private`
        }
      ]
    },
    {
      title: 'Docker Based',
      description: 'Deploy applications using Docker',
      items: [
        {
          id: 'dockerfile',
          title: 'Dockerfile',
          description: 'You can deploy a simple Dockerfile, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `dockerfile`
        },
        {
          id: 'compose',
          title: 'Docker Compose',
          description: 'You can deploy a complex application easily with Docker Compose, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `compose`
        },
        {
          id: 'image',
          title: 'Existing Docker Image',
          description: 'You can deploy an existing Docker image from any Registry, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `image`
        }
      ]
    },
    {
      title: 'Databases',
      description: 'Deploy database instances',
      items: [
        {
          id: 'postgresql',
          title: 'PostgreSQL',
          description: 'PostgreSQL is an object-relational database known for its robustness, advanced features, and strong standards compliance.',
          icon: <Database className="h-8 w-8" />,
          path: `postgresql`
        },
        {
          id: 'redis',
          title: 'Redis',
          description: 'Redis is an open-source, in-memory data structure store, used as a database, cache, and message broker.',
          icon: <Database className="h-8 w-8" />,
          path: `redis`
        },
        {
          id: 'mongodb',
          title: 'MongoDB',
          description: 'MongoDB is a source-available, NoSQL database that uses JSON-like documents with optional schemas.',
          icon: <Database className="h-8 w-8" />,
          path: `mongodb`
        }
      ]
    }
  ];

  if (isNavigating) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If we're at a child route, render the child component
  if (location.pathname.split('/').length > 7) {
    return <Outlet />;
  }

  // Otherwise, render the resource type selection screen
  return (
    <div className="container mx-auto py-6 space-y-8 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Resource</h1>
          <p className="text-sm text-muted-foreground">
            Deploy resources, like Applications, Databases, Services...
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <div className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Applications</h2>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Git Based</h3>
              <div className="grid gap-4">
                {categories[0].items.map((item) => (
                  <Card 
                    key={item.id}
                    className="hover:bg-accent cursor-pointer transition-colors border-muted"
                    onClick={() => handleResourceTypeSelect(item.path)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted p-2 rounded-md">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Docker Based</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {categories[1].items.map((item) => (
                  <Card 
                    key={item.id}
                    className="hover:bg-accent cursor-pointer transition-colors border-muted"
                    onClick={() => handleResourceTypeSelect(item.path)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-muted p-2 rounded-md">
                          {item.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                          <CardDescription className="text-sm">
                            {item.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Databases</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categories[2].items.map((item) => (
                <Card 
                  key={item.id}
                  className="hover:bg-accent cursor-pointer transition-colors border-muted"
                  onClick={() => handleResourceTypeSelect(item.path)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-md">
                        {item.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base mb-1">{item.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {item.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
} 
