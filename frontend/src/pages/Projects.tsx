import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Settings, MoreVertical, AlertCircle } from 'lucide-react';
import { projectsApi } from '@/lib/axios';
import type { Project } from '@/types/project';
import { ProjectStatus } from '@/types/project';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state before fetching
        const data = await projectsApi.getProjects();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.RUNNING:
        return 'text-green-500';
      case ProjectStatus.STOPPED:
        return 'text-yellow-500';
      case ProjectStatus.FAILED:
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold">Error Loading Projects</h3>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Folder className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{project.name}</h3>
                  <p className="text-sm text-muted-foreground">{project.type}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    Delete Project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`capitalize ${getStatusColor(project.status)}`}>
                  {project.status.toLowerCase()}
                </span>
                <span className="text-muted-foreground">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {projects.length === 0 && !isLoading && !error && (
          <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create your first project to get started.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="col-span-3 flex justify-center">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-8 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 