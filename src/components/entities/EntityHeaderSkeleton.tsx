import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const EntityHeaderSkeleton = ({ className }: { className?: string }) => {
    return (
        <header className={cn("bg-slate-50 dark:bg-slate-800 p-6 rounded-lg shadow-md", className)}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-grow">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
                <div className="flex-shrink-0">
                    <Skeleton className="h-10 w-[110px]" />
                </div>
            </div>
            <div className="mt-4">
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                <Skeleton className="h-8 w-1/4 mb-2" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        </header>
    );
};
