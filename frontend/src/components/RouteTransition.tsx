/**
 * Route Transition Component
 * 
 * Handles loading states between route changes by:
 * - Showing a loading screen during transitions
 * - Using a small delay to prevent flashing
 * - Cleaning up timeouts on unmount
 * 
 * Example usage:
 * ```tsx
 * <RouteTransition>
 *   <ProtectedRoute>
 *     <Component />
 *   </ProtectedRoute>
 * </RouteTransition>
 * ```
 */
import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { LoadingScreen } from '@/components/LoadingScreen';

interface Props {
  children: ReactNode;
}

export function RouteTransition({ children }: Props) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    // Start transition when location changes
    setIsTransitioning(true);
    
    // Set a timeout to end the transition
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 300); // 300ms is usually enough for a smooth transition
    
    // Cleanup timeout on unmount or when location changes again
    return () => clearTimeout(timer);
  }, [location.pathname]); // Only trigger on pathname changes
  
  if (isTransitioning) {
    return <LoadingScreen message="Loading..." />;
  }
  
  return <>{children}</>;
} 