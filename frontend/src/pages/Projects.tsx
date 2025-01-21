import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Folder, Settings, MoreVertical, AlertCircle, Play, Square, Trash2 } from 'lucide-react';
import { projectsApi } from '@/services/api.service';
import type { Project } from '@/types/project';
import { ProjectType, ProjectStatus } from '@/types/project';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

export function Projects() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ProjectType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await projectsApi.list();
        setProjects(data);
        setFilteredProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    let result = [...projects];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(project =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(project => project.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }

    setFilteredProjects(result);
  }, [projects, searchQuery, typeFilter, statusFilter]);

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

  const handleStartProject = async (projectId: string) => {
    try {
      await projectsApi.start(projectId);
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? { ...project, status: ProjectStatus.RUNNING }
          : project
      );
      setProjects(updatedProjects);
      toast({
        title: "Success",
        description: "Project started successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to start project",
        variant: "destructive"
      });
    }
  };

  const handleStopProject = async (projectId: string) => {
    try {
      await projectsApi.stop(projectId);
      const updatedProjects = projects.map(project =>
        project.id === projectId
          ? { ...project, status: ProjectStatus.STOPPED }
          : project
      );
      setProjects(updatedProjects);
      toast({
        title: "Success",
        description: "Project stopped successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to stop project",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await projectsApi.delete(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
      toast({
        title: "Success",
        description: "Project deleted successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
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
        <Button onClick={() => navigate('/projects/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(value: ProjectType | 'all') => setTypeFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={ProjectType.DATABASE}>Database</SelectItem>
            <SelectItem value={ProjectType.SERVICE}>Service</SelectItem>
            <SelectItem value={ProjectType.WEBSITE}>Website</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value: ProjectStatus | 'all') => setStatusFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value={ProjectStatus.RUNNING}>Running</SelectItem>
            <SelectItem value={ProjectStatus.STOPPED}>Stopped</SelectItem>
            <SelectItem value={ProjectStatus.FAILED}>Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filteredProjects.map((project) => (
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
                  {project.status === ProjectStatus.STOPPED && (
                    <DropdownMenuItem onClick={() => handleStartProject(project.id)}>
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </DropdownMenuItem>
                  )}
                  {project.status === ProjectStatus.RUNNING && (
                    <DropdownMenuItem onClick={() => handleStopProject(project.id)}>
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/settings`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
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

        {filteredProjects.length === 0 && !isLoading && !error && (
          <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <Folder className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {projects.length === 0
                ? "Create your first project to get started."
                : "Try adjusting your filters to find what you're looking for."}
            </p>
            {projects.length === 0 && (
              <Button className="mt-4" onClick={() => navigate('/projects/create')}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            )}
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