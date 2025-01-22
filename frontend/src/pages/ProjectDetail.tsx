/**
 * Project Details Page
 * 
 * Shows project information and allows managing resources and environments
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import type { Project, Resource } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { ResourceList } from '@/features/resources/components/resource-list';
import { ResourceCreate } from '@/features/resources/components/resource-create';
import { EnvironmentList } from '@/features/environments/components/environment-list';
import { EnvironmentCreate } from '@/features/environments/components/environment-create';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedResources, setLoadedResources] = useState<Resource[]>([]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await projectsApi.get(id);
        setProject(data);
      } catch (err) {
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to fetch project",
          variant: "destructive"
        });
        navigate('/projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, navigate, toast]);

  useEffect(() => {
    const loadResources = async () => {
      if (!project) return;
      const resources = await Promise.all(
        project.resources.map(id => projectsApi.getResource(id))
      );
      setLoadedResources(resources.filter((r): r is Resource => r !== null));
    };
    loadResources();
  }, [project]);

  const handleEnvironmentVariablesChange = async (environmentVariables: Project['environmentVariables']) => {
    if (!project) return;
    try {
      const updatedProject = await projectsApi.update(project.id, { environmentVariables });
      setProject(updatedProject);
      toast({
        title: "Success",
        description: "Environment variables updated successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update environment variables",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            {project.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium">Created</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(project.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(project.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="variables">Environment Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resources</CardTitle>
              <CardDescription>
                Manage the resources in your project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceList
                resources={loadedResources}
                onResourceUpdated={(resource) => {
                  setLoadedResources(prev => 
                    prev.map(r => r.id === resource.id ? resource : r)
                  );
                }}
                onResourceDeleted={(resourceId) => {
                  setLoadedResources(prev => 
                    prev.filter(r => r.id !== resourceId)
                  );
                  setProject(prev => prev ? {
                    ...prev,
                    resources: prev.resources.filter(id => id !== resourceId)
                  } : null);
                }}
              />
              <div className="mt-4">
                <ResourceCreate
                  projectId={project.id}
                  onResourceCreated={(resource) => {
                    setProject({
                      ...project,
                      resources: [...project.resources, resource.id]
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environments</CardTitle>
              <CardDescription>
                Manage deployment environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnvironmentList
                environments={project.environments}
                onEnvironmentUpdated={(environment) => {
                  setProject({
                    ...project,
                    environments: project.environments.map(e =>
                      e.id === environment.id ? environment : e
                    )
                  });
                }}
                onEnvironmentDeleted={(environmentId) => {
                  setProject({
                    ...project,
                    environments: project.environments.filter(e => e.id !== environmentId)
                  });
                }}
              />
              <div className="mt-4">
                <EnvironmentCreate
                  projectId={project.id}
                  onEnvironmentCreated={(environment) => {
                    setProject({
                      ...project,
                      environments: [...project.environments, environment]
                    });
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
              <CardDescription>
                Manage global environment variables for the project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnvironmentVariablesEditor
                value={project.environmentVariables || []}
                onChange={handleEnvironmentVariablesChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 