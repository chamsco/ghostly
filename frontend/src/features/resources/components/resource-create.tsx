import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Resource } from "@/types/project";

interface Props {
  projectId: string;
  environmentId: string;
  serverId?: string;
  onResourceCreated?: (resource: Resource) => void;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function ResourceCreate({ 
  projectId, 
  environmentId,
  serverId,
  variant = "default", 
  className, 
  children 
}: Props) {
  const navigate = useNavigate();

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={() => {
        console.log('Navigating to new resource page', { projectId, environmentId, serverId });
        navigate(
          `/projects/${projectId}/environments/${environmentId}/new?server=${serverId || ''}&returnTo=${encodeURIComponent(`/projects/${projectId}`)}`
        );
      }}
    >
      {children || (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add Resource
        </>
      )}
    </Button>
  );
} 