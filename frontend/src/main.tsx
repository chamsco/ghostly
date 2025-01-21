/**
 * Main Entry Point
 * 
 * This is the main entry point of the React application:
 * - Renders the root App component
 * - Mounts it to the DOM
 * - Enables React's Strict Mode for development best practices
 * - Provides context providers for authentication and projects
 * - Provides theme support
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import { AuthProvider } from '@/contexts/auth.context';
import { ProjectsProvider } from '@/contexts/projects.context';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';
import AuthErrorBoundary from '@/components/auth/AuthErrorBoundary';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthErrorBoundary>
        <ThemeProvider defaultTheme="dark" storageKey="squadron-theme">
          <AuthProvider>
            <ProjectsProvider>
              <RouterProvider router={router} />
              <Toaster />
            </ProjectsProvider>
          </AuthProvider>
        </ThemeProvider>
      </AuthErrorBoundary>
    </ErrorBoundary>
  </React.StrictMode>
); 