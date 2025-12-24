import { t } from '@lingui/core/macro'
import { BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function LessonSkeleton() {
  return (
    <div className="animate-in fade-in duration-300 space-y-8">
      {/* Title skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
      </div>

      {/* Intro paragraph */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-4/5 rounded" />
      </div>

      {/* Blockquote/callout skeleton */}
      <div className="border-l-4 border-muted pl-6 py-4 space-y-2">
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>

      {/* Section heading */}
      <Skeleton className="h-8 w-2/3 rounded-lg" />

      {/* Content paragraphs */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
      </div>

      {/* Interactive component placeholder */}
      <div className="my-8">
        <Skeleton className="h-64 w-full rounded-4xl" />
      </div>

      {/* Table skeleton */}
      <div className="my-8 p-6 rounded-4xl bg-muted/30">
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-8 w-full rounded" />
          <Skeleton className="h-8 w-full rounded" />
        </div>
      </div>

      {/* Quiz skeleton */}
      <div className="my-8">
        <Skeleton className="h-48 w-full rounded-4xl" />
      </div>

      {/* Loading indicator */}
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BookOpen className="h-5 w-5 animate-pulse" />
          <span className="text-sm font-medium">{t`Loading lesson content...`}</span>
        </div>
      </div>
    </div>
  )
}
