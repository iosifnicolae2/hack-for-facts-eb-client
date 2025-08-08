import { Link } from "@tanstack/react-router";
import { StoredChart } from "@/components/charts/chartsStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { ChartPreview } from "@/components/charts/components/chart-preview/ChartPreview";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";

interface ChartCardProps {
    chart: StoredChart;
    onDelete: (chartId: string) => void;
    onToggleFavorite: (chartId: string) => void;
}

export function ChartCard({ chart, onDelete, onToggleFavorite }: ChartCardProps) {
  const title = chart.title?.trim() || "Untitled chart";
  const chartType = chart.config?.chartType ?? "";
  const seriesCount = Array.isArray(chart.series) ? chart.series.length : 0;
  const updatedRelative = formatDistanceToNow(new Date(chart.updatedAt), {
    addSuffix: true,
  });

  return (
    <Card className="group relative flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base md:text-lg line-clamp-1">
              <Link
                to={`/charts/$chartId`}
                params={{ chartId: chart.id }}
                search={{ view: "overview", chart: chart }}
                className="hover:underline"
              >
                {title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {chartType}
              </Badge>
              <span className="truncate">{seriesCount} series</span>
              <span className="text-muted-foreground">• {updatedRelative}</span>
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label={chart.favorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => onToggleFavorite(chart.id)}
                >
                  <Star
                    className="h-4 w-4"
                    fill={chart.favorite ? "currentColor" : "none"}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {chart.favorite ? "Unfavorite" : "Favorite"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-0">
        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
          className="block"
        >
          <div className="rounded-lg border bg-muted/30 overflow-hidden aspect-[16/9]">
            <ChartPreview chart={chart} className="h-full" />
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto">
        <div className="flex gap-1.5 items-center">
          <Link
            to={`/charts/$chartId`}
            params={{ chartId: chart.id }}
            search={{ view: "config", chart: chart }}
          >
            <Button variant="outline" size="sm" className="px-2.5">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <AlertDialog>
            <TooltipProvider>
              <Tooltip>
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="px-2.5"
                      aria-label="Delete chart"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                </AlertDialogTrigger>
                <TooltipContent>Delete</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete chart</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{title}"? This action cannot be undone.
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

        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
        >
          <Button variant="outline" size="default">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}