import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useServers } from '@/hooks/use-servers';

const serverFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().int().min(1).max(65535).default(22),
  username: z.string().min(1, 'Username is required'),
  privateKey: z.string().min(1, 'Private key is required'),
  isBuildServer: z.boolean().default(false),
  isSwarmManager: z.boolean().default(false),
  isSwarmWorker: z.boolean().default(false),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

interface ServerFormProps {
  onSuccess?: () => void;
}

export function ServerForm({ onSuccess }: ServerFormProps) {
  const { toast } = useToast();
  const { createServer } = useServers();

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      port: 22,
      isBuildServer: false,
      isSwarmManager: false,
      isSwarmWorker: false,
    },
  });

  const onSubmit = async (data: ServerFormValues) => {
    try {
      await createServer(data);
      toast({
        title: 'Success',
        description: 'Server created successfully',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create server',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Server Name</FormLabel>
              <FormControl>
                <Input placeholder="Production Server" {...field} />
              </FormControl>
              <FormDescription>
                A friendly name to identify your server
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="host"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Host</FormLabel>
                <FormControl>
                  <Input placeholder="example.com" {...field} />
                </FormControl>
                <FormDescription>
                  Server hostname or IP address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Port</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>
                  SSH port (default: 22)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="root" {...field} />
              </FormControl>
              <FormDescription>
                SSH username for server access
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privateKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Private Key</FormLabel>
              <FormControl>
                <Input
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                SSH private key for authentication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isBuildServer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Build Server</FormLabel>
                  <FormDescription>
                    This server will be used for building applications
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSwarmManager"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Swarm Manager</FormLabel>
                  <FormDescription>
                    This server will be a Docker Swarm manager node
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isSwarmWorker"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Swarm Worker</FormLabel>
                  <FormDescription>
                    This server will be a Docker Swarm worker node
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit">
            Create Server
          </Button>
        </div>
      </form>
    </Form>
  );
} 