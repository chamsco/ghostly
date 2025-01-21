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
import ErrorBoundary from '@/components/ErrorBoundary';
import '@/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>
); 