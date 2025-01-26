import { useEffect, useRef } from 'react';
import { resourcesApi } from '@/services/resources-api';
import { ProjectStatus } from '@/types/resource';

export function useResourceStatusPolling(projectId: string, resourceId: string) {
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start polling every 5 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const { status } = await resourcesApi.getStatus(projectId, resourceId);
        
        // If the resource is in a final state, stop polling
        if ([
          ProjectStatus.RUNNING,
          ProjectStatus.STOPPED,
          ProjectStatus.FAILED,
          ProjectStatus.ERROR
        ].includes(status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
        // Stop polling on error
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [projectId, resourceId]);
} 