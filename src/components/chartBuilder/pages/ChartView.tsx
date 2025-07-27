import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, ArrowLeft, BarChart3, LineChart, Plus, ScatterChart, Settings, TrendingUp } from 'lucide-react';
import { AnalyticsInput, Chart, SeriesConfiguration, CopiedSeriesSchema } from '@/schemas/chartBuilder';
import { AnalyticsDataPoint, deleteChart, getChartAnalytics } from '@/lib/api/chartBuilder';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ChartRenderer } from '@/components/chartBuilder/chart-renderer/ChartRenderer';
import { ChartQuickConfig } from '@/components/chartBuilder/components/QuickChartConfig/ChartQuickConfig';
import { useChartBuilder } from "@/components/chartBuilder/hooks/useChartBuilder";
import { ChartFiltersOverview } from "@/components/chartBuilder/components/FitersOverview/ChartFiltersOverview";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors, DragEndEvent, KeyboardSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { SeriesItemMenu } from "../components/SeriesConfig/SeriesItemMenu";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/lib/hooks/useDebouncedCallback";
import { toast } from "sonner";

// Helper to get the correct icon for a chart type.
const getChartTypeIcon = (chartType: string, className: string = "h-4 w-4") => {
  const icons = {
    line: <LineChart className={className} />,
    bar: <BarChart3 className={className} />,
    area: <TrendingUp className={className} />,
    scatter: <ScatterChart className={className} />,
  };
  return icons[chartType as keyof typeof icons] || <BarChart3 className={className} />;
};


/**
 * Represents a single item in the data series list.
 */
const SeriesListItem = ({ series, index, onToggle, onClick, onMoveUp, onMoveDown, isMoveUpDisabled, isMoveDownDisabled, chartColor, onUpdate, onDelete, onDuplicate, onCopy }: {
  series: SeriesConfiguration;
  index: number;
  onToggle: (enabled: boolean) => void;
  onClick: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isMoveUpDisabled: boolean;
  isMoveDownDisabled: boolean;
  chartColor?: string;
  onUpdate: (updates: Partial<SeriesConfiguration>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: series.id });
  const [localColor, setLocalColor] = useState(series.config.color);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleColorChange = useDebouncedCallback((color: string) => {
    setLocalColor(color);
    onUpdate({ config: { ...series.config, color } });
  }, 500);

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="flex items-center justify-between p-2.5 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 text-sm flex-1 cursor-pointer min-w-0">
        <div {...listeners} className="cursor-grab">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="color"
            value={localColor}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-6 h-4 rounded-full cursor-pointer shadow-gray-600/50 shadow-sm"
            style={{ backgroundColor: series.config.color || chartColor, border: "none" }}
            aria-label="Color Picker"
          />
        </div>
        <div className="flex-1 min-w-0" onClick={onClick}>
          <p className="font-medium truncate" title={series.label}>{series.label}</p>
          <p className="text-xs text-muted-foreground">Series {index + 1}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2">
        <Switch
          checked={series.enabled}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Toggle series ${series.label}`}
        />
        <SeriesItemMenu
          series={series}
          isMoveUpDisabled={isMoveUpDisabled}
          isMoveDownDisabled={isMoveDownDisabled}
          onToggleEnabled={() => onToggle(!series.enabled)}
          onToggleDataLabels={() => onUpdate({ config: { ...series.config, showDataLabels: !series.config.showDataLabels } })}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onCopy={onCopy}
        />
      </div>
    </div>
  )
};

/**
 * Manages and displays the list of data series.
 */
const SeriesList = ({ chart, onAddSeries, onSeriesClick, onToggleSeries, onMoveSeriesUp, onMoveSeriesDown, updateSeries, setSeries, deleteSeries, onDuplicateSeries, onCopySeries }: {
  chart: Chart;
  onAddSeries: () => void;
  onSeriesClick: (seriesId: string) => void;
  onToggleSeries: (seriesId: string, enabled: boolean) => void;
  onMoveSeriesUp: (seriesId: string) => void;
  onMoveSeriesDown: (seriesId: string) => void;
  updateSeries: (seriesId: string, updates: Partial<SeriesConfiguration>) => void;
  setSeries: (series: SeriesConfiguration[]) => void;
  deleteSeries: (seriesId: string) => void;
  onDuplicateSeries: (seriesId: string) => void;
  onCopySeries: (seriesId: string) => void;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chart.series.findIndex((s) => s.id === active.id);
      const newIndex = chart.series.findIndex((s) => s.id === over.id);
      setSeries(arrayMove(chart.series, oldIndex, newIndex));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Series</span>
          <Button size="icon" onClick={onAddSeries} className="rounded-full w-7 h-7 cursor-pointer" aria-label="Add new series">
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>{chart.series.length} series configured</CardDescription>
      </CardHeader>
      <CardContent>
        {chart.series.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">No data series yet.</p>
            <Button size="sm" onClick={onAddSeries}>Add Series</Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={chart.series.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {chart.series.map((series, index) => (
                  <SeriesListItem
                    key={series.id}
                    series={series}
                    index={index}
                    chartColor={chart.config.color}
                    onClick={() => onSeriesClick(series.id)}
                    onToggle={(enabled) => onToggleSeries(series.id, enabled)}
                    onMoveUp={() => onMoveSeriesUp(series.id)}
                    onMoveDown={() => onMoveSeriesDown(series.id)}
                    isMoveUpDisabled={index === 0}
                    isMoveDownDisabled={index === chart.series.length - 1}
                    onUpdate={(updates) => updateSeries(series.id, updates)}
                    onDelete={() => deleteSeries(series.id)}
                    onDuplicate={() => onDuplicateSeries(series.id)}
                    onCopy={() => onCopySeries(series.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
};


/**
 * Renders the header section of the chart view.
 */
const ChartViewHeader = ({ chart, onConfigure }: { chart: Chart, onConfigure: () => void }) => {
  const chartTitle = chart.title || 'Untitled Chart';
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/charts">
            <ArrowLeft className="h-4 w-4" />
            Back to Charts
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
          <h1 className="text-3xl font-bold tracking-tight">{chartTitle}</h1>
          <Badge variant="outline" className="capitalize">{chart.config.chartType}</Badge>
        </div>
      </div>
      <Button className="gap-2" onClick={onConfigure}>
        <Settings className="h-4 w-4" />
        Configure
      </Button>
    </div>
  );
};

/**
 * Renders the main chart visualization area with loading, error, and empty states.
 */
const ChartDisplayArea = ({ chart, chartData, isLoading, error, onAddSeries }: {
  chart: Chart;
  chartData: AnalyticsDataPoint[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onAddSeries: () => void;
}) => {
  const renderContent = () => {
    if (chart.series.length === 0) {
      return (
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            {getChartTypeIcon(chart.config.chartType, "h-8 w-8 text-muted-foreground")}
          </div>
          <p className="font-medium text-lg">No Data Series</p>
          <p className="text-sm text-muted-foreground">Add a series to visualize your data.</p>
          <Button onClick={onAddSeries}>Add Data Series</Button>
        </div>
      );
    }
    if (isLoading) {
      return <LoadingSpinner text="Loading chart data..." />;
    }
    if (error) {
      return (
        <div className="text-center text-destructive space-y-2">
          <AlertCircle className="h-8 w-8 mx-auto" />
          <p className="font-medium">Error Loading Chart Data</p>
          <p className="text-sm">{error.message}</p>
        </div>
      );
    }
    if (!chartData || chartData.length === 0) {
      return (
        <div className="text-center text-muted-foreground space-y-2">
          <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            {getChartTypeIcon(chart.config.chartType, "h-8 w-8")}
          </div>
          <p className="font-medium">No Data Available</p>
          <p className="text-sm">Check your series filters and try again.</p>
        </div>
      );
    }
    return (
      <div className="w-full">
        <h2 className="text-center text-lg font-bold text-muted-foreground">{chart.title}</h2>
        <ChartRenderer chart={chart} data={chartData} />
        {chart.description && (
          <p className="px-4 text-center text-sm text-muted-foreground">{chart.description}</p>
        )}
      </div>
    );
  };

  return (
    <Card className="flex flex-col w-full h-full" id="chart-display-area">
      <CardContent className="p-4 flex-grow min-h-[500px] flex items-center justify-center bg-muted/20">
        {renderContent()}
      </CardContent>
      <p className="flex items-center justify-between text-sm text-muted-foreground bg-muted/20 w-full p-4">
        <a href={window.location.href} target="_blank">
          <span className="font-bold">Transparenta.eu</span>
        </a>
        <a href="https://mfinante.gov.ro/transparenta-bugetara" target="_blank">
          Sursă date: <span className="font-bold">Ministerul Finanțelor</span>
        </a>
      </p>
    </Card>
  );
};


export function ChartView() {
  const navigate = useNavigate();
  const { chart, updateChart, updateSeries, moveSeriesUp, moveSeriesDown, addSeries, goToConfig, goToSeriesConfig, setSeries, deleteSeries } = useChartBuilder();

  const handleToggleSeriesEnabled = useCallback(async (seriesId: string, enabled: boolean) => {
    // FIX: Using `updateSeries` is more specific and better for state management encapsulation.
    updateSeries(seriesId, { enabled });
  }, [updateSeries]);

  const handleUpdateChart = useCallback(async (updates: Partial<Chart>) => {
    updateChart(updates);
  }, [updateChart]);

  const handleDeleteChart = useCallback(async () => {
    await deleteChart(chart.id);
    navigate({ to: "/charts" });
  }, [chart.id, navigate]);

  const handleDuplicateSeries = useCallback((seriesId: string) => {
    const seriesToDuplicate = chart.series.find(s => s.id === seriesId);
    if (!seriesToDuplicate) return;

    const duplicatedSeries = {
      ...seriesToDuplicate,
      id: crypto.randomUUID(),
      label: `${seriesToDuplicate.label} (copy)`,
    };

    const seriesIndex = chart.series.findIndex(s => s.id === seriesId);
    const newSeries = [...chart.series];
    newSeries.splice(seriesIndex + 1, 0, duplicatedSeries);
    setSeries(newSeries);
  }, [chart.series, setSeries]);

  const handleCopySeries = useCallback(async (seriesId: string) => {
    const seriesToCopy = chart.series.find(s => s.id === seriesId);
    if (!seriesToCopy) return;

    const newSeries = {
      ...seriesToCopy,
      id: crypto.randomUUID(),
    };

    const clipboardData = {
      type: 'chart-series-copy',
      payload: [newSeries],
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(clipboardData));
      toast.success("Series Copied", {
        description: "The series has been copied to the clipboard.",
      });
    } catch {
      toast.error("Copy Failed", {
        description: "Could not copy the series to the clipboard.",
      });
    }
  }, [chart.series]);

  useEffect(() => {
    const handlePaste = async () => {
      const text = await navigator.clipboard.readText();
      if (!text) return;

      try {
        const parsed = JSON.parse(text);
        const validated = CopiedSeriesSchema.safeParse(parsed);

        if (validated.success) {
          const newSeriesData: SeriesConfiguration[] = validated.data.payload.map(s => ({
            ...s,
            id: crypto.randomUUID(),
          }));

          setSeries([...chart.series, ...newSeriesData]);

          toast.success("Series Pasted", {
            description: "The copied series has been added to the chart.",
          });
        }
      } catch {
        // Ignore paste events that are not valid JSON or do not match our schema
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [chart.series, setSeries]);


  const analyticsInputs: AnalyticsInput[] = chart.series
    .filter(series => series.enabled)
    .map(series => ({ seriesId: series.id, filter: series.filter }));

  const { data: chartData, isLoading: isLoadingData, error: dataError } = useQuery({
    queryKey: ['chartData', analyticsInputs],
    queryFn: () => getChartAnalytics(analyticsInputs),
    enabled: !!chart && analyticsInputs.length > 0,
  });


  if (!chart) {
    return <LoadingSpinner text="Loading chart configuration..." />;
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 space-y-6">
      <ChartViewHeader chart={chart} onConfigure={goToConfig} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex flex-col flex-grow space-y-6">
          <div>
            <ChartDisplayArea
              chart={chart}
              chartData={chartData}
              isLoading={isLoadingData}
              error={dataError}
              onAddSeries={addSeries}
            />
          </div>
          <ChartFiltersOverview chart={chart} onFilterClick={goToSeriesConfig} />
        </div>

        <div className="lg:w-96 flex-shrink-0 space-y-6">
          <ChartQuickConfig
            chart={chart}
            onUpdateChart={handleUpdateChart}
            onDeleteChart={handleDeleteChart}
            onOpenConfigPanel={goToConfig}
          />
          <SeriesList
            chart={chart}
            onAddSeries={addSeries}
            onSeriesClick={goToSeriesConfig}
            onToggleSeries={handleToggleSeriesEnabled}
            onMoveSeriesUp={moveSeriesUp}
            onMoveSeriesDown={moveSeriesDown}
            updateSeries={updateSeries}
            setSeries={setSeries}
            deleteSeries={deleteSeries}
            onDuplicateSeries={handleDuplicateSeries}
            onCopySeries={handleCopySeries}
          />
        </div>
      </div>
    </div>
  );
}