import { Skeleton } from "@/components/ui/skeleton";

export function ChartPreviewSkeleton() {
    return (
        <div className="w-full h-[24rem] flex flex-col items-center justify-center space-y-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
        </div>
    );
} 