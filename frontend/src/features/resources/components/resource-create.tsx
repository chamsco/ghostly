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
import { Plus } from 'lucide-react';
//import type { EnvironmentVariable } from '@/types/environment';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.nativeEnum(ServiceType),
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

interface ResourceCreateProps {
  projectId: string;
  environmentId: string;
  serverId?: string;
  onResourceCreated?: (resource: Resource) => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  className?: string;
  children?: React.ReactNode;
}

export function ResourceCreate({ 
  projectId, 
  environmentId,
  serverId,
  onResourceCreated,
  variant = 'default',
  className,
  children 
}: ResourceCreateProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: ServiceType.NODEJS,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      if (!serverId) {
        throw new Error('Server ID is required');
      }

      const resource = await projectsApi.createResource(projectId, {
        ...data,
        environmentId,
        serverId
      });
      toast({
        title: 'Success',
        description: 'Resource created successfully',
      });
      onResourceCreated?.(resource);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create resource',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          {children || (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Resource</DialogTitle>
          <DialogDescription>
            Add a new resource to your environment
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="my-service" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value: ServiceType) => field.onChange(value)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ServiceType.NODEJS}>Node.js</SelectItem>
                      <SelectItem value={ServiceType.PYTHON}>Python</SelectItem>
                      <SelectItem value={ServiceType.PHP}>PHP</SelectItem>
                      <SelectItem value={ServiceType.DOCKER}>Docker</SelectItem>
                      <SelectItem value={ServiceType.MYSQL}>MySQL</SelectItem>
                      <SelectItem value={ServiceType.POSTGRESQL}>PostgreSQL</SelectItem>
                      <SelectItem value={ServiceType.MONGODB}>MongoDB</SelectItem>
                      <SelectItem value={ServiceType.REDIS}>Redis</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 