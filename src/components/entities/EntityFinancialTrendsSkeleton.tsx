import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const EntityFinancialTrendsSkeleton = () => {
    return (
        <Card className="mb-8">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-1/4" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-8 w-24" />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[26rem] w-full" />
            </CardContent>
        </Card>
    );
};
