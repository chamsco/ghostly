import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { serversApi } from '@/services/api.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoCircledIcon } from '@radix-ui/react-icons';
//import { Server, CreateServerDto } from '@/types/server';
import { useNavigate } from 'react-router-dom';

const serverFormSchema = z.object({
  name: z.string().min(3, 'Server name must be at least 3 characters'),
  description: z.string().optional(),
  host: z.string().min(1, 'Host is required'),
  port: z.number().int().min(1).max(65535),
  username: z.string().min(1, 'Username is required'),
  privateKey: z.string().min(1, 'Private key is required'),
  isBuildServer: z.boolean().default(false),
  isSwarmManager: z.boolean().default(false),
  isSwarmWorker: z.boolean().default(false),
});

type ServerFormValues = z.infer<typeof serverFormSchema>;

interface ServerCreateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServerCreate({ open, onOpenChange }: ServerCreateProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ServerFormValues>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      port: 22,
      username: 'root',
      isBuildServer: false,
      isSwarmManager: false,
      isSwarmWorker: false,
    },
  });

  const handleSubmit = async (values: ServerFormValues) => {
    try {
      setIsLoading(true);
      
      // Create server first
      const server = await serversApi.create(values);
      if (!server) {
        throw new Error('Failed to create server');
      }

      // Test connection
      const connectionTest = await serversApi.checkConnection(server.id);
      if (!connectionTest.status) {
        // If connection fails, delete the server
        await serversApi.delete(server.id);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not establish connection to the server. Please check your credentials."
        });
        return;
      }

      toast({
        title: "Success",
        description: "Server created successfully"
      });
      navigate('/servers');
    } catch (error) {
      console.error('Server creation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create server"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-black text-white">
        <DialogHeader>
          <DialogTitle>New Server</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="khny-scarab-w4wo0gk" {...field} />
                  </FormControl>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>IP Address/Domain *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} />
                        <InfoCircledIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="port"
                render={({ field }) => (
                  <FormItem className="w-20">
                    <FormLabel>Port *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
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
                  <FormLabel>User *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  {field.value !== 'root' && (
                    <p className="text-yellow-500 text-sm">Non-root user is experimental: docs</p>
                  )}
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a private key" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="localhost">localhost's key</SelectItem>
                      <SelectItem value="new">Add new key...</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isBuildServer"
              render={({ field }) => (
                <FormItem className="flex items-start space-x-3 space-y-0 py-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use it as a build server?</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">Swarm</h4>
                <span className="rounded bg-gray-800 px-2 py-1 text-xs">experimental</span>
              </div>
              <p className="text-sm text-gray-400">Read the docs <a href="#" className="text-blue-500">here</a></p>

              <FormField
                control={form.control}
                name="isSwarmManager"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is it a Swarm Manager?</FormLabel>
                      <InfoCircledIcon className="inline-block ml-2 h-4 w-4 text-gray-400" />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isSwarmWorker"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0 py-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is it a Swarm Worker?</FormLabel>
                      <InfoCircledIcon className="inline-block ml-2 h-4 w-4 text-gray-400" />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isLoading}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 