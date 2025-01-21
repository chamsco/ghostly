/**
 * Error Boundary Component
 * 
 * A class component that catches JavaScript errors anywhere in its child component tree.
 * It provides graceful error handling and fallback UI when errors occur in production.
 * 
 * Features:
 * - Catches render, lifecycle, and event handler errors
 * - Prevents UI from breaking completely
 * - Provides error details in development
 * - Shows user-friendly error message in production
 * - Allows users to attempt recovery by refreshing
 * 
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  /**
   * Initialize state with error tracking properties
   */
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  /**
   * Update state when an error occurs
   * This is called during the "render" phase, so side-effects are not permitted
   */
  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * Log error details when they occur
   * This is called during the "commit" phase, so side-effects are permitted
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });
  }

  /**
   * Render error UI or children
   * Shows detailed error in development, simple message in production
   */
  public render() {
    if (this.state.hasError) {
      // Development error view with details
      if (process.env.NODE_ENV === 'development') {
        return (
          <div className="p-4">
            <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <details className="whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
              <br />
              {this.state.errorInfo?.componentStack}
            </details>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
          </div>
        );
      }

      // Production error view with simple message
      return (
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold mb-4">Oops! Something went wrong</h1>
          <p className="mb-4">We're sorry for the inconvenience. Please try refreshing the page.</p>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 