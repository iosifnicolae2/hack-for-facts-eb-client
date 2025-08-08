import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const EntityFinancialSummarySkeleton = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardContent>
            </Card>
        </section>
    );
};
