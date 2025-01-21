/**
 * Application Providers
 * 
 * Exports a component that wraps the application with all necessary providers:
 * - Authentication
 * - Theme
 * - Projects
 * - Error boundaries
 * - Toast notifications
 */
import { AuthProvider } from '@/contexts/auth.context';
import { ProjectsProvider } from '@/contexts/projects.context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="squadron-theme">
        <AuthProvider>
          <ProjectsProvider>
            {children}
            <Toaster />
          </ProjectsProvider>
        </AuthProvider>
      </ThemeProvider>
    </AuthErrorBoundary>
  );
} 