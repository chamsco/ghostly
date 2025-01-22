import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { ResourceType, DatabaseType, ServiceType, type Resource } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
//import type { EnvironmentVariable } from '@/types/environment';

const formSchema = z.object({
  name: z.string().min(3, 'Resource name must be at least 3 characters'),
  type: z.nativeEnum(ResourceType),
  // Database specific fields
  databaseType: z.nativeEnum(DatabaseType).optional(),
  databaseName: z.string().optional(),
  adminEmail: z.string().email().optional(),
  initialDatabase: z.string().optional(),
  dbPassword: z.string().optional(),
  // Service specific fields
  serviceType: z.nativeEnum(ServiceType).optional(),
  repositoryUrl: z.string().url().optional(),
  dockerComposeContent: z.string().optional(),
  dockerImageUrl: z.string().optional(),
  // Website specific fields
  branch: z.string().optional(),
  // Common fields
  environmentVariables: z.array(z.object({
    id: z.string(),
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string()
  })).default([])
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  projectId: string;
  environmentId: string;
  onResourceCreated?: (resource: Resource) => void;
}

export function ResourceCreate({ projectId, environmentId, onResourceCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: ResourceType.SERVICE,
      environmentVariables: []
    }
  });

  const resourceType = form.watch('type');

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const resource = await projectsApi.createResource(projectId, {
        ...values,
        serverId: projectId,
        environmentId,
        environmentVariables: values.environmentVariables
      });
      if (resource) {
        toast({
          title: "Success",
          description: "Resource created successfully"
        });
        onResourceCreated?.(resource);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Resource creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create resource"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Resource</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>
            Create a new resource for your project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Name</FormLabel>
                  <FormControl>
                    <Input placeholder="my-resource" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your resource
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
                  <FormLabel>Resource Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ResourceType.DATABASE}>Database</SelectItem>
                      <SelectItem value={ResourceType.SERVICE}>Service</SelectItem>
                      <SelectItem value={ResourceType.WEBSITE}>Website</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of resource you want to create
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {resourceType === ResourceType.DATABASE && (
              <>
                <FormField
                  control={form.control}
                  name="databaseType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a database type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={DatabaseType.POSTGRESQL}>PostgreSQL</SelectItem>
                          <SelectItem value={DatabaseType.MYSQL}>MySQL</SelectItem>
                          <SelectItem value={DatabaseType.MONGODB}>MongoDB</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="databaseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initialDatabase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Database</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dbPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {resourceType === ResourceType.SERVICE && (
              <>
                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ServiceType.NODEJS}>Node.js</SelectItem>
                          <SelectItem value={ServiceType.PYTHON}>Python</SelectItem>
                          <SelectItem value={ServiceType.PHP}>PHP</SelectItem>
                          <SelectItem value={ServiceType.DOCKER}>Docker</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="repositoryUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {resourceType === ResourceType.WEBSITE && (
              <>
                <FormField
                  control={form.control}
                  name="repositoryUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Repository URL</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue="main" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="space-y-4">
              <FormLabel>Environment Variables</FormLabel>
              <EnvironmentVariablesEditor
                value={form.watch('environmentVariables')}
                onChange={(vars) => form.setValue('environmentVariables', vars)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Resource
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 