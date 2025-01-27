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
import { Environment, EnvironmentType } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';

const formSchema = z.object({
  name: z.string().min(3, 'Environment name must be at least 3 characters'),
  type: z.nativeEnum(EnvironmentType),
  variables: z.array(z.object({
    id: z.string(),
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean(),
    created_at: z.string(),
    updated_at: z.string()
  })).default([])
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  projectId: string;
  onEnvironmentCreated: (environment: Environment) => void;
}

export function EnvironmentCreate({ projectId, onEnvironmentCreated }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: EnvironmentType.DEV,
      variables: []
    }
  });

  const handleSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const environment = await projectsApi.createEnvironment(projectId, {
        name: values.name,
        type: values.type,
        variables: values.variables || []
      });
      
      if (environment) {
        onEnvironmentCreated(environment);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Environment creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create environment"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Environment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Environment</DialogTitle>
          <DialogDescription>
            Create a new environment for your project
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="production" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your environment
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
                  <FormLabel>Environment Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={EnvironmentType.DEV}>Development</SelectItem>
                      <SelectItem value={EnvironmentType.PROD}>Production</SelectItem>
                      <SelectItem value={EnvironmentType.STAGING}>Staging</SelectItem>
                      <SelectItem value={EnvironmentType.TEST}>Test</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormLabel>Environment Variables</FormLabel>
              <EnvironmentVariablesEditor
                value={form.watch('variables')}
                onChange={(vars) => form.setValue('variables', vars)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Create Environment
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 