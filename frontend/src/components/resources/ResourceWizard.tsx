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
import { resourcesApi } from '@/services/resources-api';
import {
  ResourceType,
  VCSConfig
} from '@/types/resource';

// Validation schemas for each step
const environmentSchema = z.object({
  environment: z.enum(['development', 'staging', 'production'] as const),
});

const resourceTypeSchema = z.object({
  resourceType: z.nativeEnum(ResourceType),
});

const githubConfigSchema = z.object({
  repositoryUrl: z.string()
    .url('Please enter a valid URL')
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+(\/)?$/, 'Please enter a valid GitHub repository URL'),
  branch: z.string().min(1, 'Branch name is required'),
});

const deploymentTargetSchema = z.object({
  target: z.enum(['localhost', 'kubernetes', 'aws'] as const),
  port: z.string().regex(/^\d+$/, 'Port must be a number').optional(),
});

// Combined schema for the entire form
const formSchema = z.object({
  ...environmentSchema.shape,
  ...resourceTypeSchema.shape,
  ...githubConfigSchema.shape,
  ...deploymentTargetSchema.shape,
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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      environment: 'development',
      resourceType: ResourceType.GITHUB,
      repositoryUrl: '',
      branch: 'main',
      target: 'localhost',
      port: '3000'
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Create a properly typed VCSConfig
      const config: VCSConfig = {
        repositoryUrl: data.repositoryUrl,
        branch: data.branch,
        target: data.target,
        ...(data.target === 'localhost' && { port: data.port })
      };

      await resourcesApi.create(projectId, {
        name: `${data.resourceType.toLowerCase()}-${data.environment}`,
        type: data.resourceType,
        environment: data.environment,
        config
      });
      
      toast({
        title: 'Success',
        description: 'Resource created successfully',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Failed to create resource:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create resource. Please try again.',
      });
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setStep((s) => Math.min(s + 1, 4));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <FormField
              control={form.control}
              name="environment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select environment" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {step === 2 && (
            <FormField
              control={form.control}
              name="resourceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select resource type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ResourceType.GITHUB}>GitHub</SelectItem>
                      <SelectItem value={ResourceType.GITLAB} disabled>GitLab (Coming Soon)</SelectItem>
                      <SelectItem value={ResourceType.BITBUCKET} disabled>Bitbucket (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {step === 3 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="repositoryUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>GitHub Repository URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://github.com/user/repo" {...field} />
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
                      <Input placeholder="main" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="target"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deployment Target</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select deployment target" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="localhost">Localhost</SelectItem>
                        <SelectItem value="kubernetes" disabled>Kubernetes (Coming Soon)</SelectItem>
                        <SelectItem value="aws" disabled>AWS (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('target') === 'localhost' && (
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
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
              type={step === 4 ? 'submit' : 'button'}
              onClick={step === 4 ? undefined : nextStep}
            >
              {step === 4 ? 'Create Resource' : 'Next'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
} 