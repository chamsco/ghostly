import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AuthErrorFallback error={this.state.error} />
      );
    }

    return this.props.children;
  }
}

function AuthErrorFallback({ error }: { error: Error | null }) {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    // Clear any auth-related data from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Redirect to login
    navigate('/login');
    
    // Reload the page to reset all states
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-destructive mb-4">Authentication Error</h2>
        <p className="text-muted-foreground mb-6">
          {error?.message || 'An authentication error occurred'}
        </p>
        <div className="space-x-4">
          <Button onClick={handleRetry} variant="default">
            Retry
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default AuthErrorBoundary; 