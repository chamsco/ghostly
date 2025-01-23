/**
 * Authentication Error Boundary Component
 * 
 * A specialized error boundary for handling authentication-related errors.
 * It provides specific error handling and recovery options for:
 * - Token expiration
 * - Invalid credentials
 * - Network errors during auth operations
 * - Session timeouts
 * 
 * Features:
 * - Catches auth-specific errors
 * - Provides contextual error messages
 * - Offers appropriate recovery actions
 * - Handles automatic logout on critical auth errors
 * - Preserves error details for debugging
 * 
 * Usage:
 * ```tsx
 * <AuthErrorBoundary>
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 * </AuthErrorBoundary>
 * ```
 */

import { Component, ErrorInfo, ReactNode } from 'react';
//import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { isAxiosError } from 'axios';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

type AuthErrorType = typeof AUTH_ERROR_TYPES[keyof typeof AUTH_ERROR_TYPES];

/**
 * Error types that can be handled specifically
 */
const AUTH_ERROR_TYPES = {
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTH_FAILED: 'AUTH_FAILED',
  API_ERROR: 'API_ERROR'
} as const;

export default class AuthErrorBoundary extends Component<Props, State> {
  /**
   * Initialize state with error tracking properties
   */
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  /**
   * Update state when an auth error occurs
   * This is called during the "render" phase
   */
  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Auth Error Boundary caught an error:', error);
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  /**
   * Handle auth errors and perform cleanup
   * This is called during the "commit" phase
   */
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log detailed error information
    console.group('🔍 Auth Error Details');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    // Log additional axios error details if available
    if (isAxiosError(error)) {
      console.error('API Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        }
      });
    }
    console.groupEnd();

    // Clear auth data on critical errors
    if (this.isCriticalAuthError(error)) {
      console.log('🔐 Clearing authentication data due to critical error');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('squadron:session');
      localStorage.removeItem('squadron:biometrics');
    }

    this.setState({
      error,
      errorInfo
    });

    // Show error toast with detailed message
    toast({
      variant: "destructive",
      title: "Authentication Error",
      description: this.getErrorMessage(error)
    });
  }

  /**
   * Check if the error is a critical auth error requiring session cleanup
   */
  private isCriticalAuthError(error: Error): boolean {
    // Check for specific error types
    const errorType = this.getErrorType(error);
    const criticalTypes: AuthErrorType[] = [
      AUTH_ERROR_TYPES.TOKEN_EXPIRED,
      AUTH_ERROR_TYPES.INVALID_TOKEN,
      AUTH_ERROR_TYPES.SESSION_EXPIRED
    ];
    const isCritical = criticalTypes.includes(errorType as AuthErrorType);

    console.log('🔍 Error type check:', { errorType, isCritical });
    return isCritical;
  }

  private getErrorType(error: Error): AuthErrorType {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) return AUTH_ERROR_TYPES.INVALID_TOKEN;
      if (error.response?.status === 403) return AUTH_ERROR_TYPES.SESSION_EXPIRED;
      if (!error.response) return AUTH_ERROR_TYPES.NETWORK_ERROR;
      return AUTH_ERROR_TYPES.API_ERROR;
    }
    return AUTH_ERROR_TYPES.AUTH_FAILED;
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getErrorMessage(error: Error): string {
    const errorType = this.getErrorType(error);
    
    // Get specific error message from API if available
    if (isAxiosError(error) && error.response?.data?.message) {
      return error.response.data.message;
    }

    // Default error messages
    switch (errorType) {
      case AUTH_ERROR_TYPES.TOKEN_EXPIRED:
        return 'Your session has expired. Please log in again.';
      case AUTH_ERROR_TYPES.INVALID_TOKEN:
        return 'Invalid authentication token. Please log in again.';
      case AUTH_ERROR_TYPES.SESSION_EXPIRED:
        return 'Your session has timed out due to inactivity.';
      case AUTH_ERROR_TYPES.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.';
      case AUTH_ERROR_TYPES.API_ERROR:
        return 'Server error. Please try again later.';
      case AUTH_ERROR_TYPES.AUTH_FAILED:
        return 'Authentication failed. Please check your credentials.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  }

  private handleRetry = () => {
    console.log('🔄 Attempting to retry...');
    window.location.reload();
  };

  private handleLoginRedirect = () => {
    console.log('↩️ Redirecting to login...');
    window.location.href = '/login';
  };

  /**
   * Render error UI or children
   * Shows appropriate error message and recovery options
   */
  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-2xl font-bold text-destructive mb-4">
              Authentication Error
            </h2>
            <p className="text-muted-foreground mb-6">
              {this.getErrorMessage(this.state.error!)}
            </p>
            <div className="space-x-4">
              <button
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                onClick={this.handleLoginRedirect}
              >
                Return to Login
              </button>
              <button
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
                onClick={this.handleRetry}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 