import { Skeleton } from '@/components/ui/skeleton';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ViewLoadingProps = {
  title?: string;
  message?: string;
  lines?: number;
  className?: string;
  fullHeight?: boolean;
};

/**
 * ViewLoading
 * Lightweight, reusable loading state for Suspense fallbacks in views.
 * Renders a spinner and a few skeleton lines to hint upcoming content.
 */
export function ViewLoading({
  title,
  message,
  lines = 3,
  className,
  fullHeight = false,
}: ViewLoadingProps) {
  const skeletonLines = Array.from({ length: Math.max(1, lines) });
  return (
    <div className={`w-full ${fullHeight ? 'min-h-[50vh]' : ''} flex flex-col items-center justify-center gap-6 ${className ?? ''}`}>
      <LoadingSpinner text={title ?? 'Loading…'} />
      {message && <p className="text-sm text-muted-foreground text-center px-4">{message}</p>}
      <div className="w-full max-w-3xl flex flex-col gap-3 px-4">
        {skeletonLines.map((_, idx) => (
          <Skeleton key={idx} className={idx === 0 ? 'h-6 w-3/4' : 'h-4 w-full'} />
        ))}
      </div>
    </div>
  );
}


