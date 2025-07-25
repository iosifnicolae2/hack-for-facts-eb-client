import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, TrendingUp, LineChart, ScatterChart, Edit, Trash2, Eye } from 'lucide-react';
import { Chart } from '@/schemas/chartBuilder';
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
import { deleteChart, loadSavedCharts } from '@/lib/api/chartBuilder';

export const Route = createLazyFileRoute("/charts/")({
  component: ChartsListPage,
});

function ChartsListPage() {
  const [charts, setCharts] = useState<Chart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCharts();
  }, []);

  const loadCharts = async () => {
    try {
      setIsLoading(true);
      const savedCharts = await loadSavedCharts();
      setCharts(savedCharts);
    } catch (error) {
      console.error('Failed to load charts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      await deleteChart(chartId);
      setCharts(prev => prev.filter(chart => chart.id !== chartId));
    } catch (error) {
      console.error('Failed to delete chart:', error);
    }
  };

  const handleViewChart = (chartId: string) => {
    navigate({ to: `/charts/${chartId}` });
  };

  const handleConfigureChart = (chartId: string) => {
    navigate({ to: `/charts/${chartId}/config` });
  };

  const getChartTypeIcon = (chartType: string) => {
    switch (chartType) {
      case 'line': return <LineChart className="h-4 w-4" />;
      case 'bar': return <BarChart3 className="h-4 w-4" />;
      case 'area': return <TrendingUp className="h-4 w-4" />;
      case 'scatter': return <ScatterChart className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
        <Link to="/charts/new">
          <Button size="lg" className="text-lg px-8 py-6 h-auto">
            <Plus className="mr-2 h-6 w-6" />
            Create New Chart
          </Button>
        </Link>
      </div>

      {/* Chart Types Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/charts/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <LineChart className="h-12 w-12 mx-auto text-blue-500 mb-2" />
              <CardTitle className="text-lg">Line Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Perfect for showing trends over time, like budget evolution or spending patterns.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/charts/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <BarChart3 className="h-12 w-12 mx-auto text-green-500 mb-2" />
              <CardTitle className="text-lg">Bar Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Great for comparing values across different entities, categories, or time periods.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/charts/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <TrendingUp className="h-12 w-12 mx-auto text-orange-500 mb-2" />
              <CardTitle className="text-lg">Area Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Ideal for visualizing cumulative values and showing part-to-whole relationships.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link to="/charts/new">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="text-center pb-3">
              <ScatterChart className="h-12 w-12 mx-auto text-purple-500 mb-2" />
              <CardTitle className="text-lg">Multi-Series</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Combine multiple data series with different chart types and filters.
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Charts List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Your Charts</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : charts.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charts.map(chart => (
              <Card key={chart.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getChartTypeIcon(chart.config.chartType)}
                      <CardTitle className="text-lg line-clamp-1">
                        {chart.title || 'Untitled Chart'}
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {chart.config.chartType}
                    </Badge>
                  </div>
                  {chart.description && (
                    <CardDescription className="line-clamp-2">
                      {chart.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Series: {chart.series.length}</span>
                        <span>Updated: {formatDate(chart.updatedAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleViewChart(chart.id)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigureChart(chart.id)}
                        className="px-3"
                      >
                        <Edit className="h-4 w-4" />
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
                              onClick={() => handleDeleteChart(chart.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 