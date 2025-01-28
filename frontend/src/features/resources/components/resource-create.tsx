import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface Props {
  projectId: string;
  environmentId: string;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function ResourceCreate({ 
  projectId, 
  environmentId,
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
        console.log('Navigating to new resource page');
        navigate(`/projects/${projectId}/environments/${environmentId}/new`);
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