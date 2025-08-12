import { Skeleton } from "@/components/ui/skeleton";

export const EntityAnalyticsLineItemsSkeleton = ({ itemCount = 8 }: { itemCount?: number }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-8 w-1/4" />
            </div>
            <div className="space-y-2">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        </div>
    );
};
