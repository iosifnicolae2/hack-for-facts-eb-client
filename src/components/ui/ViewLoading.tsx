import { Skeleton } from '@/components/ui/skeleton';

type ViewLoadingProps = {
  title?: string;
  message?: string;
  className?: string;
};

/**
 * ViewLoading
 * A simplified, larger skeleton loader that suggests a dashboard layout.
 */
export function ViewLoading({
  title,
  message,
  className,
}: ViewLoadingProps) {
  return (
    <div className={`w-full space-y-8 ${className ?? ''}`}>
      <div className="space-y-4">
        {title && <Skeleton className="h-8 w-1/2 mx-auto" />}
        {message && <Skeleton className="h-4 w-3/4 mx-auto" />}
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
        </div>

        {/* Main Chart */}
        <Skeleton className="h-96 rounded-lg" />

        {/* Second Content Block */}
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}


