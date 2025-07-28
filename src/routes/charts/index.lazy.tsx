import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { deleteChart, loadSavedCharts, StoredChart, toggleChartFavorite } from '@/lib/api/charts';
import { ChartPreview } from "@/components/chartBuilder/components/chart-preview/ChartPreview";
import { Separator } from "@/components/ui/separator";

export const Route = createLazyFileRoute("/charts/")({
  component: ChartsListPage,
});

function ChartsListPage() {
  const [charts, setCharts] = useState<StoredChart[]>(loadSavedCharts({ filterDeleted: true, validate: true }));

  const handleDeleteChart = async (chartId: string) => {
    try {
      await deleteChart(chartId);
      setCharts(prev => prev.filter(chart => chart.id !== chartId));
    } catch (error) {
      console.error('Failed to delete chart:', error);
    }
  };

  const handleToggleFavorite = (chartId: string) => {
    toggleChartFavorite(chartId);
    setCharts(prev => prev.map(chart => chart.id === chartId ? { ...chart, favorite: !chart.favorite } : chart));
  };


  const favoriteCharts = useMemo(() => charts.filter(chart => chart.favorite), [charts]);
  const nonFavoriteCharts = useMemo(() => charts.filter(chart => !chart.favorite), [charts]);


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
            {favoriteCharts.length > 0 && <ChartSection title="Favorites" charts={favoriteCharts} onDelete={handleDeleteChart} onFavorite={handleToggleFavorite} />}
            {favoriteCharts.length > 0 && nonFavoriteCharts.length > 0 && <Separator className="mt-4" />}
            {nonFavoriteCharts.length > 0 && <ChartSection title="" charts={nonFavoriteCharts} onDelete={handleDeleteChart} onFavorite={handleToggleFavorite} />}
          </div>
        )}
      </div>
    </div>
  );
}


function ChartSection({ title, charts, onDelete, onFavorite }: { title: string, charts: StoredChart[], onDelete: (chartId: string) => void, onFavorite: (chartId: string) => void }) {

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <div className="flex flex-wrap gap-4">
        {charts.map(chart => (
          <Card key={chart.id} className="hover:shadow-md transition-shadow w-full lg:w-[30%]">
            <CardContent className="pt-4 flex flex-col">
              <Link to={`/charts/$chartId`} search={{ view: "overview", chart: chart }} params={{ chartId: chart.id }}>
                <ChartPreview chart={chart} className="py-2" />
              </Link>
              <div className="flex flex-row justify-between items-center">
                <div className="flex gap-2 items-center">
                  <Link to={`/charts/$chartId`} search={{ view: "config", chart: chart }} params={{ chartId: chart.id }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-3"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button variant="outline" size="sm" className="px-3" onClick={() => onFavorite(chart.id)}>
                    <Star className="h-4 w-4" fill={chart.favorite ? 'gold' : 'none'} />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="px-3">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chart</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{chart.title || 'Untitled Chart'}"?
                          This action cannot be undone.
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

                <Link to={`/charts/$chartId`} search={{ view: "overview", chart: chart }} params={{ chartId: chart.id }}>
                  <Button
                    variant="outline"
                    size="default"
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

}