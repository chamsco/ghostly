/**
 * Loading Screen Component
 * 
 * A full-screen loading component that displays:
 * - Centered spinner
 * - Optional loading message
 * - Brand logo/name
 */
import { Spinner } from "@/components/ui/spinner";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Loading..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        {/* Brand/Logo could go here */}
        <h1 className="text-2xl font-semibold tracking-tight">Squadron</h1>
        <Spinner 
          size="lg"
          variant="primary"
          text={message}
        />
      </div>
    </div>
  );
} 