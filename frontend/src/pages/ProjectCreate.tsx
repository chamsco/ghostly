/**
 * Project Creation Page
 * 
 * Form for creating new projects with:
 * - Project name and description
 * - Server selection
 * - Environment variables input
 * - .env file upload
 */
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { CreateProjectDto } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { useServers } from '@/hooks/use-servers';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { FileUpload } from '@/components/file-upload';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string(),
  serverId: z.string(),
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
  const { servers, isLoading: isLoadingServers } = useServers();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      serverId: '',
      environmentVariables: []
    }
  });

  const handleEnvFileUpload = useCallback((content: string) => {
    const envVars = content.split('\n')
      .filter(line => line.trim() && !line.startsWith('#'))
      .map(line => {
        const [key, value] = line.split('=').map(part => part.trim());
        return {
          key,
          value,
          isSecret: key.toLowerCase().includes('secret') || key.toLowerCase().includes('password')
        };
      });
    
    form.setValue('environmentVariables', envVars);
  }, [form]);

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const projectData: CreateProjectDto = {
        name: values.name,
        description: values.description,
        serverId: values.serverId,
        environmentVariables: values.environmentVariables
      };

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
            Create a new project and configure its resources later
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your project..."
                        className="resize-none"
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
                control={form.control}
                name="serverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Server</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a server" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingServers ? (
                          <SelectItem value="loading" disabled>Loading servers...</SelectItem>
                        ) : servers?.map(server => (
                          <SelectItem key={server.id} value={server.id}>
                            {server.name} ({server.host})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the server where your project will be managed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Environment Variables</FormLabel>
                <FileUpload
                  accept=".env"
                  onUpload={handleEnvFileUpload}
                  description="Upload a .env file to import environment variables"
                />
                <EnvironmentVariablesEditor
                  value={form.watch('environmentVariables')}
                  onChange={(vars) => form.setValue('environmentVariables', vars)}
                />
              </div>

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