import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const TrendsViewSkeleton = () => {
    return (
        <div className="space-y-8">
            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-40" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Skeleton className="h-8 w-24 rounded-md" />
                            <Skeleton className="h-8 w-24 rounded-md" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[600px]" />
                </CardContent>
            </Card>

            <Card className="shadow-sm border-l-4 border-l-primary/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5 rounded-full" />
                        <Skeleton className="h-6 w-56" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/30 rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between gap-6">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="space-y-1 text-right">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Skeleton className="h-px flex-1" />
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-px flex-1" />
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-52" />
                                <Skeleton className="h-3 w-36" />
                            </div>
                            <div className="space-y-1 text-right">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Skeleton className="h-px flex-1" />
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-px flex-1" />
                        </div>
                        <div className="flex items-center justify-between gap-6">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <div className="space-y-1 text-right">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <Skeleton className="h-1 flex-1" />
                            <Skeleton className="h-6 w-6" />
                            <Skeleton className="h-1 flex-1" />
                        </div>
                        <div className="flex items-center justify-between gap-6 bg-muted/40 rounded-md p-4">
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            <div className="space-y-1 text-right">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground bg-muted/20 rounded-md p-3">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-full" />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[260px]" />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[360px]" />
                </CardContent>
            </Card>

            <Card className="shadow-sm">
                <CardHeader>
                    <div className="flex flex-wrap gap-3">
                        <Skeleton className="h-9 w-28 rounded-md" />
                        <Skeleton className="h-9 w-28 rounded-md" />
                        <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        </div>
    );
};
