import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import { EnvironmentType, ServiceType } from '@/types/project';
//import { ResourceType } from '@/types/project';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';
import { Progress } from '@/components/ui/progress';
//import { Separator } from '@/components/ui/separator';

// Validation schemas for each step
const environmentSchema = z.object({
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

const resourceSchema = z.object({
  name: z.string().min(3, 'Resource name must be at least 3 characters'),
  type: z.nativeEnum(ServiceType),
  environmentVariables: z.array(z.object({
    id: z.string(),
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean(),
    created_at: z.string(),
    updated_at: z.string()
  })).default([])
});

// Combined schema for the entire form
const formSchema = z.object({
  environment: environmentSchema,
  resource: resourceSchema
});

type FormData = z.infer<typeof formSchema>;

interface ResourceWizardProps {
  projectId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ResourceWizard({ projectId, onSuccess, onCancel }: ResourceWizardProps) {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      environment: {
        name: '',
        type: EnvironmentType.DEV,
        variables: []
      },
      resource: {
        name: '',
        type: ServiceType.NODEJS,
        environmentVariables: []
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);

      // Step 1: Create environment
      const environment = await projectsApi.createEnvironment(projectId, {
        name: data.environment.name,
        type: data.environment.type,
        variables: data.environment.variables
      });

      if (!environment) {
        throw new Error('Failed to create environment');
      }

      // Step 2: Create resource
      const resource = await projectsApi.createResource(projectId, {
        name: data.resource.name,
        type: data.resource.type,
        environmentId: environment.id,
        serverId: projectId,
        environmentVariables: data.resource.environmentVariables
      });

      if (!resource) {
        throw new Error('Failed to create resource');
      }

      toast({
        title: 'Success',
        description: 'Environment and resource created successfully'
      });

      onSuccess();
    } catch (error) {
      console.error('Wizard error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to complete setup'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fields = step === 1 
      ? ['environment.name', 'environment.type']
      : ['resource.name', 'resource.type'];

    const isValid = await form.trigger(fields as any);
    if (isValid) {
      setStep((s) => Math.min(s + 1, 2));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <Progress value={step === 1 ? 50 : 100} className="h-2" />
        <div className="mt-2 text-sm text-muted-foreground">
          Step {step} of 2: {step === 1 ? 'Environment Setup' : 'Resource Setup'}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Environment Setup</h2>
                <p className="text-sm text-muted-foreground">
                  Create an environment to organize your resources
                </p>
              </div>

              <FormField
                control={form.control}
                name="environment.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Production" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment.type"
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
                        <SelectItem value={EnvironmentType.STAGING}>Staging</SelectItem>
                        <SelectItem value={EnvironmentType.PROD}>Production</SelectItem>
                        <SelectItem value={EnvironmentType.TEST}>Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="environment.variables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment Variables</FormLabel>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Resource Setup</h2>
                <p className="text-sm text-muted-foreground">
                  Add your first resource to the environment
                </p>
              </div>

              <FormField
                control={form.control}
                name="resource.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Backend API" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resource.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select resource type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ServiceType.NODEJS}>Node.js</SelectItem>
                        <SelectItem value={ServiceType.PYTHON}>Python</SelectItem>
                        <SelectItem value={ServiceType.PHP}>PHP</SelectItem>
                        <SelectItem value={ServiceType.CUSTOM_DOCKER}>Docker</SelectItem>
                        <SelectItem value={ServiceType.SUPABASE}>Supabase</SelectItem>
                        <SelectItem value={ServiceType.POCKETBASE}>PocketBase</SelectItem>
                        <SelectItem value={ServiceType.APPWRITE}>AppWrite</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resource.environmentVariables"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resource Environment Variables</FormLabel>
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
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={step === 1 ? onCancel : prevStep}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              type={step === 2 ? 'submit' : 'button'}
              onClick={step === 1 ? nextStep : undefined}
              disabled={isLoading}
            >
              {step === 1 ? 'Next' : 'Create'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
} 