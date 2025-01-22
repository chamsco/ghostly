import { Resource } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectsApi } from '@/services/api.service';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  resources: Resource[];
  onResourceUpdated: (resource: Resource) => void;
  onResourceDeleted: (resourceId: string) => void;
}

export function ResourceList({ resources, onResourceUpdated, onResourceDeleted }: Props) {
  const { toast } = useToast();

  const handleDelete = async (resourceId: string) => {
    try {
      await projectsApi.deleteResource(resourceId);
      onResourceDeleted(resourceId);
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete resource",
        variant: "destructive"
      });
    }
  };

  if (resources.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        No resources added yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map(resource => (
        <Card key={resource.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{resource.name}</h4>
                    <Badge>{resource.type}</Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  {resource.type}
                  {resource.databaseType && ` - ${resource.databaseType}`}
                  {resource.serviceType && ` - ${resource.serviceType}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{resource.name}</h4>
                <Badge>{resource.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Type: {resource.type}
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => onResourceUpdated(resource)}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(resource.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 