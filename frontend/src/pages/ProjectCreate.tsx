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
import { z } from 'zod';
import { useProjects } from '@/contexts/projects.context';
import { ProjectType } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

// Form validation schema
const formSchema = z.object({
  name: z.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(50, 'Project name must be less than 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Project name can only contain lowercase letters, numbers, and hyphens'),
  type: z.nativeEnum(ProjectType),
  serverId: z.string(),
  environmentVariables: z.record(z.string(), z.string()).optional(),
  dockerComposeFile: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function ProjectCreate() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: ProjectType.SUPABASE,
      serverId: 'local', // Default to local deployment
      environmentVariables: {},
      dockerComposeFile: undefined
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      const project = await createProject(data);
      toast({
        title: 'Project created',
        description: 'Your project is being set up...'
      });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
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
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <SelectItem value={ProjectType.SUPABASE}>Supabase</SelectItem>
                        <SelectItem value={ProjectType.POCKETBASE}>PocketBase</SelectItem>
                        <SelectItem value={ProjectType.WEBSITE}>Website</SelectItem>
                        <SelectItem value={ProjectType.SERVICE}>Service</SelectItem>
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
                <Button type="submit">
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