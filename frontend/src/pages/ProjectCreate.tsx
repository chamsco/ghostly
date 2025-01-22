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
//import { CreateProjectDto } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { Progress } from '@/components/ui/progress';
import { useServers } from '@/hooks/use-servers';
import type { EnvironmentVariable } from '@/types/environment';
import type { Environment } from '@/types/environment';

// Form validation schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  serverId: z.string().min(1, 'Server is required'),
});

type BasicInfoValues = z.infer<typeof basicInfoSchema>;

const parseEnvFile = (content: string): EnvironmentVariable[] => {
  const variables: EnvironmentVariable[] = [];
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (!key || !valueParts.length) return;
    
    const value = valueParts.join('=');
    variables.push({
      key: key.trim(),
      value: value.trim(),
      isSecret: key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY'),
    });
  });
  
  return variables;
};

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'basic' | 'environments'>('basic');
  const [basicInfo, setBasicInfo] = useState<BasicInfoValues>();
  const [environments, setEnvironments] = useState<Environment[]>([
    { 
      id: crypto.randomUUID(),
      name: 'production', 
      variables: [],
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(),
      name: 'development', 
      variables: [],
      resources: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
  const { servers, isLoading: isLoadingServers } = useServers();

  const basicForm = useForm<BasicInfoValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      description: '',
      serverId: '',
    },
  });

  const handleBasicSubmit = async (values: BasicInfoValues) => {
    setBasicInfo(values);
    setStep('environments');
  };

  const handleEnvironmentSubmit = async () => {
    if (!basicInfo) return;

    try {
      const projectData = {
        ...basicInfo,
        environments: environments.map(env => ({
          name: env.name,
          variables: env.variables.map(v => ({
            key: v.key.trim(),
            value: v.value.trim(),
            isSecret: v.isSecret || isSecretKey(v.key)
          })),
          resources: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }))
      };
      
      const response = await projectsApi.create(projectData);
      if (response) {
        toast({
          title: "Success",
          description: `Project ${basicInfo.name} was created successfully`
        });
        navigate('/projects');
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create project"
        });
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

  const handleEnvironmentVariablesChange = (index: number, variables: EnvironmentVariable[]) => {
    setEnvironments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], variables };
      return updated;
    });
  };

  const handleFileUpload = async (file: File, envIndex: number) => {
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

      // Update environment variables
      setEnvironments(prevEnvs => {
        const newEnvs = [...prevEnvs];
        newEnvs[envIndex] = {
          ...newEnvs[envIndex],
          variables: parsedEnv.map(v => ({
            ...v,
            isSecret: v.isSecret || isSecretKey(v.key)
          }))
        };
        return newEnvs;
      });

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
      <Tabs value={step} onValueChange={(value) => setStep(value as 'basic' | 'environments')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="environments" disabled={!basicInfo}>Environments</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Enter the basic information for your new project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...basicForm}>
                <form onSubmit={basicForm.handleSubmit(handleBasicSubmit)} className="space-y-4">
                  <FormField
                    control={basicForm.control}
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
                    control={basicForm.control}
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

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Select Server</h3>
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
                              variant={basicForm.watch('serverId') === server.id ? 'default' : 'outline'}
                              className="w-full justify-start"
                              onClick={() => basicForm.setValue('serverId', server.id)}
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
                  </div>

                  <Button type="submit" className="w-full">Continue</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments">
          <Card>
            <CardHeader>
              <CardTitle>Configure Environments</CardTitle>
              <CardDescription>
                Set up environment variables for your project. You can upload .env files or add variables manually.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {environments.map((env, index) => (
                  <div key={env.name} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium capitalize">{env.name} Environment</h3>
                      <Input
                        type="file"
                        accept=".env"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, index);
                        }}
                      />
                    </div>
                    <EnvironmentVariablesEditor
                      value={env.variables}
                      onChange={(variables) => handleEnvironmentVariablesChange(index, variables)}
                    />
                  </div>
                ))}

                <div className="flex justify-end space-x-4">
                  <Button variant="outline" onClick={() => setStep('basic')}>
                    Back
                  </Button>
                  <Button onClick={handleEnvironmentSubmit}>
                    Create Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 