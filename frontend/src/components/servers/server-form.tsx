import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ProjectType } from '@/types/project';
import { CreateServerDto } from '@/types/server';
import { useServers } from '@/hooks/use-servers';

const serverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  host: z.string().min(1, 'IP Address/Domain is required'),
  port: z.number().int().min(1).max(65535).default(22),
  username: z.string().min(1, 'Username is required').default('root'),
  privateKey: z.string().min(1, 'Private Key is required'),
  isBuildServer: z.boolean().default(false),
  isSwarmManager: z.boolean().default(false),
  isSwarmWorker: z.boolean().default(false),
  supportedTypes: z.array(z.nativeEnum(ProjectType)).default([])
});

type ServerFormData = z.infer<typeof serverSchema>;

interface ServerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServerForm({ onSuccess, onCancel }: ServerFormProps) {
  const { createServer } = useServers();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ServerFormData>({
    resolver: zodResolver(serverSchema),
    defaultValues: {
      port: 22,
      username: 'root',
      isBuildServer: false,
      isSwarmManager: false,
      isSwarmWorker: false,
      supportedTypes: []
    }
  });

  const onSubmit = async (data: ServerFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      await createServer(data as CreateServerDto);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="shiny-scarab-w4w00gk"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder="Optional server description"
          />
        </div>

        <div>
          <Label htmlFor="host">IP Address/Domain *</Label>
          <Input
            id="host"
            {...register('host')}
            placeholder="192.168.1.100 or example.com"
          />
          {errors.host && (
            <p className="text-sm text-red-500">{errors.host.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="port">Port *</Label>
          <Input
            id="port"
            type="number"
            {...register('port', { valueAsNumber: true })}
          />
          {errors.port && (
            <p className="text-sm text-red-500">{errors.port.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="username">User *</Label>
          <Input
            id="username"
            {...register('username')}
          />
          <p className="text-sm text-gray-500">Non-root user is experimental: docs</p>
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="privateKey">Private Key</Label>
          <Input
            id="privateKey"
            {...register('privateKey')}
            placeholder="localhost's key"
          />
          {errors.privateKey && (
            <p className="text-sm text-red-500">{errors.privateKey.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isBuildServer"
            {...register('isBuildServer')}
          />
          <Label htmlFor="isBuildServer">Use it as a build server?</Label>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Swarm (experimental)</h3>
          <p className="text-sm text-gray-500">Read the docs <a href="#" className="text-blue-500">here</a></p>

          <div className="flex items-center space-x-2">
            <Switch
              id="isSwarmManager"
              {...register('isSwarmManager')}
            />
            <Label htmlFor="isSwarmManager">Is it a Swarm Manager?</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isSwarmWorker"
              {...register('isSwarmWorker')}
              disabled={watch('isSwarmManager')}
            />
            <Label htmlFor="isSwarmWorker">Is it a Swarm Worker?</Label>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Continue'}
        </Button>
      </div>
    </form>
  );
} 