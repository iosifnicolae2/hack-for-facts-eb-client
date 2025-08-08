import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart3, Plus, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StoredChart, getChartsStore } from "@/components/charts/chartsStore";
import { ChartList } from "@/components/charts/components/chart-list/ChartList";

export const Route = createLazyFileRoute("/charts/")({
  component: ChartsListPage,
});

const chartsStore = getChartsStore();

type SortOption = "newest" | "oldest" | "a-z" | "z-a" | "favorites-first";

function ChartsListPage() {
  const [charts, setCharts] = useState<StoredChart[]>(
    chartsStore.loadSavedCharts({ filterDeleted: true, sort: true })
  );
  const [search, setSearch] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  const handleDeleteChart = useCallback(async (chartId: string) => {
    try {
      await chartsStore.deleteChart(chartId);
      setCharts((previousCharts) => previousCharts.filter((chart) => chart.id !== chartId));
      toast.success("Chart deleted");
    } catch (error) {
      console.error("Failed to delete chart:", error);
      toast.error("Failed to delete the chart. Please try again.");
    }
  }, []);

  const handleToggleFavorite = useCallback((chartId: string) => {
    chartsStore.toggleChartFavorite(chartId);
    setCharts((previousCharts) => {
      const chartBeforeToggle = previousCharts.find((c) => c.id === chartId);
      const updatedCharts = previousCharts.map((chart) =>
        chart.id === chartId ? { ...chart, favorite: !chart.favorite } : chart
      );
      toast.success(
        chartBeforeToggle?.favorite ? "Removed from Favorites" : "Added to Favorites"
      );
      return updatedCharts;
    });
  }, []);

  useEffect(() => {
    const reloadFromStorage = () => {
      setCharts(chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));
    };
    window.addEventListener("storage", reloadFromStorage);
    return () => window.removeEventListener("storage", reloadFromStorage);
  }, []);

  const totalCount = charts.length;
  const favoritesCount = useMemo(
    () => charts.filter((chart) => chart.favorite).length,
    [charts]
  );

  const filteredAllCharts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const byQuery = (c: StoredChart) =>
      query.length === 0 ||
      c.title.toLowerCase().includes(query) ||
      (c.description ?? "").toLowerCase().includes(query);

    const sorted = (input: readonly StoredChart[]): StoredChart[] => {
      const arr = [...input];
      switch (sortBy) {
        case "oldest":
          return arr.sort(
            (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)
          );
        case "a-z":
          return arr.sort((a, b) => a.title.localeCompare(b.title));
        case "z-a":
          return arr.sort((a, b) => b.title.localeCompare(a.title));
        case "favorites-first":
          return arr.sort((a, b) => Number(b.favorite) - Number(a.favorite));
        case "newest":
        default:
          return arr.sort(
            (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
          );
      }
    };

    return sorted(charts.filter(byQuery));
  }, [charts, search, sortBy]);

  const filteredFavoriteCharts = useMemo(
    () => filteredAllCharts.filter((c) => c.favorite),
    [filteredAllCharts]
  );

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
              <BarChart3 className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              Charts
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Build and manage custom visualizations of public spending data.
            </p>
            <div className="flex gap-2 pt-1">
              <Badge variant="secondary">{totalCount} total</Badge>
              {favoritesCount > 0 ? (
                <Badge variant="success">{favoritesCount} favorites</Badge>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/charts/new" replace={false}>
              <Button size="lg" className="text-base h-11 px-6">
                <Plus className="mr-2 h-5 w-5" />
                Create chart
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="relative w-full md:max-w-lg">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search charts…"
            className="pl-9"
            aria-label="Search charts"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="a-z">Title A–Z</SelectItem>
              <SelectItem value="z-a">Title Z–A</SelectItem>
              <SelectItem value="favorites-first">Favorites first</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No charts yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first chart to start visualizing public spending data.
          </p>
          <Link to="/charts/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first chart
            </Button>
          </Link>
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites" disabled={favoritesCount === 0}>
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {filteredAllCharts.length === 0 ? (
              <div className="text-center py-12">
                <h4 className="text-lg font-medium mb-1">No results</h4>
                <p className="text-muted-foreground">
                  Try a different search term or sorting.
                </p>
              </div>
            ) : (
              <ChartList
                charts={filteredAllCharts}
                onDelete={handleDeleteChart}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {filteredFavoriteCharts.length === 0 ? (
              <div className="text-center py-12">
                <h4 className="text-lg font-medium mb-1">No favorites yet</h4>
                <p className="text-muted-foreground">
                  Mark charts as favorites to quickly find them here.
                </p>
              </div>
            ) : (
              <ChartList
                charts={filteredFavoriteCharts}
                onDelete={handleDeleteChart}
                onToggleFavorite={handleToggleFavorite}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}