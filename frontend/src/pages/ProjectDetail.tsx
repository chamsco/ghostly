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
      createdAt: now,
      updatedAt: now
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

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await projectsApi.findOne(id);
        setProject(data);
        if (data.environments.length > 0) {
          setSelectedEnvironment(data.environments[0]);
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

    fetchProject();
  }, [id, toast]);

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
    if (!project || !selectedEnvironment) return;

    // Update local state
    setProject(prev => {
      if (!prev) return null;
      return {
        ...prev,
        environments: prev.environments.map(env => 
          env.id === selectedEnvironment.id 
            ? { ...env, resources: [...env.resources, resource] }
            : env
        )
      };
    });
  };

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <Button onClick={() => navigate(`/projects/${project.id}/settings`)}>
          Settings
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environments</CardTitle>
          <CardDescription>
            Manage your project's environments and their resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedEnvironment?.id}
            onValueChange={handleEnvironmentSelect}
          >
            <TabsList>
              {project.environments.map(env => (
                <TabsTrigger key={env.id} value={env.id}>
                  {env.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {project.environments.map(env => (
              <TabsContent key={env.id} value={env.id}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{env.name}</h3>
                      <p className="text-sm text-muted-foreground">Type: {env.type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".env"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                      <ResourceCreate
                        projectId={project.id}
                        environmentId={env.id}
                        onResourceCreated={handleResourceCreated}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Environment Variables</h4>
                    <EnvironmentVariablesEditor
                      value={env.variables}
                      onChange={handleVariablesChange}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Resources</h4>
                    </div>
                    {env.resources.length === 0 ? (
                      <p className="text-muted-foreground">No resources yet</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {env.resources.map(resource => (
                          <Card key={resource.id}>
                            <CardHeader>
                              <CardTitle>{resource.name}</CardTitle>
                              <CardDescription>Type: {resource.type}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div>
                                  <h4 className="font-medium">{resource.name}</h4>
                                  <p className="text-sm text-muted-foreground">Type: {resource.type}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 