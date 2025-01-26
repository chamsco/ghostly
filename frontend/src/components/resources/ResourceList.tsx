import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { resourcesApi } from '@/services/resources-api';
import { Resource, ResourceType, ProjectStatus, VCSConfig } from '@/types/resource';
import { Badge } from '@/components/ui/badge';
import { ReloadIcon, PlayIcon, StopIcon, TrashIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';
import { useResourceStatusPolling } from '@/hooks/use-resource-status';

interface ResourceListProps {
  projectId: string;
  onDelete?: (resourceId: string) => void;
}

export function ResourceList({ projectId, onDelete }: ResourceListProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deployingResources, setDeployingResources] = useState<Set<string>>(new Set());
  const [stoppingResources, setStoppingResources] = useState<Set<string>>(new Set());

  const statusColors: Record<ProjectStatus, string> = {
    [ProjectStatus.CREATED]: 'bg-gray-100 text-gray-800',
    [ProjectStatus.DEPLOYING]: 'bg-yellow-100 text-yellow-800',
    [ProjectStatus.RUNNING]: 'bg-green-100 text-green-800',
    [ProjectStatus.STOPPED]: 'bg-gray-100 text-gray-800',
    [ProjectStatus.FAILED]: 'bg-red-100 text-red-800',
    [ProjectStatus.ERROR]: 'bg-red-100 text-red-800'
  };

  const typeIcons: Record<ResourceType, string> = {
    [ResourceType.DATABASE]: '🗄️',
    [ResourceType.SERVICE]: '⚙️',
    [ResourceType.WEBSITE]: '🌐',
    [ResourceType.GITHUB]: '🐙',
    [ResourceType.GITLAB]: '🦊',
    [ResourceType.BITBUCKET]: '🪣'
  };

  const loadResources = async () => {
    try {
      const data = await resourcesApi.findAll(projectId);
      setResources(data);
      setError(null);
    } catch (err) {
      setError('Failed to load resources');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async (resourceId: string) => {
    setDeployingResources(prev => new Set([...prev, resourceId]));
    try {
      await resourcesApi.deploy(projectId, resourceId);
      toast.success('Resource deployment started');
      await loadResources();
    } catch (err) {
      toast.error('Failed to deploy resource');
    } finally {
      setDeployingResources(prev => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
    }
  };

  const handleStop = async (resourceId: string) => {
    setStoppingResources(prev => new Set([...prev, resourceId]));
    try {
      await resourcesApi.stop(projectId, resourceId);
      toast.success('Resource stopped successfully');
      await loadResources();
    } catch (err) {
      toast.error('Failed to stop resource');
    } finally {
      setStoppingResources(prev => {
        const next = new Set(prev);
        next.delete(resourceId);
        return next;
      });
    }
  };

  const handleDelete = async (resourceId: string) => {
    try {
      await resourcesApi.remove(projectId, resourceId);
      toast.success('Resource deleted successfully');
      onDelete?.(resourceId);
      await loadResources();
    } catch (err) {
      toast.error('Failed to delete resource');
    }
  };

  useEffect(() => {
    loadResources();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadResources}>Retry</Button>
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No resources found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resources.map((resource) => {
        const isDeploying = deployingResources.has(resource.id);
        const isStopping = stoppingResources.has(resource.id);
        const isRunning = resource.status === 'running';
        const isVCS = ['github', 'gitlab', 'bitbucket'].includes(resource.type);
        const vcsConfig = isVCS ? resource.config as VCSConfig : null;

        // Start polling for status updates when resource is deploying or stopping
        if (isDeploying || isStopping) {
          useResourceStatusPolling(projectId, resource.id);
        }

        return (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{typeIcons[resource.type]}</span>
                <CardTitle>{resource.name}</CardTitle>
                <Badge variant="outline" className={statusColors[resource.status]}>
                  {resource.status}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  disabled={isDeploying || isRunning}
                  onClick={() => handleDeploy(resource.id)}
                >
                  {isDeploying ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Deploying
                    </>
                  ) : (
                    <>
                      <PlayIcon className="mr-2 h-4 w-4" />
                      Deploy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isStopping || !isRunning}
                  onClick={() => handleStop(resource.id)}
                >
                  {isStopping ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Stopping
                    </>
                  ) : (
                    <>
                      <StopIcon className="mr-2 h-4 w-4" />
                      Stop
                    </>
                  )}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(resource.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Environment</p>
                  <p className="capitalize">{resource.environment.toLowerCase()}</p>
                </div>
                {vcsConfig && (
                  <>
                    {vcsConfig.target && (
                      <div>
                        <p className="text-muted-foreground">Deployment Target</p>
                        <p className="capitalize">{vcsConfig.target}</p>
                      </div>
                    )}
                    {vcsConfig.port && (
                      <div>
                        <p className="text-muted-foreground">Port</p>
                        <p>{vcsConfig.port}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Repository</p>
                      <p className="truncate">{vcsConfig.repositoryUrl}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Branch</p>
                      <p>{vcsConfig.branch}</p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 