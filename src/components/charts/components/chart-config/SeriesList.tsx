import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useState } from "react";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { useChartStore } from "../../hooks/useChartStore";
import { useCopyPasteChart } from "../../hooks/useCopyPaste";
import { useHotkeys } from "react-hotkeys-hook";
import { SeriesListItem } from "../chart-view/SeriesListItem";
import { BarChart3 } from "lucide-react";

export function SeriesList() {
  const {
    chart,
    updateSeries,
    moveSeriesUp,
    moveSeriesDown,
    addSeries,
    goToSeriesConfig,
    setSeries,
    deleteSeries,
  } = useChartStore();
  const { duplicateSeries, copySeries } = useCopyPasteChart();

  const handleToggleSeriesEnabled = useCallback(
    async (seriesId: string, enabled: boolean) => {
      updateSeries(seriesId, (prevSeries) => ({ ...prevSeries, enabled }));
    },
    [updateSeries]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  useClipboard({
    onCopy: () => {
      if (selectedSeriesId) {
        copySeries(selectedSeriesId);
      }
    },
    onCut: () => {
      if (selectedSeriesId) {
        copySeries(selectedSeriesId);
        deleteSeries(selectedSeriesId);
      }
    },
  });

  useHotkeys("mod+d", (e) => {
    e.preventDefault();
    if (selectedSeriesId) {
      duplicateSeries(selectedSeriesId);
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = chart.series.findIndex((s) => s.id === active.id);
      const newIndex = chart.series.findIndex((s) => s.id === over.id);
      setSeries(arrayMove(chart.series, oldIndex, newIndex));
    }
  };

  const handleSelect = (seriesId: string) => {
    setSelectedSeriesId(seriesId);
  };
  const handleDeselect = (seriesId: string) => {
    setSelectedSeriesId((prev) => (prev === seriesId ? null : prev));
  };

  if (chart.series.length === 0) {
    return (
      <div className="text-center py-4">
        <BarChart3 className="h-10 w-10 mx-auto mb-3 text-muted-foreground/80" />
        <p className="text-sm text-muted-foreground mb-3">No data series yet.</p>
        <Button size="sm" onClick={addSeries}>
          Add Series
        </Button>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={chart.series.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {chart.series.map((series, index) => (
            <SeriesListItem
              key={series.id}
              series={series}
              isSelected={selectedSeriesId === series.id}
              onSelect={() => handleSelect(series.id)}
              onDeselect={() => handleDeselect(series.id)}
              chartColor={chart.config.color}
              onClick={() => goToSeriesConfig(series.id)}
              onToggle={(enabled) => handleToggleSeriesEnabled(series.id, enabled)}
              onMoveUp={() => moveSeriesUp(series.id)}
              onMoveDown={() => moveSeriesDown(series.id)}
              isMoveUpDisabled={index === 0}
              isMoveDownDisabled={index === chart.series.length - 1}
              onUpdate={(updates) => updateSeries(series.id, updates)}
              onDelete={() => deleteSeries(series.id)}
              onDuplicate={() => duplicateSeries(series.id)}
              onCopy={() => copySeries(series.id)}
              onConfig={() => goToSeriesConfig(series.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}