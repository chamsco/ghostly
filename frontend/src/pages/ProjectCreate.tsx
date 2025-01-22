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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CreateProjectDto } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useServers } from '@/hooks/use-servers';

// Form validation schemas for each step
const basicInfoSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string(),
  serverId: z.string().min(1, 'Please select a server')
});

const environmentSchema = z.object({
  environments: z.array(z.object({
    name: z.string(),
    variables: z.array(z.object({
      key: z.string(),
      value: z.string(),
      isSecret: z.boolean()
    })).default([])
  }))
});

type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;
type EnvironmentFormValues = z.infer<typeof environmentSchema>;

export function ProjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<Partial<CreateProjectDto>>({});
  const { servers, isLoading: serversLoading } = useServers();

  // Form for basic info (Step 1)
  const basicInfoForm = useForm<BasicInfoFormValues>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: '',
      description: '',
      serverId: ''
    }
  });

  // Form for environments (Step 2)
  const environmentForm = useForm<EnvironmentFormValues>({
    resolver: zodResolver(environmentSchema),
    defaultValues: {
      environments: [
        { name: 'production', variables: [] },
        { name: 'development', variables: [] }
      ]
    }
  });

  const handleBasicInfoSubmit = async (values: BasicInfoFormValues) => {
    setProjectData({ ...projectData, ...values });
    setStep(2);
  };

  const handleEnvironmentSubmit = async (values: EnvironmentFormValues) => {
    try {
      setIsLoading(true);
      const finalData: CreateProjectDto = {
        ...projectData,
        environments: values.environments
      } as CreateProjectDto;

      const project = await projectsApi.create(finalData);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      navigate(`/projects/${project.id}/resources`);
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create project",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Create New Project</h1>
        <Progress value={step === 1 ? 33 : 66} className="h-2" />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details of your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...basicInfoForm}>
              <form onSubmit={basicInfoForm.handleSubmit(handleBasicInfoSubmit)} className="space-y-6">
                <FormField
                  control={basicInfoForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="my-awesome-project" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name for your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={basicInfoForm.control}
                  name="serverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Server</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <Button
                            type="button"
                            variant={field.value === 'localhost' ? 'default' : 'outline'}
                            className="w-full h-24 flex flex-col gap-2"
                            onClick={() => field.onChange('localhost')}
                          >
                            <span className="text-lg">Localhost</span>
                            <span className="text-sm text-muted-foreground">127.0.0.1</span>
                          </Button>
                          
                          {servers?.map((server) => (
                            <Button
                              key={server.id}
                              type="button"
                              variant={field.value === server.id ? 'default' : 'outline'}
                              className="w-full h-24 flex flex-col gap-2"
                              onClick={() => field.onChange(server.id)}
                            >
                              <span className="text-lg">{server.name}</span>
                              <span className="text-sm text-muted-foreground">{server.host}</span>
                            </Button>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-24 flex flex-col gap-2"
                            onClick={() => navigate('/servers/create')}
                          >
                            <span className="text-lg">Add Server</span>
                            <span className="text-sm text-muted-foreground">Configure a new server</span>
                          </Button>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Choose a server to deploy your project
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/projects')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={serversLoading}>Continue</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Project Environments</CardTitle>
            <CardDescription>
              Configure your project environments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...environmentForm}>
              <form onSubmit={environmentForm.handleSubmit(handleEnvironmentSubmit)} className="space-y-6">
                <Tabs defaultValue="production">
                  <TabsList>
                    <TabsTrigger value="production">Production</TabsTrigger>
                    <TabsTrigger value="development">Development</TabsTrigger>
                  </TabsList>

                  <TabsContent value="production" className="space-y-4">
                    <FormField
                      control={environmentForm.control}
                      name="environments.0.variables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Production Environment Variables</FormLabel>
                          <FormControl>
                            <EnvironmentVariablesEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="development" className="space-y-4">
                    <FormField
                      control={environmentForm.control}
                      name="environments.1.variables"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Development Environment Variables</FormLabel>
                          <FormControl>
                            <EnvironmentVariablesEditor
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Project'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 