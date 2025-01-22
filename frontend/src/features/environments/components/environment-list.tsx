import { Environment } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projectsApi } from '@/services/api.service';
import { useToast } from '@/components/ui/use-toast';
import { EnvironmentVariablesEditor } from '@/components/environment-variables-editor';

interface Props {
  environments: Environment[];
  onEnvironmentUpdated: (environment: Environment) => void;
  onEnvironmentDeleted: (environmentId: string) => void;
}

export function EnvironmentList({ environments, onEnvironmentUpdated, onEnvironmentDeleted }: Props) {
  const { toast } = useToast();

  const handleDelete = async (environmentId: string) => {
    try {
      await projectsApi.deleteEnvironment(environmentId);
      onEnvironmentDeleted(environmentId);
      toast({
        title: "Success",
        description: "Environment deleted successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete environment",
        variant: "destructive"
      });
    }
  };

  const handleVariablesChange = async (environmentId: string, variables: Environment['variables']) => {
    try {
      const environment = await projectsApi.updateEnvironment(environmentId, { variables });
      if (environment) {
        onEnvironmentUpdated(environment);
        toast({
          title: "Success",
          description: "Environment variables updated successfully"
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update environment variables",
        variant: "destructive"
      });
    }
  };

  if (environments.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No environments created yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {environments.map(environment => (
        <Card key={environment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{environment.name}</CardTitle>
                <CardDescription>
                  {environment.variables.length} environment variables
                </CardDescription>
              </div>
              <Button
                variant="destructive"
                onClick={() => handleDelete(environment.id)}
              >
                Delete
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <EnvironmentVariablesEditor
              value={environment.variables}
              onChange={(vars) => handleVariablesChange(environment.id, vars)}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 