/**
 * Project Creation Page
 * 
 * Form for creating new projects with:
 * - Project name and description
 * - Server selection
 * - Environment variables input
 * - .env file upload
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
//import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { Progress } from '@/components/ui/progress';
import { useServers } from '@/hooks/use-servers';
import type { Environment, EnvironmentVariable } from '@/types/environment';
import { generateUUID } from '@/lib/utils';
import type { CreateProjectDto, CreateEnvironmentDto } from '@/types/project';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Form validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  defaultServerId: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

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
      isSecret: isSecretKey(key.trim()),
      createdAt: now,
      updatedAt: now
    });
  });
  
  return variables;
};

const isSecretKey = (key: string): boolean => {
  const secretPatterns = [
    /secret/i,
    /password/i,
    /key/i,
    /token/i,
    /auth/i,
    /cert/i,
    /private/i,
    /credential/i
  ];
  return secretPatterns.some(pattern => pattern.test(key));
};

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'basic' | 'environments'>('basic');
  const [globalVariables, setGlobalVariables] = useState<EnvironmentVariable[]>([]);
  const [environments, setEnvironments] = useState<Environment[]>([
    { 
      id: generateUUID(),
      name: 'production', 
      variables: [],
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: generateUUID(),
      name: 'development', 
      variables: [],
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  const { servers, isLoading: isLoadingServers } = useServers();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultServerId: undefined,
    },
  });

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      const projectData: CreateProjectDto = {
        ...values,
        globalVariables,
        environments: environments.map(env => ({
          name: env.name,
          variables: env.variables,
          resources: []
        }))
      };

      const project = await projectsApi.create(projectData);

      if (project) {
        toast({
          title: "Success",
          description: "Project created successfully"
        });
        navigate(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project"
      });
    }
  };

  const handleFileUpload = async (file: File, isGlobal: boolean = false, envIndex?: number) => {
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

      if (isGlobal) {
        setGlobalVariables(parsedEnv);
      } else if (typeof envIndex === 'number') {
        setEnvironments(prev => {
          const updated = [...prev];
          updated[envIndex] = {
            ...updated[envIndex],
            variables: parsedEnv
          };
          return updated;
        });
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
        description: "Failed to import environment variables. Please check the file format."
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Set up your project with basic information and environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Default Server (Optional)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {isLoadingServers ? (
                      <div className="col-span-2 text-center py-4">Loading servers...</div>
                    ) : servers?.length === 0 ? (
                      <div className="col-span-2 text-center py-4">
                        <p className="text-muted-foreground">No servers available</p>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-2"
                          onClick={() => navigate('/servers/create')}
                        >
                          Add Server
                        </Button>
                      </div>
                    ) : (
                      servers?.map((server) => (
                        <Button
                          key={server.id}
                          type="button"
                          variant={form.watch('defaultServerId') === server.id ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => form.setValue('defaultServerId', server.id)}
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{server.name}</span>
                            <span className="text-sm text-muted-foreground">{server.host}</span>
                            <span className="text-sm text-muted-foreground">{server.status}</span>
                          </div>
                        </Button>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Global Environment Variables</h3>
                    <Input
                      type="file"
                      accept=".env"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, true);
                      }}
                    />
                  </div>
                  <EnvironmentVariablesEditor
                    value={globalVariables}
                    onChange={setGlobalVariables}
                  />
                </div>

                <div className="space-y-6">
                  {environments.map((env, index) => (
                    <div key={env.name} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium capitalize">{env.name} Environment Variables</h3>
                        <Input
                          type="file"
                          accept=".env"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, false, index);
                          }}
                        />
                      </div>
                      <EnvironmentVariablesEditor
                        value={env.variables}
                        onChange={(variables) => {
                          setEnvironments(prev => {
                            const updated = [...prev];
                            updated[index] = { ...updated[index], variables };
                            return updated;
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full">
                  Create Project
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 