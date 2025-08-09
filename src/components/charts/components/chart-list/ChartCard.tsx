import { Link } from "@tanstack/react-router";
import { ChartCategory, StoredChart } from "@/components/charts/chartsStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Edit, Trash2, Star, Eye, Tag } from "lucide-react";
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
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ChartCardProps {
    chart: StoredChart;
    onDelete: (chartId: string) => void;
    onToggleFavorite: (chartId: string) => void;
    categories?: readonly ChartCategory[];
    onToggleCategory?: (chartId: string, categoryId: string) => void;
    onOpenCategory?: (categoryId: string) => void;
}

export function ChartCard({ chart, onDelete, onToggleFavorite, categories = [], onToggleCategory, onOpenCategory }: ChartCardProps) {
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
          <div className="min-w-0 flex-1">
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
            <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="shrink-0">
                {chartType}
              </Badge>
              <span className="shrink-0">{seriesCount} series</span>
              <span className="text-muted-foreground shrink-0">• {updatedRelative}</span>
              {categories.length > 0 && (chart.categories ?? []).length > 0 ? (
                <div className="basis-full flex flex-wrap items-center gap-1.5">
                  {(chart.categories ?? []).map((catId) => {
                    const cat = categories.find((c) => c.id === catId);
                    if (!cat) return null;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className="inline-flex items-center align-middle"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenCategory?.(cat.id);
                        }}
                        title={`Open ${cat.name}`}
                      >
                        <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                          #{cat.name}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              ) : null}
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
      <CardContent className="px-4 pb-3">
        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
          className="block"
        >
          <div className="rounded-lg border bg-muted/30 overflow-hidden aspect-[16/9]">
            <ChartPreview chart={chart} className="h-full" height={300} />
          </div>
        </Link>
      </CardContent>
      <CardFooter className="flex justify-between items-center mt-auto pt-0 pb-3 px-4">
        <div className="flex gap-1 items-center">
          <Link
            to={`/charts/$chartId`}
            params={{ chartId: chart.id }}
            search={{ view: "config", chart: chart }}
          >
            <Button variant="outline" size="sm" className="h-8 px-2">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>

          <AlertDialog>
            <TooltipProvider>
              <Tooltip>
                <AlertDialogTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button variant="destructive" size="sm" className="h-8 px-2" aria-label="Delete chart">
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
          {categories.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Tag className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Add to category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((cat) => {
                  const checked = (chart.categories ?? []).includes(cat.id);
                  return (
                    <DropdownMenuCheckboxItem
                      key={cat.id}
                      checked={checked}
                      onCheckedChange={() => onToggleCategory?.(chart.id, cat.id)}
                    >
                      {cat.name}
                    </DropdownMenuCheckboxItem>
                  );
                })}
                {categories.length === 0 ? (
                  <DropdownMenuItem disabled>No categories</DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>

        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
         >
           <Button variant="outline" size="default" className="h-8 px-3">
             <Eye className="h-4 w-4 mr-2" />
             View
           </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}