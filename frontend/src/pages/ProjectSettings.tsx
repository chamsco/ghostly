import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { projectsApi } from '@/services/api.service';
import type { Project } from '@/types/project';

export function ProjectSettings() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const data = await projectsApi.findOne(id);
        setProject(data);
        setName(data.name);
        setDescription(data.description ?? '');
      } catch (error) {
        console.error('Failed to fetch project:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch project details"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !project) return;

    try {
      setIsSaving(true);
      await projectsApi.update(id, {
        name,
        description
      });
      toast({
        title: "Success",
        description: "Project settings updated"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update project settings",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !project) return;
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) return;

    try {
      await projectsApi.delete(id);
      toast({
        title: "Success",
        description: "Project deleted"
      });
      navigate('/projects');
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
    }
  };

  if (isLoading || !project) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Project Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label>Created On</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Resources</Label>
              <p className="text-sm text-muted-foreground">
                {project.resources.length} Resource{project.resources.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Environments</Label>
              <p className="text-sm text-muted-foreground">
                {project.environments.length} Environment{project.environments.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>

        <div className="flex justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Project
          </Button>
          <div className="space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 