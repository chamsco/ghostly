import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { Project } from '@/types/project';
//import { Resource } from '@/types/project';
import { Environment } from '@/types/environment';
import { ResourceCreate } from '@/features/resources/components/resource-create';

export function ProjectResources() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('production');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (!projectId) return;
        const data = await projectsApi.get(projectId);
        setProject(data);
        setIsLoading(false);
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch project",
          variant: "destructive"
        });
        navigate('/projects');
      }
    };

    fetchProject();
  }, [projectId, toast, navigate]);

  const handleResourceCreated = (environmentName: string) => {
    toast({
      title: "Success",
      description: `Resource added to ${environmentName} environment`
    });
  };

  const handleDeleteResource = (resourceId: string) => {
    // Implement the delete logic here
    console.log(`Deleting resource with id: ${resourceId}`);
  };

  if (isLoading || !project) {
    return (
      <div className="container max-w-3xl py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">Loading project...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Add Resources</h1>
        <p className="text-muted-foreground">
          Add resources to your project environments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            Configure resources for each environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
            <TabsList>
              {project.environments.map((env: Environment) => (
                <TabsTrigger key={env.name} value={env.name}>
                  {env.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {project.environments.map((env: Environment) => (
              <TabsContent key={env.name} value={env.name} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium capitalize">{env.name} Resources</h3>
                    <ResourceCreate 
                      projectId={project.id}
                      onResourceCreated={() => handleResourceCreated(env.name)}
                    />
                  </div>
                  {env.resources?.map((resource: any) => (
                    <Card key={resource.id}>
                      <CardContent className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {resource.type}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate('/projects')}
            >
              Skip for now
            </Button>
            <Button
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              Finish Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 