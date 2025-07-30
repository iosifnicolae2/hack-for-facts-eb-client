import { createLazyFileRoute } from "@tanstack/react-router";
import { ChartConfigView } from "@/components/charts/components/views/ChartConfigView";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ChartView } from "@/components/charts/components/views/ChartView";
import { SeriesConfigView } from "@/components/charts/components/views/SeriesConfigView";
import { useChartStore } from "@/components/charts/hooks/useChartStore";
import { useCallback } from "react";

export const Route = createLazyFileRoute("/charts/$chartId/")({
  component: ChartDetailPage,
});

function ChartDetailPage() {
  const { view, goToOverview, } = useChartStore();

  const handleCloseDialog = useCallback((open: boolean) => {
    if (!open) {
      goToOverview()
    }
  }, [goToOverview]);

  return (
    <>
      {view === "overview" && <ChartView />}
      <Dialog open={view === "config" || view === "series-config"} onOpenChange={handleCloseDialog}>
        <DialogTitle className="sr-only">Configure Chart</DialogTitle>
        <DialogContent hideCloseButton className="max-w-4xl h-full overflow-y-auto">
          <DialogDescription className="sr-only">Configure Chart</DialogDescription>
          {view === "config" && <ChartConfigView />}
          {view === "series-config" && <SeriesConfigView />}
        </DialogContent>
      </Dialog>
    </>
  );
}
