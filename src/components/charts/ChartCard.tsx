import { Link } from "@tanstack/react-router";
import { StoredChart } from "@/components/chartBuilder/chartsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Edit, Trash2, Star, Eye } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChartPreview } from "@/components/chartBuilder/components/chart-preview/ChartPreview";

interface ChartCardProps {
    chart: StoredChart;
    onDelete: (chartId: string) => void;
    onToggleFavorite: (chartId: string) => void;
}

export function ChartCard({ chart, onDelete, onToggleFavorite }: ChartCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardContent className="pt-4 px-4 pb-0">
                <Link to={`/charts/$chartId`} params={{ chartId: chart.id }} search={{ view: 'overview', chart: chart }}>
                    <ChartPreview chart={chart} />
                </Link>
            </CardContent>
            <CardFooter className="flex justify-between items-center mt-auto">
                <div className="flex gap-2 items-center">
                    <Link to={`/charts/$chartId`} params={{ chartId: chart.id }} search={{ view: 'config', chart: chart }}>
                        <Button variant="outline" size="sm" className="px-3">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </Link>

                    <Button variant="outline" size="sm" className="px-3" onClick={() => onToggleFavorite(chart.id)}>
                        <Star className="h-4 w-4" fill={chart.favorite ? 'gold' : 'none'} />
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" className="px-3">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Chart</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete "{chart.title || 'Untitled Chart'}"? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(chart.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                <Link to={`/charts/$chartId`} params={{ chartId: chart.id }} search={{ view: 'overview', chart: chart }}>
                    <Button variant="outline" size="default">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                    </Button>
                </Link>
            </CardFooter>
        </Card >
    );
} 