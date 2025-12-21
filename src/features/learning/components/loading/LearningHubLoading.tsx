import { t } from '@lingui/core/macro'
import { GraduationCap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function LearningHubLoading() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-xl mx-auto space-y-10 animate-in fade-in duration-500">
        {/* Logo/Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center animate-pulse">
            <GraduationCap className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
            {t`Loading Academy`}
          </span>
        </div>

        {/* Skeleton content */}
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
          <Skeleton className="h-6 w-1/2 mx-auto rounded-lg" />
        </div>

        <div className="space-y-4 pt-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
