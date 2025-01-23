/**
 * Project Creation Page
 * 
 * Form for creating new projects with:
 * - Project name and description
 * - Optional default server selection
 */
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { useServers } from '@/hooks/use-servers';
import { EnvironmentType } from '@/types/project';
import { AxiosError } from 'axios';

// Form validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  defaultServerId: z.string().optional(),
  globalVariables: z.array(z.object({
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean()
  })).default([]),
  environments: z.array(z.object({
    name: z.string(),
    type: z.nativeEnum(EnvironmentType),
    variables: z.array(z.object({
      key: z.string(),
      value: z.string(),
      isSecret: z.boolean()
    })).default([])
  })).default([])
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { servers, isLoading: isLoadingServers } = useServers();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultServerId: undefined,
      globalVariables: [],
      environments: []
    },
  });

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      console.log('Submitting project data:', values);
      const project = await projectsApi.create({
        ...values,
        environments: [
          {
            name: 'development',
            type: EnvironmentType.DEV,
            variables: []
          },
          {
            name: 'production', 
            type: EnvironmentType.PROD,
            variables: []
          }
        ]
      });

      if (project) {
        toast({
          title: "Success",
          description: "Project created successfully"
        });
        navigate(`/projects/${project.id}`);
      }
    } catch (error) {
      console.error('Project creation error:', error);
      if (error instanceof AxiosError && error.response?.data) {
        console.error('Server validation errors:', error.response.data);
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create project"
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Set up your project with basic information. Environments and resources can be configured after creation.
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
                        <Input {...field} placeholder="my-awesome-project" />
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
                        <Input {...field} placeholder="A brief description of your project" />
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
                    ) : servers ? (
                      servers.map((server) => (
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
                    ) : (
                      <div className="col-span-2 text-center py-4">
                        <p className="text-muted-foreground">Error loading servers</p>
                      </div>
                    )}
                  </div>
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