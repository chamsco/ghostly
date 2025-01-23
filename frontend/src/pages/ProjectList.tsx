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
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { projectsApi } from '@/services/api.service';
import type { Project } from '@/types/project';
import { toast } from '@/components/ui/use-toast';

export function ProjectList() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const data = await projectsApi.findAll();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch projects"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link to="/projects/create">
          <Button>Create Project</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{project.name}</h2>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <Link to={`/projects/${project.id}`}>
                <Button variant="outline">View Details</Button>
              </Link>
            </div>
            <div className="mt-4 flex items-center gap-4">
              <Badge variant="secondary">
                {project.resources.length} Resource{project.resources.length !== 1 ? 's' : ''}
              </Badge>
              <Badge variant="secondary">
                {project.environments.length} Environment{project.environments.length !== 1 ? 's' : ''}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created on {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </Card>
        ))}

        {projects.length === 0 && (
          <Card className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">No projects yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first project to get started
              </p>
              <Link to="/projects/create">
                <Button className="mt-4">Create Project</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 