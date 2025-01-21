/**
 * Skeleton Component
 * 
 * A placeholder loading state that mimics the shape of content:
 * - Used during data fetching
 * - Provides visual feedback
 * - Prevents layout shift
 */
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  );
} 