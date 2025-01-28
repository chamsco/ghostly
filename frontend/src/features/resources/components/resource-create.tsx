import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { projectsApi } from "@/services/api.service";
import { ServiceType, Resource } from "@/types/project";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { EnvironmentVariablesEditor } from "@/components/environment-variables-editor";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
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

type FormValues = z.infer<typeof formSchema>;

interface Props {
  projectId: string;
  environmentId: string;
  serverId?: string;
  onResourceCreated?: (resource: Resource) => void;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function ResourceCreate({ 
  projectId, 
  environmentId, 
  serverId,
  onResourceCreated,
  variant = "default", 
  className, 
  children 
}: Props) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: ServiceType.NODEJS,
      environmentVariables: []
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const resourceData = {
        name: data.name,
        type: data.type,
        environmentId,
        serverId: serverId || projectId,
        environmentVariables: data.environmentVariables.map(({ key, value, isSecret }) => ({
          key,
          value,
          isSecret
        }))
      };

      const resource = await projectsApi.createResource(projectId, resourceData);
      onResourceCreated?.(resource);
      toast({
        title: "Success",
        description: "Resource created successfully"
      });
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating resource:", error);
      toast({
        title: "Error",
        description: "Failed to create resource",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          className={className}
          onClick={() => {
            console.log('Resource create button clicked');
            setIsOpen(true);
          }}
        >
          {children || (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Resource
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Resource</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
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
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="environmentVariables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Environment Variables</FormLabel>
                  <FormControl>
                    <EnvironmentVariablesEditor
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Create Resource</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 