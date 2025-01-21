/**
 * Project List Page
 * 
 * Displays a list of all projects with their status and quick actions.
 * Features:
 * - Project cards with status indicators
 * - Quick actions (view details)
 * - Create new project button
 * - Loading and error states
 * - Auto-refresh project list
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useProjects } from '@/contexts/projects.context';
import { ProjectType, ProjectStatus } from '@/types/project';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, loading, error, refreshProjects } = useProjects();

  // Refresh projects every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProjects();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshProjects]);

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

  // Get project type label
  const getTypeLabel = (type: ProjectType) => {
    switch (type) {
      case ProjectType.SUPABASE:
        return 'Supabase';
      case ProjectType.POCKETBASE:
        return 'PocketBase';
      case ProjectType.WEBSITE:
        return 'Website';
      case ProjectType.SERVICE:
        return 'Service';
      default:
        return type;
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Projects</h1>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => navigate('/projects/new')}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No projects found. Create your first project to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/projects/${project.id}`)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  <Badge variant="secondary">{getTypeLabel(project.type)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                  <span className="text-sm text-gray-500">{project.status}</span>
                </div>
                {project.error && (
                  <p className="text-sm text-red-500 mt-2">{project.error}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 