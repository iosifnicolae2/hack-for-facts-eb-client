import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

/**
 * Skeleton for classification detail view
 */
export function ClassificationDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button skeleton */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Main info card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>

      {/* Children section skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Siblings section skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Skeleton for classification grid/list view
 */
export function ClassificationGridSkeleton() {
  return (
    <div className="space-y-4">
      {/* Stats bar skeleton */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3">
        <Skeleton className="h-4 w-32" />
      </div>

      {/* List skeleton */}
      <div className="rounded-lg border bg-card">
        <div className="divide-y">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-16 shrink-0" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-4 shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for the full page with header
 */
export function ClassificationPageSkeleton({ showHeader = true }: { readonly showHeader?: boolean }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-8">
        {showHeader && (
          <div className="mb-8 space-y-6">
            {/* Title and toggle skeleton */}
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
              <Skeleton className="h-10 w-64 shrink-0" />
            </div>

            {/* Search skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        )}

        <ClassificationGridSkeleton />
      </div>
    </div>
  )
}
