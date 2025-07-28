import { Chart, SeriesConfiguration } from "@/schemas/charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
} from '@dnd-kit/sortable';
import { Plus } from "lucide-react";
import { SeriesListItem } from "./SeriesListItem";

interface SeriesListProps {
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
}

export function SeriesList({ chart, onAddSeries, onSeriesClick, onToggleSeries, onMoveSeriesUp, onMoveSeriesDown, updateSeries, setSeries, deleteSeries, onDuplicateSeries, onCopySeries }: SeriesListProps) {
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