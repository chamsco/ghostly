/**
 * Project Detail Page
 * 
 * Displays detailed information about a project and provides actions:
 * - Project status and error messages
 * - Environment variables
 * - Start/Stop project
 * - Delete project
 * - Loading and error states
 * - Auto-refresh project status
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Square, Trash2 } from 'lucide-react';
import { useProjects } from '@/contexts/projects.context';
import { Project, ProjectStatus } from '@/types/project';
import { projectsApi } from '@/services/api.service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Fetch project details
  const fetchProject = async () => {
    try {
      if (!id) return;
      const data = await projectsApi.get(id);
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  // Refresh project details every 10 seconds if deploying
  useEffect(() => {
    fetchProject();
    
    let interval: NodeJS.Timeout | null = null;
    if (project?.status === ProjectStatus.DEPLOYING) {
      interval = setInterval(fetchProject, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, project?.status]);

  // Handle project actions
  const handleStart = async () => {
    try {
      setIsActionInProgress(true);
      const updated = await projectsApi.start(id!);
      setProject(updated);
      toast({
        title: 'Project started',
        description: 'The project is now starting up...'
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to start project',
        description: err instanceof Error ? err.message : 'An error occurred'
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsActionInProgress(true);
      const updated = await projectsApi.stop(id!);
      setProject(updated);
      toast({
        title: 'Project stopped',
        description: 'The project has been stopped'
      });
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to stop project',
        description: err instanceof Error ? err.message : 'An error occurred'
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsActionInProgress(true);
      await projectsApi.delete(id!);
      toast({
        title: 'Project deleted',
        description: 'The project has been permanently deleted'
      });
      navigate('/projects');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete project',
        description: err instanceof Error ? err.message : 'An error occurred'
      });
      setIsActionInProgress(false);
    }
  };

  // Get status color based on project status
  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.RUNNING:
        return 'bg-green-500';
      case ProjectStatus.DEPLOYING:
        return 'bg-blue-500';
      case ProjectStatus.STOPPED:
        return 'bg-gray-500';
      case ProjectStatus.FAILED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Card>
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error || 'Project not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <div className="space-x-2">
          {project.status === ProjectStatus.RUNNING ? (
            <Button 
              variant="outline" 
              onClick={handleStop}
              disabled={isActionInProgress}
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button 
              variant="outline" 
              onClick={handleStart}
              disabled={isActionInProgress || project.status === ProjectStatus.DEPLOYING}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isActionInProgress}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
            <span>{project.status}</span>
          </div>
          {project.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{project.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {project.environmentVariables && Object.keys(project.environmentVariables).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(project.environmentVariables).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-secondary rounded">
                  <span className="font-mono">{key}</span>
                  <Badge variant="outline">{value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isActionInProgress}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isActionInProgress}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 