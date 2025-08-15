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
import { Analytics } from "@/lib/analytics";

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
  const seriesCount = Array.isArray(chart.series) ? chart.series.length : 0;
  const updatedRelative = formatDistanceToNow(new Date(chart.updatedAt), {
    addSuffix: true,
  });

  return (
    <Card className="group relative flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
      <ChartCardHeader
        title={title}
        seriesCount={seriesCount}
        updatedRelative={updatedRelative}
        categories={categories}
        chartCategories={chart.categories ?? []}
        onOpenCategory={onOpenCategory}
        onToggleFavorite={() => onToggleFavorite(chart.id)}
        isFavorite={!!chart.favorite}
        chart={chart}
      />
      <CardContent className="px-4 pb-3">
        {/* Main component in the chart card */}
        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
          className="block"
          onClick={() => Analytics.capture(Analytics.EVENTS.ChartOpened, { chart_id: chart.id, source: 'card_preview' })}
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
            onClick={() => Analytics.capture(Analytics.EVENTS.ChartViewChanged, { chart_id: chart.id, view: 'config', source: 'card_footer' })}
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
                    <Button variant="outline" size="sm" className="h-8 px-2" aria-label="Delete chart">
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
            <ChartCategoriesMenu
              categories={categories}
              chartCategoryIds={chart.categories ?? []}
              onToggle={(categoryId) => {
                Analytics.capture(Analytics.EVENTS.ChartCategoryToggled, { chart_id: chart.id, category_id: categoryId });
                onToggleCategory?.(chart.id, categoryId);
              }}
            />
          ) : null}
        </div>

        <Link
          to={`/charts/$chartId`}
          params={{ chartId: chart.id }}
          search={{ view: "overview", chart: chart }}
          onClick={() => Analytics.capture(Analytics.EVENTS.ChartOpened, { chart_id: chart.id, source: 'card_button' })}
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

// Sub-components to declutter card layout
type ChartCardHeaderProps = {
  title: string;
  seriesCount: number;
  updatedRelative: string;
  categories: readonly ChartCategory[];
  chartCategories: readonly string[];
  onOpenCategory?: (categoryId: string) => void;
  onToggleFavorite: () => void;
  isFavorite: boolean;
  chart: StoredChart;
};

function ChartCardHeader({ title, seriesCount, updatedRelative, categories, chartCategories, onOpenCategory, onToggleFavorite, isFavorite, chart }: ChartCardHeaderProps) {
  return (
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
              {chart.config?.chartType}
            </Badge>
            <span className="shrink-0">{seriesCount} series</span>
            <span className="text-muted-foreground shrink-0">• {updatedRelative}</span>
            {categories.length > 0 && chartCategories.length > 0 ? (
              <div className="basis-full flex flex-wrap items-center gap-1.5">
                {chartCategories.map((catId) => {
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
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                onClick={() => {
                  Analytics.capture(Analytics.EVENTS.ChartFavoritedToggled, { chart_id: chart.id, now_favorite: !isFavorite });
                  onToggleFavorite();
                }}
              >
                <Star className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFavorite ? "Unfavorite" : "Favorite"}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardHeader>
  );
}

type ChartCategoriesMenuProps = {
  categories: readonly ChartCategory[];
  chartCategoryIds: readonly string[];
  onToggle: (categoryId: string) => void;
};

function ChartCategoriesMenu({ categories, chartCategoryIds, onToggle }: ChartCategoriesMenuProps) {
  return (
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
          const checked = chartCategoryIds.includes(cat.id);
          return (
            <DropdownMenuCheckboxItem key={cat.id} checked={checked} onCheckedChange={() => onToggle(cat.id)}>
              {cat.name}
            </DropdownMenuCheckboxItem>
          );
        })}
        {categories.length === 0 ? <DropdownMenuItem disabled>No categories</DropdownMenuItem> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}