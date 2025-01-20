import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Folder, Settings, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
                  <p className="text-sm text-muted-foreground">{project.description}</p>
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
                <span className={`capitalize ${
                  project.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {project.status}
                </span>
                <span className="text-muted-foreground">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {projects.length === 0 && !loading && (
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
      </div>
    </div>
  );
} 