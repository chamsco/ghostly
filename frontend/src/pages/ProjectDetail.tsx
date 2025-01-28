/**
 * Project Details Page
 * 
 * Shows project environments and their resources
 * Allows managing environment variables and resources for each environment
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { ResourceCreate } from '@/features/resources/components/resource-create';
import type { Project, Environment, Resource } from '@/types/project';
import type { EnvironmentVariable } from '@/types/environment';
import { Input } from '@/components/ui/input';
import { generateUUID } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Settings, Upload } from 'lucide-react';
import { ResourceWizard } from '@/components/resources/ResourceWizard';

// Utility function for parsing .env files
const parseEnvFile = (content: string): EnvironmentVariable[] => {
  const variables: EnvironmentVariable[] = [];
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (!key || !valueParts.length) return;
    
    const value = valueParts.join('=');
    const now = new Date().toISOString();
    variables.push({
      id: generateUUID(),
      key: key.trim(),
      value: value.trim(),
      isSecret: key.trim().toLowerCase().includes('secret') || key.trim().toLowerCase().includes('password'),
      created_at: now,
      updated_at: now
    });
  });
  
  return variables;
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const data = await projectsApi.findOne(id);
      // Initialize empty arrays if they don't exist
      const projectWithDefaults = {
        ...data,
        environments: data.environments || [],
        resources: data.resources || []
      };
      setProject(projectWithDefaults);
      if (projectWithDefaults.environments.length > 0) {
        setSelectedEnvironment(projectWithDefaults.environments[0]);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch project details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEnvironmentSelect = (envId: string) => {
    const env = project?.environments.find(e => e.id === envId);
    if (env) {
      setSelectedEnvironment(env);
    }
  };

  const handleVariablesChange = async (variables: EnvironmentVariable[]) => {
    if (!project || !selectedEnvironment) return;

    try {
      await projectsApi.updateEnvironment(project.id, {
        name: selectedEnvironment.name,
        type: selectedEnvironment.type,
        variables
      });
      
      // Update local state
      setProject(prev => {
        if (!prev) return null;
        return {
          ...prev,
          environments: prev.environments.map(env => 
            env.id === selectedEnvironment.id 
              ? { ...env, variables }
              : env
          )
        };
      });

      toast({
        title: "Success",
        description: "Environment variables updated"
      });
    } catch (error) {
      console.error('Failed to update environment variables:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update environment variables"
      });
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Validate file type
      if (!file.name.endsWith('.env')) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "Please upload a .env file"
        });
        return;
      }

      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File Too Large",
          description: "File size should be less than 1MB"
        });
        return;
      }

      const content = await file.text();
      const parsedEnv = parseEnvFile(content);

      // Validate parsed variables
      if (parsedEnv.length === 0) {
        toast({
          variant: "destructive",
          title: "Empty File",
          description: "No valid environment variables found in the file"
        });
        return;
      }

      if (selectedEnvironment) {
        // Merge with existing variables, overwriting duplicates
        const existingVars = selectedEnvironment.variables || [];
        const mergedVars = [...existingVars];
        
        parsedEnv.forEach((newVar: EnvironmentVariable) => {
          const existingIndex = mergedVars.findIndex(v => v.key === newVar.key);
          if (existingIndex >= 0) {
            mergedVars[existingIndex] = newVar;
          } else {
            mergedVars.push(newVar);
          }
        });

        await handleVariablesChange(mergedVars);
      }

      toast({
        title: "Success",
        description: `Successfully imported ${parsedEnv.length} variables from ${file.name}`
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to import environment variables"
      });
    }
  };

  const handleResourceCreated = (resource: Resource) => {
    setProject(prev => {
      if (!prev) return null;
      
      const currentEnv = prev.environments.find(e => 
        e.id === selectedEnvironment?.id
      );
      
      if (!currentEnv) return prev;

      return {
        ...prev,
        environments: prev.environments.map(env => 
          env.id === currentEnv.id
            ? { ...env, resources: [...env.resources, resource] }
            : env
        )
      };
    });
  };

  if (isLoading || !project) {
    return (
      <div className="flex h-[200px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${project.id}/settings`)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Project Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Quick stats and information about your project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium">Environments</p>
              <p className="text-2xl font-bold">{project.environments.length}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Total Resources</p>
              <p className="text-2xl font-bold">
                {project.environments.reduce((acc, env) => acc + (env.resources?.length || 0), 0)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Created</p>
              <p className="text-2xl font-bold">
                {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environments Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environments</CardTitle>
              <CardDescription>
                Manage your project's environments and their resources
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {project.environments.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-2">No environments yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first environment and add resources to it
              </p>
              <Button 
                onClick={() => {
                  console.log('Opening Resource Wizard');
                  setShowWizard(true);
                }}
              >
                Add your first resource
              </Button>
              {showWizard && (
                <ResourceWizard
                  projectId={project.id}
                  onSuccess={() => {
                    console.log('Resource Wizard completed successfully');
                    setShowWizard(false);
                    fetchProject();
                  }}
                  onCancel={() => {
                    console.log('Resource Wizard cancelled');
                    setShowWizard(false);
                  }}
                />
              )}
            </div>
          ) : (
            <Tabs
              value={selectedEnvironment?.id}
              onValueChange={handleEnvironmentSelect}
              className="space-y-4"
            >
              <TabsList className="w-full justify-start">
                {project.environments.map(env => (
                  <TabsTrigger key={env.id} value={env.id} className="flex items-center gap-2">
                    {env.name}
                    <Badge variant="secondary" className="ml-2">
                      {env.resources?.length || 0} Resources
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {project.environments.map(env => {
                // Ensure resources is initialized
                const resources = env.resources || [];
                return (
                  <TabsContent key={env.id} value={env.id} className="space-y-6">
                    {/* Environment Header */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-medium">{env.name}</h3>
                        <p className="text-sm text-muted-foreground">Type: {env.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Input
                            type="file"
                            accept=".env"
                            className="hidden"
                            id={`env-file-${env.id}`}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file);
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById(`env-file-${env.id}`)?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Import .env
                          </Button>
                        </div>
                        <ResourceCreate
                          projectId={project.id}
                          environmentId={env.id}
                          serverId={project.serverId}
                          onResourceCreated={handleResourceCreated}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Resource
                        </ResourceCreate>
                      </div>
                    </div>

                    {/* Environment Variables Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Environment Variables</CardTitle>
                        <CardDescription>
                          Configure environment-specific variables
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <EnvironmentVariablesEditor
                          value={env.variables}
                          onChange={handleVariablesChange}
                        />
                      </CardContent>
                    </Card>

                    {/* Resources Section */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>Resources</CardTitle>
                            <CardDescription>
                              Manage environment-specific resources
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {resources.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No resources yet</p>
                            <ResourceCreate
                              projectId={project.id}
                              environmentId={env.id}
                              serverId={project.serverId}
                              onResourceCreated={handleResourceCreated}
                              className="mt-4"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add your first resource
                            </ResourceCreate>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {resources.map(resource => (
                              <Card key={resource.id}>
                                <CardHeader>
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <CardTitle>{resource.name}</CardTitle>
                                      <CardDescription>Type: {resource.type}</CardDescription>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => navigate(`/projects/${project.id}/resources/${resource.id}`)}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm font-medium">Status</span>
                                      <Badge>{resource.status}</Badge>
                                    </div>
                                    {resource.url && (
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">URL</span>
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-500 hover:underline"
                                        >
                                          {resource.url}
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 