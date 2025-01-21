/**
 * Spinner Component
 * 
 * A loading spinner component with:
 * - Size variants (sm, md, lg)
 * - Color variants (default, primary)
 * - Customizable text
 * - Accessibility support
 */
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary';
  text?: string;
  className?: string;
}

export function Spinner({ 
  size = 'md', 
  variant = 'default',
  text,
  className 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4'
  };

  const variantClasses = {
    default: 'border-muted-foreground/20 border-t-muted-foreground',
    primary: 'border-primary/20 border-t-primary'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={cn(
          "animate-spin rounded-full",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
} 