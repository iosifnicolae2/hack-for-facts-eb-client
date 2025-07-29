import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, Plus } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { ChartSection } from "@/components/charts/ChartSection";
import { toast } from "sonner";
import { StoredChart, getChartsStore } from "@/components/chartBuilder/chartsStore";

export const Route = createLazyFileRoute("/charts/")({
  component: ChartsListPage,
});

const chartsStore = getChartsStore();

function ChartsListPage() {
  const [charts, setCharts] = useState<StoredChart[]>(chartsStore.loadSavedCharts({ filterDeleted: true, sort: true }));

  const handleDeleteChart = async (chartId: string) => {
    try {
      await chartsStore.deleteChart(chartId);
      setCharts(prev => prev.filter(chart => chart.id !== chartId));
      toast.success("Chart Deleted");
    } catch (error) {
      console.error('Failed to delete chart:', error);
      toast.error("Failed to delete the chart. Please try again.");
    }
  };

  const handleToggleFavorite = (chartId: string) => {
    chartsStore.toggleChartFavorite(chartId);
    setCharts(prev => {
      const chart = prev.find(c => c.id === chartId);
      const newCharts = prev.map(chart => chart.id === chartId ? { ...chart, favorite: !chart.favorite } : chart);
      toast.success(chart?.favorite ? "Removed from Favorites" : "Added to Favorites");
      return newCharts;
    });
  };

  const favoriteCharts = useMemo(() => charts.filter(chart => chart.favorite), [charts]);

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
          <BarChart3 className="h-10 w-10 text-primary" />
          Charts
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create and manage powerful visualizations of public spending data with custom filters and multiple data series.
        </p>
      </div>

      {/* Main Action */}
      <div className="flex justify-center">
        <Link to="/charts/new" replace={false}>
          <Button size="lg" className="text-lg px-8 py-6 h-auto">
            <Plus className="mr-2 h-6 w-6" />
            Create New Chart
          </Button>
        </Link>
      </div>

      {/* Charts List */}
      <div className="space-y-4">
        {charts.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Charts Yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first chart to start visualizing public spending data.
            </p>
            <Link to="/charts/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Chart
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ChartSection title="Favorites" charts={favoriteCharts} onDelete={handleDeleteChart} onToggleFavorite={handleToggleFavorite} />
            {favoriteCharts.length > 0 && charts.length > 0 && <Separator className="mt-4" />}
            <ChartSection title="All Charts" charts={charts} onDelete={handleDeleteChart} onToggleFavorite={handleToggleFavorite} />
          </div>
        )}
      </div>
    </div>
  );
}