/**
 * Project Creation Page
 * 
 * Form for creating new projects with:
 * - Project name and type selection
 * - Server selection (local/remote)
 * - Environment variables input
 * - Docker compose file upload (optional)
 * - Form validation and error handling
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ProjectType, DatabaseType, ServiceType, CreateProjectDto } from '@/types/project';
import { projectsApi } from '@/services/api.service';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  type: z.nativeEnum(ProjectType),
  serverId: z.string(),
  // Database specific fields
  databaseType: z.nativeEnum(DatabaseType).optional(),
  databaseName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  // Service specific fields
  serviceType: z.nativeEnum(ServiceType).optional(),
  repositoryUrl: z.string().url().optional(),
  // Website specific fields
  branch: z.string().optional(),
  // Common fields
  environmentVariables: z.array(z.object({
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean()
  })).default([])
});

type FormValues = z.infer<typeof formSchema>;

export function ProjectCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: ProjectType.SERVICE,
      serverId: '',
      environmentVariables: [],
      databaseType: undefined,
      databaseName: '',
      adminEmail: '',
      serviceType: undefined,
      repositoryUrl: '',
      branch: 'main'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getValues();
    if (!values.name || !values.type || !values.serverId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      const projectData: CreateProjectDto = {
        name: values.name,
        type: values.type,
        serverId: values.serverId,
        environmentVariables: values.environmentVariables
      };

      // Add type-specific fields
      if (values.type === ProjectType.DATABASE) {
        if (!values.databaseType || !values.databaseName || !values.adminEmail) {
          throw new Error('Please fill in all database fields');
        }
        Object.assign(projectData, {
          databaseType: values.databaseType,
          databaseName: values.databaseName,
          adminEmail: values.adminEmail
        });
      } else if (values.type === ProjectType.SERVICE) {
        if (!values.serviceType || !values.repositoryUrl) {
          throw new Error('Please fill in all service fields');
        }
        Object.assign(projectData, {
          serviceType: values.serviceType,
          repositoryUrl: values.repositoryUrl
        });
      } else if (values.type === ProjectType.WEBSITE) {
        if (!values.repositoryUrl) {
          throw new Error('Please fill in the repository URL');
        }
        Object.assign(projectData, {
          repositoryUrl: values.repositoryUrl,
          branch: values.branch
        });
      }

      await projectsApi.create(projectData);
      toast({
        title: "Success",
        description: "Project created successfully"
      });
      navigate('/projects');
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
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create Project</CardTitle>
          <CardDescription>
            Deploy a new project to your local or remote server
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="my-project" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for your project (lowercase letters, numbers, and hyphens only)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ProjectType.DATABASE}>Database</SelectItem>
                        <SelectItem value={ProjectType.SERVICE}>Service</SelectItem>
                        <SelectItem value={ProjectType.WEBSITE}>Website</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the type of project you want to deploy
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deployment Target</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select where to deploy" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="local">Local Machine</SelectItem>
                        <SelectItem value="remote">Remote Server</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose where to deploy your project
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
                <Button type="submit" disabled={isLoading}>
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