/**
 * Application Providers
 * 
 * Wraps the application with all necessary providers:
 * - Theme provider for dark/light mode
 * - Auth provider for authentication
 * - Projects provider for project management
 * - Error boundaries for error handling
 * - Toast notifications for feedback
 */
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth.context';
import { ProjectsProvider } from '@/contexts/projects.context';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/routes';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="squadron-theme">
          <AuthProvider>
            <ProjectsProvider>
              {children}
              <Toaster />
            </ProjectsProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthErrorBoundary>
  );
} 
