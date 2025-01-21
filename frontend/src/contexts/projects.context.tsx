/**
 * Projects Context
 * 
 * Provides project state management and operations across the application:
 * - List projects
 * - Create new projects
 * - Refresh project list
 * - Handle loading and error states
 */
import { createContext, useContext, useState, useEffect } from 'react';
import { Project, CreateProjectDto } from '@/types/project';
import { projectsApi } from '@/services/api.service';

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (data: CreateProjectDto) => Promise<Project>;
  refreshProjects: () => Promise<void>;
}

const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.list();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (data: CreateProjectDto) => {
    try {
      const project = await projectsApi.create(data);
      setProjects(prev => [...prev, project]);
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  // Load projects on mount
  useEffect(() => {
    refreshProjects();
  }, []);

  return (
    <ProjectsContext.Provider value={{
      projects,
      loading,
      error,
      createProject,
      refreshProjects
    }}>
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within ProjectsProvider');
  }
  return context;
}; 